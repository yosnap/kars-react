const { PrismaClient } = require('@prisma/client');

async function testValues() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Verificando valores de tipusPropulsor en BD...');
    
    // Obtener todos los valores únicos de tipusPropulsor
    const propulsionValues = await prisma.vehicle.findMany({
      where: {
        tipusPropulsor: {
          not: null
        }
      },
      select: {
        tipusPropulsor: true
      },
      distinct: ['tipusPropulsor']
    });
    
    console.log('Valores únicos de tipusPropulsor:');
    propulsionValues.forEach(v => console.log(`  - "${v.tipusPropulsor}"`));
    
    console.log('\n🔍 Verificando valores de tipusCombustible en BD...');
    
    // Obtener todos los valores únicos de tipusCombustible  
    const fuelValues = await prisma.vehicle.findMany({
      where: {
        tipusCombustible: {
          not: null
        }
      },
      select: {
        tipusCombustible: true
      },
      distinct: ['tipusCombustible']
    });
    
    console.log('Valores únicos de tipusCombustible:');
    fuelValues.forEach(v => console.log(`  - "${v.tipusCombustible}"`));
    
    console.log('\n🔍 Verificando valores de tipusCanvi en BD...');
    
    // Obtener todos los valores únicos de tipusCanvi
    const transmissionValues = await prisma.vehicle.findMany({
      where: {
        tipusCanvi: {
          not: null
        }
      },
      select: {
        tipusCanvi: true
      },
      distinct: ['tipusCanvi']
    });
    
    console.log('Valores únicos de tipusCanvi:');
    transmissionValues.forEach(v => console.log(`  - "${v.tipusCanvi}"`));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testValues();