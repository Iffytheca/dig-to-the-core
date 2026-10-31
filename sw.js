// Dig to the Core: keeps a copy of the game so it also plays with no internet.
// Always loads the newest game from the website first; the saved copy is only used with no internet.
const CACHE = 'digcore-v127';
const FILES = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>fetch(f, {cache:'no-store'}).then(r=>r.ok && c.put(f, r)).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k !== CACHE).map(k=>caches.delete(k))))
    .then(()=>self.clients.claim())
    // reload any open game tab so an old copy is replaced by the new one right away
    .then(()=>self.clients.matchAll({type:'window'})).then(cs=>Promise.all(cs.map(c=>c.navigate(c.url).catch(()=>{})))));
});
self.addEventListener('fetch', e=>{
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if(url.origin !== location.origin) return;
  e.respondWith(fetch(url.href, {cache:'no-store'}).then(r=>{
    if(r.ok && !url.search){ const copy = r.clone(); caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{}); }
    return r;
  }).catch(()=>caches.match(e.request, {ignoreSearch:true}).then(r=>r || caches.match('./index.html'))));
});
