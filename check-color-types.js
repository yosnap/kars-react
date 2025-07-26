const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function checkColorTypes() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    
    // Verificar EmissionType
    console.log('\n🔍 EmissionType estructura:');
    const emissionTypes = await db.collection('EmissionType').findOne({});
    console.log('Sample EmissionType:', JSON.stringify(emissionTypes, null, 2));
    
    // Verificar ExteriorColor
    console.log('\n🎨 ExteriorColor estructura:');
    const exteriorColors = await db.collection('ExteriorColor').findOne({});
    console.log('Sample ExteriorColor:', JSON.stringify(exteriorColors, null, 2));
    
    // Verificar UpholsteryColor
    console.log('\n🪑 UpholsteryColor estructura:');
    const upholsteryColors = await db.collection('UpholsteryColor').findOne({});
    console.log('Sample UpholsteryColor:', JSON.stringify(upholsteryColors, null, 2));
    
    // Verificar UpholsteryType
    console.log('\n🛋️ UpholsteryType estructura:');
    const upholsteryTypes = await db.collection('UpholsteryType').findOne({});
    console.log('Sample UpholsteryType:', JSON.stringify(upholsteryTypes, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n📁 Conexión cerrada');
  }
}

// Ejecutar
checkColorTypes();