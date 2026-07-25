/**
 * app.js
 * Bootstrap: load state, pick the first screen, render it into #app.
 * Routing is a tiny state machine — window.App.go(target) clears and re-renders.
 */

(function() {
  const appContainer = document.getElementById("app");

  const routes = {
    "egg-create": () => window.App.screens.renderEggCreate(appContainer),
    "placeholder-world": () => window.App.screens.renderPlaceholder(appContainer)
  };

  function go(target) {
    const handler = routes[target];
    if (!handler) {
      console.warn("[app] unknown route:", target);
      return;
    }
    appContainer.innerHTML = "";
    handler();
  }

  window.App = window.App || {};
  window.App.go = go;

  document.addEventListener("DOMContentLoaded", () => {
    window.App.state.load();
    if (window.App.speech) window.App.speech.detectCapabilities();

    const s = window.App.state.data;
    const hasEgg = s.egg && s.egg.name && s.egg.name.length > 0;
    if (hasEgg) {
      go("placeholder-world");
    } else {
      go("egg-create");
    }
  });
})();
