const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function checkEmissionTypes() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('EmissionType');
    
    console.log('🔍 Tipos de emisiones en la base de datos:');
    const emissionTypes = await collection.find({}).toArray();
    
    if (emissionTypes.length === 0) {
      console.log('❌ No se encontraron tipos de emisiones');
      return;
    }
    
    console.log(`📊 Total: ${emissionTypes.length} tipos de emisiones\n`);
    
    emissionTypes.forEach(emission => {
      console.log(`• Value: "${emission.value}"`);
      console.log(`  Label (CA): "${emission.catalan}"`);
      console.log(`  Label (ES): "${emission.spanish}"`);
      console.log(`  Label (EN): "${emission.english}"`);
      console.log('  ---');
    });
    
    // También verificar qué valor tiene el vehículo BMW M3
    console.log('\n🚗 Valor en vehículo BMW M3:');
    const vehicleCollection = db.collection('Vehicle');
    const bmwM3 = await vehicleCollection.findOne({
      slug: "bmw-m3-competition-coche-test-completo"
    });
    
    if (bmwM3) {
      console.log(`• emissions-vehicle: "${bmwM3['emissions-vehicle']}"`);
      console.log(`• emissionsVehicle: "${bmwM3.emissionsVehicle || 'undefined'}"`);
      
      // Verificar si existe coincidencia
      const matchingType = emissionTypes.find(et => 
        et.value === bmwM3['emissions-vehicle'] || 
        et.catalan === bmwM3['emissions-vehicle'] ||
        et.spanish === bmwM3['emissions-vehicle'] ||
        et.english === bmwM3['emissions-vehicle']
      );
      
      if (matchingType) {
        console.log('✅ Coincidencia encontrada:', matchingType.value);
      } else {
        console.log('❌ No se encontró coincidencia directa');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n📁 Conexión cerrada');
  }
}

// Ejecutar
checkEmissionTypes();