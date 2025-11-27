import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import { pagosService } from "../services/pagosService";
import { Loader2, Download, Search } from "lucide-react";
import { Alert, AlertDescription } from "../components/ui/alert";

export default function HistorialPagos() {
    const [plate, setPlate] = useState("");
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [downloading, setDownloading] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (plate.length < 3) return;

        setLoading(true);
        setError(null);
        setPayments([]);

        try {
            const data = await pagosService.getHistorialPorVehiculo(plate);
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
            const a = document.createElement('a');
            a.href = url;
            a.download = `recibo_${ingresoId}.pdf`;
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
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Historial de Pagos</h1>
                <p className="text-muted-foreground">Consulte y descargue los recibos de pago históricos.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-primary" />
                        Buscar por Placa
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <Input
                            placeholder="Ingrese placa (ej: ABC123)"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            className="max-w-xs"
                        />
                        <Button type="submit" disabled={loading || plate.length < 3}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Buscar"}
                        </Button>
                    </form>
                    {error && (
                        <Alert variant="destructive" className="mt-4">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>

            {payments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pagos Registrados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Recibo #</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Cajero</TableHead>
                                    <TableHead>Medio de Pago</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.map((payment) => (
                                    <TableRow key={payment.ingreso_id}>
                                        <TableCell className="font-medium">{payment.ingreso_id}</TableCell>
                                        <TableCell>{new Date(payment.fecha_transaccion).toLocaleString()}</TableCell>
                                        <TableCell>{payment.cajero}</TableCell>
                                        <TableCell className="capitalize">{payment.medio_pago}</TableCell>
                                        <TableCell className="text-right">
                                            ${parseFloat(payment.monto_total_recibido).toLocaleString('es-CO')}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDownload(payment.ingreso_id)}
                                                disabled={downloading === payment.ingreso_id}
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
                <div className="text-center text-muted-foreground py-10">
                    No se encontraron pagos para este vehículo.
                </div>
            )}
        </div>
    );
}
