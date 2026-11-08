/* AD MELIORA · Service Worker V1.3.4
   HTML/navigation: network-first with cached fallback.
   Same-origin static assets: cache-first.
   External requests and non-GET requests: untouched.
*/
'use strict';

const CACHE_NAME = 'ad-meliora-shell-v2-002-39';
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/training-carousel-v2.js",
  "/apps/AD_MELIORA.html",
  "/apps/FINANZAS_2026.html",
  "/apps/CARTELERA.html",
  "/apps/COCTELERIA.html",
  "/apps/DEPORTES.html",
  "/apps/LECTURA.html",
  "/apps/VIAJES.html",
  "/apps/MINIJUEGOS.html",
  "/apps/NOTAS.html",
  "/assets/cartelera.svg",
  "/assets/cocteleria.svg",
  "/assets/deportes.svg",
  "/assets/finanzas.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/assets/media/03237500f96bd19e.png",
  "/assets/media/35e3ff64a1b74c44.jpg",
  "/assets/media/40dda826552c6bb4.png",
  "/assets/media/69f512beba2c4674.jpg",
  "/assets/media/8feaaddaf5070fa3.jpg",
  "/assets/media/96830a7b99d487db.jpg",
  "/assets/media/9dc90450a41579b9.jpg",
  "/assets/media/d5a4b1c0b1fc54a7.jpg",
  "/assets/media/e4b8cf52de5df2ac.jpg",
  "/assets/media/e9713d72ae2dd845.jpg"
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(PRECACHE_URLS);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names.filter((name) => name.startsWith('ad-meliora-shell-') && name !== CACHE_NAME)
        .map((name) => caches.delete(name))
    );
    await self.clients.claim();
  })());
});

async function networkFirst(request, fallbackUrl) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== 'opaque') {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    if (fallbackUrl) {
      const fallback = await cache.match(fallbackUrl);
      if (fallback) return fallback;
    }
    throw error;
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  const isDocument = request.mode === 'navigate' ||
    request.destination === 'document' ||
    /\.html?$/i.test(url.pathname);

  if (isDocument) {
    event.respondWith(networkFirst(request, '/index.html'));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response && response.status === 200 && response.type !== 'opaque') {
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('', { status: 504, statusText: 'Offline' });
    }
  })());
});
