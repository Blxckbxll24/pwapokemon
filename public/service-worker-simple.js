// Service Worker SUPER SIMPLE que funciona en Vercel
const CACHE_NAME = 'pokepwa-v6';
const STATIC_CACHE_NAME = 'pokepwa-static-v6';

// URLs esenciales para funcionamiento offline
const ESSENTIAL_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 Instalando Service Worker simple...');
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cacheando recursos esenciales...');
        return cache.addAll(ESSENTIAL_URLS);
      })
      .then(() => {
        console.log('✅ Service Worker instalado exitosamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error instalando Service Worker:', error);
      })
  );
});

// Activar Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Activando Service Worker...');
  event.waitUntil(
    Promise.all([
      // Limpiar caches viejos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
              console.log('🗑️ Eliminando cache viejo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control inmediatamente
      self.clients.claim()
    ])
  );
});

// Manejar todas las peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  // Para navegación (páginas HTML)
  if (request.mode === 'navigate') {
    try {
      // Intentar red primero
      const networkResponse = await fetch(request);
      return networkResponse;
    } catch (error) {
      // Si falla, devolver página principal desde cache
      console.log('📱 Sin conexión, sirviendo página desde cache');
      const cache = await caches.open(STATIC_CACHE_NAME);
      const cachedResponse = await cache.match('/index.html') || await cache.match('/');
      return cachedResponse || new Response('Offline', { status: 503 });
    }
  }

  // Para recursos estáticos (JS, CSS, imágenes)
  if (request.destination === 'script' || 
      request.destination === 'style' || 
      request.destination === 'image' ||
      request.url.includes('/static/')) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      if (cachedResponse) {
        console.log('📦 Recurso desde cache:', request.url);
        return cachedResponse;
      }
      
      // Si no está en cache, descargarlo
      const networkResponse = await fetch(request);
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
        console.log('💾 Recurso guardado en cache:', request.url);
      }
      return networkResponse;
      
    } catch (error) {
      // Intentar desde cache si hay error
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      return cachedResponse || new Response('Not found', { status: 404 });
    }
  }

  // Para todo lo demás, pasar directo a la red
  try {
    return await fetch(request);
  } catch (error) {
    return new Response('Network error', { status: 503 });
  }
}
