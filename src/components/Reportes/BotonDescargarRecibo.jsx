import { Button } from "../ui/button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { pagosService } from "../../services/pagosService";

/**
 * Componente Botón para Descargar Recibo de Caja en PDF
 *
 * Este componente renderiza un botón que permite descargar el recibo
 * de caja en formato PDF usando el servicio de backend.
 */
const BotonDescargarRecibo = ({
  datosRecibo,
  className = "",
  variant = "default",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const ingresoId = datosRecibo.ingresoId || datosRecibo.recibo?.numero;
  const placa = datosRecibo.cliente?.placa || 'VEHICULO';
  const nombreArchivo = `Recibo_${placa}_${ingresoId}.pdf`;

  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await pagosService.downloadRecibo(ingresoId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      // link.download = nombreArchivo; // Removed to let backend set filename via Content-Disposition
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading receipt:", error);
      alert("Error al descargar el recibo.");
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
          Descargando...
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
