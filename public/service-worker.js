// Service Worker robusto para Vercel PWA
const CACHE_NAME = 'pokepwa-v7';
const API_CACHE_NAME = 'pokepwa-api-v7';
const IMAGE_CACHE_NAME = 'pokepwa-images-v7';

// URLs críticas que deben funcionar offline
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Instalar service worker
self.addEventListener('install', (event) => {
  console.log('🔧 Instalando Service Worker robusto para Vercel...');
  
  event.waitUntil(
    Promise.all([
      // Cache recursos críticos
      caches.open(CACHE_NAME).then((cache) => {
        console.log('📦 Cacheando recursos críticos...');
        return Promise.allSettled(
          CRITICAL_RESOURCES.map(url => 
            cache.add(url).catch(err => {
              console.warn(`No se pudo cachear ${url}:`, err);
              return null;
            })
          )
        );
      }),
      // Pre-cachear shell de la aplicación
      self.skipWaiting()
    ])
  );
});

// Activar service worker
self.addEventListener('activate', (event) => {
  console.log('🚀 Activando Service Worker...');
  
  event.waitUntil(
    Promise.all([
      // Limpiar caches obsoletos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (![CACHE_NAME, API_CACHE_NAME, IMAGE_CACHE_NAME].includes(cacheName)) {
              console.log('🗑️ Eliminando cache obsoleto:', cacheName);
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

// Interceptar todas las peticiones
self.addEventListener('fetch', (event) => {
  event.respondWith(handleRequest(event.request));
});

// Función principal para manejar peticiones
async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Estrategia para recursos de la aplicación (HTML, JS, CSS)
  if (isAppResource(request)) {
    return handleAppResource(request);
  }
  
  // Estrategia para API de Pokémon
  if (request.url.includes('pokeapi.co')) {
    return handleApiRequest(request);
  }
  
  // Estrategia para imágenes
  if (isImageRequest(request)) {
    return handleImageRequest(request);
  }
  
  // Para todo lo demás, pasar directo
  return fetch(request).catch(() => {
    return new Response('Offline', { status: 503 });
  });
}

// Verificar si es un recurso de la aplicación
function isAppResource(request) {
  const url = new URL(request.url);
  return url.origin === location.origin && (
    request.mode === 'navigate' ||
    request.destination === 'script' ||
    request.destination === 'style' ||
    url.pathname.startsWith('/static/') ||
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname === '/manifest.json'
  );
}

// Verificar si es una petición de imagen
function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.includes('raw.githubusercontent.com') ||
         request.url.includes('sprites') ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

// Manejar recursos de la aplicación
async function handleAppResource(request) {
  try {
    // Para navegación, siempre intentar red primero
    if (request.mode === 'navigate') {
      try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      } catch (error) {
        console.log('📱 Sin conexión, sirviendo desde cache...');
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match('/') || await cache.match('/index.html');
        return cachedResponse || createOfflineResponse();
      }
    }
    
    // Para recursos estáticos, cache first
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('📦 Recurso desde cache:', request.url);
      // Actualizar en background
      updateCache(request, cache);
      return cachedResponse;
    }
    
    // Si no está en cache, intentar red
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 Recurso guardado en cache:', request.url);
    }
    return networkResponse;
    
  } catch (error) {
    console.log('❌ Error cargando recurso:', request.url, error);
    
    // Intentar desde cache como fallback
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si es navegación y no hay cache, devolver página offline
    if (request.mode === 'navigate') {
      return createOfflineResponse();
    }
    
    return new Response('Recurso no disponible', { status: 404 });
  }
}

// Manejar peticiones de API
async function handleApiRequest(request) {
  try {
    const cache = await caches.open(API_CACHE_NAME);
    
    // Intentar cache primero
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('🎯 API desde cache:', request.url);
      // Actualizar en background
      updateApiCache(request, cache);
      return cachedResponse;
    }
    
    // Si no hay cache, intentar red
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('💾 API guardada en cache:', request.url);
    }
    return networkResponse;
    
  } catch (error) {
    console.log('🔄 Error API, intentando cache:', error);
    
    const cache = await caches.open(API_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response(JSON.stringify({
      error: 'Sin conexión',
      message: 'API no disponible offline',
      offline: true
    }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Manejar imágenes
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
      cache.put(request, networkResponse.clone());
      console.log('💾 Imagen guardada en cache:', request.url);
    }
    return networkResponse;
    
  } catch (error) {
    console.log('🔄 Error imagen, intentando cache:', error);
    
    const cache = await caches.open(IMAGE_CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    return cachedResponse || new Response('', { status: 404 });
  }
}

// Actualizar cache en background
async function updateCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('🔄 Cache actualizado:', request.url);
    }
  } catch (error) {
    // Silenciosamente fallar
  }
}

