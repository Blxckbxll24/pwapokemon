#!/bin/bash
# filepath: /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa/start-services.sh

echo "🚀 Iniciando servicios DevOps..."
echo ""

# Levantar todos los servicios
echo "1. Levantando Jenkins y SonarQube..."
docker-compose up -d

echo ""
echo "2. Esperando a que los servicios inicien..."
sleep 10

echo ""
echo "3. Verificando estado de los contenedores..."
docker-compose ps

echo ""
echo "4. Estado de los servicios:"
echo ""

# Verificar Jenkins
if curl -s http://localhost:8090 > /dev/null 2>&1; then
    echo "✅ Jenkins: http://localhost:8090"
else
    echo "⏳ Jenkins: Iniciando... (espera 30 segundos más)"
fi

# Verificar SonarQube
if curl -s http://localhost:9000 > /dev/null 2>&1; then
    echo "✅ SonarQube: http://localhost:9000"
else
    echo "⏳ SonarQube: Iniciando... (espera 1-2 minutos más)"
fi

echo ""
echo "📋 Comandos útiles:"
echo "   Ver logs de Jenkins:   docker-compose logs -f jenkins"
echo "   Ver logs de SonarQube: docker-compose logs -f sonarqube"
echo "   Ver todos los logs:    docker-compose logs -f"
echo "   Detener servicios:     docker-compose down"
echo ""

# Esperar un poco más y mostrar password de Jenkins
echo "5. Esperando a que Jenkins termine de iniciar..."
sleep 20

echo ""
if docker exec jenkins test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
    echo "🔑 Password inicial de Jenkins:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "📍 Accede a: http://localhost:8090"
    echo "   Pega el password de arriba para desbloquear Jenkins"
else
    echo "✅ Jenkins ya está configurado"
    echo "📍 Accede a: http://localhost:8090"
fi

echo ""
echo "✨ Servicios iniciados. Verifica en las URLs de arriba."