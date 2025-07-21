const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkProfessionalVehicles() {
  try {
    // Todos los profesionales
    const allProfessionals = await prisma.user.count({
      where: { role: 'professional' }
    });
    
    // Profesionales con activeVehicles > 0
    const professionalsWithActiveVehicles = await prisma.user.count({
      where: { 
        role: 'professional',
        activeVehicles: { gt: 0 }
      }
    });
    
    // Profesionales con totalVehicles > 0
    const professionalsWithTotalVehicles = await prisma.user.count({
      where: { 
        role: 'professional',
        totalVehicles: { gt: 0 }
      }
    });
    
    console.log('Profesionales en la base de datos:');
    console.log(`  Total: ${allProfessionals}`);
    console.log(`  Con activeVehicles > 0: ${professionalsWithActiveVehicles}`);
    console.log(`  Con totalVehicles > 0: ${professionalsWithTotalVehicles}`);
    
    // Ejemplos de profesionales con sus vehículos calculados
    const examples = await prisma.user.findMany({
      where: { role: 'professional' },
      select: {
        username: true,
        name: true,
        nomEmpresa: true,
        totalVehicles: true,
        activeVehicles: true,
        originalUserId: true
      },
      take: 10,
      orderBy: { totalVehicles: 'desc' }
    });
    
    console.log('\nEjemplos de profesionales:');
    examples.forEach(prof => {
      console.log(`  ${prof.username} (${prof.nomEmpresa || prof.name})`);
      console.log(`    Original ID: ${prof.originalUserId}`);
      console.log(`    Total: ${prof.totalVehicles}, Activos: ${prof.activeVehicles}`);
    });
    
    // Verificar cuántos vehículos hay realmente por professional
    console.log('\nVerificación manual de vehículos:');
    for (const prof of examples.slice(0, 5)) {
      const vehicleCount = await prisma.vehicle.count({
        where: {
          OR: [
            { professionalId: prof.originalUserId },
            { authorId: prof.originalUserId }
          ]
        }
      });
      
      const activeVehicleCount = await prisma.vehicle.count({
        where: {
          OR: [
            { professionalId: prof.originalUserId },
            { authorId: prof.originalUserId }
          ],
          anunciActiu: true
        }
      });
      
      console.log(`  ${prof.username}: BD dice ${prof.totalVehicles}/${prof.activeVehicles}, real es ${vehicleCount}/${activeVehicleCount}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProfessionalVehicles();