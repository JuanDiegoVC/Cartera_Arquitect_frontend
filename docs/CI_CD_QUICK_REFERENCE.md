# 📋 QUICK REFERENCE - CI/CD SOTRAPEÑOL

## 🚀 Comandos Rápidos

### Desarrollo Local

```bash
# Frontend
cd sotrap-frontend
npm install
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # Verificar código

# Backend
cd sotrap-backend
pip install -r requirements.txt
python manage.py runserver
```

### Git Flow

```bash
# Nueva característica
git checkout develop
git pull origin develop
git checkout -b feature/mi-feature
# ... hacer cambios ...
git add .
git commit -m "feat: descripción"
git push origin feature/mi-feature
# Crear PR en GitHub: develop ← feature/mi-feature

# Hotfix urgente
git checkout main
git pull origin main
git checkout -b hotfix/fix-urgente
# ... hacer fix ...
git push origin hotfix/fix-urgente
# Crear PR en GitHub: main ← hotfix/fix-urgente
```

---

## 🔥 Flujo de Despliegue

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  feature/*   │────►│   develop    │────►│    main      │
│              │ PR  │              │ PR  │              │
└──────────────┘     └──────────────┘     └──────────────┘
       │                    │                    │
       │                    │                    ▼
       │                    │           ┌──────────────┐
       │                    │           │  PRODUCCIÓN  │
       │                    │           │  Firebase    │
       │                    │           │  Hosting     │
       │                    │           └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐     ┌──────────────┐
│  CI: Tests   │     │  CI: Tests   │
│  + Preview   │     │  + Preview   │
└──────────────┘     └──────────────┘
```

---

## 📊 Verificar Estado

### GitHub Actions
1. Ir a: `github.com/tu-usuario/tu-repo`
2. Click en pestaña **Actions**
3. Ver workflows en ejecución

### Firebase Hosting
```bash
# Ver despliegues
firebase hosting:releases:list

# Ver canales de preview
firebase hosting:channel:list
```

---

## 🔐 Secretos Necesarios (GitHub)

### Frontend (`sotrap-frontend`)
| Secreto | Descripción |
|---------|-------------|
| `FIREBASE_SERVICE_ACCOUNT_SOTRAPENOL_CARTERA` | ✅ Auto-configurado |
| `VITE_API_URL_PROD` | URL del API de producción |

### Backend (`sotrap-backend`)
| Secreto | Descripción |
|---------|-------------|
| `DEPLOY_KEY_PROD` | Clave SSH servidor |
| `DEPLOY_HOST_PROD` | IP del servidor |
| `DEPLOY_USER_PROD` | Usuario SSH |

---

## 🆘 Troubleshooting

### Build falla
```bash
# Limpiar y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Preview no aparece
- Verificar que el PR sea del mismo repo (no fork)
- Revisar logs en GitHub Actions
- Verificar secreto de Firebase

### Rollback urgente
```bash
firebase hosting:rollback
```

---

## 📱 URLs del Proyecto

| Ambiente | URL |
|----------|-----|
| **Producción** | https://sotrapenol-cartera.web.app |
| **API Prod** | https://api.tudominio.com |
| **Preview** | Se genera automáticamente en cada PR |

---

**Versión:** 1.0 | **Actualizado:** 2025-12-01
