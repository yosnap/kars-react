import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Check,
  Trash2,
  Send,
  X,
  Loader,
  Share2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/Admin/AdminLayout';
import BrandsModelsManager from '../../components/Admin/BrandsModelsManager';
import SystemInstaller from '../../components/Admin/SystemInstaller';
import { axiosAdmin } from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import ProtectedSection from '../../components/ui/ProtectedSection';
import * as Popover from '@radix-ui/react-popover';
import SearchableSelect, { SelectOption } from '../../components/ui/SearchableSelect';
import { Switch } from '../../components/ui/switch';
import { useBuscoCotxeSync } from '../../hooks/useBuscoCotxeSync';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';

interface Vehicle {
  id: string;
  slug: string;
  titolAnunci: string;
  tipusVehicle: string;
  marcaCotxe?: string;
  marcaMoto?: string;
  modelsCotxe?: string;
  modelsMoto?: string;
  preu: number | string;
  any: string;
  quilometratge: string;
  anunciActiu: boolean;
  venut: boolean;
  reservat?: boolean;
  anunciDestacat: number;
  dataCreacio: string;
  imatgeDestacadaUrl?: string;
  estatVehicle?: string;
  // Campos de sincronización
  motorIdSync?: string;
  buscoIdSync?: string;
  lastSyncAt?: string;
  syncError?: string;
  needsSync?: boolean;
  buscoVehicleId?: string;
  syncedToBuscoAt?: string;
}

// Función para mapear tipos de vehículo a etiquetas legibles
const getVehicleTypeLabel = (tipusVehicle: string): string => {
  switch (tipusVehicle?.toLowerCase()) {
    case 'cotxe': return 'Cotxe';
    case 'moto': return 'Moto';
    case 'autocaravana-camper': return 'Autocaravana';
    case 'vehicle-comercial': return 'Vehicle Comercial';
    default: return tipusVehicle?.charAt(0).toUpperCase() + tipusVehicle?.slice(1).toLowerCase() || '';
  }
};

/**
 * NOTA: En desarrollo, React.StrictMode causa doble renderizado intencional
 * para detectar efectos secundarios. Esto es normal y no afecta producción.
 */
