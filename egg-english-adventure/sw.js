/**
 * sw.js
 * Service Worker for 蛋仔英语冒险.
 * Strategy:
 *   - App shell (index.html, styles.css, all scripts, manifest, icons):
 *       cache-first, network fallback (and cache the network response).
 *   - Everything else (none in MVP, but future API calls):
 *       network-first, cache fallback.
 *
 * Version bumping: change CACHE_VERSION when releasing new app shell.
 *   Old caches are purged in activate step.
 */

const CACHE_VERSION = "egg-en-v1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.json",
  "./scripts/state.js",
  "./scripts/data.js",
  "./scripts/speech.js",
  "./scripts/egg.js",
  "./scripts/screens.js",
  "./scripts/app.js",
  "./assets/icons/egg.svg",
  "./assets/icons/egg-192.png",
  "./assets/icons/egg-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) {
        // Stale-while-revalidate: serve cache, refresh in background.
        fetch(req).then(resp => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            caches.open(CACHE_VERSION).then(c => c.put(req, resp.clone()));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(req).catch(() => caches.match("./index.html"));
    })
  );
});
