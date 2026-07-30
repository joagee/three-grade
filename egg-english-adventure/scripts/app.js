/**
 * app.js
 * Bootstrap: load state, pick the first screen, render it into #app.
 * Routing is a tiny state machine — window.App.go(target) clears and re-renders.
 */

(function() {
  const appContainer = document.getElementById("app");

  const routes = {
    "egg-create": () => window.App.screens.renderEggCreate(appContainer),
    "world-map": () => window.App.screens.renderWorldMap(appContainer),
    "level": (params) => window.App.screens.renderLevel(appContainer, params),
    "placeholder-world": () => window.App.screens.renderPlaceholder(appContainer)
  };

  function go(target, params) {
    if (!routes[target]) {
      console.warn("[app] unknown route:", target);
      return;
    }
    appContainer.innerHTML = "";
    appContainer.dataset.route = target;
    if (params) appContainer.dataset.params = JSON.stringify(params);
    routes[target](params);
  }

  window.App = window.App || {};
  window.App.go = go;

  document.addEventListener("DOMContentLoaded", () => {
    window.App.state.load();
    if (window.App.speech) window.App.speech.detectCapabilities();

    const s = window.App.state.data;
    const hasEgg = s.egg && s.egg.name && s.egg.name.length > 0;
    if (hasEgg) {
      go("world-map");
    } else {
      go("egg-create");
    }
  });

  // 按钮点击反馈：呼吸动效（只作用于被点击的按钮）
  appContainer.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (btn && !btn.disabled) {
      btn.classList.add("btn-breathe");
      btn.addEventListener("animationend", () => {
        btn.classList.remove("btn-breathe");
      }, { once: true });
    }
  });
})();
