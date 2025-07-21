const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFeatured() {
  try {
    // Buscar vehículos destacados
    const featured = await prisma.vehicle.findMany({
      where: {
        anunciDestacat: { not: 0 }
      },
      select: {
        slug: true,
        titolAnunci: true,
        anunciDestacat: true
      },
      take: 5
    });
    
    console.log('Vehículos destacados encontrados:', featured.length);
    console.log('Ejemplos:', featured);
    
    // Contar total
    const count = await prisma.vehicle.count({
      where: { anunciDestacat: { not: 0 } }
    });
    
    console.log('\nTotal vehículos destacados:', count);
    
    // Verificar distribución de valores
    const distribution = await prisma.vehicle.groupBy({
      by: ['anunciDestacat'],
      _count: true,
      orderBy: { anunciDestacat: 'desc' },
      take: 10
    });
    
    console.log('\nDistribución de valores anunciDestacat:');
    distribution.forEach(d => {
      console.log(`  Valor ${d.anunciDestacat}: ${d._count} vehículos`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFeatured();