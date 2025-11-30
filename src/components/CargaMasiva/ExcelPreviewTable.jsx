/**
 * Componente: ExcelPreviewTable
 * Tabla editable estilo Excel para vista previa de datos importados.
 * Permite edición inline de celdas con validación visual.
 * 
 * @author Frontend Senior Developer
 * @date 2025-11-27
 */

import { useState, useCallback, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { VEHICLE_TYPES } from "../../utils/formatters";

/**
 * Configuración de columnas por tipo de pestaña
 */
const COLUMN_CONFIGS = {
  rubros: [
    { key: "nombre", label: "Nombre", type: "text", required: true, width: "w-1/3" },
    { key: "descripcion", label: "Descripción", type: "text", required: false, width: "w-2/3" },
  ],
  vehiculos: [
    { key: "placa", label: "Placa", type: "text", required: true, width: "w-24" },
    {
      key: "tipo_vehiculo",
      label: "Tipo Vehículo",
      type: "select",
      required: true,
      width: "w-36",
      options: VEHICLE_TYPES
    },
    { key: "propietario_nombre", label: "Propietario", type: "text", required: false, width: "flex-1" },
    { key: "conductor_actual_nombre", label: "Conductor", type: "text", required: false, width: "flex-1" },
    {
      key: "estado",
      label: "Estado",
      type: "select",
      required: true,
      width: "w-28",
      options: [
        { value: "activo", label: "Activo" },
        { value: "inactivo", label: "Inactivo" },
      ]
    },
  ],
  cartera_pendiente: [
    { key: "placa_vehiculo", label: "Placa", type: "text", required: true, width: "w-24" },
    { key: "nombre_rubro", label: "Rubro", type: "text", required: true, width: "w-36" },
    { key: "periodo", label: "Periodo", type: "date", required: true, width: "w-32" },
    { key: "valor_cargado", label: "Valor Cargado", type: "number", required: true, width: "w-32" },
    { key: "saldo_pendiente", label: "Saldo Pendiente", type: "number", required: true, width: "w-32" },
    {
      key: "estado_deuda",
      label: "Estado",
      type: "select",
      required: true,
      width: "w-28",
      options: [
        { value: "pendiente", label: "Pendiente" },
        { value: "abonado", label: "Abonado" },
        { value: "pagado", label: "Pagado" },
      ]
    },
  ],
};

/**
 * Celda editable individual
 */
function EditableCell({
  value,
  onChange,
  type = "text",
  options = [],
  hasError = false,
  isNew = false,
  placeholder = ""
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState(value);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (localValue !== value) {
      onChange(localValue);
    }
  }, [localValue, value, onChange]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.target.blur();
    }
    if (e.key === "Escape") {
      setLocalValue(value);
      setIsEditing(false);
    }
  }, [value]);

  const cellClass = cn(
    "px-2 py-1 border-r border-b text-sm transition-colors",
    "focus-within:ring-2 focus-within:ring-primary focus-within:ring-inset",
    hasError && "bg-red-50 dark:bg-red-900/20",
    isNew && !hasError && "bg-green-50 dark:bg-green-900/20"
  );

  if (type === "select") {
    return (
      <td className={cellClass}>
        <Select
          value={value || ""}
          onValueChange={onChange}
        >
          <SelectTrigger className="h-7 border-0 shadow-none focus:ring-0 bg-transparent">
            <SelectValue placeholder={placeholder || "Seleccionar..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
    );
  }

  return (
    <td className={cellClass} onClick={() => setIsEditing(true)}>
      {isEditing ? (
        <Input
          type={type === "number" ? "number" : type === "date" ? "date" : "text"}
          value={localValue || ""}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="h-7 border-0 shadow-none focus:ring-0 bg-transparent px-0"
          autoFocus
          step={type === "number" ? "0.01" : undefined}
        />
      ) : (
        <span className="block min-h-[28px] leading-7 cursor-text">
          {type === "number" && value
            ? Number(value).toLocaleString("es-CO")
            : value || <span className="text-muted-foreground">{placeholder}</span>
          }
        </span>
      )}
    </td>
  );
}

/**
 * Componente principal de tabla editable
 */
