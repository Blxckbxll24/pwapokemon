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

### 1️⃣ Configurar SonarQube Server

**Manage Jenkins** → **System** → **SonarQube servers**

1. ✅ Marcar: **"Environment variables"**
2. Click **"Add SonarQube"**
3. Configurar:
   