const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function checkVehicleFields() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Buscar el vehículo BMW M3 que creamos
    const bmwM3 = await collection.findOne({
      slug: "bmw-m3-competition-coche-test-completo"
    });
    
    if (!bmwM3) {
      console.log('❌ No se encontró el vehículo BMW M3');
      return;
    }
    
    console.log('🚗 Vehículo encontrado: BMW M3 Competition');
    console.log('📋 ID:', bmwM3._id);
    
    // Verificar los campos problemáticos
    console.log('\n🔍 Verificando campos problemáticos:');
    
    const fieldsToCheck = [
      'tipus-propulsor',      // tipusPropulsor  
      'estat-vehicle',        // estatVehicle
      'traccio',             // traccio
      'carrosseria-cotxe'    // carrosseriaCotxe
    ];
    
    fieldsToCheck.forEach(field => {
      const value = bmwM3[field];
      console.log(`   • ${field}: ${value !== undefined ? `"${value}"` : 'undefined'} (${typeof value})`);
    });
    
    // También verificar las variantes camelCase
    console.log('\n🔍 Verificando variantes camelCase:');
    
    const camelCaseFields = [
      'tipusPropulsor',
      'estatVehicle', 
      'traccio',
      'carrosseriaCotxe'
    ];
    
    camelCaseFields.forEach(field => {
      const value = bmwM3[field];
      console.log(`   • ${field}: ${value !== undefined ? `"${value}"` : 'undefined'} (${typeof value})`);
    });
    
    // Mostrar todos los campos disponibles para identificar el patrón
    console.log('\n📄 Todos los campos disponibles en el vehículo:');
    const allKeys = Object.keys(bmwM3).sort();
    allKeys.forEach(key => {
      if (!key.startsWith('_') && !key.includes('extras') && !key.includes('galeria')) {
        const value = bmwM3[key];
        const displayValue = typeof value === 'string' ? `"${value}"` : value;
        console.log(`   • ${key}: ${displayValue}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n📁 Conexión cerrada');
  }
}

// Ejecutar
checkVehicleFields();