import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DollarSign,
  CreditCard,
  TrendingDown,
  Printer,
  Loader2,
  AlertCircle,
  RefreshCw,
  History,
  Save,
  Eye,
  Search,
  Clock,
  X,
} from "lucide-react";
import { reportesService } from "@/services/reportesService";
import { toast } from "sonner";
import BotonDescargarCierreTurno from "@/components/Reportes/BotonDescargarCierreTurno";
import CierreTurnoDocument from "@/components/Reportes/CierreTurnoDocument";
import ResumenPorConcepto from "@/components/Reportes/ResumenPorConcepto";
import { agruparPorConcepto } from "@/utils/agruparPorConcepto";
import { pdf } from "@react-pdf/renderer";
import { useAuth } from "@/hooks/useAuth";
import { formatLocalDate } from "@/utils/formatters";

/**
 * Componente CierreDeTurno
 * Sprint 3: Control Financiero - Cierre de Turno Detallado con Historial
 *
 * Muestra un dashboard de auditoría para el cajero con:
 * - Tarjetas de resumen con totales
 * - Tablas detalladas de ingresos y egresos
 * - Opción de guardar e imprimir el reporte
 * - Historial de cierres anteriores
 * - Guardado automático a las 11:59 PM o al cerrar sesión
 */

// Constantes para horarios de cierre
const HORA_HABILITAR_BOTON = { hora: 19, minuto: 0 }; // 7:00 PM
const HORA_CIERRE_AUTOMATICO = { hora: 23, minuto: 59 }; // 11:59 PM

