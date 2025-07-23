import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Configurar variables de entorno
dotenv.config();

const prisma = new PrismaClient();

// Configuración del cliente axios para importar desde Motoraldia
const motoraldiaApiClient = axios.create({
  baseURL: process.env.ORIGINAL_API_URL || 'https://motoraldia.net/wp-json/api-motor/v1',
  auth: {
    username: process.env.ORIGINAL_API_USER || 'Paulo',
    password: process.env.ORIGINAL_API_PASS || 'U^q^i2l49rZrX72#Ln!Xe5k0'
  },
  timeout: 30000
});

// Interfaz para los datos de vehículo desde Motoraldia API
interface MotoraldiaVehicle {
  id?: string | number;
  slug: string;
  'titol-anunci': string;
  'descripcio-anunci'?: string;
  preu: string;
  quilometratge?: string;
  any?: string;
  'tipus-vehicle': string;
  'marca-cotxe'?: string;
  'marca-moto'?: string;
  'marques-cotxe'?: string;
  'marques-moto'?: string;
  'models-cotxe'?: string;
  'models-moto'?: string;
  versio?: string;
  'tipus-combustible'?: string;
  'tipus-canvi'?: string;
  'anunci-actiu': boolean | string;
  venut: boolean | string;
  'anunci-destacat': boolean | number;
  'data-creacio': string;
  'imatge-destacada-url'?: string;
  'galeria-vehicle-urls'?: string[];
  [key: string]: any;
}

// ID del usuario info@kars.ad según especificado
const KARS_USER_ID = '113';

/**
 * Función para generar título automáticamente: marca + modelo + versión
 */
function generateVehicleTitle(vehicle: MotoraldiaVehicle): string {
  const marca = vehicle['marques-cotxe'] || vehicle['marca-cotxe'] || 
                vehicle['marques-moto'] || vehicle['marca-moto'] || '';
  const modelo = vehicle['models-cotxe'] || vehicle['models-moto'] || '';
  const version = vehicle.versio || '';
  
  // Construir título eliminando espacios extras
  const titleParts = [marca, modelo, version].filter(part => part && part.trim() !== '');
  
  return titleParts.join(' ').trim() || 'Vehículo sin título';
}

/**
 * Limpiar/resetear la base de datos de vehículos
 */
