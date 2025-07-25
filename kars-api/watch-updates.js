const axios = require('axios');

// Script para monitorizar las actualizaciones en tiempo real
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

let lastVehicleData = null;

async function watchUpdates() {
  console.log('👀 Watching for vehicle updates...');
  console.log('   Please make your changes in the frontend now...\n');
  
  setInterval(async () => {
    try {
      // Obtener el vehículo más reciente
      const vehiclesResponse = await apiClient.get('/vehicles?per_page=1&orderby=date&order=DESC');
      
      if (!vehiclesResponse.data.items || vehiclesResponse.data.items.length === 0) {
        return;
      }
      
      const vehicle = vehiclesResponse.data.items[0];
      const editResponse = await apiClient.get(`/vehicles/by-id/${vehicle.id}`);
      const currentData = editResponse.data;
      
      if (lastVehicleData && JSON.stringify(currentData) !== JSON.stringify(lastVehicleData)) {
        console.log('🔄 VEHICLE UPDATED! Changes detected:');
        console.log('='.repeat(60));
        
        // Campos que nos interesan
        const fieldsToCheck = [
          'traccio', 'carrosseriaCotxe', 'carrosseriaMoto', 'carrosseriaCaravana',
          'consumUrba', 'consumCarretera', 'consumMixt', 'colorTapisseria',
          'aireAcondicionat', 'climatitzacio', 'vehicleFumador',
          'preuAntic', 'nombrePropietaris', 'preuMensual', 'preuDiari',
          'llibreManteniment', 'revisionsOficials', 'impostosDeduibles', 'vehicleACanvi'
        ];
        
        fieldsToCheck.forEach(field => {
          const oldValue = lastVehicleData[field];
          const newValue = currentData[field];
          
          if (oldValue !== newValue) {
            console.log(`   ${field}: "${oldValue}" → "${newValue}"`);
          }
        });
        
        console.log('\n📊 Current field values:');
        fieldsToCheck.forEach(field => {
          const value = currentData[field];
          const hasValue = value !== null && value !== undefined && value !== '';
          console.log(`   ${hasValue ? '✅' : '❌'} ${field.padEnd(20)} = ${JSON.stringify(value)}`);
        });
        
        console.log('\n' + '='.repeat(60));
      }
      
      lastVehicleData = currentData;
      
    } catch (error) {
      // Silent errors to avoid spam
    }
  }, 2000); // Check every 2 seconds
}

console.log('🚀 Starting vehicle update monitor...');
console.log('   This will watch for changes every 2 seconds');
console.log('   Press Ctrl+C to stop\n');

watchUpdates();