const CierreDeTurno = () => {
  const { user, registerPreLogoutCallback } = useAuth();
  const [vistaActual, setVistaActual] = useState("hoy"); // 'hoy' o 'historial'
  const [datos, setDatos] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cierreSeleccionado, setCierreSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState(null);

  // Estados para control de horario de cierre
  const [botonHabilitado, setBotonHabilitado] = useState(false);
  const [cierreGuardadoHoy, setCierreGuardadoHoy] = useState(false);

  // Estados para filtros
  const [filtroPlaca, setFiltroPlaca] = useState("");
  const [filtroTiempo, setFiltroTiempo] = useState("todo"); // 'todo', '1h', '2h', '4h', '8h'

  const cargarDatos = async () => {
    setCargando(true);
    setError(null);
    try {
      if (vistaActual === "hoy") {
        const response = await reportesService.obtenerCierreTurno();
        setDatos(response);
      } else if (vistaActual === "historial") {
        const response = await reportesService.obtenerHistorialCierres();
        // Asegurar que siempre sea un array
        setHistorial(Array.isArray(response) ? response : []);
      }
    } catch (err) {
      console.error("Error al cargar cierre de turno:", err);
      setError(err.detalle || err.error || "Error al cargar los datos");
      setHistorial([]); // Reset a array vacío en caso de error
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vistaActual]);

  // Verificar si el botón debe estar habilitado (después de las 7:00 PM)
  const verificarHorarioBoton = () => {
    const ahora = new Date();
    const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
    const horaHabilitarMinutos =
      HORA_HABILITAR_BOTON.hora * 60 + HORA_HABILITAR_BOTON.minuto;
    return horaActualMinutos >= horaHabilitarMinutos;
  };

  // Efecto para actualizar la hora y verificar horarios cada minuto
  useEffect(() => {
    const verificarHorarios = () => {
      // Verificar si debe habilitarse el botón
      const debeHabilitar = verificarHorarioBoton();
      setBotonHabilitado(debeHabilitar);

      // Verificar si es hora de cierre automático (11:59 PM)
      const ahora = new Date();
      const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
      const horaCierreMinutos =
        HORA_CIERRE_AUTOMATICO.hora * 60 + HORA_CIERRE_AUTOMATICO.minuto;

      if (
        horaActualMinutos === horaCierreMinutos &&
        !cierreGuardadoHoy &&
        datos
      ) {
        console.log("Ejecutando cierre automático a las 11:59 PM");
        // Llamar al guardado automático - no agregamos a deps porque solo se ejecuta en la condición específica
        guardarCierreAutomatico("Cierre automático programado (11:59 PM)");
      }
    };

    // Verificar inmediatamente
    verificarHorarios();

    // Verificar cada minuto
    const intervalo = setInterval(verificarHorarios, 60000);

    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, cierreGuardadoHoy]);

  // Efecto para manejar el cierre de sesión y guardar automáticamente
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Solo intentar guardar si estamos después de las 7:00 PM y no se ha guardado
      if (verificarHorarioBoton() && !cierreGuardadoHoy && datos) {
        // Usar sendBeacon para enviar datos antes de cerrar
        const fechaLocal = new Date();
        const year = fechaLocal.getFullYear();
        const month = String(fechaLocal.getMonth() + 1).padStart(2, "0");
        const day = String(fechaLocal.getDate()).padStart(2, "0");
        const fechaCierre = `${year}-${month}-${day}`;

        const cierreData = {
          fecha_cierre: fechaCierre,
          total_ingresos_efectivo: datos.resumen.total_ingresos_efectivo,
          total_ingresos_digitales: datos.resumen.total_ingresos_digitales,
          total_egresos: datos.resumen.total_egresos,
          balance_caja_fisica: datos.resumen.balance_caja_fisica,
          detalle_ingresos: datos.movimientos.ingresos,
          detalle_egresos: datos.movimientos.egresos,
          observaciones: "Cierre automático al cerrar navegador/pestaña",
        };

        // Intentar usar sendBeacon para mayor confiabilidad al cerrar
        const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

        if (navigator.sendBeacon) {
          const blob = new Blob([JSON.stringify(cierreData)], {
            type: "application/json",
          });
          navigator.sendBeacon(
            `${apiUrl}/api/reportes/cierre-turno/guardar/`,
            blob
          );
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [datos, cierreGuardadoHoy]);

  // Registrar callback para cierre automático al hacer logout
  useEffect(() => {
    const handlePreLogoutCierre = async () => {
      if (verificarHorarioBoton() && !cierreGuardadoHoy && datos) {
        await guardarCierreAutomatico("Cierre automático al cerrar sesión");
      }
    };

    // Registrar el callback y obtener función de limpieza
    const unregister = registerPreLogoutCallback(handlePreLogoutCierre);

    return () => {
      unregister();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datos, cierreGuardadoHoy, registerPreLogoutCallback]);

  // Función para guardar cierre automáticamente
  const guardarCierreAutomatico = async (motivo) => {
    if (!datos || cierreGuardadoHoy || guardando) return;

    try {
      setGuardando(true);

      const fechaLocal = new Date();
      const year = fechaLocal.getFullYear();
      const month = String(fechaLocal.getMonth() + 1).padStart(2, "0");
      const day = String(fechaLocal.getDate()).padStart(2, "0");
      const fechaCierre = `${year}-${month}-${day}`;

      // Calcular totales por concepto para el guardado automático
      const totalesIngresos = agruparPorConcepto(datos.movimientos.ingresos, "concepto", "monto");
      const totalesEgresos = agruparPorConcepto(datos.movimientos.egresos, "categoria", "monto");

      const cierreData = {
        fecha_cierre: fechaCierre,
        total_ingresos_efectivo: datos.resumen.total_ingresos_efectivo,
        total_ingresos_digitales: datos.resumen.total_ingresos_digitales,
        total_egresos: datos.resumen.total_egresos,
        balance_caja_fisica: datos.resumen.balance_caja_fisica,
        detalle_ingresos: datos.movimientos.ingresos,
        detalle_egresos: datos.movimientos.egresos,
        // Totales agrupados por concepto/categoría
        totales_por_concepto: {
          ingresos: totalesIngresos.resumenOrdenado,
          egresos: totalesEgresos.resumenOrdenado,
        },
        observaciones: motivo,
      };

      const response = await reportesService.guardarCierreTurno(cierreData);
      setCierreGuardadoHoy(true);
      toast.success("Cierre de turno guardado automáticamente", {
        description: `${motivo}. Balance: ${formatearMoneda(
          response.cierre.balance_caja_fisica
        )}`,
      });
    } catch (err) {
      console.error("Error al guardar cierre automático:", err);
      // Si es error de duplicado, marcar como ya guardado
      if (
        err.detalle?.includes("ya existe") ||
        err.error?.includes("ya existe")
      ) {
        setCierreGuardadoHoy(true);
      } else {
        toast.error("Error al guardar el cierre automático", {
          description: err.detalle || err.error || "Se reintentará más tarde",
        });
      }
    } finally {
      setGuardando(false);
    }
  };

  const guardarCierre = async () => {
    if (!datos) return;

    try {
      setGuardando(true);

      // Obtener fecha local en formato YYYY-MM-DD
      const fechaLocal = new Date();
      const year = fechaLocal.getFullYear();
      const month = String(fechaLocal.getMonth() + 1).padStart(2, "0");
      const day = String(fechaLocal.getDate()).padStart(2, "0");
      const fechaCierre = `${year}-${month}-${day}`;

      // Transformar datos al formato esperado por el backend
      const cierreData = {
        fecha_cierre: fechaCierre,
        total_ingresos_efectivo: datos.resumen.total_ingresos_efectivo,
        total_ingresos_digitales: datos.resumen.total_ingresos_digitales,
        total_egresos: datos.resumen.total_egresos,
        balance_caja_fisica: datos.resumen.balance_caja_fisica,
        detalle_ingresos: datos.movimientos.ingresos,
        detalle_egresos: datos.movimientos.egresos,
        // Totales agrupados por concepto/categoría
        totales_por_concepto: {
          ingresos: totalesIngresosPorConcepto.resumenOrdenado,
          egresos: totalesEgresosPorCategoria.resumenOrdenado,
        },
        observaciones: "Cierre manual",
      };

      const response = await reportesService.guardarCierreTurno(cierreData);
      setCierreGuardadoHoy(true);
      toast.success("Cierre de turno guardado exitosamente", {
        description: `Balance: ${formatearMoneda(
          response.cierre.balance_caja_fisica
        )}`,
      });
    } catch (err) {
      console.error("Error al guardar cierre:", err);
      // Si es error de duplicado, marcar como ya guardado
      if (
        err.detalle?.includes("ya existe") ||
        err.error?.includes("ya existe")
      ) {
        setCierreGuardadoHoy(true);
        toast.info("El cierre de hoy ya fue guardado previamente");
      } else {
        toast.error("Error al guardar el cierre de turno", {
          description:
            err.detalle ||
            err.error ||
            err.mensaje ||
            "Por favor, intenta nuevamente más tarde.",
        });
      }
    } finally {
      setGuardando(false);
    }
  };

  const verDetalleCierre = async (cierreId) => {
    try {
      setCargando(true);
      const detalle = await reportesService.obtenerDetalleCierre(cierreId);
      setCierreSeleccionado(detalle);
      setVistaActual("detalle");
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      toast.error("Error al cargar el detalle del cierre");
    } finally {
      setCargando(false);
    }
  };

  const [imprimiendo, setImprimiendo] = useState(false);

  const handleImprimir = async () => {
    const datosPDFActual = prepararDatosPDF();
    if (!datosPDFActual) {
      toast.error("No hay datos para imprimir");
      return;
    }

    setImprimiendo(true);
    try {
      // Generar el PDF con el mismo formato que el botón de descargar
      const blob = await pdf(
        <CierreTurnoDocument datosCierre={datosPDFActual} />
      ).toBlob();

      // Crear URL del blob
      const url = URL.createObjectURL(blob);

      // Abrir en una nueva ventana e imprimir
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        // Si el popup está bloqueado, descargar el archivo
        const link = document.createElement("a");
        link.href = url;
        link.download = `CierreTurno_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.info("El archivo PDF se ha descargado. Ábrelo para imprimir.");
      }

      // Limpiar después de un tiempo
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      console.error("Error al generar PDF para imprimir:", error);
      toast.error("Error al generar el documento para imprimir");
    } finally {
      setImprimiendo(false);
    }
  };

  const prepararDatosPDF = () => {
    if (!datos) return null;

    return {
      empresa: {
        nombre: "SOTRAPEÑOL",
        nit: "800.123.456-7",
        direccion: "Calle Principal, Guatapé, Antioquia",
        telefono: "(604) 123-4567",
      },
      fecha: new Date().toISOString(),
      resumen: datos.resumen,
      movimientos: datos.movimientos,
      // Totales agrupados por concepto para mostrar en el PDF
      totalesPorConcepto: {
        ingresos: totalesIngresosPorConcepto.resumenOrdenado,
        egresos: totalesEgresosPorCategoria.resumenOrdenado,
      },
      cajero: {
        nombre: user?.nombre_completo || "Cajero",
        usuario: user?.username || "usuario@sotrapeñol.com",
      },
    };
  };

  const formatearMoneda = (valor) => {
    const numero = parseFloat(valor) || 0;
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(numero);
  };

  // Función para filtrar ingresos por tiempo
  const filtrarPorTiempo = (ingresos, filtro) => {
    if (filtro === "todo") return ingresos;

    const ahora = new Date();
    const horaActual = ahora.getHours() * 60 + ahora.getMinutes(); // Hora actual en minutos desde medianoche

    const minutosAtras = {
      "1h": 60,
      "2h": 120,
      "4h": 240,
      "8h": 480,
    };

    const minutosLimite = horaActual - minutosAtras[filtro];

    return ingresos.filter((ingreso) => {
      if (!ingreso.hora) return true;

      // Parsear hora en formato HH:MM
      const partes = ingreso.hora.split(":");
      if (partes.length < 2) return true;

      const horas = parseInt(partes[0], 10);
      const minutos = parseInt(partes[1], 10);

      if (isNaN(horas) || isNaN(minutos)) return true;

      // Convertir hora del ingreso a minutos desde medianoche
      const minutosIngreso = horas * 60 + minutos;

      // Si minutosLimite es negativo, significa que el rango cruza la medianoche
      // Para simplificar, solo filtramos hacia atrás en el mismo día
      if (minutosLimite < 0) {
        // Si el límite es negativo, incluir pagos desde medianoche hasta ahora
        // O desde el límite ajustado (próximo día) - caso especial
        return minutosIngreso >= 0 && minutosIngreso <= horaActual;
      }

      // Filtro normal: el ingreso debe estar entre el límite y la hora actual
      return minutosIngreso >= minutosLimite && minutosIngreso <= horaActual;
    });
  };

  // Ingresos filtrados usando useMemo para optimización
  const ingresosFiltrados = useMemo(() => {
    if (!datos?.movimientos?.ingresos) return [];

    let resultado = [...datos.movimientos.ingresos];

    // Filtrar por placa
    if (filtroPlaca.trim()) {
      const placaBuscada = filtroPlaca.trim().toUpperCase();
      resultado = resultado.filter((ingreso) =>
        ingreso.placa?.toUpperCase().includes(placaBuscada)
      );
    }

    // Filtrar por tiempo
    resultado = filtrarPorTiempo(resultado, filtroTiempo);

    return resultado;
  }, [datos?.movimientos?.ingresos, filtroPlaca, filtroTiempo]);

  // Calcular totales filtrados
  const totalesFiltrados = useMemo(() => {
    const totalFiltrado = ingresosFiltrados.reduce(
      (sum, ing) => sum + (parseFloat(ing.monto) || 0),
      0
    );
    return {
      cantidad: ingresosFiltrados.length,
      total: totalFiltrado,
    };
  }, [ingresosFiltrados]);

  // Calcular totales por concepto de ingresos
  const totalesIngresosPorConcepto = useMemo(() => {
    if (!datos?.movimientos?.ingresos) {
      return { totalesPorConcepto: {}, resumenOrdenado: [], totalGeneral: 0 };
    }
    return agruparPorConcepto(datos.movimientos.ingresos, "concepto", "monto");
  }, [datos?.movimientos?.ingresos]);

  // Calcular totales por categoría de egresos
  const totalesEgresosPorCategoria = useMemo(() => {
    if (!datos?.movimientos?.egresos) {
      return { totalesPorConcepto: {}, resumenOrdenado: [], totalGeneral: 0 };
    }
    return agruparPorConcepto(datos.movimientos.egresos, "categoria", "monto");
  }, [datos?.movimientos?.egresos]);

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroPlaca("");
    setFiltroTiempo("todo");
  };

  // Verificar si hay filtros activos
  const hayFiltrosActivos =
    filtroPlaca.trim() !== "" || filtroTiempo !== "todo";

  if (cargando) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">
            Cargando cierre de turno...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              size="sm"
              onClick={cargarDatos}
              className="ml-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!datos && vistaActual === "hoy") {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No hay datos disponibles para el cierre de turno.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Vista de Historial
  if (vistaActual === "historial") {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Encabezado con botones de navegación */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Historial de Cierres
            </h1>
            <p className="text-muted-foreground mt-1">
              Auditoría de cierres anteriores
            </p>
          </div>
          <Button
            onClick={() => setVistaActual("hoy")}
            variant="outline"
            className="w-full md:w-auto"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Ver Cierre Actual
          </Button>
        </div>

        {/* Tabla de historial */}
        <Card>
          <CardHeader>
            <CardTitle>Cierres Guardados</CardTitle>
            <CardDescription>
              Haz clic en una fila para ver el detalle completo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {historial.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No hay cierres guardados</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                      <TableHead className="text-right">Ingresos</TableHead>
                      <TableHead className="text-right">Egresos</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.map((cierre) => (
                      <TableRow
                        key={cierre.cierre_id}
                        className="cursor-pointer hover:bg-muted/50"
                      >
                        <TableCell>
                          {formatLocalDate(cierre.fecha_cierre, 'long')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {formatearMoneda(cierre.balance_caja_fisica)}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          {cierre.cantidad_ingresos} (
                          {formatearMoneda(
                            cierre.total_ingresos_efectivo +
                            cierre.total_ingresos_digitales
                          )}
                          )
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {cierre.cantidad_egresos} (
                          {formatearMoneda(cierre.total_egresos)})
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => verDetalleCierre(cierre.cierre_id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Vista de Detalle de Cierre Histórico
  if (vistaActual === "detalle" && cierreSeleccionado) {
    const { resumen, movimientos } = cierreSeleccionado;

    // Calcular totales por concepto para el historial (pueden venir del backend o calcularse)
    const totalesIngresosHistorial = cierreSeleccionado.totales_por_concepto?.ingresos 
      || agruparPorConcepto(movimientos.ingresos, "concepto", "monto").resumenOrdenado;
    const totalesEgresosHistorial = cierreSeleccionado.totales_por_concepto?.egresos 
      || agruparPorConcepto(movimientos.egresos, "categoria", "monto").resumenOrdenado;

    const datosPDFHistorial = {
      empresa: {
        nombre: "SOTRAPEÑOL",
        nit: "800.123.456-7",
        direccion: "Calle Principal, Guatapé, Antioquia",
        telefono: "(604) 123-4567",
      },
      fecha: cierreSeleccionado.fecha_cierre,
      resumen: {
        balance_caja_fisica: resumen.balance_caja_fisica,
        total_ingresos_efectivo: resumen.total_ingresos_efectivo || "0",
        total_ingresos_digitales: resumen.total_ingresos_digitales || "0",
        total_egresos: resumen.total_egresos,
      },
      movimientos: movimientos,
      // Totales agrupados por concepto
      totalesPorConcepto: {
        ingresos: totalesIngresosHistorial,
        egresos: totalesEgresosHistorial,
      },
      cajero: {
        nombre: user?.nombre_completo || "Cajero",
        usuario: user?.username || "usuario@sotrapeñol.com",
      },
    };

    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Detalle de Cierre
            </h1>
            <p className="text-muted-foreground mt-1">
              {formatLocalDate(cierreSeleccionado.fecha_cierre, 'long')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setVistaActual("historial")}
              variant="outline"
              className="w-full md:w-auto"
            >
              <History className="h-4 w-4 mr-2" />
              Volver al Historial
            </Button>
            <BotonDescargarCierreTurno
              datosCierre={datosPDFHistorial}
              variant="default"
              className="w-full md:w-auto"
            />
            <Button
              onClick={handleImprimir}
              disabled={imprimiendo}
              className="w-full md:w-auto"
            >
              {imprimiendo ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Balance en Caja
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatearMoneda(resumen.balance_caja_fisica)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Efectivo disponible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Ingresos
              </CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatearMoneda(resumen.total_ingresos)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {movimientos.ingresos.length} transacciones
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Egresos
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatearMoneda(resumen.total_egresos)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {movimientos.egresos.length} transacciones
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tablas de detalle */}
        <div className="space-y-6">
          {/* Ingresos - Versión Detallada */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Ingresos</CardTitle>
              <CardDescription>
                Cobros realizados en el turno - {movimientos.ingresos.length}{" "}
                {movimientos.ingresos.length === 1 ? "pago" : "pagos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">Hora</TableHead>
                      <TableHead className="w-[90px]">Placa</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Propietario
                      </TableHead>
                      <TableHead className="hidden lg:table-cell">
                        Tipo
                      </TableHead>
                      <TableHead>Concepto</TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Periodo
                      </TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.ingresos.map((ingreso, index) => (
                      <TableRow key={ingreso.ingreso_id || `ingreso-${index}`}>
                        <TableCell className="font-medium text-xs">
                          {ingreso.hora || "-"}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {ingreso.placa || ingreso.vehiculo_placa || "N/A"}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          <span className="truncate max-w-[120px] block">
                            {ingreso.propietario || "Sin propietario"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {ingreso.tipo_vehiculo || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ingreso.concepto === "Administración"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : ingreso.concepto === "Pólizas"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                          >
                            {ingreso.concepto ||
                              ingreso.concepto_pago ||
                              "Cuota"}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {ingreso.periodo || "-"}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          {formatearMoneda(ingreso.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Egresos */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de Egresos</CardTitle>
              <CardDescription>
                Gastos realizados en el turno - {movimientos.egresos.length}{" "}
                {movimientos.egresos.length === 1 ? "egreso" : "egresos"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {movimientos.egresos.map((egreso, index) => (
                      <TableRow key={egreso.egreso_id || `egreso-${index}`}>
                        <TableCell className="font-medium">
                          {egreso.categoria}
                        </TableCell>
                        <TableCell>{egreso.descripcion}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${egreso.medio_pago === "Efectivo"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                          >
                            {egreso.medio_pago || "Efectivo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {formatearMoneda(egreso.monto)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumen por Concepto en vista de detalle del historial */}
        <div className="grid gap-4 md:grid-cols-2">
          {totalesIngresosHistorial.length > 0 && (
            <ResumenPorConcepto
              resumen={totalesIngresosHistorial}
              titulo="Totales de Ingresos por Concepto"
              tipo="ingresos"
              formatearMoneda={formatearMoneda}
            />
          )}
          {totalesEgresosHistorial.length > 0 && (
            <ResumenPorConcepto
              resumen={totalesEgresosHistorial}
              titulo="Totales de Egresos por Categoría"
              tipo="egresos"
              formatearMoneda={formatearMoneda}
            />
          )}
        </div>
      </div>
    );
  }

  // Vista Principal - Cierre Actual
  const { resumen, movimientos } = datos;
  const datosPDF = prepararDatosPDF();

  // Calcular tiempo restante para habilitar el botón
  const calcularTiempoRestante = () => {
    const ahora = new Date();
    const horaHabilitar = new Date();
    horaHabilitar.setHours(
      HORA_HABILITAR_BOTON.hora,
      HORA_HABILITAR_BOTON.minuto,
      0,
      0
    );

    if (ahora >= horaHabilitar) return null;

    const diferencia = horaHabilitar - ahora;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

    if (horas > 0) {
      return `${horas}h ${minutos}m`;
    }
    return `${minutos} minutos`;
  };

  const tiempoRestante = calcularTiempoRestante();

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cierre de Turno</h1>
          <p className="text-muted-foreground mt-1">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={() => setVistaActual("historial")}
            variant="outline"
            className="flex-1 md:flex-none"
          >
            <History className="h-4 w-4 mr-2" />
            Ver Historial
          </Button>
          <Button
            onClick={guardarCierre}
            disabled={guardando || !botonHabilitado || cierreGuardadoHoy}
            variant="default"
            className="flex-1 md:flex-none"
            title={
              cierreGuardadoHoy
                ? "El cierre de hoy ya fue guardado"
                : !botonHabilitado
                  ? `Disponible a partir de las ${HORA_HABILITAR_BOTON.hora
                  }:${String(HORA_HABILITAR_BOTON.minuto).padStart(2, "0")}`
                  : "Guardar cierre de turno"
            }
          >
            {guardando ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : cierreGuardadoHoy ? (
              <Save className="h-4 w-4 mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {cierreGuardadoHoy ? "Cierre Guardado" : "Guardar Cierre"}
          </Button>
          {datosPDF && (
            <BotonDescargarCierreTurno
              datosCierre={datosPDF}
              variant="default"
              className="flex-1 md:flex-none"
            />
          )}
          <Button
            onClick={handleImprimir}
            disabled={imprimiendo}
            className="flex-1 md:flex-none"
          >
            {imprimiendo ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Encabezado para impresión */}
      <div className="hidden print:block mb-6">
        <h1 className="text-3xl font-bold text-center">CIERRE DE TURNO</h1>
        <p className="text-center text-lg mt-2">
          {new Date().toLocaleDateString("es-CO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <hr className="mt-4 mb-4" />
      </div>

      {/* Alerta informativa sobre el estado del cierre */}
      {!cierreGuardadoHoy && (
        <Alert
          className={`print:hidden ${botonHabilitado
            ? "border-green-200 bg-green-50 dark:bg-green-950/20"
            : "border-amber-200 bg-amber-50 dark:bg-amber-950/20"
            }`}
        >
          <Clock
            className={`h-4 w-4 ${botonHabilitado ? "text-green-600" : "text-amber-600"
              }`}
          />
          <AlertDescription
            className={
              botonHabilitado
                ? "text-green-700 dark:text-green-400"
                : "text-amber-700 dark:text-amber-400"
            }
          >
            {botonHabilitado ? (
              <>
                <strong>El turno ha finalizado.</strong> Puede guardar el cierre
                ahora. Si no lo guarda manualmente, se guardará automáticamente
                a las 11:59 PM o al cerrar sesión.
              </>
            ) : (
              <>
                <strong>Turno en curso.</strong> El botón "Guardar Cierre" se
                habilitará a las {HORA_HABILITAR_BOTON.hora}:
                {String(HORA_HABILITAR_BOTON.minuto).padStart(2, "0")}
                {tiempoRestante && ` (en ${tiempoRestante})`}. El cierre se
                guardará automáticamente si no se realiza manualmente.
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {cierreGuardadoHoy && (
        <Alert className="print:hidden border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <Save className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            <strong>Cierre guardado.</strong> El cierre de turno de hoy ya ha
            sido registrado exitosamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Sección Superior: Indicadores */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Tarjeta 1: Dinero a Entregar en Efectivo */}
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Dinero a Entregar (Efectivo)
            </CardTitle>
            <CardDescription className="text-xs text-green-600 dark:text-green-500">
              Total Efectivo - Gastos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-green-700 dark:text-green-400">
              {formatearMoneda(resumen.balance_caja_fisica)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {formatearMoneda(resumen.total_ingresos_efectivo)} -{" "}
              {formatearMoneda(resumen.total_egresos)}
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 2: Total en Bancos/Digital */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Total Bancos/Digital
            </CardTitle>
            <CardDescription className="text-xs text-blue-600 dark:text-blue-500">
              Transferencias y otros medios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-blue-700 dark:text-blue-400">
              {formatearMoneda(resumen.total_ingresos_digitales)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Ya registrado en sistema
            </p>
          </CardContent>
        </Card>

        {/* Tarjeta 3: Total Gastado Hoy */}
        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Total Gastado Hoy
            </CardTitle>
            <CardDescription className="text-xs text-red-600 dark:text-red-500">
              Egresos del día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl md:text-4xl font-bold text-red-700 dark:text-red-400">
              {formatearMoneda(resumen.total_egresos)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {movimientos.egresos.length}{" "}
              {movimientos.egresos.length === 1
                ? "transacción"
                : "transacciones"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Sección Inferior: Detalle de Movimientos */}
      <div className="space-y-6">
        {/* Tabla de Ingresos - Versión Detallada */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Ingresos del Día
                  </CardTitle>
                  <CardDescription>
                    {hayFiltrosActivos ? (
                      <>
                        Mostrando {totalesFiltrados.cantidad} de{" "}
                        {movimientos.ingresos.length} pagos (
                        {formatearMoneda(totalesFiltrados.total)})
                      </>
                    ) : (
                      <>
                        {movimientos.ingresos.length}{" "}
                        {movimientos.ingresos.length === 1
                          ? "pago registrado"
                          : "pagos registrados"}{" "}
                        - Detalle completo por concepto
                      </>
                    )}
                  </CardDescription>
                </div>
                {hayFiltrosActivos && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={limpiarFiltros}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Limpiar filtros
                  </Button>
                )}
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Filtro por placa */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Filtrar por placa..."
                    value={filtroPlaca}
                    onChange={(e) => setFiltroPlaca(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {/* Filtro por tiempo */}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <Select value={filtroTiempo} onValueChange={setFiltroTiempo}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Periodo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">Todo el día</SelectItem>
                      <SelectItem value="1h">Última hora</SelectItem>
                      <SelectItem value="2h">Últimas 2 horas</SelectItem>
                      <SelectItem value="4h">Últimas 4 horas</SelectItem>
                      <SelectItem value="8h">Últimas 8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">Hora</TableHead>
                    <TableHead className="w-[90px]">Placa</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Propietario
                    </TableHead>
                    <TableHead className="hidden lg:table-cell">Tipo</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead className="hidden sm:table-cell">
                      Periodo
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Medio
                    </TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ingresosFiltrados.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center text-muted-foreground py-8"
                      >
                        {hayFiltrosActivos
                          ? "No hay ingresos que coincidan con los filtros"
                          : "No hay ingresos registrados hoy"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    ingresosFiltrados.map((ingreso, index) => (
                      <TableRow key={`ingreso-${ingreso.ingreso_id}-${index}`}>
                        <TableCell className="font-medium text-xs">
                          {ingreso.hora}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {ingreso.placa}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                          <span className="truncate max-w-[120px] block">
                            {ingreso.propietario}
                          </span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            {ingreso.tipo_vehiculo}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ingreso.concepto === "Administración"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              : ingreso.concepto === "Pólizas"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                              }`}
                          >
                            {ingreso.concepto}
                          </span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm">
                          {ingreso.periodo}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${ingreso.medio_pago === "Efectivo"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                          >
                            {ingreso.medio_pago}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-green-600 dark:text-green-400">
                          {formatearMoneda(ingreso.monto)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Info adicional visible en móvil */}
            <div className="sm:hidden mt-4 text-xs text-muted-foreground">
              <p>* Desliza horizontalmente para ver más detalles</p>
            </div>
            {/* Subtotal filtrado */}
            {hayFiltrosActivos && ingresosFiltrados.length > 0 && (
              <div className="mt-4 pt-4 border-t flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Subtotal filtrado ({totalesFiltrados.cantidad} pagos):
                </span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
                  {formatearMoneda(totalesFiltrados.total)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Resumen de Ingresos por Concepto */}
        {totalesIngresosPorConcepto.resumenOrdenado.length > 0 && (
          <ResumenPorConcepto
            resumen={totalesIngresosPorConcepto.resumenOrdenado}
            titulo="Totales de Ingresos por Concepto"
            tipo="ingresos"
            formatearMoneda={formatearMoneda}
          />
        )}

        {/* Tabla de Gastos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Gastos del Día
            </CardTitle>
            <CardDescription>
              {movimientos.egresos.length}{" "}
              {movimientos.egresos.length === 1
                ? "egreso registrado"
                : "egresos registrados"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Hora</TableHead>
                    <TableHead>Concepto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movimientos.egresos.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center text-muted-foreground py-8"
                      >
                        No hay egresos registrados hoy
                      </TableCell>
                    </TableRow>
                  ) : (
                    movimientos.egresos.map((egreso, index) => (
                      <TableRow
                        key={egreso.egreso_id || `egreso-main-${index}`}
                      >
                        <TableCell className="font-medium">
                          {egreso.hora}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{egreso.categoria}</p>
                            {egreso.descripcion && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {egreso.descripcion}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${egreso.medio_pago === "Efectivo"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              }`}
                          >
                            {egreso.medio_pago || "Efectivo"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-red-600 dark:text-red-400">
                          {formatearMoneda(egreso.monto)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Resumen de Egresos por Categoría */}
        {totalesEgresosPorCategoria.resumenOrdenado.length > 0 && (
          <ResumenPorConcepto
            resumen={totalesEgresosPorCategoria.resumenOrdenado}
            titulo="Totales de Egresos por Categoría"
            tipo="egresos"
            formatearMoneda={formatearMoneda}
          />
        )}
      </div>

      {/* Información adicional para impresión */}
      <div className="hidden print:block mt-8 pt-6 border-t">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">Cajero:</p>
            <p className="border-b border-gray-300 mt-1">&nbsp;</p>
          </div>
          <div>
            <p className="font-semibold">Supervisor:</p>
            <p className="border-b border-gray-300 mt-1">&nbsp;</p>
          </div>
          <div>
            <p className="font-semibold">Firma Cajero:</p>
            <p className="border-b border-gray-300 mt-1">&nbsp;</p>
          </div>
          <div>
            <p className="font-semibold">Firma Supervisor:</p>
            <p className="border-b border-gray-300 mt-1">&nbsp;</p>
          </div>
        </div>
        <p className="text-xs text-center mt-6 text-muted-foreground">
          Documento generado el {new Date().toLocaleString("es-CO")}
        </p>
      </div>
    </div>
  );
};

export default CierreDeTurno;
