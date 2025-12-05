# 📋 Orden de Configuración - PokePWA

## ✅ FASE 1: Proyecto Base (Completado)

- [x] Crear proyecto React con Vite
- [x] Configurar PWA (Service Workers, Manifest)
- [x] Implementar consumo de PokeAPI
- [x] Implementar notificaciones nativas
- [x] Crear tests básicos
- [x] Docker Compose con Jenkins y SonarQube

## 🔄 FASE 2: Configuración de SonarQube (Completado)

- [x] Acceder a http://localhost:9000
- [x] Login: admin/admin (cambiar password)
- [x] Crear proyecto `pokepwa`
- [x] Generar token: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
- [x] Crear Quality Gate `Strict Gate`
- [x] Asignar Quality Gate al proyecto

## ⏳ FASE 3: Configuración de Jenkins (En Proceso)

### 3.1 Setup Inicial
```bash
# Obtener password inicial
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

- [ ] Acceder a http://localhost:8080
- [ ] Desbloquear con password
- [ ] Instalar plugins sugeridos
- [ ] Crear usuario admin

### 3.2 Instalar Plugins
**Manage Jenkins** → **Plugins** → **Available**

- [ ] NodeJS Plugin
- [ ] SonarQube Scanner
- [ ] Pipeline
- [ ] Git
- [ ] Reiniciar si es necesario

### 3.3 Configurar Tools
**Manage Jenkins** → **Tools**

- [ ] NodeJS:
  - Name: `NodeJS`
  - Version: `18.x`
  - ✅ Install automatically

- [ ] SonarQube Scanner:
  - Name: `SonarQubeScanner`
  - ✅ Install automatically

### 3.4 Configurar SonarQube Server
**Manage Jenkins** → **System** → **SonarQube servers**

- [ ] ✅ Marcar "Environment variables"
- [ ] Add SonarQube:
  - Name: `SonarQube`
  - URL: `http://sonarqube:9000`
  - Token: Crear credential
    - Kind: `Secret text`
    - Secret: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
    - ID: `sonarqube-token`

### 3.5 Crear Pipeline Job
- [ ] New Item → `pokepwa-pipeline`
- [ ] Type: Multibranch Pipeline
- [ ] Branch Sources → Git
- [ ] Repository URL: [TU REPO]
- [ ] Build Configuration: by Jenkinsfile
- [ ] Save

## ⏳ FASE 4: Git Repository

```bash
# Inicializar repositorio
git init
git add .
git commit -m "feat: initial PWA implementation"

# Crear repositorio en GitHub/GitLab
# Agregar remote
git remote add origin [URL]

# Crear rama develop
git checkout -b develop
git push -u origin develop

# Push a main
git checkout -b main
git push -u origin main
```

- [ ] Crear repositorio en GitHub/GitLab
- [ ] Push rama `develop`
- [ ] Push rama `main`
- [ ] Verificar que Jenkinsfile esté en la raíz

## ⏳ FASE 5: Pruebas Sin Vercel

### Test 1: Pipeline en develop
```bash
git checkout develop
git push origin develop
```

**Verificar en Jenkins:**
- [ ] Pipeline se ejecuta automáticamente
- [ ] Stage "Install Dependencies" ✅
- [ ] Stage "Run Tests" ✅
- [ ] Stage "SonarQube Analysis" ✅
- [ ] Stage "Quality Gate" ✅
- [ ] Stage "Deploy" SKIPPED (rama develop)

### Test 2: Bug Intencional
```bash
# Editar src/App.test.jsx
# expect(1).toBe(2) // Bug intencional

git add .
git commit -m "test: introduce bug"
git push origin develop
```

**Verificar en Jenkins:**
- [ ] Pipeline FALLA en Tests o Quality Gate ❌

### Test 3: Corrección
```bash
# Corregir el bug
git add .
git commit -m "fix: resolve bug"
git push origin develop
```

**Verificar en Jenkins:**
- [ ] Pipeline PASA ✅

## ⏳ FASE 6: Configuración de Vercel

### 6.1 Crear Cuenta
- [ ] Ir a https://vercel.com/signup
- [ ] Registrarse (GitHub, GitLab, Email)
- [ ] **NO conectar repositorio Git**

### 6.2 Instalar CLI
```bash
npm install -g vercel
vercel login
```

### 6.3 Vincular Proyecto (Sin Git)
```bash
cd /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa
vercel link

# Responder:
# ? Set up and deploy? Y
# ? Which scope? [Tu cuenta]
# ? Link to existing project? N
# ? Project name? pokepwa
# ? In which directory? ./
```

### 6.4 Obtener Credenciales
```bash
# Ver IDs
cat .vercel/project.json

# Copiar:
# - orgId
# - projectId

# Obtener token
# https://vercel.com/account/tokens
# Create Token → jenkins-deploy → Full Account
```

### 6.5 Configurar en Jenkins

**Credentials:**
- [ ] Manage Jenkins → Credentials → Add
  - Kind: Secret text
  - Secret: [VERCEL_TOKEN]
  - ID: `vercel-token`

**Environment Variables:**
- [ ] Manage Jenkins → System → Global properties
  - ✅ Environment variables
  - `VERCEL_ORG_ID`: [valor de orgId]
  - `VERCEL_PROJECT_ID`: [valor de projectId]

## ⏳ FASE 7: Prueba Final con Deploy

### Test: Merge a main
```bash
git checkout main
git merge develop
git push origin main
```

**Verificar en Jenkins:**
- [ ] Pipeline se ejecuta en main
- [ ] Todos los stages anteriores PASAN ✅
- [ ] Stage "Build" se ejecuta ✅
- [ ] Stage "Deploy to Production" se ejecuta ✅
- [ ] Se genera URL de Vercel
- [ ] Copiar URL

### Test: Validación PWA
- [ ] Abrir URL de Vercel
- [ ] Verificar que carga la lista de Pokemon
- [ ] Click en "Add to Home Screen"
- [ ] Click en un Pokemon → Verificar notificación
- [ ] Activar modo avión
- [ ] Recargar página → Debe funcionar offline

## ✅ Configuración Completa

¡Felicidades! Tu pipeline DevOps está funcionando completamente.

## 📝 Notas Importantes

1. **NO conectar Git en Vercel**: El deploy debe ser manual desde Jenkins
2. **Jenkinsfile en la raíz**: Debe estar en el repositorio
3. **Ramas requeridas**: `develop` y `main`
4. **Quality Gate**: Debe estar configurado y asignado
5. **Tokens seguros**: Usar Jenkins Credentials, nunca texto plano

## 🔗 Referencias Rápidas

- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Vercel Dashboard: https://vercel.com/dashboard
- Token de SonarQube: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
