# 📱 Guía de Diseño Responsive - SOTRAP

## 🎯 Principio Mobile-First

Todo el sistema está diseñado siguiendo el principio **Mobile-First**, lo que significa que primero se diseña para móvil y luego se expande para pantallas más grandes.

## 📐 Breakpoints de Tailwind CSS

El proyecto usa los breakpoints estándar de Tailwind:

- `sm`: 640px (tablets pequeñas en portrait)
- `md`: 768px (tablets en portrait)
- `lg`: 1024px (tablets en landscape, laptops pequeñas)
- `xl`: 1280px (laptops y desktops)
- `2xl`: 1536px (pantallas grandes)

## ✅ Componentes Actualizados con Responsive

### 1. ProtectedRoute (`components/common/ProtectedRoute.jsx`)

**Características responsive:**

- Padding adaptable: `p-4` en móvil
- Ancho máximo: `max-w-md` con `mx-auto`
- Títulos: `text-xl sm:text-2xl`
- Textos: `text-sm sm:text-base`
- Layout flexible para info de roles: `flex-col sm:flex-row`

**Cómo usarlo:**

```jsx
<ProtectedRoute allowedRoles={["administrador"]}>
  <Configuracion />
</ProtectedRoute>
```

### 2. AppHeader (`components/Layout/AppHeader.jsx`)

**Características responsive:**

- Altura adaptable: `h-14 sm:h-16`
- Padding: `px-3 sm:px-6`
- Búsqueda oculta en móvil: `hidden sm:block`
- Avatar más pequeño en móvil: `w-9 h-9 sm:w-10 sm:h-10`
- Info de usuario oculta hasta `lg`: `hidden lg:block`
- Botón de búsqueda móvil solo visible en `sm:hidden`

### 3. AppLayout (`components/Layout/AppLayout.jsx`)

**Características responsive:**

- Padding del main adaptable: `p-3 sm:p-4 md:p-6`
- Previene overflow horizontal: `overflow-x-hidden`
- Contenedor con ancho máximo: `max-w-full`
- Layout flexible: `min-w-0` para prevenir overflow

### 4. AppSidebar (`components/Layout/AppSidebar.jsx`)

**Características responsive:**

- Colapsable automáticamente en móvil (via SidebarProvider)
- Badge de rol con espaciado adaptable
- Información de usuario condensada cuando está colapsado

### 5. Login (`pages/Login.jsx`)

**Ya implementado correctamente:**

- Padding: `p-4`
- Ancho máximo: `max-w-md`
- Inputs más grandes: `h-11`
- Gradiente de fondo responsive

## 🎨 Mejores Prácticas de CSS Responsive

### Espaciado Adaptable

```jsx
// ✅ CORRECTO - Adaptable
<div className="p-3 sm:p-4 md:p-6">

// ❌ INCORRECTO - Fijo
<div className="p-6">
```

### Tipografía Responsive

```jsx
// ✅ CORRECTO
<h1 className="text-xl sm:text-2xl md:text-3xl">

// ❌ INCORRECTO
<h1 className="text-3xl">
```

### Ocultar/Mostrar Elementos

```jsx
// Ocultar en móvil, mostrar en tablet+
<div className="hidden sm:block">

// Mostrar solo en móvil
<div className="sm:hidden">

// Mostrar diferente contenido según pantalla
<div className="sm:hidden">Versión móvil</div>
<div className="hidden sm:block">Versión desktop</div>
```

### Layouts Flexibles

```jsx
// Columna en móvil, fila en desktop
<div className="flex flex-col sm:flex-row gap-4">

// Grid adaptable
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
```

### Anchos Responsivos

```jsx
// ✅ CORRECTO - Ancho completo en móvil, limitado en desktop
<div className="w-full max-w-md mx-auto">

// ✅ CORRECTO - Crece con el contenedor
<div className="w-full sm:w-auto">
```

## 📋 Checklist para Nuevos Componentes

Antes de crear un componente nuevo, verifica:

- [ ] ¿El padding se adapta según el tamaño de pantalla?
- [ ] ¿Los textos son legibles en móvil? (mínimo 14px/0.875rem)
- [ ] ¿Los botones tienen área táctil suficiente? (mínimo 44x44px)
- [ ] ¿Las imágenes/iconos escalan correctamente?
- [ ] ¿Los inputs tienen altura adecuada para móvil? (mínimo h-10)
- [ ] ¿El contenido se desborda horizontalmente?
- [ ] ¿Los modales/overlays se ven bien en pantallas pequeñas?
- [ ] ¿Las tablas son scrolleables o se adaptan?

