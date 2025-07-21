const axios = require('axios');

async function checkAPIFeatured() {
  try {
    const apiClient = axios.create({
      baseURL: process.env.ORIGINAL_API_URL || 'https://motoraldia.net/wp-json/api-motor/v1',
      auth: {
        username: process.env.ORIGINAL_API_USER || 'Paulo',
        password: process.env.ORIGINAL_API_PASS || 'U^q^i2l49rZrX72#Ln!Xe5k0'
      },
      timeout: 30000
    });

    // Obtener TODOS los vehículos
    const response = await apiClient.get('/vehicles', {
      params: {
        per_page: 1000 // Obtener más vehículos
      }
    });

    const vehicles = response.data.items || response.data || [];
    
    console.log('Total vehículos obtenidos:', vehicles.length);
    
    // Buscar vehículos con anunci-destacat
    const featured = vehicles.filter(v => {
      const value = v['anunci-destacat'];
      return value !== undefined && value !== 0 && value !== '0' && value !== false;
    });
    
    console.log('\nVehículos destacados en API:', featured.length);
    
    if (featured.length > 0) {
      console.log('\nEjemplos de vehículos destacados:');
      featured.slice(0, 5).forEach(v => {
        console.log(`  - ${v.slug}: anunci-destacat = "${v['anunci-destacat']}" (tipo: ${typeof v['anunci-destacat']})`);
      });
    }
    
    // Analizar todos los valores de anunci-destacat
    const values = new Map();
    vehicles.forEach(v => {
      const value = v['anunci-destacat'];
      const key = `${value} (${typeof value})`;
      values.set(key, (values.get(key) || 0) + 1);
    });
    
    console.log('\nDistribución de valores anunci-destacat en la API:');
    Array.from(values.entries()).forEach(([key, count]) => {
      console.log(`  ${key}: ${count} vehículos`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAPIFeatured();