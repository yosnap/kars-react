import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Vehicle {
  _id?: any;
  id?: string;
  preu?: any;
  garantia?: any;
  [key: string]: any;
}

class ProductionDataFixer {
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

  async analyzeDataTypes() {
    console.log('🔍 Analizando tipos de datos problemáticos...');
    
    try {
      const vehicles = await this.targetDb.collection('Vehicle').find({}).toArray();
      console.log(`📊 Encontrados ${vehicles.length} vehículos para analizar`);

      const preuTypes = new Set();
      const garantiaTypes = new Set();
      let preuIssues = 0;
      let garantiaIssues = 0;

      vehicles.forEach((vehicle: Vehicle) => {
        // Analyze preu field
        if (vehicle.preu !== undefined) {
          const preuType = typeof vehicle.preu;
          preuTypes.add(`${preuType}: ${vehicle.preu}`);
          
          if (typeof vehicle.preu === 'string') {
            preuIssues++;
          }
        }

        // Analyze garantia field
        if (vehicle.garantia !== undefined) {
          const garantiaType = typeof vehicle.garantia;
          garantiaTypes.add(`${garantiaType}: ${vehicle.garantia}`);
          
          if (typeof vehicle.garantia === 'boolean') {
            garantiaIssues++;
          }
        }
      });

      console.log('\n📋 Análisis de tipos de datos:');
      console.log(`❌ Vehículos con preu como string: ${preuIssues}`);
      console.log(`❌ Vehículos con garantia como boolean: ${garantiaIssues}`);

      console.log('\n🔍 Tipos únicos encontrados en preu:');
      Array.from(preuTypes).slice(0, 10).forEach(type => console.log(`  - ${type}`));

      console.log('\n🔍 Tipos únicos encontrados en garantia:');
      Array.from(garantiaTypes).forEach(type => console.log(`  - ${type}`));

      return { preuIssues, garantiaIssues, totalVehicles: vehicles.length };

    } catch (error) {
      console.error('❌ Error analizando datos:', error);
      throw error;
    }
  }

  async fixDataTypes() {
    console.log('🔧 Iniciando corrección de tipos de datos...');
    
    try {
      const vehicles = await this.targetDb.collection('Vehicle').find({}).toArray();
      console.log(`📊 Procesando ${vehicles.length} vehículos...`);

      let preuFixed = 0;
      let garantiaFixed = 0;
      let errors = 0;

      for (const vehicle of vehicles) {
        try {
          const updates: any = {};
          let needsUpdate = false;

          // Fix preu field - convert string to float
          if (vehicle.preu !== undefined && typeof vehicle.preu === 'string') {
            const numericValue = parseFloat(vehicle.preu);
            if (!isNaN(numericValue)) {
              updates.preu = numericValue;
              needsUpdate = true;
              preuFixed++;
            } else {
              // If can't convert, set to 0
              updates.preu = 0;
              needsUpdate = true;
              preuFixed++;
            }
          }

          // Fix garantia field - convert boolean to string
          if (vehicle.garantia !== undefined && typeof vehicle.garantia === 'boolean') {
            updates.garantia = vehicle.garantia ? 'true' : 'false';
            needsUpdate = true;
            garantiaFixed++;
          }

          // Update document if needed
          if (needsUpdate) {
            await this.targetDb.collection('Vehicle').updateOne(
              { _id: vehicle._id },
              { $set: updates }
            );
          }

          if ((preuFixed + garantiaFixed) % 20 === 0) {
            console.log(`🔧 Procesados: ${preuFixed} precios, ${garantiaFixed} garantías...`);
          }

        } catch (error) {
          console.error(`❌ Error procesando vehículo ${vehicle._id}:`, error);
          errors++;
        }
      }

      console.log('\n✅ Corrección completada:');
      console.log(`🔧 Precios corregidos: ${preuFixed}`);
      console.log(`🔧 Garantías corregidas: ${garantiaFixed}`);
      console.log(`❌ Errores: ${errors}`);

      return { preuFixed, garantiaFixed, errors };

    } catch (error) {
      console.error('❌ Error corrigiendo datos:', error);
      throw error;
    }
  }

  async verifyFixes() {
    console.log('🔍 Verificando correcciones...');
    
    try {
      const vehicles = await this.targetDb.collection('Vehicle').find({}).toArray();
      
      let preuStringCount = 0;
      let garantiaBooleanCount = 0;

      vehicles.forEach((vehicle: Vehicle) => {
        if (vehicle.preu !== undefined && typeof vehicle.preu === 'string') {
          preuStringCount++;
        }
        if (vehicle.garantia !== undefined && typeof vehicle.garantia === 'boolean') {
          garantiaBooleanCount++;
        }
      });

      console.log('\n📋 Verificación post-corrección:');
      console.log(`❌ Precios aún como string: ${preuStringCount}`);
      console.log(`❌ Garantías aún como boolean: ${garantiaBooleanCount}`);

      if (preuStringCount === 0 && garantiaBooleanCount === 0) {
        console.log('✅ Todos los tipos de datos han sido corregidos correctamente');
        return true;
      } else {
        console.log('⚠️  Aún quedan tipos de datos por corregir');
        return false;
      }

    } catch (error) {
      console.error('❌ Error verificando correcciones:', error);
      throw error;
    }
  }

  async fixProduction() {
    try {
      await this.connect();

      console.log('🚀 Iniciando proceso de corrección de datos de producción...');
      console.log('=' .repeat(60));

      // Step 1: Analyze current data types
      const analysis = await this.analyzeDataTypes();
      
      if (analysis.preuIssues === 0 && analysis.garantiaIssues === 0) {
        console.log('✅ No se encontraron problemas de tipos de datos');
        return;
      }

      // Step 2: Fix data types
      const fixes = await this.fixDataTypes();

      // Step 3: Verify fixes
      const verified = await this.verifyFixes();

      if (verified) {
        console.log('\n🎉 Corrección de datos completada exitosamente');
        console.log('✅ La base de datos está lista para usar con Prisma');
      } else {
        console.log('\n⚠️  La corrección no fue completamente exitosa');
        console.log('💡 Revisar manualmente los datos restantes');
      }

      return { analysis, fixes, verified };

    } catch (error) {
      console.error('❌ Error durante la corrección:', error);
      throw error;
    } finally {
      await this.disconnect();
    }
  }
}

// Main execution
async function main() {
  console.log('🔧 Iniciando corrección de tipos de datos en producción...');
  console.log('=' .repeat(60));

  const fixer = new ProductionDataFixer();
  
  try {
    await fixer.fixProduction();
    
  } catch (error) {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  }
}

// Execute if called directly
if (require.main === module) {
  main();
}

export { ProductionDataFixer };