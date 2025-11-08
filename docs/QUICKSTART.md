# 📋 SETUP INICIAL - CI/CD SOTRAP FRONTEND

Este documento te guía paso a paso para configurar los pipelines de CI/CD del frontend.

## 🎯 Tabla de Contenidos

1. [Requisitos previos](#requisitos-previos)
2. [Configurar GitHub Secrets](#configurar-github-secrets)
3. [Probar CI](#probar-ci)
4. [Probar CD](#probar-cd)
5. [Configurar Branch Protection](#configurar-branch-protection)
6. [Verificación final](#verificación-final)

## ✅ Requisitos Previos

- [ ] Acceso a repositorio en GitHub
- [ ] Permisos para configurar Secrets
- [ ] Claves SSH generadas para despliegue
- [ ] Servidores de desarrollo y producción disponibles
- [ ] Nginx u otro web server configurado

## 🔐 Configurar GitHub Secrets

### Paso 1: Acceder a Secrets

**Frontend (sotrap-frontend)**:
1. Ve a: https://github.com/JuanSNuno/sotrap-frontend/settings/secrets/actions
2. Haz clic en "New repository secret"

### Paso 2: Agregar Secretos de API URLs

```
Name: VITE_API_URL_DEV
Value: http://localhost:8000/api
(O tu URL de desarrollo)

Name: VITE_API_URL_PROD
Value: https://api.example.com/api
(Tu URL de producción)
```

### Paso 3: Agregar Secretos de Despliegue Desarrollo

```
Name: DEPLOY_KEY_DEV
Value: [contenido de clave privada SSH]

Name: DEPLOY_HOST_DEV
Value: dev-frontend.example.com

Name: DEPLOY_USER_DEV
Value: deploy
```

### Paso 4: Agregar Secretos de Despliegue Producción

```
Name: DEPLOY_KEY_PROD
Value: [contenido de clave privada SSH]

Name: DEPLOY_HOST_PROD
Value: frontend.example.com

Name: DEPLOY_USER_PROD
Value: deploy
```

### Paso 5: Verificar Secretos Configurados

```bash
gh secret list -R JuanSNuno/sotrap-frontend
```

Deberías ver:
- DEPLOY_HOST_DEV
- DEPLOY_HOST_PROD
- DEPLOY_KEY_DEV
- DEPLOY_KEY_PROD
- DEPLOY_USER_DEV
- DEPLOY_USER_PROD
- VITE_API_URL_DEV
- VITE_API_URL_PROD

## ✅ Probar CI

### Frontend CI Test

```bash
# 1. Clonar repositorio
git clone https://github.com/JuanSNuno/sotrap-frontend.git
cd sotrap-frontend

# 2. Cambiar a rama develop
git checkout develop

# 3. Crear un commit vacío para activar pipeline
git commit --allow-empty -m "Test CI Pipeline"

# 4. Push a develop
git push origin develop

# 5. Ver progreso
# Ve a: https://github.com/JuanSNuno/sotrap-frontend/actions
# Busca "Frontend CI" y observa los pasos
```

**Verificación exitosa**:
- ✅ Setup Node.js 18.x
- ✅ Setup Node.js 20.x
- ✅ Install dependencies
- ✅ ESLint check passed
- ✅ Build successful
- ✅ npm audit completed
- ✅ Artifacts uploaded

**Posibles problemas**:

| Problema | Solución |
|----------|----------|
| `npm ERR! 404 Not Found` | Verifica package.json, pueden faltar dependencias |
| `ESLint errors` | Ejecuta `npm run lint -- --fix` localmente |
| `Build failed` | Revisa variables de entorno en logs |

## 🚀 Probar CD

### Frontend CD Test (Desarrollo)

**Requisitos previos**:
- [ ] Servidor de desarrollo configurado
- [ ] Docker instalado en servidor
- [ ] Usuario SSH setup en servidor
- [ ] `DEPLOY_KEY_DEV` configurado en GitHub
- [ ] `VITE_API_URL_DEV` configurado

**Procedimiento**:

```bash
# El CD se dispara automáticamente cuando haces push a develop
# después de que pasó CI

# 1. Después de CI exitoso, ve a Actions
# https://github.com/JuanSNuno/sotrap-frontend/actions

# 2. Busca "Frontend CD - Development"

# 3. Observa estos pasos:
#    - Setup Node.js
#    - Install dependencies
#    - ESLint check
#    - Build application
#    - Setup Docker Buildx
#    - Docker image built and pushed
#    - Deployment to dev completed
```

**Troubleshooting**:

| Problema | Solución |
|----------|----------|
| Docker build falla | Verifica Dockerfile y dependencias |
| Deploy SSH falla | Verifica DEPLOY_KEY_DEV válida y host accesible |
| API connection error | Verifica VITE_API_URL_DEV correcta en secrets |

## 🛡️ Configurar Branch Protection

Para evitar merges sin testing, configura protección:

1. Ve a: https://github.com/JuanSNuno/sotrap-frontend/settings/branches
2. Haz clic en "Add rule"
3. Pattern: `main`
4. Configura:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Selecciona: `Frontend CI`
   - ✅ Require branches to be up to date
5. Haz clic en "Create"

Opcional: Repite para rama `develop` si lo deseas.

## ✅ Verificación Final

### Checklist de Configuración

- [ ] VITE_API_URL_DEV configurado
- [ ] VITE_API_URL_PROD configurado
- [ ] DEPLOY_KEY_DEV configurado
- [ ] DEPLOY_HOST_DEV configurado
- [ ] DEPLOY_USER_DEV configurado
- [ ] DEPLOY_KEY_PROD configurado
- [ ] DEPLOY_HOST_PROD configurado
- [ ] DEPLOY_USER_PROD configurado
- [ ] Frontend CI pasa exitosamente
- [ ] Frontend CD despliega exitosamente (dev)
- [ ] Branch protection configurada en `main`

### Test Completo

```bash
# 1. Crear rama feature
git checkout -b feature/test-setup develop

# 2. Hacer cambio mínimo
echo "// test" >> src/App.jsx

# 3. Commit
git add .
git commit -m "test: verify CI/CD pipeline"

# 4. Push
git push origin feature/test-setup

# 5. Crear Pull Request
# https://github.com/JuanSNuno/sotrap-frontend/compare/develop...feature/test-setup

# 6. Observar CI
# Frontend CI debe ejecutarse automáticamente

# 7. Si todo pasa, hacer merge
git checkout develop
git pull
git merge feature/test-setup
git push origin develop

# 8. Observar CD
# Frontend CD - Development debe ejecutarse automáticamente
```

## 📊 Monitoreo en Tiempo Real

Ver estado de deployments:

```bash
# Ver último run de CI
gh run list -R JuanSNuno/sotrap-frontend -w "Frontend CI" --limit 1

# Ver logs de último run
gh run view -R JuanSNuno/sotrap-frontend [run-id] --log

# Ver todos los runs
gh run list -R JuanSNuno/sotrap-frontend
```

## 🔄 Variables de Entorno

Las siguientes variables están disponibles en el build:

```bash
# En CI/CD
NODE_ENV=production  # Frontend CD
VITE_API_URL=${{ secrets.VITE_API_URL_DEV }}  # o PROD
CI=true

# Build output
dist/
```

## 🚀 Despliegue Manual (Si es necesario)

Si necesitas desplegar manualmente sin push:

```bash
# Backend debe tener endpoint sano
curl https://api.example.com/health/

# Luego puedes ejecutar manualmente en Actions
# Ve a: Actions → Frontend CD - Production
# Haz clic en "Run workflow" → "Run workflow"
```

## 📚 Próximos Pasos

### 1. Validar Construcción Local

```bash
npm install
npm run lint
npm run build
```

### 2. Probar Localmente

```bash
npm run dev
# Visita http://localhost:5173
```

### 3. Agregar Más Tests

Crea tests en:
- `src/components/__tests__/`
- `src/pages/__tests__/`

### 4. Configurar SonarQube (Opcional)

Para análisis de código más detallado:

```yaml
# Agregar a .github/workflows/ci.yml
- name: SonarQube Scan
  uses: sonarsource/sonarcloud-github-action@master
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

## 🆘 Troubleshooting

### "npm ERR! 404"

```
Causa: Dependencia faltante o typo en package.json
Solución:
1. Revisa package.json
2. npm install localmente
3. Revisa logs en GitHub Actions
```

### "ESLint errors found"

```
Solución:
npm run lint -- --fix
git add .
git commit -m "fix: linting issues"
git push
```

### "Build failed"

```
Solución:
1. npm run build localmente
2. Revisa errores
3. Verifica variables de entorno
4. Revisa logs en Actions
```

### "Cannot connect to API"

```
Causa: VITE_API_URL incorreta
Solución:
1. Ve a Settings → Secrets
2. Verifica VITE_API_URL_DEV/PROD
3. Verifica que API esté corriendo
4. Verifica CORS en backend
```

## 📞 Contacto

Para más ayuda:
- GitHub Actions Docs: https://docs.github.com/en/actions
- Vite Docs: https://vitejs.dev/
- Docker Docs: https://docs.docker.com/

---

**Última actualización**: Noviembre 2025
**Status**: ✅ Setup Completado
