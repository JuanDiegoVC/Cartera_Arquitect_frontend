import { pdf } from "@react-pdf/renderer";
import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import CierreTurnoDocument from "./CierreTurnoDocument";
import { useState } from "react";

/**
 * Componente Botón para Descargar Cierre de Turno en PDF
 *
 * @param {Object} props - Propiedades del componente
 * @param {Object} props.datosCierre - Objeto con todos los datos del cierre de turno
 * @param {Object} props.datosCierre.empresa - Información de la empresa
 * @param {string} props.datosCierre.fecha - Fecha del cierre (ISO string)
 * @param {Object} props.datosCierre.resumen - Resumen con totales
 * @param {Object} props.datosCierre.movimientos - Ingresos y egresos del día
 * @param {Object} props.datosCierre.cajero - Información del cajero
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.variant] - Variante del botón
 */
const BotonDescargarCierreTurno = ({
  datosCierre,
  className = "",
  variant = "default",
}) => {
  console.log("🎯 [BotonDescargarCierreTurno] Componente renderizado");
  console.log("📄 [BotonDescargarCierreTurno] Datos recibidos:", datosCierre);

  const [isGenerating, setIsGenerating] = useState(false);

  // Generar nombre de archivo con fecha
  const fecha = new Date(datosCierre.fecha);
  const nombreArchivo = `CierreTurno_${fecha.getFullYear()}-${String(
    fecha.getMonth() + 1
  ).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}.pdf`;

  console.log(
    "📝 [BotonDescargarCierreTurno] Nombre de archivo:",
    nombreArchivo
  );

  const handleDownload = async () => {
    console.log("🖱️ [BotonDescargarCierreTurno] Click en botón de descarga");
    setIsGenerating(true);

    try {
      console.log("📄 [BotonDescargarCierreTurno] Generando blob del PDF...");
      const blob = await pdf(
        <CierreTurnoDocument datosCierre={datosCierre} />
      ).toBlob();
      console.log("✅ [BotonDescargarCierreTurno] Blob generado:", blob);

      // Crear URL del blob
      const url = URL.createObjectURL(blob);
      console.log("🔗 [BotonDescargarCierreTurno] URL creada:", url);

      // Crear enlace temporal y simular click
      const link = document.createElement("a");
      link.href = url;
      link.download = nombreArchivo;
      document.body.appendChild(link);
      console.log("📥 [BotonDescargarCierreTurno] Iniciando descarga...");
      link.click();
      console.log("✅ [BotonDescargarCierreTurno] Descarga iniciada exitosamente");

      // Limpiar
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log("🧹 [BotonDescargarCierreTurno] Limpieza completada");
    } catch (error) {
      console.error("❌ [BotonDescargarCierreTurno] Error al generar PDF:", error);
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
          Generando PDF...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Descargar PDF
        </>
      )}
    </Button>
  );
};

export default BotonDescargarCierreTurno;
