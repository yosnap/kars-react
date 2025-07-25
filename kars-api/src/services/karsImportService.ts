import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { batteryTypes } from '../data/initialization/battery-types';
import { chargingCables } from '../data/initialization/charging-cables';
import { electricConnectors } from '../data/initialization/electric-connectors';
import { chargingSpeeds } from '../data/initialization/charging-speeds';
import { emissionTypes } from '../data/initialization/emission-types';

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
  detailedReport: {
    totalVehicles: number;
    successfulImports: Array<{slug: string, id: string | number | undefined, title: string}>;
    failedImports: Array<{slug: string, id: string | number | undefined, title: string, error: string}>;
    skippedVehicles: Array<{slug: string, id: string | number | undefined, title: string, reason: string}>;
  };
}> {
  const results = {
    imported: 0,
    skipped: 0,
    errors: [] as string[],
    detailedReport: {
      totalVehicles: vehiclesData.length,
      successfulImports: [] as Array<{slug: string, id: string | number | undefined, title: string}>,
      failedImports: [] as Array<{slug: string, id: string | number | undefined, title: string, error: string}>,
      skippedVehicles: [] as Array<{slug: string, id: string | number | undefined, title: string, reason: string}>
    }
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
    
    // Procesar cada vehículo con informe detallado
    for (let i = 0; i < vehiclesData.length; i++) {
      const vehicle = vehiclesData[i];
      if (!vehicle) {
        console.warn(`⚠️ Skipping undefined vehicle at index ${i}`);
        continue;
      }
      
      const vehicleInfo = {
        slug: vehicle.slug || `vehicle-${i}`,
        id: vehicle.id,
        title: vehicle['titol-anunci'] || `Vehicle ${i + 1}`
      };
      
      try {
        console.log(`🔄 Processing vehicle ${i + 1}/${vehiclesData.length}: ${vehicleInfo.title} (${vehicleInfo.slug})`);
        
        const result = await importSingleVehicle(vehicle);
        results.imported++;
        results.detailedReport.successfulImports.push({
          ...vehicleInfo,
          // Añadir información sobre si fue creado o actualizado
          title: `${vehicleInfo.title} (${result})`
        });
        console.log(`✅ ${result} vehicle: ${vehicleInfo.title}`);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`❌ Error importing vehicle ${vehicleInfo.title}:`, errorMsg);
        
        results.errors.push(`${vehicleInfo.title} (${vehicleInfo.slug}): ${errorMsg}`);
        results.skipped++;
        results.detailedReport.failedImports.push({
          ...vehicleInfo,
          error: errorMsg
        });
      }
    }
    
    console.log(`🎉 JSON Import completed: ${results.imported} imported, ${results.skipped} skipped/errors`);
    console.log(`📋 Detailed breakdown:`);
    console.log(`   ✅ Successful: ${results.detailedReport.successfulImports.length}`);
    console.log(`   ❌ Failed: ${results.detailedReport.failedImports.length}`);
    console.log(`   ⏭️ Skipped: ${results.detailedReport.skippedVehicles.length}`);
    
    if (results.detailedReport.failedImports.length > 0) {
      console.log(`\n❌ Failed vehicles:`);
      results.detailedReport.failedImports.forEach(failed => {
        console.log(`   - ${failed.title} (${failed.slug}): ${failed.error}`);
      });
    }
    
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
 * Importar un vehículo individual - Usa la misma lógica que syncService.ts
 */
async function importSingleVehicle(vehicle: MotoraldiaVehicle): Promise<'created' | 'updated'> {
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

  // Log para debug de extras
  if (extresCotxeConverted.length > 0) {
    console.log('🔍 Extras cotxe convertidos:', extresCotxeConverted);
  }
  if (extresMotoConverted.length > 0) {
    console.log('🔍 Extras moto convertidos:', extresMotoConverted);
  }
  
  // Preparar datos usando la MISMA LÓGICA que syncService.ts
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
    // Extras - ¡ESTOS SON LOS MÁS IMPORTANTES! - Ahora convertidos a slugs
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