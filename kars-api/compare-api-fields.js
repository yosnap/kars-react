const axios = require('axios');

async function compareApiFields() {
  try {
    console.log('🔍 Comparando campos entre API externa y API interna...\n');
    
    // API Externa - Buscar en diferentes URLs posibles
    console.log('📡 Obteniendo datos de API externa...');
    let externalVehicle = null;
    let externalFields = [];
    
    const urls = [
      'https://motoraldia.com/wp-json/api-motor/v1/vehicles?user_id=113&per_page=1',
      'http://motoraldia.com/wp-json/api-motor/v1/vehicles?user_id=113&per_page=1',
      'https://www.motoraldia.com/wp-json/api-motor/v1/vehicles?user_id=113&per_page=1'
    ];
    
    for (const url of urls) {
      try {
        console.log(`   Probando: ${url}`);
        const response = await axios.get(url, { timeout: 5000 });
        if (response.data && response.data.length > 0) {
          externalVehicle = response.data[0];
          externalFields = Object.keys(externalVehicle).sort();
          console.log(`   ✅ Conexión exitosa con ${response.data.length} vehículos encontrados`);
          break;
        }
      } catch (error) {
        console.log(`   ❌ Error con ${url}: ${error.message}`);
      }
    }
    
    if (!externalVehicle) {
      console.log('⚠️  No se pudo conectar a la API externa. Usando datos simulados...');
      // Datos simulados basados en la documentación
      externalVehicle = {
        "slug": "sample-vehicle",
        "titol-anunci": "Sample Vehicle",
        "preu": "25000",
        "quilometratge": "50000",
        "marca-cotxe": "bmw",
        "models-cotxe": "serie-3",
        "versio": "320d",
        "any": "2020",
        "tipus-combustible": "diesel",
        "tipus-canvi": "automatic",
        "tipus-propulsor": "thermal",
        "potencia-cv": "190",
        "cilindrada": "2000",
        "color-vehicle": "negre",
        "portes-cotxe": "4",
        "places-cotxe": "5",
        "estat-vehicle": "seminou",
        "traccio": "darrere",
        "carrosseria-cotxe": "sedan",
        "consum-urba": "6.5",
        "consum-carretera": "4.8",
        "consum-mixt": "5.5",
        "emissions-co2": "145",
        "color-tapisseria": "negre",
        "anunci-actiu": true,
        "venut": false,
        "anunci-destacat": 0
      };
      externalFields = Object.keys(externalVehicle).sort();
      console.log('   📝 Usando estructura simulada con campos típicos de WordPress API');
    }
    
    // API Interna
    console.log('🏠 Obteniendo datos de API interna...');
    const internalResponse = await axios.get('http://localhost:3001/api/vehicles?per_page=1');
    const internalVehicle = internalResponse.data.items[0];
    const internalFields = Object.keys(internalVehicle || {}).sort();
    
    console.log(`\n📊 RESULTADOS DE COMPARACIÓN:`);
    console.log(`=${'='.repeat(60)}`);
    console.log(`📡 API Externa: ${externalFields.length} campos`);
    console.log(`🏠 API Interna: ${internalFields.length} campos`);
    console.log(`📈 Diferencia: ${Math.abs(externalFields.length - internalFields.length)} campos\n`);
    
    // Campos que están en API externa pero NO en API interna
    const missingInInternal = externalFields.filter(field => !internalFields.includes(field));
    if (missingInInternal.length > 0) {
      console.log(`❌ CAMPOS FALTANTES EN API INTERNA (${missingInInternal.length}):`);
      missingInInternal.forEach(field => {
        const value = externalVehicle[field];
        const type = typeof value;
        const sample = type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value;
        console.log(`   • ${field.padEnd(30)} (${type}) = ${JSON.stringify(sample)}`);
      });
      console.log('');
    }
    
    // Campos que están en API interna pero NO en API externa
    const extraInInternal = internalFields.filter(field => !externalFields.includes(field));
    if (extraInInternal.length > 0) {
      console.log(`➕ CAMPOS ADICIONALES EN API INTERNA (${extraInInternal.length}):`);
      extraInInternal.forEach(field => {
        const value = internalVehicle[field];
        const type = typeof value;
        const sample = type === 'string' && value.length > 50 ? value.substring(0, 50) + '...' : value;
        console.log(`   • ${field.padEnd(30)} (${type}) = ${JSON.stringify(sample)}`);
      });
      console.log('');
    }
    
    // Campos que coinciden
    const commonFields = externalFields.filter(field => internalFields.includes(field));
    console.log(`✅ CAMPOS COMUNES (${commonFields.length}):`);
    commonFields.forEach(field => {
      const extValue = externalVehicle[field];
      const intValue = internalVehicle[field];
      const match = JSON.stringify(extValue) === JSON.stringify(intValue) ? '✓' : '✗';
      console.log(`   ${match} ${field.padEnd(30)} Externa: ${typeof extValue} | Interna: ${typeof intValue}`);
    });
    
    console.log(`\n🎯 ANÁLISIS:`);
    console.log(`   • Campos faltantes en API interna: ${missingInInternal.length}`);
    console.log(`   • Campos adicionales en API interna: ${extraInInternal.length}`);
    console.log(`   • Campos que coinciden: ${commonFields.length}`);
    console.log(`   • Porcentaje de cobertura: ${Math.round((commonFields.length / externalFields.length) * 100)}%`);
    
    if (missingInInternal.length > 0) {
      console.log(`\n📋 ACCIÓN REQUERIDA:`);
      console.log(`   Se deben agregar ${missingInInternal.length} campos a la API interna para completar la paridad.`);
    } else {
      console.log(`\n🎉 ¡API INTERNA COMPLETA!`);
      console.log(`   Todos los campos de la API externa están presentes en la API interna.`);
    }
    
  } catch (error) {
    console.error('❌ Error al comparar APIs:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

compareApiFields();