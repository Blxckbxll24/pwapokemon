// NotificationManager - Maneja todas las notificaciones push de la PWA
class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    // Verificar si las notificaciones están soportadas
    if (!('Notification' in window)) {
      console.warn('Este navegador no soporta notificaciones');
      return;
    }

    // Obtener estado actual del permiso
    this.permission = Notification.permission;
    console.log('🔔 Estado de notificaciones:', this.permission);
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      return false;
    }

    // Si ya tenemos permiso, no pedir de nuevo
    if (this.permission === 'granted') {
      return true;
    }

    // Solicitar permiso
    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        console.log('✅ Permisos de notificación concedidos');
        this.showWelcomeNotification();
        return true;
      } else {
        console.log('❌ Permisos de notificación denegados');
        return false;
      }
    } catch (error) {
      console.error('Error solicitando permisos:', error);
      return false;
    }
  }

  showWelcomeNotification() {
    this.showNotification('🔴 ¡Pokédex Activada!', {
      body: '¡Las notificaciones están habilitadas! Te avisaremos cuando captures nuevos Pokémon.',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'welcome',
      data: { type: 'welcome' }
    });
  }

  showPokemonCapturedNotification(pokemonCount) {
    const messages = [
      `🎉 ¡Increíble! Has capturado ${pokemonCount} Pokémon`,
      `⚡ ¡${pokemonCount} Pokémon en tu Pokédex!`,
      `🌟 ¡Tu colección creció a ${pokemonCount} Pokémon!`,
      `🔥 ¡${pokemonCount} Pokémon capturados exitosamente!`
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    this.showNotification('Pokédex - Captura Exitosa', {
      body: randomMessage,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'pokemon-captured',
      data: { 
        type: 'pokemon-captured',
        count: pokemonCount
      },
      actions: [
        {
          action: 'view',
          title: '👁️ Ver Pokédex'
        },
        {
          action: 'share',
          title: '📤 Compartir'
        }
      ]
    });
  }

  showMilestoneNotification(milestone) {
    const milestoneMessages = {
      100: '🥉 ¡Primer centenar! 100 Pokémon capturados',
      250: '🥈 ¡Cuarto de mil! 250 Pokémon en tu colección',
      500: '🥇 ¡Medio millar! 500 Pokémon capturados',
      750: '🏆 ¡Casi mil! 750 Pokémon en tu Pokédex',
      1000: '👑 ¡MAESTRO POKÉMON! ¡1000 Pokémon capturados!'
    };

    const message = milestoneMessages[milestone];
    if (!message) return;

    this.showNotification('🎖️ ¡Logro Desbloqueado!', {
      body: message,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: `milestone-${milestone}`,
      data: { 
        type: 'milestone',
        milestone: milestone
      },
      requireInteraction: true, // Notificación persistente para logros importantes
      actions: [
        {
          action: 'celebrate',
          title: '🎉 Celebrar'
        },
        {
          action: 'view',
          title: '👁️ Ver Colección'
        }
      ]
    });
  }

  showOfflineNotification() {
    this.showNotification('📱 Modo Offline Activado', {
      body: 'Tu Pokédex funciona sin conexión. Los datos se sinronizarán cuando vuelvas a conectarte.',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'offline-mode',
      data: { type: 'offline' }
    });
  }

  showOnlineNotification() {
    this.showNotification('🌐 ¡Conexión Restaurada!', {
      body: 'Tu Pokédex está actualizando datos en segundo plano.',
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'online-mode',
      data: { type: 'online' }
    });
  }

  showRandomPokemonFact() {
    const facts = [
      '🔴 ¿Sabías que Pikachu originalmente iba a ser llamado Pikachū?',
      '⚡ Charizard no es tipo Dragón, ¡es tipo Fuego/Volador!',
      '💎 Hay más de 900 Pokémon diferentes en todas las generaciones',
      '🌟 Mew contiene el ADN de todos los Pokémon',
      '🔥 Magikarp puede saltar montañas con su ataque Splash',
      '❄️ Los Pokémon tipo Hielo son inmunes a ser congelados',
      '🌙 Algunos Pokémon solo pueden evolucionar durante la noche',
      '🍃 Los Pokémon tipo Planta no pueden ser envenenados por esporas'
    ];

    const randomFact = facts[Math.floor(Math.random() * facts.length)];

    this.showNotification('💡 Dato Curioso Pokémon', {
      body: randomFact,
      icon: '/logo192.png',
      badge: '/favicon.ico',
      tag: 'pokemon-fact',
      data: { type: 'fact' }
    });
  }

  showNotification(title, options = {}) {
    console.log('🔔 Intentando mostrar notificación:', title);
    console.log('🔔 Permisos:', this.permission);
    
    if (this.permission !== 'granted') {
      console.warn('❌ No hay permisos para mostrar notificaciones. Permisos:', this.permission);
      return;
    }

    // Opciones por defecto MUY AGRESIVAS para macOS
    const defaultOptions = {
      icon: '/logo192.png',
      badge: '/favicon.ico',
      image: '/logo192.png', // Imagen grande
      vibrate: [500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500], // Patrón largo
      silent: false,
      requireInteraction: true, // CRÍTICO: Mantener hasta que el usuario interactúe
      timestamp: Date.now(),
      renotify: true, // Permitir re-notificar con el mismo tag
      sticky: true, // Intentar hacer persistente
      ...options
    };

    console.log('🔔 Opciones de notificación AGRESIVAS:', defaultOptions);

    try {
      // ESTRATEGIA MÚLTIPLE: Intentar AMBOS métodos para maximizar compatibilidad
      
      // 1. Service Worker (método preferido para PWAs)
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        console.log('📡 Enviando notificación a través del Service Worker');
        navigator.serviceWorker.controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          title: title,
          options: defaultOptions
        });
      }
      
      // 2. Notificación directa ADICIONAL (doble seguridad)
      console.log('📱 Mostrando notificación directa ADICIONAL');
      const notification = new Notification(title, defaultOptions);
      
      // 3. Configurar eventos de la notificación directa
      notification.onclick = () => {
        console.log('🖱️ Notificación directa clickeada');
        window.focus();
        notification.close();
      };
      
      notification.onerror = (error) => {
        console.error('❌ Error en notificación directa:', error);
      };
      
      notification.onshow = () => {
        console.log('✅ Notificación directa mostrada exitosamente');
      };
      
      notification.onclose = () => {
        console.log('🔕 Notificación directa cerrada');
      };
      
      console.log('✅ Notificación creada con múltiples estrategias:', notification);
      
      // 4. FALLBACK VISUAL: Si después de 2 segundos no hay interacción, mostrar alert
      setTimeout(() => {
        if (document.visibilityState === 'visible') {
          // Mostrar banner in-app como último recurso
          this.showInAppNotification(title, defaultOptions.body || 'Nueva notificación');
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error mostrando notificación:', error);
      // Fallback final: mostrar in-app
      this.showInAppNotification(title, options.body || 'Nueva notificación');
    }
  }

  // Método ESPECIAL para macOS - Fuerza notificaciones múltiples
  forceNotificationForMacOS(title, body) {
    console.log('🍎 MODO MACOS ACTIVADO - Forzando notificaciones múltiples');
    
    if (this.permission !== 'granted') {
      console.warn('❌ No hay permisos para notificaciones forzadas');
      return;
    }

    const strategies = [
      // Estrategia 1: Service Worker con configuración agresiva
      () => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: `🔴 ${title}`,
            options: {
              body: body,
              icon: '/logo192.png',
              requireInteraction: true,
              vibrate: [1000, 500, 1000],
              tag: `macos-sw-${Date.now()}`
            }
          });
          console.log('🍎 Estrategia 1: Service Worker enviado');
        }
      },

      // Estrategia 2: Notificación directa con timeout
      () => {
        const notification = new Notification(`⚡ ${title}`, {
          body: body,
          icon: '/logo192.png',
          requireInteraction: true,
          vibrate: [800, 200, 800],
          tag: `macos-direct-${Date.now()}`
        });

        notification.onshow = () => console.log('🍎 Estrategia 2: Notificación directa mostrada');
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-cerrar después de 10 segundos si no hay interacción
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, 10000);
        
        console.log('🍎 Estrategia 2: Notificación directa creada');
      },

      // Estrategia 3: Notificación in-app garantizada
      () => {
        this.showInAppNotification(`🎯 ${title}`, body);
        console.log('🍎 Estrategia 3: Notificación in-app mostrada');
      },

      // Estrategia 4: Sonido del navegador + vibración
      () => {
        // Crear un audio context para reproducir sonido
        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.value = 800;
          oscillator.type = 'sine';
          gainNode.gain.value = 0.1;
          
          oscillator.start();
          oscillator.stop(audioContext.currentTime + 0.3);
          
          console.log('🍎 Estrategia 4: Sonido reproducido');
        } catch (audioError) {
          console.warn('🍎 Estrategia 4: Error reproduciendo sonido:', audioError);
        }

        // Vibración del dispositivo
        if (navigator.vibrate) {
          navigator.vibrate([500, 200, 500, 200, 500]);
          console.log('🍎 Estrategia 4: Vibración activada');
        }
      }
    ];

    // Ejecutar todas las estrategias con delays escalonados
    strategies.forEach((strategy, index) => {
      setTimeout(() => {
        try {
          strategy();
        } catch (error) {
          console.error(`🍎 Error en estrategia ${index + 1}:`, error);
        }
      }, index * 500); // 500ms entre cada estrategia
    });
  }

  // Método auxiliar para mostrar notificaciones in-app
  showInAppNotification(title, body) {
    console.log('📱 Mostrando notificación in-app como fallback');
    
    // Crear elemento de notificación in-app
    const notification = document.createElement('div');
    notification.className = 'in-app-notification';
    notification.innerHTML = `
      <div class="notification-content">
        <strong>${title}</strong>
        <p>${body}</p>
        <button onclick="this.parentElement.parentElement.remove()">✕</button>
      </div>
    `;
    
    // Estilos inline para asegurar visibilidad
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      z-index: 10000;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Remover automáticamente después de 5 segundos
    setTimeout(() => {
      if (notification.parentElement) {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  // Programar notificaciones periódicas (solo funciona si la app está en primer plano)
  schedulePeriodicNotifications() {
    if (this.permission !== 'granted') return;

    // Dato curioso cada 30 minutos
    setInterval(() => {
      if (document.visibilityState === 'visible') {
        this.showRandomPokemonFact();
      }
    }, 30 * 60 * 1000); // 30 minutos
  }

  // Verificar logros basados en la cantidad de Pokémon
  checkMilestones(pokemonCount) {
    const milestones = [100, 250, 500, 750, 1000];
    const lastMilestone = parseInt(localStorage.getItem('pokepwa-last-milestone') || '0');

    for (const milestone of milestones) {
      if (pokemonCount >= milestone && lastMilestone < milestone) {
        localStorage.setItem('pokepwa-last-milestone', milestone.toString());
        this.showMilestoneNotification(milestone);
        break; // Solo mostrar un logro a la vez
      }
    }
  }
}

// Crear instancia global
const notificationManager = new NotificationManager();

export default notificationManager;
