import { Button } from "../ui/button";
import { Printer, Loader2 } from "lucide-react";
import { useState } from "react";
import { getTodayLocalDate } from "../../utils/formatters";

/**
 * Componente Botón para Imprimir Egreso Individual
 * 
 * Genera un comprobante de egreso en formato 75mm para impresoras térmicas
 * y abre el diálogo de impresión del navegador.
 */
const BotonImprimirEgreso = ({
    datosEgreso,
    className = "",
    variant = "ghost",
    size = "icon",
}) => {
    const [isGenerating, setIsGenerating] = useState(false);

    const handlePrint = async () => {
        setIsGenerating(true);
        try {
            // Importar jsPDF dinámicamente
            const { jsPDF } = await import("jspdf");

            // Configurar página para papel térmico 75mm
            const pageWidth = 75; // mm
            const margin = 4; // mm
            const contentWidth = pageWidth - (margin * 2);

            // Altura dinámica basada en contenido
            const baseHeight = 85;
            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pageWidth, baseHeight]
            });

            let y = 8;
            const centerX = pageWidth / 2;

            // Configurar fuente
            doc.setFont("helvetica", "normal");

            // ========== ENCABEZADO ==========
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("COMPROBANTE DE EGRESO", centerX, y, { align: "center" });
            y += 6;

            // Número de egreso
            doc.setFontSize(10);
            const egresoId = datosEgreso.egreso_id || "N/A";
            doc.text(`N° ${egresoId}`, centerX, y, { align: "center" });
            y += 5;

            // Fecha y hora
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            const now = new Date();
            const fechaHora = now.toLocaleString("es-CO", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
            });
            doc.text(`Fecha: ${fechaHora}`, centerX, y, { align: "center" });
            y += 5;

            // Línea separadora
            doc.setLineWidth(0.3);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            // ========== INFORMACIÓN DEL EGRESO ==========
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text("DETALLE DEL EGRESO:", margin, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);

            // Categoría
            const categoria = datosEgreso.categoria_nombre || "Sin categoría";
            doc.text(`Categoría: ${categoria}`, margin, y);
            y += 4;

            // Medio de pago
            const medioPago = datosEgreso.medio_pago_display || datosEgreso.medio_pago || "Efectivo";
            doc.text(`Medio de pago: ${medioPago}`, margin, y);
            y += 4;

            // Fecha del egreso
            const fechaEgreso = datosEgreso.fecha_egreso || getTodayLocalDate();
            doc.text(`Fecha egreso: ${fechaEgreso}`, margin, y);
            y += 4;

            // Hora
            if (datosEgreso.hora) {
                doc.text(`Hora: ${datosEgreso.hora}`, margin, y);
                y += 4;
            }

            // Descripción (si existe)
            if (datosEgreso.descripcion) {
                y += 2;
                const descripcionLines = doc.splitTextToSize(`Descripción: ${datosEgreso.descripcion}`, contentWidth);
                descripcionLines.forEach((line) => {
                    doc.text(line, margin, y);
                    y += 3.5;
                });
            }

            y += 3;

            // ========== MONTO ==========
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const valor = parseFloat(datosEgreso.valor || 0);
            doc.text("MONTO:", margin, y);
            doc.text(`$${valor.toLocaleString("es-CO")}`, pageWidth - margin, y, { align: "right" });
            y += 6;

            // Línea separadora
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            // ========== PIE DE PÁGINA ==========
            doc.setFont("helvetica", "normal");
            doc.setFontSize(7);
            doc.text("SOTRAPEÑOL LTDA", centerX, y, { align: "center" });
            y += 4;

            // Línea final
            doc.line(margin, y, pageWidth - margin, y);

            // Crear blob y abrir en nueva ventana para imprimir
            const pdfBlob = doc.output("blob");
            const pdfUrl = URL.createObjectURL(pdfBlob);

            // Abrir en nueva ventana
            const printWindow = window.open(pdfUrl, "_blank", "width=400,height=600");

            if (printWindow) {
                // Esperar a que cargue y luego imprimir
                printWindow.onload = () => {
                    setTimeout(() => {
                        printWindow.print();
                    }, 500);
                };
            } else {
                // Si el popup fue bloqueado, descargar el archivo
                const link = document.createElement("a");
                link.href = pdfUrl;
                link.download = `Egreso_${egresoId}_${getTodayLocalDate().replace(/-/g, "")}.pdf`;
                link.click();
            }

        } catch (error) {
            console.error("Error generando comprobante de egreso:", error);
            alert("Error al generar el comprobante de egreso.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant={variant}
            size={size}
            disabled={isGenerating}
            onClick={handlePrint}
            className={className}
            title="Imprimir egreso"
        >
            {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
                <Printer className="h-4 w-4" />
            )}
        </Button>
    );
};

export default BotonImprimirEgreso;
