import { PrismaClient } from '@prisma/client';
import fs from 'fs/promises';
import path from 'path';

const prisma = new PrismaClient();

// Interfaz para los datos de vehículo del JSON
interface VehicleFromJson {
  id?: string | number;
  slug: string;
  'titol-anunci': string;
  'descripcio-anunci'?: string;
  preu?: string;
  quilometratge?: string;
  any?: string;
  'tipus-vehicle': string;
  'marques-cotxe'?: string;
  'marques-moto'?: string;
  'models-cotxe'?: string;
  'models-moto'?: string;
  versio?: string;
  'tipus-combustible'?: string;
  'tipus-canvi'?: string;
  'tipus-propulsor'?: string;
  traccio?: string;
  'potencia-cv'?: string;
  'potencia-kw'?: string;
  cilindrada?: string;
  'portes-cotxe'?: string;
  'color-vehicle'?: string;
  'anunci-actiu': boolean | string;
  venut: boolean | string;
  'anunci-destacat': boolean | number;
  'data-creacio': string;
  'dies-caducitat'?: string;
  'estat-vehicle'?: string;
  'carroseria-cotxe'?: string;
  'carroseria-moto'?: string;
  garantia?: boolean | string;
  'vehicle-accidentat'?: boolean | string;
  'llibre-manteniment'?: boolean | string;
  'revisions-oficials'?: boolean | string;
  'impostos-deduibles'?: boolean | string;
  'vehicle-a-canvi'?: boolean | string;
  'nombre-propietaris'?: string;
  'places-cotxe'?: string;
  'aire-acondicionat'?: boolean | string;
  'tipus-tapisseria'?: string;
  'color-tapisseria'?: string;
  climatitzacio?: boolean | string;
  'vehicle-fumador'?: boolean | string;
  'roda-recanvi'?: string;
  'numero-maleters-cotxe'?: string;
  'autonomia-wltp'?: string;
  'autonomia-urbana-wltp'?: string;
  'autonomia-extraurbana-wltp'?: string;
  'autonomia-electrica'?: string;
  bateria?: string;
  'cables-recarrega'?: string;
  connectors?: string;
  'velocitat-recarrega'?: string;
  'frenada-regenerativa'?: string;
  'one-pedal'?: string;
  'temps-recarrega-total'?: string;
  'temps-recarrega-fins-80'?: string;
  'numero-motors'?: string;
  'cv-motor-davant'?: string;
  'kw-motor-davant'?: string;
  'cv-motor-darrere'?: string;
  'kw-motor-darrere'?: string;
  'potencia-combinada'?: string;
  'emissions-vehicle'?: string;
  'extres-cotxe'?: string[];
  'extres-moto'?: string[];
  'extres-autocaravana'?: string[];
  'extres-habitacle'?: string[];
  'imatge-destacada-url'?: string;
  'galeria-vehicle-urls'?: string[];
  author_id?: string;
  'professional-id'?: string;
  [key: string]: any;
}

// Interfaz para el log de importación
interface ImportLog {
  id: string;
  totalVehicles: number;
  processedVehicles: number;
  createdVehicles: number;
  updatedVehicles: number;
  errorVehicles: number;
  status: 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  errors: string[];
}

// Variables de estado
let currentImportLog: ImportLog | null = null;

