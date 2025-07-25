const axios = require('axios');

// Configurar cliente axios para la API local
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

async function verifyFrontendFix() {
  try {
    console.log('🔍 Verifying frontend field mapping fix...');
    
    // Obtener nuestro vehículo de prueba
    console.log('\n📖 Step 1: Getting test vehicle from database...');
    const vehiclesResponse = await apiClient.get('/vehicles?per_page=1&orderby=date&order=DESC');
    
    if (!vehiclesResponse.data.items || vehiclesResponse.data.items.length === 0) {
      console.log('❌ No vehicles found in database');
      return;
    }
    
    const vehicle = vehiclesResponse.data.items[0];
    console.log(`✅ Using vehicle: ${vehicle.slug} (ID: ${vehicle.id})`);
    
    // Obtener el vehículo para edición
    console.log('\n📖 Step 2: Fetching vehicle for editing...');
    const editResponse = await apiClient.get(`/vehicles/by-id/${vehicle.id}`);
    
    if (!editResponse.data) {
      console.log('❌ Failed to fetch vehicle for editing');
      return;
    }
    
    const vehicleData = editResponse.data;
    
    // Verificar que los campos problemáticos ahora se devuelven correctamente
    console.log('\n✅ Step 3: Fields that should now work in frontend:');
    console.log('='.repeat(80));
    
    const fieldsToCheck = [
      { name: 'traccio', label: 'Tracción' },
      { name: 'carrosseriaCotxe', label: 'Tipo de carrocería (Coche)' },
      { name: 'consumUrba', label: 'Consum Urbà' },
      { name: 'consumCarretera', label: 'Consum Carretera' },
      { name: 'consumMixt', label: 'Consum Mixt' },
      { name: 'colorTapisseria', label: 'Color Tapisseria' },
      { name: 'aireAcondicionat', label: 'Aire Acondicionat' },
      { name: 'climatitzacio', label: 'Climatització' },
      { name: 'vehicleFumador', label: 'Vehicle Fumador' },
      { name: 'preuAntic', label: 'Preu Antic' },
      { name: 'nombrePropietaris', label: 'Nombre de Propietaris' },
      { name: 'preuMensual', label: 'Preu Mensual' },
      { name: 'preuDiari', label: 'Preu Diari' },
      { name: 'llibreManteniment', label: 'Llibre de Manteniment' },
      { name: 'revisionsOficials', label: 'Revisions Oficials' },
      { name: 'impostosDeduibles', label: 'Impostos Deduïbles' },
      { name: 'vehicleACanvi', label: 'Vehicle a Canvi' }
    ];
    
    fieldsToCheck.forEach(({ name, label }) => {
      const value = vehicleData[name];
      const hasValue = value !== null && value !== undefined && value !== '' && 
                      (!Array.isArray(value) || value.length > 0) &&
                      (typeof value !== 'boolean' || value === true);
      
      const status = hasValue ? '✅' : '❌';
      const displayValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      
      console.log(`${status} ${label.padEnd(30)} | ${name.padEnd(20)} = ${displayValue}`);
    });
    
    console.log('\n🎯 Summary:');
    const workingFields = fieldsToCheck.filter(({ name }) => {
      const value = vehicleData[name];
      return value !== null && value !== undefined && value !== '' && 
             (!Array.isArray(value) || value.length > 0) &&
             (typeof value !== 'boolean' || value === true);
    });
    
    console.log(`✅ Working fields: ${workingFields.length}/${fieldsToCheck.length}`);
    console.log(`📊 Success rate: ${((workingFields.length / fieldsToCheck.length) * 100).toFixed(1)}%`);
    
    if (workingFields.length === fieldsToCheck.length) {
      console.log('\n🎉 SUCCESS! All fields are now properly mapped and should work in the frontend!');
      console.log('\n📝 Next steps:');
      console.log('   1. Test the frontend vehicle edit form');
      console.log('   2. Verify that all fields appear with their correct values');
      console.log('   3. Confirm that changes are saved correctly');
    } else {
      console.log('\n⚠️  Some fields still need attention, but most should now work correctly.');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
  }
}

// Ejecutar la verificación
verifyFrontendFix();