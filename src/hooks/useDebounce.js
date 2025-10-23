import { useState, useEffect } from 'react';

/**
 * Hook personalizado para hacer búsquedas con debounce
 * Útil para búsqueda de vehículos por placa (RF-002)
 * @param {string} value - Valor a buscar
 * @param {number} delay - Tiempo de espera en ms (default: 500)
 * @returns {string} Valor con debounce aplicado
 */
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
