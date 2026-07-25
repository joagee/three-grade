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
      window.App.go("placeholder-world");
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

  const screens = {
    renderEggCreate,
    renderPlaceholder
  };

  window.App = window.App || {};
  window.App.screens = screens;
})();
