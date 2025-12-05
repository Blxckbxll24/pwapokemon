# 🔧 Solución de Problemas

## Pipeline no se ejecuta automáticamente

### Problema
Hiciste push a `develop` pero Jenkins no ejecuta el pipeline.

### Soluciones

#### 1. Verificar que el Pipeline Job esté configurado correctamente

```bash
# Ir a Jenkins → pokepwa-pipeline → Configure
```

Verificar:
- [ ] **Branch Sources** tiene el repositorio Git correcto
- [ ] **Build Configuration** → Mode: `by Jenkinsfile`
- [ ] **Scan Multibranch Pipeline Triggers** está habilitado

#### 2. Forzar escaneo manual

En Jenkins:
1. Ir a `pokepwa-pipeline`
2. Click en **"Scan Multibranch Pipeline Now"**
3. Esperar a que detecte las ramas

#### 3. Verificar logs de escaneo

```bash
# En Jenkins
pokepwa-pipeline → "Scan Multibranch Pipeline Log"
```

Buscar errores como:
- "No se puede conectar al repositorio"
- "Credenciales inválidas"
- "No se encontró Jenkinsfile"

---

## Error: "tool 'NodeJS' does not exist"

### Causa
El tool NodeJS no está configurado o el nombre no coincide.

### Solución

1. **Manage Jenkins** → **Tools** → **NodeJS installations**
2. Verificar que exista uno con nombre exacto: `NodeJS`
3. Si no existe, crearlo:
   - Name: `NodeJS` (exactamente así)
   - Version: NodeJS 18.x o superior
   - ✅ Install automatically

---

## Error: "tool 'SonarQubeScanner' does not exist"

### Causa
El tool SonarQube Scanner no está configurado.

### Solución

1. **Manage Jenkins** → **Tools** → **SonarQube Scanner installations**
2. Crear uno:
   - Name: `SonarQubeScanner` (exactamente así)
   - ✅ Install automatically
   - Version: Última disponible

---

## Error: "withSonarQubeល: SonarQube 'SonarQube' not found"

### Causa
El servidor SonarQube no está configurado en Jenkins.

### Solución

1. **Manage Jenkins** → **System** → **SonarQube servers**
2. Verificar que exista uno con:
   - Name: `SonarQube` (exactamente así)
   - Server URL: `http://sonarqube:9000`
   - Server authentication token: `sonarqube-token`

3. Si no existe, agregarlo:
   - Click **"Add SonarQube"**
   - Configurar como se indica arriba
   - Crear el credential `sonarqube-token` con el token de SonarQube

---

## Quality Gate no falla cuando debería

### Causa
El Quality Gate no está correctamente asignado al proyecto.

### Solución

1. Ir a SonarQube → **Projects** → `pokepwa`
2. **Project Settings** → **Quality Gate**
3. Seleccionar `Strict Gate`
4. Verificar que el Quality Gate tenga las condiciones:
   - Bugs > 0 = FAIL
   - Vulnerabilities > 0 = FAIL

---

## Pipeline se ejecuta pero todos los stages fallan

### Problema
