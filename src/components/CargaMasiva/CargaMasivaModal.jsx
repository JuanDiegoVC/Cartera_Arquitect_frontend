/**
 * Componente: CargaMasivaModal
 * Modal principal para carga masiva de datos desde Excel.
 * Permite subir archivo, ver preview editable y confirmar la carga.
 * 
 * @author Frontend Senior Developer
 * @date 2025-11-27
 * 
 * Flujo:
 * 1. Usuario hace clic en "Carga Masiva" en Configuración
 * 2. Se abre el modal con zona de drag & drop
 * 3. Usuario sube archivo Excel
 * 4. Se muestra preview con 3 tabs (Rubros, Vehículos, Cartera)
 * 5. Usuario puede editar datos inline
 * 6. Usuario confirma y se ejecuta la carga
 */

import { useState, useCallback, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  X,
  FileWarning,
  Database,
  Car,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import ExcelPreviewTable from "./ExcelPreviewTable";
import { cargaMasivaService } from "@/services/cargaMasivaService";

/**
 * Estados del modal
 */
const STEPS = {
  UPLOAD: "upload",      // Subir archivo
  PREVIEW: "preview",    // Vista previa con edición
  LOADING: "loading",    // Procesando
  SUCCESS: "success",    // Carga exitosa
  ERROR: "error",        // Error en la carga
};

/**
 * Tabs de datos
 */
const TABS = [
  { id: "rubros", label: "Rubros", icon: Database, description: "Conceptos de cobro" },
  { id: "vehiculos", label: "Vehículos", icon: Car, description: "Flota de vehículos" },
  { id: "cartera_pendiente", label: "Cartera Pendiente", icon: Receipt, description: "Deudas históricas" },
];

export default function CargaMasivaModal({ open, onOpenChange }) {
  // Estados del modal
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [activeTab, setActiveTab] = useState("rubros");
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef(null);

  // Datos
  const [fileName, setFileName] = useState("");
  const [previewData, setPreviewData] = useState({
    rubros: [],
    vehiculos: [],
    cartera_pendiente: [],
  });
  const [resumen, setResumen] = useState({});
  const [validacion, setValidacion] = useState({ errores: [], advertencias: [] });
  const [resultado, setResultado] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Loading states
  const [isUploading, setIsUploading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);

  /**
   * Reset del modal al cerrar
   */
  const handleClose = useCallback(() => {
    setStep(STEPS.UPLOAD);
    setActiveTab("rubros");
    setPreviewData({ rubros: [], vehiculos: [], cartera_pendiente: [] });
    setResumen({});
    setValidacion({ errores: [], advertencias: [] });
    setResultado(null);
    setErrorMessage("");
    setFileName("");
    setUploadProgress(0);
    onOpenChange(false);
  }, [onOpenChange]);

  /**
   * Procesar archivo Excel
   */
  const processFile = useCallback(async (file) => {
    if (!file) return;

    // Validar extensión
    const validExtensions = [".xlsx", ".xls"];
    const ext = file.name.toLowerCase().slice(file.name.lastIndexOf("."));
    if (!validExtensions.includes(ext)) {
      toast.error("Formato inválido", {
        description: "Solo se aceptan archivos Excel (.xlsx, .xls)",
      });
      return;
    }

    // Validar tamaño (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Archivo muy grande", {
        description: "El archivo no debe exceder 10MB",
      });
      return;
    }

    setFileName(file.name);
    setIsUploading(true);
    setStep(STEPS.LOADING);
    setUploadProgress(0);

    // Simular progreso de carga
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 100);

    try {
      const response = await cargaMasivaService.uploadPreview(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setPreviewData(response.data);
        setResumen(response.resumen);
        setValidacion(response.validacion);
        setStep(STEPS.PREVIEW);
        
        // Mostrar advertencias si las hay
        if (response.validacion.advertencias.length > 0) {
          toast.warning("Archivo procesado con advertencias", {
            description: `${response.validacion.advertencias.length} advertencias encontradas`,
          });
        } else {
          toast.success("Archivo procesado correctamente");
        }
      } else {
        throw new Error(response.error || "Error al procesar el archivo");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error uploading file:", error);
      setErrorMessage(
        error.response?.data?.detalle || 
        error.response?.data?.error || 
        error.message || 
        "Error al procesar el archivo"
      );
      setStep(STEPS.ERROR);
      toast.error("Error al procesar", {
        description: "Verifique el formato del archivo",
      });
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Handlers de drag & drop
   */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleFileSelect = useCallback((e) => {
    const files = e.target.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  /**
   * Actualizar datos de una pestaña
   */
  const handleDataChange = useCallback((tabId, newData) => {
    setPreviewData((prev) => ({
      ...prev,
      [tabId]: newData,
    }));
  }, []);

  /**
   * Confirmar carga masiva
   */
  const handleConfirm = useCallback(async () => {
    // Validar que no hay errores críticos
    const erroresCriticos = validacion.errores.filter(
      (e) => e.tipo !== "existente"
    );
    if (erroresCriticos.length > 0) {
      toast.error("Corrija los errores antes de continuar", {
        description: `Hay ${erroresCriticos.length} errores que deben ser corregidos`,
      });
      return;
    }

    setIsConfirming(true);
    setStep(STEPS.LOADING);
    setUploadProgress(0);

    // Simular progreso
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 5, 90));
    }, 200);

    try {
      const response = await cargaMasivaService.confirmLoad(previewData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.success) {
        setResultado(response.resultado);
        setStep(STEPS.SUCCESS);
        toast.success("¡Carga masiva completada!", {
          description: response.mensaje,
        });
      } else {
        throw new Error(response.error || "Error en la carga");
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error("Error confirming load:", error);
      setErrorMessage(
        error.response?.data?.detalle || 
        error.response?.data?.error || 
        error.message || 
        "Error al ejecutar la carga"
      );
      setStep(STEPS.ERROR);
      toast.error("Error en la carga masiva");
    } finally {
      setIsConfirming(false);
    }
  }, [previewData, validacion]);

  /**
   * Revalidar datos editados sin recargar el archivo
   */
  const handleRevalidate = useCallback(async () => {
    setIsRevalidating(true);

    try {
      const response = await cargaMasivaService.revalidate(previewData);

      if (response.success) {
        // Actualizar datos con los flags actualizados
        setPreviewData(response.data);
        setResumen(response.resumen);
        setValidacion(response.validacion);

        if (response.validacion.errores.length === 0) {
          toast.success("¡Validación exitosa!", {
            description: "Los datos están listos para importar",
          });
        } else if (response.validacion.errores.length < validacion.errores.length) {
          toast.info("Algunos errores corregidos", {
            description: `Quedan ${response.validacion.errores.length} errores por corregir`,
          });
        } else {
          toast.warning("Errores encontrados", {
            description: `${response.validacion.errores.length} errores detectados`,
          });
        }
      } else {
        throw new Error(response.error || "Error al revalidar");
      }
    } catch (error) {
      console.error("Error revalidating:", error);
      toast.error("Error al revalidar", {
        description: error.response?.data?.detalle || error.message || "Error desconocido",
      });
    } finally {
      setIsRevalidating(false);
    }
  }, [previewData, validacion.errores.length]);

  /**
   * Obtener errores filtrados por tab actual
   */
  const getCurrentTabErrors = useCallback(() => {
    const tabMap = {
      rubros: "Rubros",
      vehiculos: "Vehiculos",
      cartera_pendiente: "Cartera_Pendiente",
    };
    const pestana = tabMap[activeTab];
    return validacion.errores.filter((e) => e.pestana === pestana);
  }, [activeTab, validacion.errores]);

  /**
   * Obtener advertencias filtradas por tab actual
   */
  const getCurrentTabWarnings = useCallback(() => {
    const tabMap = {
      rubros: "Rubros",
      vehiculos: "Vehiculos",
      cartera_pendiente: "Cartera_Pendiente",
    };
    const pestana = tabMap[activeTab];
    return validacion.advertencias.filter((e) => e.pestana === pestana);
  }, [activeTab, validacion.advertencias]);

  /**
   * Renderizar paso de subida
   */
  const renderUploadStep = () => (
    <div className="space-y-6">
      {/* Zona de Drag & Drop */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer",
          isDragOver 
            ? "border-primary bg-primary/5 scale-[1.02]" 
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "p-4 rounded-full transition-colors",
            isDragOver ? "bg-primary/10" : "bg-muted"
          )}>
            <Upload className={cn(
              "h-10 w-10 transition-colors",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
          </div>
          
          <div>
            <p className="text-lg font-medium">
              {isDragOver 
                ? "Suelta el archivo aquí" 
                : "Arrastra tu archivo Excel aquí"
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              o haz clic para seleccionar un archivo
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileSpreadsheet className="h-4 w-4" />
            <span>Formatos aceptados: .xlsx, .xls (máx. 10MB)</span>
          </div>
        </div>
      </div>

      {/* Información de formato requerido */}
      <Alert>
        <FileWarning className="h-4 w-4" />
        <AlertTitle>Formato requerido</AlertTitle>
        <AlertDescription className="text-sm">
          El archivo Excel debe contener tres pestañas:
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Rubros:</strong> nombre, descripcion</li>
            <li>
              <strong>Vehiculos:</strong> placa, tipo_vehiculo, propietario_nombre, conductor_actual_nombre, estado
              <br />
              <span className="text-xs text-muted-foreground ml-4">
                Tipos válidos: automovil, bus, buseta, camioneta, campero, escalera, micro, microbus 
                (con variantes _municipal o _intermunicipal)
              </span>
            </li>
            <li><strong>Cartera_Pendiente:</strong> placa_vehiculo, nombre_rubro, periodo, valor_cargado, saldo_pendiente, estado_deuda</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );

  /**
   * Renderizar paso de preview
   */
  const renderPreviewStep = () => {
    const currentErrors = getCurrentTabErrors();
    const currentWarnings = getCurrentTabWarnings();

    return (
      <div className="space-y-4">
        {/* Resumen */}
        <div className="grid grid-cols-3 gap-4">
          {TABS.map((tab) => {
            const count = previewData[tab.id]?.length || 0;
            const isActive = activeTab === tab.id;
            const tabErrors = validacion.errores.filter(
              (e) => e.pestana === (tab.id === "cartera_pendiente" ? "Cartera_Pendiente" : tab.id.charAt(0).toUpperCase() + tab.id.slice(1))
            );
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "p-4 rounded-lg border-2 transition-all text-left",
                  isActive 
                    ? "border-primary bg-primary/5" 
                    : "border-muted hover:border-primary/50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <tab.icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )} />
                  <span className="font-medium">{tab.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{count}</span>
                  <span className="text-xs text-muted-foreground">registros</span>
                  {tabErrors.length > 0 && (
                    <Badge variant="destructive" className="text-xs ml-auto">
                      {tabErrors.length}
                    </Badge>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <Separator />

        {/* Alertas de errores/advertencias del tab actual */}
        {currentErrors.length > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Errores encontrados ({currentErrors.length})</AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 max-h-24 overflow-auto text-sm">
                {currentErrors.slice(0, 5).map((err, idx) => (
                  <li key={idx}>{err.mensaje}</li>
                ))}
                {currentErrors.length > 5 && (
                  <li className="text-muted-foreground">
                    ...y {currentErrors.length - 5} errores más
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {currentWarnings.length > 0 && (
          <Alert variant="warning" className="border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 dark:text-yellow-200">
              Advertencias ({currentWarnings.length})
            </AlertTitle>
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <ul className="list-disc list-inside mt-2 max-h-20 overflow-auto text-sm">
                {currentWarnings.slice(0, 3).map((warn, idx) => (
                  <li key={idx}>{warn.mensaje}</li>
                ))}
                {currentWarnings.length > 3 && (
                  <li className="text-muted-foreground">
                    ...y {currentWarnings.length - 3} más
                  </li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Tabla editable */}
        <ExcelPreviewTable
          type={activeTab}
          data={previewData[activeTab] || []}
          onDataChange={(newData) => handleDataChange(activeTab, newData)}
          errors={currentErrors}
          className="min-h-[300px]"
        />
      </div>
    );
  };

  /**
   * Renderizar paso de carga
   */
  const renderLoadingStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <div className="text-center">
        <p className="text-lg font-medium">
          {isConfirming ? "Ejecutando carga masiva..." : "Procesando archivo..."}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {isConfirming 
            ? "Esto puede tomar unos momentos" 
            : `Analizando ${fileName}`
          }
        </p>
      </div>
      <Progress value={uploadProgress} className="w-64" />
      <p className="text-xs text-muted-foreground">{uploadProgress}%</p>
    </div>
  );

  /**
   * Renderizar paso de éxito
   */
  const renderSuccessStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30">
        <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
          ¡Carga Masiva Completada!
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Los datos han sido importados correctamente
        </p>
      </div>

      {resultado && (
        <div className="grid grid-cols-3 gap-4 w-full max-w-md">
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{resultado.rubros_creados}</p>
            <p className="text-xs text-muted-foreground">Rubros creados</p>
            {resultado.rubros_existentes > 0 && (
              <p className="text-xs text-muted-foreground">
                ({resultado.rubros_existentes} existentes)
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{resultado.vehiculos_creados}</p>
            <p className="text-xs text-muted-foreground">Vehículos creados</p>
            {resultado.vehiculos_existentes > 0 && (
              <p className="text-xs text-muted-foreground">
                ({resultado.vehiculos_existentes} existentes)
              </p>
            )}
          </div>
          <div className="p-4 rounded-lg bg-muted text-center">
            <p className="text-2xl font-bold text-primary">{resultado.deudas_creadas}</p>
            <p className="text-xs text-muted-foreground">Deudas creadas</p>
            {resultado.deudas_existentes > 0 && (
              <p className="text-xs text-muted-foreground">
                ({resultado.deudas_existentes} existentes)
              </p>
            )}
          </div>
        </div>
      )}

      <Button onClick={handleClose} className="mt-4">
        Cerrar
      </Button>
    </div>
  );

  /**
   * Renderizar paso de error
   */
  const renderErrorStep = () => (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/30">
        <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold text-red-700 dark:text-red-300">
          Error en la Carga
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          {errorMessage}
        </p>
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={() => setStep(STEPS.UPLOAD)}>
          Reintentar
        </Button>
        <Button variant="ghost" onClick={handleClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );

  /**
   * Renderizar contenido según el paso actual
   */
  const renderContent = () => {
    switch (step) {
      case STEPS.UPLOAD:
        return renderUploadStep();
      case STEPS.PREVIEW:
        return renderPreviewStep();
      case STEPS.LOADING:
        return renderLoadingStep();
      case STEPS.SUCCESS:
        return renderSuccessStep();
      case STEPS.ERROR:
        return renderErrorStep();
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  Carga Masiva de Datos
                </DialogTitle>
                <DialogDescription>
                  {step === STEPS.UPLOAD && "Sube un archivo Excel con los datos a importar"}
                  {step === STEPS.PREVIEW && `Revisando: ${fileName}`}
                  {step === STEPS.LOADING && "Procesando..."}
                  {step === STEPS.SUCCESS && "Importación completada"}
                  {step === STEPS.ERROR && "Error en la importación"}
                </DialogDescription>
              </div>
            </div>
            
            {step === STEPS.PREVIEW && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep(STEPS.UPLOAD)}
              >
                <X className="h-4 w-4 mr-1" />
                Cambiar archivo
              </Button>
            )}
          </div>
        </DialogHeader>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto py-4 min-h-0">
          {renderContent()}
        </div>

        {/* Footer con acciones */}
        {step === STEPS.PREVIEW && (
          <DialogFooter className="border-t pt-4 flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground">
                {validacion.errores.length === 0 ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Listo para importar
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {validacion.errores.length} errores encontrados
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button 
                  variant="secondary"
                  onClick={handleRevalidate}
                  disabled={isRevalidating || isConfirming}
                >
                  {isRevalidating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Revalidar
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleConfirm}
                  disabled={isConfirming || isRevalidating}
                >
                  {isConfirming ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Confirmar Importación
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
