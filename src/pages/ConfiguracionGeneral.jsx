import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Settings, Sun, Moon, ArrowLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";

export default function ConfiguracionGeneral() {
  const { theme, setTheme, isDark } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header con botón de regreso */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/configuracion")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Configuraciones Generales
          </h1>
          <p className="text-muted-foreground">
            Personalice la apariencia y comportamiento del sistema
          </p>
        </div>
      </div>

      {/* Card de Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Apariencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Tema del Sistema</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Seleccione el estilo visual de la aplicación
            </p>
            
            <div className="flex gap-4">
              {/* Opción Claro */}
              <button
                onClick={() => setTheme("light")}
                className={`
                  flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200
                  hover:shadow-lg cursor-pointer min-w-[140px]
                  ${!isDark 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border hover:border-muted-foreground/50"
                  }
                `}
              >
                <div className={`
                  p-4 rounded-full mb-3 transition-colors
                  ${!isDark ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}>
                  <Sun className="h-8 w-8" />
                </div>
                <span className={`font-semibold ${!isDark ? "text-primary" : "text-foreground"}`}>
                  Claro
                </span>
                {!isDark && (
                  <span className="text-xs text-primary mt-1">Activo</span>
                )}
              </button>

              {/* Opción Oscuro */}
              <button
                onClick={() => setTheme("dark")}
                className={`
                  flex flex-col items-center p-6 rounded-xl border-2 transition-all duration-200
                  hover:shadow-lg cursor-pointer min-w-[140px]
                  ${isDark 
                    ? "border-primary bg-primary/5 shadow-md" 
                    : "border-border hover:border-muted-foreground/50"
                  }
                `}
              >
                <div className={`
                  p-4 rounded-full mb-3 transition-colors
                  ${isDark ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}
                `}>
                  <Moon className="h-8 w-8" />
                </div>
                <span className={`font-semibold ${isDark ? "text-primary" : "text-foreground"}`}>
                  Oscuro
                </span>
                {isDark && (
                  <span className="text-xs text-primary mt-1">Activo</span>
                )}
              </button>
            </div>
          </div>

          {/* Preview del tema actual */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Tema actual: <span className="font-medium text-foreground">{isDark ? "Oscuro" : "Claro"}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
