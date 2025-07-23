import React, { useState, useEffect, useRef } from 'react';
import { 
  Car, 
  Plus, 
  Edit, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  ChevronDown,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import { axiosAdmin } from '../../api/axiosClient';
import * as Popover from '@radix-ui/react-popover';

interface Vehicle {
  id: string;
  slug: string;
  'titol-anunci': string;
  'tipus-vehicle': string;
  'marca-cotxe'?: string;
  'marca-moto'?: string;
  'models-cotxe'?: string;
  'models-moto'?: string;
  preu: number | string;
  any: string;
  quilometratge: string;
  'anunci-actiu': string;
  venut: string;
  'anunci-destacat': string;
  'data-creacio': string;
  'imatge-destacada-url'?: string;
  'estat-vehicle'?: string;
}

interface SelectOption {
  value: string;
  label: string;
  count?: number;
}

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
}

const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onValueChange,
  placeholder
}) => {
  const [open, setOpen] = useState(false);
  const selectedOption = options.find(option => option.value === value);

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          className="flex h-10 w-full items-center justify-between rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:ring-offset-gray-950 dark:placeholder:text-gray-400 dark:focus:ring-blue-400"
          role="combobox"
          aria-expanded={open}
        >
          <span className={selectedOption ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </Popover.Trigger>
      <Popover.Content className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <div className="max-h-60 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option.value}
                className="relative flex w-full cursor-pointer select-none items-center rounded-sm px-3 py-2 text-sm outline-none hover:bg-gray-100 dark:hover:bg-gray-700 focus:bg-gray-100 dark:focus:bg-gray-700"
                onClick={() => {
                  onValueChange(option.value);
                  setOpen(false);
                }}
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    value === option.value ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span className="flex-1 text-left">
                  {option.label}
                  {option.count !== undefined && (
                    <span className="text-gray-500 dark:text-gray-400 ml-2">
                      ({option.count.toLocaleString()})
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Popover.Content>
    </Popover.Root>
  );
};

const KarsVehicles = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [venutFilter, setVenutFilter] = useState('all');
  const [estatVehicleFilter, setEstatVehicleFilter] = useState('all');
  const [anunciActiuFilter, setAnunciActiuFilter] = useState('all');
  const [anunciDestacatFilter, setAnunciDestacatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [filterCounts, setFilterCounts] = useState<any>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVehicles = async (page = 1) => {
    try {
      setLoading(true);
      const params: any = {
        page,
        per_page: 20,
        orderby: sortBy === 'date' ? 'date' : sortBy === 'name' ? 'title' : sortBy === 'price' ? 'price' : 'date',
        order: sortOrder.toUpperCase(),
        facets: true  // Solicitar facets con los resultados
      };

      // Aplicar filtros
      if (typeFilter !== 'all') {
        params['tipus-vehicle'] = typeFilter;
      }

      if (venutFilter !== 'all') {
        params.venut = venutFilter === 'true' ? 'true' : 'false';
      }

      if (estatVehicleFilter !== 'all') {
        params['estat-vehicle'] = estatVehicleFilter;
      }

      if (anunciActiuFilter !== 'all') {
        params['anunci-actiu'] = anunciActiuFilter === 'true' ? 'true' : 'false';
      }

      if (anunciDestacatFilter !== 'all') {
        params['anunci-destacat'] = anunciDestacatFilter;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await axiosAdmin.get('/vehicles', { params });
      setVehicles(response.data.items || []);
      setTotalPages(response.data.pages || 1);
      setTotalVehicles(response.data.total || 0);
      setCurrentPage(page);
      
      // Actualizar conteos de filtros si están disponibles
      if (response.data.facets) {
        setFilterCounts(response.data.facets);
      }
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


  const handleCreateVehicle = () => {
    navigate('/admin/vehicles/create');
  };

  const handleEditVehicle = (vehicleId: string) => {
    navigate(`/admin/vehicles/edit/${vehicleId}`);
  };

  const handleImportJson = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== 'application/json') {
      toast.error('Si us plau selecciona un arxiu JSON vàlid');
      return;
    }

    setImportStatus('running');
    try {
      const fileText = await file.text();
      const vehiclesData = JSON.parse(fileText);

      if (!Array.isArray(vehiclesData)) {
        throw new Error('El JSON ha de contenir un array de vehicles');
      }

      const response = await axiosAdmin.post('/vehicles/import-json', {
        vehiclesData,
        clearDatabase: false
      });

      if (response.data.success) {
        setImportStatus('success');
        toast.success(`✅ Importació completada: ${response.data.data.imported} importats, ${response.data.data.skipped} omesos`);
        await loadVehicles(currentPage); // Recargar vehículos
      } else {
        throw new Error(response.data.error || 'Error desconegut');
      }
    } catch (error) {
      console.error('Error during JSON import:', error);
      setImportStatus('error');
      
      if (error instanceof Error) {
        toast.error(`❌ Error en la importació: ${error.message}`);
      } else {
        toast.error('❌ Error desconegut en la importació');
      }
    } finally {
      // Limpiar el input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Reset status after 3 seconds
      setTimeout(() => setImportStatus('idle'), 3000);
    }
  };

  const handleDownloadJson = async () => {
    try {
      const response = await axiosAdmin.get('/vehicles/json?format=full&limit=5000');
      const jsonData = response.data;
      
      // Crear y descargar archivo JSON
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kars-vehicles-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success(`✅ Descarregat JSON amb ${jsonData.total} vehicles`);
    } catch (error) {
      console.error('Error downloading JSON:', error);
      toast.error('❌ Error descarregant el JSON');
    }
  };

  // Función para cargar conteos de filtros
  const loadFilterCounts = async () => {
    try {
      const response = await axiosAdmin.get('/vehicles', { 
        params: { 
          per_page: 1, 
          facets: true 
        } 
      });
      if (response.data.facets) {
        setFilterCounts(response.data.facets);
      }
    } catch (error) {
      console.error('Error loading filter counts:', error);
    }
  };

  useEffect(() => {
    loadVehicles();
    loadFilterCounts();
  }, []);

  // Recargar cuando cambien los filtros (filtrado automático)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadVehicles(1); // Resetear a página 1 cuando cambien filtros
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, venutFilter, estatVehicleFilter, anunciActiuFilter, anunciDestacatFilter, sortBy, sortOrder]);

  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    if (!numPrice || numPrice === 0) return 'A consultar';
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(numPrice);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    }).replace(/\//g, '/');
  };

  const getBrandName = (vehicle: Vehicle) => {
    return vehicle['marca-cotxe'] || vehicle['marca-moto'] || 'N/A';
  };

  const getModelName = (vehicle: Vehicle) => {
    return vehicle['models-cotxe'] || vehicle['models-moto'] || 'N/A';
  };

  // Helper para obtener conteo de un filtro
  const getFilterCount = (filterKey: string, value: string) => {
    if (!filterCounts[filterKey]) return 0;
    
    // Para campos booleanos, el backend puede devolver "true"/"false" como strings
    // mientras que nuestros valores de filtro son strings
    let count = filterCounts[filterKey][value];
    
    // Si no encontramos el valor directamente y es un valor booleano, intentar alternativas
    if (count === undefined && (value === 'true' || value === 'false')) {
      // Intentar con el valor booleano
      const boolValue = value === 'true';
      count = filterCounts[filterKey][boolValue.toString()];
    }
    
    return count !== undefined ? count : 0;
  };

  // Helper para crear opciones para SearchableSelect
  const createSelectOptions = (filterKey: string, staticOptions: { value: string; label: string }[]): SelectOption[] => {
    return staticOptions.map(opt => {
      if (opt.value === 'all') {
        return opt; // No mostrar conteo para "Tots"
      }
      return {
        ...opt,
        count: getFilterCount(filterKey, opt.value)
      };
    });
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
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Total: <strong>{totalVehicles.toLocaleString()}</strong> vehicles</span>
              <span>Pàgina: <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
              <span>Veient <strong>{vehicles.length}</strong> d'un total de <strong>{totalVehicles.toLocaleString()}</strong></span>
            </div>
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
            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              Descarregar JSON
            </button>
            <button
              onClick={handleImportJson}
              disabled={importStatus === 'running'}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                importStatus === 'running'
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {importStatus === 'running' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              {importStatus === 'running' ? 'Important...' : 'Importar JSON'}
            </button>
            <button 
              onClick={handleCreateVehicle}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nou Vehicle
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Filtros</h3>
            </div>
            
            {/* Filter Rows */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search Input */}
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cercar vehicles per títol, marca o model..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              {/* Sort By */}
              <SearchableSelect
                options={[
                  { value: 'date', label: 'Ordenar per Data' },
                  { value: 'name', label: 'Ordenar per Nom' },
                  { value: 'price', label: 'Ordenar per Preu' }
                ]}
                value={sortBy}
                onValueChange={setSortBy}
                placeholder="Selecciona ordre"
              />

              {/* Sort Order */}
              <SearchableSelect
                options={[
                  { value: 'desc', label: 'Descendent' },
                  { value: 'asc', label: 'Ascendent' }
                ]}
                value={sortOrder}
                onValueChange={setSortOrder}
                placeholder="Selecciona direcció"
              />
            </div>

            {/* Second Row of Filters */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Vehicle Type Filter */}
              <SearchableSelect
                options={createSelectOptions('tipus-vehicle', [
                  { value: 'all', label: 'Tots els tipus' },
                  { value: 'cotxe', label: 'Cotxes' },
                  { value: 'moto', label: 'Motos' },
                  { value: 'autocaravana-camper', label: 'Autocaravanes' },
                  { value: 'vehicle-comercial', label: 'Vehicles Comercials' }
                ])}
                value={typeFilter}
                onValueChange={setTypeFilter}
                placeholder="Selecciona tipus de vehicle"
              />

              {/* Venut Filter */}
              <SearchableSelect
                options={createSelectOptions('venut', [
                  { value: 'all', label: 'Venut - Tots' },
                  { value: 'false', label: 'No venut' },
                  { value: 'true', label: 'Venut' }
                ])}
                value={venutFilter}
                onValueChange={setVenutFilter}
                placeholder="Selecciona estat de venda"
              />

              {/* Estat Vehicle Filter */}
              <SearchableSelect
                options={createSelectOptions('estat-vehicle', [
                  { value: 'all', label: 'Estat - Tots' },
                  { value: 'nou', label: 'Nou' },
                  { value: 'seminou', label: 'Seminou' },
                  { value: 'ocasio', label: 'Ocasió' },
                  { value: 'km0', label: 'Km0' }
                ])}
                value={estatVehicleFilter}
                onValueChange={setEstatVehicleFilter}
                placeholder="Selecciona estat del vehicle"
              />

              {/* Anunci Actiu Filter */}
              <SearchableSelect
                options={createSelectOptions('anunci-actiu', [
                  { value: 'all', label: 'Actiu - Tots' },
                  { value: 'true', label: 'Actiu' },
                  { value: 'false', label: 'Inactiu' }
                ])}
                value={anunciActiuFilter}
                onValueChange={setAnunciActiuFilter}
                placeholder="Selecciona estat d'activitat"
              />

              {/* Anunci Destacat Filter */}
              <SearchableSelect
                options={createSelectOptions('anunci-destacat', [
                  { value: 'all', label: 'Destacat - Tots' },
                  { value: '0', label: 'No destacat' },
                  { value: '1', label: 'Destacat' }
                ])}
                value={anunciDestacatFilter}
                onValueChange={setAnunciDestacatFilter}
                placeholder="Selecciona si és destacat"
              />

              {/* Clear Filters Button */}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setVenutFilter('all');
                  setEstatVehicleFilter('all');
                  setAnunciActiuFilter('all');
                  setAnunciDestacatFilter('all');
                  setSortBy('date');
                  setSortOrder('desc');
                }}
                className="px-4 py-2 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
              >
                Netejar tot
              </button>
            </div>
          </div>
        </div>

        {/* Vehicle List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full overflow-x-auto">
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
                <div className="col-span-3">Vehicle</div>
                <div className="col-span-1">Preu</div>
                <div className="col-span-1">Data Alta</div>
                <div className="col-span-2">Marca i Model</div>
                <div className="col-span-1">Estat</div>
                <div className="col-span-1">Destacat</div>
                <div className="col-span-1">Actiu</div>
                <div className="col-span-1">Venut</div>
                <div className="col-span-1">Accions</div>
              </div>

              {/* Vehicle Rows */}
              {vehicles.map((vehicle) => (
                <div key={vehicle.id} className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  {/* Vehicle Info */}
                  <div className="col-span-3 flex gap-3">
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
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize mt-1">
                        {vehicle['tipus-vehicle']}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {vehicle.any} • {vehicle.quilometratge} km
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatPrice(vehicle.preu)}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(vehicle['data-creacio'])}
                    </span>
                  </div>

                  {/* Marca i Model */}
                  <div className="col-span-2 flex items-center">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {getBrandName(vehicle)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {getModelName(vehicle)}
                      </p>
                    </div>
                  </div>

                  {/* Estat Vehicle */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-sm text-gray-900 dark:text-white capitalize">
                      {vehicle['estat-vehicle'] || 'N/A'}
                    </span>
                  </div>

                  {/* Destacat */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {vehicle['anunci-destacat'] !== '0' ? 'Sí' : 'No'}
                    </span>
                  </div>

                  {/* Actiu */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {vehicle['anunci-actiu'] === 'true' ? 'Sí' : 'No'}
                    </span>
                  </div>

                  {/* Venut */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {vehicle.venut === 'true' ? 'Sí' : 'No'}
                    </span>
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
                        onClick={() => handleEditVehicle(vehicle.id)}
                        className="p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
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

      {/* Hidden file input for JSON import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileImport}
        className="hidden"
      />
    </AdminLayout>
  );
};

export default KarsVehicles;