# 🔧 Configuración de Jenkins - Paso a Paso

## 📋 Información de Credenciales

### SonarQube
- **URL**: http://sonarqube:9000
- **Token**: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
- **Credential ID en Jenkins**: `sonarqube-token`

### Vercel
- **Token**: [Obtener en https://vercel.com/account/tokens]
- **Credential ID en Jenkins**: `vercel-token`

---

## 🚀 Pasos de Configuración

### PASO 1: Desbloquear Jenkins (Primera vez)

1. Abre tu navegador en **http://localhost:8090**

2. Obten el password inicial:
```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

3. Copia y pega el password en Jenkins

4. Click **"Install suggested plugins"**
   - Espera 5-10 minutos mientras se instalan

5. Crear usuario administrador:
   - Username: `admin` (o el que prefieras)
   - Password: `admin123` (o el que prefieras - GUÁRDALO)
   - Full name: `Tu Nombre`
   - Email: `tu@email.com`

6. **Jenkins URL**: Dejar como `http://localhost:8090/`

7. Click **"Save and Finish"** → **"Start using Jenkins"**

---

### PASO 2: Instalar Plugins Adicionales

1. **Dashboard** → **Manage Jenkins** → **Plugins**

2. Tab **"Available plugins"**

3. Buscar e instalar uno por uno (usar el buscador):
   - ✅ `NodeJS Plugin`
   - ✅ `SonarQube Scanner for Jenkins`
   - ✅ `Pipeline`
   - ✅ `Git plugin`

4. ✅ Marcar **"Restart Jenkins when installation is complete"**

5. Esperar a que Jenkins reinicie (2-3 minutos)

6. Login nuevamente con tu usuario

---

### PASO 3: Configurar Node.js Tool

1. **Manage Jenkins** → **Tools**

2. Scroll hasta **"NodeJS installations"**

3. Click **"Add NodeJS"**

4. Configurar:
   ```
   Name: NodeJS
   ✅ Install automatically
   Version: NodeJS 18.x (o la última LTS)
   Global npm packages to install: (dejar vacío)
   ```

5. Click **"Save"** (al final de la página)

---

### PASO 4: Configurar SonarQube Scanner Tool

1. **Manage Jenkins** → **Tools**

2. Scroll hasta **"SonarQube Scanner installations"**

3. Click **"Add SonarQube Scanner"**

4. Configurar:
   ```
   Name: SonarQubeScanner
   ✅ Install automatically
   Version: SonarQube Scanner 5.0.1.3006 (o la última)
   ```

5. Click **"Save"**

---

### PASO 5: Crear Credential de SonarQube

1. **Manage Jenkins** → **Credentials**

2. Click en **(global)** bajo "Stores scoped to Jenkins"

3. Click **"Add Credentials"** (lado izquierdo)

4. Configurar:
   ```
   Kind: Secret text
   Scope: Global
   Secret: sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56
   ID: sonarqube-token
   Description: SonarQube Authentication Token
   ```

5. Click **"Create"**

---

### PASO 6: Conectar Jenkins con SonarQube

1. **Manage Jenkins** → **System**

2. Scroll hasta **"SonarQube servers"**

3. ✅ Marcar **"Environment variables"**

4. Click **"Add SonarQube"**

5. Configurar:
   ```
   Name: SonarQube
   Server URL: http://sonarqube:9000
   Server authentication token: sonarqube-token (seleccionar del dropdown)
   ```

6. Click **"Save"**

7. ✅ **Verificar conexión**: Deberías ver un checkmark verde

---

### PASO 7: Crear Pipeline Job (Sin repositorio aún)

1. **Dashboard** → Click **"New Item"** (izquierda superior)

2. Configurar:
   ```
   Item name: pokepwa-pipeline
   Type: Multibranch Pipeline (seleccionar este)
   ```

3. Click **"OK"**

4. En **"Branch Sources"**:
   - Por ahora **NO agregues nada**
   - Lo haremos después de crear el repositorio Git

5. En **"Build Configuration"**:
   ```
   Mode: by Jenkinsfile
   Script Path: Jenkinsfile
   ```

6. En **"Scan Multibranch Pipeline Triggers"**:
   ```
   ✅ Periodically if not otherwise run
   Interval: 1 minute
   ```

7. Click **"Save"**

---

### PASO 8: Crear Repositorio Git

Ahora sal de Jenkins y ve a tu terminal:

```bash
cd /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa

# Inicializar Git
git init

# Crear .gitignore si no existe
echo "node_modules
.env.jenkins
dist
build
coverage
.vercel" > .gitignore

# Agregar todos los archivos
git add .

# Primer commit
git commit -m "feat: initial PWA implementation with CI/CD pipeline"

# Crear rama develop
git checkout -b develop

# Volver a main
git checkout -b main
```

**Ahora crea el repositorio en GitHub/GitLab:**

**Opción A: GitHub**
1. Ve a https://github.com/new
2. Nombre: `pokepwa`
3. ❌ **NO** marcar "Initialize with README"
4. Click **"Create repository"**
5. Copiar la URL (ejemplo: `https://github.com/tuusuario/pokepwa.git`)

**Opción B: GitLab**
1. Ve a https://gitlab.com/projects/new
2. Nombre: `pokepwa`
3. Visibility: Public o Private
4. ❌ **NO** marcar "Initialize with README"
5. Click **"Create project"**
6. Copiar la URL

**En tu terminal:**
```bash
# Agregar remote (reemplaza con TU URL)
git remote add origin https://github.com/tuusuario/pokepwa.git

# Push de main
git push -u origin main

# Push de develop
git push -u origin develop
```

---

### PASO 9: Conectar Repositorio a Jenkins

1. Volver a Jenkins → **Dashboard** → **pokepwa-pipeline**

2. Click **"Configure"** (lado izquierdo)

3. En **"Branch Sources"** → Click **"Add source"** → **"Git"**

4. Configurar:
   ```
   Project Repository: [TU URL DE GIT]
   
   Si es repositorio privado:
   Credentials: Click "Add" → "Jenkins"
     - Kind: Username with password
     - Username: tu_usuario_git
     - Password: tu_token_o_password
     - ID: git-credentials
   ```

5. Click **"Save"**

6. Jenkins automáticamente escaneará las ramas

---

### PASO 10: Verificar que Funcione

1. En Jenkins verás que detecta las ramas `main` y `develop`

2. Click en la rama **"develop"**

3. Deberías ver un build ejecutándose automáticamente

4. Si no, click **"Build Now"**

**Resultado esperado:**
- ✅ Install Dependencies
- ✅ Run Tests
- ✅ SonarQube Analysis
- ✅ Quality Gate
- ⏭️ Build (SKIPPED - rama develop)
- ⏭️ Deploy (SKIPPED - rama develop)

---

### PASO 11: Probar con Bug Intencional

```bash
# Editar el archivo de test
nano src/App.test.jsx

# Cambiar la línea:
# De: expect(1 + 1).toBe(2)
# A:  expect(1 + 1).toBe(3)

# Guardar y commitear
git add .
git commit -m "test: introduce intentional bug"
git push origin develop
```

**En Jenkins:**
- El pipeline debería FALLAR ❌ en el stage de Tests o Quality Gate

```bash
# Corregir el bug
# Cambiar de nuevo a: expect(1 + 1).toBe(2)

git add .
git commit -m "fix: resolve bug"
git push origin develop
```

**En Jenkins:**
- El pipeline debería PASAR ✅

---

## ✅ Configuración Completa

Si llegaste aquí, tienes:

- ✅ Jenkins configurado y corriendo
- ✅ SonarQube conectado
- ✅ Pipeline funcionando en `develop`
- ✅ Quality Gate validando el código
- ✅ Repositorio Git conectado

---

## 🔄 Próximos Pasos (Opcional - Vercel)

Si quieres configurar el despliegue a Vercel:

1. Sigue las instrucciones en `SETUP_ORDER.md` - Fase 6
2. Configura las credenciales de Vercel en Jenkins
3. Haz merge de `develop` a `main`
4. El pipeline desplegará automáticamente

---

## 🐛 Problemas Comunes

### "NodeJS not found"
- Verifica que el tool se llame exactamente `NodeJS` en **Tools**

### "SonarQube unreachable"
- Verifica que la URL sea `http://sonarqube:9000` (nombre del contenedor)

### "Quality Gate timeout"
- Espera 2-3 minutos, SonarQube puede tardar

### Pipeline no se ejecuta automáticamente
- Ir a `pokepwa-pipeline` → **"Scan Multibranch Pipeline Now"**

---

## 📞 Ayuda

Si tienes problemas, revisa:
- `TROUBLESHOOTING.md` - Soluciones detalladas
- Logs: `docker-compose logs -f jenkins`
- Jenkins logs: Dashboard → **Manage Jenkins** → **System Log**
