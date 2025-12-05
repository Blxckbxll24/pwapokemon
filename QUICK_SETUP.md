# 🚀 Guía Rápida de Configuración

## Checklist de Configuración

### ✅ SonarQube (http://localhost:9000)

- [ ] Login: admin/admin
- [ ] Cambiar contraseña
- [ ] Crear proyecto `pokepwa`
- [ ] Generar token (guardar como `squ_xxxxx`)
- [ ] Crear Quality Gate `Strict Gate`:
  - [ ] Bugs > 0 = FAIL
  - [ ] Vulnerabilities > 0 = FAIL
  - [ ] Coverage < 50% = FAIL
- [ ] Asignar Quality Gate al proyecto

### ✅ Jenkins (http://localhost:8080)

#### Plugins
- [ ] NodeJS Plugin
- [ ] SonarQube Scanner
- [ ] Pipeline
- [ ] Git

#### Tools (Manage Jenkins → Tools)
- [ ] NodeJS: Name=`NodeJS`, Version=18.x
- [ ] SonarQube Scanner: Name=`SonarQubeScanner`

#### System (Manage Jenkins → System)
- [ ] SonarQube Server:
  - Name: `SonarQube`
  - URL: `http://sonarqube:9000`
  - Token: `sonarqube-token` (secret text)

#### Credentials
- [ ] `sonarqube-token` (Secret text del token de SonarQube)
- [ ] `vercel-token` (Secret text del token de Vercel)

#### Environment Variables
- [ ] `VERCEL_ORG_ID`
- [ ] `VERCEL_PROJECT_ID`

#### Pipeline Job
- [ ] Crear Multibranch Pipeline
- [ ] Configurar repo Git
- [ ] Jenkinsfile en la raíz

### ✅ Vercel

```bash
# Instalar CLI
npm install -g vercel

# Login
vercel login

# Obtener token en: https://vercel.com/account/tokens

# En tu proyecto
vercel link

# Copiar IDs
cat .vercel/project.json
```

## 🎯 Verificación Final

### 1. Test de Conectividad

```bash
# Desde Jenkins
curl http://sonarqube:9000/api/system/status
# Debe retornar: {"status":"UP"}
```

### 2. Test de Pipeline en develop

```bash
git checkout develop
git push origin develop
# Ver en Jenkins que ejecuta pero NO despliega
```

### 3. Test de Pipeline en main

```bash
git checkout main
git merge develop
git push origin main
# Ver en Jenkins que ejecuta Y despliega
```

## 📋 Comandos Útiles

```bash
# Docker
docker-compose ps              # Ver estado
docker-compose logs -f         # Ver todos los logs
docker-compose restart         # Reiniciar servicios

# Jenkins
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# SonarQube
docker-compose logs -f sonarqube

# Vercel
vercel --version
vercel whoami
vercel ls
```

## ⚠️ Errores Comunes

| Error | Solución |
|-------|----------|
| SonarQube no conecta | Usar `http://sonarqube:9000` no `localhost` |
| Quality Gate no falla | Verificar que esté asignado al proyecto |
| Deploy no funciona | Verificar token y IDs de Vercel |
| Tests fallan en Jenkins | Instalar dependencias con `npm install` |

## 🔗 URLs de Referencia

- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Tokens: https://vercel.com/account/tokens
