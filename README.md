# SOTRAP Frontend - Sistema de Gestión de Recaudos

Frontend SPA (Single Page Application) construido con React + Vite para el sistema de gestión de recaudos de Sotrapeñol.

## 🏗️ Arquitectura

- **Framework**: React 19.1
- **Build Tool**: Vite 7
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Estado Global**: Context API

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- Backend Django corriendo en `http://127.0.0.1:8000`

## 🚀 Instalación y Configuración

### 1. Instalar dependencias

```powershell
cd C:\DEV\sotrap-frontend
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env`:

```powershell
copy .env.example .env
```

Editar `.env` si es necesario:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

### 3. Ejecutar en modo desarrollo

```powershell
npm run dev
```

El frontend estará disponible en: `http://localhost:5173/`

### 4. Build para producción

```powershell
npm run build
npm run preview
```

## 📁 Estructura del Proyecto

```
sotrap-frontend/
├── public/                    # Archivos estáticos
├── src/
│   ├── components/           # Componentes reutilizables
│   │   ├── common/          # Componentes comunes (ProtectedRoute, etc.)
│   │   ├── vehiculos/       # Componentes del módulo Vehículos
│   │   ├── cobros/          # Componentes del módulo Cobros
│   │   ├── contabilidad/    # Componentes del módulo Contabilidad
│   │   └── reportes/        # Componentes de Reportes
│   ├── pages/               # Páginas principales
│   │   ├── Login.jsx        # Página de inicio de sesión
│   │   └── Dashboard.jsx    # Panel principal
│   ├── services/            # Servicios de API
│   │   ├── api.js           # Configuración Axios + interceptores JWT
│   │   ├── authService.js   # Servicio de autenticación
│   │   └── vehiculosService.js # Servicio de vehículos
│   ├── context/             # Context API
│   │   └── AuthContext.jsx  # Contexto de autenticación
│   ├── hooks/               # Custom hooks
│   │   └── useDebounce.js   # Hook para debounce en búsquedas
│   ├── utils/               # Utilidades
│   │   └── formatters.js    # Formateadores (moneda, fecha, placa)
│   ├── App.jsx              # Componente raíz con Router
│   └── main.jsx             # Punto de entrada
├── .env.example             # Plantilla de variables de entorno
├── package.json
├── vite.config.js
└── README.md
```

## 🎯 Características Implementadas

### ✅ Autenticación JWT
- Login con email y password
- Tokens almacenados en localStorage
- Refresh automático de tokens
- Rutas protegidas con ProtectedRoute

### ✅ Estructura Modular
- Componentes organizados por módulos funcionales
- Separación de responsabilidades (servicios, contextos, hooks)
- Arquitectura escalable y mantenible

### ✅ RF-002: Búsqueda de Vehículos
- Componente `VehicleSearch` siempre visible en el header
- Búsqueda con debounce (optimización)
- Búsqueda por placa en tiempo real

### ✅ UX/UI Optimizada (RNF-001)
- Interfaz limpia y minimalista
- Navegación intuitiva con sidebar
- Diseño responsive
- Reducción de clics según directrices

## 🔐 Autenticación

Para probar el login, primero crea un usuario en el backend:

```powershell
cd C:\DEV\sotrap-backend
python manage.py createsuperuser
```

Luego usa esas credenciales en el login del frontend.

## 📡 Comunicación con la API

Todos los servicios usan `apiClient` (Axios configurado) que:
- Agrega automáticamente el token JWT a las peticiones
- Maneja la renovación automática de tokens expirados
- Redirige al login si la autenticación falla

Ejemplo de uso:

```javascript
import { vehiculosService } from './services/vehiculosService';

// Buscar vehículo por placa
const vehiculo = await vehiculosService.buscarPorPlaca('ABC123');

// Obtener todos los vehículos
const vehiculos = await vehiculosService.getAll({ page: 1 });
```

## 🛠️ Scripts Disponibles

```powershell
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

## 🎨 Estilo y Diseño

- CSS modular (un archivo .css por componente)
- Colores principales: #667eea (morado) y gradientes
- Diseño responsive mobile-first
- Sin dependencias de UI libraries (vanilla CSS)

## 📝 Próximos Pasos

- [ ] Implementar módulo completo de Gestión de Vehículos
- [ ] Implementar módulo de Gestión de Cobros (RF-001, RF-003)
- [ ] Implementar módulo de Contabilidad y Egresos
- [ ] Implementar módulo de Reportes y Exportación
- [ ] Agregar validaciones de formularios
- [ ] Implementar manejo de errores global
- [ ] Agregar notificaciones/toast messages

## 🐛 Troubleshooting

### Error de CORS
Asegúrate que el backend Django tenga configurado CORS correctamente en `settings.py`:
```python
CORS_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
```

### Tokens no se guardan
Verifica que localStorage esté habilitado en el navegador.

### API no responde
Verifica que el backend Django esté corriendo en `http://127.0.0.1:8000`.

## 📚 Documentación de Referencia

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
