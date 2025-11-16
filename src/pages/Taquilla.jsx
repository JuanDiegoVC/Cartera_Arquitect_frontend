import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from "../components/ui/badge";
import { Checkbox } from "../components/ui/checkbox";
import {
  Search,
  Car,
  InfoIcon,
  DollarSign,
  Calendar,
  Loader2,
  CheckCircle2,
  Filter,
} from "lucide-react";
import { Separator } from "../components/ui/separator";
import { vehiculosService } from "../services/vehiculosService";
import { pagosService } from "../services/pagosService";

export default function Taquilla() {
  const [searchParams] = useSearchParams();
  const [plate, setPlate] = useState("");
  const [searchedVehicle, setSearchedVehicle] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);

  // Estado para el formulario de pago
  const [medioPago, setMedioPago] = useState("efectivo");
  const [observacion, setObservacion] = useState("");

  // Estados para el filtro de fecha
  const [filterMonth, setFilterMonth] = useState("");
  const [filterYear, setFilterYear] = useState("");

  // Estado para controlar el modo de pago de cada deuda
  // { deudaId: { mode: 'saldo' | 'personalizado' | 'completo', customAmount: number } }
  const [paymentModes, setPaymentModes] = useState({});

  // Buscar automáticamente si viene placa en la URL
  useEffect(() => {
    const placaParam = searchParams.get("placa");
    if (placaParam && placaParam.length >= 3) {
      setPlate(placaParam.toUpperCase());
      // Simular envío del formulario
      searchVehicleByPlate(placaParam.toUpperCase());
    }
  }, [searchParams]);

  /**
   * Determina el estado real de una deuda basado en su periodo y saldo
   * Si el backend envía estado_vencimiento, se usa ese valor
   * @param {Object} deuda - Deuda a evaluar
   * @returns {string} - "paid", "pending", "overdue" o "scheduled"
   */
  const calculateDeudaStatus = (deuda) => {
    // Si el backend ya calculó el estado, usarlo (mapear nombres)
    if (deuda.estado_vencimiento) {
      const statusMap = {
        pagado: "paid",
        pendiente: "pending",
        vencido: "overdue",
        programado: "scheduled",
      };
      return statusMap[deuda.estado_vencimiento] || "pending";
    }

    // Fallback: calcular en el frontend si no viene del backend
    if (deuda.saldo_pendiente === 0) {
      return "paid";
    }

    // Obtener la fecha actual (primer día del mes actual)
    const today = new Date();
    const currentPeriod = new Date(today.getFullYear(), today.getMonth(), 1);

    // Parsear el periodo de la deuda (formato YYYY-MM-DD)
    const deudaPeriod = new Date(deuda.periodo + "T00:00:00");

    // Si el periodo de la deuda es anterior al mes actual, está vencido
    if (deudaPeriod < currentPeriod) {
      return "overdue";
    } else if (deudaPeriod.getTime() === currentPeriod.getTime()) {
      // Si es el mes actual, está pendiente
      return "pending";
    } else {
      // Si es un mes futuro, está programado
      return "scheduled";
    }
  };

  /**
   * Filtra las deudas según el mes y año seleccionados
   */
  const filteredItems = useMemo(() => {
    if (!searchedVehicle?.items) return [];

    let items = searchedVehicle.items;

    // Aplicar filtro de mes/año si están definidos
    if (filterMonth || filterYear) {
      items = items.filter((item) => {
        const itemDate = new Date(item.periodo + "T00:00:00");
        const itemMonth = itemDate.getMonth() + 1; // getMonth() retorna 0-11
        const itemYear = itemDate.getFullYear();

        const monthMatch = !filterMonth || itemMonth === parseInt(filterMonth);
        const yearMatch = !filterYear || itemYear === parseInt(filterYear);

        return monthMatch && yearMatch;
      });
    }

    return items;
  }, [searchedVehicle?.items, filterMonth, filterYear]);

  /**
   * Limpia los filtros de fecha
   */
  const clearFilters = () => {
    setFilterMonth("");
    setFilterYear("");
  };

  /**
   * Selecciona todos los rubros pendientes filtrados
   */
  const handleSelectAll = () => {
    const allPendingIds = pendingItems.map((item) => item.id);
    setSelectedItems(allPendingIds);
    
    // Inicializar modo de pago para cada item seleccionado
    const newPaymentModes = {};
    allPendingIds.forEach((id) => {
      newPaymentModes[id] = { mode: "saldo", customAmount: "" };
    });
    setPaymentModes(newPaymentModes);
  };

  /**
   * Deselecciona todos los rubros
   */
  const handleDeselectAll = () => {
    setSelectedItems([]);
    setPaymentModes({});
  };

  /**
   * Función auxiliar para buscar vehículo por placa
   */
  const searchVehicleByPlate = async (plateToSearch) => {
    if (plateToSearch.trim().length < 3) {
      setError("Ingrese al menos 3 caracteres de la placa");
      return;
    }

    setLoading(true);
    setError(null);
    setSearchedVehicle(null);
    setSelectedItems([]);

    try {
      const data = await vehiculosService.getEstadoCuenta(plateToSearch.toUpperCase());

      // Transformar los datos del backend al formato que usa el componente
      const transformedData = {
        plate: data.placa,
        owner: data.propietario_nombre,
        vehicleType: data.tipo_vehiculo,
        items: data.deudas_pendientes.map((deuda) => {
          const deudaObj = {
            id: deuda.deuda_id.toString(),
            concept: deuda.rubro.nombre,
            month: new Date(deuda.periodo + "T00:00:00").toLocaleDateString(
              "es-CO",
              {
                year: "numeric",
                month: "long",
              }
            ),
            amount: parseFloat(deuda.valor_cargado),
            saldoPendiente: parseFloat(deuda.saldo_pendiente),
            periodo: deuda.periodo,
            estado_vencimiento: deuda.estado_vencimiento, // Pasar el estado del backend
          };

          // Calcular el estado correcto basado en fecha y saldo
          deudaObj.status = calculateDeudaStatus(deudaObj);

          return deudaObj;
        }),
      };

      setSearchedVehicle(transformedData);
    } catch (err) {
      console.error("Error buscando vehículo:", err);
      if (err.response?.status === 404) {
        setError(`No se encontró el vehículo con placa "${plateToSearch}"`);
      } else {
        setError("Error al buscar el vehículo. Por favor intente nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    await searchVehicleByPlate(plate);
  };

  const handleToggleItem = (itemId) => {
    setSelectedItems((prev) => {
      const newSelected = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // Si se deselecciona, limpiar su modo de pago
      if (!newSelected.includes(itemId)) {
        setPaymentModes((prevModes) => {
          const newModes = { ...prevModes };
          delete newModes[itemId];
          return newModes;
        });
      } else if (!paymentModes[itemId]) {
        // Si se selecciona por primera vez, establecer modo por defecto
        // Siempre usar "saldo" como predeterminado
        setPaymentModes((prevModes) => ({
          ...prevModes,
          [itemId]: { mode: "saldo", customAmount: "" },
        }));
      }

      return newSelected;
    });
  };

  const handlePaymentModeChange = (itemId, mode) => {
    setPaymentModes((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], mode, customAmount: "" },
    }));
  };

  const handleCustomAmountChange = (itemId, value) => {
    setPaymentModes((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], customAmount: value },
    }));
  };

  const getAmountToPay = (item) => {
    const mode = paymentModes[item.id];
    if (!mode) return item.saldoPendiente;

    switch (mode.mode) {
      case "saldo":
        return item.saldoPendiente;
      case "personalizado":
        return parseFloat(mode.customAmount) || 0;
      default:
        return item.saldoPendiente;
    }
  };

  const handlePayment = async () => {
    if (selectedItems.length === 0) {
      setError("Por favor seleccione al menos un rubro para pagar");
      return;
    }

    // Validar montos personalizados
    const deudasSeleccionadas = searchedVehicle.items.filter((item) =>
      selectedItems.includes(item.id)
    );

    for (const item of deudasSeleccionadas) {
      const amountToPay = getAmountToPay(item);
      if (amountToPay <= 0) {
        setError(`El monto para ${item.concept} debe ser mayor a $0`);
        return;
      }
      if (amountToPay > item.saldoPendiente) {
        setError(
          `El monto para ${
            item.concept
          } no puede ser mayor al saldo pendiente ($${item.saldoPendiente.toLocaleString(
            "es-CO"
          )})`
        );
        return;
      }
    }

    setProcessingPayment(true);
    setError(null);
    setPaymentSuccess(null);

    try {
      const montoTotal = deudasSeleccionadas.reduce(
        (sum, item) => sum + getAmountToPay(item),
        0
      );

      const payload = {
        medio_pago: medioPago,
        monto_total_recibido: montoTotal.toFixed(2),
        observacion: observacion || "",
        deudas_a_pagar: deudasSeleccionadas.map((item) => ({
          deuda_id: parseInt(item.id),
          monto_abonado: getAmountToPay(item).toFixed(2),
        })),
      };

      // Llamar al servicio de pagos
      const response = await pagosService.registrarPago(payload);

      // Mostrar mensaje de éxito
      setPaymentSuccess({
        mensaje: response.mensaje,
        ingresoId: response.ingreso.ingreso_id,
        montoTotal: montoTotal,
        rubros: selectedItems.length,
      });

      // Limpiar selección y formulario
      setSelectedItems([]);
      setPaymentModes({});
      setObservacion("");

      // Recargar el estado de cuenta del vehículo
      const updatedData = await vehiculosService.getEstadoCuenta(
        searchedVehicle.plate
      );

      const transformedData = {
        plate: updatedData.placa,
        owner: updatedData.propietario_nombre,
        vehicleType: updatedData.tipo_vehiculo,
        items: updatedData.deudas_pendientes.map((deuda) => {
          const deudaObj = {
            id: deuda.deuda_id.toString(),
            concept: deuda.rubro.nombre,
            month: new Date(deuda.periodo + "T00:00:00").toLocaleDateString(
              "es-CO",
              {
                year: "numeric",
                month: "long",
              }
            ),
            amount: parseFloat(deuda.valor_cargado),
            saldoPendiente: parseFloat(deuda.saldo_pendiente),
            periodo: deuda.periodo,
            estado_vencimiento: deuda.estado_vencimiento, // Pasar el estado del backend
          };

          // Calcular el estado correcto basado en fecha y saldo
          deudaObj.status = calculateDeudaStatus(deudaObj);

          return deudaObj;
        }),
      };

      setSearchedVehicle(transformedData);
    } catch (err) {
      console.error("Error procesando pago:", err);
      setError(
        err.detalle ||
          err.error ||
          "Error al procesar el pago. Por favor intente nuevamente."
      );
    } finally {
      setProcessingPayment(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      paid: {
        variant: "default",
        label: "Pagado",
        className: "bg-success text-success-foreground",
      },
      pending: {
        variant: "secondary",
        label: "Pendiente",
        className: "bg-warning text-warning-foreground",
      },
      overdue: {
        variant: "destructive",
        label: "Vencido",
        className: "bg-danger text-danger-foreground",
      },
      scheduled: {
        variant: "outline",
        label: "Programado",
        className:
          "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
      },
    };
    const config = variants[status] || variants.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const pendingItems =
    filteredItems.filter((item) => item.status !== "paid") || [];
  const totalSelected =
    filteredItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + getAmountToPay(item), 0) || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Taquilla</h1>
        <p className="text-muted-foreground">
          Procese pagos de forma rápida y eficiente
        </p>
      </div>

      {/* Vehicle Search Card */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Buscar Vehículo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ingrese placa del vehículo (ej: ABC123)"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value.toUpperCase())}
                  className="pl-10 text-lg font-semibold"
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="px-8"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  "Buscar"
                )}
              </Button>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {paymentSuccess && (
              <Alert className="bg-success/10 border-success/20">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertDescription className="text-success">
                  <strong>¡Pago registrado exitosamente!</strong>
                  <br />
                  Recibo #{paymentSuccess.ingresoId} - $
                  {paymentSuccess.montoTotal.toLocaleString("es-CO")} (
                  {paymentSuccess.rubros} rubros)
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {searchedVehicle && (
        <>
          {/* Filtro por Fecha */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="h-5 w-5 text-primary" />
                Filtrar Rubros por Periodo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Mes:</label>
                  <select
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">Todos los meses</option>
                    <option value="1">Enero</option>
                    <option value="2">Febrero</option>
                    <option value="3">Marzo</option>
                    <option value="4">Abril</option>
                    <option value="5">Mayo</option>
                    <option value="6">Junio</option>
                    <option value="7">Julio</option>
                    <option value="8">Agosto</option>
                    <option value="9">Septiembre</option>
                    <option value="10">Octubre</option>
                    <option value="11">Noviembre</option>
                    <option value="12">Diciembre</option>
                  </select>
                </div>

                <div className="flex-1 min-w-[150px]">
                  <label className="text-sm font-medium mb-2 block">Año:</label>
                  <select
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                    className="w-full p-2 border rounded-md bg-background"
                  >
                    <option value="">Todos los años</option>
                    {Array.from({ length: 10 }, (_, i) => {
                      const year = new Date().getFullYear() - i;
                      return (
                        <option key={year} value={year}>
                          {year}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {(filterMonth || filterYear) && (
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="mb-0"
                  >
                    Limpiar Filtros
                  </Button>
                )}

                <div className="ml-auto text-sm text-muted-foreground">
                  Mostrando <strong>{filteredItems.length}</strong> de{" "}
                  <strong>{searchedVehicle.items.length}</strong> rubros
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Account Status Card */}
            <Card className="shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg">Estado de Cuenta</CardTitle>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <Car className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-xl font-bold">
                      {searchedVehicle.plate}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Propietario: {searchedVehicle.owner}
                  </p>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {filteredItems.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No hay rubros para el periodo seleccionado</p>
                    </div>
                  ) : (
                    filteredItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium">{item.concept}</span>
                            {getStatusBadge(item.status)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>{item.month}</span>
                          </div>
                        </div>
                        <span className="text-lg font-bold ml-4">
                          ${item.amount.toLocaleString("es-CO")}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card className="shadow-md">
              <CardHeader className="bg-primary/5">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Procesar Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">
                        Seleccione rubros a pagar:
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleSelectAll}
                          variant="outline"
                          size="sm"
                          disabled={processingPayment || pendingItems.length === 0}
                          className="text-xs"
                        >
                          ✓ Seleccionar Todos ({pendingItems.length})
                        </Button>
                        {selectedItems.length > 0 && (
                          <Button
                            onClick={handleDeselectAll}
                            variant="outline"
                            size="sm"
                            disabled={processingPayment}
                            className="text-xs"
                          >
                            ✗ Deseleccionar Todos
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      {pendingItems.map((item) => (
                        <div
                          key={item.id}
                          className={`p-4 rounded-lg border-2 transition-all ${
                            selectedItems.includes(item.id)
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:border-muted-foreground/30"
                          }`}
                        >
                          {/* Header con checkbox */}
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id={item.id}
                              checked={selectedItems.includes(item.id)}
                              onCheckedChange={() => handleToggleItem(item.id)}
                              disabled={processingPayment}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <label
                                htmlFor={item.id}
                                className="cursor-pointer block"
                              >
                                <div className="flex items-start justify-between">
                                  <div>
                                    <div className="font-medium text-base">
                                      {item.concept}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {item.month}
                                    </div>
                                    {item.status === "pending" && (
                                      <div className="text-xs text-warning mt-1">
                                        💰 Valor original: $
                                        {item.amount.toLocaleString("es-CO")} |
                                        Abonado: $
                                        {(
                                          item.amount - item.saldoPendiente
                                        ).toLocaleString("es-CO")}
                                      </div>
                                    )}
                                  </div>
                                  <div className="text-right">
                                    <div className="font-bold text-lg">
                                      $
                                      {item.saldoPendiente.toLocaleString(
                                        "es-CO"
                                      )}
                                    </div>
                                    {item.status === "pending" && (
                                      <div className="text-xs text-muted-foreground line-through">
                                        ${item.amount.toLocaleString("es-CO")}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </label>

                              {/* Opciones de pago (solo si está seleccionado) */}
                              {selectedItems.includes(item.id) && (
                                <div className="mt-3 space-y-2 pl-0">
                                  <div className="text-sm font-medium text-muted-foreground mb-2">
                                    💳 Modo de pago:
                                  </div>

                                  {/* Opción: Pagar saldo completo */}
                                  <label className="flex items-center gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`payment-mode-${item.id}`}
                                      value="saldo"
                                      checked={
                                        paymentModes[item.id]?.mode === "saldo"
                                      }
                                      onChange={() =>
                                        handlePaymentModeChange(
                                          item.id,
                                          "saldo"
                                        )
                                      }
                                      disabled={processingPayment}
                                      className="w-4 h-4"
                                    />
                                    <span className="text-sm flex-1">
                                      🔵 Pagar saldo completo:{" "}
                                      <strong>
                                        $
                                        {item.saldoPendiente.toLocaleString(
                                          "es-CO"
                                        )}
                                      </strong>
                                    </span>
                                  </label>

                                  {/* Opción: Monto personalizado */}
                                  <label className="flex items-start gap-2 p-2 rounded hover:bg-muted/50 cursor-pointer">
                                    <input
                                      type="radio"
                                      name={`payment-mode-${item.id}`}
                                      value="personalizado"
                                      checked={
                                        paymentModes[item.id]?.mode ===
                                        "personalizado"
                                      }
                                      onChange={() =>
                                        handlePaymentModeChange(
                                          item.id,
                                          "personalizado"
                                        )
                                      }
                                      disabled={processingPayment}
                                      className="w-4 h-4 mt-1"
                                    />
                                    <div className="flex-1">
                                      <span className="text-sm block mb-1">
                                        🟡 Pagar monto personalizado
                                      </span>
                                      {paymentModes[item.id]?.mode ===
                                        "personalizado" && (
                                        <Input
                                          type="number"
                                          placeholder="Ingrese monto"
                                          value={
                                            paymentModes[item.id]
                                              ?.customAmount || ""
                                          }
                                          onChange={(e) =>
                                            handleCustomAmountChange(
                                              item.id,
                                              e.target.value
                                            )
                                          }
                                          disabled={processingPayment}
                                          className="mt-1"
                                          min="1"
                                          max={item.saldoPendiente}
                                        />
                                      )}
                                    </div>
                                  </label>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Formulario de pago */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Medio de pago:
                      </label>
                      <select
                        value={medioPago}
                        onChange={(e) => setMedioPago(e.target.value)}
                        className="w-full p-2 border rounded-md bg-background"
                        disabled={processingPayment}
                      >
                        <option value="efectivo">Efectivo</option>
                        <option value="transferencia">Transferencia</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Observaciones (opcional):
                      </label>
                      <Input
                        type="text"
                        placeholder="Ej: Pago parcial del mes"
                        value={observacion}
                        onChange={(e) => setObservacion(e.target.value)}
                        disabled={processingPayment}
                        maxLength={500}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Rubros seleccionados:
                      </span>
                      <span className="font-medium">
                        {selectedItems.length}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">
                        ${totalSelected.toLocaleString("es-CO")}
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={handlePayment}
                    className="w-full"
                    size="lg"
                    disabled={selectedItems.length === 0 || processingPayment}
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Procesar Pago"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-primary/5 border-primary/20">
            <InfoIcon className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              <strong>Pago Múltiple:</strong> Puede seleccionar varios rubros
              simultáneamente para consolidarlos en un único recibo.
            </AlertDescription>
          </Alert>
        </>
      )}

      {!searchedVehicle && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
            <InfoIcon className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Busque un vehículo para comenzar
          </h3>
          <p className="text-muted-foreground">
            Ingrese la placa del vehículo en el campo de búsqueda superior
          </p>
        </div>
      )}
    </div>
  );
}
