const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkModels() {
  try {
    // Obtener todas las marcas de coches
    const carBrands = await prisma.brand.findMany({
      where: { vehicleType: 'car' },
      include: {
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    console.log('📊 Estado de sincronización de modelos:');
    console.log('='.repeat(60));

    let totalBrands = 0;
    let brandsWithModels = 0;
    let totalModels = 0;

    carBrands.forEach(brand => {
      totalBrands++;
      const modelCount = brand._count.models;
      totalModels += modelCount;
      
      if (modelCount > 0) {
        brandsWithModels++;
        console.log(`✅ ${brand.name.padEnd(20)} → ${modelCount} modelos`);
      } else {
        console.log(`⏳ ${brand.name.padEnd(20)} → Sin sincronizar`);
      }
    });

    console.log('='.repeat(60));
    console.log(`📈 Total marcas: ${totalBrands}`);
    console.log(`✅ Marcas con modelos: ${brandsWithModels}`);
    console.log(`⏳ Marcas pendientes: ${totalBrands - brandsWithModels}`);
    console.log(`🔢 Total modelos: ${totalModels}`);
    console.log(`📊 Progreso: ${Math.round((brandsWithModels / totalBrands) * 100)}%`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkModels();