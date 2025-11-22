import { useState, useCallback } from "react";

/**
 * Hook para formatear entrada de moneda en tiempo real
 * Convierte: 1000000 -> 1.000.000,00
 */
export function useCurrencyInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const formatCurrency = useCallback((inputValue) => {
    if (!inputValue && inputValue !== "0") return "";

    // Remover todos los caracteres excepto números
    let numericValue = inputValue.replace(/[^\d]/g, "");

    if (!numericValue) return "";

    // Si tiene menos de 3 dígitos, devolver como está (sin formato)
    if (numericValue.length <= 2) {
      return numericValue;
    }

    // Separar parte entera y decimal
    // Los últimos 2 dígitos son decimales
    const integerPart = numericValue.slice(0, -2);
    const decimalPart = numericValue.slice(-2);

    // Formatear parte entera con puntos cada 3 dígitos
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    // Combinar
    return `${formattedInteger},${decimalPart}`;
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
    // Remover puntos (miles) y reemplazar coma por punto
    return value.replace(/\./g, "").replace(",", ".");
  }, [value]);

  return {
    value,
    setValue,
    handleChange,
    getRawValue,
  };
}
