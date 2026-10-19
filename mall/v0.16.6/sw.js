// Offline support for the web build (GitHub Pages, and the iPhone home-screen app).
// Network first, so a connection always gets the newest version; offline, the last copy that loaded opens instead.
// The game is one self-contained page, so caching the page is caching the whole game. The save lives in localStorage.
const CACHE = 'mall-revival';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.add('./')).catch(() => {}).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res.ok && (req.mode === 'navigate' || res.headers.get('content-type')?.includes('text/html'))){
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === 'navigate' ? './' : req, copy));
    }
    return res;
  }).catch(() => caches.match(req.mode === 'navigate' ? './' : req, { ignoreSearch: true }).then(r => r || caches.match('./'))));
});
