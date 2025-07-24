import { MongoClient } from 'mongodb';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Vehicle {
  _id?: any;
  id?: string;
  [key: string]: any;
}

class JsonVehicleImporter {
  private targetClient: MongoClient;
  private targetDb: any;

  constructor() {
    // Target database (production) - encode special characters
    const targetUrl = process.env.PRODUCTION_DATABASE_URL || 'mongodb://kars:c%40D%2APZmWQZ49gMYD@motoraldia_kars-db:27017/karsad?tls=false';
    this.targetClient = new MongoClient(targetUrl);
  }

  async connect() {
    console.log('🔌 Conectando a base de datos de producción...');
    await this.targetClient.connect();
    this.targetDb = this.targetClient.db();
    console.log('✅ Conexión establecida correctamente');
  }

  async disconnect() {
    console.log('🔌 Cerrando conexión...');
    await this.targetClient.close();
    console.log('✅ Conexión cerrada');
  }

  loadVehiclesFromJson(filePath: string): Vehicle[] {
    console.log(`📄 Cargando vehículos desde ${filePath}...`);
    
    try {
      const jsonData = readFileSync(filePath, 'utf-8');
      const data = JSON.parse(jsonData);
      
      // Handle different JSON structures
      let vehicles: Vehicle[] = [];
      
      if (Array.isArray(data)) {
        vehicles = data;
      } else if (data.vehicles && Array.isArray(data.vehicles)) {
        vehicles = data.vehicles;
      } else if (data.data && Array.isArray(data.data)) {
        vehicles = data.data;
      } else {
        throw new Error('Formato JSON no reconocido. Se esperaba un array de vehículos o un objeto con propiedad "vehicles" o "data"');
      }
      
      console.log(`📄 Cargados ${vehicles.length} vehículos desde el archivo JSON`);
      return vehicles;
      
    } catch (error) {
      console.error('❌ Error cargando archivo JSON:', error);
      throw error;
    }
  }

  async clearTargetVehicles() {
    console.log('🗑️  Limpiando vehículos existentes en producción...');
    const result = await this.targetDb.collection('Vehicle').deleteMany({});
    console.log(`🗑️  Eliminados ${result.deletedCount} vehículos existentes`);
  }

  async insertVehicles(vehicles: Vehicle[]) {
    console.log('💾 Insertando vehículos en base de datos de producción...');
    
    let insertedCount = 0;
    let errors = 0;

    for (const vehicle of vehicles) {
      try {
        // Remove _id to let MongoDB generate a new one
        const { _id, ...vehicleData } = vehicle;
        
        // Ensure required fields and data types
        const processedVehicle = {
          ...vehicleData,
          // Ensure price is a number if it exists
          ...(vehicleData.preu && { preu: typeof vehicleData.preu === 'number' ? vehicleData.preu : parseFloat(vehicleData.preu) || 0 }),
          // Ensure dates are proper Date objects
          ...(vehicleData.createdAt && { createdAt: new Date(vehicleData.createdAt) }),
          ...(vehicleData.updatedAt && { updatedAt: new Date(vehicleData.updatedAt) }),
          // Add current timestamp if missing
          createdAt: vehicleData.createdAt ? new Date(vehicleData.createdAt) : new Date(),
          updatedAt: new Date()
        };

        await this.targetDb.collection('Vehicle').insertOne(processedVehicle);
        insertedCount++;
        
        if (insertedCount % 10 === 0) {
          console.log(`💾 Procesados ${insertedCount}/${vehicles.length} vehículos...`);
        }
      } catch (error) {
        console.error(`❌ Error insertando vehículo:`, error);
        errors++;
      }
    }

    console.log(`✅ Importación completada: ${insertedCount} vehículos insertados, ${errors} errores`);
    return { inserted: insertedCount, errors };
  }

  async verifyImport(expectedCount: number) {
    console.log('🔍 Verificando integridad de la importación...');
    
    const actualCount = await this.targetDb.collection('Vehicle').countDocuments();
    
    console.log(`📊 Vehículos esperados: ${expectedCount}`);
    console.log(`📊 Vehículos insertados: ${actualCount}`);
    
    if (expectedCount === actualCount) {
      console.log('✅ Importación verificada correctamente');
    } else {
      console.log('⚠️  Diferencia en cantidad de vehículos - Revisar posibles errores');
    }

    // Get sample data
    const sampleVehicle = await this.targetDb.collection('Vehicle').findOne();
    console.log('📋 Muestra de vehículo importado:', sampleVehicle?.['titol-anunci'] || 'Sin título');

    return { expectedCount, actualCount, match: expectedCount === actualCount };
  }

  async importFromJson(filePath: string, clearTarget: boolean = false) {
    try {
      await this.connect();

      // Load vehicles from JSON
      const vehicles = this.loadVehiclesFromJson(filePath);
      
      if (vehicles.length === 0) {
        console.log('⚠️  No hay vehículos para importar en el archivo JSON');
        return;
      }

      // Optionally clear target database
      if (clearTarget) {
        await this.clearTargetVehicles();
      }

      // Insert vehicles
      const result = await this.insertVehicles(vehicles);

      // Verify import
      await this.verifyImport(vehicles.length);

      console.log('🎉 Importación desde JSON completada exitosamente');
      return result;

    } catch (error) {
      console.error('❌ Error durante la importación:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Iniciando importación de vehículos desde JSON a producción...');
  console.log('=' .repeat(60));

  const args = process.argv.slice(2);
  const jsonFile = args.find(arg => arg.endsWith('.json')) || join(process.cwd(), 'vehicles.json');
  const clearTarget = args.includes('--clear');
  
  console.log(`📄 Archivo JSON: ${jsonFile}`);
  
  if (clearTarget) {
    console.log('⚠️  MODO DESTRUCTIVO: Se eliminarán todos los vehículos existentes en producción');
  } else {
    console.log('ℹ️  MODO SEGURO: Se añadirán vehículos sin eliminar los existentes');
  }

  const importer = new JsonVehicleImporter();
  
  try {
    await importer.importFromJson(jsonFile, clearTarget);
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export { JsonVehicleImporter };