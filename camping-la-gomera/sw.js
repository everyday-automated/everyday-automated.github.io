// Transition only: retire La Gomera's previous service worker, caches and scope.
// No app content is kept in the Everyday Automated website.
self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil((async () => {
  const keys = await caches.keys();
  await Promise.all(keys.filter(k =>
    k.startsWith('la-gomera-root-pwa-') || k.startsWith('la-gomera-folder-pwa-')
  ).map(k => caches.delete(k)));
  await self.registration.unregister();
})()));
