import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Mapeo de nombres de extras a slugs basado en los datos proporcionados
const extrasMapping: Record<string, string> = {
  // Seguridad
  "ABS": "abs",
  "Airbags cortina": "airbag-cortina",
  "Airbags cortines": "airbag-cortina",
  "Airbag frontal": "airbag-frontal",
  "Airbag lateral": "airbag-lateral",
  "Alarma": "alarma",
  "ESP": "esp",
  "Control d'estabilitat": "control-estabilitat",
  "Control de tracció": "control-traccio",
  "Immobilitzador": "immobilitzador",
  
  // Confort
  "Aire Acondicionat": "aire-acondicionat",
  "Aire acondicionat": "aire-acondicionat",
  "Climatitzador": "climatitzador",
  "Climatització": "climatitzador",
  "Calefacció": "calefaccio",
  "Sostre obert": "sostre-obert",
  "Sostre panoràmic": "sostre-panoramic",
  
  // Tecnologia
  "Bluetooth": "bluetooth",
  "GPS": "gps",
  "Navegador": "navegador",
  "Ordinador de bord": "ordinador-bord",
  "Pantalla tàctil": "pantalla-tactil",
  "Endoll USB": "connexio-usb",
  "Connexió USB": "connexio-usb",
  "WiFi": "wifi",
  
  // Audio
  "Ràdio CD": "radio-cd",
  "MP3": "mp3",
  "Sistema d'àudio": "sistema-audio",
  "Altaveus": "altaveus",
  "Mans lliures": "handfree",
  
  // Iluminació
  "Fars de xenon": "fars-xenon",
  "Llums LED": "llums-led",
  "Fars adapatius": "fars-adapatius",
  "Llums diürnes": "llums-diurnes",
  
  // Assistència
  "Control de creuer adaptatiu": "adaptive-cruise-control",
  "Control de creuer": "control-creuer",
  "Sensor d'aparcament": "sensor-aparcament",
  "Càmera marxa enrere": "camera-marxa-enrere",
  "Assist. aparcament": "assistencia-aparcament",
  "Assistència aparcament": "assistencia-aparcament",
  
  // Mecànica
  "Direcció assistida": "direccio-assistida",
  "Turbo": "turbo",
  "Llandes d'aliatge": "llantes-aliatge",
  "Suspensió": "suspensio",
  "Elevador": "elevador",
  "Retrovisors": "retrovisors",
  "Seients": "seients",
  
  // Motos
  "Maletes": "maletes",
  "Pantalla del vent": "pantalla-vent",
  "Puny calefactor": "puny-calefactor",
  
  // Habitáculo (autocaravanas)
  "Cuina": "cuina",
  "Nevera": "nevera",
  "Dutxa": "dutxa",
  "WC": "wc",
  "TV": "tv",
  "Llit": "llit",
  "Cafetera": "cafetera",
  "Dipòsit d'aigua": "diposit-aigua"
};

