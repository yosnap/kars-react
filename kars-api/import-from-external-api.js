const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { ImportValidator } = require('./validate-import-data');
const prisma = new PrismaClient();

// Configuración de la API externa
const EXTERNAL_API_URL = 'https://motoraldia.net/wp-json/api-motor/v1/vehicles';
const USER_ID = '113';
const API_USER = 'Paulo';
const API_PASS = 'U^q^i2l49rZrX72#Ln!Xe5k0';

// Mapeo de campos de API externa (kebab-case) a campos internos (camelCase)
const fieldMapping = {
  // Básicos
  'slug': 'slug',
  'titol-anunci': 'titolAnunci',
  'descripcio-anunci': 'descripcioAnunci',
  'anunci-actiu': 'anunciActiu',
  'anunci-destacat': 'anunciDestacat',
  'venut': 'venut',
  
  // Tipo y marca
  'tipus-vehicle': 'tipusVehicle',
  'marca-cotxe': 'marcaCotxe',
  'marques-cotxe': 'marcaCotxe', // La API externa puede enviar ambos
  'marca-moto': 'marcaMoto',
  'marques-moto': 'marcaMoto',
  'marques-autocaravana': 'marquesAutocaravana',
  'marques-comercial': 'marquesComercial',
  'models-cotxe': 'modelsCotxe',
  'models-moto': 'modelsMoto',
  'models-autocaravana': 'modelsAutocaravana',
  'models-comercial': 'modelsComercial',
  
  // Especificaciones
  'versio': 'versio',
  'any': 'any',
  'preu': 'preu',
  'quilometratge': 'quilometratge',
  'estat-vehicle': 'estatVehicle',
  'tipus-propulsor': 'tipusPropulsor',
  'tipus-combustible': 'tipusCombustible',
  'tipus-canvi': 'tipusCanvi',
  'carrosseria-cotxe': 'carrosseriaCotxe',
  'carrosseria-moto': 'carrosseriaMoto',
  'carrosseria-caravana': 'carrosseriaCaravana',
  'cilindrada': 'cilindrada',
  'traccio': 'traccio',
  'potencia-cv': 'potenciaCv',
  'potencia-kw': 'potenciaKw',
  'emissions-vehicle': 'emissionsVehicle',
  
  // Características físicas
  'color-vehicle': 'colorVehicle',
  'places-cotxe': 'placesCotxe',
  'places-moto': 'placesMoto',
  'portes-cotxe': 'portesCotxe',
  'aire-acondicionat': 'aireAcondicionat',
  'climatitzacio': 'climatitzacio',
  'tipus-tapisseria': 'tipusTapisseria',
  'color-tapisseria': 'colorTapisseria',
  'vehicle-fumador': 'vehicleFumador',
  
  // Consumos y emisiones
  'emissions-co2': 'emissionsCo2',
  'consum-urba': 'consumUrba',
  'consum-carretera': 'consumCarretera',
  'consum-mixt': 'consumMixt',
  'categoria-ecologica': 'categoriaEcologica',
  
  // Comercial
  'garantia': 'garantia',
  'vehicle-accidentat': 'vehicleAccidentat',
  'origen': 'origen',
  'iva': 'iva',
  'finacament': 'finacament',
  'preu-antic': 'preuAntic',
  'preu-mensual': 'preuMensual',
  'preu-diari': 'preuDiari',
  'nombre-propietaris': 'nombrePropietaris',
  'llibre-manteniment': 'llibreManteniment',
  'revisions-oficials': 'revisionsOficials',
  'impostos-deduibles': 'impostosDeduibles',
  'vehicle-a-canvi': 'vehicleACanvi',
  
  // Extras
  'extres-cotxe': 'extresCotxe',
  'extres-moto': 'extresMoto',
  'extres-autocaravana': 'extresAutocaravana',
  'extres-habitacle': 'extresHabitacle',
  
  // Imágenes
  'imatge-destacada-url': 'imatgeDestacadaUrl',
  'galeria-vehicle-urls': 'galeriaVehicleUrls',
  
  // Metadatos
  'data-creacio': 'dataCreacio',
  'author-id': 'authorId',
  'id': 'originalId'
};