// Función principal de importación por lotes
export async function importVehiclesFromJson(
  jsonFilePath: string,
  batchSize: number = 50,
  delayBetweenBatches: number = 1000
): Promise<string> {
  
  console.log('🚀 Iniciando importación de vehículos desde JSON...');
  console.log(`📁 Archivo: ${jsonFilePath}`);
  console.log(`📦 Tamaño de lote: ${batchSize}`);
  console.log(`⏱️ Pausa entre lotes: ${delayBetweenBatches}ms`);

  try {
    // Leer y parsear el archivo JSON
    console.log(`📖 Reading JSON file: ${jsonFilePath}`);
    const jsonContent = await fs.readFile(jsonFilePath, 'utf-8');
    console.log(`📊 JSON file size: ${jsonContent.length} characters`);
    
    const jsonData = JSON.parse(jsonContent);
    console.log(`🔍 JSON data structure:`, {
      hasStatus: !!jsonData.status,
      hasItems: !!jsonData.items,
      itemsIsArray: Array.isArray(jsonData.items),
      itemsLength: jsonData.items?.length || 0
    });
    
    // Extraer los vehículos del array "items"
    const vehicles = jsonData.items || [];
    
    if (!Array.isArray(vehicles)) {
      throw new Error(`Expected 'items' to be an array, but got: ${typeof vehicles}`);
    }
    
    if (vehicles.length === 0) {
      throw new Error('No se encontraron vehículos en el archivo JSON - el array items está vacío');
    }

    console.log(`📊 Total de vehículos encontrados: ${vehicles.length}`);

    // Crear log de importación
    const importLogId = `import_${Date.now()}`;
    currentImportLog = {
      id: importLogId,
      totalVehicles: vehicles.length,
      processedVehicles: 0,
      createdVehicles: 0,
      updatedVehicles: 0,
      errorVehicles: 0,
      status: 'running',
      startedAt: new Date(),
      errors: []
    };

    // Procesar en lotes
    await processVehiclesInBatches(vehicles, batchSize, delayBetweenBatches);

    // Completar importación
    currentImportLog.status = 'completed';
    currentImportLog.completedAt = new Date();

    console.log('✅ Importación completada exitosamente');
    console.log(`📊 Resumen: ${currentImportLog.createdVehicles} creados, ${currentImportLog.updatedVehicles} actualizados, ${currentImportLog.errorVehicles} errores`);

    return importLogId;

  } catch (error) {
    console.error('❌ Error durante la importación:', error);
    
    if (currentImportLog) {
      currentImportLog.status = 'failed';
      currentImportLog.completedAt = new Date();
      currentImportLog.errors.push(error instanceof Error ? error.message : 'Error desconocido');
    }

    throw error;
  }
}

// Procesar vehículos en lotes
async function processVehiclesInBatches(
  vehicles: VehicleFromJson[],
  batchSize: number,
  delayBetweenBatches: number
) {
  const totalBatches = Math.ceil(vehicles.length / batchSize);

  for (let i = 0; i < vehicles.length; i += batchSize) {
    const currentBatch = i / batchSize + 1;
    const batch = vehicles.slice(i, i + batchSize);

    console.log(`📦 Procesando lote ${currentBatch}/${totalBatches} (${batch.length} vehículos)...`);

    // Procesar vehículos del lote actual
    await processBatch(batch);

    console.log(`✅ Lote ${currentBatch} completado. Progreso: ${currentImportLog?.processedVehicles}/${vehicles.length}`);

    // Pausa entre lotes (excepto en el último)
    if (i + batchSize < vehicles.length) {
      console.log(`⏸️ Pausa de ${delayBetweenBatches}ms entre lotes...`);
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches));
    }
  }
}

// Procesar un lote de vehículos
async function processBatch(batch: VehicleFromJson[]) {
  const promises = batch.map(vehicle => processVehicle(vehicle));
  await Promise.allSettled(promises);
}

// Procesar un vehículo individual
async function processVehicle(vehicle: VehicleFromJson): Promise<void> {
  if (!currentImportLog) return;

  try {
    console.log(`🔄 Procesando vehículo: ${vehicle.slug} (ID: ${vehicle.id})`);

    const result = await upsertVehicle(vehicle);
    
    if (result === 'created') {
      currentImportLog.createdVehicles++;
      console.log(`✅ Creado: ${vehicle.slug}`);
    } else {
      currentImportLog.updatedVehicles++;
      console.log(`🔄 Actualizado: ${vehicle.slug}`);
    }

    currentImportLog.processedVehicles++;

  } catch (error) {
    currentImportLog.errorVehicles++;
    const errorMessage = `Error procesando ${vehicle.slug}: ${error instanceof Error ? error.message : 'Error desconocido'}`;
    currentImportLog.errors.push(errorMessage);
    console.error(`❌ ${errorMessage}`);
  }
}

