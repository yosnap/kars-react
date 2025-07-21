import React, { useState, useEffect } from 'react';
import { 
  Car, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  MapPin
} from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import { axiosAdmin } from '../../api/axiosClient';

interface Vehicle {
  id: string;
  slug: string;
  'titol-anunci': string;
  'tipus-vehicle': string;
  'marca-cotxe'?: string;
  'marca-moto'?: string;
  'models-cotxe'?: string;
  'models-moto'?: string;
  preu: string;
  any: string;
  quilometratge: string;
  'anunci-actiu': string;
  venut: string;
  'anunci-destacat': string;
  'data-creacio': string;
  'imatge-destacada-url'?: string;
}

const KarsVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        per_page: 20,
        orderby: 'date',
        order: 'DESC'
      };

      // Aplicar filtros
      if (statusFilter !== 'all') {
        if (statusFilter === 'active') {
          params['anunci-actiu'] = 'true';
        } else if (statusFilter === 'inactive') {
          params['anunci-actiu'] = 'false';
        } else if (statusFilter === 'sold') {
          params.venut = 'true';
        }
      }

      if (typeFilter !== 'all') {
        params['tipus-vehicle'] = typeFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosAdmin.get('/vehicles', { params });
      setVehicles(response.data.items || []);
      setTotalPages(response.data.pages || 1);
      setCurrentPage(page);
    } catch (err) {
      setError('Error al carregar els vehicles');
      console.error('Error loading vehicles:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadVehicles(currentPage);
    setIsRefreshing(false);
  };

  const toggleVehicleStatus = async (vehicleId: string, currentStatus: boolean) => {
    try {
      await axiosAdmin.patch(`/vehicles/${vehicleId}`, {
        'anunci-actiu': !currentStatus
      });
      await loadVehicles(currentPage);
    } catch (err) {
      console.error('Error updating vehicle status:', err);
    }
  };

  const deleteVehicle = async (vehicleId: string) => {
    if (!confirm('Estàs segur que vols eliminar aquest vehicle?')) return;
    
    try {
      await axiosAdmin.delete(`/vehicles/${vehicleId}`);
      await loadVehicles(currentPage);
    } catch (err) {
      console.error('Error deleting vehicle:', err);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const formatPrice = (price: string) => {
    if (!price || price === '0') return 'A consultar';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(parseFloat(price));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getBrandName = (vehicle: Vehicle) => {
    return vehicle['marca-cotxe'] || vehicle['marca-moto'] || 'N/A';
  };

  const getModelName = (vehicle: Vehicle) => {
    return vehicle['models-cotxe'] || vehicle['models-moto'] || 'N/A';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vehicles Kars.ad
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona els vehicles de la plataforma
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualitzar
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" />
              Nou Vehicle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Cercar vehicles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && loadVehicles()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setTimeout(() => loadVehicles(), 100);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tots els estats</option>
              <option value="active">Actius</option>
              <option value="inactive">Inactius</option>
              <option value="sold">Venuts</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setTimeout(() => loadVehicles(), 100);
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tots els tipus</option>
              <option value="cotxe">Cotxes</option>
              <option value="moto">Motos</option>
              <option value="autocaravana-camper">Autocaravanes</option>
              <option value="vehicle-comercial">Vehicles Comercials</option>
            </select>

            <button
              onClick={() => loadVehicles()}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">{error}</div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No s'han trobat vehicles</p>
            </div>
          ) : (
            <>
              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                <div className="col-span-4">Vehicle</div>
                <div className="col-span-2">Tipus</div>
                <div className="col-span-2">Preu</div>
                <div className="col-span-2">Data</div>
                <div className="col-span-1">Estat</div>
                <div className="col-span-1">Accions</div>
              </div>

              {/* Vehicle Rows */}
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Vehicle Info */}
                  <div className="col-span-4 flex gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {vehicle['imatge-destacada-url'] ? (
                        <img 
                          src={vehicle['imatge-destacada-url']} 
                          alt={vehicle['titol-anunci']}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {vehicle['titol-anunci']}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {getBrandName(vehicle)} {getModelName(vehicle)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {vehicle.any} • {vehicle.quilometratge} km
                      </p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="col-span-2 flex items-center">
                    <span className="capitalize text-sm text-gray-600 dark:text-gray-400">
                      {vehicle['tipus-vehicle']}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 flex items-center">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatPrice(vehicle.preu)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(vehicle['data-creacio'])}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex flex-col gap-1">
                      {vehicle.venut === 'true' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                          Venut
                        </span>
                      ) : vehicle['anunci-actiu'] === 'true' ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                          Actiu
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                          Inactiu
                        </span>
                      )}
                      {vehicle['anunci-destacat'] !== '0' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
                          Destacat
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center">
                    <div className="flex gap-1">
                      <a
                        href={`/vehicle/${vehicle.slug}`}
                        target="_blank"
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded"
                        title="Veure"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => toggleVehicleStatus(vehicle.id, vehicle['anunci-actiu'] === 'true')}
                        className={`p-1 rounded ${
                          vehicle['anunci-actiu'] === 'true' 
                            ? 'text-red-600 hover:text-red-800 hover:bg-red-100' 
                            : 'text-green-600 hover:text-green-800 hover:bg-green-100'
                        }`}
                        title={vehicle['anunci-actiu'] === 'true' ? 'Desactivar' : 'Activar'}
                      >
                        {vehicle['anunci-actiu'] === 'true' ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteVehicle(vehicle.id)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2">
            <button
              onClick={() => loadVehicles(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Anterior
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
              Pàgina {currentPage} de {totalPages}
            </span>
            
            <button
              onClick={() => loadVehicles(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Següent
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default KarsVehicles;