// Función auxiliar para convertir texto a slug
const slugify = (text) => {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Eliminar acentos
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
};

// Función para mapear datos de API externa a formato interno
function mapExternalToInternal(externalData) {
  const internalData = {};
  
  // Mapear campos usando el mapping
  Object.entries(externalData).forEach(([extKey, value]) => {
    const intKey = fieldMapping[extKey];
    if (intKey) {
      internalData[intKey] = value;
    }
  });
  
  // Convertir originalId a string si es número
  if (internalData.originalId && typeof internalData.originalId === 'number') {
    internalData.originalId = String(internalData.originalId);
  }
  
  // Conversiones de tipo necesarias para precios - mantener como números para preu, strings para otros
  if (internalData.preu && internalData.preu !== '') {
    internalData.preu = parseFloat(internalData.preu) || 0;
  } else {
    internalData.preu = 0;
  }
  
  // Los otros campos de precio deben ser strings según el schema
  const stringPriceFields = ['preuAntic', 'preuMensual', 'preuDiari'];
  stringPriceFields.forEach(field => {
    if (internalData[field] && internalData[field] !== '') {
      internalData[field] = String(internalData[field]);
    } else {
      internalData[field] = '';
    }
  });
  
  // Convertir strings a boolean donde sea necesario
  const booleanFields = ['anunciActiu', 'venut', 'climatitzacio', 'vehicleFumador', 
                        'llibreManteniment', 'revisionsOficials', 'impostosDeduibles', 'vehicleACanvi'];
  booleanFields.forEach(field => {
    if (internalData[field] !== undefined) {
      internalData[field] = internalData[field] === true || internalData[field] === 'true' || internalData[field] === '1';
    }
  });
  
  // Asegurar que anunciDestacat sea número
  if (internalData.anunciDestacat !== undefined) {
    internalData.anunciDestacat = parseInt(internalData.anunciDestacat) || 0;
  }
  
  // Convertir arrays si vienen como strings
  const arrayFields = ['extresCotxe', 'extresMoto', 'extresAutocaravana', 'extresHabitacle', 'galeriaVehicleUrls'];
  arrayFields.forEach(field => {
    if (internalData[field] && !Array.isArray(internalData[field])) {
      try {
        internalData[field] = JSON.parse(internalData[field]);
      } catch {
        internalData[field] = [];
      }
    } else if (!internalData[field]) {
      internalData[field] = [];
    }
  });
  
  // Convertir extras a slugs
  const extrasFields = ['extresCotxe', 'extresMoto', 'extresAutocaravana', 'extresHabitacle'];
  extrasFields.forEach(field => {
    if (internalData[field] && Array.isArray(internalData[field])) {
      internalData[field] = internalData[field].map(extra => slugify(extra));
    }
  });
  
  // Asegurar fecha válida
  if (internalData.dataCreacio) {
    internalData.dataCreacio = new Date(internalData.dataCreacio);
  } else {
    internalData.dataCreacio = new Date();
  }
  
  // Agregar campos por defecto
  internalData.status = 'publish';
  internalData.needsSync = false; // Ya viene de la API externa
  
  // Validar que tipusVehicle esté en minúsculas
  if (internalData.tipusVehicle) {
    internalData.tipusVehicle = internalData.tipusVehicle.toLowerCase();
  }
  
  // Convertir todas las marcas a slugs
  if (internalData.marcaCotxe) {
    internalData.marcaCotxe = slugify(internalData.marcaCotxe);
  }
  if (internalData.marcaMoto) {
    internalData.marcaMoto = slugify(internalData.marcaMoto);
  }
  if (internalData.marquesAutocaravana) {
    internalData.marquesAutocaravana = slugify(internalData.marquesAutocaravana);
  }
  if (internalData.marquesComercial) {
    internalData.marquesComercial = slugify(internalData.marquesComercial);
  }
  
  // Convertir todos los modelos a slugs
  if (internalData.modelsCotxe) {
    internalData.modelsCotxe = slugify(internalData.modelsCotxe);
  }
  if (internalData.modelsMoto) {
    internalData.modelsMoto = slugify(internalData.modelsMoto);
  }
  if (internalData.modelsAutocaravana) {
    internalData.modelsAutocaravana = slugify(internalData.modelsAutocaravana);
  }
  if (internalData.modelsComercial) {
    internalData.modelsComercial = slugify(internalData.modelsComercial);
  }
  
  // Convertir otros campos técnicos a slugs
  if (internalData.tipusCombustible) {
    internalData.tipusCombustible = slugify(internalData.tipusCombustible);
  }
  if (internalData.estatVehicle) {
    internalData.estatVehicle = slugify(internalData.estatVehicle);
  }
  if (internalData.tipusCanvi) {
    internalData.tipusCanvi = slugify(internalData.tipusCanvi);
  }
  if (internalData.tipusPropulsor) {
    internalData.tipusPropulsor = slugify(internalData.tipusPropulsor);
  }
  if (internalData.carrosseriaCotxe) {
    internalData.carrosseriaCotxe = slugify(internalData.carrosseriaCotxe);
  }
  if (internalData.carrosseriaMoto) {
    internalData.carrosseriaMoto = slugify(internalData.carrosseriaMoto);
  }
  if (internalData.carrosseriaCaravana) {
    internalData.carrosseriaCaravana = slugify(internalData.carrosseriaCaravana);
  }
  if (internalData.colorVehicle) {
    internalData.colorVehicle = slugify(internalData.colorVehicle);
  }
  if (internalData.tipusTapisseria) {
    internalData.tipusTapisseria = slugify(internalData.tipusTapisseria);
  }
  if (internalData.colorTapisseria) {
    internalData.colorTapisseria = slugify(internalData.colorTapisseria);
  }
  
  // Si falta marca para el tipo de vehículo, intentar deducirla del título
  if (internalData.tipusVehicle === 'cotxe' && !internalData.marcaCotxe && internalData.titolAnunci) {
    const firstWord = internalData.titolAnunci.split(' ')[0];
    internalData.marcaCotxe = slugify(firstWord);
  }
  
  return internalData;
}

