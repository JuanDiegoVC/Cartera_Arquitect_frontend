import { pdf } from "@react-pdf/renderer";
import { Button } from "../ui/button";
import { Download, Loader2, FileText } from "lucide-react";
import EgresosConsolidadosDocument from "../Reportes/EgresosConsolidadosDocument";
import { useState } from "react";
import { getTodayLocalDate } from "../../utils/formatters";

/**
 * Componente Botón para Descargar Reporte Consolidado de Egresos en PDF
 *
 * @param {Object} props - Propiedades del componente
 * @param {Array} props.egresos - Lista de egresos del día
 * @param {number} props.total - Total de egresos
 * @param {Object} props.usuario - Información del usuario actual
 * @param {string} [props.className] - Clases CSS adicionales
 * @param {string} [props.variant] - Variante del botón
 */
const BotonDescargarEgresosConsolidados = ({
    egresos = [],
    total = 0,
    usuario = {},
    className = "",
    variant = "outline",
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handleDownload = async () => {
        console.log("🖱️ [BotonDescargarEgresosConsolidados] Click en botón de descarga");
        setIsGenerating(true);

        try {
            const fecha = getTodayLocalDate();
            const nombreArchivo = `EgresosConsolidados_${fecha}.pdf`;

            const datosReporte = {
                fecha,
                usuario,
                egresos,
                total,
            };

            console.log("📄 [BotonDescargarEgresosConsolidados] Generando blob del PDF...");
            const blob = await pdf(
                <EgresosConsolidadosDocument datosReporte={datosReporte} />
            ).toBlob();
            console.log("✅ [BotonDescargarEgresosConsolidados] Blob generado:", blob);

            // Crear URL del blob
            const url = URL.createObjectURL(blob);
            console.log("🔗 [BotonDescargarEgresosConsolidados] URL creada:", url);

            // Crear enlace temporal y simular click
            const link = document.createElement("a");
            link.href = url;
            link.download = nombreArchivo;
            document.body.appendChild(link);
            console.log("📥 [BotonDescargarEgresosConsolidados] Iniciando descarga...");
            link.click();
            console.log(
                "✅ [BotonDescargarEgresosConsolidados] Descarga iniciada exitosamente"
            );

            // Limpiar
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            console.log("🧹 [BotonDescargarEgresosConsolidados] Limpieza completada");
        } catch (error) {
            console.error(
                "❌ [BotonDescargarEgresosConsolidados] Error al generar PDF:",
                error
            );
            alert("Error al generar el PDF: " + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant={variant}
            disabled={isGenerating || egresos.length === 0}
            onClick={handleDownload}
            className={className}
            title={egresos.length === 0 ? "No hay egresos para descargar" : "Descargar consolidado de egresos"}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">Consolidado PDF</span>
                    <span className="sm:hidden">PDF</span>
                </>
            )}
        </Button>
    );
};

export default BotonDescargarEgresosConsolidados;
