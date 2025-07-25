const axios = require('axios');

async function checkExternalData() {
  try {
    console.log('🔍 Verificando estructura de datos de API externa...\n');
    
    const response = await axios.get('https://motoraldia.net/wp-json/api-motor/v1/vehicles', {
      params: {
        user_id: '113',
        venut: 'false',
        per_page: 1
      },
      headers: {
        'Authorization': 'Basic ' + Buffer.from('Paulo:U^q^i2l49rZrX72#Ln!Xe5k0').toString('base64')
      }
    });
    
    if (response.data.items && response.data.items.length > 0) {
      const vehicle = response.data.items[0];
      
      console.log('📋 Campos importantes del vehículo:');
      console.log('='.repeat(50));
      
      // Mostrar campos específicos
      const importantFields = [
        'id', 'slug', 'titol-anunci', 
        'marca-cotxe', 'models-cotxe', 'tipus-vehicle',
        'marcaCotxe', 'modelsCotxe', 'tipusVehicle',
        'any', 'versio', 'preu',
        'imatge-destacada-url', 'galeria-vehicle-urls'
      ];
      
      console.log('\n🔍 Valores de campos específicos:');
      importantFields.forEach(field => {
        if (vehicle[field] !== undefined) {
          console.log(`   ${field}: ${JSON.stringify(vehicle[field])}`);
        }
      });
      
      console.log('\n📊 TODOS los campos disponibles:');
      Object.entries(vehicle).forEach(([key, value]) => {
        const preview = typeof value === 'string' && value.length > 50 
          ? value.substring(0, 50) + '...' 
          : JSON.stringify(value);
        console.log(`   ${key}: ${preview}`);
      });
      
      // Buscar campos que parezcan marca/modelo
      console.log('\n🔎 Campos que contienen marca/modelo:');
      Object.entries(vehicle).forEach(([key, value]) => {
        if (typeof value === 'string' && value.length > 0) {
          const lowerKey = key.toLowerCase();
          const lowerValue = value.toLowerCase();
          if (lowerKey.includes('marc') || lowerKey.includes('model') || 
              lowerValue.includes('chevrolet') || lowerValue.includes('corvette')) {
            console.log(`   ${key}: ${value}`);
          }
        }
      });
      
    } else {
      console.log('❌ No se encontraron vehículos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkExternalData();