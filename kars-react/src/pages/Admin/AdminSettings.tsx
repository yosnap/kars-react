import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageCircle, Save, Phone, User, MessageSquare, RefreshCw, Database, Clock, CheckCircle, AlertCircle, Image, Settings, TestTube, Play, Users, Filter, Trash2, Eye, Calendar, Languages, Globe, Zap, Edit3, Plus, Search, Type } from 'lucide-react';
import AdminLayout from '../../components/Admin/AdminLayout';
import VehicleTranslationForm from '../../components/Admin/VehicleTranslationForm';
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

interface TranslationConfig {
  webhookUrl: string;
  username: string;
  password: string;
  enabled: boolean;
  autoTranslateNewVehicles: boolean;
  sourceLanguage: 'catalan' | 'spanish' | 'french' | 'english';
  targetLanguages: string[];
  timeout: number;
}

interface VehicleTranslation {
  id: string;
  key: string;
  category: 'technical' | 'features' | 'commercial' | 'general';
  ca: string;
  es: string;
  en: string;
  fr: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface VehicleTranslationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
}

interface MotorSyncOutConfig {
  username: string;
  password: string;
  apiUrl: string;
  autoExport: boolean;
  exportMode: 'all' | 'available' | 'sold';
}

interface BuscoSyncOutConfig {
  username: string;
  password: string;
  apiKey: string;
  userId: string;
  token: string;
  autoExport: boolean;
}

