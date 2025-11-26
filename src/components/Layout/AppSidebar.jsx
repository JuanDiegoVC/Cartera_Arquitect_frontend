import {
  LayoutDashboard,
  DollarSign,
  FileText,
  Settings,
  Car,
  LogOut,
  User,
  FileSpreadsheet,
  List,
  Receipt,
  ClipboardCheck,
  ShieldCheck,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
  SidebarSeparator,
} from "../ui/sidebar";
import { Button } from "../ui/button";

// Definir roles permitidos por cada item del menú
const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Taquilla",
    url: "/taquilla",
    icon: DollarSign,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Egresos",
    url: "/egresos",
    icon: Receipt,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Cierre de Turno",
    url: "/cierre-turno",
    icon: ClipboardCheck,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Vehículos",
    url: "/vehiculos",
    icon: Car,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Lista de Vehículos",
    url: "/vehiculos/lista",
    icon: List,
    roles: ["taquilla", "administrador", "gerente"], // Todos
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: FileText,
    roles: ["gerente", "administrador"], // Gerente y admin
  },
  {
    title: "Generar Facturación",
    url: "/generar-facturacion",
    icon: FileSpreadsheet,
    roles: ["administrador", "gerente"], // Admin y gerente
  },
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
    roles: ["administrador", "gerente"], // Admin y gerente
  },
  {
    title: "Auditoría",
    url: "/auditoria",
    icon: ShieldCheck,
    roles: ["administrador", "gerente"], // Admin y gerente
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === "collapsed";

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Filtrar items del menú según el rol del usuario
  const visibleMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.rol)
  );

  // Badge de rol con colores
  const getRoleBadgeColor = (rol) => {
    const colors = {
      administrador: "bg-red-500/10 text-red-600 border-red-500/20",
      gerente: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      taquilla: "bg-green-500/10 text-green-600 border-green-500/20",
    };
    return colors[rol] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-sidebar-primary-foreground" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-sidebar-foreground">
                  Sotrapeñol
                </h2>
                <p className="text-xs text-sidebar-foreground/60">
                  Gestión de Recaudos
                </p>
              </div>
            </div>
            {user && (
              <div className="flex items-start gap-2 p-2 rounded-lg bg-sidebar-accent/50">
                <User className="h-4 w-4 text-sidebar-foreground/70 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">
                    {user.nombre_completo}
                  </p>
                  <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full border ${getRoleBadgeColor(
                      user.rol
                    )}`}
                  >
                    {user.rol === "administrador"
                      ? "Admin"
                      : user.rol === "gerente"
                      ? "Gerente"
                      : "Taquilla"}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
        {isCollapsed && (
          <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center mx-auto">
            <DollarSign className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)}>
                    <NavLink to={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
