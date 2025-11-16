
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';


/**
 * Componente para proteger rutas que requieren autenticación
 * y opcionalmente verificar roles específicos.
 *
 * @param {React.ReactNode} children - Componente hijo a renderizar si tiene acceso
 * @param {string[]} allowedRoles - Array de roles permitidos (opcional)
 *
 * Ejemplo de uso:
 * <ProtectedRoute allowedRoles={['administrador']}>
 *   <Configuracion />
 * </ProtectedRoute>
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se especifican roles permitidos, verificar
  if (allowedRoles && !allowedRoles.includes(user.rol)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <div className="text-center w-full max-w-md mx-auto p-6 sm:p-8 bg-white rounded-lg shadow-lg">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
            Acceso Denegado
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
            No tienes permisos para acceder a esta sección.
          </p>
          <div className="space-y-2 text-xs sm:text-sm text-gray-500 bg-gray-50 p-3 sm:p-4 rounded-lg">
            <p className="flex flex-col sm:flex-row sm:justify-center sm:gap-2">
              <span>Tu rol:</span>
              <span className="font-semibold text-gray-700">{user.rol}</span>
            </p>
            <p className="flex flex-col sm:flex-row sm:justify-center sm:gap-2">
              <span>Roles permitidos:</span>
              <span className="font-semibold text-gray-700">
                {allowedRoles.join(", ")}
              </span>
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="mt-4 sm:mt-6 w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white text-sm sm:text-base rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  // Si pasa todas las validaciones, renderizar el componente
  return children;
};

export default ProtectedRoute;
