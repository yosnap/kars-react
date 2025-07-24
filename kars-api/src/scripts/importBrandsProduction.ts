import { PrismaClient } from '@prisma/client';
import { brandsData, BrandData } from '../data/brands-data';

const prisma = new PrismaClient();

async function importBrands() {
  try {
    console.log('🚀 Starting brands import (production mode)...');
    
    console.log(`📊 Found ${brandsData.metadata.totalCarBrands} car brands and ${brandsData.metadata.totalMotorcycleBrands} motorcycle brands`);
    console.log(`🔄 Duplicate brands: ${brandsData.metadata.duplicateBrands}`);
    
    let importedCars = 0;
    let importedMotorcycles = 0;
    let skippedCars = 0;
    let skippedMotorcycles = 0;
    let updatedDuplicates = 0;
    
    // Importar marcas de coches
    console.log('🚗 Importing car brands...');
    for (const brand of brandsData.carBrands) {
      try {
        // Verificar si ya existe
        const existingBrand = await prisma.brand.findUnique({
          where: { slug: brand.value }
        });
        
        if (existingBrand) {
          // Si existe, actualizar para asegurar que incluye 'car' en vehicleTypes
          if (!existingBrand.vehicleTypes.includes('car')) {
            await prisma.brand.update({
              where: { id: existingBrand.id },
              data: {
                vehicleTypes: [...existingBrand.vehicleTypes, 'car']
              }
            });
            updatedDuplicates++;
            console.log(`✅ Updated existing brand: ${brand.label} (added car type)`);
          } else {
            skippedCars++;
            console.log(`⏭️ Car brand already exists: ${brand.label}`);
          }
        } else {
          // Crear nueva marca
          await prisma.brand.create({
            data: {
              name: brand.label,
              slug: brand.value,
              vehicleTypes: ['car']
            }
          });
          importedCars++;
          console.log(`✅ Imported car brand: ${brand.label}`);
        }
      } catch (error) {
        console.error(`❌ Error importing car brand ${brand.label}:`, error);
        skippedCars++;
      }
    }
    
    // Importar marcas de motos
    console.log('🏍️ Importing motorcycle brands...');
    for (const brand of brandsData.motorcycleBrands) {
      try {
        // Verificar si ya existe
        const existingBrand = await prisma.brand.findUnique({
          where: { slug: brand.value }
        });
        
        if (existingBrand) {
          // Si existe, actualizar para asegurar que incluye 'motorcycle' en vehicleTypes
          if (!existingBrand.vehicleTypes.includes('motorcycle')) {
            await prisma.brand.update({
              where: { id: existingBrand.id },
              data: {
                vehicleTypes: [...existingBrand.vehicleTypes, 'motorcycle']
              }
            });
            updatedDuplicates++;
            console.log(`✅ Updated existing brand: ${brand.label} (added motorcycle type)`);
          } else {
            skippedMotorcycles++;
            console.log(`⏭️ Motorcycle brand already exists: ${brand.label}`);
          }
        } else {
          // Crear nueva marca
          await prisma.brand.create({
            data: {
              name: brand.label,
              slug: brand.value,
              vehicleTypes: ['motorcycle']
            }
          });
          importedMotorcycles++;
          console.log(`✅ Imported motorcycle brand: ${brand.label}`);
        }
      } catch (error) {
        console.error(`❌ Error importing motorcycle brand ${brand.label}:`, error);
        skippedMotorcycles++;
      }
    }
    
    // Resumen final
    console.log('\n📊 IMPORT SUMMARY');
    console.log('==================');
    console.log(`🚗 Car brands imported: ${importedCars}`);
    console.log(`🚗 Car brands skipped: ${skippedCars}`);
    console.log(`🏍️ Motorcycle brands imported: ${importedMotorcycles}`);
    console.log(`🏍️ Motorcycle brands skipped: ${skippedMotorcycles}`);
    console.log(`🔄 Duplicate brands updated: ${updatedDuplicates}`);
    console.log(`✅ Total brands processed: ${importedCars + importedMotorcycles + skippedCars + skippedMotorcycles}`);
    
    // Verificar totales en base de datos
    const totalCarBrands = await prisma.brand.count({
      where: { vehicleTypes: { hasSome: ['car'] } }
    });
    const totalMotorcycleBrands = await prisma.brand.count({
      where: { vehicleTypes: { hasSome: ['motorcycle'] } }
    });
    const totalBrands = await prisma.brand.count();
    
    console.log('\n🗄️ DATABASE STATUS');
    console.log('==================');
    console.log(`🚗 Total car brands in DB: ${totalCarBrands}`);
    console.log(`🏍️ Total motorcycle brands in DB: ${totalMotorcycleBrands}`);
    console.log(`📦 Total brands in DB: ${totalBrands}`);
    console.log('\n🎉 Brands import completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during brands import:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  importBrands()
    .then(() => {
      console.log('✅ Import script finished successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Import script failed:', error);
      process.exit(1);
    });
}

export default importBrands;