// Service Worker Final - Garantiza funcionamiento offline completo
const CACHE_NAME = 'pokepwa-final-v2';
const API_CACHE_NAME = 'pokepwa-api-final-v2';

// URLs críticas que deben funcionar offline
const CRITICAL_RESOURCES = [
  '/',
  '/index.html',
  '/static/js/main.62bd48ee.js',
  '/static/css/main.9972529c.css',
  '/manifest.json',
  '/favicon.ico'
];

// Página offline de respaldo
const OFFLINE_PAGE = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>⚡ POKÉDEX OFFLINE ⚡</title>
    <style>
        body {
            margin: 0;
            font-family: 'Orbitron', monospace;
            background: linear-gradient(-45deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #feca57);
            background-size: 400% 400%;
            animation: gradientShift 15s ease infinite;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            text-align: center;
        }
        @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .offline-container {
            background: rgba(0,0,0,0.8);
            padding: 40px;
            border-radius: 20px;
            border: 3px solid #ffd700;
            box-shadow: 0 0 30px rgba(255, 215, 0, 0.5);
            max-width: 500px;
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }
        p { font-size: 1.2rem; line-height: 1.6; }
        .pokeball { font-size: 4rem; animation: bounce 2s infinite; }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .retry-btn {
            background: linear-gradient(45deg, #ff6b6b, #ffd700);
            border: none;
            padding: 15px 30px;
            border-radius: 50px;
            color: white;
            font-family: 'Orbitron', monospace;
            font-size: 1rem;
            cursor: pointer;
            margin-top: 20px;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="pokeball">🔴</div>
        <h1>⚡ POKÉDEX OFFLINE ⚡</h1>
        <p>📱 Tu Pokédex funciona sin conexión</p>
        <p>🎯 Los Pokémon guardados están disponibles</p>
        <p>🌐 Conéctate para actualizar datos</p>
        <button class="retry-btn" onclick="window.location.reload()">
            🔄 Reintentar Conexión
        </button>
    </div>
    <script>
        // Verificar conexión cada 30 segundos
        setInterval(() => {
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 30000);
    </script>
</body>
</html>`;

// INSTALACIÓN: Cachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('🔧 [SW] Instalando Service Worker Final...');
  
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        
        // Cachear recursos uno por uno con manejo de errores
        console.log('📦 [SW] Cacheando recursos críticos...');
        for (const resource of CRITICAL_RESOURCES) {
          try {
            await cache.add(resource);
            console.log(`✅ [SW] Cacheado: ${resource}`);
          } catch (error) {
            console.warn(`⚠️ [SW] No se pudo cachear ${resource}:`, error);
            // Para recursos críticos que fallan, crear respuesta de respaldo
            if (resource === '/' || resource === '/index.html') {
              await cache.put(resource, new Response(OFFLINE_PAGE, {
                headers: { 'Content-Type': 'text/html' }
              }));
            }
          }
        }
        
        console.log('🎉 [SW] Service Worker instalado correctamente');
        await self.skipWaiting();
      } catch (error) {
        console.error('❌ [SW] Error en instalación:', error);
      }
    })()
  );
});

// ACTIVACIÓN: Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🚀 [SW] Activando Service Worker...');
  
  event.waitUntil(
    (async () => {
      try {
        // Limpiar caches antiguos
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
              console.log(`🗑️ [SW] Eliminando cache obsoleto: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
        
        // Tomar control de todas las pestañas
        await self.clients.claim();
        console.log('✅ [SW] Service Worker activado y en control');
      } catch (error) {
        console.error('❌ [SW] Error en activación:', error);
      }
    })()
  );
});

// INTERCEPTAR PETICIONES: Estrategia offline-first
self.addEventListener('fetch', (event) => {
  event.respondWith(handleFetch(event.request));
});

async function handleFetch(request) {
  const url = new URL(request.url);
  
  try {
    // 1. RECURSOS DE LA APP (HTML, JS, CSS)
    if (isAppResource(url)) {
      return await handleAppResource(request);
    }
    
    // 2. API DE POKEMON
    if (url.hostname === 'pokeapi.co') {
      return await handleApiRequest(request);
    }
    
    // 3. IMÁGENES
    if (isImageRequest(request)) {
      return await handleImageRequest(request);
    }
    
    // 4. OTROS RECURSOS
    return await fetch(request);
    
  } catch (error) {
    console.log(`🔴 [SW] Error manejando petición: ${request.url}`, error);
    
    // Si es navegación, servir página offline
    if (request.mode === 'navigate') {
      const cache = await caches.open(CACHE_NAME);
      const cachedPage = await cache.match('/') || await cache.match('/index.html');
      return cachedPage || new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    
    return new Response('Offline', { status: 503 });
  }
}

function isAppResource(url) {
  return url.origin === self.location.origin && (
    url.pathname === '/' ||
    url.pathname === '/index.html' ||
    url.pathname.startsWith('/static/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/favicon.ico'
  );
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         request.url.includes('githubusercontent.com') ||
         /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(request.url);
}

async function handleAppResource(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // CACHE FIRST para recursos de la app
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log(`📦 [SW] Desde cache: ${request.url}`);
    return cachedResponse;
  }
  
  // Si no está en cache, intentar red
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
      console.log(`💾 [SW] Guardado en cache: ${request.url}`);
    }
    return networkResponse;
  } catch (error) {
    // Si falla la red, servir página offline para navegación
    if (request.mode === 'navigate') {
      return new Response(OFFLINE_PAGE, {
        headers: { 'Content-Type': 'text/html' }
      });
    }
    throw error;
  }
}

async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // CACHE FIRST para API (datos de Pokémon)
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    console.log(`🎯 [SW] API desde cache: ${request.url}`);
    
    // Actualizar en background si hay conexión
    if (navigator.onLine) {
      fetch(request).then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      }).catch(() => {});
    }
    
    return cachedResponse;
  }
  
  // Si no está en cache, intentar red
  const networkResponse = await fetch(request);
  if (networkResponse.ok) {
    cache.put(request, networkResponse.clone());
    console.log(`💾 [SW] API guardada: ${request.url}`);
  }
  return networkResponse;
}

async function handleImageRequest(request) {
  const cache = await caches.open(API_CACHE_NAME);
  
  // CACHE FIRST para imágenes
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Si no está en cache, intentar red
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Imagen de respaldo si falla
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" font-family="Arial" font-size="16" fill="#666" text-anchor="middle" dy="5">🔴 Sin imagen</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }
}

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎯 [SW] Service Worker Final cargado y listo');
