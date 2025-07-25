import { useState, useEffect } from 'react';
import { 
  Car, 
  Database, 
  Plus,
  Loader2,
  Info,
  Truck,
  Bike,
  Home,
  BarChart3,
  Building2,
  FileText,
  Calendar
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { VERSION_INFO } from '../../config/version';
import AdminLayout from '../../components/Admin/AdminLayout';
import { axiosAdmin } from '../../api/axiosClient';

interface SystemInfo {
  apiVersion: string;
  frontendVersion: string;
  environment: string;
  databaseStatus: string;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    apiVersion: 'unknown',
    frontendVersion: VERSION_INFO.version,
    environment: VERSION_INFO.environment,
    databaseStatus: 'unknown'
  });
  const [vehicleStats, setVehicleStats] = useState({
    total: 0,
    sold: 0,
    available: 0,
    active: 0,
    inactive: 0,
    loading: true
  });

  const [detailedStats, setDetailedStats] = useState({
    byType: {
      cotxe: 0,
      moto: 0,
      'autocaravana-camper': 0,
      'vehicle-comercial': 0
    },
    byBrand: {
      cotxe: [],
      moto: [],
      'autocaravana-camper': [],
      'vehicle-comercial': []
    },
    totalBrands: {
      cotxe: 0,
      moto: 0,
      'autocaravana-camper': 0,
      'vehicle-comercial': 0
    },
    totalModels: {
      cotxe: 0,
      moto: 0,
      'autocaravana-camper': 0,
      'vehicle-comercial': 0
    },
    loading: true
  });

  // Función para obtener información del sistema desde la API
  const fetchSystemInfo = async () => {
    try {
      console.log('🔍 Fetching system info from API...');
      const response = await axiosAdmin.get('/system/info');
      const apiData = response.data;
      
      console.log('📊 System info received:', apiData);
      
      setSystemInfo({
        apiVersion: apiData.api?.version || 'unknown',
        frontendVersion: VERSION_INFO.version,
        environment: apiData.environment?.nodeEnv || VERSION_INFO.environment,
        databaseStatus: apiData.database?.status || 'unknown'
      });
      
    } catch (error) {
      console.error('❌ Error fetching system info:', error);
    }
  };

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
      console.log('🔍 Debug basic stats:');
      console.log('- Total vehicles:', totalData.total, 'from API call:', '/vehicles?per_page=1');
      console.log('- Sold vehicles:', soldData.total, 'from API call:', '/vehicles?per_page=1&venut=true');
      console.log('- Available vehicles:', availableData.total, 'from API call:', '/vehicles?per_page=1&anunci-actiu=true&venut=false');
      console.log('- Active vehicles:', activeData.total, 'from API call:', '/vehicles?per_page=1&anunci-actiu=true');
      console.log('- Inactive vehicles:', inactiveData.total, 'from API call:', '/vehicles?per_page=1&anunci-actiu=false');
      
    } catch (error) {
      console.error('❌ Error fetching vehicle stats:', error);
      setVehicleStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Función para obtener estadísticas detalladas
  const fetchDetailedStats = async () => {
    try {
      console.log('🔍 Fetching detailed stats...');
      setDetailedStats(prev => ({ ...prev, loading: true }));
      
      // Llamadas en paralelo para estadísticas por tipo (usando los parámetros correctos)
      const [cotxeResponse, motoResponse, autocaravanaResponse, comercialResponse, totalResponse] = await Promise.all([
        axiosAdmin.get('/vehicles?per_page=1&tipus-vehicle=cotxe'),
        axiosAdmin.get('/vehicles?per_page=1&tipus-vehicle=moto'),
        axiosAdmin.get('/vehicles?per_page=1&tipus-vehicle=autocaravana-camper'),
        axiosAdmin.get('/vehicles?per_page=1&tipus-vehicle=vehicle-comercial'),
        axiosAdmin.get('/vehicles?per_page=1') // Total sin filtro para comparar
      ]);
      
      // Usar los mismos endpoints que ya funcionan en KarsVehicles
      const [brandsResponse, vehiclesWithFacetsResponse] = await Promise.all([
        axiosAdmin.get('/brands'), // Todas las marcas con conteo de modelos
        axiosAdmin.get('/vehicles?per_page=10') // Obtener facets para conteos
      ]);
      
      const allBrands = brandsResponse.data?.data || [];
      const facets = vehiclesWithFacetsResponse.data?.facets || {};
      
      // Como solo tienes coches (150), usar una aproximación simple hasta encontrar el campo correcto
      // Temporalmente: asumir que todas las marcas son de coches si no encontramos el campo vehicleTypes
      const hasVehicleTypesField = allBrands.length > 0 && allBrands[0].vehicleTypes !== undefined;
      
      let cotxeBrands, motoBrands, cotxeModelsCount, motoModelsCount;
      
      if (hasVehicleTypesField) {
        // Usar el filtrado normal si existe el campo
        cotxeBrands = allBrands.filter((brand: any) => 
          brand.vehicleTypes && brand.vehicleTypes.includes('cotxe')
        );
        motoBrands = allBrands.filter((brand: any) => 
          brand.vehicleTypes && brand.vehicleTypes.includes('moto')
        );
        cotxeModelsCount = cotxeBrands.reduce((sum: number, brand: any) => 
          sum + (brand._count?.models || 0), 0
        );
        motoModelsCount = motoBrands.reduce((sum: number, brand: any) => 
          sum + (brand._count?.models || 0), 0
        );
      } else {
        // Fallback: como solo hay coches, contar todas las marcas como de coches
        cotxeBrands = allBrands;
        motoBrands = [];
        cotxeModelsCount = allBrands.reduce((sum: number, brand: any) => 
          sum + (brand.modelCount || brand._count?.models || 0), 0
        );
        motoModelsCount = 0;
      }
      
      console.log('🔍 Debug brands and models:');
      console.log('- Total brands from /brands:', allBrands.length);
      console.log('- Sample brand structure:', allBrands[0]);
      console.log('- All fields in first brand:', Object.keys(allBrands[0] || {}));
      console.log('- Has vehicleTypes field?', hasVehicleTypesField);
      console.log('- Using fallback logic?', !hasVehicleTypesField);
      console.log('- Cotxe brands:', cotxeBrands.length);
      console.log('- Moto brands:', motoBrands.length);
      console.log('- Cotxe models total:', cotxeModelsCount);
      console.log('- Moto models total:', motoModelsCount);
      
      // Si solo tienes coches, usar el total real en lugar del filtrado
      const cotxeActual = cotxeResponse.data.total || 0;
      const motoActual = motoResponse.data.total || 0;  
      const autocaravanaActual = autocaravanaResponse.data.total || 0;
      const comercialActual = comercialResponse.data.total || 0;
      
      // Si hay vehículos sin tipo definido y no hay otros tipos, asumimos que son coches
      const totalSinFiltro = totalResponse.data.total || 0;
      const sumaConFiltros = cotxeActual + motoActual + autocaravanaActual + comercialActual;
      const vehiculosSinTipo = totalSinFiltro - sumaConFiltros;
      
      const stats = {
        byType: {
          cotxe: vehiculosSinTipo > 0 && motoActual === 0 && autocaravanaActual === 0 && comercialActual === 0 
            ? totalSinFiltro  // Si solo hay coches, mostrar el total real
            : cotxeActual,    // Si hay otros tipos, mostrar solo los filtrados
          moto: motoActual,
          'autocaravana-camper': autocaravanaActual,
          'vehicle-comercial': comercialActual
        },
        byBrand: {
          cotxe: [], // No mostramos top brands, solo conteos
          moto: [],
          'autocaravana-camper': [],
          'vehicle-comercial': []
        },
        totalBrands: {
          cotxe: cotxeBrands.length,
          moto: motoBrands.length,
          'autocaravana-camper': 0, // Los mismos que coches
          'vehicle-comercial': 0    // Los mismos que coches
        },
        totalModels: {
          cotxe: cotxeModelsCount,
          moto: motoModelsCount,
          'autocaravana-camper': 0, // Los mismos que coches
          'vehicle-comercial': 0    // Los mismos que coches
        },
        loading: false
      };
      
      setDetailedStats(stats);
      console.log('📊 Detailed stats calculated:', stats);
      console.log('🔍 Debug vehicle counts:');
      console.log('- Total vehicles (no filter):', totalResponse.data.total, 'from API call:', '/vehicles?per_page=1');
      console.log('- Cotxe total:', cotxeResponse.data.total, 'from API call:', '/vehicles?per_page=1&tipus-vehicle=cotxe');
      console.log('- Moto total:', motoResponse.data.total, 'from API call:', '/vehicles?per_page=1&tipus-vehicle=moto');
      console.log('- Autocaravana total:', autocaravanaResponse.data.total, 'from API call:', '/vehicles?per_page=1&tipus-vehicle=autocaravana-camper');
      console.log('- Comercial total:', comercialResponse.data.total, 'from API call:', '/vehicles?per_page=1&tipus-vehicle=vehicle-comercial');
      
      const sumByType = (cotxeResponse.data.total || 0) + (motoResponse.data.total || 0) + (autocaravanaResponse.data.total || 0) + (comercialResponse.data.total || 0);
      console.log('🧮 Sum of all types:', sumByType, 'vs Total:', totalResponse.data.total);
      
      if (vehiculosSinTipo > 0) {
        console.log('⚠️ Vehicles without type:', vehiculosSinTipo, '(adding to coches count)');
        console.log('✅ Corrected cotxe count:', stats.byType.cotxe, '(was', cotxeActual, ')');
      }
      
    } catch (error) {
      console.error('❌ Error fetching detailed stats:', error);
      setDetailedStats(prev => ({ ...prev, loading: false }));
    }
  };

  // Cargar estadísticas al montar el componente
  useEffect(() => {
    fetchSystemInfo();
    fetchVehicleStats();
    fetchDetailedStats();
  }, []);

  const handleCreateVehicle = () => {
    // Aquí podrías abrir un modal o navegar a un formulario
    alert('Función de crear vehículo - por implementar');
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
                    <Car className="h-8 w-8 text-green-500" />
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
                    <Database className="h-8 w-8 text-green-600" />
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
                    <Info className="h-8 w-8 text-red-500" />
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

            {/* Detailed Vehicle Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Vehículos Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <Car className="w-5 h-5 text-blue-600" />
                    Vehículos
                  </h3>
                  <Link 
                    to="/admin/kars-vehicles" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <BarChart3 className="w-4 h-4" />
                    Gestionar
                  </Link>
                </div>
                
                {/* Vehicle Types */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Por Tipo</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Coches</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {detailedStats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : detailedStats.byType.cotxe}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bike className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Motos</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {detailedStats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : detailedStats.byType.moto}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Home className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Caravanas</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {detailedStats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : detailedStats.byType['autocaravana-camper']}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white">Comerciales</span>
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {detailedStats.loading ? <Loader2 className="w-4 h-4 animate-spin" /> : detailedStats.byType['vehicle-comercial']}
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Brands and Models Summary */}
                <div className="space-y-4 mt-6">
                  <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Marcas y Modelos</h4>
                  
                  {/* Cars */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300 flex items-center gap-1">
                        <Car className="w-3 h-3" />
                        Coches
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Marcas:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {detailedStats.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : detailedStats.totalBrands.cotxe}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Modelos:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {detailedStats.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : detailedStats.totalModels.cotxe}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Motorcycles */}
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300 flex items-center gap-1">
                        <Bike className="w-3 h-3" />
                        Motos
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Marcas:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {detailedStats.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : detailedStats.totalBrands.moto}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Modelos:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {detailedStats.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : detailedStats.totalModels.moto}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Blog Section */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    Blog
                  </h3>
                  <Link 
                    to="/admin/blog" 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                  >
                    <Building2 className="w-4 h-4" />
                    Gestionar
                  </Link>
                </div>
                
                {/* En Construcción */}
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">En Construcción</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                    El sistema de gestión de blog estará disponible próximamente.
                  </p>
                  <div className="space-y-2 text-xs text-gray-400 dark:text-gray-500">
                    <p>• Creación y edición de artículos</p>
                    <p>• Gestión de categorías</p>
                    <p>• Sistema de publicación</p>
                    <p>• Editor WYSIWYG avanzado</p>
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">v{systemInfo.frontendVersion}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Frontend</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">v{systemInfo.apiVersion}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">API</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{systemInfo.environment}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Entorn</div>
                </div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${
                    systemInfo.databaseStatus === 'connected' 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    MongoDB
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Base de Dades</div>
                </div>
              </div>
            </div>
          </div>
        )}


      </div>
    </AdminLayout>
  );
}