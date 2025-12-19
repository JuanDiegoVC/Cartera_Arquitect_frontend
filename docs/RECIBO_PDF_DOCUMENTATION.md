# Documentación: Sistema de Recibos PDF (HU-09)

## 📋 Descripción General

Este módulo implementa la generación automática de **Recibos de Caja Oficiales en PDF** inmediatamente después de que un pago es procesado exitosamente en el sistema Sotrapeñol.

## 🗂️ Estructura de Archivos

```
src/
├── components/
│   └── Reportes/
│       ├── ReciboDocument.jsx         # Diseño del documento PDF
│       └── BotonDescargarRecibo.jsx   # Botón de descarga interactivo
├── hooks/
│   └── useReciboData.js               # Hook para construir datos del recibo
├── pages/
│   ├── Taquilla.jsx                   # Integración en página de taquilla
│   └── EjemploReciboPDF.jsx          # Página de ejemplo/demo
└── assets/
    └── SOTRAPEÑOL.png                 # Logo de la empresa
```

## 🎯 Componentes Principales

### 1. ReciboDocument.jsx

**Propósito**: Define el diseño visual del documento PDF.

**Características**:

- ✅ Logo de la empresa en el encabezado
- ✅ Información completa de la empresa (NIT, dirección, teléfono)
- ✅ Número de recibo y fecha destacados
- ✅ Sección de información del cliente/vehículo
- ✅ Tabla de conceptos pagados
- ✅ Totales en grande y negrita
- ✅ Medio de pago y observaciones
- ✅ Firma del cajero y línea para firma del cliente
- ✅ Nota legal al pie

**Estilos Profesionales**:

- Encabezado con borde azul
- Tabla con colores alternados para filas
- Sección de totales destacada
- Fuentes legibles (Helvetica)
- Formato de moneda colombiano

### 2. BotonDescargarRecibo.jsx

**Propósito**: Componente interactivo para descargar el PDF.

**Props**:

```typescript
{
  datosRecibo: {
    empresa: {
      nombre: string,
      nit: string,
      direccion: string,
      telefono: string
    },
    recibo: {
      numero: string,
      fecha: string (ISO)
    },
    cliente: {
      placa: string,
      tipo_vehiculo: string,
      propietario: string,
      conductor?: string
    },
    items: Array<{
      concepto: string,
      periodo: string (YYYY-MM-DD),
      valor: number
    }>,
    totales: {
      total_pagado: number
    },
    pago: {
      medio_pago: string,
      observaciones?: string
    },
    cajero: {
      nombre: string,
      usuario: string
    }
  },
  className?: string,
  variant?: "default" | "outline" | "destructive"
}
```

**Estados**:

- `loading`: Muestra "Generando documento..."
- `ready`: Muestra "Descargar Recibo PDF"
- `error`: Muestra mensaje de error

### 3. useReciboData.js

**Propósito**: Hook personalizado para construir el objeto de datos del recibo a partir de la información disponible.

**Uso**:

```javascript
const { buildReciboData } = useReciboData();

const reciboData = buildReciboData({
  vehiculo: vehiculoObject,
  deudasPagadas: arrayDeudas,
  totalPagado: number,
  medioPago: string,
  observacion: string,
  ingresoId: number,
  fechaPago: string(ISO),
});
```

## 🚀 Integración en Taquilla

### Paso 1: Importar Componentes

```javascript
import BotonDescargarRecibo from "../components/Reportes/BotonDescargarRecibo";
import { useReciboData } from "../hooks/useReciboData";
```

### Paso 2: Inicializar Hook y Estado

```javascript
const { buildReciboData } = useReciboData();
const [datosRecibo, setDatosRecibo] = useState(null);
```

### Paso 3: Construir Datos Después del Pago