async function processVehicles(vehicles, type, validator) {
  let imported = 0;
  let updated = 0;
  let validationErrors = 0;
  
  console.log(`   📊 Procesando ${vehicles.length} vehículos ${type}...`);
  
  for (const externalVehicle of vehicles) {
    try {
      const internalData = mapExternalToInternal(externalVehicle);
      
      // Validar datos contra colecciones existentes
      const errors = validator.validateVehicle(internalData);
      if (errors.length > 0) {
        validationErrors++;
        console.log(`   ⚠️  Validación: ${internalData.titolAnunci || internalData.slug} tiene ${errors.length} campos con valores nuevos`);
      }
      
      // Verificar si ya existe por slug
      const existing = await prisma.vehicle.findUnique({
        where: { slug: internalData.slug }
      });
      
      if (existing) {
        // Actualizar existente
        await prisma.vehicle.update({
          where: { slug: internalData.slug },
          data: internalData
        });
        console.log(`   ♻️  Actualizado: ${internalData.titolAnunci || internalData.slug}`);
        updated++;
      } else {
        // Crear nuevo
        await prisma.vehicle.create({
          data: internalData
        });
        console.log(`   ✅ Importado: ${internalData.titolAnunci || internalData.slug}`);
        imported++;
      }
      
    } catch (error) {
      console.error(`   ❌ Error con vehículo ${externalVehicle.slug}:`, error.message);
    }
  }
  
  return { imported, updated, validationErrors };
}

