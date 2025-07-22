/**
 * Script para sincronizar modelos de todas las marcas de coches desde la API externa
 * Ejecutar con: node sync-models.js
 */

const { PrismaClient } = require('@prisma/client');
const axios = require('axios');

const prisma = new PrismaClient();

// URL base de la API externa
const EXTERNAL_API_BASE = 'https://api.motoraldia.com/wp-json/api-motor/v1';

// Configuración
const CONFIG = {
  timeout: 30000, // 30 segundos
  maxRetries: 3,
  retryDelay: 2000, // 2 segundos
  batchSize: 5, // Procesar 5 marcas a la vez para no sobrecargar la API
  delayBetweenBatches: 1000 // 1 segundo entre lotes
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchModelsFromAPI(brandSlug, retries = 0) {
  try {
    const url = `${EXTERNAL_API_BASE}/marques-cotxe?marca=${brandSlug}`;
    console.log(`📡 Calling API: ${url}`);
    
    const response = await axios.get(url, {
      timeout: CONFIG.timeout,
      headers: {
        'User-Agent': 'Kars.ad Model Sync',
        'Accept': 'application/json'
      }
    });
    
    if (response.data) {
      // La API devuelve un objeto con estructura {status, total, data}
      if (response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        // Fallback por si la API devuelve directamente un array
        return response.data;
      } else {
        console.warn(`⚠️ API returned unexpected format for brand ${brandSlug}:`, response.data);
        return [];
      }
    } else {
      return [];
    }
    
  } catch (error) {
    if (retries < CONFIG.maxRetries) {
      console.warn(`⚠️ Error fetching models for ${brandSlug}, retrying in ${CONFIG.retryDelay}ms... (attempt ${retries + 1}/${CONFIG.maxRetries})`);
      await delay(CONFIG.retryDelay);
      return fetchModelsFromAPI(brandSlug, retries + 1);
    } else {
      console.error(`❌ Failed to fetch models for ${brandSlug} after ${CONFIG.maxRetries} retries:`, error.message);
      return [];
    }
  }
}

async function syncModelsForBrand(brand) {
  try {
    console.log(`🔄 Sincronizando modelos para marca: ${brand.name} (${brand.slug})`);
    
    // Obtener modelos desde la API externa
    const externalModels = await fetchModelsFromAPI(brand.slug);
    
    if (externalModels.length === 0) {
      console.log(`⚠️ No se encontraron modelos para ${brand.name}`);
      return { imported: 0, skipped: 0, total: 0 };
    }
    
    let imported = 0;
    let skipped = 0;
    
    // Procesar cada modelo
    for (const modelData of externalModels) {
      try {
        // Extraer value y label del modelo
        const value = modelData.value || modelData.slug;
        const label = modelData.label || modelData.name;
        
        if (!value || !label) {
          console.warn('⚠️ Modelo inválido saltado:', modelData);
          skipped++;
          continue;
        }
        
        // Verificar si ya existe
        const existing = await prisma.model.findFirst({
          where: { 
            brandId: brand.id,
            slug: value
          }
        });
        
        if (existing) {
          // console.log(`⏭️ Modelo ya existe: ${label}`);
          skipped++;
          continue;
        }
        
        // Crear nuevo modelo
        await prisma.model.create({
          data: {
            name: label,
            slug: value,
            brandId: brand.id
          }
        });
        
        imported++;
        console.log(`  ✅ Modelo importado: ${label}`);
        
      } catch (modelError) {
        console.error(`  ❌ Error importando modelo ${modelData.label || 'unknown'}:`, modelError.message);
        skipped++;
      }
    }
    
    console.log(`📊 ${brand.name}: ${imported} importados, ${skipped} saltados de ${externalModels.length} totales`);
    
    return {
      imported,
      skipped,
      total: externalModels.length
    };
    
  } catch (error) {
    console.error(`❌ Error sincronizando marca ${brand.name}:`, error.message);
    return { imported: 0, skipped: 0, total: 0, error: error.message };
  }
}

async function syncAllModels() {
  try {
    console.log('🚀 Iniciando sincronización de modelos...');
    
    // Obtener todas las marcas de coches de la base de datos
    const carBrands = await prisma.brand.findMany({
      where: {
        vehicleType: 'car'
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    console.log(`📗 Encontradas ${carBrands.length} marcas de coches para sincronizar`);
    
    let totalStats = {
      brandsProcessed: 0,
      totalImported: 0,
      totalSkipped: 0,
      totalModels: 0,
      errors: []
    };
    
    // Procesar marcas en lotes para no sobrecargar la API
    for (let i = 0; i < carBrands.length; i += CONFIG.batchSize) {
      const batch = carBrands.slice(i, i + CONFIG.batchSize);
      
      console.log(`\n📦 Procesando lote ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(carBrands.length / CONFIG.batchSize)} (${batch.length} marcas)`);
      
      // Procesar todas las marcas del lote en paralelo
      const batchPromises = batch.map(brand => syncModelsForBrand(brand));
      const batchResults = await Promise.all(batchPromises);
      
      // Acumular estadísticas
      batchResults.forEach((result, index) => {
        const brand = batch[index];
        totalStats.brandsProcessed++;
        totalStats.totalImported += result.imported;
        totalStats.totalSkipped += result.skipped;
        totalStats.totalModels += result.total;
        
        if (result.error) {
          totalStats.errors.push(`${brand.name}: ${result.error}`);
        }
      });
      
      // Esperar entre lotes para no sobrecargar la API
      if (i + CONFIG.batchSize < carBrands.length) {
        console.log(`⏸️ Esperando ${CONFIG.delayBetweenBatches}ms antes del siguiente lote...`);
        await delay(CONFIG.delayBetweenBatches);
      }
    }
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   🏭 Marcas procesadas: ${totalStats.brandsProcessed}`);
    console.log(`   ✅ Modelos importados: ${totalStats.totalImported}`);
    console.log(`   ⏭️ Modelos saltados: ${totalStats.totalSkipped}`);
    console.log(`   📈 Total de modelos procesados: ${totalStats.totalModels}`);
    
    if (totalStats.errors.length > 0) {
      console.log(`   ❌ Errores (${totalStats.errors.length}):`);
      totalStats.errors.forEach(error => console.log(`     - ${error}`));
    }
    
    console.log('✅ Sincronización completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la sincronización:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Función para sincronizar una marca específica
async function syncSingleBrand(brandSlug) {
  try {
    console.log(`🚀 Sincronizando marca específica: ${brandSlug}`);
    
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    });
    
    if (!brand) {
      console.error(`❌ Marca no encontrada: ${brandSlug}`);
      process.exit(1);
    }
    
    if (brand.vehicleType !== 'car') {
      console.error(`❌ La marca ${brand.name} no es de tipo 'car'`);
      process.exit(1);
    }
    
    const result = await syncModelsForBrand(brand);
    
    console.log('\n📊 RESULTADO:');
    console.log(`   ✅ Modelos importados: ${result.imported}`);
    console.log(`   ⏭️ Modelos saltados: ${result.skipped}`);
    console.log(`   📈 Total procesados: ${result.total}`);
    
    if (result.error) {
      console.log(`   ❌ Error: ${result.error}`);
    }
    
  } catch (error) {
    console.error('❌ Error sincronizando marca:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar script
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Sincronizar marca específica
    const brandSlug = args[0];
    syncSingleBrand(brandSlug)
      .then(() => {
        console.log('🎉 Script finalizado');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error ejecutando script:', error);
        process.exit(1);
      });
  } else {
    // Sincronizar todas las marcas
    syncAllModels()
      .then(() => {
        console.log('🎉 Script finalizado');
        process.exit(0);
      })
      .catch((error) => {
        console.error('💥 Error ejecutando script:', error);
        process.exit(1);
      });
  }
}

module.exports = { syncAllModels, syncSingleBrand };