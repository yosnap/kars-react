import { useState, useEffect, useRef } from 'react'
import { 
  RefreshCw, 
  Download, 
  Play, 
  Square,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Settings,
  Upload,
  FileText
} from 'lucide-react'
import { axiosAdmin } from '../../api/axiosClient'

interface SyncStatus {
  isRunning: boolean
  currentSync: {
    id: string
    type: string
    status: string
    startedAt: string
    vehiclesProcessed: number
    vehiclesCreated: number
    vehiclesUpdated: number
    vehiclesDeleted: number
  } | null
  lastCompletedSync: any | null
  config: Record<string, string>
  nextScheduledSync: string
}

interface SyncLog {
  id: string
  type: string
  status: string
  startedAt: string
  completedAt: string | null
  duration: number | null
  vehiclesProcessed: number
  vehiclesCreated: number
  vehiclesUpdated: number
  vehiclesDeleted: number
  errorMessage: string | null
}

interface SyncConfig {
  motoraldiaApiUrl: string
  syncLanguage: string
  enableAutoSync: boolean
  syncInterval: number
}

export default function SyncManager() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null)
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [config, setConfig] = useState<SyncConfig>({
    motoraldiaApiUrl: '',
    syncLanguage: 'ca',
    enableAutoSync: false,
    syncInterval: 60
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadData()
    
    // Refrescar cada 5 segundos si hay sync en progreso
    const interval = setInterval(() => {
      if (syncStatus?.isRunning) {
        loadSyncStatus()
      }
    }, 5000)
    
    return () => clearInterval(interval)
  }, [syncStatus?.isRunning])

  const loadData = async () => {
    try {
      const [statusRes, logsRes, configRes] = await Promise.all([
        axiosAdmin.get('/admin/sync/status'),
        axiosAdmin.get('/admin/sync/logs?page=1&limit=10'),
        axiosAdmin.get('/admin/sync/config')
      ])
      
      setSyncStatus(statusRes.data)
      setLogs(logsRes.data.logs || [])
      setConfig(configRes.data || config)
    } catch (error) {
      console.error('Error loading sync data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadSyncStatus = async () => {
    try {
      const statusRes = await axiosAdmin.get('/admin/sync/status')
      setSyncStatus(statusRes.data)
    } catch (error) {
      console.error('Error loading sync status:', error)
    }
  }

  const handleManualSync = async () => {
    setActionLoading('manual')
    try {
      await axiosAdmin.post('/admin/sync/manual', {
        language: config.syncLanguage,
        targetApiUrl: config.motoraldiaApiUrl
      })
      await loadSyncStatus()
    } catch (error) {
      console.error('Error starting manual sync:', error)
      alert('Error al iniciar sincronización manual')
    } finally {
      setActionLoading('')
    }
  }

  const handleIncrementalSync = async () => {
    setActionLoading('incremental')
    try {
      await axiosAdmin.post('/admin/sync/incremental', {
        language: config.syncLanguage,
        targetApiUrl: config.motoraldiaApiUrl
      })
      await loadSyncStatus()
    } catch (error) {
      console.error('Error starting incremental sync:', error)
      alert('Error al iniciar sincronización incremental')
    } finally {
      setActionLoading('')
    }
  }

  const handleImportJSON = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || file.type !== 'application/json') {
      alert('Por favor selecciona un archivo JSON válido')
      return
    }

    console.log('📁 Archivo seleccionado:', file.name, 'Tamaño:', file.size)
    setActionLoading('import')
    setImportResult(null)

    try {
      const fileText = await file.text()
      console.log('📄 Contenido del archivo leído, primeros 200 caracteres:', fileText.substring(0, 200))
      
      const vehiclesData = JSON.parse(fileText)
      console.log('🚗 Vehículos encontrados en el archivo:', vehiclesData.length)

      if (!Array.isArray(vehiclesData)) {
        throw new Error('El JSON debe contener un array de vehículos')
      }

      console.log('📡 Enviando datos a la API...')
      const response = await axiosAdmin.post('/vehicles/import-json', {
        vehiclesData,
        clearDatabase: false
      })

      console.log('📨 Respuesta de la API:', response.data)

      if (response.data.success) {
        setImportResult(response.data.data)
        alert(`Importación completada: ${response.data.data.imported} vehículos importados, ${response.data.data.skipped} omitidos`)
        await loadData() // Recargar los logs
      } else {
        throw new Error(response.data.error || 'Error desconocido')
      }

    } catch (error) {
      console.error('Error importing JSON:', error)
      alert(`Error al importar JSON: ${(error as Error).message}`)
    } finally {
      setActionLoading('')
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleSaveConfig = async () => {
    try {
      await axiosAdmin.put('/admin/sync/config', config)
      alert('Configuración guardada correctamente')
      setShowConfig(false)
    } catch (error) {
      console.error('Error saving config:', error)
      alert('Error al guardar configuración')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES')
  }

  const formatDuration = (duration: number | null) => {
    if (!duration) return 'N/A'
    const seconds = Math.floor(duration / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Sincronización Kars.ad</h1>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Sincronización Kars.ad</h1>
          <p className="text-gray-600">Sincronización hacia Motoraldia (solo idioma catalán)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Settings className="h-4 w-4" />
            <span>Configuración</span>
          </button>
          <button
            onClick={loadData}
            className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* Configuración */}
      {showConfig && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Sincronización</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL API Motoraldia
              </label>
              <input
                type="url"
                value={config.motoraldiaApiUrl}
                onChange={(e) => setConfig({...config, motoraldiaApiUrl: e.target.value})}
                placeholder="https://api.motoraldia.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                URL de la API de Motoraldia donde se sincronizarán los vehículos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Idioma de Sincronización
              </label>
              <select
                value={config.syncLanguage}
                onChange={(e) => setConfig({...config, syncLanguage: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ca">Catalán</option>
                <option value="es" disabled>Español (no disponible)</option>
                <option value="en" disabled>Inglés (no disponible)</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                Solo se sincronizarán vehículos en catalán hacia Motoraldia
              </p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={config.enableAutoSync}
                onChange={(e) => setConfig({...config, enableAutoSync: e.target.checked})}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Habilitar sincronización automática
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Guardar Configuración
              </button>
              <button
                onClick={() => setShowConfig(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estado Actual */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Estado Actual</h2>
        
        {syncStatus?.isRunning ? (
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <span className="text-sm font-medium text-blue-600">Sincronización en progreso...</span>
            </div>
            
            {syncStatus.currentSync && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-600">Tipo</p>
                  <p className="font-medium capitalize">{syncStatus.currentSync.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Procesados</p>
                  <p className="font-medium">{syncStatus.currentSync.vehiclesProcessed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Creados</p>
                  <p className="font-medium text-green-600">{syncStatus.currentSync.vehiclesCreated}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Actualizados</p>
                  <p className="font-medium text-blue-600">{syncStatus.currentSync.vehiclesUpdated}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm text-gray-700">
              Sin sincronización activa. Auto-sync: {config.enableAutoSync ? 'Activada' : 'Desactivada'}
            </span>
          </div>
        )}
      </div>

      {/* Acciones de Sincronización */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Acciones</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleManualSync}
            disabled={syncStatus?.isRunning || actionLoading === 'manual' || !config.motoraldiaApiUrl}
            className="flex items-center justify-center space-x-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {actionLoading === 'manual' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Iniciando...</span>
              </>
            ) : (
              <>
                <Download className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Sincronización Completa</div>
                  <div className="text-sm opacity-90">Todos los vehículos en catalán</div>
                </div>
              </>
            )}
          </button>

          <button
            onClick={handleIncrementalSync}
            disabled={syncStatus?.isRunning || actionLoading === 'incremental' || !config.motoraldiaApiUrl}
            className="flex items-center justify-center space-x-3 px-6 py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {actionLoading === 'incremental' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Iniciando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Sincronización Incremental</div>
                  <div className="text-sm opacity-90">Solo cambios recientes</div>
                </div>
              </>
            )}
          </button>

          <button
            onClick={handleImportJSON}
            disabled={syncStatus?.isRunning || actionLoading === 'import'}
            className="flex items-center justify-center space-x-3 px-6 py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            {actionLoading === 'import' ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Importando...</span>
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Importar desde JSON</div>
                  <div className="text-sm opacity-90">Subir archivo JSON</div>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Input file oculto */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {/* Resultado de importación */}
        {importResult && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Resultado de Importación JSON</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-green-600 font-medium">{importResult.imported}</span>
                <span className="text-gray-600"> importados</span>
              </div>
              <div>
                <span className="text-yellow-600 font-medium">{importResult.skipped}</span>
                <span className="text-gray-600"> omitidos</span>
              </div>
              <div>
                <span className="text-red-600 font-medium">{importResult.errors || 0}</span>
                <span className="text-gray-600"> errores</span>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Sincronización Completa:</strong> Envía todos los vehículos en catalán a Motoraldia</li>
                <li><strong>Sincronización Incremental:</strong> Solo cambios desde la última sincronización</li>
                <li><strong>Importar JSON:</strong> Carga vehículos desde archivo JSON a la base de datos local</li>
                <li>La sincronización requiere configurar la URL de destino</li>
                <li>La importación JSON omite vehículos existentes (mismo slug)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Historial de Sincronizaciones */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historial de Sincronizaciones</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehículos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duración
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize font-medium text-gray-900">{log.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={log.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-4">
                      <span className="text-green-600">+{log.vehiclesCreated}</span>
                      <span className="text-blue-600">~{log.vehiclesUpdated}</span>
                      {log.vehiclesDeleted > 0 && (
                        <span className="text-red-600">-{log.vehiclesDeleted}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDuration(log.duration)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.startedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No hay sincronizaciones registradas
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Las sincronizaciones aparecerán aquí cuando se ejecuten.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
    running: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Activity },
    failed: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
  }

  const { bg, text, icon: Icon } = config[status as keyof typeof config] || config.pending

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  )
}