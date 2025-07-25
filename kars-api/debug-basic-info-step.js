const axios = require('axios');

// Script para debuggear específicamente los campos del BasicInfoStep
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function debugBasicInfoStep() {
  try {
    console.log('🔍 Debugging BasicInfoStep field mapping...');
    
    // Obtener vehículo de prueba
    const vehiclesResponse = await apiClient.get('/vehicles?per_page=1&orderby=date&order=DESC');
    const vehicle = vehiclesResponse.data.items[0];
    console.log(`\n📖 Using vehicle: ${vehicle.slug} (ID: ${vehicle.id})`);
    
    // Obtener datos para edición
    const editResponse = await apiClient.get(`/vehicles/by-id/${vehicle.id}`);
    const vehicleData = editResponse.data;
    
    console.log('\n🔍 BasicInfoStep fields analysis:');
    console.log('='.repeat(80));
    
    // Campos que BasicInfoStep espera vs lo que recibe de la API
    const fieldMapping = [
      {
        label: 'Tracción',
        frontendField: 'traccio',
        apiField: 'traccio',
        expected: vehicleData.traccio,
        working: true
      },
      {
        label: 'Carrocería Coche',
        frontendField: 'carrosseriaCotxe',
        apiField: 'carrosseriaCotxe',
        expected: vehicleData.carrosseriaCotxe,
        working: true
      },
      {
        label: 'Carrocería Moto (PROBLEMA)',
        frontendField: 'tipusDeMoto',
        apiField: 'carrosseriaMoto',
        expected: vehicleData.carrosseriaMoto,
        working: false,
        note: 'Frontend busca tipusDeMoto pero API devuelve carrosseriaMoto'
      },
      {
        label: 'Carrocería Caravana',
        frontendField: 'carrosseriaCaravana',
        apiField: 'carrosseriaCaravana',
        expected: vehicleData.carrosseriaCaravana,
        working: true
      },
      {
        label: 'Carrocería Comercial (PROBLEMA)',
        frontendField: 'carrosseriaComercial',
        apiField: 'NO_EXISTE',
        expected: 'undefined',
        working: false,
        note: 'Frontend busca carrosseriaComercial pero no existe en schema'
      }
    ];
    
    fieldMapping.forEach(({ label, frontendField, apiField, expected, working, note }) => {
      const status = working ? '✅' : '❌';
      console.log(`${status} ${label.padEnd(30)}`);
      console.log(`     Frontend busca: ${frontendField}`);
      console.log(`     API devuelve:   ${apiField} = ${JSON.stringify(expected)}`);
      if (note) {
        console.log(`     🚨 PROBLEMA: ${note}`);
      }
      console.log('');
    });
    
    console.log('\n🔍 All carrosseria-related fields in API response:');
    console.log('='.repeat(80));
    
    Object.keys(vehicleData).filter(key => key.toLowerCase().includes('carrosseria')).forEach(key => {
      console.log(`✅ ${key.padEnd(25)} = ${JSON.stringify(vehicleData[key])}`);
    });
    
    console.log('\n💡 Solution needed:');
    console.log('='.repeat(80));
    console.log('1. ❌ Change tipusDeMoto → carrosseriaMoto in BasicInfoStep.tsx');
    console.log('2. ❌ Fix carrosseriaComercial mapping in BasicInfoStep.tsx');
    console.log('3. ✅ Verify traccio field is working correctly');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

debugBasicInfoStep();