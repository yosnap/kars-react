import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { batteryTypes } from '../data/initialization/battery-types';
import { chargingCables } from '../data/initialization/charging-cables';
import { electricConnectors } from '../data/initialization/electric-connectors';
import { chargingSpeeds } from '../data/initialization/charging-speeds';
import { emissionTypes } from '../data/initialization/emission-types';

// Asegurar que las variables de entorno estén cargadas
dotenv.config();

const prisma = new PrismaClient();

// Variables para controlar el estado de sincronización
let isCurrentlyRunning = false;
let currentSyncId: string | null = null;
let cronJob: cron.ScheduledTask | null = null;

// Configuración del cliente axios para la API original
const originalApiClient = axios.create({
  baseURL: process.env.ORIGINAL_API_URL || 'https://motoraldia.net/wp-json/api-motor/v1',
  auth: {
    username: process.env.ORIGINAL_API_USER || 'Paulo',
    password: process.env.ORIGINAL_API_PASS || 'U^q^i2l49rZrX72#Ln!Xe5k0'
  },
  timeout: 30000
});

// Interfaz para los datos de vehículo de la API original
interface OriginalVehicle {
  id?: string | number;
  slug: string;
  'titol-anunci': string;
  'descripcio-anunci'?: string;
  descripcio?: string;
  preu: string;
  quilometratge?: string;
  'any-fabricacio'?: string;
  any?: string;
  'tipus-vehicle': string;
  'marca-cotxe'?: string;
  'marca-moto'?: string;
  'marques-cotxe'?: string;
  'marques-moto'?: string;
  'models-cotxe'?: string;
  'models-moto'?: string;
  model?: string;
  versio?: string;
  combustible?: string;
  'tipus-combustible'?: string;
  transmissio?: string;
  'tipus-canvi'?: string;
  traccio?: string;
  potencia?: string;
  'potencia-cv'?: string;
  cilindrada?: string;
  'num-portes'?: string;
  'portes-cotxe'?: string;
  color?: string;
  'color-vehicle'?: string;
  'anunci-actiu': boolean | string;
  venut: boolean | string;
  'anunci-destacat': boolean | number;
  'data-creacio': string;
  'data-modificacio'?: string;
  'imatge-destacada-url'?: string;
  imatges?: string[];
  'galeria-vehicle-urls'?: string[];
  'professional-id'?: string;
  author_id?: string;
  [key: string]: any; // Para campos adicionales
}

// Obtener configuración
async function getConfig() {
  const configs = await prisma.config.findMany();
  const configMap: Record<string, string> = {};
  
  configs.forEach(config => {
    configMap[config.key] = config.value;
  });

  // Valores por defecto
  return {
    sync_interval_minutes: '30',
    enable_auto_sync: 'false',
    max_vehicles_per_sync: '1000',
    blog_sync_interval_hours: '8',
    enable_blog_auto_sync: 'true',
    max_blog_posts_per_sync: '100',
    ...configMap
  };
}

/**
 * Función para buscar valor correcto en las colecciones existentes
 */
async function findCorrectSlug(label: string, collectionType: 'FuelType' | 'ExteriorColor' | 'VehicleState' | 'BodyType' | 'TransmissionType' | 'UpholsteryType' | 'UpholsteryColor' | 'PropulsionType'): Promise<string | null> {
  if (!label || typeof label !== 'string') return null;
  
  try {
    let collection: { value: string } | null = null;
    
    // Solo buscar en colecciones que sabemos que existen
    switch (collectionType) {
      case 'FuelType':
        collection = await prisma.fuelType.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'ExteriorColor':
        collection = await prisma.exteriorColor.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'VehicleState':
        collection = await prisma.vehicleState.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'PropulsionType':
        collection = await prisma.propulsionType.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      // Para estas colecciones que no existen aún, devolver null para usar fallback
      case 'BodyType':
      case 'TransmissionType':
      case 'UpholsteryType':
      case 'UpholsteryColor':
        return null;
      default:
        console.warn(`Tipo de colección no soportado: ${collectionType}`);
        return null;
    }
    
    return collection?.value || null;
  } catch (error) {
    console.warn(`Error buscando slug para ${label} en ${collectionType}:`, error);
    return null;
  }
}

/**
 * Función helper para limpiar valores que pueden venir como arrays vacíos o strings vacíos
 */
function cleanFieldValue(value: any): string | null {
  // Si es un array, tomar el primer elemento no vacío
  if (Array.isArray(value)) {
    const firstValue = value.find(item => item && item !== '');
    return firstValue || null;
  }
  
  // Si es string vacío, convertir a null
  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }
  
  // Si es string válido, devolverlo
  if (typeof value === 'string') {
    return value;
  }
  
  // Para cualquier otro caso (null, undefined, etc.)
  return value || null;
}

/**
 * Función para normalizar strings a slug (campos sin colección específica)
 */
function normalizeToSlug(value: any): string | null {
  const cleanValue = cleanFieldValue(value);
  if (!cleanValue) return null;
  
  return cleanValue
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .trim()
    .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
}

/**
 * Convertir label a slug buscando en las colecciones de base de datos
 */
