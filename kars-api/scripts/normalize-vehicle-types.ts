import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function normalizeVehicleTypes() {
  console.log('🔄 Starting vehicle type normalization...');
  
  try {
    // Obtener todos los vehículos con tipusVehicle en mayúsculas
    const vehiclesWithUppercase = await prisma.vehicle.findMany({
      where: {
        OR: [
          { tipusVehicle: 'COTXE' },
          { tipusVehicle: 'MOTO' },
          { tipusVehicle: 'AUTOCARAVANA-CAMPER' },
          { tipusVehicle: 'VEHICLE-COMERCIAL' }
        ]
      },
      select: {
        id: true,
        tipusVehicle: true
      }
    });
    
    console.log(`📊 Found ${vehiclesWithUppercase.length} vehicles with uppercase types`);
    
    // Actualizar cada vehículo
    let updated = 0;
    for (const vehicle of vehiclesWithUppercase) {
      await prisma.vehicle.update({
        where: { id: vehicle.id },
        data: { tipusVehicle: vehicle.tipusVehicle.toLowerCase() }
      });
      updated++;
      
      if (updated % 10 === 0) {
        console.log(`✅ Updated ${updated}/${vehiclesWithUppercase.length} vehicles`);
      }
    }
    
    console.log(`✨ Successfully normalized ${updated} vehicles`);
    
    // Verificar los tipos únicos después de la normalización
    const uniqueTypes = await prisma.vehicle.groupBy({
      by: ['tipusVehicle'],
      _count: true
    });
    
    console.log('\n📋 Vehicle types after normalization:');
    uniqueTypes.forEach(type => {
      console.log(`   - ${type.tipusVehicle}: ${type._count} vehicles`);
    });
    
  } catch (error) {
    console.error('❌ Error normalizing vehicle types:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
normalizeVehicleTypes();