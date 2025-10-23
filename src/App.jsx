import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import { AppLayout } from './components/Layout/AppLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Taquilla from './pages/Taquilla';
import Reportes from './pages/Reportes';
import Vehiculos from './pages/Vehiculos';
import Configuracion from './pages/Configuracion';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas protegidas con nuevo layout */}
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
          
          <Route
            path="/taquilla"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Taquilla />
                </AppLayout>
              </ProtectedRoute>
            }
          />

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

          <Route
            path="/reportes"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Reportes />
                </AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/configuracion"
            element={
              <ProtectedRoute>
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
