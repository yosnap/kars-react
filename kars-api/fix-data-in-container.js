#!/usr/bin/env node

// Script para ejecutar DENTRO del contenedor Docker
// Usa la conexión de Prisma ya configurada

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixDataTypes() {
  try {
    console.log('🔧 Iniciando corrección de tipos de datos...');
    
    // Usar comandos raw de MongoDB a través de Prisma
    console.log('📊 Corrigiendo campo preu (string → number)...');
    
    const preuResult = await prisma.$runCommandRaw({
      update: 'Vehicle',
      updates: [{
        q: { preu: { $type: 'string' } },
        u: [{ 
          $set: { 
            preu: { 
              $convert: {
                input: '$preu',
                to: 'double',
                onError: 0,
                onNull: 0
              }
            }
          }
        }],
        multi: true
      }]
    });
    
    console.log('✅ Campo preu corregido');
    
    console.log('📊 Corrigiendo campo garantia (boolean → string)...');
    
    const garantiaResult = await prisma.$runCommandRaw({
      update: 'Vehicle',
      updates: [{
        q: { garantia: { $type: 'bool' } },
        u: [{ 
          $set: { 
            garantia: { 
              $convert: {
                input: '$garantia',
                to: 'string'
              }
            }
          }
        }],
        multi: true
      }]
    });
    
    console.log('✅ Campo garantia corregido');
    
    // Verificar resultados
    console.log('\n🔍 Verificando correcciones...');
    
    const countResult = await prisma.$runCommandRaw({
      aggregate: 'Vehicle',
      pipeline: [
        {
          $facet: {
            totalVehicles: [{ $count: 'count' }],
            preuStrings: [
              { $match: { preu: { $type: 'string' } } },
              { $count: 'count' }
            ],
            garantiaBools: [
              { $match: { garantia: { $type: 'bool' } } },
              { $count: 'count' }
            ]
          }
        }
      ],
      cursor: {}
    });
    
    const stats = countResult.cursor.firstBatch[0];
    console.log('📊 Estadísticas finales:');
    console.log(`   Total vehículos: ${stats.totalVehicles[0]?.count || 0}`);
    console.log(`   Precios string restantes: ${stats.preuStrings[0]?.count || 0}`);
    console.log(`   Garantías boolean restantes: ${stats.garantiaBools[0]?.count || 0}`);
    
    if ((stats.preuStrings[0]?.count || 0) === 0 && (stats.garantiaBools[0]?.count || 0) === 0) {
      console.log('\n🎉 ¡Todos los tipos de datos han sido corregidos!');
      console.log('🔄 Puedes reiniciar el servicio en Easypanel');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Detalles:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

console.log('🚀 Script de corrección de tipos - Versión Container');
console.log('=' .repeat(50));
fixDataTypes();