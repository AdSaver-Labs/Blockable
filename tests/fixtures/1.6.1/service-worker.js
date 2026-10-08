const CACHE = "blockable-1.6.1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./game.js",
  "./game-core.js",
  "./vendor/sudoku.js",
  "./version.json",
  "./manifest.webmanifest",
  "./manifest-3d.webmanifest",
  "./Assets/BlockableAppIcon.png",
  "./Assets/BlockableDesktopIcon.png",
  "./Assets/pwa/apple-touch-icon.png",
  "./Assets/pwa/app-192.png",
  "./Assets/pwa/app-512.png",
  "./Assets/pwa/maskable-192.png",
  "./Assets/pwa/maskable-512.png",
  "./Assets/BlockableIcon.svg.png",
  "./Assets/BlockableMinimalIcon.png",
  "./Assets/pwa/minimal-192.png",
  "./Assets/pwa/minimal-512.png",
  "./Assets/pwa/glossy-192.png",
  "./Assets/pwa/glossy-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("blockable-") && key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(caches.open(CACHE).then(async (cache) => await cache.match("./index.html") || fetch(request)));
    return;
  }

  if (new URL(request.url).pathname.endsWith("/version.json")) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.open(CACHE).then(async (cache) => await cache.match(request) || fetch(request))
  );
});
