import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de correcciones basado en el payload actualizado
const extrasCorrections: Record<string, string> = {
  // Correcciones identificadas
  "airbag-cortina": "airbags-cortina",
  "llandes-alliatge": "llandes-aliatge", 
  "llums-anti-boira": "llums-antiboira",
  "navegador-gps": "gps",
  "ordinador-bord": "ordinador-de-bord",
  "pintura-metallitzada": "pintura-metalitzada",
  "llums-led": "fars-led",
  
  // Otras posibles inconsistencias
  "control-per-canvi-carril": "assist-per-canvi-carril",
  "connexio-usb": "endoll-usb",
  "connexio-mp3-ipod": "connexio-mp3-ipod",
  "connexio-telefon": "connexio-telefon",
  "camara-visio-posterior": "camara-visio-posterior",
  "camera-visio-davant": "camera-visio-davant"
};

async function fixExtrasInconsistencies() {
  console.log('🔧 Iniciando corrección de inconsistencias en extras...');
  
  try {
    // Obtener todos los vehículos con extras
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        titolAnunci: true,
        extresCotxe: true,
        extresMoto: true,
        extresAutocaravana: true,
        extresHabitacle: true
      }
    });
    
    console.log(`📋 Procesando ${vehicles.length} vehículos...`);
    
    let updatedCount = 0;
    const corrections: Array<{vehicleId: string, field: string, corrections: Array<{from: string, to: string}>}> = [];
    
    for (const vehicle of vehicles) {
      const updates: any = {};
      let hasChanges = false;
      
      // Función para corregir extras de un campo
      const correctExtras = (extras: string[] | null, fieldName: string): string[] | null => {
        if (!extras || !Array.isArray(extras) || extras.length === 0) {
          return extras;
        }
        
        const correctedExtras = extras.map(extra => {
          if (extrasCorrections[extra]) {
            corrections.push({
              vehicleId: vehicle.id,
              field: fieldName,
              corrections: [{from: extra, to: extrasCorrections[extra]}]
            });
            return extrasCorrections[extra];
          }
          return extra;
        });
        
        return JSON.stringify(correctedExtras) !== JSON.stringify(extras) ? correctedExtras : extras;
      };
      
      // Corregir cada tipo de extras
      const correctedCotxe = correctExtras(vehicle.extresCotxe, 'extresCotxe');
      if (correctedCotxe !== vehicle.extresCotxe) {
        updates.extresCotxe = correctedCotxe;
        hasChanges = true;
      }
      
      const correctedMoto = correctExtras(vehicle.extresMoto, 'extresMoto');
      if (correctedMoto !== vehicle.extresMoto) {
        updates.extresMoto = correctedMoto;
        hasChanges = true;
      }
      
      const correctedAutocaravana = correctExtras(vehicle.extresAutocaravana, 'extresAutocaravana');
      if (correctedAutocaravana !== vehicle.extresAutocaravana) {
        updates.extresAutocaravana = correctedAutocaravana;
        hasChanges = true;
      }
      
      const correctedHabitacle = correctExtras(vehicle.extresHabitacle, 'extresHabitacle');
      if (correctedHabitacle !== vehicle.extresHabitacle) {
        updates.extresHabitacle = correctedHabitacle;
        hasChanges = true;
      }
      
      // Actualizar el vehículo si hay cambios
      if (hasChanges) {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: updates
        });
        updatedCount++;
        
        console.log(`✅ Actualizado: ${vehicle.titolAnunci}`);
      }
    }
    
    console.log(`\n🎉 Corrección completada:`);
    console.log(`   - Vehículos procesados: ${vehicles.length}`);
    console.log(`   - Vehículos actualizados: ${updatedCount}`);
    
    // Mostrar algunas correcciones realizadas
    if (corrections.length > 0) {
      console.log('\n📝 Ejemplos de correcciones realizadas:');
      corrections.slice(0, 10).forEach(correction => {
        correction.corrections.forEach(corr => {
          console.log(`   "${corr.from}" → "${corr.to}"`);
        });
      });
    }
    
    return {
      totalVehicles: vehicles.length,
      updatedVehicles: updatedCount,
      totalCorrections: corrections.length
    };
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error);
    throw error;
  }
}

// Verificar que el vehículo específico tenga los extras correctos
async function verifySpecificVehicle(vehicleId: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: {
      id: true,
      titolAnunci: true,
      extresCotxe: true
    }
  });
  
  if (vehicle?.extresCotxe) {
    console.log('\n🔍 Verificación del vehículo específico:');
    console.log('ID:', vehicle.id);
    console.log('Título:', vehicle.titolAnunci);
    console.log('Total extras:', vehicle.extresCotxe.length);
    console.log('Extras corregidos:', vehicle.extresCotxe.slice(0, 10));
  }
}

// Ejecutar la corrección si se llama directamente
if (require.main === module) {
  fixExtrasInconsistencies()
    .then(async (result) => {
      console.log('🎉 Corrección completada exitosamente');
      
      // Verificar el vehículo específico
      await verifySpecificVehicle('68801ef9b2ad458802b4527a');
      
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la corrección:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default fixExtrasInconsistencies;