import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { NotificacionesProvider } from "./context/NotificacionesContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { AppLayout } from "./components/Layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Taquilla from "./pages/Taquilla";
import Reportes from "./pages/Reportes";
import DeudoresMorosos from "./pages/DeudoresMorosos";
import Vehiculos from "./pages/Vehiculos";
import VehiculosLista from "./pages/VehiculosLista";
import VehiculoDetalle from "./pages/VehiculoDetalle";
import Configuracion from "./pages/Configuracion";
import ConfiguracionCobros from "./pages/ConfiguracionCobros";
import ConfiguracionGeneral from "./pages/ConfiguracionGeneral";
import NotificacionesConfig from "./pages/NotificacionesConfig";
import GenerarFacturacion from "./pages/GenerarFacturacion";
import GestionEgresos from "./pages/GestionEgresos";
import ConfiguracionEgresos from "./pages/ConfiguracionEgresos";
import HistorialEgresos from "./pages/HistorialEgresos";
import CierreDeTurno from "./pages/CierreDeTurno";
import Auditoria from "./pages/Auditoria";
import HistorialPagos from "./pages/HistorialPagos";
import Usuarios from "./pages/Usuarios";
import Rendimiento from "./pages/Rendimiento";
import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <NotificacionesProvider>
        <Router>
          <Routes>
            {/* Ruta pública */}
            <Route path="/login" element={<Login />} />

            {/* Rutas protegidas con layout */}
            {/* Dashboard - Solo administrador y gerente */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Taquilla - Taquilla, administrador y gerente */}
            <Route
              path="/taquilla"
              element={
                <ProtectedRoute
                  allowedRoles={["taquilla", "administrador", "gerente"]}
                >
                  <AppLayout>
                    <Taquilla />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Egresos - Taquilla, administrador y gerente */}
            <Route
              path="/egresos"
              element={
                <ProtectedRoute
                  allowedRoles={["taquilla", "administrador", "gerente"]}
                >
                  <AppLayout>
                    <GestionEgresos />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Historial de Egresos - Solo gerente y administrador */}
            <Route
              path="/egresos/historial"
              element={
                <ProtectedRoute allowedRoles={["gerente", "administrador"]}>
                  <AppLayout>
                    <HistorialEgresos />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Cierre de Turno - Taquilla, administrador y gerente */}
            <Route
              path="/cierre-turno"
              element={
                <ProtectedRoute
                  allowedRoles={["taquilla", "administrador", "gerente"]}
                >
                  <AppLayout>
                    <CierreDeTurno />
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

            {/* Historial de Pagos - Todos los autenticados */}
            <Route
              path="/historial-pagos"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <HistorialPagos />
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

            <Route
              path="/reportes/morosos"
              element={
                <ProtectedRoute allowedRoles={["gerente", "administrador"]}>
                  <AppLayout>
                    <DeudoresMorosos />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Generar Facturación - Administrador y gerente */}
            <Route
              path="/generar-facturacion"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
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



            {/* Configuración - Todos (taquilla solo ve General) */}
            <Route
              path="/configuracion"
              element={
                <ProtectedRoute allowedRoles={["taquilla", "administrador", "gerente"]}>
                  <AppLayout>
                    <Configuracion />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion/usuarios"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <Usuarios />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion/cobros"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <ConfiguracionCobros />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion/egresos"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <ConfiguracionEgresos />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion/general"
              element={
                <ProtectedRoute allowedRoles={["taquilla", "administrador", "gerente"]}>
                  <AppLayout>
                    <ConfiguracionGeneral />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/configuracion/notificaciones"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <NotificacionesConfig />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Auditoría - Administrador y gerente */}
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <Auditoria />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Rendimiento (Analytics) - Solo administrador y gerente */}
            <Route
              path="/rendimiento"
              element={
                <ProtectedRoute allowedRoles={["administrador", "gerente"]}>
                  <AppLayout>
                    <Rendimiento />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </Router>
      </NotificacionesProvider>
    </AuthProvider>
  );
}

export default App;
