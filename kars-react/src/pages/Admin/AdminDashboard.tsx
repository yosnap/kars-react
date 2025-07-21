import { useState, useEffect } from 'react';
import { 
  Car, 
  Database, 
  RefreshCw, 
  FileText,
  Plus,
  CheckCircle,
  AlertCircle,
  Loader2,
  Upload,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VERSION_INFO } from '../../config/version';
import AdminLayout from '../../components/Admin/AdminLayout';
import { axiosAdmin } from '../../api/axiosClient';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [importMessage, setImportMessage] = useState('');
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    sold: 0,
    available: 0,
    active: 0,
    inactive: 0,
    loading: true
  });

  // Función para obtener estadísticas de vehículos
  const fetchVehicleStats = async () => {
    try {
      console.log('🔍 Fetching vehicle stats...');
      setVehicleStats(prev => ({ ...prev, loading: true }));
      
      // Hacer múltiples llamadas en paralelo para obtener todas las estadísticas
      const [totalResponse, soldResponse, availableResponse, activeResponse, inactiveResponse] = await Promise.all([
        axiosAdmin.get('/vehicles?per_page=1'),
        axiosAdmin.get('/vehicles?per_page=1&venut=true'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=true&venut=false'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=true'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=false')
      ]);
      
      const [totalData, soldData, availableData, activeData, inactiveData] = [
        totalResponse.data,
        soldResponse.data,
        availableResponse.data,
        activeResponse.data,
        inactiveResponse.data
      ];
      
      const stats = {
        total: totalData.total || 0,
        sold: soldData.total || 0,
        available: availableData.total || 0,
        active: activeData.total || 0,
        inactive: inactiveData.total || 0,
        loading: false
      };
      
      setVehicleStats(stats);
      console.log('📊 Vehicle stats calculated:', stats);
      
    } catch (error) {
      console.error('❌ Error fetching vehicle stats:', error);
      setVehicleStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchVehicleStats();
  }, []);

  const handleCreateVehicle = () => {
    // Aquí podrías abrir un modal o navegar a un formulario
    alert('Función de crear vehículo - por implementar');
  };

  const handleManualSync = async () => {
    console.log('🔵 handleManualSync called - API Sync');
    setSyncStatus('running');
    setSyncMessage('Iniciando sincronización desde API externa...');
    
    try {
      const response = await axiosAdmin.post('/sync/manual');
      const data = response.data;
      setSyncStatus('success');
      setSyncMessage(`Sincronización desde API iniciada exitosamente. ID: ${data.syncId}`);
      
      // Opcional: polling para obtener el estado de la sincronización
      pollSyncStatus();
      
    } catch (error) {
      console.error('Error during sync:', error);
      setSyncStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          setSyncMessage('Error 500: Problema en el servidor. Verifica que la API esté funcionando correctamente.');
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          setSyncMessage('Error de conexión: No se puede conectar al servidor API');
        } else {
          setSyncMessage(`Error en la sincronización: ${error.message}`);
        }
      } else {
        setSyncMessage('Error desconocido en la sincronización');
      }
    }
  };

  const handleImportFromJson = async () => {
    console.log('🟢 handleImportFromJson called - JSON Import');
    setImportStatus('running');
    setImportMessage('Iniciando importación desde archivo JSON...');
    
    try {
      const response = await axiosAdmin.post('/admin/import-vehicles-json', {
        batchSize: 25, // Lotes más pequeños para no saturar
        delayBetweenBatches: 2000 // 2 segundos entre lotes
      });
      const data = response.data;
      setImportStatus('success');
      setImportMessage(`Importación desde JSON iniciada exitosamente. ID: ${data.importId}`);
      
      // Polling para obtener el estado de la importación
      pollImportStatus();
      
    } catch (error) {
      console.error('Error during JSON import:', error);
      setImportStatus('error');
      
      if (error instanceof Error) {
        if (error.message.includes('500')) {
          setImportMessage('Error 500: Problema en el servidor. Verifica que el archivo JSON esté disponible.');
        } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
          setImportMessage('Error de conexión: No se puede conectar al servidor API');
        } else {
          setImportMessage(`Error en la importación: ${error.message}`);
        }
      } else {
        setImportMessage('Error desconocido en la importación');
      }
    }
  };

  const pollSyncStatus = async () => {
    // Polling cada 2 segundos para obtener el estado
    const interval = setInterval(async () => {
      try {
        const response = await axiosAdmin.get('/sync/status');
        const status = response.data;
        
        if (!status.isRunning) {
          clearInterval(interval);
          if (status.lastSync?.status === 'completed') {
            setSyncStatus('success');
            setSyncMessage(`Sincronización completada. Vehículos procesados: ${status.lastSync.vehiclesProcessed || 0}`);
            // Actualizar estadísticas después de sincronización exitosa
            fetchVehicleStats();
          } else if (status.lastSync?.status === 'failed') {
            setSyncStatus('error');
            setSyncMessage(`Sincronización falló: ${status.lastSync.error || 'Error desconocido'}`);
          }
        } else {
          setSyncMessage(`Sincronizando... ${status.currentSync?.status || 'En progreso'}`);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling sync status:', error);
      }
    }, 2000);
    
    // Limpiar después de 5 minutos
    setTimeout(() => clearInterval(interval), 300000);
  };

  const pollImportStatus = async () => {
    // Polling cada 2 segundos para obtener el estado de importación
    const interval = setInterval(async () => {
      try {
        const response = await axiosAdmin.get('/admin/import-status');
        const status = response.data;
        
        if (!status.isRunning) {
          clearInterval(interval);
          if (status.currentImport?.status === 'completed') {
            setImportStatus('success');
            setImportMessage(`Importación completada. ${status.currentImport.createdVehicles} creados, ${status.currentImport.updatedVehicles} actualizados`);
            // Actualizar estadísticas después de importación exitosa
            fetchVehicleStats();
          } else if (status.currentImport?.status === 'failed') {
            setImportStatus('error');
            setImportMessage(`Importación falló: ${status.currentImport.errors?.[0] || 'Error desconocido'}`);
          }
        } else if (status.currentImport) {
          const progress = status.currentImport.progressPercentage || 0;
          setImportMessage(`Importando... ${progress}% completado (${status.currentImport.processedVehicles}/${status.currentImport.totalVehicles})`);
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Error polling import status:', error);
      }
    }, 2000);
    
    // Limpiar después de 10 minutos
    setTimeout(() => clearInterval(interval), 600000);
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gestiona vehículos y configuración de Kars.ad</p>
        </div>
        <div className="flex items-center gap-3">
          {syncStatus === 'running' && (
            <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin" />
              Sincronizando API...
            </div>
          )}
          {importStatus === 'running' && (
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <Loader2 className="w-4 h-4 animate-spin" />
              Importando JSON...
            </div>
          )}
          <button
            onClick={handleCreateVehicle}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear Vehículo
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
          {[
            { key: 'overview', label: 'Resumen', icon: Database },
            { key: 'vehicles', label: 'Vehículos', icon: Car },
            { key: 'sync', label: 'Sincronización', icon: RefreshCw },
            { key: 'blog', label: 'Blog', icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveSection(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeSection === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeSection === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Car className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Vehículos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {vehicleStats.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          vehicleStats.total
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <RefreshCw className="h-8 w-8 text-green-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Disponibles
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {vehicleStats.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          vehicleStats.available
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Database className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Vendidos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {vehicleStats.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          vehicleStats.sold
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Activos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {vehicleStats.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          vehicleStats.active
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Inactivos
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {vehicleStats.loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          vehicleStats.inactive
                        )}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick System Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Informació del Sistema</h3>
                <Link 
                  to="/admin/system-info" 
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <Info className="w-4 h-4" />
                  Veure detalls
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{VERSION_INFO.version}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Versió</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{VERSION_INFO.environment}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Entorn</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">MongoDB</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Base de Dades</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'vehicles' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gestión de Vehículos</h2>
            <div className="space-y-4">
              <button
                onClick={handleCreateVehicle}
                className="w-full p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Plus className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Hacer clic para crear un nuevo vehículo</p>
              </button>
              
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                <p>No hay vehículos configurados aún.</p>
                <p className="text-sm mt-2">Los vehículos aparecerán aquí una vez creados.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'sync' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Sincronización con Motoraldia</h2>
              <div className="flex items-center gap-3">
                {syncStatus === 'running' && (
                  <div className="flex items-center gap-2 text-sm text-blue-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sincronización API en progreso
                  </div>
                )}
                {importStatus === 'running' && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Importación JSON en progreso
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Opciones de Sincronización</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  <strong>Sincronización API:</strong> Conecta directamente con la API de Motoraldia para obtener vehículos en tiempo real.<br/>
                  <strong>Importación JSON:</strong> Importa vehículos desde el archivo JSON actualizado sin conexión a internet.
                </p>
              </div>
              
              {/* Estado de sincronización API */}
              {syncMessage && (
                <div className={`rounded-lg p-4 flex items-center gap-3 ${
                  syncStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                  syncStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                  'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                }`}>
                  {syncStatus === 'running' && <Loader2 className="w-5 h-5 animate-spin text-blue-600" />}
                  {syncStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {syncStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">🔗 Sincronización API</p>
                    <p className={`text-sm ${
                      syncStatus === 'success' ? 'text-green-700 dark:text-green-300' :
                      syncStatus === 'error' ? 'text-red-700 dark:text-red-300' :
                      'text-blue-700 dark:text-blue-300'
                    }`}>
                      {syncMessage}
                    </p>
                  </div>
                </div>
              )}

              {/* Estado de importación JSON */}
              {importMessage && (
                <div className={`rounded-lg p-4 flex items-center gap-3 ${
                  importStatus === 'success' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                  importStatus === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                  'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}>
                  {importStatus === 'running' && <Loader2 className="w-5 h-5 animate-spin text-green-600" />}
                  {importStatus === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                  {importStatus === 'error' && <AlertCircle className="w-5 h-5 text-red-600" />}
                  <div>
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">📁 Importación JSON</p>
                    <p className={`text-sm ${
                      importStatus === 'success' ? 'text-green-700 dark:text-green-300' :
                      importStatus === 'error' ? 'text-red-700 dark:text-red-300' :
                      'text-green-700 dark:text-green-300'
                    }`}>
                      {importMessage}
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <button 
                  onClick={handleManualSync}
                  disabled={syncStatus === 'running' || importStatus === 'running'}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    syncStatus === 'running' || importStatus === 'running'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {syncStatus === 'running' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {syncStatus === 'running' ? 'Sincronizando...' : '🔵 API Sync'}
                </button>

                <button 
                  onClick={handleImportFromJson}
                  disabled={syncStatus === 'running' || importStatus === 'running'}
                  className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                    syncStatus === 'running' || importStatus === 'running'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {importStatus === 'running' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {importStatus === 'running' ? 'Importando...' : '🟢 JSON Import'}
                </button>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Métodos de Importación</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">🔗 Sincronización API</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Conecta directamente con Motoraldia</li>
                      <li>• Datos en tiempo real</li>
                      <li>• Requiere conexión a internet</li>
                      <li>• Obtiene las últimas actualizaciones</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">📁 Importación JSON</h5>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <li>• Usa archivo JSON local actualizado</li>
                      <li>• Procesamiento por lotes optimizado</li>
                      <li>• No requiere conexión externa</li>
                      <li>• Ideal cuando la API no está disponible</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'blog' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Gestión del Blog</h2>
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>Gestión de artículos del blog</p>
              <p className="text-sm mt-2">Funcionalidad por implementar</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}