const VERSION = "1.6.2";
const CACHE = `blockable-${VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./game.js",
  "./game-core.js",
  "./app-updates.js",
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
  "./Assets/pwa/maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      await cache.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" })));
      await self.skipWaiting();
    } catch (error) {
      await caches.delete(CACHE);
      throw error;
    }
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith("blockable-") && key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
  if (event.data?.type === "GET_VERSION") event.ports[0]?.postMessage({ version: VERSION });
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
