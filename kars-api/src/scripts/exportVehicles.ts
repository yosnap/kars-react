import { MongoClient } from 'mongodb';
import { writeFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Vehicle {
  _id?: any;
  id?: string;
  [key: string]: any;
}

class VehicleExporter {
  private sourceClient: MongoClient;
  private sourceDb: any;

  constructor() {
    // Source database (local development)
    const sourceUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/karsad';
    this.sourceClient = new MongoClient(sourceUrl);
  }

  async connect() {
    console.log('🔌 Conectando a base de datos...');
    await this.sourceClient.connect();
    this.sourceDb = this.sourceClient.db();
    console.log('✅ Conexión establecida correctamente');
  }

  async disconnect() {
    console.log('🔌 Cerrando conexión...');
    await this.sourceClient.close();
    console.log('✅ Conexión cerrada');
  }

  async exportVehicles(outputPath: string) {
    try {
      await this.connect();

      console.log('📊 Obteniendo vehículos de la base de datos...');
      const vehicles = await this.sourceDb.collection('Vehicle').find({}).toArray();
      console.log(`📊 Encontrados ${vehicles.length} vehículos`);

      if (vehicles.length === 0) {
        console.log('⚠️  No hay vehículos para exportar');
        return;
      }

      // Clean data for export (remove MongoDB _id, keep custom id)
      const cleanedVehicles = vehicles.map(vehicle => {
        const { _id, ...cleanVehicle } = vehicle;
        return cleanVehicle;
      });

      // Create export object with metadata
      const exportData = {
        exportDate: new Date().toISOString(),
        totalVehicles: cleanedVehicles.length,
        vehicles: cleanedVehicles
      };

      console.log(`💾 Exportando vehículos a ${outputPath}...`);
      writeFileSync(outputPath, JSON.stringify(exportData, null, 2), 'utf-8');
      
      console.log('✅ Exportación completada exitosamente');
      console.log(`📄 Archivo creado: ${outputPath}`);
      console.log(`📊 Total de vehículos exportados: ${cleanedVehicles.length}`);

      return { count: cleanedVehicles.length, filePath: outputPath };

    } catch (error) {
      console.error('❌ Error durante la exportación:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Iniciando exportación de vehículos...');
  console.log('=' .repeat(50));

  const args = process.argv.slice(2);
  const outputFile = args[0] || join(process.cwd(), 'vehicles_export.json');
  
  console.log(`📄 Archivo de salida: ${outputFile}`);

  const exporter = new VehicleExporter();
  
  try {
    await exporter.exportVehicles(outputFile);
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export { VehicleExporter };