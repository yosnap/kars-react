const axios = require('axios');

// Configurar cliente axios para la API local
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Datos de prueba con TODOS los campos posibles
const testVehicleData = {
  // Campos básicos
  titolAnunci: 'TEST VEHICLE - BMW X5 xDrive40d M Sport',
  descripcioAnunci: 'Vehicle de prueba para testing completo',
  slug: 'test-vehicle-bmw-x5-xdrive40d-m-sport',
  
  // Descripciones multiidioma
  descripcioAnunciCA: 'Descripció en català',
  descripcioAnunciEN: 'Description in English', 
  descripcioAnunciFR: 'Description en français',
  descripcioAnunciES: 'Descripción en español',
  
  // Estado del anuncio
  anunciActiu: true,
  anunciDestacat: 1,
  venut: false,
  diesCaducitat: '30',
  
  // Tipo y marca
  tipusVehicle: 'cotxe',
  marcaCotxe: 'BMW',
  modelsCotxe: 'X5',
  versio: 'xDrive40d M Sport',
  
  // Especificaciones técnicas básicas
  estatVehicle: 'ocasio',
  tipusPropulsor: 'combustio',
  tipusCombustible: 'diesel',
  tipusCanvi: 'automatic',
  carrosseriaCotxe: 'suv',
  
  // Datos del vehículo
  any: '2022',
  quilometratge: '45000',
  cilindrada: '2993',
  traccio: '4x4',
  potenciaCv: '340',
  numeroMotors: '1',
  cvMotorDavant: '340',
  kwMotorDavant: '250',
  potenciaKw: '250',
  emissionsVehicle: 'Euro 6',
  
  // Consumo de combustible
  consumUrba: '8.5',
  consumCarretera: '6.2',
  consumMixt: '7.1',
  emissionsCo2: '165',
  categoriaEcologica: 'Euro 6',
  
  // Características físicas
  colorVehicle: 'Negro Carbón',
  placesCotxe: '5',
  aireAcondicionat: 'si',
  tipusTapisseria: 'cuir',
  portesCotxe: '5',
  climatitzacio: true,
  colorTapisseria: 'Negro',
  numeroMaletersCotxe: '1',
  capacitatMaletersCotxe: '650',
  capacitatTotalL: '1870',
  vehicleFumador: false,
  rodaRecanvi: 'si',
  
  // Rendimiento
  acceleracio060: '5.5',
  acceleracio0100Cotxe: '6.1',
  velocitatMaxima: '243',
  
  // Precios
  preu: 65000,
  preuMensual: '850',
  preuDiari: '150',
  preuAntic: '75000',
  
  // Comerciales
  origen: 'nacional',
  iva: 'incluit',
  finacament: 'disponible',
  
  // Estado y garantías
  garantia: '24 mesos',
  vehicleAccidentat: 'no',
  llibreManteniment: true,
  revisionsOficials: true,
  impostosDeduibles: true,
  vehicleACanvi: false,
  nombrePropietaris: '1',
  
  // Imágenes
  imatgeDestacadaUrl: '/media/2025/07/test-bmw-x5-featured.jpg',
  galeriaVehicleUrls: [
    '/media/2025/07/test-bmw-x5-1.jpg',
    '/media/2025/07/test-bmw-x5-2.jpg',
    '/media/2025/07/test-bmw-x5-3.jpg'
  ],
  
  // Extras
  extresCotxe: [
    'GPS/Navegador',
    'Bluetooth',
    'Sistema de audio premium',
    'Asientos de cuero',
    'Control de crucero adaptativo',
    'Cámara de marcha atrás',
    'Sensores de aparcamiento',
    'Techo panorámico'
  ],
  
  // Video
  videoVehicle: 'https://youtube.com/watch?v=test'
};

async function testAllFields() {
  try {
    console.log('🧪 Testing all vehicle fields...');
    
    // 1. Crear vehículo de prueba
    console.log('\n📝 Step 1: Creating test vehicle...');
    const createResponse = await apiClient.post('/vehicles', testVehicleData);
    
    if (createResponse.data.success) {
      const vehicleId = createResponse.data.data.id;
      console.log(`✅ Vehicle created successfully with ID: ${vehicleId}`);
      
      // 2. Obtener el vehículo para edición
      console.log('\n📖 Step 2: Fetching vehicle for editing...');
      const editResponse = await apiClient.get(`/vehicles/by-id/${vehicleId}`);
      
      if (editResponse.data) {
        console.log('✅ Vehicle fetched successfully for editing');
        
        // 3. Comparar campos enviados vs campos recibidos
        console.log('\n🔍 Step 3: Comparing sent vs received fields...');
        
        const sentFields = Object.keys(testVehicleData);
        const receivedFields = Object.keys(editResponse.data);
        
        console.log(`📊 Sent fields: ${sentFields.length}`);
        console.log(`📊 Received fields: ${receivedFields.length}`);
        
        // Campos que se enviaron pero no se recibieron
        const missingFields = sentFields.filter(field => {
          const received = editResponse.data[field];
          const sent = testVehicleData[field];
          
          // Verificar si el campo está presente y no es null/undefined
          return received === null || received === undefined || 
                 (Array.isArray(sent) && (!Array.isArray(received) || received.length === 0)) ||
                 (typeof sent === 'boolean' && received !== sent && received !== sent.toString()) ||
                 (typeof sent === 'string' && received !== sent) ||
                 (typeof sent === 'number' && parseFloat(received) !== sent);
        });
        
        console.log('\n❌ Missing or incorrect fields:');
        missingFields.forEach(field => {
          console.log(`   ${field}: sent="${testVehicleData[field]}" received="${editResponse.data[field]}"`);
        });
        
        // Campos que se recibieron correctamente
        const correctFields = sentFields.filter(field => !missingFields.includes(field));
        console.log(`\n✅ Correctly saved and loaded fields (${correctFields.length}/${sentFields.length}):`);
        correctFields.forEach(field => {
          console.log(`   ${field}: ✓`);
        });
        
        // 4. Intentar actualizar el vehículo
        console.log('\n🔄 Step 4: Testing update...');
        const updateData = {
          ...testVehicleData,
          titolAnunci: 'UPDATED TEST VEHICLE - BMW X5 xDrive40d M Sport'
        };
        
        const updateResponse = await apiClient.put(`/vehicles/${vehicleId}`, updateData);
        
        if (updateResponse.data.success) {
          console.log('✅ Vehicle updated successfully');
        } else {
          console.log('❌ Vehicle update failed:', updateResponse.data);
        }
        
        // 5. Cleanup - eliminar vehículo de prueba
        console.log('\n🗑️ Step 5: Cleaning up test vehicle...');
        try {
          await apiClient.delete(`/vehicles/${vehicleId}`);
          console.log('✅ Test vehicle deleted successfully');
        } catch (deleteError) {
          console.log('⚠️ Could not delete test vehicle (this is expected if no DELETE endpoint exists)');
        }
        
      } else {
        console.log('❌ Failed to fetch vehicle for editing');
      }
      
    } else {
      console.log('❌ Failed to create vehicle:', createResponse.data);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testAllFields();