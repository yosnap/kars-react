import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function backupVehicles() {
  try {
    console.log('🔄 Iniciando backup de vehículos...');
    
    // Obtener todos los vehículos
    const vehicles = await prisma.vehicle.findMany();
    
    console.log(`📊 Encontrados ${vehicles.length} vehículos para hacer backup`);
    
    // Crear directorio de backup si no existe
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Crear nombre de archivo con timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(backupDir, `vehicles-backup-${timestamp}.json`);
    
    // Escribir backup
    fs.writeFileSync(backupFile, JSON.stringify(vehicles, null, 2));
    
    console.log(`✅ Backup creado exitosamente: ${backupFile}`);
    console.log(`📁 Total de vehículos respaldados: ${vehicles.length}`);
    
    return backupFile;
    
  } catch (error) {
    console.error('❌ Error durante el backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  backupVehicles()
    .then((file) => {
      console.log(`🎉 Backup completado: ${file}`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error en backup:', error);
      process.exit(1);
    });
}

export { backupVehicles };