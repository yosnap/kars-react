const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllVehicles() {
  try {
    console.log('🗑️  Eliminando todos los vehículos de la base de datos...\n');
    
    // Contar vehículos actuales
    const currentCount = await prisma.vehicle.count();
    console.log(`📊 Vehículos actuales: ${currentCount}`);
    
    if (currentCount === 0) {
      console.log('✅ No hay vehículos para eliminar.');
      return;
    }
    
    // Confirmar eliminación
    console.log('\n⚠️  ADVERTENCIA: Esto eliminará TODOS los vehículos.');
    console.log('   El backup ya fue creado en: backups/backup-20250725-160412\n');
    
    // Eliminar todos los vehículos
    const result = await prisma.vehicle.deleteMany({});
    
    console.log(`✅ Eliminados ${result.count} vehículos exitosamente.`);
    
    // Verificar que no quedan vehículos
    const remainingCount = await prisma.vehicle.count();
    console.log(`\n📊 Vehículos restantes: ${remainingCount}`);
    
    console.log('\n🎯 Base de datos lista para importación desde API externa.');
    
  } catch (error) {
    console.error('❌ Error eliminando vehículos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllVehicles();