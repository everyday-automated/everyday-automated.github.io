// La Gomera PWA: cache only static app files. Supabase data is never cached.
const CACHE_NAME="la-gomera-folder-pwa-v1";
const PAGE="/camping-la-gomera/";
const ASSETS=[PAGE,"/camping-la-gomera/manifest.webmanifest","/camping-la-gomera/icons/icon-192.png","/camping-la-gomera/icons/icon-512.png"];
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>cache.addAll(ASSETS))
      .then(()=>self.skipWaiting())
  );
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>k.startsWith("la-gomera-folder-pwa-")&&k!==CACHE_NAME).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  // Keep API requests, sessions, and Supabase records network-only.
  if(url.hostname==='cdn.jsdelivr.net' && url.pathname.startsWith('/npm/@supabase/supabase-js@2')){
    event.respondWith(fetch(event.request).then(res=>{
      if(res.ok||res.type==='opaque')caches.open(CACHE_NAME).then(c=>c.put(event.request,res.clone()));
      return res;
    }).catch(()=>caches.match(event.request)));
    return;
  }
  if(url.origin!==self.location.origin)return;
  const isAppPage=url.pathname==='/camping-la-gomera/'||url.pathname==='/camping-la-gomera/index.html';
  if(isAppPage){
    event.respondWith(fetch(event.request).then(res=>{
      if(res.ok)caches.open(CACHE_NAME).then(c=>c.put(PAGE,res.clone()));
      return res;
    }).catch(()=>caches.match(PAGE)));
    return;
  }
  if(ASSETS.includes(url.pathname)){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)));
  }
});
