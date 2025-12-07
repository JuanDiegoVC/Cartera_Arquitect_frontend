import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, DollarSign, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "../components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Alert, AlertDescription } from "../components/ui/alert";
import { cobrosService } from "../services/cobrosService";
import { vehiculosService } from "../services/vehiculosService";
import { VEHICLE_TYPES } from "../utils/formatters";

export default function ConfiguracionCobros() {
    const [activeTab, setActiveTab] = useState("rubros");
    const [data, setData] = useState([]);
    const [rubrosList, setRubrosList] = useState([]); // Para el select de tarifas
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({});

    const [filterRubro, setFilterRubro] = useState("all");
    const [filterTipoVehiculo, setFilterTipoVehiculo] = useState("all");

    // Cargar datos al cambiar de tab o filtros
    useEffect(() => {
        loadData();
        if (activeTab === "tarifas") {
            loadRubrosList();
        }
    }, [activeTab, filterRubro, filterTipoVehiculo]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            let result;
            if (activeTab === "rubros") {
                result = await cobrosService.getAllRubros();
            } else if (activeTab === "tarifas") {
                const params = {};
                if (filterRubro !== "all") params.rubro = filterRubro;
                if (filterTipoVehiculo !== "all") params.tipo_vehiculo = filterTipoVehiculo;
                result = await cobrosService.getAllTarifas(params);
            } else if (activeTab === "polizas") {
                // Cargar tarifas de pólizas
                // 1. Encontrar rubro "Pólizas"
                const rubros = await cobrosService.getAllRubros();
                const rubrosList = Array.isArray(rubros) ? rubros : (rubros.results || []);
                const polizaRubro = rubrosList.find(r => r.nombre === "Pólizas");

                if (polizaRubro) {
                    // 2. Cargar tarifas de ese rubro
                    const tarifas = await cobrosService.getAllTarifas({ rubro: polizaRubro.rubro_id });
                    const tarifasData = Array.isArray(tarifas) ? tarifas : (tarifas.results || []);

                    // 3. Mapear tipos de vehículo a sus tarifas
                    const polizasMap = VEHICLE_TYPES.map(type => {
                        const tarifa = tarifasData.find(t => t.tipo_vehiculo === type.value);
                        return {
                            tipo_vehiculo: type.value,
                            label: type.label,
                            valor: tarifa ? tarifa.valor : 0,
                            tarifa_id: tarifa ? tarifa.tarifa_id : null,
                            rubro_id: polizaRubro.rubro_id
                        };
                    });
                    result = polizasMap;
                } else {
                    result = [];
                    setError("No se encontró el rubro 'Pólizas'. Por favor créelo primero.");
                }
            }

            // Manejar respuesta paginada o lista directa
            const listData = Array.isArray(result) ? result : (result.results || []);
            setData(listData);
        } catch (err) {
            setError("Error al cargar los datos");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRubrosList = async () => {
        try {
            const result = await cobrosService.getAllRubros();
            // Manejar respuesta paginada o lista directa
            const listData = Array.isArray(result) ? result : (result.results || []);
            setRubrosList(listData);
        } catch (err) {
            console.error("Error al cargar lista de rubros", err);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        if (item) {
            setFormData({ ...item });
        } else {
            // Valores iniciales
            setFormData(
                activeTab === "rubros"
                    ? { nombre: "", descripcion: "", es_ocasional: false }
                    : { rubro: "", tipo_vehiculo: "taxi_blanco", valor: "", fecha_inicio_vigencia: new Date().toISOString().split('T')[0] }
            );
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({});
    };

    const handleSave = async () => {
        try {
            if (activeTab === "rubros") {
                if (editingItem) {
                    await cobrosService.updateRubro(editingItem.rubro_id, formData);
                } else {
                    await cobrosService.createRubro(formData);
                }
            } else {
                if (editingItem) {
                    await cobrosService.updateTarifa(editingItem.tarifa_id, formData);
                } else {
                    await cobrosService.createTarifa(formData);
                }
            }
            handleCloseModal();
            loadData();
        } catch (err) {
            setError("Error al guardar: " + (err.detail || JSON.stringify(err)));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar este registro?")) return;

        try {
            if (activeTab === "rubros") {
                await cobrosService.deleteRubro(id);
            } else {
                await cobrosService.deleteTarifa(id);
            }
            loadData();
            loadData();
        } catch (err) {
            console.error(err);
            // Check for status or specific error content (IntegrityError)
            // The service might return the data object directly, so status might be missing.
            // We check for 'detail' containing IntegrityError as a fallback.
            const isIntegrityError = err.detail && (err.detail.includes("IntegrityError") || err.detail.includes("Foreign Key"));

            if (err.status === 409 || err.status === 400 || isIntegrityError) {
                // Use the friendly error message from backend if available
                alert(err.error || err.data?.error || "No se puede eliminar este registro porque está en uso o tiene dependencias.");
            } else {
                setError("Error al eliminar: " + (err.detail || JSON.stringify(err)));
            }
        }
    };

    const handleUpdatePoliza = async (item, nuevoValor) => {
        try {
            const valor = parseFloat(nuevoValor);
            if (isNaN(valor)) return;

            const payload = {
                rubro: item.rubro_id,
                tipo_vehiculo: item.tipo_vehiculo,
                valor: valor,
                fecha_inicio_vigencia: new Date().toISOString().split('T')[0] // Vigencia desde hoy
            };

            if (item.tarifa_id) {
                await cobrosService.updateTarifa(item.tarifa_id, payload);
            } else {
                const newTarifa = await cobrosService.createTarifa(payload);
                // Actualizar ID para futuras ediciones sin recargar
                item.tarifa_id = newTarifa.tarifa_id;
            }

            // Actualizar estado local
            setData(prevData => prevData.map(v =>
                v.tipo_vehiculo === item.tipo_vehiculo ? { ...v, valor: valor, tarifa_id: item.tarifa_id || v.tarifa_id } : v
            ));
        } catch (err) {
            console.error("Error actualizando póliza:", err);
            alert("Error al actualizar el valor de la póliza");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Conceptos de Cobro
                    </h1>
                    <p className="text-muted-foreground">
                        Gestione los rubros y tarifas del sistema
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo {activeTab === "rubros" ? "Rubro" : "Tarifa"}
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 rounded-xl bg-muted p-1">
                <button
                    onClick={() => setActiveTab("rubros")}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === "rubros"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.12] hover:text-white"
                        }`}
                >
                    Rubros (Conceptos)
                </button>
                <button
                    onClick={() => setActiveTab("tarifas")}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === "tarifas"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.12] hover:text-white"
                        }`}
                >
                    Tarifas
                </button>
                <button
                    onClick={() => setActiveTab("polizas")}
                    className={`w-full rounded-lg py-2.5 text-sm font-medium leading-5 ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2 ${activeTab === "polizas"
                        ? "bg-background shadow text-foreground"
                        : "text-muted-foreground hover:bg-white/[0.12] hover:text-white"
                        }`}
                >
                    Gestión de Pólizas
                </button>
            </div>

            {/* Filters for Tarifas */}
            {activeTab === "tarifas" && (
                <div className="flex gap-4">
                    <div className="w-1/3">
                        <Label className="mb-2 block">Filtrar por Rubro</Label>
                        <Select
                            value={filterRubro}
                            onValueChange={setFilterRubro}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los rubros" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los rubros</SelectItem>
                                {rubrosList.map((rubro) => (
                                    <SelectItem key={rubro.rubro_id} value={String(rubro.rubro_id)}>
                                        {rubro.nombre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="w-1/3">
                        <Label className="mb-2 block">Filtrar por Tipo Vehículo</Label>
                        <Select
                            value={filterTipoVehiculo}
                            onValueChange={setFilterTipoVehiculo}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Todos los tipos" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los tipos</SelectItem>
                                {VEHICLE_TYPES.map(type => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* Content */}
            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Cargando datos...
                        </div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay registros encontrados.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        {activeTab === "rubros" ? (
                                            <>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Nombre</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Descripción</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Ocasional</th>
                                            </>
                                        ) : activeTab === "tarifas" ? (
                                            <>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Rubro</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo Vehículo</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Valor</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Inicio Vigencia</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Tipo de Vehículo</th>
                                                <th className="px-4 py-3 text-left text-sm font-semibold">Valor Póliza (Anual)</th>
                                            </>
                                        )}
                                        <th className="px-4 py-3 text-right text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.map((item) => (
                                        activeTab === "polizas" ? (
                                            <tr key={item.tipo_vehiculo} className="border-b hover:bg-muted/30 transition-colors">
                                                <td className="px-4 py-3 font-medium">{item.label}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-muted-foreground">$</span>
                                                        <Input
                                                            type="number"
                                                            className="h-8 w-32"
                                                            defaultValue={item.valor}
                                                            onBlur={(e) => handleUpdatePoliza(item, e.target.value)}
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                                                    Auto-guardado al salir
                                                </td>
                                            </tr>
                                        ) : (
                                            <tr
                                                key={activeTab === "rubros" ? item.rubro_id : item.tarifa_id}
                                                className="border-b hover:bg-muted/30 transition-colors"
                                            >
                                                {activeTab === "rubros" ? (
                                                    <>
                                                        <td className="px-4 py-3 font-medium">{item.nombre}</td>
                                                        <td className="px-4 py-3 text-muted-foreground">{item.descripcion}</td>
                                                        <td className="px-4 py-3">
                                                            {item.es_ocasional ? (
                                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                                                                    Sí
                                                                </span>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">No</span>
                                                            )}
                                                        </td>
                                                    </>
                                                ) : (
                                                    <>
                                                        <td className="px-4 py-3 font-medium">
                                                            {rubrosList.find(r => r.rubro_id === item.rubro)?.nombre || item.rubro}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                                                {item.tipo_vehiculo}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3 font-mono">${item.valor}</td>
                                                        <td className="px-4 py-3">{item.fecha_inicio_vigencia}</td>
                                                    </>
                                                )}
                                                <td className="px-4 py-3 text-right space-x-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleOpenModal(item)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => handleDelete(activeTab === "rubros" ? item.rubro_id : item.tarifa_id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        )
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px] p-6">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Editar" : "Crear"} {activeTab === "rubros" ? "Rubro" : "Tarifa"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {activeTab === "rubros" ? (
                            <>
                                <div className="space-y-2">
                                    <Label>Nombre</Label>
                                    <Input
                                        value={formData.nombre || ""}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        placeholder="Ej: Administración"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Input
                                        value={formData.descripcion || ""}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        placeholder="Descripción opcional"
                                    />
                                </div>
                                <div className="flex items-center space-x-2 pt-2">
                                    <Checkbox
                                        id="es_ocasional"
                                        checked={formData.es_ocasional || false}
                                        onCheckedChange={(checked) => setFormData({ ...formData, es_ocasional: checked })}
                                    />
                                    <div className="grid gap-1.5 leading-none">
                                        <Label
                                            htmlFor="es_ocasional"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Es Rubro Ocasional
                                        </Label>
                                        <p className="text-xs text-muted-foreground">
                                            Marque si este rubro se cobra esporádicamente (ej: multas, daños).
                                        </p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    <Label>Rubro</Label>
                                    <Select
                                        value={String(formData.rubro || "")}
                                        onValueChange={(value) => setFormData({ ...formData, rubro: parseInt(value) })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione un rubro" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {rubrosList.map((rubro) => (
                                                <SelectItem key={rubro.rubro_id} value={String(rubro.rubro_id)}>
                                                    {rubro.nombre}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Tipo de Vehículo</Label>
                                    <Select
                                        value={formData.tipo_vehiculo || ""}
                                        onValueChange={(value) => setFormData({ ...formData, tipo_vehiculo: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Seleccione tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {VEHICLE_TYPES.map(type => (
                                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Valor</Label>
                                    <Input
                                        type="number"
                                        value={formData.valor || ""}
                                        onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Inicio Vigencia</Label>
                                    <Input
                                        type="date"
                                        value={formData.fecha_inicio_vigencia || ""}
                                        onChange={(e) => setFormData({ ...formData, fecha_inicio_vigencia: e.target.value })}
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseModal}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave}>
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
