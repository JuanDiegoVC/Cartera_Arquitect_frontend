import { Button } from "../ui/button";
import { Printer, Loader2 } from "lucide-react";
import { useState } from "react";
import { getTodayLocalDate } from "../../utils/formatters";

/**
 * Componente Botón para Imprimir Recibo Térmico
 * 
 * Genera un recibo en formato 75mm para impresoras térmicas (EPSON TM-T20II)
 * y abre el diálogo de impresión del navegador.
 */
const BotonImprimirRecibo = ({
    datosRecibo,
    className = "",
    variant = "outline",
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
            const contentWidth = pageWidth - (margin * 2); // Ancho de contenido: 67 mm

            // Calcular altura necesaria basada en el contenido
            const itemsCount = datosRecibo.items?.length || 0;
            const baseHeight = 90; // Altura base en mm
            const dynamicHeight = baseHeight + (itemsCount * 15);

            const doc = new jsPDF({
                orientation: "portrait",
                unit: "mm",
                format: [pageWidth, dynamicHeight]
            });

            let y = 8;
            const centerX = pageWidth / 2;

            // Configurar fuente
            doc.setFont("helvetica", "normal");

            // ========== ENCABEZADO ==========
            doc.setFontSize(12);
            doc.setFont("helvetica", "bold");
            doc.text("RECIBO DE PAGO", centerX, y, { align: "center" });
            y += 6;

            // Número de recibo
            doc.setFontSize(10);
            const ingresoId = datosRecibo.ingresoId || "N/A";
            doc.text(`N° ${ingresoId}`, centerX, y, { align: "center" });
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

            // ========== INFORMACIÓN DEL VEHÍCULO ==========
            doc.setFont("helvetica", "bold");
            doc.setFontSize(10);
            const placa = datosRecibo.cliente?.placa || "N/A";
            doc.text(`Placa: ${placa}`, margin, y);
            y += 5;

            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            const propietario = datosRecibo.cliente?.propietario || "N/A";
            // Dividir nombre largo en múltiples líneas
            const propietarioLines = doc.splitTextToSize(`Propietario: ${propietario}`, contentWidth);
            propietarioLines.forEach((line) => {
                doc.text(line, margin, y);
                y += 4;
            });
            y += 2;

            // Línea separadora
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            // ========== DETALLE DE PAGO ==========
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text("DETALLE DE PAGO:", margin, y);
            y += 5;

            // Listado de rubros pagados
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            const items = datosRecibo.items || [];

            if (items.length === 0) {
                doc.text("Sin detalles disponibles", margin, y);
                y += 5;
            } else {
                items.forEach((item, index) => {
                    const concepto = item.concepto || "Rubro";

                    // Formatear periodo
                    let periodoStr = "";
                    if (item.periodo) {
                        const [year, month] = item.periodo.split("-");
                        const monthDate = new Date(parseInt(year), parseInt(month) - 1, 15);
                        periodoStr = monthDate.toLocaleDateString("es-CO", { month: "short", year: "numeric" });
                    }

                    // Concepto (puede ser largo)
                    const conceptoLines = doc.splitTextToSize(`${index + 1}. ${concepto}`, contentWidth - 5);
                    conceptoLines.forEach((line) => {
                        doc.text(line, margin + 1, y);
                        y += 3.5;
                    });

                    // Periodo y monto en la misma línea
                    const monto = parseFloat(item.valor || 0);
                    const montoStr = `$${monto.toLocaleString("es-CO")}`;
                    doc.text(`   ${periodoStr}`, margin + 1, y);
                    doc.text(montoStr, pageWidth - margin, y, { align: "right" });
                    y += 5;
                });
            }

            // ========== TOTAL ==========
            y += 2;
            doc.setLineWidth(0.5);
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            doc.setFont("helvetica", "bold");
            doc.setFontSize(11);
            const totalPagado = parseFloat(datosRecibo.totales?.total_pagado || 0);
            doc.text("TOTAL PAGADO:", margin, y);
            doc.text(`$${totalPagado.toLocaleString("es-CO")}`, pageWidth - margin, y, { align: "right" });
            y += 6;

            // Medio de pago
            doc.setFont("helvetica", "normal");
            doc.setFontSize(8);
            const medioPago = datosRecibo.pago?.medio_pago || "Efectivo";
            doc.text(`Medio de pago: ${medioPago}`, margin, y);
            y += 5;

            // Línea separadora
            doc.line(margin, y, pageWidth - margin, y);
            y += 5;

            // ========== PIE DE PÁGINA ==========
            doc.setFont("helvetica", "bold");
            doc.setFontSize(9);
            doc.text("¡Gracias por su pago!", centerX, y, { align: "center" });
            y += 4;

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
                link.download = `Recibo_Termico_${placa}_${getTodayLocalDate().replace(/-/g, "")}.pdf`;
                link.click();
            }

        } catch (error) {
            console.error("Error generando recibo térmico:", error);
            alert("Error al generar el recibo térmico.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Button
            variant={variant}
            disabled={isGenerating}
            onClick={handlePrint}
            className={className}
        >
            {isGenerating ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generando...
                </>
            ) : (
                <>
                    <Printer className="mr-2 h-4 w-4" />
                    Imprimir Recibo Térmico
                </>
            )}
        </Button>
    );
};

export default BotonImprimirRecibo;
