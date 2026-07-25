/**
 * speech.js
 * Web Speech API wrapper:
 *   - speak(text, opts)        — TTS playback queue
 *   - recognizeWord(target, opts) — Returns Promise<{score, transcript, ok}>
 *   - detectCapabilities()     — Capability probe (writes state.ttsReady / speechRecognitionReady)
 *
 * Voice selection:
 *   Prefer en-US voices; if absent fall back to any English voice; finally default voice.
 *
 * Score algorithm:
 *   Levenshtein ratio on lowercased transcripts. Returns 0-100.
 *   Multi-word targets (e.g. "Nice to meet you") use the full phrase comparison,
 *   with a bonus for matching each token (handled via tokenRatio).
 *
 * Browser support:
 *   - SpeechSynthesis: Chrome, Edge, Safari, Firefox. Widely supported.
 *   - SpeechRecognition: Chrome/Edge only (webkitSpeechRecognition).
 *     Safari has SpeechRecognition but with stability issues; treat as unsupported for MVP.
 *
 * If speechRecognition is unavailable, game.js MUST skip 'read-after' challenges.
 * state.data.speechRecognitionReady reflects this on detect.
 */

(function() {
  const synth = window.speechSynthesis;
  const hasSynth = !!synth;
  const SpeechRecognitionCtor =
    window.SpeechRecognition || window.webkitSpeechRecognition || null;
  const hasRecognition = !!SpeechRecognitionCtor;

  let preferredVoice = null;

  function pickVoice() {
    if (!hasSynth) return null;
    const voices = synth.getVoices();
    if (!voices.length) return null;
    preferredVoice =
      voices.find(v => v.lang === "en-US" && /female|Google/i.test(v.name)) ||
      voices.find(v => v.lang === "en-US") ||
      voices.find(v => v.lang.indexOf("en") === 0) ||
      voices[0];
    return preferredVoice;
  }

  if (hasSynth) {
    pickVoice();
    synth.onvoiceschanged = pickVoice;
  }

  function speak(text, opts = {}) {
    if (!hasSynth) return Promise.resolve(false);
    return new Promise(resolve => {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = opts.rate || 0.9;
      u.pitch = opts.pitch || 1;
      if (preferredVoice) u.voice = preferredVoice;
      u.onend = () => resolve(true);
      u.onerror = () => resolve(false);
      synth.speak(u);
    });
  }

  /**
   * Recognize a single target word/phrase. Returns score 0-100.
   * opts:
   *   timeout = 6000 max seconds-to-stop
   */
  function recognizeWord(target, opts = {}) {
    if (!hasRecognition) {
      return Promise.resolve({ score: 0, transcript: "", ok: false, unsupported: true });
    }
    return new Promise(resolve => {
      const rec = new SpeechRecognitionCtor();
      rec.lang = "en-US";
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      rec.continuous = false;

      let settled = false;
      const settle = (result) => {
        if (settled) return;
        settled = true;
        try { rec.stop(); } catch (e) {}
        resolve(result);
      };

      rec.onresult = (ev) => {
        const alts = [];
        for (let i = 0; i < ev.results[0].length; i++) {
          alts.push(ev.results[0][i].transcript.trim());
        }
        const best = scoreTargetAgainst(target, alts);
        settle({ score: best.score, transcript: best.transcript, ok: best.score >= 60 });
      };
      rec.onerror = () => settle({ score: 0, transcript: "", ok: false, error: true });
      rec.onend = () => settle({ score: 0, transcript: "", ok: false, timeout: true });
      setTimeout(() => settle({ score: 0, transcript: "", ok: false, timeout: true }),
                 opts.timeout || 6000);

      try { rec.start(); }
      catch (e) { settle({ score: 0, transcript: "", ok: false, error: true }); }
    });
  }

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = new Array(n + 1);
    let curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      for (let j = 1; j <= n; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
      }
      [prev, curr] = [curr, prev];
    }
    return prev[n];
  }

  function similarity(a, b) {
    a = (a || "").toLowerCase().trim();
    b = (b || "").toLowerCase().trim();
    if (!a && !b) return 100;
    if (!a || !b) return 0;
    if (a === b) return 100;
    const d = levenshtein(a, b);
    return Math.round(100 * (1 - d / Math.max(a.length, b.length)));
  }

  function scoreTargetAgainst(target, alternatives) {
    let bestScore = 0, bestTranscript = "";
    for (const alt of alternatives) {
      const directSim = similarity(target, alt);
      let tokenSim = 0;
      const tTokens = target.toLowerCase().split(/\s+/).filter(Boolean);
      const aTokens = alt.toLowerCase().split(/\s+/).filter(Boolean);
      if (tTokens.length > 1 && aTokens.length > 0) {
        const matched = tTokens.filter(t => aTokens.some(a => a.includes(t) || similarity(t, a) >= 70));
        tokenSim = Math.round(100 * matched.length / tTokens.length);
      } else if (tTokens.length === 1 && aTokens.length > 0) {
        tokenSim = aTokens.includes(tTokens[0]) ? 100
                 : similarity(tTokens[0], aTokens[0]);
      }
      const finalScore = Math.max(directSim, tokenSim);
      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestTranscript = alt;
      }
    }
    return { score: bestScore, transcript: bestTranscript };
  }

  function detectCapabilities() {
    const st = window.App && window.App.state;
    if (st) {
      st.update(s => {
        s.ttsReady = hasSynth;
        s.speechRecognitionReady = hasRecognition;
      });
    }
    return { ttsReady: hasSynth, speechRecognitionReady: hasRecognition };
  }

  const speech = {
    speak,
    recognizeWord,
    detectCapabilities,
    hasSynth,
    hasRecognition,
    similarity,
    scoreTargetAgainst,
    pickVoice
  };

  window.App = window.App || {};
  window.App.speech = speech;
})();
