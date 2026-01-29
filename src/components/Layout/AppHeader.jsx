import { useState } from "react";
import { User, Search, X } from "lucide-react";
import { SidebarTrigger } from "../ui/sidebar";
import { useAuth } from "../../context/AuthContext";
import VehicleSearch from "../vehiculos/VehicleSearch";
import { NotificationBell } from "./NotificationBell";

export function AppHeader() {
  const { user } = useAuth();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Función para obtener iniciales del nombre
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="h-14 sm:h-16 border-b border-border bg-card px-3 sm:px-6 flex items-center justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        <SidebarTrigger />

        {/* Búsqueda de vehículos - Versión Desktop */}
        <div className="flex-1 max-w-md hidden sm:block">
          <VehicleSearch />
        </div>

        {/* Búsqueda de vehículos - Versión Móvil expandible */}
        {mobileSearchOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-sm">
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-3 p-3 border-b border-border bg-card">
                <button
                  onClick={() => setMobileSearchOpen(false)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Cerrar búsqueda"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
                <div className="flex-1">
                  <VehicleSearch autoFocus onClose={() => setMobileSearchOpen(false)} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info de usuario - Responsive */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Botón de búsqueda móvil */}
        <button
          onClick={() => setMobileSearchOpen(true)}
          className="sm:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Buscar vehículo"
        >
          <Search className="h-5 w-5 text-muted-foreground" />
        </button>

        {/* Campanita de notificaciones */}
        <NotificationBell />
        <div className="text-right hidden lg:block">
          <p className="text-sm font-medium text-foreground truncate max-w-[150px]">
            {user?.nombre_completo || "Usuario"}
          </p>
          <p className="text-xs text-muted-foreground capitalize">
            {user?.rol || "Sesión activa"}
          </p>
        </div>

        {/* Avatar con iniciales */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm sm:text-base shadow-md">
          {user?.nombre_completo ? (
            getInitials(user.nombre_completo)
          ) : (
            <User className="h-4 w-4 sm:h-5 sm:w-5" />
          )}
        </div>
      </div>
    </header>
  );
}
