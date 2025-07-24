import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Download,
  Settings,
  Database,
  Car,
  Truck,
  Bike,
  Circle,
  Fuel,
  Zap,
  Cog,
  Package,
  Home,
  Palette,
  Sofa,
  Settings2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosAdmin } from '../../api/axiosClient';

interface InstallationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  count?: number;
}

interface SystemStatus {
  isInstalled: boolean;
  overallProgress: number;
  steps: InstallationStep[];
  statistics: {
    brands: number;
    models: number;
    vehicles: number;
  };
}

const SystemInstaller = () => {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar estado del sistema
  const loadSystemStatus = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get('/installer/status');
      
      if (response.data.success) {
        setSystemStatus(response.data.data);
      } else {
        toast.error('Error cargando estado del sistema');
      }
    } catch (error: any) {
      console.error('Error loading system status:', error);
      toast.error('Error conectando con el servidor de instalación');
    } finally {
      setLoading(false);
    }
  };

  // Ejecutar instalación completa
  const runCompleteInstallation = async () => {
    if (!confirm('¿Estás seguro de que quieres ejecutar la instalación completa? Este proceso puede tomar varios minutos.')) {
      return;
    }

    try {
      setIsInstalling(true);
      toast.loading('Ejecutando instalación completa del sistema...', { duration: Infinity });
      
      const response = await axiosAdmin.post('/installer/install');
      
      toast.dismiss();
      
      if (response.data.success) {
        toast.success('✅ Instalación completada exitosamente');
        toast.success(`📊 ${response.data.data.statistics.totalBrands} marcas y ${response.data.data.statistics.totalModels} modelos instalados`);
        await loadSystemStatus();
      } else {
        toast.error('Error durante la instalación');
      }
    } catch (error: any) {
      toast.dismiss();
      console.error('Error during installation:', error);
      toast.error(error.response?.data?.error || 'Error durante la instalación del sistema');
    } finally {
      setIsInstalling(false);
    }
  };

  // Ejecutar paso específico
  const runSpecificStep = async (stepId: string) => {
    if (!confirm(`¿Ejecutar solo el paso "${stepId}"?`)) {
      return;
    }

    try {
      setIsInstalling(true);
      const response = await axiosAdmin.post(`/installer/step/${stepId}`);
      
      if (response.data.success) {
        toast.success(`✅ Paso "${stepId}" completado`);
        await loadSystemStatus();
      } else {
        toast.error(`Error ejecutando paso "${stepId}"`);
      }
    } catch (error: any) {
      console.error(`Error running step ${stepId}:`, error);
      toast.error(`Error ejecutando paso "${stepId}"`);
    } finally {
      setIsInstalling(false);
    }
  };

  // Iconos para cada tipo de paso
  const getStepIcon = (stepId: string, status: string) => {
    const iconClass = "w-6 h-6";
    
    if (status === 'completed') {
      return <CheckCircle className={`${iconClass} text-green-500`} />;
    }
    
    if (status === 'running') {
      return <Loader className={`${iconClass} text-blue-500 animate-spin`} />;
    }
    
    if (status === 'error') {
      return <AlertCircle className={`${iconClass} text-red-500`} />;
    }

    // Iconos específicos por tipo
    switch (stepId) {
      case 'brands':
        return <Database className={`${iconClass} text-gray-400`} />;
      case 'models':
        return <Settings className={`${iconClass} text-gray-400`} />;
      case 'car-extras':
        return <Car className={`${iconClass} text-gray-400`} />;
      case 'motorhome-extras':
        return <Truck className={`${iconClass} text-gray-400`} />;
      case 'motorcycle-extras':
        return <Bike className={`${iconClass} text-gray-400`} />;
      case 'vehicle-states':
        return <Circle className={`${iconClass} text-gray-400`} />;
      case 'fuel-types':
        return <Fuel className={`${iconClass} text-gray-400`} />;
      case 'propulsion-types':
        return <Cog className={`${iconClass} text-gray-400`} />;
      case 'car-body-types':
        return <Car className={`${iconClass} text-gray-400`} />;
      case 'motorcycle-body-types':
        return <Bike className={`${iconClass} text-gray-400`} />;
      case 'caravan-body-types':
        return <Truck className={`${iconClass} text-gray-400`} />;
      case 'commercial-vehicle-body-types':
        return <Package className={`${iconClass} text-gray-400`} />;
      case 'habitacle-extras':
        return <Home className={`${iconClass} text-gray-400`} />;
      case 'exterior-colors':
        return <Palette className={`${iconClass} text-gray-400`} />;
      case 'upholstery-types':
        return <Sofa className={`${iconClass} text-gray-400`} />;
      case 'transmission-types':
        return <Settings2 className={`${iconClass} text-gray-400`} />;
      default:
        return <Circle className={`${iconClass} text-gray-400`} />;
    }
  };

  // Cargar estado inicial
  useEffect(() => {
    loadSystemStatus();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-600">Verificando estado del sistema...</span>
      </div>
    );
  }

  if (!systemStatus) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Error cargando el estado del sistema</p>
        <button
          onClick={loadSystemStatus}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Download className="w-8 h-8 text-blue-500" />
              Instalador del Sistema
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Configura automáticamente marcas, modelos, extras y estados de vehículos
            </p>
          </div>
          
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {systemStatus.overallProgress}%
            </div>
            <div className="text-sm text-gray-500">
              {systemStatus.isInstalled ? 'Instalado' : 'Pendiente'}
            </div>
          </div>
        </div>

        {/* Barra de progreso general */}
        <div className="mt-4">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                systemStatus.isInstalled ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${systemStatus.overallProgress}%` }}
            />
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemStatus.statistics.brands}
            </div>
            <div className="text-sm text-gray-500">Marcas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemStatus.statistics.models}
            </div>
            <div className="text-sm text-gray-500">Modelos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {systemStatus.statistics.vehicles}
            </div>
            <div className="text-sm text-gray-500">Vehículos</div>
          </div>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex gap-4">
        <button
          onClick={runCompleteInstallation}
          disabled={isInstalling || systemStatus.isInstalled}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`w-5 h-5 ${isInstalling ? 'animate-pulse' : ''}`} />
          {systemStatus.isInstalled ? 'Sistema Instalado' : 'Ejecutar Instalación Completa'}
        </button>
        
        <button
          onClick={loadSystemStatus}
          disabled={isInstalling}
          className="flex items-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-5 h-5" />
          Verificar Estado
        </button>
      </div>

      {/* Lista de pasos */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Pasos de Instalación
          </h3>
          
          <div className="space-y-4">
            {systemStatus.steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors ${
                  step.status === 'completed'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                    : step.status === 'error'
                    ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="flex-shrink-0">
                  {getStepIcon(step.id, step.status)}
                </div>
                
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {index + 1}. {step.name}
                    </h4>
                    {step.count !== undefined && (
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {step.count} elementos
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {step.description}
                  </p>
                  
                  {step.progress > 0 && step.status !== 'completed' && (
                    <div className="mt-2">
                      <div className="bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${step.progress}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {step.progress}% completado
                      </div>
                    </div>
                  )}
                </div>
                
                {step.status === 'pending' && !systemStatus.isInstalled && (
                  <button
                    onClick={() => runSpecificStep(step.id)}
                    disabled={isInstalling}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Ejecutar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Información adicional */}
      {systemStatus.isInstalled && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h4 className="font-medium text-green-800 dark:text-green-200">
              Sistema Instalado Correctamente
            </h4>
          </div>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            Todos los componentes del sistema han sido instalados y configurados. 
            Ya puedes comenzar a gestionar vehículos, marcas y modelos.
          </p>
        </div>
      )}
    </div>
  );
};

export default SystemInstaller;