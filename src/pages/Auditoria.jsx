import { useState, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Search,
  Calendar,
  User,
  Clock,
  FileText,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Filter,
  X,
  Activity,
  DollarSign,
  TrendingDown,
  Car,
} from "lucide-react";
import { auditoriaService } from "@/services/auditoriaService";
import { toast } from "sonner";

/**
 * Página de Auditoría
 * Permite a los administradores ver el historial de todas las transacciones del sistema
 */

// Diccionario de traducciones para acciones
const ACCIONES_TRADUCIDAS = {
  UPDATE_TARIFA: "Actualización de Tarifa",
  INACTIVATE_VEHICLE: "Vehículo Inactivado",
  PAYMENT_RECEIVED: "Pago Recibido",
  CREATE_VEHICLE: "Vehículo Creado",
  LOGIN: "Inicio de Sesión",
  PAGO_REGISTRADO: "Pago Registrado",
  EGRESO_REGISTRADO: "Egreso Registrado",
  CARGOS_GENERADOS: "Cargos Generados",
  CIERRE_TURNO_GUARDADO: "Cierre de Turno",
  VEHICULO_CREADO: "Vehículo Creado",
  VEHICULO_ACTUALIZADO: "Vehículo Actualizado",
  USUARIO_LOGIN: "Inicio de Sesión",
  UPDATE: "Actualización",
  CREATE: "Creación",
  DELETE: "Eliminación",
};

// Función para traducir acción
const traducirAccion = (accion) => {
  return ACCIONES_TRADUCIDAS[accion] || accion.replace(/_/g, " ");
};

// Diccionario de etiquetas para campos
const ETIQUETAS_CAMPOS = {
  // Vehículo
  placa: "Placa",
  tipo: "Tipo de Vehículo",
  propietario: "Propietario",
  vehiculo: "Vehículo",
  // Pago
  ingreso_id: "N° de Recibo",
  medio_pago: "Medio de Pago",
  monto_total: "Monto Total",
  observacion: "Observación",
  detalles: "Detalle del Pago",
  // Deuda
  rubro: "Concepto",
  periodo: "Período",
  deuda_id: "ID de Deuda",
  monto_abonado: "Monto Abonado",
  saldo_restante: "Saldo Restante",
  // Tarifa
  tarifa_id: "ID de Tarifa",
  monto: "Monto",
  tipo_vehiculo: "Tipo de Vehículo",
  // General
  fecha: "Fecha",
  estado: "Estado",
  descripcion: "Descripción",
  // Login
  ip_address: "Dirección IP",
  user_agent: "Navegador / Dispositivo",
  email: "Correo Electrónico",
  nombre_usuario: "Usuario",
};

// Función para formatear valores de manera legible
const formatearValor = (clave, valor) => {
  if (valor === null || valor === undefined || valor === "") return "-";

  // Formatear montos
  if (clave.includes("monto") || clave === "saldo_restante") {
    const numero = parseFloat(valor);
    if (!isNaN(numero)) {
      return new Intl.NumberFormat("es-CO", {
        style: "currency",
        currency: "COP",
        minimumFractionDigits: 0,
      }).format(numero);
    }
  }

  // Formatear medios de pago
  if (clave === "medio_pago") {
    const medios = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      tarjeta: "Tarjeta",
      Efectivo: "Efectivo",
      Transferencia: "Transferencia",
    };
    return medios[valor] || valor;
  }

  // Formatear tipos de vehículo
  if (clave === "tipo" || clave === "tipo_vehiculo") {
    const tipos = {
      Automovil: "Automóvil",
      Camioneta: "Camioneta",
      Motocicleta: "Motocicleta",
      Bus: "Bus",
      Camion: "Camión",
      Otro: "Otro",
    };
    return tipos[valor] || valor;
  }

  return valor;
};

