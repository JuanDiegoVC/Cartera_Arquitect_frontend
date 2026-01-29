import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../components/ui/table";
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
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";

import { Plus, Search, Edit, Trash2, UserCog, Power } from "lucide-react";
import { usuariosService } from "../services/usuariosService";
import { toast } from "sonner";

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [formData, setFormData] = useState({
        nombre_completo: "",
        email: "",
        password: "",
        rol: "taquilla",
    });

    useEffect(() => {
        loadUsuarios();
    }, []);

    const loadUsuarios = async () => {
        try {
            setLoading(true);
            const data = await usuariosService.getAll();
            // Handle pagination if present
            if (data.results) {
                setUsuarios(data.results);
            } else {
                setUsuarios(data);
            }
        } catch (error) {
            console.error("Error cargando usuarios:", error);
            toast.error("Error al cargar usuarios");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsuarios = usuarios.filter(
        (user) =>
            user.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            setFormData({
                nombre_completo: user.nombre_completo,
                email: user.email,
                password: "", // Password empty on edit
                rol: user.rol,
            });
        } else {
            setEditingUser(null);
            setFormData({
                nombre_completo: "",
                email: "",
                password: "",
                rol: "taquilla",
            });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingUser(null);
        setFormData({
            nombre_completo: "",
            email: "",
            password: "",
            rol: "taquilla",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (value) => {
        setFormData((prev) => ({ ...prev, rol: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingUser) {
                // Update
                const dataToSend = { ...formData };
                if (!dataToSend.password) delete dataToSend.password; // Don't send empty password
                await usuariosService.update(editingUser.usuario_id, dataToSend);
                toast.success("Usuario actualizado correctamente");
            } else {
                // Create
                await usuariosService.create(formData);
                toast.success("Usuario creado correctamente");
            }
            handleCloseModal();
            loadUsuarios();
        } catch (error) {
            console.error("Error guardando usuario:", error);
            toast.error("Error al guardar usuario");
        }
    };

    const handleToggleActive = async (user) => {
        try {
            await usuariosService.toggleActive(user.usuario_id);
            toast.success(
                `Usuario ${user.esta_activo ? "desactivado" : "activado"} correctamente`
            );
            loadUsuarios();
        } catch (error) {
            console.error("Error cambiando estado:", error);
            toast.error("Error al cambiar estado del usuario");
        }
    };

    const getRoleBadge = (rol) => {
        switch (rol) {
            case "administrador":
                return <Badge className="bg-red-500">Administrador</Badge>;
            case "gerente":
                return <Badge className="bg-blue-500">Gerente</Badge>;
            case "taquilla":
                return <Badge className="bg-green-500">Taquilla</Badge>;
            default:
                return <Badge variant="outline">{rol}</Badge>;
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-sm sm:text-base text-muted-foreground">
                        Administre los usuarios y sus permisos en el sistema
                    </p>
                </div>
                <Button onClick={() => handleOpenModal()} size="sm" className="sm:size-default">
                    <Plus className="mr-1 sm:mr-2 h-4 w-4" /> <span className="hidden sm:inline">Nuevo Usuario</span><span className="sm:hidden">Nuevo</span>
                </Button>
            </div>

            <Card>
                <CardHeader className="p-3 sm:p-6">
                    <div className="flex items-center space-x-2">
                        <div className="relative flex-1 max-w-full sm:max-w-sm">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={handleSearch}
                                className="pl-8 text-sm"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0 sm:p-6 sm:pt-0">
                    <div className="rounded-md border overflow-x-auto -mx-0 sm:mx-0">
                        <Table className="min-w-[500px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-xs sm:text-sm">Nombre</TableHead>
                                    <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Email</TableHead>
                                    <TableHead className="text-xs sm:text-sm">Rol</TableHead>
                                    <TableHead className="text-xs sm:text-sm text-center">Estado</TableHead>
                                    <TableHead className="text-xs sm:text-sm text-right">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            Cargando usuarios...
                                        </TableCell>
                                    </TableRow>
                                ) : filteredUsuarios.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            No se encontraron usuarios.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsuarios.map((user) => (
                                        <TableRow key={user.usuario_id}>
                                            <TableCell className="font-medium text-xs sm:text-sm">
                                                {user.nombre_completo}
                                            </TableCell>
                                            <TableCell className="text-xs sm:text-sm hidden sm:table-cell">{user.email}</TableCell>
                                            <TableCell>{getRoleBadge(user.rol)}</TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={user.esta_activo ? "default" : "secondary"}
                                                    className={`text-[10px] sm:text-xs ${
                                                        user.esta_activo
                                                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                                                            : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                                                    }`}
                                                >
                                                    {user.esta_activo ? "Activo" : "Inactivo"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1 sm:gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 sm:h-8 sm:w-8"
                                                        onClick={() => handleOpenModal(user)}
                                                        title="Editar"
                                                    >
                                                        <Edit className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={`h-7 w-7 sm:h-8 sm:w-8 ${
                                                            user.esta_activo
                                                                ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                                                                : "text-green-500 hover:text-green-600 hover:bg-green-50"
                                                        }`}
                                                        onClick={() => handleToggleActive(user)}
                                                        title={
                                                            user.esta_activo ? "Desactivar" : "Activar"
                                                        }
                                                    >
                                                        <Power className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit}>
                        <div className="p-6 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nombre_completo">Nombre Completo</Label>
                                <Input
                                    id="nombre_completo"
                                    name="nombre_completo"
                                    value={formData.nombre_completo}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Contraseña {editingUser && "(Dejar en blanco para no cambiar)"}
                                </Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!editingUser}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="rol">Rol</Label>
                                <Select
                                    value={formData.rol}
                                    onValueChange={handleRoleChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Seleccione un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="taquilla">Taquilla</SelectItem>
                                        <SelectItem value="administrador">Administrador</SelectItem>
                                        <SelectItem value="gerente">Gerente</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCloseModal}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit">Guardar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
