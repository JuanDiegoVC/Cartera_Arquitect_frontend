# 🚀 Guía Completa de CI/CD - SOTRAPEÑOL

## Sistema de Integración y Despliegue Continuo

---

## 📋 ÍNDICE

1. [Visión General](#1-visión-general)
2. [Arquitectura CI/CD](#2-arquitectura-cicd)
3. [Workflows de Firebase Hosting](#3-workflows-de-firebase-hosting)
4. [Configuración de Secretos en GitHub](#4-configuración-de-secretos-en-github)
5. [Flujo de Trabajo del Equipo](#5-flujo-de-trabajo-del-equipo)
6. [Integración Backend + Frontend](#6-integración-backend--frontend)
7. [Monitoreo y Troubleshooting](#7-monitoreo-y-troubleshooting)
8. [Mejores Prácticas](#8-mejores-prácticas)

---

## 1. VISIÓN GENERAL

### ¿Qué es CI/CD?

- **CI (Integración Continua)**: Automatiza la verificación del código cada vez que se hace push o pull request
- **CD (Despliegue Continuo)**: Automatiza el despliegue a producción cuando el código pasa todas las verificaciones

### Arquitectura del Proyecto SOTRAPEÑOL

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           SOTRAPEÑOL CI/CD                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  FRONTEND (React + Vite)              BACKEND (Django + PostgreSQL)        │
│  ├── Firebase Hosting                 ├── GCP Compute Engine               │
│  ├── Despliegue automático            ├── Docker + Nginx                   │
│  └── Preview en PRs                   └── GitHub Container Registry        │
│                                                                             │
│  ┌─────────────────┐                  ┌─────────────────┐                  │
│  │ GitHub Actions  │                  │ GitHub Actions  │                  │
│  │ + Firebase CLI  │                  │ + Docker        │                  │
│  └────────┬────────┘                  └────────┬────────┘                  │
│           │                                     │                          │
│           ▼                                     ▼                          │
│  ┌─────────────────┐                  ┌─────────────────┐                  │
│  │ Firebase        │◄────────────────►│ GCP VM          │                  │
│  │ Hosting         │   API Calls      │ (Backend API)   │                  │
│  └─────────────────┘                  └─────────────────┘                  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. ARQUITECTURA CI/CD

### 2.1 Frontend - Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND CI/CD PIPELINE                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Developer   │────►│  Pull        │────►│  GitHub      │────►│  Firebase    │
│  Push/PR     │     │  Request     │     │  Actions     │     │  Hosting     │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │
                            │                    ├── ESLint
                            │                    ├── npm audit
                            │                    ├── Build Test
                            │                    └── Deploy
                            │
                            ▼
                     ┌──────────────┐
                     │  Preview URL │ ◄── URL temporal para revisar cambios
                     │  (Firebase)  │
                     └──────────────┘
```

### 2.2 Backend - Flujo de Trabajo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BACKEND CI/CD PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Developer   │────►│  Push to     │────►│  GitHub      │────►│  GCP VM      │
│  Push        │     │  main/develop│     │  Actions     │     │  Docker      │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                │
                                                ├── Pytest (tests)
                                                ├── Black (formatting)
                                                ├── isort (imports)
                                                ├── Flake8 (linting)
                                                ├── Bandit (security)
                                                └── Docker Build
```

---

## 3. WORKFLOWS DE FIREBASE HOSTING

### 3.1 Archivos Generados por Firebase CLI

Al ejecutar `firebase init hosting` con GitHub Actions, se crean automáticamente estos archivos:

#### 📄 `.github/workflows/firebase-hosting-merge.yml`

```yaml
# Este workflow se ejecuta cuando hay un MERGE a main
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Construye la aplicación
      - run: npm run build
      
      # Despliega a Firebase Hosting (canal LIVE = producción)
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA }}
          channelId: live          # ⬅️ Producción
          projectId: sotrapenol-cartera
```

**¿Qué hace este workflow?**
1. Se activa automáticamente cuando hay push a `main`
2. Clona el repositorio
3. Ejecuta `npm run build` para compilar la aplicación
4. Despliega a Firebase Hosting en el canal `live` (producción)

#### 📄 `.github/workflows/firebase-hosting-pull-request.yml`

```yaml
# Este workflow se ejecuta en cada Pull Request
name: Deploy to Firebase Hosting on PR
on: pull_request
permissions:
  checks: write
  contents: read
  pull-requests: write
jobs:
  build_and_preview:
    if: ${{ github.event.pull_request.head.repo.full_name == github.repository }}
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      # Construye la aplicación
      - run: npm run build
      
      # Despliega a URL de preview temporal
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA }}
          projectId: sotrapenol-cartera
          # Sin channelId = crea preview automático
```

**¿Qué hace este workflow?**
1. Se activa en cada Pull Request
2. Compila la aplicación
3. Crea una **URL de preview única** para revisar los cambios
4. Comenta automáticamente en el PR con el link de preview

### 3.2 Entendiendo los Canales de Firebase

| Canal | Descripción | URL | Duración |
|-------|-------------|-----|----------|
| `live` | Producción | `https://sotrapenol-cartera.web.app` | Permanente |
| Preview | Temporal para PRs | `https://sotrapenol-cartera--pr123-xyz.web.app` | 7 días |

---

## 4. CONFIGURACIÓN DE SECRETOS EN GITHUB

### 4.1 Secretos Necesarios para Firebase

Firebase CLI configura automáticamente el secreto `FIREBASE_SERVICE_ACCOUNT_*`. Para verificar o reconfigurar:

1. **Ir a GitHub** → Tu repositorio → **Settings**
2. **Secrets and variables** → **Actions**
3. Verificar que existe: `FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA`

### 4.2 Crear el Service Account de Firebase (si es necesario)

```bash
# En tu máquina local con Firebase CLI
firebase login:ci

# Esto generará un token que debes agregar como secreto en GitHub
```

**O desde la consola de Firebase:**

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto (`sotrapenol-cartera`)
3. **Configuración del proyecto** → **Cuentas de servicio**
4. **Generar nueva clave privada**
5. Descarga el JSON y agrégalo como secreto en GitHub

### 4.3 Agregar Secreto en GitHub

1. **Settings** → **Secrets and variables** → **Actions**
2. Click en **New repository secret**
3. **Name**: `FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA`
4. **Value**: Pega todo el contenido del JSON descargado
5. Click **Add secret**

### 4.4 Lista Completa de Secretos Recomendados

#### Frontend (`sotrap-frontend`)

| Secreto | Descripción | Requerido |
|---------|-------------|-----------|
| `FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA` | Service account de Firebase | ✅ Sí |
| `VITE_API_URL` | URL del API de producción | ✅ Sí |
| `VITE_API_URL_DEV` | URL del API de desarrollo | Opcional |

#### Backend (`sotrap-backend`)

| Secreto | Descripción | Requerido |
|---------|-------------|-----------|
| `DEPLOY_KEY_PROD` | Clave SSH para servidor producción | ✅ Sí |
| `DEPLOY_HOST_PROD` | IP/hostname del servidor | ✅ Sí |
| `DEPLOY_USER_PROD` | Usuario SSH | ✅ Sí |
| `SECRET_KEY` | Django secret key | ✅ Sí |
| `DB_PASSWORD` | Password de la base de datos | ✅ Sí |

---

## 5. FLUJO DE TRABAJO DEL EQUIPO

### 5.1 Flujo Git Recomendado (GitFlow Simplificado)

```
main ─────────●───────────────●───────────────●──────► Producción
              │               │               │
              │  merge PR     │  merge PR     │
              │               │               │
develop ──●───┴───●───●───●───┴───●───●───●───┴───●──► Desarrollo
          │       │   │   │       │   │   │       │
          │       │   │   │       │   │   │       │
feature/  ●───────┘   │   │       │   │   │       │
login               ●─┘   │       │   │   │       │
                        ●─┘       │   │   │       │
                                  │   │   │       │
feature/                          ●───┘   │       │
dashboard                               ●─┘       │
                                                  │
hotfix/                                           ●
bug-fix
```

### 5.2 Proceso Paso a Paso

#### Para Nuevas Características

```bash
# 1. Crear rama desde develop
git checkout develop
git pull origin develop
git checkout -b feature/nueva-caracteristica

# 2. Desarrollar y hacer commits
git add .
git commit -m "feat: agregar nueva característica"

# 3. Push a GitHub
git push origin feature/nueva-caracteristica

# 4. Crear Pull Request en GitHub
#    - Base: develop
#    - Compare: feature/nueva-caracteristica

# 5. El CI se ejecuta automáticamente
#    - Si frontend: Firebase crea preview URL
#    - Revisar cambios en la URL de preview

# 6. Code review y aprobar PR

# 7. Merge a develop (CI/CD automático)
```

#### Para Desplegar a Producción

```bash
# 1. Crear PR desde develop a main
#    - Base: main
#    - Compare: develop

# 2. Revisar cambios acumulados

# 3. Aprobar y merge

# 4. CI/CD despliega automáticamente a:
#    - Frontend: Firebase Hosting (live)
#    - Backend: GCP VM (producción)
```

### 5.3 Convención de Commits

```bash
# Tipos de commits recomendados:
feat:     # Nueva característica
fix:      # Corrección de bug
docs:     # Cambios en documentación
style:    # Formateo, sin cambios de código
refactor: # Refactorización de código
test:     # Agregar o modificar tests
chore:    # Tareas de mantenimiento

# Ejemplos:
git commit -m "feat: agregar filtro por fecha en reportes"
git commit -m "fix: corregir cálculo de totales en dashboard"
git commit -m "docs: actualizar guía de despliegue"
```

---

## 6. INTEGRACIÓN BACKEND + FRONTEND

### 6.1 Variables de Entorno por Ambiente

#### Frontend (`.env.production`)

```env
VITE_API_URL=https://api.tudominio.com/api
```

#### Backend (`.env` en servidor)

```env
CORS_ALLOWED_ORIGINS=https://sotrapenol-cartera.web.app,https://tudominio.com
ALLOWED_HOSTS=api.tudominio.com
```

### 6.2 Sincronización de Despliegues

Para evitar problemas de incompatibilidad entre frontend y backend:

1. **Backend primero**: Despliega cambios de API que sean retrocompatibles
2. **Frontend después**: Despliega el frontend que use la nueva API
3. **Limpieza**: Elimina código deprecated del backend

### 6.3 Workflow Mejorado con Variables de Entorno

Actualiza tu `firebase-hosting-merge.yml` para incluir la URL del API:

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main
jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with production API
        run: npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA }}
          channelId: live
          projectId: sotrapenol-cartera
```

---

## 7. MONITOREO Y TROUBLESHOOTING

### 7.1 Ver Estado de los Workflows

1. Ir a tu repositorio en GitHub
2. Click en **Actions**
3. Ver lista de workflows ejecutados
4. Click en un workflow para ver detalles

### 7.2 Problemas Comunes

#### ❌ Error: "npm run build" falla

```bash
# Verificar localmente
npm ci
npm run build

# Si hay errores de dependencias
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### ❌ Error: "Firebase service account" inválido

1. Regenerar service account en Firebase Console
2. Actualizar secreto en GitHub
3. Re-ejecutar workflow

#### ❌ Error: "Permission denied" en PR preview

Verificar que el workflow de PR tenga los permisos correctos:

```yaml
permissions:
  checks: write
  contents: read
  pull-requests: write
```

### 7.3 Logs y Debugging

```bash
# Ver logs de Firebase
firebase hosting:channel:list

# Ver despliegues anteriores
firebase hosting:releases:list

# Rollback a versión anterior (si es necesario)
firebase hosting:rollback
```

---

## 8. MEJORES PRÁCTICAS

### 8.1 Seguridad

- ✅ **Nunca** commitear secretos o claves
- ✅ Usar variables de entorno para configuración sensible
- ✅ Rotar claves periódicamente
- ✅ Limitar permisos de service accounts

### 8.2 Performance

- ✅ Usar cache de npm en workflows
- ✅ Builds incrementales cuando sea posible
- ✅ Limpiar artefactos antiguos

### 8.3 Calidad de Código

- ✅ Requerir code review antes de merge a main
- ✅ Ejecutar tests antes de desplegar
- ✅ Usar linting automático

### 8.4 Configuración Recomendada de Rama

En GitHub → Settings → Branches → Add rule:

**Para `main`:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Include administrators

**Para `develop`:**
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging

---

## 📊 RESUMEN DE ARCHIVOS Y SUS FUNCIONES

| Archivo | Trigger | Función |
|---------|---------|---------|
| `firebase-hosting-merge.yml` | Push a `main` | Despliega a producción |
| `firebase-hosting-pull-request.yml` | Pull Request | Crea URL de preview |
| `ci.yml` | Push/PR a `develop`/`main` | Tests y linting |
| `cd-main.yml` | Push a `main` | Build Docker + Deploy |
| `cd-develop.yml` | Push a `develop` | Build Docker + Deploy dev |

---

## 🔗 RECURSOS ADICIONALES

- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Firebase GitHub Action](https://github.com/FirebaseExtended/action-hosting-deploy)

---

**Documento creado:** 2025-12-01  
**Versión:** 1.0  
**Última actualización:** 2025-12-01