// Función para normalizar strings para comparación
const normalizeString = (str: string): string => {
  return str.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[àáâãä]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/ç/g, 'c')
    .replace(/ñ/g, 'n')
    .replace(/·/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '-')
    .replace(/[^\w-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Función para encontrar el slug correspondiente a un nombre
const findSlugForName = (name: string): string => {
  // Buscar coincidencia exacta
  if (extrasMapping[name]) {
    return extrasMapping[name];
  }
  
  // Buscar coincidencia normalizada
  const normalizedName = normalizeString(name);
  for (const [originalName, slug] of Object.entries(extrasMapping)) {
    if (normalizeString(originalName) === normalizedName) {
      return slug;
    }
  }
  
  // Si no se encuentra, devolver el nombre normalizado como slug
  return normalizedName;
};

async function migrateExtrasToSlugs() {
  console.log('🚀 Iniciando migración de extras de nombres a slugs...');
  
  try {
    // Obtener todos los vehículos
    const vehicles = await prisma.vehicle.findMany({
      select: {
        id: true,
        extresCotxe: true,
        extresMoto: true,
        extresAutocaravana: true,
        extresHabitacle: true
      }
    });
    
    console.log(`📋 Encontrados ${vehicles.length} vehículos para migrar`);
    
    let updatedCount = 0;
    const migrationLog: Array<{vehicleId: string, field: string, before: string[], after: string[]}> = [];
    
    for (const vehicle of vehicles) {
      const updates: any = {};
      let hasChanges = false;
      
      // Migrar extresCotxe
      if (vehicle.extresCotxe && Array.isArray(vehicle.extresCotxe) && vehicle.extresCotxe.length > 0) {
        const migratedExtras = vehicle.extresCotxe
          .filter(extra => extra && extra !== 'on')
          .map(extra => findSlugForName(extra));
        
        if (JSON.stringify(migratedExtras) !== JSON.stringify(vehicle.extresCotxe)) {
          updates.extresCotxe = migratedExtras;
          hasChanges = true;
          migrationLog.push({
            vehicleId: vehicle.id,
            field: 'extresCotxe',
            before: vehicle.extresCotxe,
            after: migratedExtras
          });
        }
      }
      
      // Migrar extresMoto
      if (vehicle.extresMoto && Array.isArray(vehicle.extresMoto) && vehicle.extresMoto.length > 0) {
        const migratedExtras = vehicle.extresMoto
          .filter(extra => extra && extra !== 'on')
          .map(extra => findSlugForName(extra));
        
        if (JSON.stringify(migratedExtras) !== JSON.stringify(vehicle.extresMoto)) {
          updates.extresMoto = migratedExtras;
          hasChanges = true;
          migrationLog.push({
            vehicleId: vehicle.id,
            field: 'extresMoto',
            before: vehicle.extresMoto,
            after: migratedExtras
          });
        }
      }
      
      // Migrar extresAutocaravana
      if (vehicle.extresAutocaravana && Array.isArray(vehicle.extresAutocaravana) && vehicle.extresAutocaravana.length > 0) {
        const migratedExtras = vehicle.extresAutocaravana
          .filter(extra => extra && extra !== 'on')
          .map(extra => findSlugForName(extra));
        
        if (JSON.stringify(migratedExtras) !== JSON.stringify(vehicle.extresAutocaravana)) {
          updates.extresAutocaravana = migratedExtras;
          hasChanges = true;
          migrationLog.push({
            vehicleId: vehicle.id,
            field: 'extresAutocaravana',
            before: vehicle.extresAutocaravana,
            after: migratedExtras
          });
        }
      }
      
      // Migrar extresHabitacle
      if (vehicle.extresHabitacle && Array.isArray(vehicle.extresHabitacle) && vehicle.extresHabitacle.length > 0) {
        const migratedExtras = vehicle.extresHabitacle
          .filter(extra => extra && extra !== 'on')
          .map(extra => findSlugForName(extra));
        
        if (JSON.stringify(migratedExtras) !== JSON.stringify(vehicle.extresHabitacle)) {
          updates.extresHabitacle = migratedExtras;
          hasChanges = true;
          migrationLog.push({
            vehicleId: vehicle.id,
            field: 'extresHabitacle',
            before: vehicle.extresHabitacle,
            after: migratedExtras
          });
        }
      }
      
      // Actualizar el vehículo si hay cambios
      if (hasChanges) {
        await prisma.vehicle.update({
          where: { id: vehicle.id },
          data: updates
        });
        updatedCount++;
      }
    }
    
    console.log(`✅ Migración completada:`);
    console.log(`   - Vehículos procesados: ${vehicles.length}`);
    console.log(`   - Vehículos actualizados: ${updatedCount}`);
    
    // Mostrar algunos ejemplos de migración
    if (migrationLog.length > 0) {
      console.log('\n📝 Ejemplos de migración:');
      migrationLog.slice(0, 5).forEach(log => {
        console.log(`   Vehículo ${log.vehicleId} - ${log.field}:`);
        console.log(`     Antes: [${log.before.join(', ')}]`);
        console.log(`     Después: [${log.after.join(', ')}]`);
      });
    }
    
    return {
      totalVehicles: vehicles.length,
      updatedVehicles: updatedCount,
      migrationLog
    };
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Ejecutar la migración si se llama directamente
if (require.main === module) {
  migrateExtrasToSlugs()
    .then((result) => {
      console.log('🎉 Migración completada exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en la migración:', error);
      process.exit(1);
    })
    .finally(() => {
      prisma.$disconnect();
    });
}

export default migrateExtrasToSlugs;