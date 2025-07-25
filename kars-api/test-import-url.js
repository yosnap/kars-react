const axios = require('axios');

// Posibles URLs a probar
const urls = [
  'https://motoraldia.com/wp-json/api-motor/v1/vehicles',
  'https://www.motoraldia.com/wp-json/api-motor/v1/vehicles',
  'http://motoraldia.com/wp-json/api-motor/v1/vehicles',
  'https://api.motoraldia.com/vehicles',
  'https://backend.motoraldia.com/wp-json/api-motor/v1/vehicles',
  'https://motor.motoraldia.com/wp-json/api-motor/v1/vehicles'
];

async function testUrls() {
  console.log('🔍 Probando URLs de API externa...\n');
  
  for (const url of urls) {
    try {
      console.log(`📡 Probando: ${url}`);
      const response = await axios.get(url, {
        params: {
          user_id: '113',
          per_page: 1
        },
        timeout: 5000
      });
      
      console.log(`   ✅ ÉXITO! Status: ${response.status}`);
      console.log(`   📊 Datos recibidos:`, Array.isArray(response.data) ? `${response.data.length} vehículos` : 'Formato desconocido');
      
      if (response.data && response.data.length > 0) {
        console.log(`   🚗 Primer vehículo:`, {
          slug: response.data[0].slug || 'N/A',
          title: response.data[0]['titol-anunci'] || response.data[0].title || 'N/A'
        });
      }
      
      console.log(`\n✨ URL CORRECTA ENCONTRADA: ${url}\n`);
      break;
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
  
  console.log('\n💡 Si ninguna URL funciona, es posible que:');
  console.log('   1. La API requiera autenticación');
  console.log('   2. El dominio sea diferente');
  console.log('   3. La API esté en un servidor local o privado');
  console.log('   4. Necesites un API key o token\n');
}

testUrls();