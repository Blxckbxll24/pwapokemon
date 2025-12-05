#!/bin/bash
# filepath: /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa/fix-sonarqube.sh

echo "🔧 Corrigiendo configuración de SonarQube..."
echo ""

# 1. Detener todo
echo "1. Deteniendo contenedores..."
docker-compose down
echo ""

# 2. Limpiar volúmenes corruptos de SonarQube
echo "2. Limpiando volúmenes de SonarQube..."
docker volume rm pokepwa_sonarqube_data pokepwa_sonarqube_extensions pokepwa_sonarqube_logs pokepwa_sonarqube_db 2>/dev/null || true
echo ""

# 3. Levantar PostgreSQL primero
echo "3. Levantando base de datos PostgreSQL..."
docker-compose up -d sonarqube-db
sleep 10
echo ""

# 4. Verificar que PostgreSQL esté listo
echo "4. Verificando PostgreSQL..."
until docker exec sonarqube-db pg_isready -U sonar > /dev/null 2>&1; do
    echo -n "."
    sleep 2
done
echo ""
echo "✅ PostgreSQL está listo"
echo ""

# 5. Levantar SonarQube
echo "5. Levantando SonarQube..."
docker-compose up -d sonarqube
echo ""

# 6. Monitorear inicio
echo "6. Monitoreando inicio de SonarQube..."
echo "   (Esto puede tomar 2-3 minutos)"
echo ""

for i in {1..60}; do
    sleep 5
    
    # Verificar si hay errores
    ERROR=$(docker-compose logs sonarqube | grep -i "IllegalArgumentException\|ERROR" | tail -1)
    if [ ! -z "$ERROR" ]; then
        echo "❌ Error detectado:"
        echo "$ERROR"
        echo ""
        echo "Ver logs completos: docker-compose logs sonarqube"
        exit 1
    fi
    
    # Verificar si está disponible
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:9000 2>/dev/null)
    if [ "$STATUS" = "200" ]; then
        echo ""
        echo "✅ ¡SonarQube está disponible!"
        echo ""
        echo "🌐 URL: http://localhost:9000"
        echo "👤 Usuario: admin"
        echo "🔑 Password: admin"
        echo ""
        echo "📋 Próximos pasos:"
        echo "   1. Accede a http://localhost:9000"
        echo "   2. Cambia la contraseña de admin"
        echo "   3. Crea el proyecto 'pokepwa'"
        echo "   4. Genera un token de autenticación"
        echo "   5. Configura el Quality Gate"
        exit 0
    fi
    
    echo -n "."
done

echo ""
echo "⏳ SonarQube aún está iniciando..."
echo ""
echo "Comandos útiles:"
echo "  Ver logs: docker-compose logs -f sonarqube"
echo "  Ver estado: docker-compose ps"
echo "  Reiniciar: docker-compose restart sonarqube"