## 🧪 Cómo Probar Responsive

### En el Navegador (Chrome DevTools)

1. Presiona `F12` o `Ctrl + Shift + I`
2. Click en el icono de móvil (Toggle Device Toolbar) o `Ctrl + Shift + M`
3. Selecciona diferentes dispositivos:
   - iPhone SE (375px)
   - iPhone 12 Pro (390px)
   - iPad (768px)
   - Desktop (1920px)
4. Prueba en orientación portrait y landscape

### Dispositivos Reales

Prueba en al menos:

- 📱 Teléfono pequeño (320-375px)
- 📱 Teléfono grande (390-428px)
- 📱 Tablet (768-1024px)
- 💻 Desktop (1280px+)

## 🎯 Patrones Específicos del Proyecto

### Cards/Tarjetas

```jsx
<Card className="w-full max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-6">
  <CardHeader className="space-y-2">
    <CardTitle className="text-lg sm:text-xl">Título</CardTitle>
  </CardHeader>
</Card>
```

### Formularios

```jsx
<form className="space-y-4 sm:space-y-6">
  <Input
    className="h-10 sm:h-11 text-sm sm:text-base"
    placeholder="Placeholder corto"
  />
  <Button className="w-full sm:w-auto px-8 h-10 sm:h-11">Enviar</Button>
</form>
```

### Tablas

```jsx
// Wrapper con scroll horizontal en móvil
<div className="overflow-x-auto -mx-3 sm:mx-0">
  <table className="min-w-full">
    <thead className="text-xs sm:text-sm">{/* ... */}</thead>
    <tbody className="text-sm">{/* ... */}</tbody>
  </table>
</div>
```

### Botones de Acción

```jsx
// Grupo de botones responsive
<div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
  <Button className="w-full sm:w-auto">Acción Principal</Button>
  <Button variant="outline" className="w-full sm:w-auto">
    Acción Secundaria
  </Button>
</div>
```

## 🚨 Errores Comunes a Evitar

### ❌ NO hacer:

```jsx
// Texto muy pequeño en móvil
<p className="text-xs">

// Botón con área táctil insuficiente
<button className="p-1">

// Ancho fijo que rompe en móvil
<div className="w-96">

// Mucho padding en móvil
<div className="p-8">

// Overflow sin control
<div className="whitespace-nowrap">
```

### ✅ SÍ hacer:

```jsx
// Texto legible
<p className="text-sm sm:text-base">

// Área táctil adecuada
<button className="p-3 sm:p-2">

// Ancho responsivo
<div className="w-full max-w-md">

// Padding adaptable
<div className="p-4 sm:p-6 md:p-8">

// Overflow controlado
<div className="truncate sm:whitespace-normal">
```

## 🎨 Componentes UI Base (shadcn/ui)

Los componentes de `components/ui/` ya están optimizados para responsive, pero siempre agrega clases adicionales según el contexto:

```jsx
// Button con tamaño adaptable
<Button size="sm" className="w-full sm:w-auto h-10 sm:h-9">

// Input con altura móvil-friendly
<Input className="h-11 text-base" />

// Card con padding responsive
<Card className="p-4 sm:p-6">
```

## 📱 Touch Targets

Mínimos recomendados para elementos interactivos:

- Botones: `44x44px` (`h-11 px-4`)
- Inputs: `44px` altura (`h-11`)
- Iconos clickeables: `40x40px` (`w-10 h-10`)
- Links en listas: `44px` altura mínima

## 🎯 Performance Móvil

- Usa `loading="lazy"` en imágenes
- Minimiza animaciones complejas en móvil
- Evita sombras excesivas (afectan performance)
- Usa SVG para iconos en lugar de imágenes

## 📚 Recursos Adicionales

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [Web.dev - Mobile-First](https://web.dev/responsive-web-design-basics/)
- [Material Design - Touch Targets](https://m2.material.io/design/usability/accessibility.html#layout-and-typography)

---

**Recuerda:** Siempre prueba en dispositivos reales cuando sea posible. Los emuladores no siempre capturan la experiencia real del usuario.