const Auditoria = () => {
  const [logs, setLogs] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [acciones, setAcciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    accion: "",
    placa: "",
    fecha_inicio: "",
    fecha_fin: "",
    search: "",
  });
  const [filtrosActivos, setFiltrosActivos] = useState(false);

  // Modal de detalle
  const [logSeleccionado, setLogSeleccionado] = useState(null);
  const [mostrarDetalle, setMostrarDetalle] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargarDatosIniciales();
  }, []);

  const cargarDatosIniciales = async () => {
    setCargando(true);
    setError(null);
    try {
      // Cargar cada uno por separado para mejor manejo de errores
      let logsData = [];
      let resumenData = null;
      let accionesData = [];

      try {
        logsData = await auditoriaService.obtenerLogs();
      } catch (err) {
        console.error("Error al cargar logs:", err);
        logsData = [];
      }

      try {
        resumenData = await auditoriaService.obtenerResumen();
      } catch (err) {
        console.error("Error al cargar resumen:", err);
        resumenData = {
          total_logs: 0,
          logs_hoy: 0,
          logs_semana: 0,
          usuarios_activos_hoy: [],
        };
      }

      try {
        accionesData = await auditoriaService.obtenerAccionesDisponibles();
      } catch (err) {
        console.error("Error al cargar acciones:", err);
        accionesData = [];
      }

      // Asegurar que logs siempre sea un array
      setLogs(Array.isArray(logsData) ? logsData : []);
      setResumen(resumenData);
      setAcciones(Array.isArray(accionesData) ? accionesData : []);
    } catch (err) {
      console.error("Error al cargar auditoría:", err);
      setError(err.error || "Error al cargar los datos de auditoría");
      setLogs([]);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = async () => {
    setCargando(true);
    try {
      const filtrosLimpios = {};
      Object.entries(filtros).forEach(([key, value]) => {
        if (value && value.trim() !== "") {
          filtrosLimpios[key] = value;
        }
      });

      const logsData = await auditoriaService.obtenerLogs(filtrosLimpios);
      // Asegurar que siempre sea un array
      setLogs(Array.isArray(logsData) ? logsData : []);
      setFiltrosActivos(Object.keys(filtrosLimpios).length > 0);
    } catch (err) {
      console.error("Error al filtrar:", err);
      toast.error("Error al aplicar filtros");
      setLogs([]);
    } finally {
      setCargando(false);
    }
  };

  const limpiarFiltros = () => {
    setFiltros({
      accion: "",
      placa: "",
      fecha_inicio: "",
      fecha_fin: "",
      search: "",
    });
    setFiltrosActivos(false);
    cargarDatosIniciales();
  };

  const verDetalle = async (logId) => {
    setCargandoDetalle(true);
    setMostrarDetalle(true);
    try {
      const detalle = await auditoriaService.obtenerDetalleLog(logId);
      setLogSeleccionado(detalle);
    } catch (err) {
      console.error("Error al cargar detalle:", err);
      toast.error("Error al cargar el detalle");
      setMostrarDetalle(false);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const getAccionBadge = (accion) => {
    const estilos = {
      PAGO_REGISTRADO:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      PAYMENT_RECEIVED:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      EGRESO_REGISTRADO:
        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      CARGOS_GENERADOS:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      CIERRE_TURNO_GUARDADO:
        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      VEHICULO_CREADO:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      CREATE_VEHICLE:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      VEHICULO_ACTUALIZADO:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      INACTIVATE_VEHICLE:
        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      USUARIO_LOGIN:
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      LOGIN: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
      UPDATE_TARIFA:
        "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    };

    return (
      estilos[accion] ||
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
    );
  };

  const getAccionIcono = (accion) => {
    const iconos = {
      PAGO_REGISTRADO: <DollarSign className="h-4 w-4" />,
      PAYMENT_RECEIVED: <DollarSign className="h-4 w-4" />,
      EGRESO_REGISTRADO: <TrendingDown className="h-4 w-4" />,
      CARGOS_GENERADOS: <FileText className="h-4 w-4" />,
      CIERRE_TURNO_GUARDADO: <Clock className="h-4 w-4" />,
      VEHICULO_CREADO: <Car className="h-4 w-4" />,
      CREATE_VEHICLE: <Car className="h-4 w-4" />,
      VEHICULO_ACTUALIZADO: <Car className="h-4 w-4" />,
      INACTIVATE_VEHICLE: <Car className="h-4 w-4" />,
      USUARIO_LOGIN: <User className="h-4 w-4" />,
      LOGIN: <User className="h-4 w-4" />,
      UPDATE_TARIFA: <FileText className="h-4 w-4" />,
    };

    return iconos[accion] || <Activity className="h-4 w-4" />;
  };

  if (cargando && !filtrosActivos) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-muted-foreground">Cargando auditoría...</p>
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
              onClick={cargarDatosIniciales}
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

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Auditoría del Sistema
          </h1>
          <p className="text-muted-foreground mt-1">
            Historial de todas las transacciones y acciones del sistema
          </p>
        </div>
        <Button onClick={cargarDatosIniciales} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Actualizar
        </Button>
      </div>

      {/* Tarjetas de Resumen */}
      {resumen && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Registros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resumen.total_logs}</div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">
                Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                {resumen.logs_hoy}
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
                Esta Semana
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                {resumen.logs_semana}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuarios Activos Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {resumen.usuarios_activos_hoy?.length || 0}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Tipo de Acción */}
            <div>
              <label
                htmlFor="filtro-accion"
                className="text-sm font-medium mb-1 block"
              >
                Tipo de Acción
              </label>
              <Select
                value={filtros.accion}
                onValueChange={(value) =>
                  setFiltros({
                    ...filtros,
                    accion: value === "todos" ? "" : value,
                  })
                }
              >
                <SelectTrigger id="filtro-accion">
                  <SelectValue placeholder="Todas las acciones" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas las acciones</SelectItem>
                  {acciones.map((acc) => (
                    <SelectItem key={acc.codigo} value={acc.codigo}>
                      {traducirAccion(acc.codigo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Placa */}
            <div>
              <label
                htmlFor="filtro-placa"
                className="text-sm font-medium mb-1 block"
              >
                Placa
              </label>
              <Input
                id="filtro-placa"
                placeholder="Ej: ABC123"
                value={filtros.placa}
                onChange={(e) =>
                  setFiltros({ ...filtros, placa: e.target.value })
                }
              />
            </div>

            {/* Fecha Inicio */}
            <div>
              <label
                htmlFor="filtro-fecha-inicio"
                className="text-sm font-medium mb-1 block"
              >
                Desde
              </label>
              <Input
                id="filtro-fecha-inicio"
                type="date"
                value={filtros.fecha_inicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_inicio: e.target.value })
                }
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <label
                htmlFor="filtro-fecha-fin"
                className="text-sm font-medium mb-1 block"
              >
                Hasta
              </label>
              <Input
                id="filtro-fecha-fin"
                type="date"
                value={filtros.fecha_fin}
                onChange={(e) =>
                  setFiltros({ ...filtros, fecha_fin: e.target.value })
                }
              />
            </div>

            {/* Búsqueda */}
            <div>
              <label
                htmlFor="filtro-search"
                className="text-sm font-medium mb-1 block"
              >
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="filtro-search"
                  placeholder="Buscar en detalles..."
                  value={filtros.search}
                  onChange={(e) =>
                    setFiltros({ ...filtros, search: e.target.value })
                  }
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={aplicarFiltros} disabled={cargando}>
              {cargando ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Aplicar Filtros
            </Button>
            {filtrosActivos && (
              <Button variant="outline" onClick={limpiarFiltros}>
                <X className="h-4 w-4 mr-2" />
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Historial de Acciones
            {filtrosActivos && (
              <Badge variant="secondary" className="ml-2">
                {logs.length} resultados
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Registro inmutable de todas las operaciones del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Fecha</TableHead>
                  <TableHead className="w-[70px]">Hora</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Detalles
                  </TableHead>
                  <TableHead className="w-[80px]">Ver</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No hay registros de auditoría
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.log_id}>
                      <TableCell className="font-medium text-sm">
                        {log.fecha_formateada}
                      </TableCell>
                      <TableCell className="text-sm">{log.hora}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{log.usuario_nombre}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getAccionBadge(log.accion)}>
                          <span className="flex items-center gap-1">
                            {getAccionIcono(log.accion)}
                            {traducirAccion(log.accion)}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm text-muted-foreground line-clamp-1 max-w-[300px]">
                          {log.detalles}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => verDetalle(log.log_id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Detalle */}
      <Dialog open={mostrarDetalle} onOpenChange={setMostrarDetalle}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Detalle de Registro de Auditoría
            </DialogTitle>
            <DialogDescription>
              Registro #{logSeleccionado?.log_id}
            </DialogDescription>
          </DialogHeader>

          {cargandoDetalle ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : logSeleccionado ? (
            <div className="space-y-4">
              {/* Info básica en tarjetas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Fecha y Hora
                  </p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {logSeleccionado.fecha_formateada}{" "}
                    {logSeleccionado.hora_formateada}
                  </p>
                </div>
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Usuario
                  </p>
                  <p className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {logSeleccionado.usuario_nombre}
                  </p>
                  <p className="text-xs text-muted-foreground ml-6">
                    {logSeleccionado.usuario_email}
                  </p>
                </div>
              </div>

              {/* Acción realizada */}
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Acción Realizada
                </p>
                <Badge
                  className={`${getAccionBadge(
                    logSeleccionado.accion
                  )} text-sm py-1 px-3`}
                >
                  <span className="flex items-center gap-2">
                    {getAccionIcono(logSeleccionado.accion)}
                    {traducirAccion(logSeleccionado.accion)}
                  </span>
                </Badge>
              </div>

              {/* Descripción */}
              {logSeleccionado.detalles && (
                <div className="bg-muted/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Descripción
                  </p>
                  <p className="text-sm">{logSeleccionado.detalles}</p>
                </div>
              )}

              {/* Datos Registrados - Formateados */}
              {logSeleccionado.datos_nuevos && (
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 dark:bg-green-950/30 px-4 py-2 border-b">
                    <p className="text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Información Registrada
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <RenderDatosFormateados
                      datos={logSeleccionado.datos_nuevos}
                    />
                  </div>
                </div>
              )}

              {/* Datos Anteriores (si aplica) */}
              {logSeleccionado.datos_anteriores && (
                <div className="border border-red-200 dark:border-red-900 rounded-lg overflow-hidden">
                  <div className="bg-red-50 dark:bg-red-950/30 px-4 py-2 border-b border-red-200 dark:border-red-900">
                    <p className="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Datos Anteriores (antes del cambio)
                    </p>
                  </div>
                  <div className="p-4 space-y-4">
                    <RenderDatosFormateados
                      datos={logSeleccionado.datos_anteriores}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
};

/**
 * Componente para renderizar datos de auditoría de forma legible
 */
const RenderDatosFormateados = ({ datos }) => {
  if (!datos) return null;

  // Si hay información de vehículo
  const renderVehiculo = (vehiculo) => {
    if (!vehiculo) return null;
    return (
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1">
          <Car className="h-3 w-3" />
          Vehículo
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="text-sm font-semibold">{vehiculo.placa || "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Tipo</p>
            <p className="text-sm">
              {formatearValor("tipo", vehiculo.tipo) || "-"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Propietario</p>
            <p className="text-sm">{vehiculo.propietario || "-"}</p>
          </div>
        </div>
      </div>
    );
  };

  // Si hay detalles de pago
  const renderDetallesPago = (detalles) => {
    if (!detalles || !Array.isArray(detalles) || detalles.length === 0)
      return null;
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">
          Conceptos Pagados
        </p>
        <div className="space-y-2">
          {detalles.map((detalle, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border"
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <p className="text-xs text-muted-foreground">Concepto</p>
                  <p className="text-sm font-medium">{detalle.rubro || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm">{detalle.periodo || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monto Abonado</p>
                  <p className="text-sm font-medium text-green-600">
                    {formatearValor("monto_abonado", detalle.monto_abonado)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Saldo Restante
                  </p>
                  <p
                    className={`text-sm ${
                      parseFloat(detalle.saldo_restante) > 0
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {formatearValor("saldo_restante", detalle.saldo_restante)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Información general del pago
  const renderInfoPago = () => {
    if (!datos.ingreso_id && !datos.monto_total && !datos.medio_pago)
      return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {datos.ingreso_id && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">N° de Recibo</p>
            <p className="text-sm font-semibold">#{datos.ingreso_id}</p>
          </div>
        )}
        {datos.monto_total && (
          <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Monto Total</p>
            <p className="text-lg font-bold text-green-600">
              {formatearValor("monto_total", datos.monto_total)}
            </p>
          </div>
        )}
        {datos.medio_pago && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
            <p className="text-xs text-muted-foreground">Medio de Pago</p>
            <p className="text-sm font-medium">
              {formatearValor("medio_pago", datos.medio_pago)}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Renderizar otros campos no procesados
  const renderOtrosCampos = () => {
    const camposExcluidos = [
      "vehiculo",
      "detalles",
      "ingreso_id",
      "monto_total",
      "medio_pago",
      "observacion",
      "ip_address",
      "user_agent",
    ];
    const otrosCampos = Object.entries(datos).filter(
      ([clave]) => !camposExcluidos.includes(clave)
    );

    if (otrosCampos.length === 0) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {otrosCampos.map(([clave, valor]) => {
          // Si el valor es un objeto, mostrarlo de forma especial
          if (typeof valor === "object" && valor !== null) {
            return (
              <div
                key={clave}
                className="col-span-full bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg"
              >
                <p className="text-xs text-muted-foreground mb-2">
                  {ETIQUETAS_CAMPOS[clave] || clave}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.entries(valor).map(([subClave, subValor]) => (
                    <div key={subClave}>
                      <p className="text-xs text-muted-foreground">
                        {ETIQUETAS_CAMPOS[subClave] || subClave}
                      </p>
                      <p className="text-sm">
                        {formatearValor(subClave, subValor)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          return (
            <div
              key={clave}
              className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg"
            >
              <p className="text-xs text-muted-foreground">
                {ETIQUETAS_CAMPOS[clave] || clave}
              </p>
              <p className="text-sm font-medium">
                {formatearValor(clave, valor)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };

  // Información de sesión/login
  const renderInfoLogin = () => {
    if (!datos.ip_address && !datos.user_agent) return null;
    return (
      <div className="bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-lg border border-indigo-200 dark:border-indigo-900">
        <p className="text-xs font-medium text-indigo-700 dark:text-indigo-400 mb-2 flex items-center gap-1">
          <User className="h-3 w-3" />
          Información de Sesión
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {datos.ip_address && (
            <div>
              <p className="text-xs text-muted-foreground">Dirección IP</p>
              <p className="text-sm font-mono">{datos.ip_address}</p>
            </div>
          )}
          {datos.user_agent && (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Navegador / Dispositivo</p>
              <p className="text-xs font-mono text-muted-foreground break-all">{datos.user_agent}</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {renderVehiculo(datos.vehiculo)}
      {renderInfoPago()}
      {renderDetallesPago(datos.detalles)}
      {renderInfoLogin()}
      {datos.observacion && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
          <p className="text-xs text-muted-foreground">Observación</p>
          <p className="text-sm">{datos.observacion || "Sin observaciones"}</p>
        </div>
      )}
      {renderOtrosCampos()}
    </div>
  );
};

export default Auditoria;