export default function ExcelPreviewTable({
  type,
  data,
  onDataChange,
  errors = [],
  className = "",
}) {
  const columns = COLUMN_CONFIGS[type] || [];

  // Crear mapa de errores por fila
  const errorsByRow = useMemo(() => {
    const map = {};
    errors.forEach((err) => {
      if (err.fila) {
        if (!map[err.fila]) map[err.fila] = [];
        map[err.fila].push(err.mensaje);
      }
    });
    return map;
  }, [errors]);

  // Handler para cambios en celda
  const handleCellChange = useCallback((rowIndex, key, newValue) => {
    const newData = [...data];
    newData[rowIndex] = {
      ...newData[rowIndex],
      [key]: newValue,
    };
    onDataChange(newData);
  }, [data, onDataChange]);

  // Handler para eliminar fila
  const handleDeleteRow = useCallback((rowIndex) => {
    const newData = data.filter((_, index) => index !== rowIndex);
    onDataChange(newData);
  }, [data, onDataChange]);

  // Handler para agregar fila
  const handleAddRow = useCallback(() => {
    const newRow = { id: Date.now() };
    columns.forEach((col) => {
      newRow[col.key] = col.type === "select" && col.options?.length > 0
        ? col.options[0].value
        : "";
    });
    newRow.es_nuevo = true;
    onDataChange([...data, newRow]);
  }, [data, columns, onDataChange]);

  if (!columns.length) {
    return <div className="text-muted-foreground p-4">Tipo de tabla no reconocido: {type}</div>;
  }

  return (
    <div className={cn("flex flex-col", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 bg-muted/50 border-b">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{data.length} registros</span>
          {errors.length > 0 && (
            <span className="flex items-center gap-1 text-destructive">
              <AlertCircle className="h-4 w-4" />
              {errors.length} errores
            </span>
          )}
        </div>
        <button
          onClick={handleAddRow}
          className="text-sm text-primary hover:underline"
        >
          + Agregar fila
        </button>
      </div>

      {/* Table Container con scroll */}
      <div className="overflow-auto max-h-[400px] border rounded-b-lg">
        <table className="w-full border-collapse min-w-max">
          {/* Header fijo */}
          <thead className="sticky top-0 z-10 bg-muted">
            <tr>
              <th className="px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider border-r border-b w-8">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-2 py-2 text-left text-xs font-semibold uppercase tracking-wider border-r border-b",
                    col.width
                  )}
                >
                  {col.label}
                  {col.required && <span className="text-destructive ml-1">*</span>}
                </th>
              ))}
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b w-20">
                Estado
              </th>
              <th className="px-2 py-2 text-center text-xs font-semibold uppercase tracking-wider border-b w-12">

              </th>
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.map((row, rowIndex) => {
              const rowErrors = errorsByRow[rowIndex + 2] || []; // +2 porque Excel empieza en 1 y tiene header
              const hasRowError = row.tiene_errores || rowErrors.length > 0;
              const isNew = row.es_nuevo;

              return (
                <tr
                  key={row.id || rowIndex}
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    hasRowError && "bg-red-50/50 dark:bg-red-900/10"
                  )}
                  title={rowErrors.length > 0 ? rowErrors.join("\n") : undefined}
                >
                  {/* Número de fila */}
                  <td className="px-2 py-1 text-xs text-muted-foreground border-r border-b text-center">
                    {rowIndex + 1}
                  </td>

                  {/* Celdas editables */}
                  {columns.map((col) => (
                    <EditableCell
                      key={col.key}
                      value={row[col.key]}
                      onChange={(newValue) => handleCellChange(rowIndex, col.key, newValue)}
                      type={col.type}
                      options={col.options}
                      hasError={hasRowError}
                      isNew={isNew}
                      placeholder={col.label}
                    />
                  ))}

                  {/* Estado visual */}
                  <td className="px-2 py-1 text-center border-r border-b">
                    {hasRowError ? (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Error
                      </Badge>
                    ) : isNew ? (
                      <Badge variant="default" className="text-xs bg-green-600">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Nuevo
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Existe
                      </Badge>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="px-2 py-1 text-center border-b">
                    <button
                      onClick={() => handleDeleteRow(rowIndex)}
                      className="text-destructive hover:text-destructive/80 text-xs"
                      title="Eliminar fila"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No hay datos para mostrar. Haga clic en "Agregar fila" para comenzar.
          </div>
        )}
      </div>
    </div>
  );
}
