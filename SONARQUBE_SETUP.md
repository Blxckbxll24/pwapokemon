# Configuración de SonarQube

## 1. Acceso Inicial

1. Espera 2-3 minutos a que SonarQube inicie completamente
2. Accede a: http://localhost:9000
3. Credenciales por defecto:
   - Usuario: `admin`
   - Password: `admin`
4. Te pedirá cambiar la contraseña (usa una fuerte)

## 2. Crear Proyecto

1. Click en "Create Project" → "Manually"
2. Project key: `pokepwa`
3. Display name: `PokePWA`
4. Main branch: `main`
5. Click "Set Up"

## 3. Generar Token

1. Click en "Locally"
2. Genera un token:
   - Name: `jenkins-token`
   - Type: `Global Analysis Token`
   - Expires in: `90 days` (o No expiration)
3. **COPIAR Y GUARDAR EL TOKEN** (lo necesitarás para Jenkins)

## 4. Configurar Quality Gate

1. Click en "Quality Gates" (menú superior)
2. Click en "Create"
3. Nombre: `Strict Gate`
4. Agregar condiciones:
   - Click "Add Condition"
   - **Bugs**: is greater than `0` → FAIL
   - Click "Add Condition"
   - **Vulnerabilities**: is greater than `0` → FAIL
   - Click "Add Condition" (opcional)
   - **Coverage**: is less than `50` → FAIL
5. Click "Save"
6. Ir a "Projects" → `pokepwa` → "Project Settings" → "Quality Gate"
7. Seleccionar `Strict Gate`

## 5. Configurar en Jenkins

### 5.1 Instalar Plugin SonarQube

1. Jenkins → "Manage Jenkins" → "Plugins"
2. Tab "Available plugins"
3. Buscar: `SonarQube Scanner`
4. Instalar y reiniciar si es necesario

### 5.2 Configurar SonarQube Server

1. "Manage Jenkins" → "System"
2. Scroll hasta "SonarQube servers"
3. Click "Add SonarQube"
   - Name: `SonarQube`
   - Server URL: `http://sonarqube:9000`
   - Server authentication token: Click "Add" → "Jenkins"
     - Kind: `Secret text`
     - Secret: [PEGAR TOKEN DE SONARQUBE]
     - ID: `sonarqube-token`
     - Description: `SonarQube Auth Token`
   - Seleccionar el token creado
4. Click "Save"

### 5.3 Configurar SonarQube Scanner

1. "Manage Jenkins" → "Tools"
2. Scroll hasta "SonarQube Scanner"
3. Click "Add SonarQube Scanner"
   - Name: `SonarQubeScanner`
   - Install automatically: ✅ (marcar)
   - Version: Última disponible
4. Click "Save"

## 6. Verificar Conexión

Ejecuta este comando en el contenedor de Jenkins:

```bash
docker exec -it jenkins curl -u admin:TU_PASSWORD http://sonarqube:9000/api/system/status
```

Deberías ver: `{"status":"UP"}`

## 7. Tokens y Credenciales Necesarias

Para el Jenkinsfile necesitas:
- ✅ Token de SonarQube (ya configurado como `sonarqube-token`)
- ⏳ Token de Vercel (agregar como `vercel-token`)
- ⏳ Variables: `VERCEL_ORG_ID` y `VERCEL_PROJECT_ID`
