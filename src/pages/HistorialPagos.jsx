import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { pagosService } from "../services/pagosService";
import { Loader2, Download, Search } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";
import PlacaAutocomplete from "../components/common/PlacaAutocomplete";

export default function HistorialPagos() {
    const [plate, setPlate] = useState("");
    const [month, setMonth] = useState("");
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);

    const handleSearch = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (plate.length < 3) return;

        setLoading(true);
        setError(null);
        setPayments([]);

        try {
            const data = await pagosService.getHistorialPorVehiculo(plate, month);
            // Manejar respuesta paginada o lista directa
            const listaPagos = data.results || data;
            setPayments(Array.isArray(listaPagos) ? listaPagos : []);
        } catch (err) {
            console.error(err);
            setError("Error al cargar el historial. Verifique la placa.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (ingresoId) => {
        setDownloading(ingresoId);
        try {
            const blob = await pagosService.downloadRecibo(ingresoId);
            const url = window.URL.createObjectURL(blob);

            // Construct filename: PAGO_{PLACA}_{FECHA}.pdf
            // Find payment details to get date
            const payment = payments.find(p => p.ingreso_id === ingresoId);
            const dateObj = payment ? new Date(payment.fecha_transaccion) : new Date();
            const dateStr = dateObj.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD
            const filename = `PAGO_${plate}_${dateStr}.pdf`;

            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error("Error downloading PDF:", err);
            setError("Error al descargar el recibo.");
        } finally {
            setDownloading(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Historial de Pagos</h1>
                <p className="text-sm sm:text-base text-muted-foreground">Consulte y descargue los recibos de pago históricos.</p>
            </div>

            <Card>
                <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                        Buscar por Placa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
                        <div className="flex-1">
                            <PlacaAutocomplete
                                value={plate}
                                onChange={setPlate}
                                onSelect={(suggestion) => {
                                    setPlate(suggestion.placa);
                                }}
                                placeholder="Ingrese placa (ej: ABC123)"
                            />
                        </div>
                        <div className="w-full sm:w-48">
                            <Input
                                type="month"
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={loading || plate.length < 3}
                            className="w-full sm:w-auto"
                        >
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
                        </Button>
                    </div>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {payments.length > 0 && (
                <Card className="overflow-hidden">
                    <CardHeader className="pb-3 sm:pb-4">
                        <CardTitle className="text-base sm:text-lg">Pagos Registrados</CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
                        <Table className="min-w-[500px] sm:min-w-0">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs sm:text-sm">Recibo #</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Fecha</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Cajero</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Medio</TableHead>
                                    <TableHead className="text-right text-xs sm:text-sm">Monto</TableHead>
                                    <TableHead className="text-center text-xs sm:text-sm w-10 sm:w-auto"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.ingreso_id}>
                                        <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">{payment.ingreso_id}</TableCell>
                                        <TableCell className="text-xs sm:text-sm py-2 sm:py-4">
                                            <span className="sm:hidden">
                                                {new Date(payment.fecha_transaccion).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })}
                                            </span>
                                            <span className="hidden sm:inline">
                                                {new Date(payment.fecha_transaccion).toLocaleString()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm py-2 sm:py-4 hidden sm:table-cell">{payment.cajero}</TableCell>
                                        <TableCell className="capitalize text-xs sm:text-sm py-2 sm:py-4">{payment.medio_pago}</TableCell>
                                        <TableCell className="text-right text-xs sm:text-sm py-2 sm:py-4">
                                            ${parseFloat(payment.monto_total_recibido).toLocaleString('es-CO')}
                                        </TableCell>
                                        <TableCell className="text-center py-2 sm:py-4">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(payment.ingreso_id)}
                                                disabled={downloading === payment.ingreso_id}
                                                className="h-8 w-8 p-0"
                                            >
                                                {downloading === payment.ingreso_id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Download className="h-4 w-4 text-primary" />
                                                )}
                                                <span className="sr-only">Descargar</span>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            )}

            {payments.length === 0 && !loading && !error && plate.length >= 3 && (
                <div className="text-center text-muted-foreground py-8 sm:py-10 text-sm sm:text-base">
                    No se encontraron pagos para este vehículo.
                </div>
            )}
        </div>
    );
}
