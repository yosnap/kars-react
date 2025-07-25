const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function testBasicInfoFix() {
  try {
    console.log('🧪 Testing BasicInfoStep fix...');
    
    // Obtener vehículo de prueba
    const vehiclesResponse = await apiClient.get('/vehicles?per_page=1&orderby=date&order=DESC');
    const vehicle = vehiclesResponse.data.items[0];
    console.log(`\n📖 Testing with vehicle: ${vehicle.slug}`);
    
    // Obtener datos para edición
    const editResponse = await apiClient.get(`/vehicles/by-id/${vehicle.id}`);
    const vehicleData = editResponse.data;
    
    console.log('\n✅ BasicInfoStep should now show these values:');
    console.log('='.repeat(60));
    
    // Simular lo que el frontend debería mostrar ahora
    const frontendValues = {
      'Tracción': vehicleData.traccio,
      'Carrocería (Coche)': vehicleData.tipusVehicle === 'cotxe' ? vehicleData.carrosseriaCotxe : 'N/A',
      'Carrocería (Moto)': vehicleData.tipusVehicle === 'moto' ? vehicleData.carrosseriaMoto : 'N/A',
      'Carrocería (Caravana)': vehicleData.tipusVehicle === 'autocaravana' ? vehicleData.carrosseriaCaravana : 'N/A',
      'Carrocería (Comercial)': vehicleData.tipusVehicle === 'vehicle-comercial' ? vehicleData.carrosseriaCotxe : 'N/A'
    };
    
    Object.entries(frontendValues).forEach(([label, value]) => {
      const hasValue = value && value !== 'N/A';
      const status = hasValue ? '✅' : '⚪';
      console.log(`${status} ${label.padEnd(25)} = ${JSON.stringify(value)}`);
    });
    
    console.log('\n🎯 Expected result after fix:');
    console.log('   ✅ Tracción should display the saved value');
    console.log('   ✅ Tipo de carrocería should display the saved value');
    console.log('   ✅ Fields should be editable and save correctly');
    
    console.log('\n📋 Next steps:');
    console.log('   1. Refresh the frontend page');
    console.log('   2. Open vehicle edit form');
    console.log('   3. Go to step 2 (Dades Bàsiques)');
    console.log('   4. Verify Tracción and Tipus de Carrosseria show values');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testBasicInfoFix();