async function importVehicles() {
  try {
    console.log('🚀 Iniciando importación desde API externa...\n');
    console.log(`📡 URL: ${EXTERNAL_API_URL}`);
    console.log(`👤 User ID: ${USER_ID}`);
    console.log(`📄 Per Page: 200\n`);
    
    // Inicializar validador
    const validator = new ImportValidator();
    await validator.loadValidationData();
    
    let totalImported = 0;
    let totalUpdated = 0;
    let totalValidationErrors = 0;
    
    // 1. Importar vehículos NO vendidos
    console.log('📥 Paso 1: Importando vehículos NO vendidos...');
    try {
      const responseNotSold = await axios.get(EXTERNAL_API_URL, {
        params: {
          user_id: USER_ID,
          venut: 'false',
          per_page: 200
        },
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${API_USER}:${API_PASS}`).toString('base64')
        },
        timeout: 30000
      });
      
      console.log(`   📡 Status: ${responseNotSold.status}`);
      
      // La API devuelve un objeto con {status, items}
      const vehicles = responseNotSold.data.items || responseNotSold.data;
      
      if (Array.isArray(vehicles) && vehicles.length > 0) {
        console.log(`   ✅ Encontrados ${vehicles.length} vehículos no vendidos`);
        const result = await processVehicles(vehicles, 'NO vendidos', validator);
        totalImported += result.imported;
        totalUpdated += result.updated;
        totalValidationErrors += result.validationErrors;
      } else {
        console.log('   ⚠️  No se encontraron vehículos no vendidos');
      }
    } catch (error) {
      console.error('   ❌ Error obteniendo vehículos no vendidos:', error.message);
    }
    
    // 2. Importar vehículos vendidos
    console.log('\n📥 Paso 2: Importando vehículos vendidos...');
    try {
      const responseSold = await axios.get(EXTERNAL_API_URL, {
        params: {
          user_id: USER_ID,
          venut: 'true',
          per_page: 200
        },
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${API_USER}:${API_PASS}`).toString('base64')
        },
        timeout: 30000
      });
      
      console.log(`   📡 Status: ${responseSold.status}`);
      
      // La API devuelve un objeto con {status, items}
      const vehiclesSold = responseSold.data.items || responseSold.data;
      
      if (Array.isArray(vehiclesSold) && vehiclesSold.length > 0) {
        console.log(`   ✅ Encontrados ${vehiclesSold.length} vehículos vendidos`);
        const result = await processVehicles(vehiclesSold, 'vendidos', validator);
        totalImported += result.imported;
        totalUpdated += result.updated;
        totalValidationErrors += result.validationErrors;
      } else {
        console.log('   ⚠️  No se encontraron vehículos vendidos');
      }
    } catch (error) {
      console.error('   ❌ Error obteniendo vehículos vendidos:', error.message);
    }
    
    // Resumen final
    console.log('\n📊 RESUMEN DE IMPORTACIÓN:');
    console.log('='.repeat(50));
    console.log(`✅ Vehículos nuevos importados: ${totalImported}`);
    console.log(`♻️  Vehículos actualizados: ${totalUpdated}`);
    console.log(`⚠️  Vehículos con valores nuevos: ${totalValidationErrors}`);
    console.log(`📈 Total procesados: ${totalImported + totalUpdated}`);
    
    const finalCount = await prisma.vehicle.count();
    console.log(`\n📈 Total vehículos en BD: ${finalCount}`);
    
    // Estadísticas por tipo
    const byType = await prisma.vehicle.groupBy({
      by: ['tipusVehicle'],
      _count: true
    });
    
    console.log('\n📋 Por tipo de vehículo:');
    byType.forEach(type => {
      console.log(`   • ${type.tipusVehicle || 'Sin tipo'}: ${type._count} vehículos`);
    });
    
    // Estadísticas de vendidos/no vendidos
    const soldCount = await prisma.vehicle.count({ where: { venut: true } });
    const notSoldCount = await prisma.vehicle.count({ where: { venut: false } });
    
    console.log('\n📊 Estado de venta:');
    console.log(`   • No vendidos: ${notSoldCount}`);
    console.log(`   • Vendidos: ${soldCount}`);
    
    // Generar reporte de validación
    console.log('\n' + '='.repeat(70));
    const validationReport = validator.generateReport();
    
    if (validationReport.hasNewValues) {
      console.log('\n⚠️  Se encontraron valores nuevos que requieren atención.');
      console.log('   Revisa el reporte anterior para decidir qué acciones tomar.');
    }
    
  } catch (error) {
    console.error('❌ Error general en importación:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar importación
importVehicles();