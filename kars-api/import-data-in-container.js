#!/usr/bin/env node

// Script para importar vehículos DENTRO del contenedor Docker
// Usa la conexión de Prisma ya configurada

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function importVehicles() {
  try {
    console.log('📄 Cargando vehículos desde JSON...');
    
    let vehiclesData;
    try {
      const jsonData = fs.readFileSync('vehicles_export.json', 'utf-8');
      vehiclesData = JSON.parse(jsonData);
    } catch (error) {
      console.error('❌ No se pudo cargar vehicles_export.json:', error.message);
      console.log('💡 Asegúrate de que el archivo existe en el directorio del contenedor');
      return;
    }
    
    const vehicles = vehiclesData.vehicles || vehiclesData;
    
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      console.log('⚠️  No se encontraron vehículos para importar');
      return;
    }
    
    console.log(`📊 Preparando importación de ${vehicles.length} vehículos...`);
    
    // Limpiar colección existente usando Prisma
    console.log('🗑️  Limpiando vehículos existentes...');
    const deleteResult = await prisma.vehicle.deleteMany({});
    console.log(`🗑️  Eliminados ${deleteResult.count} vehículos existentes`);
    
    // Procesar e insertar vehículos
    console.log('💾 Insertando vehículos...');
    let insertedCount = 0;
    let errors = 0;

    for (const vehicle of vehicles) {
      try {
        // Limpiar y procesar datos del vehículo
        const { _id, ...cleanVehicle } = vehicle;
        
        const processedVehicle = {
          ...cleanVehicle,
          // Asegurar que preu es número
          preu: typeof cleanVehicle.preu === 'number' 
            ? cleanVehicle.preu 
            : parseFloat(cleanVehicle.preu) || 0,
          
          // Asegurar que garantia es string
          garantia: cleanVehicle.garantia !== undefined 
            ? String(cleanVehicle.garantia) 
            : null,
          
          // Asegurar fechas correctas
          dataCreacio: cleanVehicle.dataCreacio 
            ? new Date(cleanVehicle.dataCreacio) 
            : new Date(),
          createdAt: cleanVehicle.createdAt 
            ? new Date(cleanVehicle.createdAt) 
            : new Date(),
          updatedAt: new Date()
        };

        // Usar createMany sería más eficiente pero no funciona con datos únicos
        await prisma.vehicle.create({
          data: processedVehicle
        });
        
        insertedCount++;
        
        if (insertedCount % 25 === 0) {
          console.log(`💾 Procesados ${insertedCount}/${vehicles.length} vehículos...`);
        }
        
      } catch (error) {
        console.error(`❌ Error insertando vehículo:`, error.message);
        errors++;
        
        // Si hay demasiados errores, parar
        if (errors > 10) {
          console.error('🛑 Demasiados errores, deteniendo importación');
          break;
        }
      }
    }

    console.log('\n✅ Importación completada:');
    console.log(`📊 Vehículos insertados: ${insertedCount}`);
    console.log(`❌ Errores: ${errors}`);
    
    // Verificar importación
    const finalCount = await prisma.vehicle.count();
    console.log(`🔍 Total en base de datos: ${finalCount}`);
    
    if (finalCount === insertedCount) {
      console.log('🎉 ¡Importación exitosa! Reinicia el servicio en Easypanel');
    } else {
      console.log('⚠️  Puede haber problemas con la importación');
    }
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🚀 Importación de vehículos - Versión Container');
console.log('=' .repeat(50));
importVehicles();