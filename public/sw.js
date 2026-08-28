const CACHE = 'triagebox-shell-v2';
const SHELL = ['/', '/index.html', '/privacy/', '/terms/', '/offline.html', '/manifest.webmanifest', '/assets/triage-map-480.webp', '/assets/triage-map.webp', '/assets/triage-map-800.jpg', '/icons/triagebox-mark.svg', '/icons/icon-192.png', '/icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL);
    const response = await fetch('/');
    const html = await response.clone().text();
    const builtAssets = [...new Set(html.match(/\/assets\/[A-Za-z0-9._-]+\.(?:js|css)/g) || [])];
    if (builtAssets.length) await cache.addAll(builtAssets);
    await self.skipWaiting();
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(Promise.all([
    caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))),
    self.clients.claim()
  ]).then(async () => {
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(client => client.postMessage({ type: 'UPDATE_READY' }));
  }));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); return response;
    }).catch(async () => (await caches.match(event.request)) || (await caches.match('/')) || caches.match('/offline.html')));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});
