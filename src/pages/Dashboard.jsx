import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VehicleSearch from '../components/vehiculos/VehicleSearch';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState('inicio');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'inicio', label: 'Inicio', icon: '🏠' },
    { id: 'vehiculos', label: 'Vehículos', icon: '🚗' },
    { id: 'cobros', label: 'Cobros', icon: '💰' },
    { id: 'egresos', label: 'Egresos', icon: '💸' },
    { id: 'reportes', label: 'Reportes', icon: '📊' },
  ];

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>SOTRAP</h1>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${selectedSection === item.id ? 'active' : ''}`}
              onClick={() => setSelectedSection(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={handleLogout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="content-header">
          <h2>
            {menuItems.find((item) => item.id === selectedSection)?.label || 'Inicio'}
          </h2>
          
          {/* RF-002: Búsqueda de vehículos siempre visible */}
          <div className="header-search">
            <VehicleSearch />
          </div>
        </header>

        <div className="content-body">
          {selectedSection === 'inicio' && (
            <div className="welcome-section">
              <h3>Bienvenido al Sistema de Gestión de Recaudos</h3>
              <p>Selecciona una opción del menú para comenzar.</p>
              
              <div className="quick-stats">
                <div className="stat-card">
                  <h4>Vehículos Activos</h4>
                  <p className="stat-number">-</p>
                </div>
                <div className="stat-card">
                  <h4>Cobros del Día</h4>
                  <p className="stat-number">$-</p>
                </div>
                <div className="stat-card">
                  <h4>Deudas Pendientes</h4>
                  <p className="stat-number">-</p>
                </div>
              </div>
            </div>
          )}

          {selectedSection === 'vehiculos' && (
            <div>
              <h3>Gestión de Vehículos</h3>
              <p>Módulo en desarrollo...</p>
            </div>
          )}

          {selectedSection === 'cobros' && (
            <div>
              <h3>Gestión de Cobros</h3>
              <p>Módulo en desarrollo...</p>
            </div>
          )}

          {selectedSection === 'egresos' && (
            <div>
              <h3>Gestión de Egresos</h3>
              <p>Módulo en desarrollo...</p>
            </div>
          )}

          {selectedSection === 'reportes' && (
            <div>
              <h3>Reportes</h3>
              <p>Módulo en desarrollo...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
