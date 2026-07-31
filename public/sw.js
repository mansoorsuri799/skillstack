/* SkillStack PWA service worker — enables install (Add to Home Screen / Install app). */
const VERSION = "skillstack-pwa-v1";

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Pass-through fetch keeps the SW active (required for installability). */
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
