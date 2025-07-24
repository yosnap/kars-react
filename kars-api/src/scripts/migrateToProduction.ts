import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Vehicle {
  _id?: any;
  id?: string;
  [key: string]: any;
}

class VehicleMigrator {
  private sourceClient: MongoClient;
  private targetClient: MongoClient;
  private sourceDb: any;
  private targetDb: any;

  constructor() {
    // Source database (local development)
    const sourceUrl = process.env.DATABASE_URL || 'mongodb://localhost:27017/karsad';
    this.sourceClient = new MongoClient(sourceUrl);

    // Target database (production) - encode special characters
    const targetUrl = process.env.PRODUCTION_DATABASE_URL || 'mongodb://kars:c%40D%2APZmWQZ49gMYD@motoraldia_kars-db:27017/karsad?tls=false';
    this.targetClient = new MongoClient(targetUrl);
  }

  async connect() {
    console.log('🔌 Conectando a base de datos de origen...');
    await this.sourceClient.connect();
    this.sourceDb = this.sourceClient.db();

    console.log('🔌 Conectando a base de datos de producción...');
    await this.targetClient.connect();
    this.targetDb = this.targetClient.db();

    console.log('✅ Conexiones establecidas correctamente');
  }

  async disconnect() {
    console.log('🔌 Cerrando conexiones...');
    await this.sourceClient.close();
    await this.targetClient.close();
    console.log('✅ Conexiones cerradas');
  }

  async getSourceVehicles(): Promise<Vehicle[]> {
    console.log('📊 Obteniendo vehículos de la base de datos origen...');
    const vehicles = await this.sourceDb.collection('Vehicle').find({}).toArray();
    console.log(`📊 Encontrados ${vehicles.length} vehículos en origen`);
    return vehicles;
  }

  async getTargetVehicles(): Promise<Vehicle[]> {
    console.log('📊 Obteniendo vehículos de la base de datos destino...');
    const vehicles = await this.targetDb.collection('Vehicle').find({}).toArray();
    console.log(`📊 Encontrados ${vehicles.length} vehículos en destino`);
    return vehicles;
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

    console.log(`✅ Migración completada: ${insertedCount} vehículos insertados, ${errors} errores`);
    return { inserted: insertedCount, errors };
  }

  async verifyMigration() {
    console.log('🔍 Verificando integridad de la migración...');
    
    const sourceCount = await this.sourceDb.collection('Vehicle').countDocuments();
    const targetCount = await this.targetDb.collection('Vehicle').countDocuments();
    
    console.log(`📊 Vehículos en origen: ${sourceCount}`);
    console.log(`📊 Vehículos en destino: ${targetCount}`);
    
    if (sourceCount === targetCount) {
      console.log('✅ Migración verificada correctamente - Misma cantidad de vehículos');
    } else {
      console.log('⚠️  Diferencia en cantidad de vehículos - Revisar posibles errores');
    }

    // Get sample data for comparison
    const sourceVehicle = await this.sourceDb.collection('Vehicle').findOne();
    const targetVehicle = await this.targetDb.collection('Vehicle').findOne();
    
    console.log('📋 Muestra de vehículo origen:', sourceVehicle?.['titol-anunci'] || 'Sin título');
    console.log('📋 Muestra de vehículo destino:', targetVehicle?.['titol-anunci'] || 'Sin título');

    return { sourceCount, targetCount, match: sourceCount === targetCount };
  }

  async migrate(clearTarget: boolean = false) {
    try {
      await this.connect();

      // Get source vehicles
      const sourceVehicles = await this.getSourceVehicles();
      
      if (sourceVehicles.length === 0) {
        console.log('⚠️  No hay vehículos para migrar en la base de datos origen');
        return;
      }

      // Optionally clear target database
      if (clearTarget) {
        await this.clearTargetVehicles();
      }

      // Insert vehicles
      const result = await this.insertVehicles(sourceVehicles);

      // Verify migration
      await this.verifyMigration();

      console.log('🎉 Migración completada exitosamente');
      return result;

    } catch (error) {
      console.error('❌ Error durante la migración:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  console.log('🚀 Iniciando migración de vehículos a producción...');
  console.log('=' .repeat(60));

  const migrator = new VehicleMigrator();
  
  try {
    // Ask user if they want to clear target database
    const args = process.argv.slice(2);
    const clearTarget = args.includes('--clear');
    
    if (clearTarget) {
      console.log('⚠️  MODO DESTRUCTIVO: Se eliminarán todos los vehículos existentes en producción');
    } else {
      console.log('ℹ️  MODO SEGURO: Se añadirán vehículos sin eliminar los existentes');
    }

    await migrator.migrate(clearTarget);
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export { VehicleMigrator };