export async function clearVehicleDatabase(): Promise<void> {
  try {
    console.log('🗑️ Clearing vehicle database...');
    
    // Eliminar todos los vehículos existentes
    const deleteResult = await prisma.vehicle.deleteMany({});
    
    console.log(`✅ Deleted ${deleteResult.count} vehicles from database`);
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Importar vehículos desde JSON proporcionado directamente
 */
export async function importVehiclesFromJSON(
  vehiclesData: MotoraldiaVehicle[],
  clearDatabase: boolean = false
): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[]
  };

  try {
    console.log('📥 Starting vehicle import from JSON data...');
    
    // Limpiar base de datos si se solicita
    if (clearDatabase) {
      await clearVehicleDatabase();
    }
    
    console.log(`📊 Processing ${vehiclesData.length} vehicles from JSON...`);
    
    if (vehiclesData.length === 0) {
      console.log('⚠️ No vehicles found in JSON data');
      return results;
    }
    
    // Procesar cada vehículo
    for (const vehicle of vehiclesData) {
      try {
        await importSingleVehicle(vehicle);
        results.imported++;
        console.log(`✅ Imported vehicle: ${vehicle.slug || vehicle.id}`);
      } catch (error) {
        const vehicleId = vehicle.slug || vehicle.id || 'unknown';
        const errorMsg = `Error importing vehicle ${vehicleId}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        results.errors.push(errorMsg);
        results.skipped++;
      }
    }
    
    console.log(`🎉 JSON Import completed: ${results.imported} imported, ${results.skipped} skipped/errors`);
    return results;
    
  } catch (error) {
    const errorMsg = `Failed to import vehicles from JSON: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`❌ ${errorMsg}`);
    results.errors.push(errorMsg);
    throw error;
  }
}

/**
 * DEPRECATED: Importar vehículos desde Motoraldia API para el usuario Kars.ad
 * Esta función se mantiene por compatibilidad, pero no se usará en Kars.ad
 */
export async function importVehiclesFromMotoralia(
  clearDatabase: boolean = false,
  maxVehicles: number = 100
): Promise<{
  imported: number;
  skipped: number;
  errors: string[];
}> {
  console.log('⚠️ DEPRECATED: Use importVehiclesFromJSON instead');
  
  const results = {
    imported: 0,
    skipped: 0,
    errors: ['Function deprecated - use JSON import instead'] as string[]
  };
  
  return results;
}

/**
 * Importar un vehículo individual
 */
async function importSingleVehicle(vehicle: MotoraldiaVehicle): Promise<void> {
  // Generar título automáticamente
  const autoTitle = generateVehicleTitle(vehicle);
  
  // Convertir anunci-destacat a número
  let anunciDestacat = 0;
  const destacatValue = vehicle['anunci-destacat'];
  
  if (typeof destacatValue === 'boolean' && destacatValue) {
    anunciDestacat = 1;
  } else if (typeof destacatValue === 'number') {
    anunciDestacat = destacatValue;
  } else if (typeof destacatValue === 'string' && destacatValue !== '0') {
    anunciDestacat = parseInt(destacatValue) || 0;
  }
  
  // Preparar datos del vehículo para Kars.ad
  const vehicleData = {
    // Datos básicos
    originalId: vehicle.id?.toString() || vehicle.slug || 'unknown',
    slug: vehicle.slug || `vehicle-${Date.now()}`,
    titolAnunci: autoTitle, // ¡Título generado automáticamente!
    descripcioAnunci: vehicle['descripcio-anunci'] || null,
    
    // Multiidioma - por ahora solo Catalán como primario
    descripcioAnunciCA: vehicle['descripcio-anunci'] || null,
    descripcioAnunciEN: null, // Se llenará desde el formulario
    descripcioAnunciFR: null, // Se llenará desde el formulario
    descripcioAnunciES: null, // Se llenará desde el formulario
    
    // Datos del vehículo
    preu: parseFloat(vehicle.preu) || 0,
    quilometratge: vehicle.quilometratge || '0',
    any: vehicle.any || null,
    tipusVehicle: (vehicle['tipus-vehicle'] || 'COTXE').toLowerCase(),
    
    // Marcas y modelos
    marcaCotxe: vehicle['marques-cotxe'] || vehicle['marca-cotxe'] || null,
    marcaMoto: vehicle['marques-moto'] || vehicle['marca-moto'] || null,
    modelsCotxe: vehicle['models-cotxe'] || null,
    modelsMoto: vehicle['models-moto'] || null,
    versio: vehicle.versio || null,
    
    // Especificaciones técnicas
    estatVehicle: vehicle['estat-vehicle'] ? vehicle['estat-vehicle'].toLowerCase() : null,
    tipusCombustible: vehicle['tipus-combustible'] || null,
    tipusCanvi: vehicle['tipus-canvi'] || null,
    
    // Estado del anuncio
    anunciActiu: vehicle['anunci-actiu'] === true || vehicle['anunci-actiu'] === 'true',
    venut: vehicle.venut === true || vehicle.venut === 'true',
    anunciDestacat,
    
    // Fecha de creación
    dataCreacio: new Date(vehicle['data-creacio'] || new Date()),
    
    // Imágenes
    imatgeDestacadaUrl: vehicle['imatge-destacada-url'] || null,
    galeriaVehicleUrls: vehicle['galeria-vehicle-urls'] || [],
    
    // Campos específicos de Kars.ad
    // userId se omite porque requiere ObjectId válido
    needsSync: false, // No necesita sync porque viene de Motoraldia
    motoraldiaVehicleId: vehicle.id?.toString() || null, // ID original en Motoraldia
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
  } else {
    // Crear nuevo vehículo
    await prisma.vehicle.create({
      data: vehicleData
    });
    console.log(`✨ Created new vehicle: ${vehicle.slug}`);
  }
}

/**
 * Obtener estadísticas de la importación
 */
export async function getImportStats(): Promise<{
  totalVehicles: number;
  vehiclesForKarsUser: number;
  vehiclesNeedingSync: number;
  lastImport: Date | null;
}> {
  try {
    const [
      totalVehicles,
      vehiclesForKarsUser, 
      vehiclesNeedingSync,
      lastImportVehicle
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { authorId: '113' } }),
      prisma.vehicle.count({ where: { needsSync: true } }),
      prisma.vehicle.findFirst({
        where: { authorId: '113' },
        orderBy: { lastSyncAt: 'desc' },
        select: { lastSyncAt: true }
      })
    ]);
    
    return {
      totalVehicles,
      vehiclesForKarsUser,
      vehiclesNeedingSync,
      lastImport: lastImportVehicle?.lastSyncAt || null
    };
  } catch (error) {
    console.error('Error getting import stats:', error);
    throw error;
  }
}