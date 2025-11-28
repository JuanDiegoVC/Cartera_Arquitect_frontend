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
  History,
  ChevronRight,
} from "lucide-react";
import "./AppSidebar.css";
import logo2 from "../../assets/Logo2.png";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
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
    icon: Car,
    roles: ["taquilla", "administrador", "gerente"], // Todos
    children: [
      {
        title: "Lista de Vehículos",
        url: "/vehiculos/lista",
        icon: List,
        roles: ["taquilla", "administrador", "gerente"],
      },
      {
        title: "Historial de Pagos",
        url: "/historial-pagos",
        icon: History,
        roles: ["taquilla", "administrador", "gerente"],
      },
    ],
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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Filtrar items del menú según el rol del usuario
  const visibleMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.rol)
  );

  // Badge de rol con colores corporativos
  const getRoleBadgeColor = (rol) => {
    const colors = {
      administrador: "role-badge-admin",
      gerente: "role-badge-gerente",
      taquilla: "role-badge-taquilla",
    };
    return colors[rol] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader data-sidebar="header" className="p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <img src={logo2} alt="Logo Sotrapeñol" className="h-10 w-auto object-contain" />
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
          <div className="flex items-center justify-center mx-auto">
            <img src={logo2} alt="Logo Sotrapeñol" className="h-8 w-auto object-contain" />
          </div>
        )}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel data-sidebar="group-label">Menú Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.children ? (
                    <Collapsible className="group/collapsible">
                      <SidebarMenuButton asChild>
                        <CollapsibleTrigger>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </CollapsibleTrigger>
                      </SidebarMenuButton>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton asChild isActive={isActive(subItem.url)}>
                                <NavLink to={subItem.url}>
                                  <subItem.icon className="h-4 w-4" />
                                  <span>{subItem.title}</span>
                                </NavLink>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator data-sidebar="separator" className="my-4" />

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton data-logout="true" onClick={handleLogout}>
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
