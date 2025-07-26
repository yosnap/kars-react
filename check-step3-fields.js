const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function checkStep3Fields() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Buscar el vehículo BMW M3
    const bmwM3 = await collection.findOne({
      slug: "bmw-m3-competition-coche-test-completo"
    });
    
    if (!bmwM3) {
      console.log('❌ No se encontró el vehículo BMW M3');
      return;
    }
    
    console.log('🚗 Vehículo encontrado: BMW M3 Competition');
    console.log('📋 ID:', bmwM3._id);
    
    // Campos del paso 3 que no se muestran
    const step3Fields = [
      'emissions-vehicle',          // Emisiones
      'potencia-kw',               // Potència (KW)
      'consum-urba',               // Consum Urbà
      'consum-carretera',          // Consum Carretera  
      'tipus-tapisseria',          // Tipus Tapisseria
      'color-tapisseria',          // Color Tapisseria
      'numero-maleters-cotxe',     // Nombre de Maleters
      'roda-recanvi',              // Roda de Recanvi
      'capacitat-total-l',         // Capacitat Total (L)
      'velocitat-maxima',          // Velocitat Màxima
      'acceleracio-0-100-cotxe'    // Acceleració 0-100
    ];
    
    console.log('\n🔍 Verificando campos del paso 3:');
    
    step3Fields.forEach(field => {
      const value = bmwM3[field];
      console.log(`   • ${field}: ${value !== undefined ? `"${value}"` : 'undefined'} (${typeof value})`);
    });
    
    // También verificar variantes que podrían existir
    console.log('\n🔍 Verificando variantes alternativas:');
    
    const alternativeFields = [
      'emissionsVehicle',
      'potenciaKw', 
      'consumUrba',
      'consumCarretera',
      'tipusTapisseria',
      'colorTapisseria',
      'numeroMaletersCotxe',
      'rodaRecanvi',
      'capacitatTotalL',
      'velocitatMaxima',
      'acceleracio0100Cotxe'
    ];
    
    alternativeFields.forEach(field => {
      const value = bmwM3[field];
      console.log(`   • ${field}: ${value !== undefined ? `"${value}"` : 'undefined'} (${typeof value})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n📁 Conexión cerrada');
  }
}

// Ejecutar
checkStep3Fields();