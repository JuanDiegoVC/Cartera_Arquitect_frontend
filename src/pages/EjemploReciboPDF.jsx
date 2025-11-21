import BotonDescargarRecibo from "../components/Reportes/BotonDescargarRecibo";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

/**
 * Página de ejemplo para probar el componente de Recibo PDF
 * Esta página muestra cómo usar el componente BotonDescargarRecibo
 * con datos de prueba (dummy data)
 */
export default function EjemploReciboPDF() {
  // Datos de prueba para el recibo
  const datosReciboEjemplo = {
    empresa: {
      nombre: "SOTRAPEÑOL",
      nit: "800.123.456-7",
      direccion: "Calle 50 #45-30, Medellín, Antioquia",
      telefono: "(604) 123-4567",
    },
    recibo: {
      numero: "RC-2025-001234",
      fecha: new Date().toISOString(), // Fecha actual
    },
    cliente: {
      placa: "ABC123",
      tipo_vehiculo: "Taxi Blanco",
      propietario: "Juan Pérez García",
      conductor: "María López Rodríguez",
    },
    items: [
      {
        concepto: "Administración",
        periodo: "2025-11-01",
        valor: 80000,
      },
      {
        concepto: "Seguro",
        periodo: "2025-11-01",
        valor: 50000,
      },
      {
        concepto: "Rodamiento",
        periodo: "2025-11-01",
        valor: 30000,
      },
    ],
    totales: {
      total_pagado: 160000,
    },
    pago: {
      medio_pago: "Efectivo",
      observaciones: "Pago completo del mes de noviembre 2025",
    },
    cajero: {
      nombre: "Ana García Martínez",
      usuario: "ana.garcia@sotrapeñol.com",
    },
  };

  // Ejemplo con pago parcial
  const datosReciboParcial = {
    ...datosReciboEjemplo,
    recibo: {
      numero: "RC-2025-001235",
      fecha: new Date().toISOString(),
    },
    cliente: {
      placa: "DEF456",
      tipo_vehiculo: "Taxi Amarillo",
      propietario: "Carlos Ramírez",
      conductor: null, // Sin conductor
    },
    items: [
      {
        concepto: "Administración",
        periodo: "2025-10-01",
        valor: 40000, // Pago parcial
      },
    ],
    totales: {
      total_pagado: 40000,
    },
    pago: {
      medio_pago: "Transferencia Bancaria",
      observaciones: "Abono a cuenta - Pago parcial mes de octubre",
    },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Ejemplo: Generación de Recibos PDF
        </h1>
        <p className="text-muted-foreground">
          Esta página muestra cómo usar el componente de descarga de recibos con
          datos de prueba.
        </p>
      </div>

      {/* Ejemplo 1: Pago Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo 1: Pago Completo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Detalles del Recibo:</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>Placa:</strong> {datosReciboEjemplo.cliente.placa}
              </li>
              <li>
                <strong>Propietario:</strong>{" "}
                {datosReciboEjemplo.cliente.propietario}
              </li>
              <li>
                <strong>Items:</strong> {datosReciboEjemplo.items.length}{" "}
                conceptos
              </li>
              <li>
                <strong>Total:</strong> $
                {datosReciboEjemplo.totales.total_pagado.toLocaleString(
                  "es-CO"
                )}
              </li>
            </ul>
          </div>

          <BotonDescargarRecibo
            datosRecibo={datosReciboEjemplo}
            variant="default"
          />
        </CardContent>
      </Card>

      {/* Ejemplo 2: Pago Parcial */}
      <Card>
        <CardHeader>
          <CardTitle>Ejemplo 2: Pago Parcial (Sin Conductor)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-semibold mb-2">Detalles del Recibo:</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <strong>Placa:</strong> {datosReciboParcial.cliente.placa}
              </li>
              <li>
                <strong>Propietario:</strong>{" "}
                {datosReciboParcial.cliente.propietario}
              </li>
              <li>
                <strong>Conductor:</strong>{" "}
                {datosReciboParcial.cliente.conductor || "N/A"}
              </li>
              <li>
                <strong>Items:</strong> {datosReciboParcial.items.length}{" "}
                concepto
              </li>
              <li>
                <strong>Total:</strong> $
                {datosReciboParcial.totales.total_pagado.toLocaleString(
                  "es-CO"
                )}
              </li>
            </ul>
          </div>

          <BotonDescargarRecibo
            datosRecibo={datosReciboParcial}
            variant="outline"
          />
        </CardContent>
      </Card>

      {/* Instrucciones de uso */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            💡 Cómo Integrar en tu Aplicación
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-blue-800 dark:text-blue-200">
          <div>
            <strong>1. Importar el componente:</strong>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded-md mt-2 overflow-x-auto">
              <code>{`import BotonDescargarRecibo from "../components/Reportes/BotonDescargarRecibo";
import { useReciboData } from "../hooks/useReciboData";`}</code>
            </pre>
          </div>

          <div>
            <strong>2. Usar el hook para construir los datos:</strong>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded-md mt-2 overflow-x-auto">
              <code>{`const { buildReciboData } = useReciboData();

// Después de un pago exitoso
const reciboData = buildReciboData({
  vehiculo: vehiculoData,
  deudasPagadas: deudas,
  totalPagado: total,
  medioPago: "efectivo",
  observacion: "...",
  ingresoId: response.ingreso_id,
  fechaPago: new Date().toISOString()
});`}</code>
            </pre>
          </div>

          <div>
            <strong>3. Renderizar el botón:</strong>
            <pre className="bg-white dark:bg-gray-900 p-3 rounded-md mt-2 overflow-x-auto">
              <code>{`<BotonDescargarRecibo 
  datosRecibo={reciboData} 
  variant="default"
/>`}</code>
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
