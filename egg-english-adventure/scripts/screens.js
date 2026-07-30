/**
 * screens.js
 * Screen renderers. Each screen is a render function: renderX(container).
 * app.js clears the #app container then calls one of these.
 * For Task 1 only renderEggCreate is implemented; later screens added incrementally.
 */

(function() {
  const COLORS = [
    { id: "yellow", label: "黄" },
    { id: "pink",   label: "粉" },
    { id: "blue",   label: "蓝" },
    { id: "green",  label: "绿" },
    { id: "purple", label: "紫" }
  ];

  const EXPRESSIONS = [
    { id: "happy",     label: "开心" },
    { id: "cool",      label: "酷" },
    { id: "surprised", label: "惊讶" }
  ];

  function renderEggCreate(container) {
    const draft = {
      color: "yellow",
      expression: "happy",
      name: ""
    };

    container.innerHTML = "";

    const screen = document.createElement("div");
    screen.className = "screen";

    const title = document.createElement("h1");
    title.className = "screen-title";
    title.textContent = "领养你的蛋仔";

    const subtitle = document.createElement("p");
    subtitle.className = "screen-subtitle";
    subtitle.textContent = "选一只属于你的小伙伴，一起冒险学英语";

    const stage = document.createElement("div");
    stage.className = "egg-stage";
    const eggHolder = document.createElement("div");
    stage.appendChild(eggHolder);

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.className = "egg-name-input";
    nameInput.placeholder = "给蛋仔起个名字";
    nameInput.maxLength = 20;
    nameInput.setAttribute("aria-label", "蛋仔名字");

    const colorLabel = document.createElement("div");
    colorLabel.className = "picker-label";
    colorLabel.textContent = "选颜色";

    const colorRow = document.createElement("div");
    colorRow.className = "picker-row";
    COLORS.forEach(c => {
      const sw = document.createElement("button");
      sw.className = "color-swatch" + (c.id === draft.color ? " selected" : "");
      sw.dataset.color = c.id;
      sw.setAttribute("aria-label", c.label);
      sw.addEventListener("click", () => {
        draft.color = c.id;
        eggHolder.querySelectorAll(".color-swatch").forEach(s =>
          s.classList.toggle("selected", s.dataset.color === c.id));
        rerender();
      });
      colorRow.appendChild(sw);
    });

    const expLabel = document.createElement("div");
    expLabel.className = "picker-label";
    expLabel.textContent = "选表情";

    const expRow = document.createElement("div");
    expRow.className = "picker-row";
    EXPRESSIONS.forEach(e => {
      const sw = document.createElement("button");
      sw.className = "exp-swatch" + (e.id === draft.expression ? " selected" : "");
      sw.dataset.exp = e.id;
      sw.textContent = e.label;
      sw.addEventListener("click", () => {
        draft.expression = e.id;
        expRow.querySelectorAll(".exp-swatch").forEach(s =>
          s.classList.toggle("selected", s.dataset.exp === e.id));
        rerender();
      });
      expRow.appendChild(sw);
    });

    const confirmBtn = document.createElement("button");
    confirmBtn.className = "btn-primary btn-large";
    confirmBtn.textContent = "出发冒险！";
    confirmBtn.disabled = true;
    confirmBtn.addEventListener("click", () => {
      if (!draft.name.trim()) return;
      window.App.state.update(s => {
        s.egg.name = draft.name.trim();
        s.egg.color = draft.color;
        s.egg.expression = draft.expression;
      });
      window.App.go("world-map");
    });

    nameInput.addEventListener("input", () => {
      draft.name = nameInput.value;
      confirmBtn.disabled = !draft.name.trim();
    });

    screen.append(title, subtitle, stage, nameInput, colorLabel, colorRow, expLabel, expRow, confirmBtn);
    container.appendChild(screen);

    function rerender() {
      window.App.egg.render(eggHolder, {
        color: draft.color,
        expression: draft.expression,
        size: "lg"
      });
    }
    rerender();
  }

  function renderPlaceholder(container) {
    container.innerHTML = "";
    const screen = document.createElement("div");
    screen.className = "screen";

    const stage = document.createElement("div");
    stage.className = "egg-stage";
    const eggHolder = document.createElement("div");
    stage.appendChild(eggHolder);

    const title = document.createElement("h1");
    title.className = "screen-title";
    const s = window.App.state.data;
    title.textContent = s.egg.name ? `${s.egg.name} 报到！` : "你的蛋仔报到！";

    const subtitle = document.createElement("p");
    subtitle.className = "scan-subtitle";
    subtitle.textContent = "Task 1 完成预览。世界地图将在后续 Task 5 实现。";

    window.App.egg.render(eggHolder, {
      color: s.egg.color,
      expression: s.egg.expression,
      size: "lg"
    });

    screen.append(stage, title, subtitle);
    container.appendChild(screen);
  }

  function renderWorldMap(container) {
    const st = window.App.state.data;
    const data = window.App.data;
    const unit = data.getUnit(st.progress.currentUnit);
    if (!unit) {
      container.innerHTML = '<div class="screen"><p class="screen-subtitle">未找到 Unit 数据</p></div>';
      return;
    }

    container.innerHTML = "";

    const screen = document.createElement("div");
    screen.className = "screen world-map";
    screen.style.setProperty("--unit-color", unit.color);

    const header = document.createElement("div");
    header.className = "map-header";
    const unitTitle = document.createElement("h1");
    unitTitle.className = "screen-title";
    unitTitle.textContent = `${unit.emoji} ${unit.titleCn}`;
    const unitSub = document.createElement("p");
    unitSub.className = "screen-subtitle";
    unitSub.textContent = `${unit.title} · 第 ${st.progress.currentDay} 天`;
    header.append(unitTitle, unitSub);

    const eggCorner = document.createElement("div");
    eggCorner.className = "map-egg-corner";
    const eggHolder = document.createElement("div");
    eggCorner.appendChild(eggHolder);
    window.App.egg.render(eggHolder, {
      color: st.egg.color,
      expression: st.egg.expression,
      size: "sm"
    });

    const doors = document.createElement("div");
    doors.className = "map-doors";

    const currentLevelId = window.App.state.getCurrentLevelId();
    const session = window.App.state.loadLevelSession();

    unit.levels.forEach((lv, idx) => {
      const door = document.createElement("button");
      door.className = "level-door";
      door.dataset.levelId = lv.id;

      const isComplete = window.App.state.isDayComplete(lv.id);
      const isCurrent = lv.id === currentLevelId;
      const isLocked = !isComplete && !isCurrent && (lv.day > st.progress.currentDay);
      const canResume = session && session.levelId === lv.id && !isComplete;

      if (isComplete) door.classList.add("level-door--done");
      if (isCurrent && !isComplete && !canResume) door.classList.add("level-door--current");
      if (canResume) door.classList.add("level-door--resume");
      if (isLocked && !canResume) door.classList.add("level-door--locked");

      door.innerHTML = `
        <div class="level-door-day">第 ${lv.day} 关</div>
        <div class="level-door-title">${lv.title}</div>
        <div class="level-door-stars" aria-hidden="true"></div>
      `;

      const starsEl = door.querySelector(".level-door-stars");
      if (isComplete) {
        const prog = window.App.state.getDayProgress(lv.id);
        const stars = prog && prog.stars ? Math.min(3, prog.stars) : 3;
        for (let i = 0; i < 3; i++) {
          const s = document.createElement("span");
          s.className = "star" + (i < stars ? " star--on" : " star--off");
          s.textContent = i < stars ? "★" : "☆";
          if (i < stars) s.classList.add("star-flyin");
          starsEl.appendChild(s);
        }
      }

      if (isLocked && !canResume) {
        door.disabled = true;
        door.setAttribute("aria-label", `第 ${lv.day} 关 未解锁`);
      } else {
        door.addEventListener("click", () => {
          if (lv.id === currentLevelId || canResume) {
            console.log("[map] enter today:", lv.id);
            window.App.go("level", { levelId: lv.id });
          } else {
            console.log("[map] review past day:", lv.id);
            window.App.go("level", { levelId: lv.id });
          }
        });
      }

      doors.appendChild(door);
    });

    screen.append(header, eggCorner, doors);
    container.appendChild(screen);
  }

  function renderLevel(container, params) {
    const levelId = params && params.levelId;
    if (!levelId) {
      console.warn("[screens] renderLevel: missing levelId");
      window.App.go("world-map");
      return;
    }
    window.App.game.startLevel(levelId, container, (summary) => {
      console.log("[screens] level end:", summary);
    });
  }

  const screens = {
    renderEggCreate,
    renderPlaceholder,
    renderWorldMap,
    renderLevel
  };

  window.App = window.App || {};
  window.App.screens = screens;
})();
