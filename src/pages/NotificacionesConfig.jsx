import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
    Bell,
    AlertCircle,
    AlertTriangle,
    Info,
    Check,
    CheckCheck,
    Search,
    RefreshCw,
    ArrowLeft,
    Car,
    Filter,
    Calendar,
    Trash2,
    ChevronDown,
} from "lucide-react";
import { notificacionesService } from "../services/notificacionesService";
import { useNotificaciones } from "../context/NotificacionesContext";
import { toast } from "sonner";

const PAGE_SIZE = 50;

export default function NotificacionesConfig() {
    const location = useLocation();
    const navigate = useNavigate();
    const { refrescarNotificaciones, generarTodasLasAlertas } = useNotificaciones();

    const [notificaciones, setNotificaciones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [generando, setGenerando] = useState(false);
    const [limpiando, setLimpiando] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filtroLeidas, setFiltroLeidas] = useState("todas"); // todas, leidas, no_leidas
    const [filtroTipo, setFiltroTipo] = useState("todos"); // todos, morosidad_alerta, morosidad_critica
    const [notificacionSeleccionada, setNotificacionSeleccionada] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        loadNotificaciones();
        
        // Si venimos con un ID de notificación en el state, seleccionarla
        if (location.state?.notificacionId) {
            handleSelectNotificacion(location.state.notificacionId);
        }
    }, [location.state]);

    const loadNotificaciones = async (reset = true) => {
        try {
            if (reset) {
                setLoading(true);
                setNotificaciones([]);
            } else {
                setLoadingMore(true);
            }
            
            const params = { page_size: PAGE_SIZE };
            const data = await notificacionesService.getAll(params);
            
            // Manejar respuesta paginada
            if (data.results) {
                setNotificaciones(data.results);
                setNextPage(data.next);
                setTotalCount(data.count || data.results.length);
            } else if (Array.isArray(data)) {
                setNotificaciones(data);
                setNextPage(null);
                setTotalCount(data.length);
            }
        } catch (err) {
            console.error("Error al cargar notificaciones:", err);
            toast.error("Error al cargar notificaciones");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMoreNotificaciones = async () => {
        if (!nextPage || loadingMore) return;
        
        try {
            setLoadingMore(true);
            // Extraer página de la URL next
            const url = new URL(nextPage);
            const page = url.searchParams.get("page");
            
            const params = { page, page_size: PAGE_SIZE };
            const data = await notificacionesService.getAll(params);
            
            if (data.results) {
                setNotificaciones(prev => [...prev, ...data.results]);
                setNextPage(data.next);
            }
        } catch (err) {
            console.error("Error al cargar más notificaciones:", err);
            toast.error("Error al cargar más notificaciones");
        } finally {
            setLoadingMore(false);
        }
    };

    const handleSelectNotificacion = async (id) => {
        try {
            const notificacion = await notificacionesService.getById(id);
            setNotificacionSeleccionada(notificacion);
            
            // Marcar como leída si no lo está
            if (!notificacion.leida) {
                await notificacionesService.marcarLeida(id);
                // Actualizar la lista local
                setNotificaciones(prev =>
                    prev.map(n =>
                        n.notificacion_id === id ? { ...n, leida: true } : n
                    )
                );
                refrescarNotificaciones();
            }
        } catch (err) {
            console.error("Error al cargar detalle de notificación:", err);
            toast.error("Error al cargar el detalle");
        }
    };

    const handleMarcarTodasLeidas = async () => {
        try {
            await notificacionesService.marcarTodasLeidas();
            setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
            refrescarNotificaciones();
            toast.success("Todas las notificaciones marcadas como leídas");
        } catch (err) {
            console.error("Error al marcar todas como leídas:", err);
            toast.error("Error al marcar notificaciones");
        }
    };

    const handleLimpiarTodas = async () => {
        if (!window.confirm("¿Estás seguro de eliminar TODAS las notificaciones? Esta acción no se puede deshacer.")) {
            return;
        }
        
        try {
            setLimpiando(true);
            const resultado = await notificacionesService.limpiarTodas();
            toast.success(`Se eliminaron ${resultado.eliminadas} notificaciones`);
            setNotificaciones([]);
            setNotificacionSeleccionada(null);
            setTotalCount(0);
            refrescarNotificaciones();
        } catch (err) {
            console.error("Error al limpiar notificaciones:", err);
            toast.error("Error al limpiar notificaciones");
        } finally {
            setLimpiando(false);
        }
    };

    const handleGenerarAlertas = async () => {
        try {
            setGenerando(true);
            const resultado = await generarTodasLasAlertas();
            
            const totalGeneradas = 
                (resultado.morosidad?.resumen?.total || 0) + 
                (resultado.vencimientos?.resumen?.total || 0);
            
            if (totalGeneradas > 0) {
                const morosidadMsg = resultado.morosidad?.resumen?.total > 0 
                    ? `${resultado.morosidad.resumen.total} de morosidad` 
                    : "";
                const vencimientosMsg = resultado.vencimientos?.resumen?.total > 0 
                    ? `${resultado.vencimientos.resumen.total} de rubros vencidos` 
                    : "";
                const partes = [morosidadMsg, vencimientosMsg].filter(Boolean);
                
                toast.success(`Se generaron ${totalGeneradas} alertas: ${partes.join(", ")}`);
            } else {
                toast.info("No se encontraron vehículos con alertas pendientes");
            }
            
            // Recargar lista
            await loadNotificaciones();
        } catch (err) {
            console.error("Error al generar alertas:", err);
            toast.error("Error al generar alertas");
        } finally {
            setGenerando(false);
        }
    };

    // Filtrar notificaciones
    const notificacionesFiltradas = notificaciones.filter(n => {
        // Filtro de búsqueda
        const matchSearch = 
            n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            n.mensaje.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (n.placa && n.placa.toLowerCase().includes(searchTerm.toLowerCase()));
        
        // Filtro de leídas
        const matchLeidas = 
            filtroLeidas === "todas" ||
            (filtroLeidas === "leidas" && n.leida) ||
            (filtroLeidas === "no_leidas" && !n.leida);
        
        // Filtro de tipo
        const matchTipo = 
            filtroTipo === "todos" || n.tipo === filtroTipo;
        
        return matchSearch && matchLeidas && matchTipo;
    });

    // Obtener icono según severidad
    const getIcon = (nivel) => {
        switch (nivel) {
            case "critical":
                return <AlertCircle className="h-5 w-5 text-red-500" />;
            case "warning":
                return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            default:
                return <Info className="h-5 w-5 text-blue-500" />;
        }
    };

    // Obtener badge de severidad
    const getSeverityBadge = (nivel) => {
        switch (nivel) {
            case "critical":
                return <Badge variant="destructive">Crítico</Badge>;
            case "warning":
                return <Badge className="bg-yellow-500 hover:bg-yellow-600">Alerta</Badge>;
            default:
                return <Badge variant="secondary">Info</Badge>;
        }
    };

    // Estadísticas
    const stats = {
        total: notificaciones.length,
        noLeidas: notificaciones.filter(n => !n.leida).length,
        criticas: notificaciones.filter(n => n.nivel_severidad === "critical" && !n.leida).length,
        alertas: notificaciones.filter(n => n.nivel_severidad === "warning" && !n.leida).length,
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate("/configuracion")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Notificaciones</h1>
                        <p className="text-muted-foreground">
                            Centro de alertas y notificaciones del sistema
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={loadNotificaciones}
                        disabled={loading}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Actualizar
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleLimpiarTodas}
                        disabled={limpiando || notificaciones.length === 0}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                        <Trash2 className={`h-4 w-4 mr-2 ${limpiando ? "animate-pulse" : ""}`} />
                        {limpiando ? "Limpiando..." : "Limpiar Todo"}
                    </Button>
                    <Button
                        onClick={handleGenerarAlertas}
                        disabled={generando}
                        className="bg-primary"
                    >
                        <Bell className={`h-4 w-4 mr-2 ${generando ? "animate-pulse" : ""}`} />
                        {generando ? "Generando..." : "Generar Alertas"}
                    </Button>
                </div>
            </div>

            {/* Tarjetas de estadísticas */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Bell className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                        <p className="text-xs text-muted-foreground">notificaciones</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sin Leer</CardTitle>
                        <Bell className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-primary">{stats.noLeidas}</div>
                        <p className="text-xs text-muted-foreground">pendientes</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Críticas</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.criticas}</div>
                        <p className="text-xs text-muted-foreground">requieren atención</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">En Alerta</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{stats.alertas}</div>
                        <p className="text-xs text-muted-foreground">monitorear</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros y búsqueda */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por título, mensaje o placa..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    <select
                        value={filtroLeidas}
                        onChange={(e) => setFiltroLeidas(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-background text-sm"
                    >
                        <option value="todas">Todas</option>
                        <option value="no_leidas">No leídas</option>
                        <option value="leidas">Leídas</option>
                    </select>
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="px-3 py-2 border rounded-md bg-background text-sm"
                    >
                        <option value="todos">Todos los tipos</option>
                        <option value="morosidad_critica">Morosidad Crítica</option>
                        <option value="morosidad_alerta">Alerta de Morosidad</option>
                        <option value="rubro_muy_vencido">Rubro Muy Vencido</option>
                        <option value="rubro_vencido">Rubro Vencido</option>
                        <option value="sistema">Sistema</option>
                    </select>
                    {stats.noLeidas > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarcarTodasLeidas}
                        >
                            <CheckCheck className="h-4 w-4 mr-2" />
                            Marcar todas
                        </Button>
                    )}
                </div>
            </div>

            {/* Contenido principal */}
            <div className="grid gap-6 lg:grid-cols-3">
                {/* Lista de notificaciones */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Lista de Notificaciones ({notificacionesFiltradas.length})</span>
                            {totalCount > 0 && (
                                <span className="text-sm font-normal text-muted-foreground">
                                    {notificaciones.length} de {totalCount} cargadas
                                </span>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                                Cargando notificaciones...
                            </div>
                        ) : notificacionesFiltradas.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p className="font-medium">No hay notificaciones</p>
                                <p className="text-sm mt-1">
                                    {searchTerm || filtroLeidas !== "todas" || filtroTipo !== "todos"
                                        ? "Intenta ajustar los filtros"
                                        : "Las alertas de morosidad aparecerán aquí"}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                                    {notificacionesFiltradas.map((notificacion) => (
                                        <button
                                            key={notificacion.notificacion_id}
                                            onClick={() => handleSelectNotificacion(notificacion.notificacion_id)}
                                            className={`w-full p-4 flex items-start gap-4 hover:bg-muted/50 transition-colors text-left ${
                                                notificacionSeleccionada?.notificacion_id === notificacion.notificacion_id
                                                    ? "bg-muted"
                                                    : !notificacion.leida
                                                    ? "bg-primary/5"
                                                    : ""
                                            }`}
                                        >
                                            <div className="flex-shrink-0 mt-0.5">
                                                {getIcon(notificacion.nivel_severidad)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`font-medium ${!notificacion.leida ? "text-foreground" : "text-muted-foreground"}`}>
                                                        {notificacion.titulo}
                                                    </span>
                                                    {!notificacion.leida && (
                                                        <span className="h-2 w-2 rounded-full bg-primary"></span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground line-clamp-2">
                                                    {notificacion.mensaje}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2">
                                                    {notificacion.placa && (
                                                        <Badge variant="outline" className="text-xs">
                                                            <Car className="h-3 w-3 mr-1" />
                                                            {notificacion.placa}
                                                        </Badge>
                                                    )}
                                                    <span className="text-xs text-muted-foreground">
                                                        {notificacion.tiempo_transcurrido}
                                                    </span>
                                                </div>
                                            </div>
                                            {notificacion.leida && (
                                                <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                {/* Botón Cargar Más */}
                                {nextPage && (
                                    <div className="p-4 border-t border-border">
                                        <Button
                                            variant="outline"
                                            className="w-full"
                                            onClick={loadMoreNotificaciones}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                                    Cargando...
                                                </>
                                            ) : (
                                                <>
                                                    <ChevronDown className="h-4 w-4 mr-2" />
                                                    Cargar más notificaciones
                                                </>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Panel de detalle */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Detalle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {notificacionSeleccionada ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    {getIcon(notificacionSeleccionada.nivel_severidad)}
                                    {getSeverityBadge(notificacionSeleccionada.nivel_severidad)}
                                </div>
                                
                                <div>
                                    <h3 className="font-semibold text-lg">
                                        {notificacionSeleccionada.titulo}
                                    </h3>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {notificacionSeleccionada.tiempo_transcurrido}
                                    </p>
                                </div>

                                <p className="text-sm text-foreground leading-relaxed">
                                    {notificacionSeleccionada.mensaje}
                                </p>

                                {notificacionSeleccionada.placa && (
                                    <div className="p-3 bg-muted rounded-lg">
                                        <p className="text-xs text-muted-foreground mb-1">Vehículo</p>
                                        <div className="flex items-center gap-2">
                                            <Car className="h-4 w-4" />
                                            <span className="font-mono font-semibold">
                                                {notificacionSeleccionada.placa}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {notificacionSeleccionada.datos_adicionales && (
                                    <div className="space-y-2">
                                        <p className="text-xs text-muted-foreground">Información adicional</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {notificacionSeleccionada.datos_adicionales.porcentaje && (
                                                <div className="p-2 bg-muted rounded text-center">
                                                    <p className="text-xs text-muted-foreground">Uso de cupo</p>
                                                    <p className={`font-bold ${
                                                        notificacionSeleccionada.datos_adicionales.porcentaje >= 90
                                                            ? "text-red-500"
                                                            : "text-yellow-500"
                                                    }`}>
                                                        {notificacionSeleccionada.datos_adicionales.porcentaje}%
                                                    </p>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.total_deuda && (
                                                <div className="p-2 bg-muted rounded text-center">
                                                    <p className="text-xs text-muted-foreground">Deuda</p>
                                                    <p className="font-bold text-sm">
                                                        ${parseFloat(notificacionSeleccionada.datos_adicionales.total_deuda).toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.limite_deuda && (
                                                <div className="p-2 bg-muted rounded text-center col-span-2">
                                                    <p className="text-xs text-muted-foreground">Límite de deuda</p>
                                                    <p className="font-bold text-sm">
                                                        ${parseFloat(notificacionSeleccionada.datos_adicionales.limite_deuda).toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.periodo && (
                                                <div className="p-2 bg-muted rounded text-center">
                                                    <p className="text-xs text-muted-foreground">Período</p>
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <p className="font-bold text-sm">
                                                            {notificacionSeleccionada.datos_adicionales.periodo}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.meses_vencido && (
                                                <div className="p-2 bg-muted rounded text-center">
                                                    <p className="text-xs text-muted-foreground">Meses vencido</p>
                                                    <p className={`font-bold ${
                                                        notificacionSeleccionada.datos_adicionales.meses_vencido >= 2
                                                            ? "text-red-500"
                                                            : "text-yellow-500"
                                                    }`}>
                                                        {notificacionSeleccionada.datos_adicionales.meses_vencido}
                                                    </p>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.saldo_pendiente && (
                                                <div className="p-2 bg-muted rounded text-center col-span-2">
                                                    <p className="text-xs text-muted-foreground">Saldo pendiente</p>
                                                    <p className="font-bold text-sm text-red-500">
                                                        ${parseFloat(notificacionSeleccionada.datos_adicionales.saldo_pendiente).toLocaleString("es-CO")}
                                                    </p>
                                                </div>
                                            )}
                                            {notificacionSeleccionada.datos_adicionales.rubro && (
                                                <div className="p-2 bg-muted rounded text-center col-span-2">
                                                    <p className="text-xs text-muted-foreground">Rubro</p>
                                                    <p className="font-bold text-sm">
                                                        {notificacionSeleccionada.datos_adicionales.rubro}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {notificacionSeleccionada.placa && (
                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        onClick={() => navigate(`/vehiculos/${notificacionSeleccionada.placa}`)}
                                    >
                                        <Car className="h-4 w-4 mr-2" />
                                        Ver vehículo
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                <p>Selecciona una notificación para ver los detalles</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
