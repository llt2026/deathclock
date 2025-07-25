const CACHE_NAME = 'moreminutes-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/calc',
  '/result',
  '/extend',
  '/vault',
  '/share',
  '/about',
  '/legal',
  '/manifest.json'
];

// Install event - cache essential resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request).then((networkResponse) => {
          // Don't cache API calls or dynamic content
          if (event.request.url.includes('/api/') || 
              event.request.url.includes('?') ||
              !networkResponse || 
              networkResponse.status !== 200 || 
              networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Cache successful responses
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        });
      })
      .catch(() => {
        // Fallback for offline mode
        if (event.request.destination === 'document') {
          return caches.match('/');
        }
        
        // Return a generic offline response for other requests
        return new Response('Offline mode - please check your connection', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({
            'Content-Type': 'text/plain'
          })
        });
      })
  );
});

// Background sync for data when back online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-vault-data') {
    event.waitUntil(syncVaultData());
  }
});

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      data: data.data || {}
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

// Sync vault data when online
async function syncVaultData() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingUploads = await cache.match('pending-vault-uploads');
    
    if (pendingUploads) {
      const uploads = await pendingUploads.json();
      // Process pending uploads when back online
      for (const upload of uploads) {
        try {
          await fetch('/api/vault/upload', {
            method: 'POST',
            body: upload.formData
          });
        } catch (error) {
          console.error('Failed to sync vault upload:', error);
        }
      }
      
      // Clear pending uploads
      await cache.delete('pending-vault-uploads');
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
} 