// Actualizar cache de API en background
async function updateApiCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log('🔄 Cache API actualizado:', request.url);
    }
  } catch (error) {
    // Silenciosamente fallar
  }
}

// Crear respuesta offline
function createOfflineResponse() {
  return new Response(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>PokePWA - Offline</title>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>
        body { 
          font-family: Arial, sans-serif; 
          text-align: center; 
          padding: 50px; 
          background: linear-gradient(135deg, #ff6b6b, #4ecdc4);
          color: white;
        }
        h1 { font-size: 2rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>📱 PokePWA - Modo Offline</h1>
      <p>No hay conexión a internet</p>
      <p>Los datos se cargarán desde el cache cuando estén disponibles</p>
      <button onclick="window.location.reload()">🔄 Intentar de nuevo</button>
    </body>
    </html>
  `, {
    status: 200,
    headers: { 'Content-Type': 'text/html' }
  });
}

// ==============================
// 🔔 NOTIFICACIONES LOCALES
// ==============================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Manejar solicitudes de notificación desde el cliente
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    console.log('📡 [SW] Recibida solicitud de notificación:', event.data);
    const { title, options } = event.data;
    
    try {
      // Configuración AGRESIVA para macOS/Chrome
      const aggressiveOptions = {
        body: options.body || 'Nueva notificación desde tu Pokédex',
        icon: options.icon || '/logo192.png',
        badge: '/favicon.ico',
        image: '/logo192.png', // Imagen grande
        vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500],
        tag: options.tag || `pokemon-${Date.now()}`, // Tag único para evitar agrupación
        requireInteraction: true, // CRÍTICO: Requiere interacción del usuario
        silent: false, // NO silencioso
        renotify: true, // Permitir re-notificar
        timestamp: Date.now(),
        data: {
          ...options.data,
          timestamp: Date.now(),
          url: self.location.origin
        },
        actions: [
          {
            action: 'open',
            title: '👁️ Ver Pokédex',
            icon: '/logo192.png'
          },
          {
            action: 'close',
            title: '✕ Cerrar'
          }
        ],
        // Configuraciones adicionales para macOS
        dir: 'ltr',
        lang: 'es-ES',
        ...options // Incluir opciones personalizadas
      };

      // Usar showNotification del service worker registration
      self.registration.showNotification(title, aggressiveOptions);
      console.log('✅ [SW] Notificación AGRESIVA enviada exitosamente con opciones:', aggressiveOptions);

      // DOBLE SEGURIDAD: Intentar mostrar otra notificación después de 1 segundo
      setTimeout(() => {
        const backupOptions = {
          ...aggressiveOptions,
          tag: `backup-${Date.now()}`,
          body: `🔄 BACKUP: ${aggressiveOptions.body}`,
          requireInteraction: true
        };
        
        try {
          self.registration.showNotification(`🔄 ${title}`, backupOptions);
          console.log('🔄 [SW] Notificación de BACKUP enviada');
        } catch (backupError) {
          console.error('❌ [SW] Error en notificación de backup:', backupError);
        }
      }, 1000);

    } catch (error) {
      console.error('❌ [SW] Error mostrando notificación:', error);
      
      // Fallback: Intentar notificación básica
      try {
        self.registration.showNotification(`⚠️ ${title}`, {
          body: 'Notificación básica de fallback',
          icon: '/logo192.png',
          requireInteraction: true,
          tag: `fallback-${Date.now()}`
        });
        console.log('🆘 [SW] Notificación de FALLBACK enviada');
      } catch (fallbackError) {
        console.error('💥 [SW] Error crítico en notificación de fallback:', fallbackError);
      }
    }
  }
});

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event.notification);
  
  event.notification.close();
  
  const action = event.action;
  const data = event.notification.data || {};
  
  // Abrir la aplicación
  const urlToOpen = new URL('/', self.location.origin).href;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
      .then((windowClient) => {
        // Enviar mensaje a la aplicación sobre la acción
        if (windowClient && action) {
          windowClient.postMessage({
            type: 'NOTIFICATION_ACTION',
            action: action,
            data: data
          });
        }
      })
  );
});

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificación cerrada:', event.notification.tag);
});

console.log('✅ Service Worker para Vercel cargado correctamente');
