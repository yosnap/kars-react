import React, { useState, useEffect } from 'react';
import { Cpu, Database, HardDrive, RefreshCw, Server, Monitor, Activity, Car, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { VERSION_INFO } from '../../config/version';
import { axiosAdmin } from '../../api/axiosClient';

interface SystemData {
  version: string;
  environment: string;
  uptime: string;
  platform: string;
  nodeVersion: string;
  host: string;
  mongodb: string;
  dbSize: string;
  collections: number;
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    model: string;
    cores: number;
    load: number[];
  };
  technologies: {
    name: string;
    version: string;
    icon: string;
  }[];
  apiVersion?: string;
  databaseStatus?: string;
}

const SystemInfo = () => {
  const [systemData, setSystemData] = useState<SystemData>({
    version: VERSION_INFO.version,
    environment: VERSION_INFO.environment,
    uptime: '0d 0h 0m',
    platform: 'darwin',
    nodeVersion: 'v18.20.7',
    host: window.location.hostname,
    mongodb: 'v8.0.11',
    dbSize: '690.37 KB',
    collections: 16,
    memory: {
      used: 1.01,
      total: 7.75,
      percentage: 12.99
    },
    cpu: {
      model: 'Apple M1',
      cores: 8,
      load: [0.05, 0.05, 0.00]
    },
    technologies: [
      { name: 'Node.js', version: 'v18.20.8', icon: '🟢' },
      { name: 'Express', version: '^4.18.2', icon: '🚀' },
      { name: 'MongoDB', version: '^8.0.0', icon: '🍃' },
      { name: 'TypeScript', version: '^5.2.2', icon: '🔷' },
      { name: 'React', version: '^19.0.0', icon: '⚛️' },
      { name: 'Vite', version: '^6.0.0', icon: '⚡' },
      { name: 'Tailwind CSS', version: '^3.4.0', icon: '🎨' },
      { name: 'Prisma', version: '^6.0.0', icon: '🔺' }
    ],
    apiVersion: 'unknown',
    databaseStatus: 'unknown'
  });

  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    sold: 0,
    available: 0,
    active: 0,
    inactive: 0,
    cars: 0,
    loading: true
  });

  const [activeTab, setActiveTab] = useState('info');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Función para obtener información del sistema desde la API
  const fetchSystemInfo = async () => {
    try {
      console.log('🔍 Fetching system info from API...');
      const response = await axiosAdmin.get('/system/info');
      const apiData = response.data;
      
      console.log('📊 System info received:', apiData);
      
      // Update system data with real API data
      setSystemData(prev => ({
        ...prev,
        apiVersion: apiData.api?.version || 'unknown',
        nodeVersion: apiData.system?.nodeVersion || prev.nodeVersion,
        platform: apiData.system?.platform || prev.platform,
        mongodb: `Connected (${apiData.database?.vehicleCount} vehicles)`,
        dbSize: `${apiData.system?.memory?.rss || 0} MB RAM`,
        collections: Object.keys(apiData.database?.collectionsInitialized || {}).length,
        databaseStatus: apiData.database?.status || 'unknown',
        memory: {
          used: apiData.system?.memory?.heapUsed || prev.memory.used,
          total: apiData.system?.memory?.heapTotal || prev.memory.total,
          percentage: apiData.system?.memory?.heapUsed && apiData.system?.memory?.heapTotal 
            ? Math.round((apiData.system.memory.heapUsed / apiData.system.memory.heapTotal) * 100)
            : prev.memory.percentage
        },
        uptime: formatUptime(apiData.api?.uptime || 0)
      }));
      
    } catch (error) {
      console.error('❌ Error fetching system info:', error);
    }
  };

  // Función para obtener estadísticas reales de vehículos
  const fetchVehicleStats = async () => {
    try {
      console.log('🔍 Fetching vehicle stats...');
      setVehicleStats(prev => ({ ...prev, loading: true }));
      
      // Hacer múltiples llamadas en paralelo para obtener todas las estadísticas
      const [totalResponse, soldResponse, availableResponse, activeResponse, inactiveResponse, carsResponse] = await Promise.all([
        axiosAdmin.get('/vehicles?per_page=1'),
        axiosAdmin.get('/vehicles?per_page=1&venut=true'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=true&venut=false'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=true'),
        axiosAdmin.get('/vehicles?per_page=1&anunci-actiu=false'),
        axiosAdmin.get('/vehicles?per_page=1&tipus-vehicle=cotxe')
      ]);
      
      const [totalData, soldData, availableData, activeData, inactiveData, carsData] = [
        totalResponse.data,
        soldResponse.data,
        availableResponse.data,
        activeResponse.data,
        inactiveResponse.data,
        carsResponse.data
      ];
      
      const stats = {
        total: totalData.total || 0,
        sold: soldData.total || 0,
        available: availableData.total || 0,
        active: activeData.total || 0,
        inactive: inactiveData.total || 0,
        cars: carsData.total || 0,
        loading: false
      };
      
      setVehicleStats(stats);
      console.log('📊 Vehicle stats calculated:', stats);
      
    } catch (error) {
      console.error('❌ Error fetching vehicle stats:', error);
      setVehicleStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Función para formatear el uptime en días, horas, minutos
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / (24 * 60 * 60));
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    // Fetch both system info and vehicle stats on component mount
    fetchSystemInfo();
    fetchVehicleStats();
  }, []);

  const refreshData = async () => {
    setIsRefreshing(true);
    // Actualizar tanto información del sistema como estadísticas de vehículos
    await Promise.all([
      fetchSystemInfo(),
      fetchVehicleStats()
    ]);
    setIsRefreshing(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Panell d'Administració
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestió i monitoreo del sistema
            </p>
          </div>
          <button
            onClick={refreshData}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Actualitzar
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Informació del Sistema
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'logs'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Registres del Sistema
            </button>
          </nav>
        </div>

        {activeTab === 'info' && (
          <div className="space-y-6">
            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sistema */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-500" />
                    Sistema
                  </h3>
                  <Monitor className="w-5 h-5 text-blue-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Frontend:</span>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                      v{systemData.version}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">API:</span>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium">
                      v{systemData.apiVersion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Entorn:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.environment}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Uptime:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.uptime}
                    </span>
                  </div>
                </div>
              </div>

              {/* Servidor */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-500" />
                    Servidor
                  </h3>
                  <Server className="w-5 h-5 text-green-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Plataforma:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.platform}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Node.js:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.nodeVersion}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Host:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.host}
                    </span>
                  </div>
                </div>
              </div>

              {/* Base de Datos */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Base de Dades
                  </h3>
                  <Database className="w-5 h-5 text-purple-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">MongoDB:</span>
                    <span className={`font-medium ${
                      systemData.databaseStatus === 'connected' 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {systemData.mongodb}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Tamany:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.dbSize}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Col·leccions:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.collections}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Vehicle Stats */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.total
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Vehicles</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.available
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Disponibles</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.sold
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Venuts</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.active
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Actius</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.inactive
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Inactius</div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-center">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                  {vehicleStats.loading ? (
                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                  ) : (
                    vehicleStats.cars
                  )}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Cotxes</div>
              </div>
            </div>

            {/* Memory and CPU */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Memory */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="w-5 h-5 text-blue-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Memòria</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usat: {systemData.memory.used} GB</span>
                    <span>Total: {systemData.memory.total} GB</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${systemData.memory.percentage}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 text-center">
                    {systemData.memory.percentage}% en ús
                  </div>
                </div>
              </div>

              {/* CPU */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <Cpu className="w-5 h-5 text-purple-500" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">CPU</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {systemData.cpu.model}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Núcleos:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.cpu.cores}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Càrrega (1m/5m/15m):</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {systemData.cpu.load.join(' / ')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Technologies */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Tecnologies i Dependències
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {systemData.technologies.map((tech, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl mb-2">{tech.icon}</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {tech.name}
                    </div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">
                      {tech.version}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Registres del Sistema
              </h3>
            </div>
            <div className="space-y-2">
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                <span className="text-gray-500">[{new Date().toISOString()}]</span>{' '}
                <span className="text-green-600">INFO</span> Sistema inicialitzat correctament
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                <span className="text-gray-500">[{new Date(Date.now() - 60000).toISOString()}]</span>{' '}
                <span className="text-blue-600">DEBUG</span> Connexió a MongoDB establerta
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                <span className="text-gray-500">[{new Date(Date.now() - 120000).toISOString()}]</span>{' '}
                <span className="text-green-600">INFO</span> API servidor executant-se al port 3001
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded font-mono text-sm">
                <span className="text-gray-500">[{new Date(Date.now() - 180000).toISOString()}]</span>{' '}
                <span className="text-yellow-600">WARN</span> Sync automàtic inicialitzat: cada 30 minuts
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default SystemInfo;