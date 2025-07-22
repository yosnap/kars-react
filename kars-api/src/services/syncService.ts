import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import cron from 'node-cron';
import dotenv from 'dotenv';

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
    enable_auto_sync: 'true',
    max_vehicles_per_sync: '1000',
    blog_sync_interval_hours: '8',
    enable_blog_auto_sync: 'true',
    max_blog_posts_per_sync: '100',
    ...configMap
  };
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

  const vehicleData = {
    originalId: vehicle.id?.toString() || vehicle.slug || 'unknown',
    slug: vehicle.slug || `vehicle-${Date.now()}`,
    titolAnunci: vehicle['titol-anunci'] || 'Sin título',
    descripcioAnunci: vehicle['descripcio-anunci'] || vehicle.descripcio || null,
    preu: vehicle.preu || '0',
    quilometratge: vehicle.quilometratge || '0',
    any: vehicle['any'] || vehicle['any-fabricacio'] || null,
    tipusVehicle: vehicle['tipus-vehicle'] || 'COTXE',
    marcaCotxe: vehicle['marques-cotxe'] || vehicle['marca-cotxe'] || null,
    marcaMoto: vehicle['marques-moto'] || vehicle['marca-moto'] || null,
    modelsCotxe: vehicle['models-cotxe'] || vehicle.model || null,
    modelsMoto: vehicle['models-moto'] || null,
    marquesAutocaravana: vehicle['marques-autocaravana'] || null,
    modelsAutocaravana: vehicle['models-autocaravana'] || null,
    versio: vehicle.versio || null,
    tipusCombustible: vehicle['tipus-combustible'] || vehicle.combustible || null,
    tipusCanvi: vehicle['tipus-canvi'] || vehicle.transmissio || null,
    tipusPropulsor: vehicle['tipus-propulsor'] || null,
    traccio: vehicle.traccio || null,
    potenciaCv: vehicle['potencia-cv'] || vehicle.potencia || null,
    potenciaKw: vehicle['potencia-kw'] || null,
    cilindrada: vehicle.cilindrada || null,
    portesCotxe: vehicle['portes-cotxe'] || vehicle['num-portes'] || null,
    colorVehicle: vehicle['color-vehicle'] || vehicle.color || null,
    anunciActiu: vehicle['anunci-actiu'] === true || vehicle['anunci-actiu'] === 'true',
    venut: vehicle.venut === true || vehicle.venut === 'true',
    anunciDestacat,
    dataCreacio: new Date(vehicle['data-creacio'] || new Date()),
    diesCaducitat: vehicle['dies-caducitat'] || null,
    estatVehicle: vehicle['estat-vehicle'] || null,
    carrosseriaCotxe: vehicle['carroseria-cotxe'] || null,
    carrosseriaMoto: vehicle['carroseria-moto'] || null,
    carrosseriaCaravana: vehicle['carroseria-caravana'] || null,
    // Campos de estado y garantías
    garantia: vehicle.garantia === true || vehicle.garantia === 'true',
    vehicleAccidentat: vehicle['vehicle-accidentat'] === true || vehicle['vehicle-accidentat'] === 'true',
    llibreManteniment: vehicle['llibre-manteniment'] === true || vehicle['llibre-manteniment'] === 'true',
    revisionsOficials: vehicle['revisions-oficials'] === true || vehicle['revisions-oficials'] === 'true',
    impostosDeduibles: vehicle['impostos-deduibles'] === true || vehicle['impostos-deduibles'] === 'true',
    vehicleACanvi: vehicle['vehicle-a-canvi'] === true || vehicle['vehicle-a-canvi'] === 'true',
    nombrePropietaris: vehicle['nombre-propietaris'] || null,
    // Campos de características físicas
    placesCotxe: vehicle['places-cotxe'] || null,
    aireAcondicionat: vehicle['aire-acondicionat'] || null,
    tipusTapisseria: vehicle['tipus-tapisseria'] || null,
    colorTapisseria: vehicle['color-tapisseria'] || null,
    climatitzacio: vehicle.climatitzacio === true || vehicle.climatitzacio === 'true',
    vehicleFumador: vehicle['vehicle-fumador'] === true || vehicle['vehicle-fumador'] === 'true',
    rodaRecanvi: vehicle['roda-recanvi'] || null,
    numeroMaletersCotxe: vehicle['numero-maleters-cotxe'] || null,
    // Campos para vehículos eléctricos
    autonomiaWltp: vehicle['autonomia-wltp'] || null,
    autonomiaUrbanaWltp: vehicle['autonomia-urbana-wltp'] || null,
    autonomiaExtraurbanaWltp: vehicle['autonomia-extraurbana-wltp'] || null,
    autonomiaElectrica: vehicle['autonomia-electrica'] || null,
    bateria: vehicle.bateria || null,
    cablesRecarrega: vehicle['cables-recarrega'] || null,
    connectors: vehicle.connectors || null,
    velocitatRecarrega: vehicle['velocitat-recarrega'] || null,
    frenadaRegenerativa: vehicle['frenada-regenerativa'] || null,
    onePedal: vehicle['one-pedal'] || null,
    tempsRecarregaTotal: vehicle['temps-recarrega-total'] || null,
    tempsRecarregaFins80: vehicle['temps-recarrega-fins-80'] || null,
    // Campos de motor
    numeroMotors: vehicle['numero-motors'] || null,
    cvMotorDavant: vehicle['cv-motor-davant'] || null,
    kwMotorDavant: vehicle['kw-motor-davant'] || null,
    cvMotorDarrere: vehicle['cv-motor-darrere'] || null,
    kwMotorDarrere: vehicle['kw-motor-darrere'] || null,
    potenciaCombinada: vehicle['potencia-combinada'] || null,
    emissionsVehicle: vehicle['emissions-vehicle'] || null,
    // Extras
    extresCotxe: vehicle['extres-cotxe'] || [],
    extresMoto: vehicle['extres-moto'] || [],
    extresAutocaravana: vehicle['extres-autocaravana'] || [],
    extresHabitacle: vehicle['extres-habitacle'] || [],
    // Campos adicionales del payload de 88 campos (temporalmente comentados hasta regenerar Prisma)
    // acceleracio060: vehicle['acceleracio-0-60'] || null,
    // tipusCanviMoto: vehicle['tipus-de-canvi-moto'] || null,
    // placesMoto: vehicle['places-moto'] || null,
    // capacitatTotalL: vehicle['capacitat-total-l'] || null,
    // preuMensual: vehicle['preu-mensual'] || null,
    // preuDiari: vehicle['preu-diari'] || null,
    // preuAntic: vehicle['preu-antic'] || null,
    // velocitatMaxima: vehicle['velocitat-maxima'] || null,
    // acceleracio0100Cotxe: vehicle['acceleracio-0-100-cotxe'] || null,
    // capacitatMaletersCotxe: vehicle['capacitat-maleters-cotxe'] || null,
    // videoVehicle: vehicle['video-vehicle'] || null,
    // cvMotor3: vehicle['cv-motor-3'] || null,
    // kwMotor3: vehicle['kw-motor-3'] || null,
    // cvMotor4: vehicle['cv-motor-4'] || null,
    // kwMotor4: vehicle['kw-motor-4'] || null,
    
    // Imágenes - MUY IMPORTANTE
    imatgeDestacadaUrl: vehicle['imatge-destacada-url'] || (vehicle.imatges && vehicle.imatges[0]) || null,
    galeriaVehicleUrls: vehicle['galeria-vehicle-urls'] || vehicle.imatges || [],
    authorId: vehicle['author_id'] || vehicle['professional-id'] || null,
    professionalId: vehicle['professional-id'] || vehicle['author_id'] || null,
    lastSyncAt: new Date()
  };

  const existingVehicle = await prisma.vehicle.findUnique({
    where: { slug: vehicle.slug }
  });

  if (existingVehicle) {
    await prisma.vehicle.update({
      where: { slug: vehicle.slug },
      data: vehicleData
    });
    return 'updated';
  } else {
    await prisma.vehicle.create({
      data: vehicleData
    });
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
    // Clean up any inconsistent date data first
    console.log('🧹 Cleaning up inconsistent date data...');
    try {
      await prisma.$runCommandRaw({
        update: 'Brand',
        updates: [
          {
            q: {
              $or: [
                { 'last_sync_at': { $type: 'string' } },
                { 'created_at': { $type: 'string' } },
                { 'updated_at': { $type: 'string' } }
              ]
            },
            u: {
              $set: {
                'last_sync_at': new Date(),
                'updated_at': new Date()
              }
            },
            multi: true
          }
        ]
      });
      
      await prisma.$runCommandRaw({
        update: 'Model',
        updates: [
          {
            q: {
              $or: [
                { 'last_sync_at': { $type: 'string' } },
                { 'created_at': { $type: 'string' } },
                { 'updated_at': { $type: 'string' } }
              ]
            },
            u: {
              $set: {
                'last_sync_at': new Date(),
                'updated_at': new Date()
              }
            },
            multi: true
          }
        ]
      });
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
          vehicleType: 'car'
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
            vehicleType: 'car'
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
          vehicleType: 'motorcycle'
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
            vehicleType: 'motorcycle'
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
    const brands = await prisma.brand.findMany();
    console.log(`📋 Found ${brands.length} brands to sync models for`);
    
    // Process in batches of 5 to avoid overloading the API
    const batchSize = 5;
    for (let i = 0; i < brands.length; i += batchSize) {
      const batch = brands.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (brand) => {
        try {
          const endpoint = brand.vehicleType === 'motorcycle' ? 'marques-moto' : 'marques-cotxe';
          const url = `${MOTORALDIA_API}/${endpoint}?marca=${brand.slug}`;
          
          console.log(`🔄 Fetching models for ${brand.name} (${brand.vehicleType})...`);
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