import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Car, 
  Bike, 
  Download, 
  Upload,
  RefreshCw,
  Search,
  Settings,
  Database
} from 'lucide-react';
import toast from 'react-hot-toast';
import { axiosAdmin } from '../../api/axiosClient';

interface Brand {
  id: string;
  slug: string;
  name: string;
  vehicleTypes: string[];
  modelCount?: number;
}

interface Model {
  id: string;
  slug: string;
  name: string;
  brandId: string;
}

const BrandsModelsManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Obtener sub-pestaña activa desde URL, con fallback a 'brands'
  const getActiveSubTabFromUrl = (): 'brands' | 'models' => {
    const subTab = searchParams.get('subtab');
    return subTab === 'models' ? 'models' : 'brands';
  };
  
  const [activeSubTab, setActiveSubTab] = useState<'brands' | 'models'>(getActiveSubTabFromUrl());
  
  // Función para cambiar de sub-pestaña y actualizar URL
  const changeSubTab = (newSubTab: 'brands' | 'models') => {
    setActiveSubTab(newSubTab);
    const newSearchParams = new URLSearchParams(searchParams);
    if (newSubTab === 'brands') {
      newSearchParams.delete('subtab'); // No mostrar 'brands' en URL por ser default
    } else {
      newSearchParams.set('subtab', newSubTab);
    }
    setSearchParams(newSearchParams);
  };
  
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<'all' | 'car' | 'motorcycle'>('all');

  // Estado para formularios
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    slug: '',
    vehicleType: 'car' as 'car' | 'motorcycle'
  });

  // Cargar marcas
  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get('/brands');
      setBrands(response.data?.data || []);
    } catch (error) {
      console.error('❌ Error loading brands:', error);
      toast.error('Error cargando marcas');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  // Cargar modelos de una marca específica
  const loadModels = async (brandSlug: string) => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get(`/brands/${brandSlug}/models`);
      const modelsData = response.data?.data || [];
      setModels(modelsData);
    } catch (error) {
      console.error('❌ Error loading models:', error);
      toast.error('Error cargando modelos');
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar modelos desde API externa
  const syncModels = async (brandSlug: string) => {
    try {
      setLoading(true);
      const response = await axiosAdmin.post(`/brands/${brandSlug}/sync-models`, {
        clearExisting: false
      });
      
      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
        await loadModels(brandSlug);
      } else {
        toast.error('Error sincronizando modelos');
      }
    } catch (error) {
      console.error('Error syncing models:', error);
      toast.error('Error sincronizando modelos desde API externa');
    } finally {
      setLoading(false);
    }
  };

  // Crear o actualizar marca
  const saveBrand = async () => {
    try {
      const isEditing = editingBrand !== null;
      const url = isEditing ? `/brands/${editingBrand.id}` : '/brands';
      const method = isEditing ? 'put' : 'post';
      
      const response = await axiosAdmin[method](url, brandForm);
      
      if (response.data.success) {
        toast.success(`✅ Marca ${isEditing ? 'actualizada' : 'creada'} correctamente`);
        setShowBrandForm(false);
        setEditingBrand(null);
        setBrandForm({ name: '', slug: '', vehicleType: 'car' });
        await loadBrands();
      } else {
        toast.error(response.data.error || 'Error guardando marca');
      }
    } catch (error: any) {
      console.error('Error saving brand:', error);
      toast.error(error.response?.data?.error || 'Error guardando marca');
    }
  };

  // Importar marcas desde archivo JSON
  const importBrandsFromJson = async () => {
    if (!confirm('¿Estás seguro de que quieres importar las marcas desde el archivo JSON? Esto puede tomar unos minutos.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosAdmin.post('/brands/import-from-json');
      
      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
        toast.success(`📊 Importadas: ${response.data.data.totalCarBrands} marcas de coches, ${response.data.data.totalMotorcycleBrands} marcas de motos`);
        await loadBrands();
      } else {
        toast.error('Error importando marcas desde JSON');
      }
    } catch (error: any) {
      console.error('Error importing brands from JSON:', error);
      toast.error(error.response?.data?.error || 'Error importando marcas desde archivo JSON');
    } finally {
      setLoading(false);
    }
  };

  // Importar modelos desde archivo JSON
  const importModelsFromJson = async () => {
    if (!confirm('¿Estás seguro de que quieres importar los modelos desde el archivo JSON? Esto puede tomar varios minutos y requiere que las marcas estén importadas.')) {
      return;
    }

    try {
      setLoading(true);
      const response = await axiosAdmin.post('/brands/import-models');
      
      if (response.data.success) {
        toast.success(`✅ ${response.data.message}`);
        toast.success(`📊 Importados: ${response.data.data.importedCarModels} modelos de coches, ${response.data.data.importedMotorcycleModels} modelos de motos`);
        toast.success(`📦 Total: ${response.data.data.totalModels} modelos en la base de datos`);
        if (response.data.data.brandNotFoundErrors > 0) {
          toast.error(`⚠️ ${response.data.data.brandNotFoundErrors} modelos no se importaron porque no se encontraron sus marcas`);
        }
        // Recargar datos
        await loadBrands();
        if (selectedBrand) {
          const brand = brands.find(b => b.id === selectedBrand);
          if (brand) await loadModels(brand.slug);
        }
      } else {
        toast.error('Error importando modelos desde JSON');
      }
    } catch (error: any) {
      console.error('Error importing models from JSON:', error);
      toast.error(error.response?.data?.error || 'Error importando modelos desde archivo JSON');
    } finally {
      setLoading(false);
    }
  };

  // Mostrar resumen de modelos por marca
  const showModelsStatus = async () => {
    let loadingToast: string | undefined;
    
    try {
      setLoading(true);
      loadingToast = toast('Verificando estado de modelos...', { duration: Infinity });
      
      const response = await axiosAdmin.get('/brands/models-status');
      const data = response.data?.data;
      
      if (loadingToast) toast.dismiss(loadingToast);
      
      if (data) {
        const { summary, carBrandsWithoutModels, motorcycleBrandsWithoutModels } = data;
        
        toast.success(`✅ ${summary.brandsWithModels} marcas con modelos`);
        toast.success(`📊 Total de marcas: ${summary.totalBrands}`);
        
        if (summary.brandsWithoutModels > 0) {
          toast.error(`⚠️ ${summary.brandsWithoutModels} marcas sin modelos`);
          console.log('🚗 Marcas de coches sin modelos:', carBrandsWithoutModels);
          console.log('🏍️ Marcas de motos sin modelos:', motorcycleBrandsWithoutModels);
        }
        
        console.log('📊 Resumen completo:', summary);
      }
      
    } catch (error: any) {
      if (loadingToast) toast.dismiss(loadingToast);
      console.error('Error checking models status:', error);
      toast.error('Error verificando estado de modelos');
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar modelos faltantes desde API externa
  const syncMissingModels = async () => {
    if (!confirm('¿Quieres sincronizar modelos desde la API externa para todas las marcas que no tienen modelos? Esto puede tomar varios minutos.')) {
      return;
    }
    
    let loadingToast: string | undefined;
    
    try {
      setLoading(true);
      loadingToast = toast('Sincronizando modelos faltantes...', { duration: Infinity });
      
      // Primero verificar qué marcas no tienen modelos
      const statusResponse = await axiosAdmin.get('/brands/models-status');
      const carBrandsWithoutModels = statusResponse.data?.data?.carBrandsWithoutModels || [];
      const motorcycleBrandsWithoutModels = statusResponse.data?.data?.motorcycleBrandsWithoutModels || [];
      
      const allBrandsWithoutModels = [...carBrandsWithoutModels, ...motorcycleBrandsWithoutModels];
      
      let syncedCount = 0;
      let errorCount = 0;
      
      for (const brand of allBrandsWithoutModels) {
        try {
          console.log(`🔄 Sincronizando modelos para: ${brand.name}`);
          await axiosAdmin.post(`/brands/${brand.slug}/sync-models`);
          syncedCount++;
        } catch (error) {
          console.error(`❌ Error sincronizando ${brand.name}:`, error);
          errorCount++;
        }
      }
      
      if (loadingToast) toast.dismiss(loadingToast);
      
      if (syncedCount > 0) {
        toast.success(`✅ Sincronizadas ${syncedCount} marcas`);
      }
      if (errorCount > 0) {
        toast.error(`❌ ${errorCount} marcas fallaron`);
      }
      
      // Recargar datos
      await loadBrands();
      if (selectedBrand) {
        const brand = brands.find(b => b.id === selectedBrand);
        if (brand) await loadModels(brand.slug);
      }
      
    } catch (error: any) {
      if (loadingToast) toast.dismiss(loadingToast);
      console.error('Error syncing missing models:', error);
      toast.error('Error sincronizando modelos faltantes');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar marca
  const deleteBrand = async (brandId: string, brandName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la marca "${brandName}"?`)) {
      return;
    }

    try {
      const response = await axiosAdmin.delete(`/brands/${brandId}`);
      
      if (response.data.success) {
        toast.success('✅ Marca eliminada correctamente');
        await loadBrands();
        if (selectedBrand === brandId) {
          setSelectedBrand('');
          setModels([]);
        }
      } else {
        toast.error('Error eliminando marca');
      }
    } catch (error: any) {
      console.error('Error deleting brand:', error);
      toast.error(error.response?.data?.error || 'Error eliminando marca');
    }
  };

  // Sincronizar estado con URL cuando cambien los parámetros
  useEffect(() => {
    const urlSubTab = getActiveSubTabFromUrl();
    if (urlSubTab !== activeSubTab) {
      setActiveSubTab(urlSubTab);
    }
  }, [searchParams]);

  // Efectos
  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    if (selectedBrand && activeSubTab === 'models') {
      const brand = brands.find(b => b.id === selectedBrand);
      if (brand) {
        loadModels(brand.slug);
      }
    }
  }, [selectedBrand, activeSubTab, brands]);


  // Filtrar marcas
  const filteredBrands = brands.filter(brand => {
    const matchesSearch = (brand.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (brand.slug?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesType = vehicleTypeFilter === 'all' || 
                       (brand.vehicleTypes && brand.vehicleTypes.includes(vehicleTypeFilter));
    return matchesSearch && matchesType;
  });

  const openEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setBrandForm({
      name: brand.name || '',
      slug: brand.slug || '',
      vehicleType: (brand.vehicleTypes && brand.vehicleTypes.includes('motorcycle')) ? 'motorcycle' : 'car'
    });
    setShowBrandForm(true);
  };

  const cancelBrandForm = () => {
    setShowBrandForm(false);
    setEditingBrand(null);
    setBrandForm({ name: '', slug: '', vehicleType: 'car' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Gestión de Marcas y Modelos
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las marcas y modelos disponibles para vehículos
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={importBrandsFromJson}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            <Database className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            Importar Marcas
          </button>
          <button
            onClick={importModelsFromJson}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            <Upload className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            Importar TODOS los Modelos
          </button>
          <button
            onClick={showModelsStatus}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
          >
            <Search className={`w-4 h-4 ${loading ? 'animate-pulse' : ''}`} />
            Verificar Estado
          </button>
          <button
            onClick={syncMissingModels}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar Faltantes
          </button>
          <button
            onClick={() => setShowBrandForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva Marca
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => changeSubTab('brands')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeSubTab === 'brands'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Marcas ({filteredBrands.length})
            </div>
          </button>
          <button
            onClick={() => changeSubTab('models')}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeSubTab === 'models'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4" />
              Modelos ({models.length})
            </div>
          </button>
        </nav>
      </div>

      {/* Brands Tab */}
      {activeSubTab === 'brands' && (
        <div className="space-y-4">
          {/* Filtros */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar marcas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <select
                value={vehicleTypeFilter}
                onChange={(e) => setVehicleTypeFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los tipos</option>
                <option value="car">Coches</option>
                <option value="motorcycle">Motos</option>
              </select>

              <button
                onClick={loadBrands}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Actualizar
              </button>
            </div>
          </div>

          {/* Lista de marcas */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredBrands.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Settings className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p>No se encontraron marcas</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredBrands.map((brand) => (
                  <div key={`brand-list-${brand.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {(brand.vehicleTypes || []).includes('motorcycle') ? (
                          <Bike className="w-6 h-6 text-orange-500" />
                        ) : (
                          <Car className="w-6 h-6 text-blue-500" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-white">
                              {brand.name || 'Sin nombre'}
                            </h3>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              (brand.modelCount || 0) === 0 
                                ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {brand.modelCount || 0} modelos
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {brand.slug || 'sin-slug'} • {(brand.vehicleTypes || []).join(', ')}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {(brand.modelCount || 0) === 0 && (brand.vehicleTypes.includes('car') || brand.vehicleTypes.includes('motorcycle')) && (
                          <button
                            onClick={() => syncModels(brand.slug)}
                            disabled={loading}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded disabled:opacity-50"
                            title="Sincronizar modelos desde API"
                          >
                            <Download className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            setSelectedBrand(brand.id);
                            changeSubTab('models');
                          }}
                          className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded"
                          title="Ver modelos"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditBrand(brand)}
                          className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteBrand(brand.id, brand.name)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Models Tab */}
      {activeSubTab === 'models' && (
        <div className="space-y-4">
          {/* Selector de marca */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">  
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Selecciona una marca</option>
                {brands.map((brand) => (
                  <option key={`brand-select-${brand.id}`} value={brand.id}>
                    {brand.name || 'Sin nombre'} ({(brand.vehicleTypes || []).join(', ')})
                  </option>
                ))}
              </select>

              {selectedBrand && (
                <button
                  onClick={() => {
                    const brand = brands.find(b => b.id === selectedBrand);
                    if (brand) syncModels(brand.slug);
                  }}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Sincronizar desde API
                </button>
              )}
            </div>
          </div>

          {/* Lista de modelos */}
          {selectedBrand ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : models.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                  <p>No se encontraron modelos para esta marca</p>
                  <p className="text-sm mt-2">Usa el botón "Sincronizar desde API" para cargar modelos</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {models.map((model) => (
                    <div key={`model-${model.id}`} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {model.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {model.slug}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Car className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>Selecciona una marca para ver sus modelos</p>
            </div>
          )}
        </div>
      )}

      {/* Modal para crear/editar marca */}
      {showBrandForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingBrand ? 'Editar Marca' : 'Nueva Marca'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={brandForm.name}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Volkswagen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  value={brandForm.slug}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, slug: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: volkswagen"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de vehículo
                </label>
                <select
                  value={brandForm.vehicleType}
                  onChange={(e) => setBrandForm(prev => ({ ...prev, vehicleType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="car">Coche</option>
                  <option value="motorcycle">Moto</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelBrandForm}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={saveBrand}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {editingBrand ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandsModelsManager;