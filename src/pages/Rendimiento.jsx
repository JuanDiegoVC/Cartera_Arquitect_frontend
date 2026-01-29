import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Clock,
  Car,
  CreditCard,
  Receipt,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { rendimientoService } from "../services/rendimientoService";
import { getTodayLocalDate, getCurrentMonthLocal, toLocalDateString } from "../utils/formatters";

// Componente para mostrar una métrica con comparación
const MetricaCard = ({
  titulo,
  valor,
  valorAnterior,
  variacion,
  icono: Icon,
  formato = "currency",
}) => {
  const formatValue = (val) => {
    if (formato === "currency") {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(val);
    } else if (formato === "percent") {
      return `${val}%`;
    }
    return val.toLocaleString("es-CO");
  };

  const getVariacionColor = () => {
    if (variacion > 0) return "text-green-600";
    if (variacion < 0) return "text-red-600";
    return "text-gray-500";
  };

  const getVariacionIcon = () => {
    if (variacion > 0) return <ArrowUpRight className="h-4 w-4" />;
    if (variacion < 0) return <ArrowDownRight className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  return (
    <Card className="min-w-0">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs sm:text-sm font-medium truncate pr-2">{titulo}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg sm:text-2xl font-bold truncate">{formatValue(valor)}</div>
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
          <span className={`flex items-center text-xs sm:text-sm ${getVariacionColor()}`}>
            {getVariacionIcon()}
            {Math.abs(variacion)}%
          </span>
          <span className="text-[10px] sm:text-xs text-muted-foreground truncate">
            vs {formatValue(valorAnterior)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de barra simple para gráficas
const SimpleBar = ({ value, maxValue, label, color = "bg-primary" }) => {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div className="w-10 sm:w-20 text-[10px] sm:text-xs text-right text-muted-foreground truncate flex-shrink-0">
        {label}
      </div>
      <div className="flex-1 h-4 sm:h-6 bg-muted rounded-full overflow-hidden min-w-0">
        <div
          className={`h-full ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="w-16 sm:w-24 text-[10px] sm:text-sm font-medium text-right flex-shrink-0">
        {new Intl.NumberFormat("es-CO", {
          style: "currency",
          currency: "COP",
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
          notation: window.innerWidth < 640 ? "compact" : "standard",
        }).format(value)}
      </div>
    </div>
  );
};

// Componente de gráfica de distribución (pie chart simplificado)
const DistribucionChart = ({ data, titulo }) => {
  const total = data.reduce((acc, item) => acc + item.valor, 0);
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base">{titulo}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Barra de distribución horizontal */}
        <div className="h-3 sm:h-4 rounded-full overflow-hidden flex mb-3 sm:mb-4">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.valor / total) * 100 : 0;
            return (
              <div
                key={item.nombre}
                className={`${
                  colors[index % colors.length]
                } transition-all duration-300`}
                style={{ width: `${percentage}%` }}
                title={`${item.nombre}: ${percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>
        {/* Leyenda */}
        <div className="space-y-1.5 sm:space-y-2">
          {data.map((item, index) => {
            const percentage = total > 0 ? (item.valor / total) * 100 : 0;
            return (
              <div
                key={item.nombre}
                className="flex items-center justify-between text-xs sm:text-sm gap-2"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1">
                  <div
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                      colors[index % colors.length]
                    }`}
                  />
                  <span className="truncate">{item.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                  <span className="text-muted-foreground text-[10px] sm:text-xs">
                    {percentage.toFixed(0)}%
                  </span>
                  <span className="font-medium text-[10px] sm:text-sm">
                    {new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      notation: "compact",
                      maximumFractionDigits: 1,
                    }).format(item.valor)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de gráfica de barras por hora
const RecaudoPorHoraChart = ({ dataHoy, dataAyer }) => {
  const maxValue = Math.max(
    ...dataHoy.map((d) => d.valor),
    ...dataAyer.map((d) => d.valor)
  );

  // Solo mostrar horas con actividad o horas típicas de trabajo (6-20)
  const horasActivas = dataHoy
    .filter((d, i) => i >= 6 && i <= 20)
    .map((d, i) => ({
      ...d,
      valorAyer: dataAyer[i + 6]?.valor || 0,
    }));

  return (
    <Card className="col-span-1 sm:col-span-2 min-w-0 overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recaudo por Hora
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Comparación con el día anterior</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-primary" />
            <span>Hoy</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-muted-foreground/30" />
            <span>Ayer</span>
          </div>
        </div>
        <div className="space-y-1.5 sm:space-y-2 max-h-[300px] sm:max-h-none overflow-y-auto">
          {horasActivas.map((hora) => (
            <div key={hora.hora} className="flex items-center gap-1.5 sm:gap-2">
              <div className="w-8 sm:w-12 text-[10px] sm:text-xs text-muted-foreground flex-shrink-0">
                {hora.hora}
              </div>
              <div className="flex-1 flex gap-0.5 sm:gap-1 min-w-0">
                <div className="flex-1 h-3 sm:h-4 bg-muted rounded overflow-hidden relative">
                  <div
                    className="absolute inset-y-0 left-0 bg-muted-foreground/30 transition-all"
                    style={{
                      width: `${
                        maxValue > 0 ? (hora.valorAyer / maxValue) * 100 : 0
                      }%`,
                    }}
                  />
                  <div
                    className="absolute inset-y-0 left-0 bg-primary transition-all"
                    style={{
                      width: `${
                        maxValue > 0 ? (hora.valor / maxValue) * 100 : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="w-12 sm:w-20 text-[10px] sm:text-xs text-right flex-shrink-0">
                {hora.valor > 0
                  ? new Intl.NumberFormat("es-CO", {
                    notation: "compact",
                    maximumFractionDigits: 0,
                  }).format(hora.valor)
                  : "-"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de tendencia diaria del mes
const TendenciaDiariaChart = ({
  dataActual,
  dataAnterior,
  mesActual,
  mesAnterior,
}) => {
  const maxValue = Math.max(
    ...dataActual.map((d) => d.valor),
    ...dataAnterior.map((d) => d.valor)
  );

  return (
    <Card className="col-span-1 sm:col-span-2 min-w-0 overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Tendencia Diaria
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          {mesActual} vs {mesAnterior}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-primary" />
            <span className="truncate">{mesActual}</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-muted-foreground/30" />
            <span className="truncate">{mesAnterior}</span>
          </div>
        </div>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="h-36 sm:h-48 flex items-end gap-0.5 sm:gap-1 min-w-[400px] sm:min-w-0">
            {dataActual.map((dia, index) => {
              const valorAnterior =
                dataAnterior.find((d) => d.dia === dia.dia)?.valor || 0;
              const heightActual =
                maxValue > 0 ? (dia.valor / maxValue) * 100 : 0;
              const heightAnterior =
                maxValue > 0 ? (valorAnterior / maxValue) * 100 : 0;

              return (
                <div
                  key={dia.dia}
                  className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1 min-w-[8px]"
                >
                  <div className="w-full flex gap-[1px] items-end h-28 sm:h-40">
                    <div
                      className="flex-1 bg-muted-foreground/30 rounded-t transition-all"
                      style={{ height: `${heightAnterior}%` }}
                      title={`${mesAnterior}: ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        notation: "compact",
                      }).format(valorAnterior)}`}
                    />
                    <div
                      className="flex-1 bg-primary rounded-t transition-all"
                      style={{ height: `${heightActual}%` }}
                      title={`${mesActual}: ${new Intl.NumberFormat("es-CO", {
                        style: "currency",
                        currency: "COP",
                        notation: "compact",
                      }).format(dia.valor)}`}
                    />
                  </div>
                  {index % 5 === 0 && (
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                      {dia.dia}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente de histórico de meses
const HistoricoMesesChart = ({ data }) => {
  const maxValue = Math.max(...data.map((d) => Math.max(d.recaudo, d.egresos)));

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="pb-2 sm:pb-4">
        <CardTitle className="text-sm sm:text-base flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Histórico (6 meses)
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex gap-3 sm:gap-4 mb-3 sm:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-green-500" />
            <span>Recaudo</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded bg-red-500" />
            <span>Egresos</span>
          </div>
        </div>
        <div className="h-28 sm:h-32 flex items-end gap-1.5 sm:gap-2">
          {data.map((mes) => {
            const heightRecaudo =
              maxValue > 0 ? (mes.recaudo / maxValue) * 100 : 0;
            const heightEgresos =
              maxValue > 0 ? (mes.egresos / maxValue) * 100 : 0;

            return (
              <div
                key={`${mes.mes}-${mes.año}`}
                className="flex-1 flex flex-col items-center min-w-0"
              >
                <div className="w-full flex gap-[1px] sm:gap-[2px] items-end h-20 sm:h-24">
                  <div
                    className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
                    style={{ height: `${heightRecaudo}%` }}
                    title={`Recaudo: ${new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      notation: "compact",
                    }).format(mes.recaudo)}`}
                  />
                  <div
                    className="flex-1 bg-red-500 rounded-t transition-all hover:bg-red-600"
                    style={{ height: `${heightEgresos}%` }}
                    title={`Egresos: ${new Intl.NumberFormat("es-CO", {
                      style: "currency",
                      currency: "COP",
                      notation: "compact",
                    }).format(mes.egresos)}`}
                  />
                </div>
                <span className="text-[8px] sm:text-[10px] text-muted-foreground mt-1 truncate w-full text-center">
                  {mes.mes}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Componente principal de Rendimiento
const Rendimiento = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "diario"
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataDiario, setDataDiario] = useState(null);
  const [dataMensual, setDataMensual] = useState(null);

  // Estados para navegación de fecha
  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    searchParams.get("fecha") || getTodayLocalDate()
  );
  const [mesSeleccionado, setMesSeleccionado] = useState(
    searchParams.get("mes") || getCurrentMonthLocal()
  );

  // Cargar datos según la pestaña activa
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        if (activeTab === "diario") {
          const data = await rendimientoService.getRendimientoDiario(
            fechaSeleccionada
          );
          setDataDiario(data);
        } else {
          const data = await rendimientoService.getRendimientoMensual(
            mesSeleccionado
          );
          setDataMensual(data);
        }
      } catch (err) {
        console.error("Error cargando datos de rendimiento:", err);
        setError(err.error || "Error al cargar los datos de rendimiento");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, fechaSeleccionada, mesSeleccionado]);

  // Actualizar URL al cambiar pestaña
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (activeTab === "diario") {
      params.set("fecha", fechaSeleccionada);
    } else {
      params.set("mes", mesSeleccionado);
    }
    setSearchParams(params, { replace: true });
  }, [activeTab, fechaSeleccionada, mesSeleccionado, setSearchParams]);

  // Navegación de fechas
  const navegarFecha = (direccion) => {
    const fecha = new Date(fechaSeleccionada);
    fecha.setDate(fecha.getDate() + direccion);
    setFechaSeleccionada(toLocalDateString(fecha));
  };

  const navegarMes = (direccion) => {
    const [año, mes] = mesSeleccionado.split("-").map(Number);
    const nuevaFecha = new Date(año, mes - 1 + direccion, 1);
    setMesSeleccionado(nuevaFecha.toISOString().slice(0, 7));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Rendimiento
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Análisis de métricas y desempeño del sistema de recaudos
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        <button
          onClick={() => setActiveTab("diario")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${activeTab === "diario"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline-block mr-1.5 sm:mr-2" />
          Rendimiento Diario
        </button>
        <button
          onClick={() => setActiveTab("mensual")}
          className={`px-3 sm:px-4 py-2 font-medium text-xs sm:text-sm transition-colors relative whitespace-nowrap ${activeTab === "mensual"
              ? "text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 inline-block mr-1.5 sm:mr-2" />
          Rendimiento Mensual
        </button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Contenido Diario */}
      {activeTab === "diario" && dataDiario && (
        <div className="space-y-4 sm:space-y-6">
          {/* Navegación de fecha */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarFecha(-1)}
                className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="flex-1 sm:w-auto text-sm sm:text-base"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarFecha(1)}
                disabled={fechaSeleccionada >= getTodayLocalDate()}
                className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Badge variant="outline" className="text-xs sm:text-sm">
              vs{" "}
              {new Date(dataDiario.fecha_comparacion).toLocaleDateString(
                "es-CO",
                {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }
              )}
            </Badge>
          </div>

          {/* Métricas principales */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-3">
            <MetricaCard
              titulo="Recaudo Total"
              valor={dataDiario.metricas.recaudo_total.valor}
              valorAnterior={dataDiario.metricas.recaudo_total.anterior}
              variacion={dataDiario.metricas.recaudo_total.variacion}
              icono={DollarSign}
              formato="currency"
            />
            <MetricaCard
              titulo="Transacciones"
              valor={dataDiario.metricas.transacciones.valor}
              valorAnterior={dataDiario.metricas.transacciones.anterior}
              variacion={dataDiario.metricas.transacciones.variacion}
              icono={Receipt}
              formato="number"
            />
            <MetricaCard
              titulo="Ticket Promedio"
              valor={dataDiario.metricas.ticket_promedio.valor}
              valorAnterior={dataDiario.metricas.ticket_promedio.anterior}
              variacion={dataDiario.metricas.ticket_promedio.variacion}
              icono={CreditCard}
              formato="currency"
            />
            <MetricaCard
              titulo="Vehículos que Pagaron"
              valor={dataDiario.metricas.vehiculos_pagaron.valor}
              valorAnterior={dataDiario.metricas.vehiculos_pagaron.anterior}
              variacion={dataDiario.metricas.vehiculos_pagaron.variacion}
              icono={Car}
              formato="number"
            />
            <MetricaCard
              titulo="Egresos Total"
              valor={dataDiario.metricas.egresos_total.valor}
              valorAnterior={dataDiario.metricas.egresos_total.anterior}
              variacion={dataDiario.metricas.egresos_total.variacion}
              icono={TrendingDown}
              formato="currency"
            />
            <MetricaCard
              titulo="Balance Neto"
              valor={dataDiario.metricas.balance_neto.valor}
              valorAnterior={dataDiario.metricas.balance_neto.anterior}
              variacion={dataDiario.metricas.balance_neto.variacion}
              icono={TrendingUp}
              formato="currency"
            />
          </div>

          {/* Gráficas */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {dataDiario.graficas.recaudo_por_hora && (
              <RecaudoPorHoraChart
                dataHoy={dataDiario.graficas.recaudo_por_hora.hoy}
                dataAyer={dataDiario.graficas.recaudo_por_hora.ayer}
              />
            )}

            {dataDiario.graficas.distribucion_rubro?.length > 0 && (
              <DistribucionChart
                data={dataDiario.graficas.distribucion_rubro}
                titulo="Distribución por Rubro"
              />
            )}

            {dataDiario.graficas.distribucion_tipo_vehiculo?.length > 0 && (
              <DistribucionChart
                data={dataDiario.graficas.distribucion_tipo_vehiculo}
                titulo="Distribución por Tipo de Vehículo"
              />
            )}

            {dataDiario.graficas.distribucion_medio_pago?.length > 0 && (
              <DistribucionChart
                data={dataDiario.graficas.distribucion_medio_pago}
                titulo="Distribución por Medio de Pago"
              />
            )}
          </div>

          {/* Últimas transacciones */}
          {dataDiario.ultimas_transacciones?.length > 0 && (
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base">
                  Últimas Transacciones del Día
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
                <Table className="min-w-[500px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs sm:text-sm">Hora</TableHead>
                      <TableHead className="text-xs sm:text-sm">Placa</TableHead>
                      <TableHead className="text-xs sm:text-sm">Medio</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Cajero</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataDiario.ultimas_transacciones.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="font-mono text-xs sm:text-sm py-2 sm:py-4">{tx.hora}</TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">
                          {tx.placa}
                        </TableCell>
                        <TableCell className="py-2 sm:py-4">
                          <Badge variant="outline" className="text-[10px] sm:text-xs">{tx.medio_pago}</Badge>
                        </TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 sm:py-4 hidden sm:table-cell">{tx.cajero}</TableCell>
                        <TableCell className="text-right font-medium text-xs sm:text-sm py-2 sm:py-4">
                          {formatCurrency(tx.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Contenido Mensual */}
      {activeTab === "mensual" && dataMensual && (
        <div className="space-y-6">
          {/* Navegación de mes */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarMes(-1)}
                className="shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="month"
                value={mesSeleccionado}
                onChange={(e) => setMesSeleccionado(e.target.value)}
                className="w-full sm:w-auto min-w-[150px]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => navegarMes(1)}
                disabled={mesSeleccionado >= getCurrentMonthLocal()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-xs sm:text-sm">
                {dataMensual.periodo.mes_nombre} {dataMensual.periodo.año}
              </Badge>
              <span className="text-muted-foreground text-xs sm:text-sm">
                vs
              </span>
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {dataMensual.periodo_anterior.mes_nombre}{" "}
                {dataMensual.periodo_anterior.año}
              </Badge>
            </div>
          </div>

          {/* Métricas principales */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricaCard
              titulo="Recaudo Total"
              valor={dataMensual.metricas.recaudo_total.valor}
              valorAnterior={dataMensual.metricas.recaudo_total.anterior}
              variacion={dataMensual.metricas.recaudo_total.variacion}
              icono={DollarSign}
              formato="currency"
            />
            <MetricaCard
              titulo="Cartera Generada"
              valor={dataMensual.metricas.cartera_generada.valor}
              valorAnterior={dataMensual.metricas.cartera_generada.anterior}
              variacion={dataMensual.metricas.cartera_generada.variacion}
              icono={Receipt}
              formato="currency"
            />
            <MetricaCard
              titulo="Tasa Recaudo"
              valor={dataMensual.metricas.tasa_recaudo.valor}
              valorAnterior={dataMensual.metricas.tasa_recaudo.anterior}
              variacion={dataMensual.metricas.tasa_recaudo.variacion}
              icono={TrendingUp}
              formato="percent"
            />
            <MetricaCard
              titulo="Balance Neto"
              valor={dataMensual.metricas.balance_neto.valor}
              valorAnterior={dataMensual.metricas.balance_neto.anterior}
              variacion={dataMensual.metricas.balance_neto.variacion}
              icono={BarChart3}
              formato="currency"
            />
          </div>

          {/* Segunda fila de métricas */}
          <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
            <MetricaCard
              titulo="Egresos Total"
              valor={dataMensual.metricas.egresos_total.valor}
              valorAnterior={dataMensual.metricas.egresos_total.anterior}
              variacion={dataMensual.metricas.egresos_total.variacion}
              icono={TrendingDown}
              formato="currency"
            />
            <MetricaCard
              titulo="Transacciones"
              valor={dataMensual.metricas.transacciones.valor}
              valorAnterior={dataMensual.metricas.transacciones.anterior}
              variacion={dataMensual.metricas.transacciones.variacion}
              icono={Receipt}
              formato="number"
            />
            <MetricaCard
              titulo="Días Laborados"
              valor={dataMensual.metricas.dias_laborados.valor}
              valorAnterior={dataMensual.metricas.dias_laborados.anterior}
              variacion={dataMensual.metricas.dias_laborados.variacion}
              icono={Calendar}
              formato="number"
            />
            <MetricaCard
              titulo="Prom. Diario"
              valor={dataMensual.metricas.promedio_diario.valor}
              valorAnterior={dataMensual.metricas.promedio_diario.anterior}
              variacion={dataMensual.metricas.promedio_diario.variacion}
              icono={DollarSign}
              formato="currency"
            />
          </div>

          {/* Gráficas */}
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {dataMensual.graficas.tendencia_diaria && (
              <TendenciaDiariaChart
                dataActual={dataMensual.graficas.tendencia_diaria.actual}
                dataAnterior={dataMensual.graficas.tendencia_diaria.anterior}
                mesActual={dataMensual.periodo.mes_nombre}
                mesAnterior={dataMensual.periodo_anterior.mes_nombre}
              />
            )}

            {dataMensual.graficas.historico_6_meses?.length > 0 && (
              <HistoricoMesesChart
                data={dataMensual.graficas.historico_6_meses}
              />
            )}

            {dataMensual.graficas.recaudo_por_rubro?.length > 0 && (
              <DistribucionChart
                data={dataMensual.graficas.recaudo_por_rubro}
                titulo="Recaudo por Concepto"
              />
            )}

            {dataMensual.graficas.recaudo_por_dia_semana?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Recaudo por Día de Semana
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {dataMensual.graficas.recaudo_por_dia_semana.map((dia) => (
                    <SimpleBar
                      key={dia.dia}
                      value={dia.total}
                      maxValue={Math.max(
                        ...dataMensual.graficas.recaudo_por_dia_semana.map(
                          (d) => d.total
                        )
                      )}
                      label={dia.dia.slice(0, 3)}
                      color="bg-primary"
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top vehículos */}
          {dataMensual.graficas.top_vehiculos?.length > 0 && (
            <Card className="min-w-0 overflow-hidden">
              <CardHeader className="pb-2 sm:pb-4">
                <CardTitle className="text-sm sm:text-base flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Top 10 Vehículos Recaudadores
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-6">
                <Table className="min-w-[400px] sm:min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 sm:w-12 text-xs sm:text-sm">#</TableHead>
                      <TableHead className="text-xs sm:text-sm">Placa</TableHead>
                      <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Propietario</TableHead>
                      <TableHead className="text-right text-xs sm:text-sm">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataMensual.graficas.top_vehiculos.map((vehiculo, index) => (
                      <TableRow key={vehiculo.placa}>
                        <TableCell className="py-2 sm:py-4">
                          <Badge
                            variant={index < 3 ? "default" : "outline"}
                            className={`text-[10px] sm:text-xs ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                  ? "bg-gray-400"
                                  : index === 2
                                    ? "bg-amber-700"
                                    : ""
                            }`}
                          >
                            {index + 1}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-xs sm:text-sm py-2 sm:py-4">{vehiculo.placa}</TableCell>
                        <TableCell className="text-xs sm:text-sm py-2 sm:py-4 hidden sm:table-cell">{vehiculo.propietario}</TableCell>
                        <TableCell className="text-right font-medium text-xs sm:text-sm py-2 sm:py-4">
                          {formatCurrency(vehiculo.valor)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default Rendimiento;
