import { useState, useEffect } from "react";
import { useDebounce } from "../../hooks/useDebounce";
import { vehiculosService } from "../../services/vehiculosService";
import PlacaAutocomplete from "../common/PlacaAutocomplete";
import "./VehicleSearch.css";

/**
 * Componente de búsqueda de vehículos por placa
 * RF-002: La búsqueda debe estar siempre visible/accesible
 * HU-04: Consulta de estado de cuenta
 */
const VehicleSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicleData, setVehicleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState(null);

  const debouncedSearch = useDebounce(searchTerm, 500);

  // Efecto para realizar la búsqueda cuando cambia el término con debounce
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length >= 6) {
        setLoading(true);
        setError(null);
        try {
          const data = await vehiculosService.buscarPorPlaca(
            debouncedSearch.toUpperCase()
          );
          setVehicleData(data);
          setShowResults(true);
        } catch (err) {
          console.error("Error en búsqueda:", err);
          if (err.response?.status === 404) {
            setError("Vehículo no encontrado");
          } else {
            setError("Error al buscar el vehículo");
          }
          setVehicleData(null);
          setShowResults(true);
        } finally {
          setLoading(false);
        }
      } else {
        // No limpiar cuando hay menos de 6 caracteres para permitir autocompletado
        if (debouncedSearch.length === 0) {
          setVehicleData(null);
          setShowResults(false);
          setError(null);
        }
      }
    };

    performSearch();
  }, [debouncedSearch]);

  // Manejar selección de placa desde autocompletado
  const handlePlacaSelect = async (vehiculo) => {
    setSearchTerm(vehiculo.placa);
    setLoading(true);
    setError(null);
    try {
      const data = await vehiculosService.buscarPorPlaca(vehiculo.placa);
      setVehicleData(data);
      setShowResults(true);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError("Error al cargar datos del vehículo");
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setShowResults(false);
    setVehicleData(null);
    setError(null);
  };

  const calcularTotalDeuda = () => {
    if (!vehicleData?.deudas_pendientes) return 0;
    return vehicleData.deudas_pendientes.reduce(
      (total, deuda) => total + parseFloat(deuda.saldo_pendiente),
      0
    );
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="vehicle-search">
      <div className="search-input-wrapper">
        <PlacaAutocomplete
          value={searchTerm}
          onChange={setSearchTerm}
          onSelect={handlePlacaSelect}
          placeholder="Buscar por placa"
        />
        {loading && <span className="search-loading">🔍</span>}
      </div>

      {showResults && vehicleData && (
        <div className="search-results">
          <div className="search-result-card">
            <div className="result-header">
              <div>
                <div className="result-placa">{vehicleData.placa}</div>
                <div className="result-tipo">{vehicleData.tipo_vehiculo}</div>
              </div>
              <button onClick={handleClose} className="close-btn">
                ✕
              </button>
            </div>

            {vehicleData.propietario_nombre && (
              <div className="result-propietario">
                <strong>Propietario:</strong> {vehicleData.propietario_nombre}
              </div>
            )}

            <div className="deudas-section">
              <h3>Estado de Cuenta</h3>

              {vehicleData.deudas_pendientes &&
                vehicleData.deudas_pendientes.length > 0 ? (
                <>
                  <div className="deudas-list">
                    {vehicleData.deudas_pendientes.map((deuda) => (
                      <div key={deuda.deuda_id} className="deuda-item">
                        <div className="deuda-info">
                          <span className="deuda-rubro">
                            {deuda.rubro.nombre}
                          </span>
                          <span className="deuda-periodo">
                            {(() => {
                              const [year, month] = deuda.periodo.split('-');
                              return new Date(parseInt(year), parseInt(month) - 1, 15).toLocaleDateString(
                                "es-CO",
                                {
                                  year: "numeric",
                                  month: "long",
                                }
                              );
                            })()}
                          </span>
                        </div>
                        <div className="deuda-montos">
                          <div>
                            <small>Valor:</small>
                            <span>{formatCurrency(deuda.valor_cargado)}</span>
                          </div>
                          <div>
                            <small>Saldo:</small>
                            <strong className="saldo-pendiente">
                              {formatCurrency(deuda.saldo_pendiente)}
                            </strong>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="total-deuda">
                    <strong>Total Pendiente:</strong>
                    <span className="total-amount">
                      {formatCurrency(calcularTotalDeuda())}
                    </span>
                  </div>
                </>
              ) : (
                <div className="sin-deudas">
                  ✅ Este vehículo no tiene deudas pendientes
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showResults && error && (
        <div className="search-results">
          <div className="no-results">
            {error}
            <button onClick={handleClose} className="close-btn-small">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleSearch;
