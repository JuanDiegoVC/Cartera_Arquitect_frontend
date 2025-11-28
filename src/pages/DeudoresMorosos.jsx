import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Search, AlertCircle, TrendingUp, CheckCircle } from "lucide-react";
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

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">Deudores Morosos</h1>
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
