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
                    <div className="flex gap-4 items-start">
                        <div className="flex-1 max-w-md">
                            <PlacaAutocomplete
                                value={plate}
                                onChange={setPlate}
                                onSelect={(suggestion) => {
                                    setPlate(suggestion.placa);
                                    // Trigger search immediately on selection
                                    // We need to wait a tick for state to update or pass the value directly
                                    // But handleSearch uses 'plate' state. 
                                    // Better to just set state and let user click search or use effect?
                                    // The user requested dynamic search behavior similar to Taquilla.
                                    // But Taquilla just fills the form. 
                                    // Let's trigger search here for better UX.
                                    // We'll pass the suggestion.placa to a modified handleSearch or just rely on the user clicking search 
                                    // as the original code did, but the user asked for "same functionality".
                                    // In Taquilla, selecting fills the search.
                                    // Let's just fill it for now to be safe, user can click search.
                                }}
                                placeholder="Ingrese placa (ej: ABC123)"
                            />
                        </div>
                        <div className="w-48">
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
