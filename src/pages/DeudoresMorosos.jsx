import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, AlertCircle, TrendingUp, CheckCircle, FileText } from "lucide-react";
import { cobrosService } from "../services/cobrosService";

export default function DeudoresMorosos() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [error, setError] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const result = await cobrosService.getReporteMorosidad();
            console.log("Reporte Morosidad Data:", result);
            setData(result);
        } catch (err) {
            console.error(err);
            setError("Error al cargar el reporte de morosidad.");
        } finally {
            setLoading(false);
        }
    };

    const filteredData = data.filter(item =>
        item.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.conductor.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getSemaforoColor = (estado) => {
        switch (estado) {
            case "rojo": return "bg-red-500 hover:bg-red-600";
            case "amarillo": return "bg-yellow-500 hover:bg-yellow-600";
            case "verde": return "bg-green-500 hover:bg-green-600";
            default: return "bg-gray-500";
        }
    };

    const getSemaforoIcon = (estado) => {
        switch (estado) {
            case "rojo": return <AlertCircle className="h-4 w-4 mr-1" />;
            case "amarillo": return <TrendingUp className="h-4 w-4 mr-1" />;
            case "verde": return <CheckCircle className="h-4 w-4 mr-1" />;
            default: return null;
        }
    };

    const generateCobroJuridicoPDF = (item) => {
        import('jspdf').then(({ jsPDF }) => {
            const doc = new jsPDF();
            const margin = 25;
            let y = 30;
            const lineHeight = 5;
            const pageWidth = doc.internal.pageSize.getWidth();
            const textWidth = pageWidth - (margin * 2);

            // Configurar fuente Arial (helvetica es el equivalente en jsPDF)
            doc.setFont("helvetica", "normal");
            doc.setFontSize(10);

            // Fecha en formato largo (ej: "3 de diciembre de 2025")
            const fecha = new Date();
            const dia = fecha.getDate();
            const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
                          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
            const mes = meses[fecha.getMonth()];
            const año = fecha.getFullYear();
            const fechaFormateada = `${dia} de ${mes} de ${año}`;

            // Fecha
            doc.text(`Medellín, ${fechaFormateada}`, margin, y);
            y += 12;

            // Destinatario
            doc.text("Señor(a)", margin, y);
            y += 5;
            doc.setFont("helvetica", "bold");
            doc.text(item.conductor.toUpperCase(), margin, y);
            y += 10;

            // Referencia
            doc.setFont("helvetica", "bold");
            doc.text("Referencia: ", margin, y);
            doc.setFont("helvetica", "normal");
            doc.text("Cobro prejudicial por obligaciones pendientes.", margin + 22, y);
            y += 12;

            // Formatear valores
            const deudaFormateada = parseFloat(item.total_deuda).toLocaleString('es-CO', { 
                style: 'currency', 
                currency: 'COP',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            });

            // Obtener concepto de rubros si existe, sino usar genérico
            const conceptoDeuda = item.rubros_pendientes 
                ? item.rubros_pendientes 
                : "obligaciones de afiliación y administración";

            // Cuerpo del documento - Párrafo 1
            const parrafo1 = `Por medio de la presente, SOTRAPEÑOL LTDA le informa que, debido al incumplimiento de las obligaciones a su cargo como afiliado a esta empresa, por concepto de ${conceptoDeuda}, que a la fecha se encuentran en mora, por un valor de ${deudaFormateada}, obligación derivada del contrato de vinculación y/o administración celebrado entre usted y la empresa; por lo que, le hacemos este requerimiento con el fin de que se ponga al día en sus obligaciones, de lo contrario, nos faculta para iniciar en su contra, sin necesidad de nuevos avisos, el proceso judicial ante un juez de la república, para que la obligación preste mérito ejecutivo y se puedan pedir medidas cautelares (embargo y secuestro) de bienes que se encuentren a su nombre, con el fin de obtener el pago forzoso de las obligaciones pendientes.`;
            
            const splitParrafo1 = doc.splitTextToSize(parrafo1, textWidth);
            doc.text(splitParrafo1, margin, y);
            y += (splitParrafo1.length * lineHeight) + 8;

            // Párrafo 2
            const parrafo2 = `Una vez iniciado el proceso, la deuda continuará incrementándose por concepto de intereses moratorios, costas procesales y honorarios profesionales, los cuales deberán ser asumidos integralmente por usted.`;
            
            const splitParrafo2 = doc.splitTextToSize(parrafo2, textWidth);
            doc.text(splitParrafo2, margin, y);
            y += (splitParrafo2.length * lineHeight) + 8;

            // Párrafo 3
            const parrafo3 = `Adicionalmente, el incumplimiento de estas obligaciones, podrá generar afectaciones negativas en su historial crediticio, así como en el de cualquier codeudor o garante vinculado a la obligación.`;
            
            const splitParrafo3 = doc.splitTextToSize(parrafo3, textWidth);
            doc.text(splitParrafo3, margin, y);
            y += (splitParrafo3.length * lineHeight) + 8;

            // Párrafo 4 - Plazo (5 días hábiles)
            const parrafo4 = `Para evitar mayores perjuicios económicos, evitar un proceso jurídico y la práctica de medidas judiciales, cuenta con un plazo improrrogable de cinco (5) días hábiles siguientes a la recepción de esta comunicación, para que se ponga al día con todas las obligaciones pendientes con SOTRAPEÑOL LTDA.`;
            
            const splitParrafo4 = doc.splitTextToSize(parrafo4, textWidth);
            doc.text(splitParrafo4, margin, y);
            y += (splitParrafo4.length * lineHeight) + 8;

            // Párrafo 5
            const parrafo5 = `Transcurrido dicho término sin recibir respuesta, se entenderá que no existe interés de su parte, en cumplir voluntariamente y se procederá a iniciar la actuación judicial correspondiente.`;
            
            const splitParrafo5 = doc.splitTextToSize(parrafo5, textWidth);
            doc.text(splitParrafo5, margin, y);
            y += (splitParrafo5.length * lineHeight) + 8;

            // Párrafo 6
            const parrafo6 = `Se le informa que, solamente el pago de las obligaciones pendientes, es el único mecanismo para detener el inicio del proceso judicial.`;
            
            const splitParrafo6 = doc.splitTextToSize(parrafo6, textWidth);
            doc.text(splitParrafo6, margin, y);
            y += (splitParrafo6.length * lineHeight) + 8;

            // Nota de adjuntos
            doc.text("Se adjuntan las facturas y soportes objeto de cobro.", margin, y);

            // ========== PÁGINA 2 ==========
            doc.addPage();
            y = 30;

            // Despedida
            doc.text("Atentamente,", margin, y);
            y += 15;

            // Firma
            doc.setFont("helvetica", "bold");
            doc.text("JHON JAIRO RAMÍREZ ATEHORTÚA", margin, y);
            y += 5;
            doc.setFont("helvetica", "normal");
            doc.text("C.C. 71.773.489", margin, y);
            y += 5;
            doc.text("Representante Legal", margin, y);
            y += 5;
            doc.setFont("helvetica", "bold");
            doc.text("SOTRAPEÑOL LTDA", margin, y);

            // Guardar PDF
            doc.save(`Carta_Cobro_Prejudicial_${item.placa}_${fecha.toISOString().split('T')[0]}.pdf`);
        });
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Cartera Vencida</h1>
                <p className="text-muted-foreground">
                    Monitoreo de vehículos con deudas y alertas de morosidad
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado Crítico</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">
                            {data.filter(item => item.estado_semaforo === 'rojo').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Vehículos con uso de cupo &ge; 90%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Alerta</CardTitle>
                        <TrendingUp className="h-4 w-4 text-yellow-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">
                            {data.filter(item => item.estado_semaforo === 'amarillo').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Vehículos con uso de cupo 60-89%
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Estado Normal</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                            {data.filter(item => item.estado_semaforo === 'verde').length}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Vehículos con uso de cupo &lt; 60%
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center space-x-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por placa o conductor..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                </div>
            </div>

            {error && (
                <div className="bg-destructive/15 text-destructive px-4 py-3 rounded-md">
                    {error}
                </div>
            )}

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Cargando reporte...
                        </div>
                    ) : filteredData.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No se encontraron registros.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Placa</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold">Conductor</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold">Deuda Total</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold">Límite</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Uso Cupo</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Estado</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((item) => (
                                        <tr key={item.placa} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 font-medium">{item.placa}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{item.conductor}</td>
                                            <td className={`px-4 py-3 text-right font-mono font-medium ${item.estado_semaforo === 'rojo' ? 'text-red-600' :
                                                item.estado_semaforo === 'amarillo' ? 'text-yellow-600' :
                                                    'text-green-600'
                                                }`}>
                                                ${parseFloat(item.total_deuda).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-muted-foreground">
                                                ${parseFloat(item.limite_deuda).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="font-bold">{item.porcentaje_deuda}%</span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge className={`${getSemaforoColor(item.estado_semaforo)} text-white`}>
                                                    {getSemaforoIcon(item.estado_semaforo)}
                                                    {item.estado_semaforo.toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => generateCobroJuridicoPDF(item)}
                                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                                                    title="Generar Carta de Cobro Jurídico"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