const KarsVehicles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { syncVehicle, syncMultipleVehicles, hasValidCredentials } = useBuscoCotxeSync();
  const { isSuperAdmin } = useAuth();
  
  // Obtener pestaña activa desde URL, con fallback a 'vehicles'
  const activeTabFromUrl = useMemo((): 'vehicles' | 'brands-models' | 'installer' => {
    const tab = searchParams.get('tab');
    // Solo permitir acceso a tabs especiales si es super admin
    if (tab === 'brands-models' && isSuperAdmin()) return 'brands-models';
    if (tab === 'installer' && isSuperAdmin()) return 'installer';
    return 'vehicles';
  }, [searchParams, isSuperAdmin]);
  
  const [activeTab, setActiveTab] = useState<'vehicles' | 'brands-models' | 'installer'>('vehicles');
  
  // Función para cambiar de pestaña y actualizar URL
  const changeTab = (newTab: 'vehicles' | 'brands-models' | 'installer') => {
    // Solo permitir cambio a tabs especiales si es super admin
    if ((newTab === 'brands-models' || newTab === 'installer') && !isSuperAdmin()) {
      return; // No hacer nada si no tiene permisos
    }
    
    setActiveTab(newTab);
    const newSearchParams = new URLSearchParams(searchParams);
    if (newTab === 'vehicles') {
      newSearchParams.delete('tab'); // No mostrar 'vehicles' en URL por ser default
    } else {
      newSearchParams.set('tab', newTab);
    }
    setSearchParams(newSearchParams);
  };
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [venutFilter, setVenutFilter] = useState('all');
  const [reservatFilter, setReservatFilter] = useState('all');
  const [estatVehicleFilter, setEstatVehicleFilter] = useState('all');
  const [anunciActiuFilter, setAnunciActiuFilter] = useState('all');
  const [anunciDestacatFilter, setAnunciDestacatFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [importStatus, setImportStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [filterCounts, setFilterCounts] = useState<any>({});
  const [brandMap, setBrandMap] = useState<Record<string, string>>({});
  const [modelMap, setModelMap] = useState<Record<string, string>>({});
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<{id: string, title: string} | null>(null);
  const [importReportOpen, setImportReportOpen] = useState(false);
  const [importReport, setImportReport] = useState<{
    total: number;
    successful: number;
    failed: number;
    failedVehicles: Array<{title: string, slug: string, error: string}>;
  } | null>(null);
  const [syncingVehicles, setSyncingVehicles] = useState<Record<string, 'motoraldia' | 'busco'>>({});
  const [syncAllModalOpen, setSyncAllModalOpen] = useState(false);
  const [syncAllPlatform, setSyncAllPlatform] = useState<'motoraldia' | 'busco' | null>(null);
  const [syncAllInProgress, setSyncAllInProgress] = useState(false);
  const [syncLogModalOpen, setSyncLogModalOpen] = useState(false);
  const [syncLogs, setSyncLogs] = useState<Array<{
    timestamp: string;
    level: 'info' | 'success' | 'error' | 'warning';
    message: string;
    vehicleTitle?: string;
    apiResponse?: any;
    error?: any;
  }>>([]);
  const isInitialMount = useRef(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper function to add logs
  const addSyncLog = (level: 'info' | 'success' | 'error' | 'warning', message: string, vehicleTitle?: string, apiResponse?: any, error?: any) => {
    setSyncLogs(prev => [...prev, {
      timestamp: new Date().toISOString(),
      level,
      message,
      vehicleTitle,
      apiResponse,
      error
    }]);
  };

  // Clear logs
  const clearSyncLogs = () => {
    setSyncLogs([]);
  };

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

      // Aplicar filtros - usar nombres de campo de la API
      if (typeFilter !== 'all') {
        params['tipus-vehicle'] = typeFilter;
      }

      if (venutFilter !== 'all') {
        params.venut = venutFilter === 'true' ? 'true' : 'false';
      }

      if (reservatFilter !== 'all') {
        params.reservat = reservatFilter === 'true' ? 'true' : 'false';
      }

      if (estatVehicleFilter !== 'all') {
        params['estat-vehicle'] = estatVehicleFilter;
      }

      if (anunciActiuFilter !== 'all') {
        params['anunci-actiu'] = anunciActiuFilter === 'true' ? 'true' : 'false';
      }

      if (anunciDestacatFilter !== 'all') {
        params['anunci-destacat'] = parseInt(anunciDestacatFilter);
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


  const toggleVehicleStatus = async (vehicleId: string, currentStatus: boolean) => {
    const newValue = !currentStatus;
    
    // Actualizar estado local inmediatamente
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, anunciActiu: newValue }
        : vehicle
    ));
    
    // Llamada al backend en background
    try {
      await axiosAdmin.put(`/vehicles/${vehicleId}`, {
        'anunciActiu': newValue
      });
      toast.success(newValue ? 'Vehicle activat' : 'Vehicle desactivat');
    } catch (err) {
      // Revertir el cambio si falla
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, anunciActiu: currentStatus }
          : vehicle
      ));
      console.error('Error updating vehicle status:', err);
      toast.error('Error actualitzant l\'estat del vehicle');
    }
  };

  const toggleVehicleVenut = async (vehicleId: string, currentStatus: boolean) => {
    const newValue = !currentStatus;
    
    // Actualizar estado local inmediatamente
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, venut: newValue }
        : vehicle
    ));
    
    // Llamada al backend en background
    try {
      await axiosAdmin.put(`/vehicles/${vehicleId}`, {
        'venut': newValue
      });
      toast.success(newValue ? 'Vehicle marcat com venut' : 'Vehicle marcat com disponible');
    } catch (err) {
      // Revertir el cambio si falla
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, venut: currentStatus }
          : vehicle
      ));
      console.error('Error updating vehicle sold status:', err);
      toast.error('Error actualitzant l\'estat de venda');
    }
  };

  const toggleVehicleReservat = async (vehicleId: string, currentStatus: boolean | undefined) => {
    const newValue = !Boolean(currentStatus);
    
    // Actualizar estado local inmediatamente
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, reservat: newValue }
        : vehicle
    ));
    
    // Llamada al backend en background
    try {
      await axiosAdmin.put(`/vehicles/${vehicleId}`, {
        'reservat': newValue
      });
      toast.success(newValue ? 'Vehicle marcat com reservat' : 'Vehicle marcat com disponible');
    } catch (err: any) {
      // Revertir el cambio si falla
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, reservat: Boolean(currentStatus) }
          : vehicle
      ));
      console.error('Error updating vehicle reserved status:', err);
      console.error('Error response:', err.response?.data);
      toast.error('Error actualitzant l\'estat de reserva');
    }
  };

  const openDeleteModal = (vehicleId: string, vehicleTitle: string) => {
    setVehicleToDelete({ id: vehicleId, title: vehicleTitle });
    setDeleteModalOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await axiosAdmin.delete(`/admin/vehicles/${vehicleToDelete.id}`);
      await loadVehicles(currentPage);
      toast.success(`Vehicle "${vehicleToDelete.title}" eliminat correctament`);
      setDeleteModalOpen(false);
      setVehicleToDelete(null);
    } catch (err) {
      console.error('Error deleting vehicle:', err);
      toast.error('Error eliminant el vehicle');
    }
  };

  const toggleVehicleDestacado = async (vehicleId: string, currentDestacado: string) => {
    const newValue = parseInt(currentDestacado) === 1 ? 0 : 1;
    
    // Actualizar estado local inmediatamente
    setVehicles(prev => prev.map(vehicle => 
      vehicle.id === vehicleId 
        ? { ...vehicle, anunciDestacat: newValue }
        : vehicle
    ));
    
    // Llamada al backend en background
    try {
      await axiosAdmin.put(`/vehicles/${vehicleId}`, {
        'anunciDestacat': newValue
      });
      toast.success(`Vehicle ${newValue === 1 ? 'destacat' : 'no destacat'} correctament`);
    } catch (err) {
      // Revertir el cambio si falla
      setVehicles(prev => prev.map(vehicle => 
        vehicle.id === vehicleId 
          ? { ...vehicle, anunciDestacat: parseInt(currentDestacado) }
          : vehicle
      ));
      console.error('Error updating vehicle destacado status:', err);
      toast.error('Error actualitzant l\'estat destacat del vehicle');
    }
  };

  const syncToMotoraldi = async (vehicleId: string, vehicleTitle: string, isRemove: boolean = false) => {
    setSyncingVehicles(prev => ({ ...prev, [vehicleId]: 'motoraldia' }));
    
    // Log inicio de sincronización
    addSyncLog('info', `Iniciant sincronització${isRemove ? ' (eliminació)' : ''} amb Motoraldia`, vehicleTitle);
    
    try {
      // Obtener credenciales de localStorage
      const motorCredentials = localStorage.getItem('motorSyncOutConfig');
      let credentials = null;
      
      if (motorCredentials) {
        try {
          credentials = JSON.parse(motorCredentials);
        } catch (error) {
          console.error('Error parsing Motor credentials from localStorage:', error);
          addSyncLog('error', 'Error llegint credencials de Motor des de localStorage', vehicleTitle, null, error);
          toast.error('Error llegint la configuració de Motor. Configura les credencials a la configuració.');
          setSyncingVehicles(prev => {
            const newState = { ...prev };
            delete newState[vehicleId];
            return newState;
          });
          return;
        }
      }
      
      if (!credentials || !credentials.username || !credentials.password || !credentials.apiUrl) {
        addSyncLog('error', 'Credencials de Motor no configurades', vehicleTitle);
        toast.error('Configura les credencials de Motor a la pestanya de configuració primer');
        setSyncingVehicles(prev => {
          const newState = { ...prev };
          delete newState[vehicleId];
          return newState;
        });
        return;
      }
      
      const endpoint = isRemove ? `/vehicles/${vehicleId}/sync-to-motoraldia/remove` : `/vehicles/${vehicleId}/sync-to-motoraldia`;
      const response = isRemove 
        ? await axiosAdmin.delete(endpoint, {
            data: { motorCredentials: credentials }
          })
        : await axiosAdmin.post(endpoint, {
            motorCredentials: credentials
          });
      
      // Log respuesta completa de la API
      addSyncLog('info', 'Resposta de la API de Motoraldia', vehicleTitle, response.data);
      
      if (response.data.success) {
        await loadVehicles(currentPage);
        
        if (isRemove) {
          addSyncLog('success', 'Vehicle eliminat de Motoraldia correctament', vehicleTitle, response.data);
          toast.success(`Vehicle "${vehicleTitle}" eliminat de Motoraldia correctament`);
        } else {
          addSyncLog('success', `Vehicle sincronitzat amb Motoraldia: ID ${response.data.data?.motorIdSync}`, vehicleTitle, response.data);
          toast.success(`Vehicle "${vehicleTitle}" sincronitzat amb Motoraldia: ID ${response.data.data?.motorIdSync}`);
          // Show logs modal for individual sync after a short delay
          setTimeout(() => setSyncLogModalOpen(true), 1000);
        }
      } else {
        throw new Error(response.data.error || 'Error desconegut');
      }
    } catch (err: any) {
      console.error('Error syncing to Motoraldia:', err);
      const action = isRemove ? 'eliminant de' : 'sincronitzant amb';
      const errorMessage = `Error ${action} Motoraldia: ${err.response?.data?.error || err.message}`;
      
      // Log error detallado
      addSyncLog('error', errorMessage, vehicleTitle, err.response?.data, err);
      toast.error(errorMessage);
      // Show logs modal for errors after a short delay
      setTimeout(() => setSyncLogModalOpen(true), 1000);
    } finally {
      setSyncingVehicles(prev => {
        const newState = { ...prev };
        delete newState[vehicleId];
        return newState;
      });
    }
  };

  const syncToBusco = async (vehicleId: string, vehicleTitle: string, isRemove: boolean = false) => {
    // Verificar credenciales antes de intentar sincronizar
    if (!hasValidCredentials()) {
      toast.error('No se encontraron credenciales válidas para BuscoCotxe. Configúralas en Configuración > Sincronización Busco - Salida');
      return;
    }

    setSyncingVehicles(prev => ({ ...prev, [vehicleId]: 'busco' }));
    
    try {
      const result = await syncVehicle(vehicleId, isRemove);
      
      if (result.success) {
        await loadVehicles(currentPage);
        if (isRemove) {
          toast.success(`Vehicle "${vehicleTitle}" eliminat de Busco correctament`);
        } else {
          const buscoId = result.buscoVehicleId ? `: ID ${result.buscoVehicleId}` : '';
          toast.success(`Vehicle "${vehicleTitle}" sincronitzat amb Busco${buscoId}`);
        }
      } else {
        throw new Error(result.message || 'Error desconegut');
      }
    } catch (err: any) {
      console.error('Error syncing to Busco:', err);
      const action = isRemove ? 'eliminant de' : 'sincronitzant amb';
      const errorMessage = err instanceof Error ? err.message : 'Error desconegut';
      toast.error(`Error ${action} Busco: ${errorMessage}`);
    } finally {
      setSyncingVehicles(prev => {
        const newState = { ...prev };
        delete newState[vehicleId];
        return newState;
      });
    }
  };

  const openSyncAllModal = (platform: 'motoraldia' | 'busco') => {
    setSyncAllPlatform(platform);
    setSyncAllModalOpen(true);
  };

  const confirmSyncAll = async () => {
    if (!syncAllPlatform) return;
    
    setSyncAllInProgress(true);
    setSyncAllModalOpen(false);
    
    // Clear previous logs and start new sync session
    clearSyncLogs();
    addSyncLog('info', `=== NOVA SESSIÓ DE SINCRONITZACIÓ MASSIVA ===`);
    
    try {
      // Obtener todos los vehículos disponibles para sync según la plataforma
      const filteredVehicles = vehicles.filter(vehicle => {
        if (syncAllPlatform === 'motoraldia') {
          return !vehicle.motorIdSync && vehicle.anunciActiu;
        } else if (syncAllPlatform === 'busco') {
          return !vehicle.syncedToBuscoAt && vehicle.anunciActiu;
        }
        return false;
      });

      addSyncLog('info', `Vehicles trobats per sincronitzar: ${filteredVehicles.length}`);

      if (filteredVehicles.length === 0) {
        addSyncLog('warning', 'No hi ha vehicles pendents de sincronització');
        toast.error(`No hi ha vehicles pendents de sincronització amb ${syncAllPlatform}`);
        return;
      }

      const platformName = syncAllPlatform === 'motoraldia' ? 'Motoraldia' : 'Busco';
      addSyncLog('info', `Iniciant sincronització de ${filteredVehicles.length} vehicles amb ${platformName}...`);
      toast.success(`Iniciant sincronització de ${filteredVehicles.length} vehicles amb ${platformName}...`);

      let successful = 0;
      let failed = 0;

      if (syncAllPlatform === 'busco') {
        // Para Busco, verificar credenciales primero
        if (!hasValidCredentials()) {
          addSyncLog('error', 'No se encontraron credenciales válidas para BuscoCotxe');
          toast.error('No se encontraron credenciales válidas para BuscoCotxe. Configúralas en Configuración > Sincronización Busco - Salida');
          return;
        }

        // Usar el hook para sincronización masiva
        const vehicleIds = filteredVehicles.map(v => v.id);
        addSyncLog('info', `Utilitzant API de BuscoCotxe per sincronitzar ${vehicleIds.length} vehicles...`);
        
        const result = await syncMultipleVehicles(vehicleIds);
        
        successful = result.successful;
        failed = result.failed;
        
        // Registrar errores específicos
        result.errors.forEach(error => {
          const vehicle = filteredVehicles.find(v => v.id === error.id);
          addSyncLog('error', `Error sincronitzant vehicle: ${error.error}`, vehicle?.titolAnunci || error.id);
        });
        
      } else {
        // Para Motoraldia, mantener la lógica original
        // Sincronizar de 3 en 3 para evitar sobrecargar el servidor
        for (let i = 0; i < filteredVehicles.length; i += 3) {
          const batch = filteredVehicles.slice(i, i + 3);
          const batchNumber = Math.floor(i / 3) + 1;
          const totalBatches = Math.ceil(filteredVehicles.length / 3);
          
          addSyncLog('info', `Processant lot ${batchNumber}/${totalBatches} (${batch.length} vehicles)`);
          
          const promises = batch.map(async (vehicle) => {
            try {
              addSyncLog('info', `Sincronitzant vehicle: ${vehicle.titolAnunci}`, vehicle.titolAnunci);
              await syncToMotoraldi(vehicle.id, vehicle.titolAnunci);
              successful++;
              addSyncLog('success', `Vehicle sincronitzat correctament`, vehicle.titolAnunci);
            } catch (error) {
              failed++;
              addSyncLog('error', `Error sincronitzant vehicle: ${error}`, vehicle.titolAnunci, null, error);
              console.error(`Error syncing vehicle ${vehicle.titolAnunci}:`, error);
            }
          });

          await Promise.allSettled(promises);
          
          addSyncLog('info', `Lot ${batchNumber}/${totalBatches} completat. Exitosos: ${successful}, Fallits: ${failed}`);
          
          // Pequeña pausa entre lotes
          if (i + 3 < filteredVehicles.length) {
            addSyncLog('info', 'Pausa d\'1 segon entre lots...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // Recargar la lista de vehículos
      await loadVehicles(currentPage);

      // Mostrar resultado final
      if (failed === 0) {
        addSyncLog('success', `=== SINCRONITZACIÓ COMPLETADA EXITOSAMENT ===`);
        addSyncLog('success', `Total vehicles sincronitzats: ${successful}`);
        toast.success(`✅ Sincronització completada: ${successful} vehicles sincronitzats amb ${platformName}`);
      } else {
        addSyncLog('warning', `=== SINCRONITZACIÓ COMPLETADA AMB ERRORS ===`);
        addSyncLog('warning', `Vehicles exitosos: ${successful}, Vehicles fallits: ${failed}`);
        toast.error(`⚠️ Sincronització completada amb errors: ${successful} exitosos, ${failed} fallits`);
      }

      // Show logs modal
      setSyncLogModalOpen(true);

    } catch (error) {
      console.error('Error in bulk sync:', error);
      addSyncLog('error', 'Error crític durant la sincronització massiva', undefined, null, error);
      toast.error('Error durant la sincronització massiva');
      setSyncLogModalOpen(true);
    } finally {
      setSyncAllInProgress(false);
      setSyncAllPlatform(null);
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
        
        // Configurar el informe para el modal
        setImportReport({
          total: response.data.summary?.total || response.data.data.imported + response.data.data.skipped,
          successful: response.data.summary?.successful || response.data.data.imported,
          failed: response.data.summary?.failed || response.data.data.skipped,
          failedVehicles: response.data.summary?.failedVehicles || []
        });
        
        // Mostrar el modal con el informe detallado
        setImportReportOpen(true);
        
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

  // Función para cargar mapas de marcas y modelos
  const loadBrandAndModelMaps = async () => {
    try {
      // Cargar marcas de coches
      const carBrandsResponse = await axiosAdmin.get('/brands/cars');
      const carBrands = carBrandsResponse.data?.data || [];
      
      // Cargar marcas de motos
      const motoBrandsResponse = await axiosAdmin.get('/brands/motorcycles');
      const motoBrands = motoBrandsResponse.data?.data || [];
      
      // Crear mapeo de slugs a labels para marcas
      const allBrands = [...carBrands, ...motoBrands];
      const brandMapping: Record<string, string> = {};
      allBrands.forEach((brand: any) => {
        if (brand.value && brand.label) {
          brandMapping[brand.value] = brand.label;
          // También agregar variaciones con capitalización
          brandMapping[brand.label] = brand.label; // Mapear label -> label
          brandMapping[brand.label.toLowerCase()] = brand.label; // Mapear lowercase -> label
        }
      });
      setBrandMap(brandMapping);
      
      // Cargar modelos de coches y motos (por ahora dejamos esto comentado hasta implementar la funcionalidad)
      try {
        // TODO: Implementar endpoint de modelos generales - por ahora usar mapping vacío
        setModelMap({});
      } catch (modelError) {
        setModelMap({});
      }
      
    } catch (error) {
      console.error('Error loading brand and model maps:', error);
    }
  };

  // Sincronizar estado con URL cuando cambien los parámetros
  useEffect(() => {
    if (activeTabFromUrl !== activeTab) {
      setActiveTab(activeTabFromUrl);
    }
  }, [activeTabFromUrl]); // Solo depende de activeTabFromUrl para evitar loops

  useEffect(() => {
    loadVehicles();
    loadFilterCounts();
    loadBrandAndModelMaps();
  }, []);

  // Recargar cuando cambien los filtros (filtrado automático)
  useEffect(() => {
    // Evitar ejecutar en el primer render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      loadVehicles(1); // Resetear a página 1 cuando cambien filtros
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, typeFilter, venutFilter, reservatFilter, estatVehicleFilter, anunciActiuFilter, anunciDestacatFilter, sortBy, sortOrder]);

  // Intersection Observer para detectar cuando el header sale del viewport
  useEffect(() => {
    if (!headerRef.current || vehicles.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeaderVisible(entry.isIntersecting);
      },
      {
        threshold: 0,
        rootMargin: '0px'
      }
    );

    observer.observe(headerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [vehicles.length]);

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

  // Función para decodificar entidades HTML usando DOMParser (más robusta)
  const decodeHtmlEntities = (text: string) => {
    if (!text) return text;
    
    try {
      // Usar DOMParser para decodificar entidades HTML de forma nativa
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      return doc.documentElement.textContent || text;
    } catch (error) {
      // Fallback manual si DOMParser falla
      const entityMap: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#8211;': '–', // guión largo
        '&#8212;': '—', // guión más largo  
        '&#8217;': "'", // comilla simple derecha
        '&#8216;': "'", // comilla simple izquierda
        '&#8220;': '"', // comilla doble izquierda
        '&#8221;': '"', // comilla doble derecha
        '&nbsp;': ' '
      };
      
      return text.replace(/&[#\w]+;/g, (entity) => {
        return entityMap[entity] || entity;
      });
    }
  };

  const getBrandName = (vehicle: Vehicle) => {
    const brandSlug = vehicle.marcaCotxe || vehicle.marcaMoto;
    if (!brandSlug) return 'N/A';
    
    // Intentar varias variaciones de mapeo
    let brandName = brandMap[brandSlug] || 
                   brandMap[brandSlug.toLowerCase()] || 
                   brandMap[brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)];
    
    // Si no se encuentra, usar el slug capitalizado como fallback
    return brandName || brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
  };

  const getModelName = (vehicle: Vehicle) => {
    const modelSlug = vehicle.modelsCotxe || vehicle.modelsMoto;
    if (!modelSlug) return 'N/A';
    
    // Intentar varias variaciones de mapeo
    let modelName = modelMap[modelSlug] || 
                   modelMap[modelSlug.toLowerCase()] || 
                   modelMap[modelSlug.charAt(0).toUpperCase() + modelSlug.slice(1)];
    
    // Si no se encuentra, usar el slug capitalizado como fallback
    return modelName || modelSlug.charAt(0).toUpperCase() + modelSlug.slice(1);
  };

  // Helper para obtener conteo de un filtro
  const getFilterCount = (filterKey: string, value: string) => {
    // Mapear nombres de campo del frontend a la API
    const fieldMap: Record<string, string> = {
      'tipusVehicle': 'tipus-vehicle',
      'estatVehicle': 'estat-vehicle', 
      'anunciActiu': 'anunci-actiu',
      'anunciDestacat': 'anunci-destacat',
      'venut': 'venut', // Este campo ya coincide pero lo incluimos para consistencia
      'reservat': 'reservat' // Este campo ya coincide pero lo incluimos para consistencia
    };
    
    const apiFieldName = fieldMap[filterKey] || filterKey;
    
    
    if (!filterCounts[apiFieldName]) return 0;
    
    let count = filterCounts[apiFieldName][value];
    
    // Si no encontramos el valor directamente, intentar alternativas según el tipo de campo
    if (count === undefined) {
      if (value === 'true' || value === 'false') {
        // Para campos booleanos, intentar con valor booleano y string
        const boolValue = value === 'true';
        count = filterCounts[apiFieldName][boolValue.toString()];
      } else if (value === '0' || value === '1') {
        // Para campos numéricos como destacat
        count = filterCounts[apiFieldName][value];
      }
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
    <>
      {/* Floating Header Menu - Shown when table header is not visible */}
      {!isHeaderVisible && activeTab === 'vehicles' && vehicles.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-12 gap-1 p-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">
              <div className="col-span-4 text-left">Vehicle</div>
              <div className="col-span-1 text-center">Preu</div>
              <div className="col-span-1 text-center">Motor</div>
              <div className="col-span-1 text-center">Busco</div>
              <div className="col-span-1 text-center">Dest</div>
              <div className="col-span-1 text-center">Actiu</div>
              <div className="col-span-1 text-center">Venut</div>
              <div className="col-span-1 text-center">Reserv</div>
              <div className="col-span-1 text-center">Accions</div>
            </div>
          </div>
        </div>
      )}

    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Vehicles Kars.ad
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestiona els vehicles i les seves marcas i models
            </p>
            {activeTab === 'vehicles' && (
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                <span>Total: <strong>{totalVehicles.toLocaleString()}</strong> vehicles</span>
                <span>Pàgina: <strong>{currentPage}</strong> de <strong>{totalPages}</strong></span>
                <span>Veient <strong>{vehicles.length}</strong> d'un total de <strong>{totalVehicles.toLocaleString()}</strong></span>
              </div>
            )}
          </div>
          {activeTab === 'vehicles' && (
            <div className="flex gap-3">
              <ProtectedSection requireSuperAdmin>
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
              </ProtectedSection>
              
              {/* Sync Logs Button */}
              {syncLogs.length > 0 && (
                <button
                  onClick={() => setSyncLogModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Logs Sync ({syncLogs.length})
                </button>
              )}
              
              <button 
                onClick={handleCreateVehicle}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nou Vehicle
              </button>
            </div>
          )}
        </div>

        {/* Sync Actions Row - Commented for future scalability */}
        {/* {activeTab === 'vehicles' && (
          <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                  <RefreshCw className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Sincronització Massiva
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sincronitza tots els vehicles actius amb les APIs externes
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={() => openSyncAllModal('motoraldia')}
                  disabled={syncAllInProgress}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    syncAllInProgress
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed transform-none shadow-none'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                  }`}
                  title="Sincronitzar tots els vehicles actius amb Motoraldia"
                >
                  {syncAllInProgress ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                  <span className="font-medium">Sync Motoraldia</span>
                </button>
                
                <button
                  onClick={() => openSyncAllModal('busco')}
                  disabled={syncAllInProgress}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                    syncAllInProgress
                      ? 'bg-gray-400 text-gray-600 cursor-not-allowed transform-none shadow-none'
                      : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'
                  }`}
                  title="Sincronitzar tots els vehicles actius amb Busco"
                >
                  {syncAllInProgress ? (
                    <RefreshCw className="w-5 h-5 animate-spin" />
                  ) : (
                    <Share2 className="w-5 h-5" />
                  )}
                  <span className="font-medium">Sync Busco</span>
                </button>
              </div>
            </div>
          </div>
        )} */}

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => changeTab('vehicles')}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'vehicles'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Car className="w-4 h-4" />
                Vehicles ({totalVehicles.toLocaleString()})
              </div>
            </button>
            <ProtectedSection requireSuperAdmin>
              <button
                onClick={() => changeTab('brands-models')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'brands-models'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Marcas/Modelos
                </div>
              </button>
            </ProtectedSection>
          </nav>
        </div>
        {/* Content based on active tab */}
        {activeTab === 'vehicles' && (
          <>
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
                allowClear={false}
                showSearch={false}
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
                allowClear={false}
                showSearch={false}
              />
            </div>

            {/* Filtros en una sola fila */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              {/* Vehicle Type Filter */}
              <SearchableSelect
                options={createSelectOptions('tipusVehicle', [
                  { value: 'all', label: 'Tots els tipus' },
                  { value: 'cotxe', label: 'Cotxes' },
                  { value: 'moto', label: 'Motos' },
                  { value: 'autocaravana-camper', label: 'Autocaravanes' },
                  { value: 'vehicle-comercial', label: 'Vehicles Comercials' }
                ])}
                value={typeFilter}
                onValueChange={setTypeFilter}
                placeholder="Selecciona tipus de vehicle"
                allowClear={false}
                showSearch={false}
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
                allowClear={false}
                showSearch={false}
              />

              {/* Reservat Filter */}
              <SearchableSelect
                options={createSelectOptions('reservat', [
                  { value: 'all', label: 'Reservat - Tots' },
                  { value: 'false', label: 'No reservat' },
                  { value: 'true', label: 'Reservat' }
                ])}
                value={reservatFilter}
                onValueChange={setReservatFilter}
                placeholder="Selecciona estat de reserva"
                allowClear={false}
                showSearch={false}
              />

              {/* Estat Vehicle Filter */}
              <SearchableSelect
                options={createSelectOptions('estatVehicle', [
                  { value: 'all', label: 'Estat - Tots' },
                  { value: 'nou', label: 'Nou' },
                  { value: 'seminou', label: 'Seminou' },
                  { value: 'ocasio', label: 'Ocasió' },
                  { value: 'km0', label: 'Km0' }
                ])}
                value={estatVehicleFilter}
                onValueChange={setEstatVehicleFilter}
                placeholder="Selecciona estat del vehicle"
                allowClear={false}
                showSearch={false}
              />

              {/* Anunci Actiu Filter */}
              <SearchableSelect
                options={createSelectOptions('anunciActiu', [
                  { value: 'all', label: 'Actiu - Tots' },
                  { value: 'true', label: 'Actiu' },
                  { value: 'false', label: 'Inactiu' }
                ])}
                value={anunciActiuFilter}
                onValueChange={setAnunciActiuFilter}
                placeholder="Selecciona estat d'activitat"
                allowClear={false}
                showSearch={false}
              />

              {/* Anunci Destacat Filter */}
              <SearchableSelect
                options={createSelectOptions('anunciDestacat', [
                  { value: 'all', label: 'Destacat - Tots' },
                  { value: '0', label: 'No destacat' },
                  { value: '1', label: 'Destacat' }
                ])}
                value={anunciDestacatFilter}
                onValueChange={setAnunciDestacatFilter}
                placeholder="Selecciona si és destacat"
                allowClear={false}
                showSearch={false}
              />
            </div>

            {/* Clear Filters Button Row */}
            <div className="flex justify-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setTypeFilter('all');
                  setVenutFilter('all');
                  setReservatFilter('all');
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
              <div ref={headerRef} className="grid grid-cols-12 gap-1 p-4 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-300 text-sm">
                <div className="col-span-4 text-left">Vehicle</div>
                <div className="col-span-1 text-center">Preu</div>
                <div className="col-span-1 text-center">Motor</div>
                <div className="col-span-1 text-center">Busco</div>
                <div className="col-span-1 text-center">Dest</div>
                <div className="col-span-1 text-center">Actiu</div>
                <div className="col-span-1 text-center">Venut</div>
                <div className="col-span-1 text-center">Reserv</div>
                <div className="col-span-1 text-center">Accions</div>
              </div>

              {/* Vehicle Rows */}
              {vehicles.map((vehicle, index) => (
                <div key={vehicle.id} className={`grid grid-cols-12 gap-1 p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                  index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-100/80 dark:bg-gray-700/80'
                }`}>
                  {/* Vehicle Info */}
                  <div className="col-span-4 flex gap-3">
                    <div className="w-16 h-12 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                      {vehicle.imatgeDestacadaUrl ? (
                        <img 
                          src={vehicle.imatgeDestacadaUrl} 
                          alt={vehicle.titolAnunci}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Car className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {decodeHtmlEntities(vehicle.titolAnunci)}
                      </h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 mt-1">
                        {getVehicleTypeLabel(vehicle.tipusVehicle)}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {vehicle.any} • {vehicle.quilometratge} km
                      </p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 flex items-center justify-center">
                    <span className="font-semibold text-gray-900 dark:text-white text-sm">
                      {formatPrice(vehicle.preu)}
                    </span>
                  </div>


                  {/* Sync Motoraldia */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                    {syncingVehicles[vehicle.id] === 'motoraldia' ? (
                      <button disabled className="p-1.5 bg-gray-300 rounded flex items-center justify-center">
                        <Loader className="w-3 h-3 animate-spin" />
                      </button>
                    ) : vehicle.motorIdSync ? (
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => syncToMotoraldi(vehicle.id, vehicle.titolAnunci, true)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded flex items-center justify-center"
                          title="Eliminar de Motoraldia"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {vehicle.motorIdSync && (
                          <span className="text-xs text-gray-500 mt-1">Motor ID: {vehicle.motorIdSync}</span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          clearSyncLogs();
                          syncToMotoraldi(vehicle.id, vehicle.titolAnunci);
                        }}
                        className="p-1.5 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded flex items-center justify-center"
                        title="Sincronitzar amb Motoraldia"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Sync Busco */}
                  <div className="col-span-1 flex flex-col items-center justify-center gap-1">
                    {syncingVehicles[vehicle.id] === 'busco' ? (
                      <button disabled className="p-1.5 bg-gray-300 rounded flex items-center justify-center">
                        <Loader className="w-3 h-3 animate-spin" />
                      </button>
                    ) : vehicle.syncedToBuscoAt ? (
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => syncToBusco(vehicle.id, vehicle.titolAnunci, true)}
                          className="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded flex items-center justify-center"
                          title="Eliminar de Busco"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {vehicle.buscoVehicleId && (
                          <span className="text-xs text-gray-500 mt-1">{vehicle.buscoVehicleId}</span>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => syncToBusco(vehicle.id, vehicle.titolAnunci)}
                        className="p-1.5 bg-green-100 text-green-600 hover:bg-green-200 rounded flex items-center justify-center"
                        title="Sincronitzar amb Busco"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Destacat */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="scale-75">
                      <Switch
                        checked={vehicle.anunciDestacat === 1}
                        onCheckedChange={() => toggleVehicleDestacado(vehicle.id, vehicle.anunciDestacat.toString())}
                        className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>

                  {/* Actiu */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="scale-75">
                      <Switch
                        checked={vehicle.anunciActiu === true}
                        onCheckedChange={() => toggleVehicleStatus(vehicle.id, vehicle.anunciActiu)}
                        className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>

                  {/* Venut */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="scale-75">
                      <Switch
                        checked={vehicle.venut === true}
                        onCheckedChange={() => toggleVehicleVenut(vehicle.id, vehicle.venut)}
                        className="data-[state=checked]:bg-blue-400 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>

                  {/* Reservat */}
                  <div className="col-span-1 flex items-center justify-center">
                    <div className="scale-75">
                      <Switch
                        checked={vehicle.reservat === true}
                        onCheckedChange={() => toggleVehicleReservat(vehicle.id, vehicle.reservat)}
                        className="data-[state=checked]:bg-orange-600 data-[state=unchecked]:bg-gray-300"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 flex items-center justify-center">
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
                        onClick={() => openDeleteModal(vehicle.id, vehicle.titolAnunci)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
                        title="Eliminar vehicle"
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

            {/* Hidden file input for JSON import */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
            />
          </>
        )}

        {/* Brands and Models Tab */}
        {activeTab === 'brands-models' && (
          <ProtectedSection requireSuperAdmin fallback={
            <div className="text-center py-8 text-gray-500">
              <Filter className="w-12 h-12 mx-auto text-gray-300 mb-4" />
              <p>No tienes permisos para acceder a esta sección</p>
            </div>
          }>
            <BrandsModelsManager />
          </ProtectedSection>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar eliminació</AlertDialogTitle>
            <AlertDialogDescription>
              Estàs segur que vols eliminar el vehicle{' '}
              <span className="font-semibold">"{decodeHtmlEntities(vehicleToDelete?.title || '')}"</span>?
              <br />
              <span className="text-red-600 font-medium">
                Aquesta acció no es pot desfer.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteModalOpen(false)}>
              Cancel·lar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVehicle}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Eliminar vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Report Modal */}
      <Dialog open={importReportOpen} onOpenChange={setImportReportOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Informe d'Importació JSON
            </DialogTitle>
          </DialogHeader>
          
          {importReport && (
            <div className="flex-1 overflow-y-auto space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{importReport.total}</div>
                  <div className="text-sm text-blue-800">Total Vehicles</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{importReport.successful}</div>
                  <div className="text-sm text-green-800">Importats</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-red-600">{importReport.failed}</div>
                  <div className="text-sm text-red-800">Fallits</div>
                </div>
              </div>

              {/* Failed Vehicles Details */}
              {importReport.failed > 0 && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-red-700 flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Vehicles que han fallat ({importReport.failed})
                  </h3>
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {importReport.failedVehicles.map((failed, index) => (
                      <div key={index} className="p-3 border-b last:border-b-0 bg-red-50">
                        <div className="font-medium text-red-900">{failed.title}</div>
                        <div className="text-sm text-red-700 font-mono">{failed.slug}</div>
                        <div className="text-sm text-red-600 mt-1 bg-red-100 p-2 rounded">
                          <strong>Error:</strong> {failed.error}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Message */}
              {importReport.failed === 0 && (
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-green-800 font-medium">
                    ✅ Tots els vehicles s'han importat correctament!
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={() => setImportReportOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Tancar
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sync All Confirmation Modal */}
      <AlertDialog open={syncAllModalOpen} onOpenChange={setSyncAllModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Confirmar sincronització massiva
            </AlertDialogTitle>
            <AlertDialogDescription>
              {syncAllPlatform && (
                <div className="space-y-3">
                  <p>
                    Estàs a punt de sincronitzar tots els vehicles actius i no sincronitzats amb{' '}
                    <span className="font-semibold">Motoraldia</span>.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <div className="text-yellow-600 mt-0.5">⚠️</div>
                      <div className="text-sm text-yellow-800">
                        <p className="font-medium mb-1">Informació important:</p>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Només es sincronitzaran vehicles actius i no sincronitzats prèviament</li>
                          <li>El procés pot trigar diversos minuts segons el nombre de vehicles</li>
                          <li>Es processaran en lots de 3 vehicles per evitar sobrecarregar el servidor</li>
                          <li>Rebràs notificacions del progrés durant el procés</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600">
                    Vehicles candidats: <span className="font-semibold">
                      {vehicles.filter(v => !v.motorIdSync && v.anunciActiu).length}
                    </span>
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSyncAllModalOpen(false)}>
              Cancel·lar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSyncAll}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Sincronitzar tots
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sync Logs Modal */}
      <Dialog open={syncLogModalOpen} onOpenChange={setSyncLogModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Logs de Sincronització Motoraldia
              <span className="text-sm text-gray-500">({syncLogs.length} entrades)</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-2">
            {syncLogs.map((log, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border-l-4 ${
                  log.level === 'error' ? 'bg-red-50 border-red-500' :
                  log.level === 'success' ? 'bg-green-50 border-green-500' :
                  log.level === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-blue-50 border-blue-500'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        log.level === 'error' ? 'bg-red-200 text-red-800' :
                        log.level === 'success' ? 'bg-green-200 text-green-800' :
                        log.level === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleString('ca-ES')}
                      </span>
                      {log.vehicleTitle && (
                        <span className="text-xs text-gray-700 bg-gray-200 px-2 py-1 rounded">
                          {log.vehicleTitle}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-800 mb-2">{log.message}</p>
                    
                    {/* API Response */}
                    {log.apiResponse && (
                      <details className="mt-2">
                        <summary className="text-xs text-blue-600 cursor-pointer hover:text-blue-800">
                          📤 Resposta de la API
                        </summary>
                        <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.apiResponse, null, 2)}
                        </pre>
                      </details>
                    )}
                    
                    {/* Error Details */}
                    {log.error && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                          ❌ Detalls de l'error
                        </summary>
                        <pre className="text-xs bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(log.error, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-between pt-4 border-t">
            <button
              onClick={clearSyncLogs}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
            >
              Netejar Logs
            </button>
            <button
              onClick={() => setSyncLogModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Tancar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
    </>
  );
};

export default KarsVehicles;