import { useState, useCallback } from "react";

/**
 * Hook para formatear entrada de moneda en tiempo real (sin decimales)
 * Convierte: 91150 -> 91.150
 * Convierte: 1000000 -> 1.000.000
 */
export function useCurrencyInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const formatCurrency = useCallback((inputValue) => {
    if (!inputValue && inputValue !== "0") return "";

    // Remover todos los caracteres excepto números
    let numericValue = inputValue.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    // Remover ceros a la izquierda (excepto si es solo "0")
    numericValue = numericValue.replace(/^0+/, "") || "0";

    // Formatear con puntos cada 3 dígitos (separador de miles)
    const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return formatted;
  }, []);

  const handleChange = useCallback(
    (inputValue) => {
      const formatted = formatCurrency(inputValue);
      setValue(formatted);
      return formatted;
    },
    [formatCurrency]
  );

  const getRawValue = useCallback(() => {
    // Remover puntos (miles) para obtener el valor numérico
    return value.replace(/\./g, "");
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    getRawValue,
  };
}
