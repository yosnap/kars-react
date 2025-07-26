import React, { useState, useEffect } from 'react';
import { MessageCircle, Save, Phone, User, MessageSquare, RefreshCw, Database, Clock, CheckCircle, AlertCircle, Image, Settings, TestTube, Play, Users, Filter, Trash2, Eye, Calendar } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import toast from 'react-hot-toast';

interface WhatsAppConfig {
  number: string;
  contactName: string;
  messageTemplate: string;
  enabled: boolean;
}

interface ApiSyncConfig {
  apiUrl: string;
  username: string;
  password: string;
  userId: string;
  importSold: boolean;
  importNotSold: boolean;
  convertImages: boolean;
  imageFormat: 'webp' | 'avif';
  autoSync: boolean;
  syncFrequency: number; // minutes
  batchSize: number;
  lastSync: Date | null;
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error';
}

interface SyncLog {
  id: string;
  type: string;
  status: string;
  startedAt: string;
  completedAt: string | null;
  vehiclesProcessed: number;
  vehiclesCreated: number;
  vehiclesUpdated: number;
  vehiclesDeleted: number;
  errorMessage: string | null;
  duration: number | null;
}

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'api-sync'>('whatsapp');
  
  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>({
    number: '34612345678',
    contactName: 'Kars',
    messageTemplate: `Hola {contactName}, me interesa el producto "{productName}" cuyo enlace es: {productUrl}.
¿Me podrías dar información para realizar la compra?`,
    enabled: true
  });

  const [apiSyncConfig, setApiSyncConfig] = useState<ApiSyncConfig>({
    apiUrl: 'https://motoraldia.net/wp-json/api-motor/v1/vehicles',
    username: 'Paulo',
    password: 'U^q^i2l49rZrX72#Ln!Xe5k0',
    userId: '113',
    importSold: true,
    importNotSold: true,
    convertImages: true,
    imageFormat: 'avif',
    autoSync: false,
    syncFrequency: 60, // 1 hour
    batchSize: 50,
    lastSync: null,
    connectionStatus: 'idle'
  });

  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    loadApiConfig();
    if (activeTab === 'api-sync') {
      loadSyncLogs();
    }
  }, [activeTab]);

  const loadApiConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/config`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        }
      });

      if (response.ok) {
        const config = await response.json();
        setApiSyncConfig({
          ...config,
          lastSync: config.lastSync ? new Date(config.lastSync) : null,
          connectionStatus: 'idle'
        });
      }
    } catch (error) {
      console.error('Error loading API config:', error);
    }
  };

  const handleWhatsAppChange = (field: keyof WhatsAppConfig, value: string | boolean) => {
    setWhatsAppConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApiSyncChange = (field: keyof ApiSyncConfig, value: string | boolean | number) => {
    setApiSyncConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveWhatsApp = async () => {
    setLoading(true);
    try {
      // TODO: Implementar llamada API para guardar configuración
      // await axiosAdmin.post('/settings/whatsapp', whatsAppConfig);
      
      // Simulación temporal
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Configuración de WhatsApp guardada correctamente');
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const testApiConnection = async () => {
    setApiSyncConfig(prev => ({ ...prev, connectionStatus: 'testing' }));
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify({
          apiUrl: apiSyncConfig.apiUrl,
          username: apiSyncConfig.username,
          password: apiSyncConfig.password
        })
      });

      const result = await response.json();

      if (result.success) {
        setApiSyncConfig(prev => ({ ...prev, connectionStatus: 'connected' }));
        toast.success(`Conexión establecida correctamente - ${result.sampleItems} vehículos encontrados`);
      } else {
        setApiSyncConfig(prev => ({ ...prev, connectionStatus: 'error' }));
        toast.error(result.message || 'Error al conectar con la API externa');
      }
    } catch (error) {
      setApiSyncConfig(prev => ({ ...prev, connectionStatus: 'error' }));
      toast.error('Error al conectar con la API externa');
      console.error('Connection test error:', error);
    }
  };

  const runManualSync = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/import-with-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify(apiSyncConfig)
      });

      const result = await response.json();

      if (response.ok) {
        setApiSyncConfig(prev => ({ ...prev, lastSync: new Date() }));
        toast.success(`Sincronización manual iniciada - ID: ${result.syncId}`);
        
        // Opcional: Polling para verificar el estado
        setTimeout(() => {
          toast.success('Sincronización completada (verificar logs para detalles)');
        }, 5000);
      } else {
        toast.error(result.error || 'Error durante la sincronización');
      }
    } catch (error) {
      console.error('Error in manual sync:', error);
      toast.error('Error durante la sincronización');
    } finally {
      setLoading(false);
    }
  };

  const saveApiConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify(apiSyncConfig)
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Configuración de API guardada correctamente');
      } else {
        toast.error(result.error || 'Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error saving API config:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const loadSyncLogs = async () => {
    setLogsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/logs?limit=20`, {
        headers: {
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setSyncLogs(result.logs || []);
      } else {
        console.error('Error loading sync logs');
      }
    } catch (error) {
      console.error('Error loading sync logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const deleteSyncLog = async (logId: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/logs/${logId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        }
      });

      if (response.ok) {
        toast.success('Log eliminado correctamente');
        loadSyncLogs(); // Recargar la lista
      } else {
        toast.error('Error al eliminar el log');
      }
    } catch (error) {
      console.error('Error deleting sync log:', error);
      toast.error('Error al eliminar el log');
    }
  };

  const deleteSelectedLogs = async () => {
    if (selectedLogs.length === 0) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/logs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify({ ids: selectedLogs })
      });

      if (response.ok) {
        toast.success(`${selectedLogs.length} logs eliminados correctamente`);
        setSelectedLogs([]);
        loadSyncLogs(); // Recargar la lista
      } else {
        toast.error('Error al eliminar los logs seleccionados');
      }
    } catch (error) {
      console.error('Error deleting selected logs:', error);
      toast.error('Error al eliminar los logs seleccionados');
    }
  };

  const deleteAllLogs = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar TODOS los logs de sincronización? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sync/logs`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify({ deleteAll: true })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Todos los logs eliminados (${result.deletedCount} logs)`);
        setSyncLogs([]);
        setSelectedLogs([]);
      } else {
        toast.error('Error al eliminar todos los logs');
      }
    } catch (error) {
      console.error('Error deleting all logs:', error);
      toast.error('Error al eliminar todos los logs');
    }
  };

  const toggleLogSelection = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const selectAllLogs = () => {
    if (selectedLogs.length === syncLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(syncLogs.map(log => log.id));
    }
  };

  const formatDuration = (milliseconds: number | null) => {
    if (!milliseconds) return 'N/A';
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuración</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Gestiona la configuración general del sistema
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('whatsapp')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'whatsapp'
                  ? 'border-green-600 text-green-600 dark:border-green-400 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </div>
            </button>
            <button
              onClick={() => setActiveTab('api-sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'api-sync'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sincronización API
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'whatsapp' && (
        // WhatsApp Configuration Section
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <MessageCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Configuración de WhatsApp
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configura el botón flotante de WhatsApp para el frontend
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-white">
                Habilitar WhatsApp
              </label>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mostrar el botón flotante de WhatsApp en el frontend
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={whatsAppConfig.enabled}
                onChange={(e) => handleWhatsAppChange('enabled', e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <Phone className="w-4 h-4" />
              Número de WhatsApp
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 dark:text-gray-400 text-sm bg-red-100 dark:bg-red-900 px-2 py-1 rounded text-xs font-medium">
                  🇦🇩
                </span>
              </div>
              <input
                type="text"
                value={whatsAppConfig.number}
                onChange={(e) => handleWhatsAppChange('number', e.target.value)}
                placeholder="34604128777"
                className="w-full pl-16 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Número de WhatsApp con código de país (sin +)
            </p>
          </div>

          {/* Contact Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <User className="w-4 h-4" />
              Nombre de contacto
            </label>
            <input
              type="text"
              value={whatsAppConfig.contactName}
              onChange={(e) => handleWhatsAppChange('contactName', e.target.value)}
              placeholder="Elisabeth"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Nombre de la persona de contacto que aparecerá en el mensaje
            </p>
          </div>

          {/* Message Template */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
              <MessageSquare className="w-4 h-4" />
              Plantilla del mensaje
            </label>
            <textarea
              value={whatsAppConfig.messageTemplate}
              onChange={(e) => handleWhatsAppChange('messageTemplate', e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Escribe tu plantilla de mensaje aquí..."
            />
            <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              <p className="mb-1">Variables disponibles:</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{contactName}'}
                </span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{productName}'}
                </span>
                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                  {'{productUrl}'}
                </span>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleSaveWhatsApp}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </div>
        </div>
      )}

      {activeTab === 'api-sync' && (
        // API Synchronization Section
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Sincronización API
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configura la importación automática de vehículos desde APIs externas
              </p>
            </div>
            {apiSyncConfig.connectionStatus !== 'idle' && (
              <div className="ml-auto">
                {apiSyncConfig.connectionStatus === 'testing' && (
                  <div className="flex items-center gap-2 text-yellow-600">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Probando...</span>
                  </div>
                )}
                {apiSyncConfig.connectionStatus === 'connected' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Conectado</span>
                  </div>
                )}
                {apiSyncConfig.connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-sm">Error</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Connection Configuration */}
          <div>
            <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
              <Database className="w-5 h-5" />
              Configuración de Conexión
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* API URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  URL de la API externa
                </label>
                <input
                  type="url"
                  value={apiSyncConfig.apiUrl}
                  onChange={(e) => handleApiSyncChange('apiUrl', e.target.value)}
                  placeholder="https://example.com/wp-json/api/vehicles"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Usuario
                </label>
                <input
                  type="text"
                  value={apiSyncConfig.username}
                  onChange={(e) => handleApiSyncChange('username', e.target.value)}
                  placeholder="Username"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={apiSyncConfig.password}
                  onChange={(e) => handleApiSyncChange('password', e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Test Connection Button */}
            <div className="mt-4">
              <button
                onClick={testApiConnection}
                disabled={apiSyncConfig.connectionStatus === 'testing' || !apiSyncConfig.apiUrl || !apiSyncConfig.username || !apiSyncConfig.password}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <TestTube className="w-4 h-4" />
                {apiSyncConfig.connectionStatus === 'testing' ? 'Probando conexión...' : 'Probar Conexión'}
              </button>
            </div>
          </div>

          {/* Import Filters */}
          <div>
            <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
              <Filter className="w-5 h-5" />
              Filtros de Importación
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User ID */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  ID de Usuario (opcional)
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={apiSyncConfig.userId}
                    onChange={(e) => handleApiSyncChange('userId', e.target.value)}
                    placeholder="113"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Deja vacío para importar de todos los usuarios
                </p>
              </div>

              {/* Batch Size */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Tamaño del lote
                </label>
                <input
                  type="number"
                  min="10"
                  max="200"
                  value={apiSyncConfig.batchSize}
                  onChange={(e) => handleApiSyncChange('batchSize', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Número de vehículos por lote (10-200)
                </p>
              </div>
            </div>

            {/* Vehicle Status Filters */}
            <div className="mt-6">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                Estado de vehículos a importar
              </p>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={apiSyncConfig.importNotSold}
                    onChange={(e) => handleApiSyncChange('importNotSold', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Vehículos no vendidos</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={apiSyncConfig.importSold}
                    onChange={(e) => handleApiSyncChange('importSold', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-sm text-gray-900 dark:text-white">Vehículos vendidos</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image Processing */}
          <div>
            <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
              <Image className="w-5 h-5" />
              Procesamiento de Imágenes
            </h3>
            
            <div className="space-y-4">
              {/* Convert Images Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Convertir imágenes a formato moderno
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Convierte automáticamente las imágenes a WebP/AVIF para mejor rendimiento
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={apiSyncConfig.convertImages}
                    onChange={(e) => handleApiSyncChange('convertImages', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Image Format Selection */}
              {apiSyncConfig.convertImages && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Formato de imagen
                  </label>
                  <select
                    value={apiSyncConfig.imageFormat}
                    onChange={(e) => handleApiSyncChange('imageFormat', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="webp">WebP (Compatible y eficiente)</option>
                    <option value="avif">AVIF (Última tecnología, mayor compresión)</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    AVIF ofrece mejor compresión pero menor compatibilidad
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Auto Sync Configuration */}
          <div>
            <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
              <Settings className="w-5 h-5" />
              Sincronización Automática
            </h3>
            
            <div className="space-y-4">
              {/* Auto Sync Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    Habilitar sincronización automática
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Importa automáticamente vehículos nuevos según la frecuencia configurada
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={apiSyncConfig.autoSync}
                    onChange={(e) => handleApiSyncChange('autoSync', e.target.checked)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Sync Frequency */}
              {apiSyncConfig.autoSync && (
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Frecuencia de sincronización (minutos)
                  </label>
                  <select
                    value={apiSyncConfig.syncFrequency}
                    onChange={(e) => handleApiSyncChange('syncFrequency', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={15}>Cada 15 minutos</option>
                    <option value={30}>Cada 30 minutos</option>
                    <option value={60}>Cada hora</option>
                    <option value={180}>Cada 3 horas</option>
                    <option value={360}>Cada 6 horas</option>
                    <option value={720}>Cada 12 horas</option>
                    <option value={1440}>Cada día</option>
                  </select>
                </div>
              )}

              {/* Last Sync Info */}
              {apiSyncConfig.lastSync && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-white">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">Última sincronización:</span>
                    <span>{apiSyncConfig.lastSync.toLocaleString('es-ES')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={runManualSync}
              disabled={loading || apiSyncConfig.connectionStatus !== 'connected'}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Play className="w-4 h-4" />
              {loading ? 'Sincronizando...' : 'Ejecutar Sincronización Manual'}
            </button>
            
            <button
              onClick={saveApiConfig}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>

          {/* Sync Logs Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white">
                <Calendar className="w-5 h-5" />
                Historial de Sincronización
              </h3>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={loadSyncLogs}
                  disabled={logsLoading}
                  className="flex items-center gap-2 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${logsLoading ? 'animate-spin' : ''}`} />
                  Actualizar
                </button>
                
                {selectedLogs.length > 0 && (
                  <button
                    onClick={deleteSelectedLogs}
                    className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Seleccionados ({selectedLogs.length})
                  </button>
                )}
                
                <button
                  onClick={deleteAllLogs}
                  disabled={syncLogs.length === 0}
                  className="flex items-center gap-2 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  Eliminar Todos
                </button>
              </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {logsLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Cargando logs...</p>
                </div>
              ) : syncLogs.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">No hay logs de sincronización disponibles</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Los logs aparecerán aquí después de ejecutar sincronizaciones
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="p-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedLogs.length === syncLogs.length && syncLogs.length > 0}
                            onChange={selectAllLogs}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                          />
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Inicio
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Duración
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Procesados
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Creados
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actualizados
                        </th>
                        <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {syncLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="p-3">
                            <input
                              type="checkbox"
                              checked={selectedLogs.includes(log.id)}
                              onChange={() => toggleLogSelection(log.id)}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                            />
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            <span className="font-medium">
                              {log.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(log.status)}`}>
                              {log.status === 'completed' ? 'Completado' : 
                               log.status === 'running' ? 'Ejecutando' :
                               log.status === 'failed' ? 'Fallido' : log.status}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            {new Date(log.startedAt).toLocaleString('es-ES')}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            {formatDuration(log.duration)}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            {log.vehiclesProcessed}
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              {log.vehiclesCreated}
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-900 dark:text-white">
                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                              {log.vehiclesUpdated}
                            </span>
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => deleteSyncLog(log.id)}
                                className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Eliminar log"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              {log.errorMessage && (
                                <button
                                  onClick={() => alert(log.errorMessage)}
                                  className="p-1 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                  title="Ver error"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        </div>
      )}
    </AdminLayout>
  );
}