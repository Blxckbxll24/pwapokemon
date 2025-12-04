// Utilidad de diagnóstico de notificaciones
export const NotificationDiagnostic = {
  
  // Diagnóstico completo del estado de notificaciones
  async runFullDiagnostic() {
    console.log('🩺 === DIAGNÓSTICO COMPLETO DE NOTIFICACIONES ===');
    
    const results = {
      browserSupport: false,
      serviceWorkerSupport: false,
      currentPermission: 'unknown',
      canRequestPermission: false,
      platform: navigator.platform,
      userAgent: navigator.userAgent,
      isSecureContext: window.isSecureContext,
      problems: [],
      recommendations: []
    };
    
    // 1. Verificar soporte del navegador
    if ('Notification' in window) {
      results.browserSupport = true;
      console.log('✅ Soporte de Notification API: SÍ');
    } else {
      results.browserSupport = false;
      results.problems.push('El navegador no soporta la Notification API');
      console.log('❌ Soporte de Notification API: NO');
    }
    
    // 2. Verificar soporte de Service Worker
    if ('serviceWorker' in navigator) {
      results.serviceWorkerSupport = true;
      console.log('✅ Soporte de Service Worker: SÍ');
    } else {
      results.serviceWorkerSupport = false;
      results.problems.push('El navegador no soporta Service Workers');
      console.log('❌ Soporte de Service Worker: NO');
    }
    
    // 3. Verificar contexto seguro (HTTPS)
    if (window.isSecureContext) {
      console.log('✅ Contexto seguro (HTTPS): SÍ');
    } else {
      results.problems.push('La aplicación no se ejecuta en un contexto seguro (HTTPS requerido)');
      console.log('❌ Contexto seguro (HTTPS): NO');
    }
    
    // 4. Verificar permisos actuales
    if ('Notification' in window) {
      results.currentPermission = Notification.permission;
      console.log(`🔍 Estado de permisos actual: ${Notification.permission}`);
      
      switch (Notification.permission) {
        case 'granted':
          console.log('✅ Permisos: CONCEDIDOS');
          break;
        case 'denied':
          console.log('❌ Permisos: DENEGADOS');
          results.problems.push('Los permisos de notificación han sido denegados');
          results.recommendations.push('Ve a la configuración del navegador y habilita las notificaciones para este sitio');
          break;
        case 'default':
          console.log('⚠️ Permisos: AÚN NO SOLICITADOS');
          results.canRequestPermission = true;
          break;
      }
    }
    
    // 5. Información del navegador
    console.log(`🌐 Plataforma: ${navigator.platform}`);
    console.log(`🔍 User Agent: ${navigator.userAgent.substring(0, 100)}...`);
    
    // 6. Verificar si es móvil
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log(`📱 Es móvil: ${isMobile ? 'SÍ' : 'NO'}`);
    
    if (isMobile) {
      results.recommendations.push('En dispositivos móviles, asegúrate de que las notificaciones estén habilitadas en la configuración del sistema');
    }
    
    // 7. Verificar configuración específica del navegador
    this.checkBrowserSpecificSettings(results);
    
    console.log('🩺 === FIN DEL DIAGNÓSTICO ===');
    return results;
  },
  
  checkBrowserSpecificSettings(results) {
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isFirefox = /Firefox/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edge/.test(navigator.userAgent);
    
    if (isChrome) {
      console.log('🔍 Navegador detectado: Chrome');
      results.recommendations.push('En Chrome: Ve a Configuración > Privacidad y seguridad > Configuración del sitio > Notificaciones');
    } else if (isFirefox) {
      console.log('🔍 Navegador detectado: Firefox');
      results.recommendations.push('En Firefox: Ve a Preferencias > Privacidad y seguridad > Permisos > Notificaciones');
    } else if (isSafari) {
      console.log('🔍 Navegador detectado: Safari');
      results.recommendations.push('En Safari: Ve a Preferencias > Sitios web > Notificaciones');
    } else if (isEdge) {
      console.log('🔍 Navegador detectado: Edge');
      results.recommendations.push('En Edge: Ve a Configuración > Cookies y permisos del sitio > Notificaciones');
    }
  },
  
  // Prueba simple de notificación
  async testBasicNotification() {
    console.log('🧪 === PRUEBA BÁSICA DE NOTIFICACIÓN ===');
    
    if (!('Notification' in window)) {
      console.error('❌ No se puede probar: Notification API no disponible');
      return false;
    }
    
    let permission = Notification.permission;
    
    if (permission === 'default') {
      console.log('📋 Solicitando permisos...');
      try {
        permission = await Notification.requestPermission();
        console.log(`📋 Resultado: ${permission}`);
      } catch (error) {
        console.error('❌ Error solicitando permisos:', error);
        return false;
      }
    }
    
    if (permission !== 'granted') {
      console.error(`❌ No se puede probar: permisos ${permission}`);
      return false;
    }
    
    try {
      console.log('🚀 Creando notificación de prueba...');
      const notification = new Notification('🔥 PRUEBA EXITOSA', {
        body: '¡Las notificaciones funcionan correctamente!',
        icon: '/favicon.ico',
        tag: 'diagnostic-test',
        requireInteraction: true
      });
      
      notification.onshow = () => {
        console.log('✅ Notificación mostrada exitosamente');
      };
      
      notification.onerror = (error) => {
        console.error('❌ Error mostrando notificación:', error);
      };
      
      notification.onclick = () => {
        console.log('👆 Usuario hizo clic en la notificación');
        notification.close();
      };
      
      // Auto-cerrar después de 5 segundos
      setTimeout(() => {
        notification.close();
        console.log('⏰ Notificación cerrada automáticamente');
      }, 5000);
      
      return true;
      
    } catch (error) {
      console.error('❌ Error creando notificación:', error);
      return false;
    }
  },
  
  // Generar reporte de diagnóstico
  generateReport(diagnosticResults) {
    console.log('\n📋 === REPORTE DE DIAGNÓSTICO ===');
    
    if (diagnosticResults.problems.length === 0) {
      console.log('🎉 ¡No se encontraron problemas!');
    } else {
      console.log('⚠️ Problemas encontrados:');
      diagnosticResults.problems.forEach((problem, index) => {
        console.log(`   ${index + 1}. ${problem}`);
      });
    }
    
    if (diagnosticResults.recommendations.length > 0) {
      console.log('\n💡 Recomendaciones:');
      diagnosticResults.recommendations.forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
    }
    
    console.log('\n📋 === FIN DEL REPORTE ===\n');
  }
};

export default NotificationDiagnostic;
