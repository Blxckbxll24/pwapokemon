#!/bin/bash
# filepath: /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa/check-jenkins.sh

echo "🔍 Verificando Configuración de Jenkins"
echo "========================================"
echo ""

# Verificar que Jenkins esté corriendo
echo "1. Verificando Jenkins..."
if curl -s http://localhost:8090 > /dev/null; then
    echo "✅ Jenkins está corriendo en http://localhost:8090"
else
    echo "❌ Jenkins no está accesible"
    echo "   Ejecuta: docker-compose up -d jenkins"
    exit 1
fi
echo ""

# Verificar que SonarQube esté corriendo
echo "2. Verificando SonarQube..."
if curl -s http://localhost:9000 > /dev/null; then
    echo "✅ SonarQube está corriendo en http://localhost:9000"
else
    echo "❌ SonarQube no está accesible"
    echo "   Ejecuta: docker-compose up -d sonarqube"
    exit 1
fi
echo ""

# Mostrar password inicial de Jenkins si existe
echo "3. Password inicial de Jenkins:"
if docker exec jenkins test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
    echo "---"
    docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    echo "---"
else
    echo "✅ Jenkins ya está configurado (no hay password inicial)"
fi
echo ""

echo "4. Checklist de configuración:"
echo ""
echo "   Jenkins (http://localhost:8090):"
echo "   [ ] Plugins instalados (NodeJS, SonarQube Scanner, Pipeline, Git)"
echo "   [ ] Tool 'NodeJS' configurado"
echo "   [ ] Tool 'SonarQubeScanner' configurado"
echo "   [ ] SonarQube Server conectado"
echo "   [ ] Credential 'sonarqube-token' creado"
echo "   [ ] Pipeline job 'pokepwa-pipeline' creado"
echo ""
echo "   SonarQube (http://localhost:9000):"
echo "   [ ] Proyecto 'pokepwa' creado"
echo "   [ ] Quality Gate 'Strict Gate' configurado"
echo "   [ ] Quality Gate asignado al proyecto"
echo ""
echo "5. Próximos pasos:"
echo ""
echo "   Si Jenkins no está configurado:"
echo "   → Sigue las instrucciones en JENKINS_CONFIG.md"
echo ""
echo "   Si ya está configurado:"
echo "   → Crea tu repositorio Git"
echo "   → git init && git add . && git commit -m 'initial commit'"
echo "   → Crea ramas: git checkout -b develop && git checkout -b main"
echo "   → Conecta el repositorio en Jenkins"
echo ""