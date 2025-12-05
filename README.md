# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\lll


Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

# PokePWA - Progressive Web App con Pipeline DevOps

## 🚀 Características

- ✅ PWA completa con Service Workers
- ✅ Modo offline funcional (Cache First)
- ✅ Notificaciones push nativas
- ✅ Instalable en dispositivos
- ✅ Consumo de PokeAPI (30+ Pokemon)
- ✅ Pipeline CI/CD automatizado
- ✅ Análisis de código con SonarQube
- ✅ Despliegue headless a Vercel

## 📋 Prerrequisitos

- Docker & Docker Compose
- Node.js 18+
- Git
- Cuenta en Vercel (crear en https://vercel.com)

## 🏗️ Orden de Configuración

### Fase 1: Proyecto Local ✅
### Fase 2: Infraestructura Docker ✅
### Fase 3: SonarQube ✅
### Fase 4: Jenkins ⏳ (siguiente)
### Fase 5: Vercel ⏳ (al final)

---

## 1️⃣ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar tests
npm run test

# Build de producción
npm run build
```

## 2️⃣ Infraestructura Docker

```bash
# Levantar Jenkins y SonarQube
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps
```

Servicios disponibles:
- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000

## 3️⃣ Configuración de SonarQube

### ✅ Ya configurado
- Token: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
- Proyecto: `pokepwa`
- Quality Gate: `Strict Gate` (Bugs > 0, Vulnerabilities > 0)

## 4️⃣ Configuración de Jenkins

**📋 Guía detallada: [JENKINS_CONFIG.md](./JENKINS_CONFIG.md)**

### Paso 1: Desbloquear Jenkins

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### Paso 2: Instalar Plugins

- NodeJS Plugin
- SonarQube Scanner
- Pipeline
- Git

### Paso 3: Configurar Tools

1. **NodeJS**: Name=`NodeJS`, Version=18.x
2. **SonarQube Scanner**: Name=`SonarQubeScanner`

### Paso 4: Configurar SonarQube Server

- Name: `SonarQube`
- URL: `http://sonarqube:9000`
- Token: `sqp_6ee0fceba7c55a04a679cb5df9f76216a1a29b56`
- Credential ID: `sonarqube-token`

### Paso 5: Crear Pipeline Job (Sin Vercel aún)

1. **New Item** → `pokepwa-pipeline` → **Multibranch Pipeline**
2. Agregar repositorio Git
3. Build Configuration: `by Jenkinsfile`
4. **Save**

**⚠️ IMPORTANTE**: El pipeline funcionará en las ramas `develop` (sin deploy). Para `main` fallará hasta que configures Vercel.

## 5️⃣ Configuración de Vercel (Al Final)

### Cuando estés listo para desplegar:

#### Paso 1: Crear cuenta
```bash
# Ir a https://vercel.com/signup
# Registrarse con GitHub, GitLab o Email
```

#### Paso 2: Instalar Vercel CLI
```bash
npm install -g vercel
vercel login
```

#### Paso 3: Vincular proyecto (IMPORTANTE: Sin conectar Git)
```bash
cd /Users/blxckbxll/Documents/Proyectos/pokedex/pokepwa

# Vincular proyecto manualmente
vercel link

# Seleccionar opciones:
# ? Set up and deploy "~/path/to/pokepwa"? [Y/n] Y
# ? Which scope? [Tu cuenta/team]
# ? Link to existing project? [y/N] N
# ? What's your project's name? pokepwa
# ? In which directory is your code located? ./
```

#### Paso 4: Obtener IDs y Token
```bash
# Ver IDs del proyecto
cat .vercel/project.json

# Copiar orgId y projectId

# Obtener token de deploy
# Ir a: https://vercel.com/account/tokens
# Click "Create Token"
# Name: jenkins-deploy
# Scope: Full Account
# Copiar el token
```

#### Paso 5: Configurar en Jenkins

**Manage Jenkins** → **Credentials** → **Add**:
```
Kind: Secret text
Secret: [TOKEN DE VERCEL]
ID: vercel-token
```

**Manage Jenkins** → **System** → **Environment variables**:
```
VERCEL_ORG_ID: [orgId de .vercel/project.json]
VERCEL_PROJECT_ID: [projectId de .vercel/project.json]
```

## 🔄 Estrategia de Branching

### Rama `develop`
✅ Install dependencies  
✅ Run tests  
✅ SonarQube analysis  
✅ Quality Gate  
❌ NO DEPLOY

### Rama `main`
✅ Todos los pasos de develop  
✅ Build  
✅ Deploy a Vercel (requiere configuración previa)

## 🧪 Pruebas Antes de Configurar Vercel

### Test en develop (Funciona sin Vercel)

```bash
git checkout -b develop
git add .
git commit -m "feat: initial PWA implementation"
git push origin develop
```

**Resultado esperado:**
- ✅ Pipeline se ejecuta
- ✅ Tests pasan
- ✅ SonarQube analiza
- ✅ Quality Gate pasa
- ⏭️ Deploy se SALTA (rama develop)

### Test con bug intencional

```bash
# Editar src/App.test.jsx
# Cambiar: expect(1 + 1).toBe(2)
# Por: expect(1 + 1).toBe(3)

git add .
git commit -m "test: introduce bug"
git push origin develop
```

**Resultado esperado:**
- ❌ Pipeline FALLA en Tests o Quality Gate

## 📦 Scripts Disponibles

```bash
npm run dev      # Desarrollo local
npm run build    # Build de producción
npm run preview  # Preview del build
npm run test     # Ejecutar tests
npm run lint     # Análisis de código
```

## 🐛 Solución de Problemas

### Jenkins no encuentra Node.js
Verificar que Node.js esté configurado en **Manage Jenkins** → **Tools**

### SonarQube no conecta
Usar `http://sonarqube:9000` (nombre del contenedor, no localhost)

### Pipeline falla en Deploy (antes de configurar Vercel)
Es normal. La etapa de Deploy en `main` fallará hasta que configures Vercel.

## 📝 Checklist de Configuración

### ✅ Completado
- [x] Proyecto React PWA
- [x] Docker Compose (Jenkins + SonarQube)
- [x] SonarQube configurado
- [x] Token de SonarQube guardado

### ⏳ Pendiente
- [ ] Jenkins: Instalar plugins
- [ ] Jenkins: Configurar tools
- [ ] Jenkins: Conectar con SonarQube
- [ ] Jenkins: Crear pipeline job
- [ ] Git: Crear repositorio y push
- [ ] Vercel: Crear cuenta
- [ ] Vercel: Vincular proyecto
- [ ] Vercel: Configurar credenciales en Jenkins

## 📄 Archivos Importantes

- `Jenkinsfile` - Pipeline CI/CD
- `vite.config.js` - Configuración PWA
- `docker-compose.yml` - Infraestructura
- `sonar-project.properties` - Configuración SonarQube
- `.env.jenkins` - Credenciales (NO SUBIR A GIT)

## 🔗 URLs de Referencia

- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Tokens: https://vercel.com/account/tokens

## 📄 Licencia

MIT
