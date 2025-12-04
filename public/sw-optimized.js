// Service Worker optimizado para Vercel PWA
const CACHE_NAME = 'pokepwa-v5';
const API_CACHE_NAME = 'pokepwa-api-v5';
const IMAGE_CACHE_NAME = 'pokepwa-images-v4';

// URLs críticas para funcionamiento offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo192.png',
  '/logo512.png'
];

self.addEventListener('install', (event) => {
  console.log('🔧 Instalando Service Worker optimizado...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Precargando recursos críticos...');
        // Cachear recursos uno por uno para evitar fallos
        return Promise.allSettled(
          urlsToCache.map(url => 
            cache.add(url).catch(err => {
              console.warn(`No se pudo cachear ${url}:`, err);
              return null;
            })
          )
        );
      })
      .then(() => {
        console.log('✅ Service Worker instalado correctamente');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error instalando Service Worker:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Activando Service Worker...');
  event.waitUntil(
    Promise.all([
      // Limpiar caches antiguas
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME].includes(cacheName)) {
              console.log('🗑️ Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Tomar control de todas las páginas inmediatamente
      self.clients.claim()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Estrategia para API de Pokémon - Cache First con Network Fallback
  if (request.url.includes('pokeapi.co')) {
    event.respondWith(
      handleApiRequest(request)
    );
  }
  
  // Estrategia para imágenes - Cache First
  else if (request.url.includes('raw.githubusercontent.com') || 
           request.url.includes('sprites') ||
           request.destination === 'image') {
    event.respondWith(
      handleImageRequest(request)
    );
  }
  
  // Estrategia para recursos de la aplicación - Stale While Revalidate
  else {
    event.respondWith(
      handleAppRequest(request)
    );
  }
});

// Manejar peticiones de API con cache inteligente
async function handleApiRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Si tenemos cache, devolverlo inmediatamente
    if (cachedResponse) {
      console.log('🎯 API desde cache:', request.url);
      
      // En background, intentar actualizar
      updateApiCache(request, cache);
      
      return cachedResponse;
    }
    
    // Si no hay cache, hacer petición de red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cachear la respuesta exitosa
      await cache.put(request, networkResponse.clone());
      console.log('💾 API cacheada:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🔄 Error de red, intentando cache:', error);
    
    // Intentar desde cualquier cache disponible
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay nada en cache, devolver error informativo
    return new Response(JSON.stringify({
      error: 'Sin conexión',
      message: 'No se puede acceder a la API sin conexión a internet',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Actualizar cache de API en background
async function updateApiCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      console.log('🔄 Cache de API actualizado:', request.url);
    }
  } catch (error) {
    // Silenciosamente fallar - el usuario ya tiene la respuesta cacheada
  }
}

// Manejar peticiones de imágenes
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('🖼️ Imagen desde cache:', request.url);
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
      console.log('💾 Imagen cacheada:', request.url);
    }
    
    return networkResponse;
    
  } catch (error) {
    console.log('🔄 Error cargando imagen:', error);
    
    // Intentar desde cache
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || new Response('', { status: 404 });
  }
}

// Manejar recursos de la aplicación
async function handleAppRequest(request) {
  try {
    // Para navegación, siempre intentar red primero
    if (request.mode === 'navigate') {
      try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          await cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
      } catch (error) {
        // Si falla la red, devolver página principal desde cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/') || await cache.match('/index.html');
        
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return new Response('Aplicación no disponible offline', {
          status: 503,
          headers: { 'Content-Type': 'text/html' }
        });
      }
    }
    
    // Para recursos estáticos - Stale While Revalidate
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Devolver desde cache si está disponible
    if (cachedResponse) {
      // En background, actualizar cache
      fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
      }).catch(() => {});
      
      return cachedResponse;
    }
    
    // Si no hay cache, intentar red
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
    
  } catch (error) {
    // Intentar desde cualquier cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || new Response('Recurso no disponible', { status: 404 });
  }
}

// Mensaje al cliente cuando se actualiza el cache
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
