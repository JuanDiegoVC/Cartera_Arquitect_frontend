import { pdf } from "@react-pdf/renderer";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import ReciboDocument from "./ReciboDocument";
import { useState } from "react";

/**
 * Componente Botón para Descargar Recibo de Caja en PDF
 *
 * Este componente renderiza un botón que permite descargar el recibo
 * de caja en formato PDF usando @react-pdf/renderer.
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.datosRecibo - Objeto con todos los datos necesarios para el recibo
 * @param {Object} props.datosRecibo.empresa - Información de la empresa
 * @param {string} props.datosRecibo.empresa.nombre - Nombre de la empresa
 * @param {string} props.datosRecibo.empresa.nit - NIT de la empresa
 * @param {string} props.datosRecibo.empresa.direccion - Dirección de la empresa
 * @param {string} props.datosRecibo.empresa.telefono - Teléfono de la empresa
 * @param {Object} props.datosRecibo.recibo - Información del recibo
 * @param {string} props.datosRecibo.recibo.numero - Número consecutivo del recibo
 * @param {string} props.datosRecibo.recibo.fecha - Fecha y hora del recibo (ISO string)
 * @param {Object} props.datosRecibo.cliente - Información del cliente/vehículo
 * @param {string} props.datosRecibo.cliente.placa - Placa del vehículo
 * @param {string} props.datosRecibo.cliente.tipo_vehiculo - Tipo de vehículo
 * @param {string} props.datosRecibo.cliente.propietario - Nombre del propietario
 * @param {string} [props.datosRecibo.cliente.conductor] - Nombre del conductor (opcional)
 * @param {Array} props.datosRecibo.items - Array de conceptos pagados
 * @param {string} props.datosRecibo.items[].concepto - Nombre del concepto/rubro
 * @param {string} props.datosRecibo.items[].periodo - Periodo (YYYY-MM-DD)
 * @param {number} props.datosRecibo.items[].valor - Valor pagado
 * @param {Object} props.datosRecibo.totales - Totales del pago
 * @param {number} props.datosRecibo.totales.total_pagado - Total pagado
 * @param {Object} props.datosRecibo.pago - Información del pago
 * @param {string} props.datosRecibo.pago.medio_pago - Medio de pago utilizado
 * @param {string} [props.datosRecibo.pago.observaciones] - Observaciones (opcional)
 * @param {Object} props.datosRecibo.cajero - Información del cajero
 * @param {string} props.datosRecibo.cajero.nombre - Nombre completo del cajero
 * @param {string} props.datosRecibo.cajero.usuario - Usuario/email del cajero
 * @param {string} [props.className] - Clases CSS adicionales para el botón
 * @param {boolean} [props.variant] - Variante del botón (default, outline, etc.)
 *
 * @example
 * ```jsx
 * <BotonDescargarRecibo
 *   datosRecibo={{
 *     empresa: {
 *       nombre: "SOTRAPEÑOL",
 *       nit: "800.123.456-7",
 *       direccion: "Calle 50 #45-30, Medellín",
 *       telefono: "(604) 123-4567"
 *     },
 *     recibo: {
 *       numero: "RC-2025-001234",
 *       fecha: "2025-11-21T10:30:00"
 *     },
 *     cliente: {
 *       placa: "ABC123",
 *       tipo_vehiculo: "Taxi Blanco",
 *       propietario: "Juan Pérez",
 *       conductor: "María López"
 *     },
 *     items: [
 *       { concepto: "Administración", periodo: "2025-11-01", valor: 80000 },
 *       { concepto: "Seguro", periodo: "2025-11-01", valor: 50000 }
 *     ],
 *     totales: {
 *       total_pagado: 130000
 *     },
 *     pago: {
 *       medio_pago: "Efectivo",
 *       observaciones: "Pago completo del mes"
 *     },
 *     cajero: {
 *       nombre: "Ana García",
 *       usuario: "ana.garcia@sotrapeñol.com"
 *     }
 *   }}
 * />
 * ```
 */
const BotonDescargarRecibo = ({
  datosRecibo,
  className = "",
  variant = "default",
}) => {
  console.log("🎯 [BotonDescargarRecibo] Componente renderizado");
  console.log("📄 [BotonDescargarRecibo] Datos recibidos:", datosRecibo);

  const [isGenerating, setIsGenerating] = useState(false);

  // Generar nombre de archivo dinámico
  const nombreArchivo = `Recibo_${
    datosRecibo.cliente.placa
  }_${datosRecibo.recibo.numero.replace(/[^a-zA-Z0-9]/g, "_")}.pdf`;
  console.log("📝 [BotonDescargarRecibo] Nombre de archivo:", nombreArchivo);

  const handleDownload = async () => {
    console.log("🖱️ [BotonDescargarRecibo] Click en botón de descarga");
    setIsGenerating(true);

    try {
      console.log("📄 [BotonDescargarRecibo] Generando blob del PDF...");
      const blob = await pdf(
        <ReciboDocument datosRecibo={datosRecibo} />
      ).toBlob();
      console.log("✅ [BotonDescargarRecibo] Blob generado:", blob);

      // Crear URL del blob
      const url = URL.createObjectURL(blob);
      console.log("🔗 [BotonDescargarRecibo] URL creada:", url);

      // Crear enlace temporal y simular click
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      console.log("📥 [BotonDescargarRecibo] Iniciando descarga...");
      link.click();
      console.log("✅ [BotonDescargarRecibo] Descarga iniciada exitosamente");

      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("🧹 [BotonDescargarRecibo] Limpieza completada");
    } catch (error) {
      console.error("❌ [BotonDescargarRecibo] Error al generar PDF:", error);
      alert("Error al generar el PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button
      variant={variant}
      disabled={isGenerating}
      onClick={handleDownload}
      className={className}
    >
      {isGenerating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando documento...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Descargar Recibo PDF
        </>
      )}
    </Button>
  );
};

export default BotonDescargarRecibo;
