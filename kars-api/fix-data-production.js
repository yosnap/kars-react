#!/usr/bin/env node

// Script para corregir tipos de datos directamente en producción
// Ejecutar con: node fix-data-production.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDataTypes() {
  try {
    console.log('🔧 Iniciando corrección de tipos de datos...');
    
    // Obtener todos los vehículos
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        preu: true,
        garantia: true
      }
    });
    
    console.log(`📊 Total de vehículos a revisar: ${vehicles.length}`);
    
    let preuFixed = 0;
    let garantiaFixed = 0;
    let errors = 0;
    
    for (const vehicle of vehicles) {
      try {
        let needsUpdate = false;
        const updateData = {};
        
        // Verificar y corregir preu
        if (vehicle.preu !== null && vehicle.preu !== undefined) {
          if (typeof vehicle.preu === 'string') {
            const numericPreu = parseFloat(vehicle.preu);
            if (!isNaN(numericPreu)) {
              updateData.preu = numericPreu;
              needsUpdate = true;
              preuFixed++;
            } else {
              updateData.preu = 0;
              needsUpdate = true;
              preuFixed++;
            }
          }
        }
        
        // Verificar y corregir garantia
        if (vehicle.garantia !== null && vehicle.garantia !== undefined) {
          if (typeof vehicle.garantia === 'boolean') {
            updateData.garantia = vehicle.garantia ? 'true' : 'false';
            needsUpdate = true;
            garantiaFixed++;
          } else if (typeof vehicle.garantia !== 'string') {
            updateData.garantia = String(vehicle.garantia);
            needsUpdate = true;
            garantiaFixed++;
          }
        }
        
        // Actualizar si es necesario
        if (needsUpdate) {
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: updateData
          });
          
          if ((preuFixed + garantiaFixed) % 10 === 0) {
            console.log(`💾 Procesados: ${preuFixed} precios, ${garantiaFixed} garantías...`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error procesando vehículo ${vehicle.id}:`, error.message);
        errors++;
      }
    }
    
    console.log('\n✅ Corrección completada:');
    console.log(`📈 Precios corregidos: ${preuFixed}`);
    console.log(`🛡️  Garantías corregidas: ${garantiaFixed}`);
    console.log(`❌ Errores: ${errors}`);
    
    // Verificar resultados
    console.log('\n🔍 Verificando resultados...');
    const sampleVehicles = await prisma.vehicle.findMany({
      take: 5,
      select: {
        id: true,
        preu: true,
        garantia: true
      }
    });
    
    console.log('📋 Muestra de vehículos corregidos:');
    sampleVehicles.forEach(v => {
      console.log(`  - ID: ${v.id}, Preu: ${v.preu} (${typeof v.preu}), Garantia: ${v.garantia} (${typeof v.garantia})`);
    });
    
    console.log('\n🎉 ¡Proceso completado! Ahora puedes reiniciar el servicio.');
    
  } catch (error) {
    console.error('❌ Error fatal:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar
console.log('🚀 Script de corrección de tipos de datos para producción');
console.log('=' .repeat(50));
fixDataTypes();