import React, { useState, useEffect } from 'react';
import './App.css';
import notificationManager from './NotificationManager';

function App() {
  const [pokemon, setPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cacheLoaded, setCacheLoaded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showDiagnostic, setShowDiagnostic] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState([]);

  useEffect(() => {
    fetchPokemon();
    
    // Escuchar cambios de conectividad
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🌐 Conexión restaurada');
      if (notificationsEnabled) {
        notificationManager.showOnlineNotification();
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      console.log('📱 Modo offline activado');
      if (notificationsEnabled) {
        notificationManager.showOfflineNotification();
      }
    };

    // Inicializar notificaciones
    const initNotifications = async () => {
      const hasPermission = await notificationManager.requestPermission();
      setNotificationsEnabled(hasPermission);
      
      if (hasPermission) {
        // Programar notificaciones periódicas
        notificationManager.schedulePeriodicNotifications();
      }
    };

    // Solicitar permisos de notificación después de 3 segundos
    setTimeout(initNotifications, 3000);
    
    // Manejar mensajes del service worker (acciones de notificaciones)
    const handleServiceWorkerMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_ACTION') {
        const { action, data } = event.data;
        
        switch (action) {
          case 'view':
            console.log('👁️ Usuario quiere ver la Pokédex');
            // La aplicación ya estará visible
            break;
          case 'share':
            if (navigator.share) {
              navigator.share({
                title: 'Mi Pokédex Digital',
                text: `¡He capturado ${pokemon.length} Pokémon en mi Pokédex!`,
                url: window.location.href
              }).catch(err => console.log('Error compartiendo:', err));
            }
            break;
          case 'celebrate':
            console.log('🎉 Usuario está celebrando el logro:', data);
            // Aquí podrías agregar animaciones especiales
            break;
          case 'test-again':
            console.log('🔄 Usuario quiere otra notificación de prueba');
            // Enviar otra notificación de prueba
            setTimeout(() => {
              if (notificationsEnabled) {
                handleTestNotification();
              }
            }, 1000);
            break;
          default:
            console.log('Acción de notificación no reconocida:', action);
        }
      }
    };
    
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []); // Solo cargar una vez

  const fetchPokemon = async () => {
    setLoading(true);
    try {
      console.log('🚀 Iniciando carga de Pokémon...');
      
      // PRIMERO: Intentar cargar desde localStorage SIEMPRE
      const cachedData = localStorage.getItem('pokepwa-pokemon-cache');
      // const cacheTime = localStorage.getItem('pokepwa-cache-time'); // Reservado para futuras versiones
      
      if (cachedData) {
        try {
          const parsedPokemon = JSON.parse(cachedData);
          console.log('✅ Cache encontrado:', parsedPokemon.length, 'Pokémon');
          
          // Mostrar datos del cache INMEDIATAMENTE
          setPokemon(parsedPokemon);
          setCacheLoaded(true);
          setLoading(false);
          
          // Si no hay conexión, terminar aquí
          if (!navigator.onLine) {
            console.log('📱 MODO OFFLINE - Usando cache guardado');
            return;
          }
          
          // Si hay conexión, continuar cargando en background para actualizar
          console.log('🔄 Actualizando datos en background...');
        } catch (error) {
          console.error('❌ Error parseando cache:', error);
          localStorage.removeItem('pokepwa-pokemon-cache');
          localStorage.removeItem('pokepwa-cache-time');
        }
      }
      
      // SEGUNDO: Si no hay cache O hay conexión, cargar desde API
      if (!navigator.onLine && !cachedData) {
        console.log('❌ Sin conexión y sin cache disponible');
        setPokemon([]);
        setLoading(false);
        return;
      }

      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=1000');
      const data = await response.json();
      
      // Cargar Pokémon en lotes para mejorar rendimiento
      const batchSize = 50;
      const allPokemon = [];
      
      for (let i = 0; i < data.results.length; i += batchSize) {
        const batch = data.results.slice(i, i + batchSize);
        console.log(`Cargando lote ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.results.length/batchSize)}...`);
        
        const batchDetails = await Promise.all(
          batch.map(async (poke) => {
            try {
              const detailResponse = await fetch(poke.url);
              const detail = await detailResponse.json();
              
              return {
                id: detail.id,
                name: detail.name,
                image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${detail.id}.png`,
                types: detail.types.map(type => type.type.name),
                height: detail.height,
                weight: detail.weight,
                abilities: detail.abilities.map(ability => ability.ability.name),
                stats: detail.stats.map(stat => ({
                  name: stat.stat.name,
                  value: stat.base_stat
                })),
                baseExperience: detail.base_experience || 0
              };
            } catch (error) {
              console.error(`Error cargando Pokémon ${poke.name}:`, error);
              return null;
            }
          })
        );
        
        // Filtrar Pokémon válidos y agregarlos al array principal
        const validBatch = batchDetails.filter(p => p !== null);
        allPokemon.push(...validBatch);
        
        // Actualizar estado parcialmente para mostrar progreso
        setPokemon([...allPokemon]);
      }
      
      // Guardar en cache GARANTIZADO
      try {
        localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(allPokemon));
        localStorage.setItem('pokepwa-cache-time', Date.now().toString());
        console.log(`✅ Cache guardado EXITOSAMENTE: ${allPokemon.length} Pokémon`);
      } catch (cacheError) {
        console.error('❌ Error guardando en cache:', cacheError);
        
        // Si falla, limpiar espacio y intentar con datos reducidos
        try {
          // Limpiar caches antiguos
          localStorage.removeItem('pokemonCache');
          localStorage.removeItem('pokemonCacheTimestamp');
          localStorage.removeItem('pokepwa-pokemon-data');
          localStorage.removeItem('pokepwa-pokemon-timestamp');
          
          // Intentar guardar de nuevo
          localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(allPokemon));
          localStorage.setItem('pokepwa-cache-time', Date.now().toString());
          console.log('✅ Cache guardado después de limpiar espacio');
        } catch (retryError) {
          console.error('❌ Error crítico guardando cache:', retryError);
          
          // Como último recurso, guardar solo los primeros 500
          try {
            const reducedData = allPokemon.slice(0, 500);
            localStorage.setItem('pokepwa-pokemon-cache', JSON.stringify(reducedData));
            localStorage.setItem('pokepwa-cache-time', Date.now().toString());
            console.log(`⚠️ Cache reducido guardado: ${reducedData.length} Pokémon`);
          } catch (finalError) {
            console.error('💥 Error final guardando cache:', finalError);
          }
        }
      }
      
      console.log(`🎉 ¡Cargados ${allPokemon.length} Pokémon exitosamente!`);
      
      // Verificar logros y mostrar notificaciones
      if (notificationsEnabled && allPokemon.length > 0) {
        notificationManager.checkMilestones(allPokemon.length);
        notificationManager.showPokemonCapturedNotification(allPokemon.length);
      }
    } catch (error) {
      console.error('❌ Error fetching Pokémon:', error);
      // Intentar cargar desde cache si hay error de red
      const cachedPokemon = localStorage.getItem('pokepwa-pokemon-cache');
      if (cachedPokemon) {
        try {
          const parsedPokemon = JSON.parse(cachedPokemon);
          setPokemon(parsedPokemon);
          console.log('📦 Cargado desde cache local debido a error de red:', parsedPokemon.length);
        } catch (parseError) {
          console.error('Error parseando cache:', parseError);
          localStorage.removeItem('pokepwa-pokemon-cache');
          localStorage.removeItem('pokepwa-cache-time');
        }
      } else {
        // Si no hay cache, mostrar mensaje offline
        setPokemon([]);
        console.log('💔 Sin datos y sin conexión');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonClick = async (pokemonData) => {
    setSelectedPokemon(pokemonData);
    
    // NOTIFICACIÓN FORZADA - SIEMPRE INTENTAR
    console.log(`🔔 CLICK en ${pokemonData.name} - Verificando notificaciones...`);
    console.log('🔔 Notificaciones habilitadas:', notificationsEnabled);
    console.log('🔔 Permiso:', Notification.permission);
    
    // Verificar soporte
    if (!('Notification' in window)) {
      console.error('❌ Navegador no soporta notificaciones');
      return;
    }
    
    // Solicitar permisos si es necesario
    let permission = Notification.permission;
    if (permission === 'default') {
      console.log('🔔 Solicitando permisos automáticamente...');
      permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
    
    // Crear notificación SIEMPRE si hay permisos
    if (permission === 'granted') {
      try {
        console.log(`🚀 CREANDO notificación para: ${pokemonData.name}`);
        
        const notification = new Notification(`🔴 ¡${pokemonData.name.toUpperCase()}!`, {
          body: `Has seleccionado a ${pokemonData.name}. ¡Mira sus detalles!`,
          icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          tag: `pokemon-${pokemonData.id}`,
          requireInteraction: false,
          silent: false,
          vibrate: [200, 100, 200]
        });
        
        console.log(`✅ NOTIFICACIÓN CREADA:`, notification);
        
        notification.onshow = () => {
          console.log(`📺 NOTIFICACIÓN MOSTRADA: ${pokemonData.name}`);
        };
        
        notification.onclick = () => {
          console.log(`🖱️ NOTIFICACIÓN CLICKEADA: ${pokemonData.name}`);
          window.focus();
          notification.close();
        };
        
        notification.onerror = (error) => {
          console.error(`❌ ERROR EN NOTIFICACIÓN:`, error);
        };
        
        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
          if (notification) {
            notification.close();
            console.log(`⏰ Notificación de ${pokemonData.name} cerrada automáticamente`);
          }
        }, 5000);
        
      } catch (error) {
        console.error('💥 ERROR CRÍTICO creando notificación:', error);
      }
    } else {
      console.error('❌ Sin permisos para notificaciones:', permission);
    }
  };

  const closePokemonDetails = () => {
    setSelectedPokemon(null);
  };

  const handleNotificationToggle = async () => {
    if (!notificationsEnabled) {
      const hasPermission = await notificationManager.requestPermission();
      setNotificationsEnabled(hasPermission);
      
      if (hasPermission) {
        notificationManager.schedulePeriodicNotifications();
      }
    } else {
      // No podemos deshabilitar completamente las notificaciones desde JS,
      // pero podemos cambiar el estado local
      setNotificationsEnabled(false);
      console.log('🔕 Notificaciones deshabilitadas localmente');
    }
  };

  const handleTestNotification = async () => {
    console.log('🔔 [PRUEBA MACOS ESPECIAL] Iniciando sistema de notificaciones agresivo...');
    
    // 1. Verificar soporte básico
    if (!('Notification' in window)) {
      console.error('❌ Este navegador no soporta notificaciones');
      alert('❌ Tu navegador no soporta notificaciones');
      return;
    }
    
    // 2. Detectar si estamos en macOS
    const isMacOS = navigator.platform.includes('Mac') || navigator.userAgent.includes('Mac');
    console.log(`🔍 Sistema detectado: ${isMacOS ? 'macOS 🍎' : 'Otro sistema'}`);
    
    // 3. Solicitar permisos si es necesario
    let permission = Notification.permission;
    if (permission === 'default') {
      console.log('🔄 Solicitando permisos...');
      permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
    }
    
    if (permission !== 'granted') {
      console.error('❌ Permisos denegados:', permission);
      alert(`❌ Permisos de notificación: ${permission}\n\n🍎 Para macOS:\n1. Ve a Preferencias del Sistema > Notificaciones\n2. Busca tu navegador (Chrome/Safari/Firefox)\n3. Permite notificaciones\n4. Asegúrate de que "Alertas" esté seleccionado`);
      return;
    }
    
    console.log('✅ Permisos concedidos - Activando modo MACOS AGRESIVO...');
    
    // 4. Ejecutar estrategias según el sistema operativo
    if (isMacOS) {
      // MODO ESPECIAL PARA MACOS - Estrategias múltiples
      console.log('🍎 Activando modo agresivo para macOS...');
      
      notificationManager.forceNotificationForMacOS(
        'PRUEBA ESPECIAL MACOS',
        '🍎 Si ves esto, ¡las notificaciones funcionan en macOS! Probando múltiples estrategias simultáneamente.'
      );
      
      // Mostrar también una alerta como feedback inmediato
      setTimeout(() => {
        // eslint-disable-next-line no-restricted-globals
        if (confirm('🍎 ¿Pudiste ver alguna notificación del sistema?\n\nSi no, puede ser que macOS las esté bloqueando. ¿Quieres ver las instrucciones para habilitarlas?')) {
          // eslint-disable-next-line no-restricted-globals
          alert(`🍎 INSTRUCCIONES PARA MACOS:

1. 🔧 Preferencias del Sistema → Notificaciones
2. 🔍 Busca "Chrome" (o tu navegador)
3. ✅ Activa "Permitir notificaciones"
4. 🔔 Selecciona "Alertas" (no "Banners")
5. 📱 Activa "Mostrar en centro de notificaciones"
6. 🔄 Reinicia el navegador

También revisa:
- 🌙 Modo "No Molestar" desactivado
- 📱 Notificaciones del sitio web permitidas`);
        }
      }, 3000);
      
    } else {
      // MÉTODO NORMAL para otros sistemas
      console.log('🖥️ Usando método estándar para otros sistemas...');
      
      notificationManager.showNotification('🔔 Prueba de Notificación', {
        body: 'Si ves esto, las notificaciones están funcionando correctamente',
        requireInteraction: true,
        tag: 'test-standard'
      });
    }
    
    // 4. PRUEBA 2: Notificación via Service Worker (después de 2 segundos)
    setTimeout(async () => {
      try {
        console.log('🧪 PRUEBA 2: Notificación via Service Worker...');
        
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: '🔴 PRUEBA 2: Via Service Worker',
            options: {
              body: '¡Esta es la prueba 2! Si la ves, el Service Worker funciona.',
              icon: '/logo192.png',
              tag: 'test-2-sw',
              badge: '/favicon.ico',
              vibrate: [200, 100, 200]
            }
          });
          console.log('✅ PRUEBA 2: Mensaje enviado al Service Worker');
        } else {
          console.warn('⚠️ PRUEBA 2: Service Worker no disponible');
        }
        
      } catch (error) {
        console.error('💥 PRUEBA 2: Error:', error);
      }
    }, 2000);
    
    // 5. PRUEBA 3: Notificación con más opciones (después de 4 segundos)
    setTimeout(() => {
      try {
        console.log('🧪 PRUEBA 3: Notificación avanzada...');
        
        const advancedNotification = new Notification('🔴 PRUEBA 3: Notificación Avanzada', {
          body: '¡Esta es la prueba 3! Con más opciones y configuraciones.',
          icon: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png',
          badge: '/favicon.ico',
          tag: 'test-3-advanced',
          requireInteraction: true, // Requiere interacción del usuario
          silent: false,
          vibrate: [100, 50, 100, 50, 100],
          timestamp: Date.now(),
          data: {
            test: 3,
            type: 'advanced',
            timestamp: new Date().toISOString()
          }
        });
        
        console.log('✅ PRUEBA 3: Notificación avanzada creada:', advancedNotification);
        
        advancedNotification.onshow = () => {
          console.log('📺 PRUEBA 3: Notificación avanzada mostrada');
        };
        
        advancedNotification.onclick = () => {
          console.log('🖱️ PRUEBA 3: Notificación avanzada clickeada');
          advancedNotification.close();
        };
        
      } catch (error) {
        console.error('💥 PRUEBA 3: Error:', error);
      }
    }, 4000);
    
    // Mostrar resumen en consola
    console.log('🧪 === RESUMEN DE PRUEBAS ===');
    console.log('📊 Se ejecutaron 3 pruebas de notificación en secuencia:');
    console.log('1️⃣ Notificación básica directa (inmediata)');
    console.log('2️⃣ Notificación via Service Worker (+2s)');
    console.log('3️⃣ Notificación avanzada con opciones (+4s)');
    console.log('🔍 Si NO ves ninguna notificación, el problema está en el navegador/SO');
    console.log('✅ Si ves alguna notificación, el código funciona parcialmente');
    
    // Mostrar alerta al usuario
    alert('🧪 Se enviaron 3 notificaciones de prueba (0s, +2s, +4s). Si no ves ninguna, revisa la configuración del navegador o sistema operativo.');
  };

  // FUNCIÓN DE DIAGNÓSTICO AVANZADO
  const runAdvancedDiagnostic = async () => {
    console.log('🩺 === DIAGNÓSTICO AVANZADO DE NOTIFICACIONES ===');
    const results = [];
    
    // Test 1: Soporte del navegador
    const browserSupport = 'Notification' in window;
    results.push({
      test: 'Soporte del navegador',
      status: browserSupport ? '✅' : '❌',
      details: browserSupport ? 'Notification API disponible' : 'Notification API no soportada'
    });
    
    // Test 2: Service Worker
    const swSupport = 'serviceWorker' in navigator;
    results.push({
      test: 'Service Worker disponible',
      status: swSupport ? '✅' : '❌',
      details: swSupport ? 'ServiceWorker API disponible' : 'ServiceWorker API no soportada'
    });
    
    // Test 3: Service Worker registrado
    let swActive = false;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      swActive = registration && registration.active;
      results.push({
        test: 'Service Worker activo',
        status: swActive ? '✅' : '❌',
        details: swActive ? `SW activo: ${registration.active.scriptURL}` : 'No hay Service Worker activo'
      });
    } catch (error) {
      results.push({
        test: 'Service Worker activo',
        status: '❌',
        details: `Error verificando SW: ${error.message}`
      });
    }
    
    // Test 4: Contexto seguro (HTTPS)
    const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    results.push({
      test: 'Contexto seguro (HTTPS)',
      status: isSecure ? '✅' : '❌',
      details: `Protocolo: ${window.location.protocol}, Host: ${window.location.hostname}`
    });
    
    // Test 5: Estado de permisos
    const permission = Notification.permission;
    results.push({
      test: 'Permisos de notificación',
      status: permission === 'granted' ? '✅' : permission === 'denied' ? '❌' : '⚠️',
      details: `Estado: ${permission}`
    });
    
    // Test 6: Visibilidad de la página
    const isVisible = document.visibilityState === 'visible';
    results.push({
      test: 'Página visible',
      status: isVisible ? '✅' : '⚠️',
      details: `visibilityState: ${document.visibilityState}`
    });
    
    // Test 7: Focus de la ventana
    const hasFocus = document.hasFocus();
    results.push({
      test: 'Ventana enfocada',
      status: hasFocus ? '✅' : '⚠️',
      details: `hasFocus: ${hasFocus}`
    });
    
    // Test 8: Información del navegador
    results.push({
      test: 'Información del navegador',
      status: '📋',
      details: `${navigator.userAgent.split(' ').slice(-2).join(' ')}`
    });
    
    // Test 9: Plataforma
    results.push({
      test: 'Plataforma',
      status: '📋',
      details: `${navigator.platform} - ${navigator.language}`
    });
    
    // Test 10: Prueba de notificación directa
    if (permission === 'granted') {
      try {
        console.log('🧪 Realizando prueba de notificación directa...');
        const testNotification = new Notification('🧪 DIAGNÓSTICO - Prueba Directa', {
          body: 'Si ves esta notificación, el problema NO está en el código básico',
          icon: '/logo192.png',
          tag: 'diagnostic-direct-test',
          requireInteraction: false,
          silent: false
        });
        
        results.push({
          test: 'Notificación directa creada',
          status: '✅',
          details: 'Notificación directa creada exitosamente'
        });
        
        // Auto-cerrar
        setTimeout(() => testNotification.close(), 4000);
        
      } catch (error) {
        results.push({
          test: 'Notificación directa creada',
          status: '❌',
          details: `Error: ${error.message}`
        });
      }
    }
    
    // Test 11: Prueba via Service Worker
    if (swActive && permission === 'granted') {
      try {
        console.log('🧪 Realizando prueba via Service Worker...');
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: '🧪 DIAGNÓSTICO - Prueba Service Worker',
          options: {
            body: 'Si ves esta notificación, el Service Worker funciona correctamente',
            icon: '/logo192.png',
            tag: 'diagnostic-sw-test'
          }
        });
        
        results.push({
          test: 'Notificación via SW enviada',
          status: '✅',
          details: 'Mensaje enviado al Service Worker exitosamente'
        });
        
      } catch (error) {
        results.push({
          test: 'Notificación via SW enviada',
          status: '❌',
          details: `Error: ${error.message}`
        });
      }
    }
    
    setDiagnosticResults(results);
    setShowDiagnostic(true);
    
    // Imprimir resultados en consola
    console.log('🩺 === RESULTADOS DEL DIAGNÓSTICO ===');
    results.forEach(result => {
      console.log(`${result.status} ${result.test}: ${result.details}`);
    });
    console.log('🩺 === FIN DEL DIAGNÓSTICO ===');
  };

  const filteredPokemon = pokemon.filter(poke =>
    poke.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="App">
        <div className="loading">
          <h2>🔴 CAPTURANDO POKÉMON ⚡</h2>
          <p>🎯 {pokemon.length} de 1000 Pokémon capturados...</p>
          <div className="loading-bar">
            <div className="loading-progress" style={{width: `${(pokemon.length / 1000) * 100}%`}}></div>
          </div>
          <p style={{fontSize: '1rem', marginTop: '20px', opacity: 0.8}}>
            🌟 ¡Preparando tu Pokédex personalizada!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>⚡ POKÉDEX DIGITAL ⚡</h1>
        <div className="connection-status">
          {isOnline ? (
            <span className="online-indicator">🌐 ONLINE</span>
          ) : (
            <span className="offline-indicator">📱 OFFLINE</span>
          )}
          {cacheLoaded && !isOnline && (
            <span className="cache-indicator">📦 DATOS GUARDADOS</span>
          )}
          <button
            className={`notification-toggle ${notificationsEnabled ? 'enabled' : 'disabled'}`}
            onClick={handleNotificationToggle}
            title={notificationsEnabled ? 'Deshabilitar notificaciones' : 'Habilitar notificaciones'}
          >
            {notificationsEnabled ? '🔔 ON' : '🔕 OFF'}
          </button>
        </div>
        <p className="pokemon-count">🎯 {pokemon.length} POKÉMON REGISTRADOS</p>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Busca tu Pokémon favorito..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button
            className="test-notification-btn"
            onClick={handleTestNotification}
            disabled={!notificationsEnabled}
            title={notificationsEnabled ? 'Enviar notificación de prueba' : 'Activa las notificaciones primero'}
          >
            🔔 Probar
          </button>
          <button
            className="diagnostic-btn"
            onClick={runAdvancedDiagnostic}
            title="Ejecutar diagnóstico avanzado de notificaciones"
          >
            🩺 Diagnóstico
          </button>
          <button
            className="diagnostic-btn"
            onClick={runAdvancedDiagnostic}
            title="Ejecutar diagnóstico avanzado"
          >
            🩺 Diagnóstico
          </button>
        </div>
      </header>

      <main className="pokemon-container">
        {filteredPokemon.map((poke) => (
          <div 
            key={poke.id} 
            className="pokemon-card"
            onClick={() => handlePokemonClick(poke)}
          >
            <div className="pokemon-number">#{poke.id.toString().padStart(3, '0')}</div>
            <img 
              src={poke.image} 
              alt={poke.name}
              className="pokemon-image"
              onError={(e) => {
                e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`;
              }}
            />
            <h3 className="pokemon-name">{poke.name}</h3>
            
            <div className="pokemon-types">
              {poke.types.map((type, index) => (
                <span key={index} className={`type type-${type}`}>
                  {type}
                </span>
              ))}
            </div>

            <div className="pokemon-quick-info">
              <span className="quick-stat">⚡ {poke.abilities.length} habilidades</span>
              <span className="quick-stat">🎯 Click para ver más</span>
            </div>
          </div>
        ))}
      </main>

      {/* Modal de detalles del Pokémon */}
      {selectedPokemon && (
        <div className="pokemon-modal-overlay" onClick={closePokemonDetails}>
          <div className="pokemon-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closePokemonDetails}>✕</button>
            
            <div className="modal-header">
              <div className="modal-pokemon-number">#{selectedPokemon.id.toString().padStart(3, '0')}</div>
              <img 
                src={selectedPokemon.image} 
                alt={selectedPokemon.name}
                className="modal-pokemon-image"
              />
              <h2 className="modal-pokemon-name">{selectedPokemon.name}</h2>
              
              <div className="modal-pokemon-types">
                {selectedPokemon.types.map((type, index) => (
                  <span key={index} className={`type type-${type}`}>
                    {type}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-content">
              <div className="modal-section">
                <h3>📏 Información Física</h3>
                <div className="physical-info">
                  <div className="info-item">
                    <span className="info-label">Altura:</span>
                    <span className="info-value">{(selectedPokemon.height / 10).toFixed(1)}m</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Peso:</span>
                    <span className="info-value">{(selectedPokemon.weight / 10).toFixed(1)}kg</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Exp. Base:</span>
                    <span className="info-value">{selectedPokemon.baseExperience}</span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>🎯 Habilidades</h3>
                <div className="abilities-grid">
                  {selectedPokemon.abilities.map((ability, index) => (
                    <div key={index} className="ability-card">
                      {ability.replace('-', ' ')}
                    </div>
                  ))}
                </div>
              </div>

              <div className="modal-section">
                <h3>📊 Estadísticas Base</h3>
                <div className="stats-grid">
                  {selectedPokemon.stats.map((stat, index) => (
                    <div key={index} className="stat-row">
                      <span className="stat-name">{stat.name.replace('-', ' ')}</span>
                      <div className="stat-bar">
                        <div 
                          className="stat-fill" 
                          style={{width: `${Math.min((stat.value / 200) * 100, 100)}%`}}
                        ></div>
                      </div>
                      <span className="stat-value">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de diagnóstico */}
      {showDiagnostic && (
        <div className="diagnostic-modal-overlay" onClick={() => setShowDiagnostic(false)}>
          <div className="diagnostic-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowDiagnostic(false)}>✕</button>
            <h2>🩺 Resultados del Diagnóstico</h2>
            <ul className="diagnostic-results">
              {diagnosticResults.map((result, index) => (
                <li key={index} className={`diagnostic-result ${result.status === '✅' ? 'success' : result.status === '❌' ? 'error' : 'warning'}`}>
                  <strong>{result.test}:</strong> {result.status} - {result.details}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Banner de información */}
      {pokemon.length > 0 && !loading && (
        <div className="info-banner">
          <p>🔥 Mostrando {filteredPokemon.length} de {pokemon.length} Pokémon</p>
          <p>📱 Funciona sin conexión gracias a PWA</p>
          {notificationsEnabled && (
            <p>🔔 Notificaciones activas - Te avisaremos de nuevos logros</p>
          )}
          {!notificationsEnabled && (
            <p>🔕 <button onClick={handleNotificationToggle} className="inline-notification-btn">Activar notificaciones</button> para recibir alertas de logros</p>
          )}
        </div>
      )}

      {/* Modal de Diagnóstico */}
      {showDiagnostic && (
        <div className="diagnostic-overlay" onClick={() => setShowDiagnostic(false)}>
          <div className="diagnostic-modal" onClick={e => e.stopPropagation()}>
            <div className="diagnostic-header">
              <h2>🩺 Diagnóstico de Notificaciones</h2>
              <button onClick={() => setShowDiagnostic(false)} className="close-btn">✕</button>
            </div>
            
            <div className="diagnostic-content">
              <div className="diagnostic-info">
                <p>📊 Estado actual del sistema de notificaciones:</p>
              </div>
              
              <div className="diagnostic-results">
                {diagnosticResults.map((result, index) => (
                  <div key={index} className={`diagnostic-item ${result.status === '✅' ? 'success' : result.status === '❌' ? 'error' : 'info'}`}>
                    <span className="diagnostic-status">{result.status}</span>
                    <span className="diagnostic-test">{result.test}</span>
                    <span className="diagnostic-details">{result.details}</span>
                  </div>
                ))}
              </div>
              
              <div className="diagnostic-actions">
                <button onClick={runAdvancedDiagnostic} className="diagnostic-refresh-btn">
                  🔄 Re-ejecutar Diagnóstico
                </button>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(diagnosticResults, null, 2));
                    alert('Resultados copiados al portapapeles');
                  }}
                  className="diagnostic-copy-btn"
                >
                  📋 Copiar Resultados
                </button>
              </div>
              
              <div className="diagnostic-tips">
                <h3>💡 Posibles Soluciones:</h3>
                <ul>
                  <li>🔒 Verifica que la página esté en HTTPS o localhost</li>
                  <li>🔔 Asegúrate de que las notificaciones estén habilitadas en el navegador</li>
                  <li>⚙️ Revisa la configuración de notificaciones del sistema operativo</li>
                  <li>🚫 Verifica que no esté activado el "No molestar" o "Focus" del sistema</li>
                  <li>🎯 Algunos navegadores bloquean notificaciones en pestañas en segundo plano</li>
                  <li>💻 En macOS, verifica Preferencias del Sistema &gt; Notificaciones</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>⚡ Pokédx Digital - PWA con Notificaciones Push</p>
        <p>🎯 Desarrollado para funcionar completamente offline</p>
      </footer>
    </div>
  );
}

export default App;
