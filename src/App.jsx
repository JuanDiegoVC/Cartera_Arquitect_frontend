import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Taquilla from "./pages/Taquilla";
import Reportes from "./pages/Reportes";
import Vehiculos from "./pages/Vehiculos";
import VehiculosLista from "./pages/VehiculosLista";
import VehiculoDetalle from "./pages/VehiculoDetalle";
import Configuracion from "./pages/Configuracion";
import GenerarFacturacion from "./pages/GenerarFacturacion";
import GestionEgresos from "./pages/GestionEgresos";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas con layout */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Taquilla - Solo taquilla y administrador */}
          <Route
            path="/taquilla"
            element={
              <ProtectedRoute allowedRoles={["taquilla", "administrador"]}>
                <AppLayout>
                  <Taquilla />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Egresos - Solo taquilla y administrador */}
          <Route
            path="/egresos"
            element={
              <ProtectedRoute allowedRoles={["taquilla", "administrador"]}>
                <AppLayout>
                  <GestionEgresos />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Vehículos - Todos los autenticados */}
          <Route
            path="/vehiculos"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Vehiculos />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Lista de Vehículos con Exportación - Todos los autenticados */}
          <Route
            path="/vehiculos/lista"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VehiculosLista />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Detalle de Vehículo - Todos los autenticados */}
          <Route
            path="/vehiculos/:placa"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <VehiculoDetalle />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Reportes - Solo gerente y administrador */}
          <Route
            path="/reportes"
            element={
              <ProtectedRoute allowedRoles={["gerente", "administrador"]}>
                <AppLayout>
                  <Reportes />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Generar Facturación - Solo administrador */}
          <Route
            path="/generar-facturacion"
            element={
              <ProtectedRoute allowedRoles={["administrador"]}>
                <AppLayout>
                  <GenerarFacturacion />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Gestión de Egresos - Solo taquilla y administrador */}
          <Route
            path="/egresos"
            element={
              <ProtectedRoute allowedRoles={["taquilla", "administrador"]}>
                <AppLayout>
                  <GestionEgresos />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Configuración - Solo administrador */}
          <Route
            path="/configuracion"
            element={
              <ProtectedRoute allowedRoles={["administrador"]}>
                <AppLayout>
                  <Configuracion />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
