import { useState } from 'react'
import { Download, Upload, Database, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { axiosAdmin } from '../../api/axiosClient'

interface BackupInfo {
  filename: string
  size: string
  createdAt: string
  tables: string[]
  recordCounts: Record<string, number>
}

export default function DatabaseBackup() {
  const [creating, setCreating] = useState(false)
  const [restoring, setRestoring] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info')
  const [backupInfo, setBackupInfo] = useState<BackupInfo | null>(null)

  const showMessage = (text: string, type: 'success' | 'error' | 'info') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const handleCreateBackup = async () => {
    setCreating(true)
    try {
      const response = await axiosAdmin.post('/admin/database/backup')
      const result = response.data
      
      setBackupInfo(result)
      showMessage('Backup creado exitosamente', 'success')
      
      // Iniciar descarga automática
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error: any) {
      console.error('Error creating backup:', error)
      showMessage(error.response?.data?.message || 'Error al crear backup', 'error')
    } finally {
      setCreating(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.json')) {
      showMessage('Por favor selecciona un archivo JSON válido', 'error')
      return
    }

    if (!confirm('⚠️ ADVERTENCIA: Esta acción reemplazará TODOS los datos actuales de la base de datos. ¿Estás seguro de continuar?')) {
      event.target.value = ''
      return
    }

    setRestoring(true)
    try {
      const text = await file.text()
      const backupData = JSON.parse(text)
      
      // Validar estructura del backup
      if (!backupData.metadata || !backupData.data) {
        throw new Error('Archivo de backup inválido')
      }
      
      await axiosAdmin.post('/admin/database/restore', backupData)
      showMessage('Base de datos restaurada exitosamente. El sistema se reiniciará.', 'success')
      
      // Opcional: Recargar la página después de unos segundos
      setTimeout(() => {
        window.location.reload()
      }, 3000)
      
    } catch (error: any) {
      console.error('Error restoring backup:', error)
      showMessage(
        error.response?.data?.message || 'Error al restaurar backup. Verifica que el archivo sea válido.',
        'error'
      )
    } finally {
      setRestoring(false)
      // Reset input
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Backup de Base de Datos</h2>
          <p className="text-gray-600">Gestión de copias de seguridad para Kars.ad</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Database className="h-4 w-4" />
          <span>PostgreSQL</span>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-start space-x-3 ${
          messageType === 'success' ? 'bg-green-50 border border-green-200' :
          messageType === 'error' ? 'bg-red-50 border border-red-200' :
          'bg-blue-50 border border-blue-200'
        }`}>
          {messageType === 'success' && <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />}
          {messageType === 'error' && <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />}
          {messageType === 'info' && <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />}
          <span className={`text-sm ${
            messageType === 'success' ? 'text-green-800' :
            messageType === 'error' ? 'text-red-800' :
            'text-blue-800'
          }`}>
            {message}
          </span>
        </div>
      )}

      {/* Create Backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 mb-4">
          <Download className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Crear Backup</h3>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">
          Crea una copia de seguridad completa de la base de datos incluyendo todos los vehículos de Kars.ad, 
          usuarios, configuraciones de sincronización y logs del sistema.
        </p>

        <button
          onClick={handleCreateBackup}
          disabled={creating}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium"
        >
          {creating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Creando backup...</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              <span>Crear y Descargar Backup</span>
            </>
          )}
        </button>

        {backupInfo && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-3">Último backup creado:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Archivo:</strong> {backupInfo.filename}</p>
              <p><strong>Tamaño:</strong> {backupInfo.size}</p>
              <p><strong>Fecha:</strong> {new Date(backupInfo.createdAt).toLocaleString('es-ES')}</p>
              <p><strong>Tablas incluidas:</strong> {backupInfo.tables.join(', ')}</p>
              <div className="mt-3">
                <strong>Registros por tabla:</strong>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {Object.entries(backupInfo.recordCounts).map(([table, count]) => (
                    <div key={table} className="flex justify-between bg-white px-3 py-1 rounded">
                      <span className="capitalize">{table}:</span>
                      <span className="font-mono font-medium">{count.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Restore Backup */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-3 mb-4">
          <Upload className="h-5 w-5 text-orange-600" />
          <h3 className="text-lg font-medium text-gray-900">Restaurar Backup</h3>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="text-sm text-red-800">
              <p className="font-medium mb-2">⚠️ PELIGRO - Operación Destructiva</p>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Esta acción reemplazará TODOS los datos actuales</strong></li>
                <li>Se eliminarán todos los vehículos, usuarios y configuraciones</li>
                <li>El proceso no se puede deshacer</li>
                <li>Crea un backup actual antes de proceder</li>
                <li>El sistema puede necesitar reiniciarse</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar archivo de backup (.json)
            </label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              disabled={restoring}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100 disabled:opacity-50"
            />
            <p className="text-xs text-gray-500 mt-1">
              Solo archivos JSON generados por esta herramienta de backup
            </p>
          </div>

          {restoring && (
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
              <div className="text-sm text-blue-800">
                <p className="font-medium">Restaurando base de datos...</p>
                <p>Este proceso puede tardar varios minutos. No cierres esta ventana.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Additional Info */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-3 mb-3">
          <Clock className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-medium text-blue-900">Mejores Prácticas</h3>
        </div>
        
        <div className="text-sm text-blue-800 space-y-2">
          <p><strong>📅 Frecuencia:</strong> Crea backups antes de sincronizaciones importantes</p>
          <p><strong>💾 Almacenamiento:</strong> Guarda backups en múltiples ubicaciones seguras</p>
          <p><strong>🧪 Pruebas:</strong> Verifica regularmente que los backups se pueden restaurar</p>
          <p><strong>🔄 Automatización:</strong> Considera configurar backups automáticos programados</p>
          <p><strong>🚨 Emergencias:</strong> Mantén siempre un backup reciente antes de cambios importantes</p>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Database className="h-4 w-4" />
          <span>Los backups incluyen: Vehículos, Usuarios, Configuración, Logs de Sincronización</span>
        </div>
      </div>
    </div>
  )
}