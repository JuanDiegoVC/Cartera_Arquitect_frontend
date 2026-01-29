import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Car, X } from "lucide-react";
import { vehiculosService } from "@/services/vehiculosService";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

/**
 * Componente de autocompletado para búsqueda de placas de vehículos.
 *
 * Características:
 * - Búsqueda en tiempo real mientras el usuario escribe
 * - Debounce para evitar llamadas excesivas al servidor
 * - Dropdown con resultados que muestra placa, propietario y tipo
 * - Navegación con teclado (flechas arriba/abajo, Enter, Escape)
 * - Responsive y accesible
 *
 * @param {Object} props
 * @param {string} props.value - Valor actual del input
 * @param {function} props.onChange - Callback cuando cambia el valor del input
 * @param {function} props.onSelect - Callback cuando se selecciona una placa
 * @param {string} props.placeholder - Placeholder del input
 * @param {boolean} props.disabled - Si el input está deshabilitado
 * @param {string} props.className - Clases adicionales para el contenedor
 * @param {boolean} props.autoFocus - Si el input debe enfocarse automáticamente
 */
export default function PlacaAutocomplete({
  value = "",
  onChange,
  onSelect,
  placeholder = "Ingrese placa del vehículo (ej: ABC123)",
  disabled = false,
  className = "",
  autoFocus = false,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Debounce del valor de búsqueda (300ms)
  const debouncedValue = useDebounce(inputValue, 300);

  // Sincronizar valor externo
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Buscar sugerencias cuando cambia el valor debounced
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedValue.length < 2) {
        setSuggestions([]);
        setIsOpen(false);
        setHasSearched(false);
        return;
      }

      setIsLoading(true);
      setHasSearched(true);

      try {
        const response = await vehiculosService.buscarPlacas(
          debouncedValue,
          10
        );
        setSuggestions(response.resultados || []);
        setIsOpen(true);
        setHighlightedIndex(-1);
      } catch (error) {
        console.error("Error buscando placas:", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSuggestions();
  }, [debouncedValue]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Manejar cambio en el input
  const handleInputChange = (e) => {
    const newValue = e.target.value.toUpperCase();
    setInputValue(newValue);
    onChange?.(newValue);
  };

  // Manejar selección de una sugerencia
  const handleSelectSuggestion = useCallback(
    (suggestion) => {
      setInputValue(suggestion.placa);
      onChange?.(suggestion.placa);
      onSelect?.(suggestion);
      setIsOpen(false);
      setSuggestions([]);
      setHasSearched(false);
    },
    [onChange, onSelect]
  );

  // Limpiar el input
  const handleClear = () => {
    setInputValue("");
    onChange?.("");
    setSuggestions([]);
    setIsOpen(false);
    setHasSearched(false);
    inputRef.current?.focus();
  };

  // Manejar navegación con teclado
  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Enter") {
        e.preventDefault();
        // Permitir que el formulario padre maneje el Enter
        return;
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && suggestions[highlightedIndex]) {
          handleSelectSuggestion(suggestions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  // Scroll al elemento resaltado
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[highlightedIndex];
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex]);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Input de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10 text-lg font-semibold"
          autoComplete="off"
          autoFocus={autoFocus}
        />

        {/* Indicador de carga o botón limpiar */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : inputValue.length > 0 ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 hover:bg-muted rounded-full transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : null}
        </div>
      </div>

      {/* Dropdown de sugerencias */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-md shadow-lg max-h-[300px] overflow-y-auto">
          <ul ref={listRef} className="py-1">
            {suggestions.length > 0 ? (
              suggestions.map((suggestion, index) => (
                <li
                  key={suggestion.placa}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={cn(
                    "px-3 py-2 cursor-pointer transition-colors",
                    "hover:bg-primary/10",
                    highlightedIndex === index && "bg-primary/10"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 p-2 bg-primary/10 rounded-full">
                      <Car className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-primary">
                          {suggestion.placa}
                        </span>
                        {suggestion.num_interno && (
                          <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900 rounded-full text-blue-700 dark:text-blue-300 font-mono">
                            #{suggestion.num_interno}
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                          {suggestion.tipo_vehiculo_display}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {suggestion.propietario_nombre}
                      </p>
                    </div>
                  </div>
                </li>
              ))
            ) : hasSearched && !isLoading ? (
              <li className="px-3 py-4 text-center text-muted-foreground">
                <Car className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron vehículos con "{inputValue}"</p>
                <p className="text-xs mt-1">
                  Verifique la placa e intente nuevamente
                </p>
              </li>
            ) : null}
          </ul>

          {/* Footer con instrucciones */}
          {suggestions.length > 0 && (
            <div className="border-t border-border px-3 py-2 bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px]">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] ml-1">
                  ↓
                </kbd>
                <span className="ml-2">para navegar</span>
                <kbd className="px-1.5 py-0.5 bg-background border rounded text-[10px] ml-3">
                  Enter
                </kbd>
                <span className="ml-2">para seleccionar</span>
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
