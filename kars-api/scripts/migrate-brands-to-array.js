const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Script para migrar los datos existentes de vehicleType (string) a vehicleTypes (array)
 */
async function migrateBrandsToArray() {
  try {
    console.log('🚀 Iniciando migración de marcas a formato array...\n');
    
    // Obtener todas las marcas existentes
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        vehicleTypes: true
      }
    });
    
    console.log(`📋 Encontradas ${brands.length} marcas en la base de datos`);
    
    let migrated = 0;
    let skipped = 0;
    
    for (const brand of brands) {
      try {
        // Si ya es un array válido, omitir
        if (Array.isArray(brand.vehicleTypes) && brand.vehicleTypes.length > 0) {
          console.log(`⏭️ ${brand.name}: Ya tiene formato array [${brand.vehicleTypes.join(', ')}]`);
          skipped++;
          continue;
        }
        
        // Si tiene datos corruptos o vacíos, necesitamos determinar el tipo basado en el slug o nombre
        let newVehicleTypes = [];
        
        // Intentar determinar el tipo de vehículo basado en patrones conocidos
        const slug = brand.slug.toLowerCase();
        const name = brand.name.toLowerCase();
        
        // Lista de marcas que sabemos que hacen coches y motos
        const mixedBrands = ['bmw', 'honda', 'lifan', 'macbor', 'peugeot', 'polaris', 'silence', 'triumph'];
        
        if (mixedBrands.includes(slug)) {
          newVehicleTypes = ['car', 'motorcycle'];
          console.log(`🔄 ${brand.name}: Detectada como marca mixta`);
        } else {
          // Por defecto, asumir que es coche si no podemos determinar
          newVehicleTypes = ['car'];
          console.log(`🚗 ${brand.name}: Asumida como marca de coches por defecto`);
        }
        
        // Actualizar la marca
        await prisma.brand.update({
          where: { id: brand.id },
          data: { vehicleTypes: newVehicleTypes }
        });
        
        console.log(`✅ ${brand.name}: Migrada a [${newVehicleTypes.join(', ')}]`);
        migrated++;
        
      } catch (error) {
        console.error(`❌ Error migrando marca ${brand.name}:`, error.message);
      }
    }
    
    console.log('\n📊 RESUMEN DE MIGRACIÓN:');
    console.log(`   • Marcas migradas: ${migrated}`);
    console.log(`   • Marcas omitidas: ${skipped}`);
    console.log(`   • Total procesadas: ${brands.length}`);
    
    // Verificar el resultado
    const updatedBrands = await prisma.brand.findMany({
      select: {
        name: true,
        vehicleTypes: true
      }
    });
    
    const mixedBrands = updatedBrands.filter(b => b.vehicleTypes.length > 1);
    console.log(`\n🔍 Marcas mixtas encontradas: ${mixedBrands.length}`);
    mixedBrands.forEach(brand => {
      console.log(`   - ${brand.name}: [${brand.vehicleTypes.join(', ')}]`);
    });
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  migrateBrandsToArray()
    .then(() => {
      console.log('\n🎉 Migración completada!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error ejecutando migración:', error);
      process.exit(1);
    });
}

module.exports = { migrateBrandsToArray };