import { PrismaClient } from '@prisma/client';
import { backupVehicles } from './backupVehicles';

const prisma = new PrismaClient();

interface BrandMapping {
  [label: string]: string; // label -> slug
}

interface ModelMapping {
  [brandSlug: string]: {
    [modelLabel: string]: string; // modelLabel -> modelSlug
  };
}

async function loadBrandMappings(): Promise<{ carBrands: BrandMapping, motoBrands: BrandMapping }> {
  console.log('📋 Cargando mapeos de marcas...');
  
  // Cargar marcas de coches
  const carBrands = await prisma.brand.findMany({
    where: { vehicleTypes: { hasSome: ['car'] } }
  });
  
  // Cargar marcas de motos
  const motoBrands = await prisma.brand.findMany({
    where: { vehicleTypes: { hasSome: ['motorcycle'] } }
  });
  
  const carBrandMap: BrandMapping = {};
  const motoBrandMap: BrandMapping = {};
  
  carBrands.forEach(brand => {
    carBrandMap[brand.name] = brand.slug;
  });
  
  motoBrands.forEach(brand => {
    motoBrandMap[brand.name] = brand.slug;
  });
  
  console.log(`✅ Marcas de coches cargadas: ${Object.keys(carBrandMap).length}`);
  console.log(`✅ Marcas de motos cargadas: ${Object.keys(motoBrandMap).length}`);
  
  return { carBrands: carBrandMap, motoBrands: motoBrandMap };
}

async function loadModelMappings(brandSlug: string): Promise<{ [modelLabel: string]: string }> {
  // Primero encontrar la marca por slug para obtener su ID
  const brand = await prisma.brand.findFirst({
    where: { slug: brandSlug }
  });
  
  if (!brand) {
    return {};
  }
  
  const models = await prisma.model.findMany({
    where: { brandId: brand.id }
  });
  
  const modelMap: { [modelLabel: string]: string } = {};
  models.forEach(model => {
    modelMap[model.name] = model.slug;
  });
  
  return modelMap;
}

async function migrateBrandsToSlugs() {
  try {
    console.log('🚀 Iniciando migración de marcas y modelos a slugs...');
    
    // 1. Crear backup primero
    console.log('\n📁 Paso 1: Creando backup...');
    const backupFile = await backupVehicles();
    console.log(`✅ Backup creado: ${backupFile}`);
    
    // 2. Cargar mapeos de marcas
    console.log('\n📋 Paso 2: Cargando mapeos...');
    const { carBrands, motoBrands } = await loadBrandMappings();
    
    // 3. Obtener todos los vehículos
    console.log('\n🚗 Paso 3: Obteniendo vehículos...');
    const vehicles = await prisma.vehicle.findMany();
    console.log(`📊 Encontrados ${vehicles.length} vehículos para migrar`);
    
    let migratedCount = 0;
    let errorCount = 0;
    
    // 4. Migrar cada vehículo
    console.log('\n🔄 Paso 4: Migrando vehículos...');
    
    for (const vehicle of vehicles) {
      try {
        const updateData: any = {};
        let needsUpdate = false;
        
        // Determinar el tipo de vehículo y los campos a migrar
        const tipusVehicle = vehicle.tipusVehicle;
        const normalizedTipus = tipusVehicle?.toLowerCase();
        
        // Normalizar tipo de vehículo a minúsculas si es necesario
        if (tipusVehicle !== normalizedTipus) {
          updateData.tipusVehicle = normalizedTipus;
          needsUpdate = true;
        }
        
        if (normalizedTipus === 'cotxe' || normalizedTipus === 'autocaravana' || normalizedTipus === 'vehicle-comercial') {
          // Usar marcas de coches para estos tipos
          const marcaField = normalizedTipus === 'cotxe' ? 'marcaCotxe' : 
                           normalizedTipus === 'autocaravana' ? 'marquesAutocaravana' : 'marquesComercial';
          const modelField = normalizedTipus === 'cotxe' ? 'modelsCotxe' : 
                           normalizedTipus === 'autocaravana' ? 'modelsAutocaravana' : 'modelsComercial';
          
          const currentMarca = (vehicle as any)[marcaField];
          const currentModel = (vehicle as any)[modelField];
          
          // Migrar marca
          if (currentMarca && carBrands[currentMarca]) {
            updateData[marcaField] = carBrands[currentMarca];
            needsUpdate = true;
          }
          
          // Migrar modelo si tenemos la marca
          if (currentModel && updateData[marcaField]) {
            const modelMappings = await loadModelMappings(updateData[marcaField]);
            if (modelMappings[currentModel]) {
              updateData[modelField] = modelMappings[currentModel];
              needsUpdate = true;
            }
          }
          
        } else if (normalizedTipus === 'moto') {
          // Usar marcas de motos
          const currentMarca = vehicle.marcaMoto;
          const currentModel = vehicle.modelsMoto;
          
          // Migrar marca
          if (currentMarca && motoBrands[currentMarca]) {
            updateData.marcaMoto = motoBrands[currentMarca];
            needsUpdate = true;
          }
          
          // Migrar modelo si tenemos la marca
          if (currentModel && updateData.marcaMoto) {
            const modelMappings = await loadModelMappings(updateData.marcaMoto);
            if (modelMappings[currentModel]) {
              updateData.modelsMoto = modelMappings[currentModel];
              needsUpdate = true;
            }
          }
        }
        
        // Actualizar el vehículo si hay cambios
        if (needsUpdate) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: updateData
          });
          
          migratedCount++;
          
          if (migratedCount % 10 === 0) {
            console.log(`   📈 Migrados ${migratedCount}/${vehicles.length} vehículos...`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error migrando vehículo ${vehicle.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n🎉 ¡Migración completada!');
    console.log(`✅ Vehículos migrados exitosamente: ${migratedCount}`);
    console.log(`❌ Errores durante migración: ${errorCount}`);
    console.log(`📁 Backup disponible en: ${backupFile}`);
    
  } catch (error) {
    console.error('💥 Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  migrateBrandsToSlugs()
    .then(() => {
      console.log('🎊 ¡Migración completada exitosamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en migración:', error);
      process.exit(1);
    });
}

export { migrateBrandsToSlugs };