// Crear o actualizar un vehículo
async function upsertVehicle(vehicle: VehicleFromJson): Promise<'created' | 'updated'> {
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

  const vehicleData = {
    originalId: vehicle.id?.toString() || vehicle.slug || 'unknown',
    slug: vehicle.slug || `vehicle-${Date.now()}`,
    titolAnunci: vehicle['titol-anunci'] || 'Sin título',
    descripcioAnunci: vehicle['descripcio-anunci'] || null,
    preu: parseFloat(vehicle.preu || '0') || 0,
    quilometratge: vehicle.quilometratge || '0',
    any: vehicle.any || null,
    tipusVehicle: (vehicle['tipus-vehicle'] || 'COTXE').toLowerCase(),
    marcaCotxe: vehicle['marques-cotxe'] || null,
    marcaMoto: vehicle['marques-moto'] || null,
    modelsCotxe: vehicle['models-cotxe'] || null,
    modelsMoto: vehicle['models-moto'] || null,
    marquesAutocaravana: null,
    modelsAutocaravana: null,
    versio: vehicle.versio || null,
    tipusCombustible: vehicle['tipus-combustible'] || null,
    tipusCanvi: vehicle['tipus-canvi'] || null,
    tipusPropulsor: vehicle['tipus-propulsor'] || null,
    traccio: vehicle.traccio || null,
    potenciaCv: vehicle['potencia-cv'] || null,
    potenciaKw: vehicle['potencia-kw'] || null,
    cilindrada: vehicle.cilindrada || null,
    portesCotxe: vehicle['portes-cotxe'] || null,
    colorVehicle: vehicle['color-vehicle'] || null,
    anunciActiu: vehicle['anunci-actiu'] === true || vehicle['anunci-actiu'] === 'true',
    venut: vehicle.venut === true || vehicle.venut === 'true',
    anunciDestacat,
    dataCreacio: new Date(vehicle['data-creacio'] || new Date()),
    diesCaducitat: vehicle['dies-caducitat'] || null,
    estatVehicle: vehicle['estat-vehicle'] ? vehicle['estat-vehicle'].toLowerCase() : null,
    carrosseriaCotxe: vehicle['carroseria-cotxe'] || null,
    carrosseriaMoto: vehicle['carroseria-moto'] || null,
    carrosseriaCaravana: null,
    
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
    aireAcondicionat: vehicle['aire-acondicionat']?.toString() || null,
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
    cablesRecarrega: Array.isArray(vehicle['cables-recarrega']) 
      ? vehicle['cables-recarrega'].filter(Boolean).join(', ') || null
      : vehicle['cables-recarrega'] || null,
    connectors: Array.isArray(vehicle.connectors) 
      ? vehicle.connectors.filter(Boolean).join(', ') || null
      : vehicle.connectors || null,
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
    
    // Imágenes
    imatgeDestacadaUrl: vehicle['imatge-destacada-url'] || null,
    galeriaVehicleUrls: vehicle['galeria-vehicle-urls'] || [],
    authorId: vehicle.author_id || vehicle['professional-id'] || null,
    professionalId: vehicle['professional-id'] || vehicle.author_id || null,
    lastSyncAt: new Date()
  };

  // Verificar si el vehículo ya existe
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

// Obtener estado de importación actual
export function getImportStatus(): ImportLog | null {
  return currentImportLog;
}

// Funcionalidad para importar desde la ruta predeterminada
export async function importFromDefaultJson(
  batchSize: number = 50,
  delayBetweenBatches: number = 1000
): Promise<string> {
  // Usar ruta absoluta al archivo JSON
  const defaultJsonPath = path.resolve(__dirname, '../../example_vehicles_kars.json');
  console.log(`🔍 Looking for JSON file at: ${defaultJsonPath}`);
  
  // Verificar que el archivo existe
  try {
    await fs.access(defaultJsonPath);
    console.log(`✅ JSON file found at: ${defaultJsonPath}`);
  } catch (error) {
    console.error(`❌ JSON file not found at: ${defaultJsonPath}`);
    throw new Error(`JSON file not found at: ${defaultJsonPath}`);
  }
  
  return importVehiclesFromJson(defaultJsonPath, batchSize, delayBetweenBatches);
}