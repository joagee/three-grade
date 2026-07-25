/**
 * pwa.js
 * Registers the Service Worker and shows an "add to home screen" hint bubble
 * on first visit when not in standalone mode.
 *
 * Standalone detection:
 *   - window.matchMedia('(display-mode: standalone)').matches → Android Chrome / Edge PWA
 *   - window.navigator.standalone → iOS Safari standalone
 *
 * The hint:
 *   - Appears only once per device (sessionStorage: "pwa-hint-seen")
 *   - Auto-dismisses after 5 seconds
 *   - Tap outside also dismisses
 */

(function() {
  function isStandalone() {
    return (
      (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
      window.navigator.standalone === true
    );
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js")
        .then(reg => console.log("[pwa] SW registered:", reg.scope))
        .catch(err => console.warn("[pwa] SW registration failed:", err));
    });
  }

  function showAddToHomeHint() {
    if (isStandalone()) return;
    if (sessionStorage.getItem("pwa-hint-seen")) return;
    sessionStorage.setItem("pwa-hint-seen", "1");

    const bubble = document.createElement("div");
    bubble.className = "pwa-hint-bubble";
    bubble.innerHTML =
      ' Tap <b>菜单 · 添加到主屏幕</b> 下次一秒打开';
    document.body.appendChild(bubble);

    const raf = window.requestAnimationFrame || ((fn) => setTimeout(fn, 16));
    raf(() => bubble.classList.add("visible"));

    let dismissed = false;
    const dismiss = () => {
      if (dismissed) return;
      dismissed = true;
      bubble.classList.remove("visible");
      setTimeout(() => bubble.remove(), 300);
    };
    setTimeout(dismiss, 5000);
    bubble.addEventListener("click", dismiss);
  }

  document.addEventListener("DOMContentLoaded", () => {
    registerSW();
    showAddToHomeHint();
  });
})();
