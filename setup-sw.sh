#!/bin/bash

echo "🔧 Configurando Service Worker final..."

# Copiar el service worker correcto al build
echo "📋 Copiando service-worker.js..."
cp public/service-worker.js build/service-worker.js

echo "✅ Service Worker copiado correctamente"

# Verificar que existe
if [ -f "build/service-worker.js" ]; then
    echo "✅ service-worker.js encontrado en build/"
    echo "📄 Tamaño del archivo: $(wc -c < build/service-worker.js) bytes"
else
    echo "❌ service-worker.js NO encontrado en build/"
    exit 1
fi

echo "🎯 ¡Service Worker listo para deployment!"