export default function AdminSettings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<'whatsapp' | 'api-sync' | 'motor-sync-out' | 'busco-sync-out' | 'translations' | 'vehicle-translations'>(() => {
    const tab = searchParams.get('tab');
    if (tab === 'whatsapp' || tab === 'api-sync' || tab === 'motor-sync-out' || tab === 'busco-sync-out' || tab === 'translations' || tab === 'vehicle-translations') {
      return tab;
    }
    return 'whatsapp';
  });
  
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

  const [translationConfig, setTranslationConfig] = useState<TranslationConfig>({
    webhookUrl: '',
    username: '',
    password: '',
    enabled: false,
    autoTranslateNewVehicles: false,
    sourceLanguage: 'catalan',
    targetLanguages: ['spanish', 'french', 'english'],
    timeout: 30000
  });

  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
  const [translationLoading, setTranslationLoading] = useState(false);

  // Motor Sync Out Configuration
  const [motorSyncOutConfig, setMotorSyncOutConfig] = useState<MotorSyncOutConfig>({
    username: '',
    password: '',
    apiUrl: 'https://api.motoraldia.com',
    autoExport: false,
    exportMode: 'all'
  });
  const [hasStoredPassword, setHasStoredPassword] = useState(false);

  // Busco Sync Out Configuration
  const [buscoSyncOutConfig, setBuscoSyncOutConfig] = useState<BuscoSyncOutConfig>({
    username: '',
    password: '',
    apiKey: '',
    userId: '',
    token: '',
    autoExport: false
  });

  // Vehicle translations states
  const [vehicleTranslations, setVehicleTranslations] = useState<VehicleTranslation[]>([]);
  const [vehicleTranslationsLoading, setVehicleTranslationsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingTranslation, setEditingTranslation] = useState<VehicleTranslation | null>(null);
  const [isAddingTranslation, setIsAddingTranslation] = useState(false);

  // Categories for vehicle translations
  const translationCategories: VehicleTranslationCategory[] = [
    { id: 'technical', name: 'Especificacions tècniques', description: 'Motor, potència, consum, etc.', color: 'blue' },
    { id: 'features', name: 'Característiques', description: 'Colors, tapisseria, equipament', color: 'green' },
    { id: 'commercial', name: 'Informació comercial', description: 'Estat, condició, garanties', color: 'purple' },
    { id: 'general', name: 'General', description: 'Altres traduccions generals', color: 'gray' }
  ];

  // Cargar configuración existente al montar el componente
  useEffect(() => {
    loadApiConfig();
    loadTranslationConfig();
    if (activeTab === 'api-sync') {
      loadSyncLogs();
    }
    if (activeTab === 'vehicle-translations') {
      loadVehicleTranslations();
    }
    if (activeTab === 'motor-sync-out') {
      loadMotorSyncOutConfig();
    }
    if (activeTab === 'busco-sync-out') {
      loadBuscoSyncOutConfig();
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

  const loadTranslationConfig = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/translation-config`, {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.config) {
          setTranslationConfig(result.config);
        }
      }
    } catch (error) {
      console.error('Error loading translation config:', error);
    }
  };

  const loadMotorSyncOutConfig = async () => {
    try {
      // Cargar desde la base de datos
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/motor-sync-out-config`, {
        method: 'GET',
        headers: {
          'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.config) {
          // Si la configuración viene de la BD y tiene username/apiUrl pero password vacío,
          // significa que hay una contraseña guardada (el backend no la devuelve por seguridad)
          const hasPassword = !!(result.config.username && result.config.apiUrl && 
                                 (!result.config.password || result.config.password === ''));
          setHasStoredPassword(hasPassword);
          setMotorSyncOutConfig(result.config);
          return;
        }
      }

      // Fallback a localStorage si la API falla
      const savedConfig = localStorage.getItem('motorSyncOutConfig');
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        setHasStoredPassword(!!config.password);
        setMotorSyncOutConfig(config);
      }
    } catch (error) {
      console.error('Error loading Motor sync out config:', error);
      // Fallback a localStorage en caso de error
      try {
        const savedConfig = localStorage.getItem('motorSyncOutConfig');
        if (savedConfig) {
          const config = JSON.parse(savedConfig);
          setHasStoredPassword(!!config.password);
          setMotorSyncOutConfig(config);
        }
      } catch (e) {
        console.error('Error loading from localStorage:', e);
      }
    }
  };

  const loadBuscoSyncOutConfig = async () => {
    try {
      // Cargar desde localStorage temporalmente
      const savedConfig = localStorage.getItem('buscoSyncOutConfig');
      if (savedConfig) {
        setBuscoSyncOutConfig(JSON.parse(savedConfig));
      }
    } catch (error) {
      console.error('Error loading Busco sync out config:', error);
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

  const handleTranslationChange = (field: keyof TranslationConfig, value: string | boolean | number | string[]) => {
    setTranslationConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMotorSyncOutChange = (field: keyof MotorSyncOutConfig, value: string | boolean) => {
    setMotorSyncOutConfig(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Si el usuario está cambiando la contraseña, ya no hay contraseña guardada
    if (field === 'password' && typeof value === 'string' && value) {
      setHasStoredPassword(false);
    }
  };

  const handleBuscoSyncOutChange = (field: keyof BuscoSyncOutConfig, value: string | boolean) => {
    setBuscoSyncOutConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTabChange = (tab: 'whatsapp' | 'api-sync' | 'motor-sync-out' | 'busco-sync-out' | 'translations' | 'vehicle-translations') => {
    setActiveTab(tab);
    setSearchParams({ tab });
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

  const testTranslationWebhook = async () => {
    setTranslationLoading(true);
    try {
      // Usar el endpoint del backend que maneja el test del webhook
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/test-translation-webhook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        }
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success('Webhook de traducció funcionant correctament');
      } else {
        console.error('Test webhook error response:', result);
        toast.error(result.error || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Translation webhook test error:', error);
      toast.error('Error en provar el webhook de traducció');
    } finally {
      setTranslationLoading(false);
    }
  };

  const saveTranslationConfig = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/translation-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify(translationConfig)
      });

      if (response.ok) {
        toast.success('Configuració de traduccions guardada correctament');
      } else {
        toast.error('Error en guardar la configuració de traduccions');
      }
    } catch (error) {
      console.error('Error saving translation config:', error);
      toast.error('Error en guardar la configuració');
    } finally {
      setLoading(false);
    }
  };

  const syncExistingTranslations = async () => {
    setTranslationLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/sync-translations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa('admin:Motoraldia.2025!')}`
        },
        body: JSON.stringify({
          webhookUrl: translationConfig.webhookUrl,
          username: translationConfig.username,
          password: translationConfig.password,
          sourceLanguage: translationConfig.sourceLanguage,
          targetLanguages: translationConfig.targetLanguages,
          timeout: translationConfig.timeout
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(`Sincronització de traduccions iniciada - ${result.vehiclesFound} vehicles trobats`);
      } else {
        toast.error(result.error || 'Error en sincronitzar traduccions');
      }
    } catch (error) {
      console.error('Error syncing translations:', error);
      toast.error('Error en sincronitzar traduccions');
    } finally {
      setTranslationLoading(false);
    }
  };

  const saveMotorSyncOutConfig = async () => {
    setLoading(true);
    try {
      // Preparar los datos a enviar
      let configToSend: Partial<MotorSyncOutConfig> = { ...motorSyncOutConfig };
      
      // Si hay una contraseña guardada y el campo está vacío, no enviar el campo password
      if (hasStoredPassword && !motorSyncOutConfig.password) {
        // Eliminar password del objeto para que el backend mantenga la contraseña existente
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...configWithoutPassword } = configToSend;
        configToSend = configWithoutPassword;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/motor-sync-out-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)
        },
        body: JSON.stringify(configToSend)
      });

      const result = await response.json();

      if (response.ok) {
        // Preparar configuración para localStorage (debe incluir password para sincronización)
        const configForLocalStorage = { ...motorSyncOutConfig };
        
        // Si había una contraseña guardada y no se cambió, mantener la anterior
        if (hasStoredPassword && !motorSyncOutConfig.password) {
          const existingConfig = localStorage.getItem('motorSyncOutConfig');
          if (existingConfig) {
            const existing = JSON.parse(existingConfig);
            configForLocalStorage.password = existing.password || '';
          }
        }
        
        // Guardar en localStorage (incluyendo password para uso local)
        localStorage.setItem('motorSyncOutConfig', JSON.stringify(configForLocalStorage));
        // Actualizar el estado de contraseña guardada
        setHasStoredPassword(true);
        toast.success('Configuració de Motor guardada correctament en la base de dades');
      } else {
        toast.error(result.error || 'Error al guardar la configuració');
      }
    } catch (error) {
      console.error('Error saving Motor sync out config:', error);
      toast.error('Error al guardar la configuració');
    } finally {
      setLoading(false);
    }
  };

  const saveBuscoSyncOutConfig = async () => {
    setLoading(true);
    try {
      // Guardar en localStorage temporalmente
      localStorage.setItem('buscoSyncOutConfig', JSON.stringify(buscoSyncOutConfig));
      
      // Simular delay de red
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Configuració de Busco guardada correctament');
    } catch (error) {
      console.error('Error saving Busco sync out config:', error);
      toast.error('Error al guardar la configuració');
    } finally {
      setLoading(false);
    }
  };

  const testMotorConnection = async () => {
    if (!motorSyncOutConfig.apiUrl || !motorSyncOutConfig.username || !motorSyncOutConfig.password) {
      toast.error('Omple tots els camps de connexió primer');
      return;
    }

    setLoading(true);
    try {
      // Simular test de connexió
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular resposta exitosa
      const success = Math.random() > 0.3; // 70% d'èxit
      
      if (success) {
        toast.success('Connexió establerta correctament amb Motoraldia');
      } else {
        toast.error('Error de connexió: Credencials incorrectes');
      }
    } catch (error) {
      console.error('Error testing Motor connection:', error);
      toast.error('Error al provar la connexió');
    } finally {
      setLoading(false);
    }
  };

  const testBuscoConnection = async () => {
    if (!buscoSyncOutConfig.username || !buscoSyncOutConfig.password || !buscoSyncOutConfig.apiKey) {
      toast.error('Omple tots els camps obligatoris primer');
      return;
    }

    setLoading(true);
    try {
      // Simular test de connexió
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simular resposta exitosa
      const success = Math.random() > 0.3; // 70% d'èxit
      
      if (success) {
        toast.success('Connexió establerta correctament amb Busco');
      } else {
        toast.error('Error de connexió: API Key incorrecte');
      }
    } catch (error) {
      console.error('Error testing Busco connection:', error);
      toast.error('Error al provar la connexió');
    } finally {
      setLoading(false);
    }
  };

  // Vehicle translations functions
  const loadVehicleTranslations = async () => {
    setVehicleTranslationsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/vehicle-translations`, {
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        setVehicleTranslations(result.translations || []);
      } else {
        console.error('Error loading vehicle translations');
        toast.error('Error carregant traduccions de vehicles');
      }
    } catch (error) {
      console.error('Error loading vehicle translations:', error);
      toast.error('Error carregant traduccions de vehicles');
    } finally {
      setVehicleTranslationsLoading(false);
    }
  };

  const saveVehicleTranslation = async (translation: Omit<VehicleTranslation, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const url = editingTranslation 
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/vehicle-translations/${editingTranslation.id}`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/vehicle-translations`;
      
      const method = editingTranslation ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        },
        body: JSON.stringify(translation)
      });

      if (response.ok) {
        toast.success(editingTranslation ? 'Traducció actualitzada correctament' : 'Traducció creada correctament');
        setEditingTranslation(null);
        setIsAddingTranslation(false);
        loadVehicleTranslations();
      } else {
        toast.error('Error guardant la traducció');
      }
    } catch (error) {
      console.error('Error saving vehicle translation:', error);
      toast.error('Error guardant la traducció');
    }
  };

  const deleteVehicleTranslation = async (id: string) => {
    if (!confirm('Estàs segur que vols eliminar aquesta traducció?')) {
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/vehicle-translations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        }
      });

      if (response.ok) {
        toast.success('Traducció eliminada correctament');
        loadVehicleTranslations();
      } else {
        toast.error('Error eliminant la traducció');
      }
    } catch (error) {
      console.error('Error deleting vehicle translation:', error);
      toast.error('Error eliminant la traducció');
    }
  };

  const initializeVehicleTranslations = async () => {
    setVehicleTranslationsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/vehicle-translations/initialize`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${import.meta.env.VITE_API_ADMIN_USER}:${import.meta.env.VITE_API_ADMIN_PASS}`)}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Traduccions inicialitzades: ${result.created} creades`);
        loadVehicleTranslations();
      } else {
        toast.error('Error inicialitzant traduccions');
      }
    } catch (error) {
      console.error('Error initializing vehicle translations:', error);
      toast.error('Error inicialitzant traduccions');
    } finally {
      setVehicleTranslationsLoading(false);
    }
  };

  // Filter translations based on search and category
  const filteredTranslations = vehicleTranslations.filter(translation => {
    const matchesSearch = searchTerm === '' || 
      translation.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.ca.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.es.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      translation.fr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || translation.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
              onClick={() => handleTabChange('whatsapp')}
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
              onClick={() => handleTabChange('api-sync')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'api-sync'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sincronización Motor - Entrada
              </div>
            </button>
            <button
              onClick={() => handleTabChange('motor-sync-out')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'motor-sync-out'
                  ? 'border-cyan-600 text-cyan-600 dark:border-cyan-400 dark:text-cyan-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sincronización Motor - Salida
              </div>
            </button>
            <button
              onClick={() => handleTabChange('busco-sync-out')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'busco-sync-out'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Sincronización Busco - Salida
              </div>
            </button>
            <button
              onClick={() => handleTabChange('translations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'translations'
                  ? 'border-purple-600 text-purple-600 dark:border-purple-400 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Languages className="w-4 h-4" />
                Traduccions
              </div>
            </button>
            <button
              onClick={() => handleTabChange('vehicle-translations')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'vehicle-translations'
                  ? 'border-orange-600 text-orange-600 dark:border-orange-400 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Traduccions Vehicles
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
                Sincronización Motor - Entrada
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configura la importación automática de vehículos desde Motoraldia
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

      {activeTab === 'translations' && (
        // Translation Configuration Section
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Languages className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Configuració de Traduccions Automàtiques
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura les traduccions automàtiques de descripcions de vehicles mitjançant n8n
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Webhook Configuration */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Globe className="w-5 h-5" />
                Configuració del Webhook N8N
              </h3>
              
              <div className="space-y-6">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Habilitar traduccions automàtiques
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Activar el sistema de traduccions automàtiques
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={translationConfig.enabled}
                      onChange={(e) => handleTranslationChange('enabled', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    URL del Webhook N8N
                  </label>
                  <input
                    type="url"
                    value={translationConfig.webhookUrl}
                    onChange={(e) => handleTranslationChange('webhookUrl', e.target.value)}
                    placeholder="https://your-n8n-instance.com/webhook/translate"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    URL del webhook de N8N que processarà les traduccions
                  </p>
                </div>

                {/* Credentials */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                      <User className="w-4 h-4" />
                      Usuari N8N
                    </label>
                    <input
                      type="text"
                      value={translationConfig.username}
                      onChange={(e) => handleTranslationChange('username', e.target.value)}
                      placeholder="username"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Usuari per a autenticació Basic Auth (opcional)
                    </p>
                  </div>
                  
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
                      <Database className="w-4 h-4" />
                      Contrasenya N8N
                    </label>
                    <input
                      type="password"
                      value={translationConfig.password}
                      onChange={(e) => handleTranslationChange('password', e.target.value)}
                      placeholder="password"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Contrasenya per a autenticació Basic Auth (opcional)
                    </p>
                  </div>
                </div>

                {/* Test Webhook Button */}
                <div className="flex gap-3">
                  <button
                    onClick={testTranslationWebhook}
                    disabled={translationLoading || !translationConfig.webhookUrl}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <TestTube className="w-4 h-4" />
                    {translationLoading ? 'Provant...' : 'Provar Webhook'}
                  </button>
                </div>
              </div>
            </div>

            {/* Language Configuration */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Languages className="w-5 h-5" />
                Configuració d'Idiomes
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Source Language */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Idioma d'origen
                  </label>
                  <select
                    value={translationConfig.sourceLanguage}
                    onChange={(e) => handleTranslationChange('sourceLanguage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="catalan">Català</option>
                    <option value="spanish">Espanyol</option>
                    <option value="french">Francès</option>
                    <option value="english">Anglès</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Idioma del text original que es traduirà
                  </p>
                </div>

                {/* Timeout */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Timeout (mil·lisegons)
                  </label>
                  <input
                    type="number"
                    min="5000"
                    max="120000"
                    step="1000"
                    value={translationConfig.timeout}
                    onChange={(e) => handleTranslationChange('timeout', parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Temps màxim d'espera per a les traduccions (5-120 segons)
                  </p>
                </div>
              </div>

              {/* Target Languages */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">
                  Idiomes de destinació
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['spanish', 'french', 'english'].map((lang) => {
                    const langLabels = {
                      spanish: 'Espanyol',
                      french: 'Francès', 
                      english: 'Anglès'
                    };
                    
                    return (
                      <label key={lang} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={translationConfig.targetLanguages.includes(lang)}
                          onChange={(e) => {
                            const newTargetLanguages = e.target.checked
                              ? [...translationConfig.targetLanguages, lang]
                              : translationConfig.targetLanguages.filter(l => l !== lang);
                            handleTranslationChange('targetLanguages', newTargetLanguages);
                          }}
                          className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {langLabels[lang as keyof typeof langLabels]}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Selecciona els idiomes als quals es traduiran les descripcions
                </p>
              </div>
            </div>

            {/* Auto-translation for new vehicles */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Zap className="w-5 h-5" />
                Traduccions Automàtiques
              </h3>
              
              <div className="space-y-4">
                {/* Auto-translate new vehicles toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Traduir automàticament nous vehicles
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Tradueix automàticament les descripcions en crear nous vehicles
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={translationConfig.autoTranslateNewVehicles}
                      onChange={(e) => handleTranslationChange('autoTranslateNewVehicles', e.target.checked)}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {/* Sync existing translations button */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Sincronitzar traduccions existents
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Tradueix les descripcions de tots els vehicles existents en la base de dades
                      </p>
                    </div>
                    <button
                      onClick={syncExistingTranslations}
                      disabled={translationLoading || !translationConfig.webhookUrl || !translationConfig.enabled}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <RefreshCw className={`w-4 h-4 ${translationLoading ? 'animate-spin' : ''}`} />
                      {translationLoading ? 'Sincronitzant...' : 'Sincronitzar Ara'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={saveTranslationConfig}
                disabled={loading}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardant...' : 'Guardar Configuració'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'motor-sync-out' && (
        // Motor Sync Out Section
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg">
                <RefreshCw className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sincronització Motor - Sortida
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura l'exportació automàtica de vehicles cap a Motoraldia
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Connection Configuration */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Database className="w-5 h-5" />
                Configuració API Motoraldia
              </h3>
              
              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
Usuari API
                  </label>
                  <input
                    type="text"
                    value={motorSyncOutConfig.username}
                    onChange={(e) => handleMotorSyncOutChange('username', e.target.value)}
                    placeholder="paulo"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Contrasenya API
                    {hasStoredPassword && (
                      <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                        ✓ Contrasenya guardada
                      </span>
                    )}
                  </label>
                  <input
                    type="password"
                    value={motorSyncOutConfig.password}
                    onChange={(e) => handleMotorSyncOutChange('password', e.target.value)}
                    placeholder={hasStoredPassword ? "Contrasenya guardada - deixa buit per mantenir" : "••••••••••"}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  {hasStoredPassword && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Deixa aquest camp buit per mantenir la contrasenya actual. Escriu una nova contrasenya per canviar-la.
                    </p>
                  )}
                </div>

                {/* User ID - No necesario, la API detecta el usuario automáticamente */}

                {/* API Base URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
URL Base de l'API
                  </label>
                  <input
                    type="url"
                    value={motorSyncOutConfig.apiUrl}
                    onChange={(e) => handleMotorSyncOutChange('apiUrl', e.target.value)}
                    placeholder="https://api.motoraldia.com"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
Introdueix l'URL base de l'API (per exemple: https://api.motoraldia.com)
                  </p>
                </div>
              </div>

              {/* Test Connection and Save Buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={testMotorConnection}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  {loading ? 'Provant...' : 'Provar Connexió'}
                </button>
                <button
                  onClick={saveMotorSyncOutConfig}
                  disabled={loading}
                  className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Guardant...' : 'Guardar Canvis'}
                </button>
              </div>
            </div>

            {/* Export Settings */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Settings className="w-5 h-5" />
                Configuració d'Exportació
              </h3>
              
              <div className="space-y-4">
                {/* Auto Export Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Exportació automàtica
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Exportar automàticament vehicles nous/modificats
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={motorSyncOutConfig.autoExport}
                      onChange={(e) => handleMotorSyncOutChange('autoExport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 dark:peer-focus:ring-cyan-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-cyan-600"></div>
                  </label>
                </div>

                {/* Export Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Mode d'exportació
                  </label>
                  <select
                    value={motorSyncOutConfig.exportMode}
                    onChange={(e) => handleMotorSyncOutChange('exportMode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  >
                    <option value="all">Tots els vehicles</option>
                    <option value="available">Només vehicles disponibles</option>
                    <option value="sold">Només vehicles venuts</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                Exportar Ara
              </button>
              
              <button
                onClick={saveMotorSyncOutConfig}
                disabled={loading}
                className="flex items-center gap-2 bg-cyan-600 text-white px-6 py-3 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardant...' : 'Guardar Configuració'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'busco-sync-out' && (
        // Busco Sync Out Section
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                <RefreshCw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Sincronització Busco - Sortida
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Configura l'exportació automàtica de vehicles cap a Busco
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-8">
            {/* Connection Configuration */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Database className="w-5 h-5" />
                Metas BuscoCotxe - Usuarios
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Busco Cotxe API Username
                  </label>
                  <input
                    type="text"
                    value={buscoSyncOutConfig.username}
                    onChange={(e) => handleBuscoSyncOutChange('username', e.target.value)}
                    placeholder="apibusco"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Name: buscocotxe_api_username
                  </p>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Busco Cotxe API Password
                  </label>
                  <input
                    type="password"
                    value={buscoSyncOutConfig.password}
                    onChange={(e) => handleBuscoSyncOutChange('password', e.target.value)}
                    placeholder="••••••••••"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Name: buscocotxe_api_password
                  </p>
                </div>

                {/* API Key */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Busco Cotxe API Key
                  </label>
                  <input
                    type="text"
                    value={buscoSyncOutConfig.apiKey}
                    onChange={(e) => handleBuscoSyncOutChange('apiKey', e.target.value)}
                    placeholder="XQhwLUsgGwK4QvEM58c7r0SnZ"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Name: buscocotxe_api_key
                  </p>
                </div>

                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Busco Cotxe User ID
                  </label>
                  <input
                    type="text"
                    value={buscoSyncOutConfig.userId}
                    onChange={(e) => handleBuscoSyncOutChange('userId', e.target.value)}
                    placeholder="35704"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Name: buscocotxe_user_id
                  </p>
                </div>

                {/* Token */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Busco Cotxe Token
                  </label>
                  <input
                    type="text"
                    value={buscoSyncOutConfig.token}
                    onChange={(e) => handleBuscoSyncOutChange('token', e.target.value)}
                    placeholder="EKuHBv9uwNf2hZ6KQGcXpqh74w3haB7E"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Name: buscocotxe_token
                  </p>
                </div>
              </div>

              {/* Test Connection Button */}
              <div className="mt-6">
                <button
                  onClick={testBuscoConnection}
                  disabled={loading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <TestTube className="w-4 h-4" />
                  {loading ? 'Provant...' : 'Provar Connexió'}
                </button>
              </div>
            </div>

            {/* Export Settings */}
            <div>
              <h3 className="flex items-center gap-2 text-md font-medium text-gray-900 dark:text-white mb-4">
                <Settings className="w-5 h-5" />
                Configuració d'Exportació
              </h3>
              
              <div className="space-y-4">
                {/* Auto Export Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900 dark:text-white">
                      Exportació automàtica
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Exportar automàticament vehicles nous/modificats
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={buscoSyncOutConfig.autoExport}
                      onChange={(e) => handleBuscoSyncOutChange('autoExport', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Category Mapping */}
                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Mapeig de categories
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Configura com es mapegen les categories de vehicles
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Cotxes</option>
                        <option>Motos</option>
                        <option>Furgonetes</option>
                      </select>
                      <span className="text-gray-500">→</span>
                      <select className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option>Categoria Busco</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                Exportar Ara
              </button>
              
              <button
                onClick={saveBuscoSyncOutConfig}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Guardant...' : 'Guardar Configuració'}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'vehicle-translations' && (
        // Vehicle Translations Management Section
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Globe className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                    Gestió de Traduccions de Vehicles
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Gestiona totes les traduccions utilitzades en les fitxes de vehicles
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={initializeVehicleTranslations}
                  disabled={vehicleTranslationsLoading}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Database className="w-4 h-4" />
                  Inicialitzar
                </button>
                <button
                  onClick={() => setIsAddingTranslation(true)}
                  className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Afegir Traducció
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* Search and Filter Section */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cercar traduccions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <div className="w-full md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Totes les categories</option>
                    {translationCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category Legend */}
              <div className="flex flex-wrap gap-3">
                {translationCategories.map((category) => (
                  <div key={category.id} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${category.color}-500`}></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {category.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {vehicleTranslations.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total traduccions
                </div>
              </div>
              {translationCategories.map((category) => (
                <div key={category.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {vehicleTranslations.filter(t => t.category === category.id).length}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {category.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Translations Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              {vehicleTranslationsLoading ? (
                <div className="p-8 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">Carregant traduccions...</p>
                </div>
              ) : filteredTranslations.length === 0 ? (
                <div className="p-8 text-center">
                  <Type className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedCategory !== 'all' ? 'No s\'han trobat traduccions amb els filtres aplicats' : 'No hi ha traduccions disponibles'}
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                    Afegeix la primera traducció per començar
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Clau/Categoria
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Català
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Espanyol
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Anglès
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Francès
                        </th>
                        <th className="p-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Accions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredTranslations.map((translation) => {
                        const category = translationCategories.find(c => c.id === translation.category);
                        return (
                          <tr key={translation.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="p-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900 dark:text-white font-mono text-sm">
                                  {translation.key}
                                </span>
                                <div className="flex items-center gap-2 mt-1">
                                  <div className={`w-2 h-2 rounded-full bg-${category?.color || 'gray'}-500`}></div>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {category?.name || 'Sense categoria'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {translation.ca}
                            </td>
                            <td className="p-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {translation.es}
                            </td>
                            <td className="p-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {translation.en}
                            </td>
                            <td className="p-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                              {translation.fr}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => setEditingTranslation(translation)}
                                  className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  title="Editar traducció"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => deleteVehicleTranslation(translation.id)}
                                  className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                  title="Eliminar traducció"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Translation Form Modal */}
      {(isAddingTranslation || editingTranslation) && (
        <VehicleTranslationForm
          translation={editingTranslation}
          categories={translationCategories}
          onSave={saveVehicleTranslation}
          onCancel={() => {
            setIsAddingTranslation(false);
            setEditingTranslation(null);
          }}
        />
      )}
    </AdminLayout>
  );
}