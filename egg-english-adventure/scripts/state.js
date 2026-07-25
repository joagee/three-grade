/**
 * state.js
 * App state + localStorage persistence layer.
 * All modules share this via the global `window.App.state` namespace.
 * Use state.load() / state.save() for full persistence.
 * Use state.update(fn) for safe atomic updates.
 */

const STORAGE_KEY = "egg-english-adventure-state-v1";

const defaultState = {
  version: 1,
  egg: {
    name: "",
    color: "yellow",
    expression: "happy",
    accessories: []
  },
  progress: {
    currentUnit: 1,
    currentDay: 1,
    completedDays: {}
  },
  collection: {
    accessories: []
  },
  dailyReport: [],
  ttsReady: false,
  speechRecognitionReady: false
};

const state = {
  data: null,
  listeners: [],

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this.data = JSON.parse(raw);
      } else {
        this.data = JSON.parse(JSON.stringify(defaultState));
        this.save();
      }
      return this.data;
    } catch (err) {
      console.warn("[state] load failed, using defaults:", err);
      this.data = JSON.parse(JSON.stringify(defaultState));
      return this.data;
    }
  },

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      this.listeners.forEach(fn => fn(this.data));
    } catch (err) {
      console.error("[state] save failed:", err);
    }
  },

  update(fn) {
    fn(this.data);
    this.save();
  },

  reset() {
    this.data = JSON.parse(JSON.stringify(defaultState));
    this.save();
  },

  onChange(fn) {
    this.listeners.push(fn);
  },

  // ===== Progress (Task 2/5) =====

  /**
   * Mark a day-level as completed with stars (1-3).
   * Idempotent. Updates completedDays keyed by levelId.
   */
  completeDay(levelId, stars, attemptedWords) {
    this.update(s => {
      const prev = s.progress.completedDays[levelId] || { stars: 0, attempts: [] };
      s.progress.completedDays[levelId] = {
        stars: Math.max(prev.stars, stars),
        attempts: Array.from(new Set([...(prev.attempts || []), ...(attemptedWords || [])]))
      };
    });
  },

  getDayProgress(levelId) {
    return this.data.progress.completedDays[levelId] || null;
  },

  isDayComplete(levelId) {
    return !!this.data.progress.completedDays[levelId];
  },

  getCurrentLevelId() {
    const u = this.data.progress.currentUnit;
    const d = this.data.progress.currentDay;
    return `u${u}d${d}`;
  },

  advanceDay() {
    this.update(s => {
      const data = window.App.data;
      const unit = data.getUnit(s.progress.currentUnit);
      if (!unit) return;
      if (s.progress.currentDay < unit.levels.length) {
        s.progress.currentDay += 1;
      } else {
        const nextUnit = data.getUnit(s.progress.currentUnit + 1);
        if (nextUnit) {
          s.progress.currentUnit += 1;
          s.progress.currentDay = 1;
        }
      }
    });
  },

  // ===== Collection (Task 8 prep) =====

  /**
   * Unlock accessory by id. Idempotent.
   * Returns true if newly unlocked, false if already had.
   */
  unlockAccessory(accessoryId) {
    let newly = false;
    this.update(s => {
      if (!s.collection.accessories.includes(accessoryId)) {
        s.collection.accessories.push(accessoryId);
        newly = true;
        if (s.egg.accessories.indexOf(accessoryId) === -1 && s.egg.accessories.length === 0) {
          s.egg.accessories.push(accessoryId);
        }
      }
    });
    return newly;
  },

  equipAccessory(accessoryId) {
    this.update(s => {
      if (s.collection.accessories.includes(accessoryId)) {
        const idx = s.egg.accessories.indexOf(accessoryId);
        if (idx === -1) s.egg.accessories.push(accessoryId);
      }
    });
  },

  getCollection() {
    return this.data.collection.accessories.slice();
  },

  // ===== Daily report (Task 10 prep) =====

  appendDailyReport(entry) {
    const today = new Date().toISOString().slice(0, 10);
    this.update(s => {
      let report = s.dailyReport.find(r => r.date === today);
      if (!report) {
        report = { date: today, levels: [], newAccessories: [], stars: 0, attempts: [] };
        s.dailyReport.push(report);
      }
      report.levels.push(entry.levelId);
      report.stars += entry.stars || 0;
      if (entry.newAccessory) report.newAccessories.push(entry.newAccessory);
      report.attempts = Array.from(new Set([...report.attempts, ...(entry.attempts || [])]));
    });
  },

  getTodayReport() {
    const today = new Date().toISOString().slice(0, 10);
    return this.data.dailyReport.find(r => r.date === today) || null;
  },

  getAllReports() {
    return this.data.dailyReport.slice().reverse();
  }
};

window.App = window.App || {};
window.App.state = state;