async function convertLabelToSlug(value: any, collectionType: 'FuelType' | 'ExteriorColor' | 'VehicleState' | 'BodyType' | 'TransmissionType' | 'UpholsteryType' | 'UpholsteryColor' | 'PropulsionType'): Promise<string | null> {
  const cleanValue = cleanFieldValue(value);
  if (!cleanValue) return null;
  
  // Primero buscar en la base de datos
  const foundSlug = await findCorrectSlug(cleanValue, collectionType);
  if (foundSlug) {
    return foundSlug;
  }
  
  // Si no se encuentra en la BD, log para revisar y devolver el valor original normalizado
  console.warn(`⚠️ No se encontró slug para "${cleanValue}" en colección ${collectionType}. Usando valor original.`);
  
  // Convertir a slug manualmente como fallback
  return cleanValue
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
    .trim()
    .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
}

/**
 * Convertir array de extras de labels a slugs
 */
async function convertExtrasToSlugs(extras: any[], vehicleType: string): Promise<string[]> {
  if (!Array.isArray(extras) || extras.length === 0) return [];
  
  try {
    // Para ahora, convertir cada extra a slug manualmente
    // En el futuro, cuando existan las colecciones CarExtras, MotorcycleExtras, etc.
    // se puede buscar en la BD como con los otros campos
    const convertedExtras = await Promise.all(
      extras.map(async (extra) => {
        if (!extra || typeof extra !== 'string') return null;
        
        // Convertir a slug manualmente por ahora
        return extra
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remover acentos
          .replace(/\./g, '') // Remover puntos
          .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
          .replace(/\s+/g, '-') // Espacios a guiones
          .replace(/-+/g, '-') // Múltiples guiones a uno solo
          .trim()
          .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
      })
    );
    
    // Filtrar valores null/undefined
    return convertedExtras.filter(extra => extra !== null && extra !== '') as string[];
  } catch (error) {
    console.warn(`Error convirtiendo extras para ${vehicleType}:`, error);
    return [];
  }
}

/**
 * Convertir campos específicos de vehículos eléctricos usando base de datos
 */
async function convertElectricFieldToSlug(label: string, fieldType: 'battery' | 'cable' | 'connector' | 'speed' | 'emission'): Promise<string | null> {
  if (!label || typeof label !== 'string') return null;
  
  try {
    let collection: { value: string } | null = null;
    
    switch (fieldType) {
      case 'battery':
        collection = await prisma.batteryType.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'cable':
        collection = await prisma.chargingCable.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'connector':
        collection = await prisma.electricConnector.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'speed':
        collection = await prisma.chargingSpeed.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      case 'emission':
        collection = await prisma.emissionType.findFirst({
          where: {
            OR: [
              { name: { equals: label, mode: 'insensitive' } }
            ]
          },
          select: { value: true }
        });
        break;
      default:
        return null;
    }
    
    if (collection) {
      return collection.value;
    }
    
    // Si no se encuentra en BD, buscar en datos estáticos como fallback
    let staticCollection;
    switch (fieldType) {
      case 'battery':
        staticCollection = batteryTypes.find(item => 
          item.catalan.toLowerCase() === label.toLowerCase() ||
          item.spanish.toLowerCase() === label.toLowerCase() ||
          item.french.toLowerCase() === label.toLowerCase() ||
          item.english.toLowerCase() === label.toLowerCase()
        );
        break;
      case 'cable':
        staticCollection = chargingCables.find(item => 
          item.catalan.toLowerCase() === label.toLowerCase() ||
          item.spanish.toLowerCase() === label.toLowerCase() ||
          item.french.toLowerCase() === label.toLowerCase() ||
          item.english.toLowerCase() === label.toLowerCase()
        );
        break;
      case 'connector':
        staticCollection = electricConnectors.find(item => 
          item.catalan.toLowerCase() === label.toLowerCase() ||
          item.spanish.toLowerCase() === label.toLowerCase() ||
          item.french.toLowerCase() === label.toLowerCase() ||
          item.english.toLowerCase() === label.toLowerCase()
        );
        break;
      case 'speed':
        staticCollection = chargingSpeeds.find(item => 
          item.catalan.toLowerCase() === label.toLowerCase() ||
          item.spanish.toLowerCase() === label.toLowerCase() ||
          item.french.toLowerCase() === label.toLowerCase() ||
          item.english.toLowerCase() === label.toLowerCase()
        );
        break;
      case 'emission':
        staticCollection = emissionTypes.find(item => 
          item.catalan.toLowerCase() === label.toLowerCase() ||
          item.spanish.toLowerCase() === label.toLowerCase() ||
          item.french.toLowerCase() === label.toLowerCase() ||
          item.english.toLowerCase() === label.toLowerCase()
        );
        break;
    }
    
    if (staticCollection) {
      console.log(`🔍 Found ${label} in static data for ${fieldType}: ${staticCollection.value}`);
      return staticCollection.value;
    }
    
    // Si no se encuentra, convertir manualmente a slug
    console.warn(`⚠️ No se encontró slug para "${label}" en ${fieldType}. Usando conversión manual.`);
    return label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
      .replace(/\s+/g, '-') // Espacios a guiones
      .replace(/-+/g, '-') // Múltiples guiones a uno solo
      .trim()
      .replace(/^-|-$/g, ''); // Remover guiones al inicio y final
  
  } catch (error) {
    console.warn(`Error buscando slug para ${label} en ${fieldType}:`, error);
    return null;
  }
}

