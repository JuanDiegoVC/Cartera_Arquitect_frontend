import { useState } from 'react';
import { useDebounce } from '../../hooks/useDebounce';
import { vehiculosService } from '../../services/vehiculosService';
import { formatPlaca } from '../../utils/formatters';
import './VehicleSearch.css';

/**
 * Componente de búsqueda de vehículos por placa
 * RF-002: La búsqueda debe estar siempre visible/accesible
 */
const VehicleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Efecto para realizar la búsqueda cuando cambia el término con debounce
  useState(() => {
    const performSearch = async () => {
      if (debouncedSearch.length >= 2) {
        setLoading(true);
        try {
          const data = await vehiculosService.buscarPorPlaca(debouncedSearch);
          setResults(data.results || []);
          setShowResults(true);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          setResults([]);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    };

    performSearch();
  }, [debouncedSearch]);

  const handleInputChange = (e) => {
    const value = formatPlaca(e.target.value);
    setSearchTerm(value);
  };

  const handleSelectVehicle = (vehiculo) => {
    // Aquí se puede navegar a la vista de detalle del vehículo
    // o mostrar un modal con la información
    console.log('Vehículo seleccionado:', vehiculo);
    setSearchTerm('');
    setShowResults(false);
  };

  return (
    <div className="vehicle-search">
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder="Buscar por placa..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-input"
          maxLength={10}
        />
        {loading && <span className="search-loading">🔍</span>}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results">
          {results.map((vehiculo) => (
            <div
              key={vehiculo.vehiculo_id}
              className="search-result-item"
              onClick={() => handleSelectVehicle(vehiculo)}
            >
              <div className="result-placa">{vehiculo.placa}</div>
              <div className="result-info">
                <span className="result-tipo">{vehiculo.tipo_vehiculo}</span>
                {vehiculo.propietario_nombre && (
                  <span className="result-propietario">
                    {vehiculo.propietario_nombre}
                  </span>
                )}
              </div>
              <div className={`result-estado ${vehiculo.estado}`}>
                {vehiculo.estado}
              </div>
            </div>
          ))}
        </div>
      )}

      {showResults && results.length === 0 && searchTerm.length >= 2 && !loading && (
        <div className="search-results">
          <div className="no-results">No se encontraron vehículos</div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;
