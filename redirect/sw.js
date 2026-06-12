// Self-destroying service worker: replaces the old precaching worker so that
// clients with the previous PWA installed stop serving the cached app shell,
// drop every cache and reload onto the redirect page.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys()
      await Promise.all(cacheKeys.map((key) => caches.delete(key)))
      await self.registration.unregister()
      const windowClients = await self.clients.matchAll({ type: 'window' })
      for (const client of windowClients) {
        client.navigate(client.url)
      }
    })(),
  )
})
