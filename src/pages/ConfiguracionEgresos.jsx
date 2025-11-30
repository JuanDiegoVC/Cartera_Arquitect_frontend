import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
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
import { Alert, AlertDescription } from "../components/ui/alert";
import {
    obtenerCategorias,
    crearCategoria,
    actualizarCategoria,
    eliminarCategoria
} from "../services/egresosService";
import { useNavigate } from "react-router-dom";

export default function ConfiguracionEgresos() {
    const navigate = useNavigate();
    const [categorias, setCategorias] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ nombre: "" });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await obtenerCategorias();
            const list = Array.isArray(data) ? data : (data.results || []);
            setCategorias(list);
        } catch (err) {
            setError("Error al cargar las categorías");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item = null) => {
        setEditingItem(item);
        setFormData(item ? { nombre: item.nombre } : { nombre: "" });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ nombre: "" });
    };

    const handleSave = async () => {
        try {
            if (!formData.nombre.trim()) {
                alert("El nombre es requerido");
                return;
            }

            if (editingItem) {
                await actualizarCategoria(editingItem.categoria_id, formData);
            } else {
                await crearCategoria(formData);
            }
            handleCloseModal();
            loadData();
        } catch (err) {
            console.error(err);
            alert("Error al guardar: " + (err.response?.data?.detail || "Error desconocido"));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("¿Está seguro de eliminar esta categoría?")) return;

        try {
            await eliminarCategoria(id);
            loadData();
        } catch (err) {
            console.error(err);
            // Check for integrity error (foreign key constraint)
            if (err.response?.status === 500 || err.response?.data?.detail?.includes("IntegrityError")) {
                alert("No se puede eliminar esta categoría porque tiene egresos asociados.");
            } else {
                alert("Error al eliminar: " + (err.response?.data?.detail || "Error desconocido"));
            }
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/configuracion")}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Categorías de Egresos
                    </h1>
                    <p className="text-muted-foreground">
                        Gestione los tipos de gastos del sistema
                    </p>
                </div>
            </div>

            <div className="flex justify-end">
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Categoría
                </Button>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <Card>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Cargando datos...
                        </div>
                    ) : categorias.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            No hay categorías registradas.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="px-6 py-3 text-left text-sm font-semibold">Nombre</th>
                                        <th className="px-6 py-3 text-right text-sm font-semibold">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categorias.map((item) => (
                                        <tr key={item.categoria_id} className="border-b hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 font-medium">{item.nombre}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
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
                                                    onClick={() => handleDelete(item.categoria_id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Form */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItem ? "Editar" : "Crear"} Categoría
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre</Label>
                            <Input
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                placeholder="Ej: Mantenimiento"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSave();
                                }}
                            />
                        </div>
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
