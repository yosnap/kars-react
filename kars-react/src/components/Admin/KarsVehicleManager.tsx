import { useState, useEffect } from 'react'
import { 
  Car, 
  Search,
  Upload,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Clock,
  ExternalLink,
  Plus,
  Eye,
  Edit3
} from 'lucide-react'
import { axiosAdmin } from '../../api/axiosClient'

interface KarsVehicle {
  id: string
  slug: string
  titolAnunci: string
  tipusVehicle: string
  marcaCotxe: string | null
  marcaMoto: string | null
  preu: string
  quilometratge: string
  any: string
  anunciActiu: boolean
  anunciDestacat: number
  venut: boolean
  dataCreacio: string
  
  // Kars.ad specific fields
  needsSync: boolean
  motoraldiaVehicleId: string | null
  syncedToMotoraldiaAt: string | null
  syncError: string | null
  userId: string
}

interface KarsVehicleStats {
  totalVehicles: number
  karsVehicles: number
  pendingSync: number
  syncedVehicles: number
  syncErrors: number
  lastSyncedVehicle: string | null
}

export default function KarsVehicleManager() {
  const [vehicles, setVehicles] = useState<KarsVehicle[]>([])
  const [stats, setStats] = useState<KarsVehicleStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterSync, setFilterSync] = useState('all') // all, pending, synced, errors
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadVehicles()
    loadStats()
  }, [currentPage, filterSync, searchTerm])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      
      const params: Record<string, any> = {
        page: currentPage,
        per_page: 20,
        'anunci-actiu': true // Filter only active ads for Kars.ad
      }
      
      if (searchTerm) params.search = searchTerm

      const response = await axiosAdmin.get('/vehicles', { params })
      const data = response.data

      // Filter to only show Kars.ad vehicles (userId 113) on frontend
      const karsVehicles = (data.items || []).filter((v: any) => v.userId === '113')
      setVehicles(karsVehicles)
      setTotalPages(Math.ceil(karsVehicles.length / params.per_page) || 1)
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await axiosAdmin.get('/vehicles/kars/stats')
      setStats(response.data.data)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleSyncToMotoraldia = async (vehicleId: string) => {
    setSyncingIds(prev => new Set(prev).add(vehicleId))
    
    try {
      const response = await axiosAdmin.post(`/vehicles/${vehicleId}/sync-to-motoraldia`)
      
      if (response.data.success) {
        alert('Vehicle sincronitzat correctament a Motoraldia!')
      } else {
        alert(`Error: ${response.data.message}`)
      }
      
      await loadVehicles()
      await loadStats()
    } catch (error: any) {
      console.error('Error syncing vehicle:', error)
      alert(`Error al sincronitzar: ${error.response?.data?.message || 'Error desconegut'}`)
    } finally {
      setSyncingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(vehicleId)
        return newSet
      })
    }
  }

  const handleBulkSync = async () => {
    const pendingVehicles = vehicles.filter(v => v.needsSync)
    
    if (pendingVehicles.length === 0) {
      alert('No hi ha vehicles pendents de sincronització')
      return
    }

    if (!confirm(`Sincronitzar ${pendingVehicles.length} vehicles a Motoraldia?`)) {
      return
    }

    for (const vehicle of pendingVehicles) {
      await handleSyncToMotoraldia(vehicle.id)
      // Small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const getSyncStatusIcon = (vehicle: KarsVehicle) => {
    if (vehicle.syncError) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    if (vehicle.motoraldiaVehicleId && vehicle.syncedToMotoraldiaAt) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    if (vehicle.needsSync) {
      return <Clock className="h-4 w-4 text-orange-500" />
    }
    return <RotateCcw className="h-4 w-4 text-gray-400" />
  }

  const getSyncStatusText = (vehicle: KarsVehicle) => {
    if (vehicle.syncError) return 'Error'
    if (vehicle.motoraldiaVehicleId) return 'Sincronitzat'
    if (vehicle.needsSync) return 'Pendent'
    return 'No cal'
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Mai'
    return new Date(dateString).toLocaleDateString('ca-ES')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestió de Vehicles Kars.ad
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vehicles del usuari info@kars.ad amb sincronització a Motoraldia
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            Sync Pendents
          </button>
          <button
            onClick={() => window.open('/add-vehicle', '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Nou Vehicle
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                <p className="text-xl font-bold">{stats.karsVehicles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pendents</p>
                <p className="text-xl font-bold">{stats.pendingSync}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Sincronitzats</p>
                <p className="text-xl font-bold">{stats.syncedVehicles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Errors</p>
                <p className="text-xl font-bold">{stats.syncErrors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center gap-3">
              <ExternalLink className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Última Sync</p>
                <p className="text-sm font-medium">
                  {formatDate(stats.lastSyncedVehicle)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Buscar vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
        
        <select
          value={filterSync}
          onChange={(e) => setFilterSync(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="all">Tots els vehicles</option>
          <option value="pending">Pendents sincronització</option>
          <option value="synced">Sincronitzats</option>
          <option value="errors">Amb errors</option>
        </select>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Detalls
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estat Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Última Sync
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Accions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {vehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Car className="h-8 w-8 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {vehicle.titolAnunci}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {vehicle.tipusVehicle} • {vehicle.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {vehicle.preu}€
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {vehicle.any} • {vehicle.quilometratge}km
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {getSyncStatusIcon(vehicle)}
                      <span className="text-sm text-gray-900 dark:text-white">
                        {getSyncStatusText(vehicle)}
                      </span>
                    </div>
                    {vehicle.motoraldiaVehicleId && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ID: {vehicle.motoraldiaVehicleId}
                      </div>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(vehicle.syncedToMotoraldiaAt)}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {vehicle.needsSync && (
                        <button
                          onClick={() => handleSyncToMotoraldia(vehicle.id)}
                          disabled={syncingIds.has(vehicle.id)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          <Upload className="h-3 w-3" />
                          {syncingIds.has(vehicle.id) ? 'Sync...' : 'Sync'}
                        </button>
                      )}
                      
                      <button
                        onClick={() => window.open(`/vehicle/${vehicle.slug}`, '_blank')}
                        className="flex items-center gap-1 px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                      >
                        <Eye className="h-3 w-3" />
                        Veure
                      </button>

                      <button className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                        <Edit3 className="h-3 w-3" />
                        Editar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {vehicles.length === 0 && !loading && (
          <div className="text-center py-12">
            <Car className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No hi ha vehicles
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Comença creant el primer vehicle.
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              Anterior
            </button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Pàgina {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
            >
              Següent
            </button>
          </div>
        </div>
      )}
    </div>
  )
}