#!/bin/bash

echo "🔧 Configurando PWA para Vercel..."

# Copiar service worker optimizado
cp public/sw-optimized.js build/service-worker.js
echo "✅ Service Worker copiado"

# Verificar que el manifest esté en su lugar
if [ -f "build/manifest.json" ]; then
    echo "✅ Manifest.json encontrado"
else
    echo "❌ Manifest.json no encontrado"
fi

# Verificar estructura del build
echo "📁 Estructura del build:"
ls -la build/

echo "🎯 PWA lista para deployment en Vercel!"
