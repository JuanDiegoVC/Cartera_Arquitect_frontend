import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { reportesService } from "../../services/reportesService";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PieChart,
    Calendar,
    Loader2,
} from "lucide-react";

export default function ReporteMensualModal({ open, onOpenChange }) {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    // Default to current month
    const [selectedMonth, setSelectedMonth] = useState(
        new Date().toISOString().slice(0, 7) // YYYY-MM
    );

    const fetchReporte = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Calculate start and end of month
            const [year, month] = selectedMonth.split("-");
            const startDate = `${year}-${month}-01`;
            // Last day of month
            const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

            const result = await reportesService.getReporteMensual({
                periodo_inicio: startDate,
                periodo_fin: endDate,
            });
            setData(result);
        } catch (err) {
            console.error("Error fetching report:", err);
            setError("No se pudo cargar el reporte mensual.");
        } finally {
            setLoading(false);
        }
    }, [selectedMonth]);

    useEffect(() => {
        if (open && selectedMonth) {
            fetchReporte();
        }
    }, [open, selectedMonth, fetchReporte]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(val);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <TrendingUp className="h-6 w-6 text-primary" />
                        Reporte Mensual de Desempeño
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Controls */}
                    <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <span className="text-sm font-medium">Seleccionar Mes:</span>
                        </div>
                        <Input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="w-48"
                        />
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchReporte}
                            disabled={loading}
                            className="ml-auto"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
                        </Button>
                    </div>

                    {error && (
                        <div className="p-4 rounded-md bg-destructive/10 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {loading && !data && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}

                    {data && !loading && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Recaudos */}
                                <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">Total Recaudos</p>
                                            <h3 className="text-2xl font-bold text-success mt-1">
                                                {formatCurrency(data.resumen.total_recaudos)}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-success/10 rounded-lg">
                                            <TrendingUp className="h-5 w-5 text-success" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Ingresos por taquilla y transferencias
                                    </p>
                                </div>

                                {/* Egresos */}
                                <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">Total Egresos</p>
                                            <h3 className="text-2xl font-bold text-destructive mt-1">
                                                {formatCurrency(data.resumen.total_egresos)}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-destructive/10 rounded-lg">
                                            <TrendingDown className="h-5 w-5 text-destructive" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Gastos operativos y administrativos
                                    </p>
                                </div>

                                {/* Balance */}
                                <div className="bg-card border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-sm text-muted-foreground font-medium">Balance Neto</p>
                                            <h3 className={`text-2xl font-bold mt-1 ${data.resumen.balance_neto >= 0 ? 'text-blue-600' : 'text-destructive'}`}>
                                                {formatCurrency(data.resumen.balance_neto)}
                                            </h3>
                                        </div>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <DollarSign className="h-5 w-5 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Utilidad operativa del periodo
                                    </p>
                                </div>
                            </div>

                            {/* Portfolio Section */}
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <div className="flex items-center gap-2 mb-4">
                                    <PieChart className="h-5 w-5 text-primary" />
                                    <h3 className="text-lg font-semibold">Estado de Cartera del Mes</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                                            <span className="text-sm font-medium">Cartera Generada</span>
                                            <span className="font-bold">{formatCurrency(data.cartera.total_generada)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-success/10 rounded-lg border border-success/20">
                                            <span className="text-sm font-medium text-success-foreground">Recaudado</span>
                                            <span className="font-bold text-success">{formatCurrency(data.cartera.recaudada)}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-warning/10 rounded-lg border border-warning/20">
                                            <span className="text-sm font-medium text-warning-foreground">Pendiente por Cobrar</span>
                                            <span className="font-bold text-warning-foreground">{formatCurrency(data.cartera.pendiente)}</span>
                                        </div>
                                    </div>

                                    {/* Simple CSS Progress Bar for Portfolio */}
                                    <div className="text-center">
                                        <div className="relative pt-1">
                                            <div className="flex mb-2 items-center justify-between">
                                                <div>
                                                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-success bg-success/20">
                                                        Recaudado
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs font-semibold inline-block text-success">
                                                        {data.cartera.porcentaje_recaudo}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="overflow-hidden h-4 mb-4 text-xs flex rounded bg-success/20">
                                                <div
                                                    style={{ width: `${data.cartera.porcentaje_recaudo}%` }}
                                                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-success transition-all duration-500"
                                                ></div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Porcentaje de cumplimiento de recaudo sobre la facturación del mes.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Daily Trend Chart (Simple CSS Bar Chart) */}
                            <div className="bg-card border rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-semibold mb-6">Tendencia Diaria (Ingresos vs Egresos)</h3>

                                {data.grafica_tendencia.length > 0 ? (
                                    <div className="h-64 flex items-end gap-2 overflow-x-auto pb-2">
                                        {data.grafica_tendencia.map((dia, index) => {
                                            // Normalize heights relative to max value
                                            const maxVal = Math.max(
                                                ...data.grafica_tendencia.map(d => Math.max(d.ingresos, d.egresos))
                                            ) || 1;

                                            const hIngreso = (dia.ingresos / maxVal) * 100;
                                            const hEgreso = (dia.egresos / maxVal) * 100;

                                            return (
                                                <div key={index} className="flex flex-col items-center gap-1 min-w-[40px] group relative">
                                                    {/* Tooltip */}
                                                    <div className="absolute bottom-full mb-2 hidden group-hover:block bg-popover text-popover-foreground text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap border">
                                                        <p className="font-bold">{dia.dia}</p>
                                                        <p className="text-success">Ing: {formatCurrency(dia.ingresos)}</p>
                                                        <p className="text-destructive">Egr: {formatCurrency(dia.egresos)}</p>
                                                    </div>

                                                    <div className="flex gap-1 items-end h-full w-full justify-center">
                                                        <div
                                                            className="w-3 bg-success rounded-t-sm transition-all hover:bg-success/80"
                                                            style={{ height: `${Math.max(hIngreso, 1)}%` }}
                                                        ></div>
                                                        <div
                                                            className="w-3 bg-destructive rounded-t-sm transition-all hover:bg-destructive/80"
                                                            style={{ height: `${Math.max(hEgreso, 1)}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-[10px] text-muted-foreground rotate-45 origin-left translate-y-2 mt-1">
                                                        {dia.dia.slice(8)} {/* Show only day number */}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-12 text-muted-foreground">
                                        No hay datos de movimientos para este periodo.
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