```javascript
// Después de un pago exitoso
const reciboData = buildReciboData({
  vehiculo: {
    placa: searchedVehicle.plate,
    tipo_vehiculo: searchedVehicle.vehicleType,
    propietario_nombre: searchedVehicle.owner,
    conductor_actual_nombre: searchedVehicle.conductor || null,
  },
  deudasPagadas: deudasSeleccionadas.map((item) => ({
    rubro: { nombre: item.concept },
    periodo: item.periodo,
    monto_abonado: getAmountToPay(item),
  })),
  totalPagado: montoTotal,
  medioPago: medioPago,
  observacion: observacion,
  ingresoId: response.ingreso.ingreso_id,
  fechaPago: new Date().toISOString(),
});
setDatosRecibo(reciboData);
```

### Paso 4: Renderizar Botón

```jsx
{
  paymentSuccess && datosRecibo && (
    <BotonDescargarRecibo
      datosRecibo={datosRecibo}
      variant="default"
      className="bg-primary hover:bg-primary/90"
    />
  );
}
```

## 📝 Ejemplo de Uso Completo

Ver el archivo `src/pages/EjemploReciboPDF.jsx` para un ejemplo funcional con datos de prueba.

## 🎨 Personalización

### Cambiar Logo de la Empresa

Reemplaza el archivo `src/assets/SOTRAPEÑOL.png` con el nuevo logo.

### Modificar Información de la Empresa

Edita el objeto `empresa` en `src/hooks/useReciboData.js`:

```javascript
const empresa = {
  nombre: "SOTRAPEÑOL",
  nit: "800.123.456-7",
  direccion: "Calle 50 #45-30, rojo, Antioquia",
  telefono: "(604) 123-4567",
};
```

### Personalizar Estilos del PDF

Modifica el objeto `styles` en `src/components/Reportes/ReciboDocument.jsx`.

## 🔧 Dependencias

```json
{
  "@react-pdf/renderer": "^3.x.x"
}
```

## 📦 Instalación

```bash
npm install @react-pdf/renderer
```

## ✅ Checklist de Implementación

- [x] Instalar @react-pdf/renderer
- [x] Crear componente ReciboDocument.jsx
- [x] Crear componente BotonDescargarRecibo.jsx
- [x] Crear hook useReciboData.js
- [x] Integrar en Taquilla.jsx
- [x] Crear página de ejemplo
- [x] Agregar logo de la empresa
- [x] Formato de moneda colombiano
- [x] Formateo de fechas en español
- [x] Estilos profesionales

## 🎯 Funcionalidades Implementadas

1. ✅ Generación automática de recibo después del pago
2. ✅ Diseño profesional con logo de la empresa
3. ✅ Información completa del cliente y vehículo
4. ✅ Tabla de conceptos pagados con periodos
5. ✅ Total destacado
6. ✅ Medio de pago y observaciones
7. ✅ Información del cajero
8. ✅ Línea para firma del cliente
9. ✅ Nombre de archivo dinámico: `Recibo_[PLACA]_[NUMERO].pdf`
10. ✅ Estado de carga mientras genera el PDF

## 🐛 Solución de Problemas

### El logo no se muestra en el PDF

Verifica que la ruta del logo sea correcta y que el archivo exista en `src/assets/SOTRAPEÑOL.png`.

### El botón no genera el PDF

1. Verifica que todos los datos requeridos estén presentes en `datosRecibo`
2. Revisa la consola del navegador para errores
3. Asegúrate de que `@react-pdf/renderer` esté instalado correctamente

### El formato de moneda es incorrecto

Verifica la función `formatCurrency` en `ReciboDocument.jsx`:

```javascript
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return `$${num.toLocaleString("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};
```

## 🚀 Próximas Mejoras (Opcional)

- [ ] Endpoint backend para obtener datos completos del recibo: `GET /api/v1/pagos/recibo/<ingreso_id>/`
- [ ] Vista previa del PDF antes de descargar
- [ ] Envío del recibo por correo electrónico
- [ ] Generación de QR con información del pago
- [ ] Opciones de impresión directa
- [ ] Historial de recibos generados

## 📞 Soporte

Para más información o problemas, consulta la documentación de [@react-pdf/renderer](https://react-pdf.org/).