// Inicializar el cron job automático
export async function initializeCronSync() {
  try {
    const config = await getConfig();
    
    if (config.enable_auto_sync !== 'true') {
      console.log('🔄 Auto-sync disabled');
      return;
    }

    const interval = parseInt(config.sync_interval_minutes) || 30;
    const cronExpression = `*/${interval} * * * *`; // Cada X minutos

    if (cronJob) {
      cronJob.stop();
    }

    cronJob = cron.schedule(cronExpression, async () => {
      if (!isCurrentlyRunning) {
        console.log('🔄 Starting scheduled incremental sync...');
        await startIncrementalSync();
      } else {
        console.log('⏳ Sync already running, skipping scheduled sync');
      }
    }, {
      scheduled: true,
      timezone: "Europe/Andorra"
    });

    console.log(`🔄 Auto-sync initialized: every ${interval} minutes`);
    
  } catch (error) {
    console.error('❌ Error initializing cron sync:', error);
  }
}

// Obtener estado actual de sincronización
export async function getSyncStatus() {
  try {
    const currentSync = currentSyncId ? await prisma.syncLog.findUnique({
      where: { id: currentSyncId }
    }) : null;

    const lastCompletedSync = await prisma.syncLog.findFirst({
      where: { status: 'completed' },
      orderBy: { completedAt: 'desc' }
    });

    const config = await getConfig();

    return {
      isRunning: isCurrentlyRunning,
      currentSync,
      lastCompletedSync,
      config,
      nextScheduledSync: cronJob ? 'Active' : 'Disabled'
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    throw error;
  }
}

// Iniciar sincronización completa
export async function startFullSync(type: string = 'full'): Promise<string> {
  if (isCurrentlyRunning) {
    throw new Error('Sync already running');
  }

  const syncLog = await prisma.syncLog.create({
    data: {
      type,
      status: 'running',
      startedAt: new Date()
    }
  });

  isCurrentlyRunning = true;
  currentSyncId = syncLog.id;

  // Ejecutar sync en background
  performFullSync(syncLog.id).catch(error => {
    console.error('❌ Full sync failed:', error);
  });

  return syncLog.id;
}

// Iniciar sincronización incremental
export async function startIncrementalSync(since?: Date | null, specificSlug?: string): Promise<string> {
  if (isCurrentlyRunning && !specificSlug) {
    throw new Error('Sync already running');
  }

  const type = specificSlug ? 'webhook' : 'incremental';
  
  const syncLog = await prisma.syncLog.create({
    data: {
      type,
      status: 'running',
      startedAt: new Date()
    }
  });

  if (!specificSlug) {
    isCurrentlyRunning = true;
    currentSyncId = syncLog.id;
  }

  // Ejecutar sync en background
  performIncrementalSync(syncLog.id, since, specificSlug).catch((error: any) => {
    console.error('❌ Incremental sync failed:', error);
  });

  return syncLog.id;
}

// Realizar sincronización completa con per_page=-1
async function performFullSync(syncId: string) {
  let vehiclesProcessed = 0;
  let vehiclesCreated = 0;
  let vehiclesUpdated = 0;
  let vehiclesDeleted = 0;

  try {
    console.log('🔄 Starting full sync with individual vehicle details and date-based updates...');

    const config = await getConfig();
    const maxVehicles = parseInt(config.max_vehicles_per_sync) || 1000;

    // Obtener vehículos de la API original con paginación
    console.log('📋 Fetching vehicles from external API with pagination...');
    
    let allVehicles: any[] = [];
    let currentPage = 1;
    let totalPages = 1;
    const perPage = 100; // Páginas más pequeñas para evitar timeouts
    
    do {
      console.log(`📄 Fetching page ${currentPage}/${totalPages} (${perPage} vehicles per page)...`);
      
      const response = await originalApiClient.get('/vehicles', {
        params: {
          page: currentPage,
          per_page: perPage,
          user_id: 113  // Filtrar solo vehículos del propietario Kars.ad
        }
      });
      
      const vehicles = response.data.items || response.data || [];
      allVehicles = allVehicles.concat(vehicles);
      
      totalPages = response.data.pages || 1;
      console.log(`📊 Page ${currentPage}: Found ${vehicles.length} vehicles. Total so far: ${allVehicles.length}`);
      
      currentPage++;
      
      // Limite de seguridad para evitar bucles infinitos
      if (currentPage > 50) {
        console.warn('⚠️ Reached maximum page limit (50), stopping pagination');
        break;
      }
      
    } while (currentPage <= totalPages);

    console.log(`📊 Total vehicles found in external API: ${allVehicles.length}`);
    
    if (allVehicles.length === 0) {
      console.error('⚠️ No vehicles found in API response!');
    }
    
    const existingSlugs = new Set<string>();

    // Procesar vehículos en lotes de 100
    const batchSize = 100;
    console.log(`📦 Processing ${allVehicles.length} vehicles in batches of ${batchSize}...`);
    
    for (let i = 0; i < allVehicles.length; i += batchSize) {
      if (vehiclesProcessed >= maxVehicles) break;
      
      const batch = allVehicles.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allVehicles.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} vehicles)...`);
      
      for (const vehicleBasic of batch) {
        if (vehiclesProcessed >= maxVehicles) break;
        
        try {
          existingSlugs.add(vehicleBasic.slug);
          
          console.log(`🔄 Processing vehicle: ${vehicleBasic.slug} (ID: ${vehicleBasic.id})`);
          
          const result = await syncVehicle(vehicleBasic);
          
          if (result === 'created') vehiclesCreated++;
          else if (result === 'updated') vehiclesUpdated++;
          
          console.log(`✅ ${result} vehicle ${vehicleBasic.slug}`);
          
          vehiclesProcessed++;

        } catch (error) {
          console.error(`❌ Error syncing vehicle ${vehicleBasic.id}:`, error);
        }
      }
      
      // Actualizar progreso después de cada lote
      await prisma.syncLog.update({
        where: { id: syncId },
        data: {
          vehiclesProcessed,
          vehiclesCreated,
          vehiclesUpdated
        }
      });
      
      console.log(`📊 Batch ${batchNumber} completed. Progress: ${vehiclesProcessed}/${allVehicles.length} vehicles processed`);
      
      // Pausa de 1 segundo entre lotes para evitar sobrecarga
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Eliminar vehículos que ya no existen en la API original
    const vehiclesToDelete = await prisma.vehicle.findMany({
      where: {
        slug: { notIn: Array.from(existingSlugs) }
      },
      select: { id: true, slug: true }
    });

    if (vehiclesToDelete.length > 0) {
      await prisma.vehicle.deleteMany({
        where: {
          id: { in: vehiclesToDelete.map(v => v.id) }
        }
      });
      vehiclesDeleted = vehiclesToDelete.length;
    }

    // Completar sincronización
    await prisma.syncLog.update({
      where: { id: syncId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated,
        vehiclesDeleted
      }
    });

    console.log(`✅ Full sync completed: ${vehiclesProcessed} processed, ${vehiclesCreated} created, ${vehiclesUpdated} updated, ${vehiclesDeleted} deleted`);

  } catch (error) {
    console.error('❌ Full sync error:', error);
    
    await prisma.syncLog.update({
      where: { id: syncId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated,
        vehiclesDeleted,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  } finally {
    isCurrentlyRunning = false;
    currentSyncId = null;
  }
}

// Realizar sincronización incremental
async function performIncrementalSync(syncId: string, since?: Date | null, specificSlug?: string) {
  let vehiclesProcessed = 0;
  let vehiclesCreated = 0;
  let vehiclesUpdated = 0;

  try {
    console.log('🔄 Starting incremental sync...', { since, specificSlug });

    if (specificSlug) {
      // Sincronizar vehículo específico
      const response = await originalApiClient.get(`/vehicles/${specificSlug}`);
      const vehicle = response.data;
      
      if (vehicle) {
        const result = await syncVehicle(vehicle);
        if (result === 'created') vehiclesCreated++;
        else if (result === 'updated') vehiclesUpdated++;
        vehiclesProcessed = 1;
      }
    } else {
      // Sincronización incremental basada en fecha
      const lastSync = since || await getLastSuccessfulSyncDate();
      
      const response = await originalApiClient.get('/vehicles', {
        params: {
          per_page: 100,
          user_id: 113,  // Filtrar solo vehículos del propietario Kars.ad
          // Aquí asumo que la API original soporta filtrado por fecha
          ...(lastSync && { 'data-modificacio': lastSync.toISOString() })
        }
      });

      const vehicles = response.data.items || response.data || [];

      for (const vehicle of vehicles) {
        try {
          const result = await syncVehicle(vehicle);
          
          if (result === 'created') vehiclesCreated++;
          else if (result === 'updated') vehiclesUpdated++;
          
          vehiclesProcessed++;
        } catch (error) {
          console.error(`❌ Error syncing vehicle ${vehicle.slug}:`, error);
        }
      }
    }

    // Completar sincronización
    await prisma.syncLog.update({
      where: { id: syncId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated
      }
    });

    console.log(`✅ Incremental sync completed: ${vehiclesProcessed} processed, ${vehiclesCreated} created, ${vehiclesUpdated} updated`);

  } catch (error) {
    console.error('❌ Incremental sync error:', error);
    
    await prisma.syncLog.update({
      where: { id: syncId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  } finally {
    if (!specificSlug) {
      isCurrentlyRunning = false;
      currentSyncId = null;
    }
  }
}

// Sincronizar un vehículo individual
export async function syncVehicle(vehicle: OriginalVehicle): Promise<'created' | 'updated'> {
  console.log('🔍 Vehicle data received:', { id: vehicle.id, slug: vehicle.slug, 'imatge-destacada-url': vehicle['imatge-destacada-url'] });
  
  // Convertir anunci-destacat a número
  let anunciDestacat = 0;
  const destacatValue = vehicle['anunci-destacat'];
  
  // Log para debug
  if (destacatValue !== undefined && destacatValue !== 0 && destacatValue !== false) {
    if (typeof destacatValue === 'string' && destacatValue !== '0') {
      console.log('🌟 Vehicle destacado encontrado (string):', {
        slug: vehicle.slug,
        'anunci-destacat': destacatValue,
        type: typeof destacatValue
      });
    } else if (destacatValue) {
      console.log('🌟 Vehicle destacado encontrado:', {
        slug: vehicle.slug,
        'anunci-destacat': destacatValue,
        type: typeof destacatValue
      });
    }
  }
  
  if (typeof destacatValue === 'boolean' && destacatValue) {
    anunciDestacat = 1;
  } else if (typeof destacatValue === 'number') {
    anunciDestacat = destacatValue;
  } else if (typeof destacatValue === 'string' && destacatValue !== '0') {
    anunciDestacat = parseInt(destacatValue) || 0;
  }

  // Resolver conversiones async primero
  const [
    tipusCombustible,
    tipusCanvi,
    colorVehicle,
    estatVehicle,
    carrosseriaCotxe,
    carrosseriaMoto,
    carrosseriaCaravana,
    tipusTapisseria,
    colorTapisseria,
    tipusPropulsor,
    extresCotxeConverted,
    extresMotoConverted,
    extresAutocaravanaConverted,
    extresHabitacleConverted,
    bateria,
    cablesRecarrega,
    connectors,
    velocitatRecarrega,
    emissionsVehicle
  ] = await Promise.all([
    convertLabelToSlug(vehicle['tipus-combustible'] || vehicle.combustible, 'FuelType'),
    convertLabelToSlug(vehicle['tipus-canvi'] || vehicle.transmissio, 'TransmissionType'),
    convertLabelToSlug(vehicle['color-vehicle'] || vehicle.color, 'ExteriorColor'),
    convertLabelToSlug(vehicle['estat-vehicle'], 'VehicleState'),
    convertLabelToSlug(vehicle['carroseria-cotxe'], 'BodyType'),
    convertLabelToSlug(vehicle['carroseria-moto'], 'BodyType'),
    convertLabelToSlug(vehicle['carroseria-caravana'], 'BodyType'),
    convertLabelToSlug(vehicle['tipus-tapisseria'], 'UpholsteryType'),
    convertLabelToSlug(vehicle['color-tapisseria'], 'UpholsteryColor'),
    convertLabelToSlug(vehicle['tipus-propulsor'], 'PropulsionType'),
    convertExtrasToSlugs(vehicle['extres-cotxe'] || [], 'cotxe'),
    convertExtrasToSlugs(vehicle['extres-moto'] || [], 'moto'),
    convertExtrasToSlugs(vehicle['extres-autocaravana'] || [], 'autocaravana'),
    convertExtrasToSlugs(vehicle['extres-habitacle'] || [], 'habitacle'),
    convertElectricFieldToSlug(vehicle.bateria, 'battery'),
    convertElectricFieldToSlug(cleanFieldValue(vehicle['cables-recarrega']) || '', 'cable'),
    convertElectricFieldToSlug(cleanFieldValue(vehicle.connectors) || '', 'connector'),
    convertElectricFieldToSlug(vehicle['velocitat-recarrega'], 'speed'),
    convertElectricFieldToSlug(vehicle['emissions-vehicle'], 'emission')
  ]);

  // Preparar datos usando la MISMA LÓGICA que karsImportService.ts
  const vehicleData = {
    originalId: vehicle.id?.toString() || vehicle.slug || 'unknown',
    slug: vehicle.slug || `vehicle-${Date.now()}`,
    status: vehicle.status || 'publish',
    titolAnunci: vehicle['titol-anunci'] || 'Sin título',
    descripcioAnunci: vehicle['descripcio-anunci'] || vehicle.descripcio || null,
    preu: parseFloat(vehicle.preu) || 0,
    quilometratge: vehicle.quilometratge || '0',
    any: vehicle['any'] || vehicle['any-fabricacio'] || null,
    tipusVehicle: (vehicle['tipus-vehicle'] || 'COTXE').toLowerCase(),
    marcaCotxe: (() => {
      const marcaCotxeValue = vehicle['marques-cotxe'] || vehicle['marca-cotxe'];
      return marcaCotxeValue ? marcaCotxeValue.toLowerCase() : null;
    })(),
    marcaMoto: (() => {
      const marcaMotoValue = vehicle['marques-moto'] || vehicle['marca-moto'];
      return marcaMotoValue ? marcaMotoValue.toLowerCase() : null;
    })(),
    modelsCotxe: normalizeToSlug(vehicle['models-cotxe'] || vehicle.model),
    modelsMoto: normalizeToSlug(vehicle['models-moto']),
    marquesAutocaravana: vehicle['marques-autocaravana'] || null,
    modelsAutocaravana: vehicle['models-autocaravana'] || null,
    versio: vehicle.versio || null,
    tipusCombustible,
    tipusCanvi,
    tipusPropulsor,
    traccio: normalizeToSlug(vehicle.traccio),
    potenciaCv: vehicle['potencia-cv'] || vehicle.potencia || null,
    potenciaKw: vehicle['potencia-kw'] || null,
    cilindrada: vehicle.cilindrada || null,
    portesCotxe: vehicle['portes-cotxe'] || vehicle['num-portes'] || null,
    colorVehicle,
    anunciActiu: vehicle['anunci-actiu'] === true || vehicle['anunci-actiu'] === 'true',
    venut: vehicle.venut === true || vehicle.venut === 'true',
    anunciDestacat,
    dataCreacio: new Date(vehicle['data-creacio'] || new Date()),
    diesCaducitat: vehicle['dies-caducitat'] || null,
    estatVehicle,
    carrosseriaCotxe,
    carrosseriaMoto,
    carrosseriaCaravana,
    // Campos de estado y garantías
    garantia: vehicle.garantia === true || vehicle.garantia === 'true' ? 'si' : 'no',
    vehicleAccidentat: vehicle['vehicle-accidentat'] === true || vehicle['vehicle-accidentat'] === 'true' ? 'si' : 'no',
    llibreManteniment: vehicle['llibre-manteniment'] === true || vehicle['llibre-manteniment'] === 'true',
    revisionsOficials: vehicle['revisions-oficials'] === true || vehicle['revisions-oficials'] === 'true',
    impostosDeduibles: vehicle['impostos-deduibles'] === true || vehicle['impostos-deduibles'] === 'true',
    vehicleACanvi: vehicle['vehicle-a-canvi'] === true || vehicle['vehicle-a-canvi'] === 'true',
    nombrePropietaris: vehicle['nombre-propietaris'] || null,
    // Campos de características físicas
    placesCotxe: vehicle['places-cotxe'] || null,
    aireAcondicionat: cleanFieldValue(vehicle['aire-acondicionat']),
    tipusTapisseria,
    colorTapisseria,
    climatitzacio: vehicle.climatitzacio === true || vehicle.climatitzacio === 'true',
    vehicleFumador: vehicle['vehicle-fumador'] === true || vehicle['vehicle-fumador'] === 'true',
    rodaRecanvi: normalizeToSlug(vehicle['roda-recanvi']),
    numeroMaletersCotxe: vehicle['numero-maleters-cotxe'] || null,
    // Campos para vehículos eléctricos
    autonomiaWltp: vehicle['autonomia-wltp'] || null,
    autonomiaUrbanaWltp: vehicle['autonomia-urbana-wltp'] || null,
    autonomiaExtraurbanaWltp: vehicle['autonomia-extraurbana-wltp'] || null,
    autonomiaElectrica: vehicle['autonomia-electrica'] || null,
    bateria,
    cablesRecarrega,
    connectors,
    velocitatRecarrega,
    frenadaRegenerativa: cleanFieldValue(vehicle['frenada-regenerativa']),
    onePedal: cleanFieldValue(vehicle['one-pedal']),
    tempsRecarregaTotal: vehicle['temps-recarrega-total'] || null,
    tempsRecarregaFins80: vehicle['temps-recarrega-fins-80'] || null,
    // Campos de motor
    numeroMotors: vehicle['numero-motors'] || null,
    cvMotorDavant: vehicle['cv-motor-davant'] || null,
    kwMotorDavant: vehicle['kw-motor-davant'] || null,
    cvMotorDarrere: vehicle['cv-motor-darrere'] || null,
    kwMotorDarrere: vehicle['kw-motor-darrere'] || null,
    potenciaCombinada: vehicle['potencia-combinada'] || null,
    emissionsVehicle,
    // Extras - convertidos a slugs
    extresCotxe: extresCotxeConverted,
    extresMoto: extresMotoConverted,
    extresAutocaravana: extresAutocaravanaConverted,
    extresHabitacle: extresHabitacleConverted,
    // Campos adicionales del payload de 88 campos
    tipusCanviMoto: vehicle['tipus-de-canvi-moto'] || null,
    placesMoto: vehicle['places-moto'] || null,
    capacitatTotalL: vehicle['capacitat-total-l'] || null,
    preuMensual: vehicle['preu-mensual'] || null,
    preuDiari: vehicle['preu-diari'] || null,
    preuAntic: vehicle['preu-antic'] || null,
    velocitatMaxima: vehicle['velocitat-maxima'] || null,
    acceleracio0100Cotxe: vehicle['acceleracio-0-100-cotxe'] || null,
    capacitatMaletersCotxe: vehicle['capacitat-maleters-cotxe'] || null,
    videoVehicle: vehicle['video-vehicle'] || null,
    cvMotor3: vehicle['cv-motor-3'] || null,
    kwMotor3: vehicle['kw-motor-3'] || null,
    cvMotor4: vehicle['cv-motor-4'] || null,
    kwMotor4: vehicle['kw-motor-4'] || null,
    
    // Campos adicionales que faltaban
    marquesComercial: vehicle['marques-comercial'] || null,
    modelsComercial: vehicle['models-comercial'] || null,
    categoriaEcologica: vehicle['categoria-ecologica'] || null,
    consumCarretera: vehicle['consum-carretera'] || null,
    consumMixt: vehicle['consum-mixt'] || null,
    consumUrba: vehicle['consum-urba'] || null,
    emissionsCo2: vehicle['emissions-co2'] || null,
    acceleracio060: vehicle['acceleracio-0-60'] || null,
    notesInternes: vehicle['notes-internes'] || null,
    
    // Imágenes - MUY IMPORTANTE
    imatgeDestacadaUrl: vehicle['imatge-destacada-url'] || (vehicle.imatges && vehicle.imatges[0]) || null,
    galeriaVehicleUrls: vehicle['galeria-vehicle-urls'] || vehicle.imatges || [],
    authorId: vehicle['author_id'] || vehicle['professional-id'] || null,
    professionalId: vehicle['professional-id'] || vehicle['author_id'] || null,
    lastSyncAt: new Date()
  };

  // Verificar si el vehículo ya existe
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { slug: vehicle.slug }
  });

  if (existingVehicle) {
    // Actualizar vehículo existente
    await prisma.vehicle.update({
      where: { slug: vehicle.slug },
      data: vehicleData
    });
    console.log(`🔄 Updated existing vehicle: ${vehicle.slug}`);
    return 'updated';
  } else {
    // Crear nuevo vehículo
    await prisma.vehicle.create({
      data: vehicleData
    });
    console.log(`✨ Created new vehicle: ${vehicle.slug}`);
    return 'created';
  }
}

// Obtener fecha de la última sincronización exitosa
async function getLastSuccessfulSyncDate(): Promise<Date | null> {
  const lastSync = await prisma.syncLog.findFirst({
    where: { status: 'completed' },
    orderBy: { completedAt: 'desc' }
  });

  return lastSync?.completedAt || null;
}

// Detener cron job
export function stopCronSync() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('🛑 Cron sync stopped');
  }
}

// Funciones placeholder para evitar errores de TypeScript
export async function initializeBlogCronSync() {
  console.log('📚 Blog sync not implemented yet');
}

export function stopBlogCronSync() {
  console.log('📚 Blog sync stop not implemented yet');
}

export async function syncBlogPosts(type: string = 'manual', batchSize: number = 50) {
  console.log(`📚 Blog posts sync not implemented yet (${type})`);
  return { postsProcessed: 0, postsCreated: 0, postsUpdated: 0 };
}

export async function syncAllProfessionals() {
  console.log('👥 Professionals sync not implemented yet');
  return { usersCreated: 0, usersUpdated: 0, errors: 0 };
}

// Funciones adicionales necesarias para los endpoints
export async function syncBrandsAndModels() {
  console.log('🏷️ Starting brands and models sync...');
  
  try {
    // Clear all existing brands and models to avoid corruption issues
    console.log('🧹 Clearing existing brands and models to avoid data corruption...');
    try {
      await prisma.$runCommandRaw({
        delete: 'Model',
        deletes: [{ q: {}, limit: 0 }]
      });
      console.log('✅ Cleared all models');
      
      await prisma.$runCommandRaw({
        delete: 'Brand',
        deletes: [{ q: {}, limit: 0 }]
      });
      console.log('✅ Cleared all brands');
    } catch (cleanupError) {
      console.warn('⚠️ Cleanup warning (continuing):', cleanupError);
    }
    
    // Import brands first
    const brandsResult = await importBrandsFromAPI();
    console.log(`✅ Brands sync completed: ${brandsResult.created} created, ${brandsResult.updated} updated`);
    
    // Then import models for all brands
    const modelsResult = await importModelsForAllBrands();
    console.log(`✅ Models sync completed: ${modelsResult.created} created, ${modelsResult.skipped} skipped`);
    
    return {
      brandsCreated: brandsResult.created,
      brandsUpdated: brandsResult.updated,
      modelsCreated: modelsResult.created,
      modelsSkipped: modelsResult.skipped
    };
  } catch (error) {
    console.error('❌ Error in brands and models sync:', error);
    throw error;
  }
}

async function importBrandsFromAPI() {
  const MOTORALDIA_API = 'https://api.motoraldia.com/wp-json/api-motor/v1';
  let created = 0;
  let updated = 0;
  
  try {
    // Import car brands
    console.log('🚗 Importing car brands...');
    const carBrandsResponse = await axios.get(`${MOTORALDIA_API}/marques-cotxe`, { timeout: 30000 });
    const carBrands = carBrandsResponse.data?.data || [];
    
    // Process car brands using raw MongoDB operations
    const carBrandsToInsert: any[] = [];
    for (const brand of carBrands) {
      if (!brand.value || !brand.label) continue;
      
      const existing = await prisma.brand.findFirst({
        where: { 
          slug: brand.value,
          vehicleTypes: { hasSome: ['car'] }
        }
      });
      
      if (!existing) {
        const now = new Date();
        carBrandsToInsert.push({
          name: brand.label,
          slug: brand.value,
          vehicle_type: 'car',
          created_at: now,
          updated_at: now,
          last_sync_at: now
        });
      } else {
        await prisma.brand.updateMany({
          where: { 
            slug: brand.value,
            vehicleTypes: { hasSome: ['car'] }
          },
          data: { name: brand.label }
        });
        updated++;
      }
    }
    
    // Use raw MongoDB insert for new brands
    if (carBrandsToInsert.length > 0) {
      await prisma.$runCommandRaw({
        insert: 'Brand',
        documents: carBrandsToInsert
      });
      created += carBrandsToInsert.length;
      console.log(`✅ Inserted ${carBrandsToInsert.length} car brands`);
    }
    
    // Import motorcycle brands
    console.log('🏍️ Importing motorcycle brands...');
    const motoBrandsResponse = await axios.get(`${MOTORALDIA_API}/marques-moto`, { timeout: 30000 });
    const motoBrands = motoBrandsResponse.data?.data || [];
    
    // Process motorcycle brands using raw MongoDB operations
    const motoBrandsToInsert: any[] = [];
    for (const brand of motoBrands) {
      if (!brand.value || !brand.label) continue;
      
      const existing = await prisma.brand.findFirst({
        where: { 
          slug: brand.value,
          vehicleTypes: { hasSome: ['motorcycle'] }
        }
      });
      
      if (!existing) {
        const now = new Date();
        motoBrandsToInsert.push({
          name: brand.label,
          slug: brand.value,
          vehicle_type: 'motorcycle',
          created_at: now,
          updated_at: now,
          last_sync_at: now
        });
      } else {
        await prisma.brand.updateMany({
          where: { 
            slug: brand.value,
            vehicleTypes: { hasSome: ['motorcycle'] }
          },
          data: { name: brand.label }
        });
        updated++;
      }
    }
    
    // Use raw MongoDB insert for new brands
    if (motoBrandsToInsert.length > 0) {
      await prisma.$runCommandRaw({
        insert: 'Brand',
        documents: motoBrandsToInsert
      });
      created += motoBrandsToInsert.length;
      console.log(`✅ Inserted ${motoBrandsToInsert.length} motorcycle brands`);
    }
    
    return { created, updated };
  } catch (error) {
    console.error('❌ Error importing brands:', error);
    throw error;
  }
}

async function importModelsForAllBrands() {
  const MOTORALDIA_API = 'https://api.motoraldia.com/wp-json/api-motor/v1';
  let created = 0;
  let skipped = 0;
  
  try {
    // Get all brands
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleTypes: true
      }
    });
    console.log(`📋 Found ${brands.length} brands to sync models for`);
    
    // Process in batches of 5 to avoid overloading the API
    const batchSize = 5;
    for (let i = 0; i < brands.length; i += batchSize) {
      const batch = brands.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (brand) => {
        try {
          const endpoint = brand.vehicleTypes.includes('motorcycle') ? 'marques-moto' : 'marques-cotxe';
          const url = `${MOTORALDIA_API}/${endpoint}?marca=${brand.slug}`;
          
          console.log(`🔄 Fetching models for ${brand.name} (${brand.vehicleTypes})...`);
          const response = await axios.get(url, { timeout: 30000 });
          const models = response.data?.data || [];
          
          // Collect models to insert
          const modelsToInsert: any[] = [];
          for (const model of models) {
            if (!model.value || !model.label) continue;
            
            const existing = await prisma.model.findFirst({
              where: { brandId: brand.id, slug: model.value }
            });
            
            if (!existing) {
              const now = new Date();
              modelsToInsert.push({
                name: model.label,
                slug: model.value,
                brand_id: brand.id,
                created_at: now,
                updated_at: now,
                last_sync_at: now
              });
            } else {
              skipped++;
            }
          }
          
          // Use raw MongoDB insert for new models
          if (modelsToInsert.length > 0) {
            try {
              await prisma.$runCommandRaw({
                insert: 'Model',
                documents: modelsToInsert
              });
              created += modelsToInsert.length;
              console.log(`  ✅ ${brand.name}: ${modelsToInsert.length} models inserted`);
            } catch (insertError) {
              console.error(`  ❌ Error inserting models for ${brand.name}:`, insertError);
            }
          } else {
            console.log(`  ⏭️ ${brand.name}: No new models to insert`);
          }
          
        } catch (error) {
          console.error(`  ❌ Error syncing models for ${brand.name}:`, error);
        }
      }));
      
      // Delay between batches
      if (i + batchSize < brands.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return { created, skipped };
  } catch (error) {
    console.error('❌ Error importing models:', error);
    throw error;
  }
}

export async function syncVehicleStates() {
  console.log('🏷️ Vehicle states sync not implemented yet');
  return { statesCreated: 0, statesUpdated: 0 };
}

export async function syncFuelTypes() {
  console.log('⛽ Fuel types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncTransmissionTypes() {
  console.log('⚙️ Transmission types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncBodyTypes() {
  console.log('🚗 Body types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncMotorcycleBodyTypes() {
  console.log('🏍️ Motorcycle body types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncCaravanBodyTypes() {
  console.log('🚐 Caravan body types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncCommercialVehicleBodyTypes() {
  console.log('🚚 Commercial vehicle body types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncCarExtras() {
  console.log('🚗 Car extras sync not implemented yet');
  return { extrasCreated: 0, extrasUpdated: 0 };
}

export async function syncExteriorColors() {
  console.log('🎨 Exterior colors sync not implemented yet');
  return { colorsCreated: 0, colorsUpdated: 0 };
}

export async function syncUpholsteryTypes() {
  console.log('🪑 Upholstery types sync not implemented yet');
  return { typesCreated: 0, typesUpdated: 0 };
}

export async function syncUpholsteryColors() {
  console.log('🎨 Upholstery colors sync not implemented yet');
  return { colorsCreated: 0, colorsUpdated: 0 };
}

export async function syncMotorcycleExtras() {
  console.log('🏍️ Motorcycle extras sync not implemented yet');
  return { extrasCreated: 0, extrasUpdated: 0 };
}

export async function syncCaravanExtras() {
  console.log('🚐 Caravan extras sync not implemented yet');
  return { extrasCreated: 0, extrasUpdated: 0 };
}

export async function syncHabitacleExtras() {
  console.log('🏠 Habitacle extras sync not implemented yet');
  return { extrasCreated: 0, extrasUpdated: 0 };
}

export async function syncUsers() {
  console.log('👥 Users sync not implemented yet');
  return { usersCreated: 0, usersUpdated: 0 };
}