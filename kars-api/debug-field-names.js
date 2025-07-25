const axios = require('axios');

// Configurar cliente axios para la API local
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Campos que mencionaste que no se cargan
const problemFields = [
  'traccio',
  'carrosseriaCotxe', 
  'carrosseriaMoto',
  'carrosseriaCaravana',
  'consumUrba',
  'consumCarretera', 
  'consumMixt',
  'colorTapisseria',
  'aireAcondicionat',
  'climatitzacio',
  'vehicleFumador',
  'preuAntic',
  'nombrePropietaris',
  'preuMensual',
  'preuDiari',
  'llibreManteniment',
  'revisionsOficials',
  'impostosDeduibles',
  'vehicleACanvi'
];

async function debugFieldNames() {
  try {
    console.log('🔍 Debugging field name mapping...');
    
    // Obtener el vehículo de prueba que creamos antes
    console.log('\n📖 Step 1: Getting test vehicle from database...');
    
    // Primero obtener la lista de vehículos para encontrar nuestro vehículo de prueba
    const vehiclesResponse = await apiClient.get('/vehicles?per_page=5&orderby=date&order=DESC');
    
    if (!vehiclesResponse.data.items || vehiclesResponse.data.items.length === 0) {
      console.log('❌ No vehicles found in database');
      return;
    }
    
    // Tomar el primer vehículo
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
    
    console.log('\n🔍 Step 3: Checking problem fields...');
    console.log('='.repeat(80));
    
    problemFields.forEach(fieldName => {
      const value = vehicleData[fieldName];
      const hasValue = value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
      
      console.log(`${hasValue ? '✅' : '❌'} ${fieldName.padEnd(25)} = ${JSON.stringify(value)}`);
    });
    
    console.log('\n🔍 Step 4: Checking alternative field names (with hyphens)...');
    console.log('='.repeat(80));
    
    // Mapeo de campos con guiones como podría devolver la API
    const alternativeFieldNames = {
      'traccio': 'traccio',
      'carrosseriaCotxe': 'carrosseria-cotxe',
      'carrosseriaMoto': 'carrosseria-moto', 
      'carrosseriaCaravana': 'carrosseria-caravana',
      'consumUrba': 'consum-urba',
      'consumCarretera': 'consum-carretera',
      'consumMixt': 'consum-mixt',
      'colorTapisseria': 'color-tapisseria',
      'aireAcondicionat': 'aire-acondicionat',
      'climatitzacio': 'climatitzacio',
      'vehicleFumador': 'vehicle-fumador',
      'preuAntic': 'preu-antic',
      'nombrePropietaris': 'nombre-propietaris',
      'preuMensual': 'preu-mensual',
      'preuDiari': 'preu-diari',
      'llibreManteniment': 'llibre-manteniment',
      'revisionsOficials': 'revisions-oficials',
      'impostosDeduibles': 'impostos-deduibles',
      'vehicleACanvi': 'vehicle-a-canvi'
    };
    
    problemFields.forEach(fieldName => {
      const camelCaseValue = vehicleData[fieldName];
      const hyphenatedField = alternativeFieldNames[fieldName];
      const hyphenatedValue = vehicleData[hyphenatedField];
      
      const camelHasValue = camelCaseValue !== null && camelCaseValue !== undefined && camelCaseValue !== '' && 
                           (!Array.isArray(camelCaseValue) || camelCaseValue.length > 0);
      const hyphenHasValue = hyphenatedValue !== null && hyphenatedValue !== undefined && hyphenatedValue !== '' && 
                            (!Array.isArray(hyphenatedValue) || hyphenatedValue.length > 0);
      
      console.log(`${fieldName.padEnd(25)} | ${camelHasValue ? '✅' : '❌'} camelCase: ${JSON.stringify(camelCaseValue).substring(0, 30)}${JSON.stringify(camelCaseValue).length > 30 ? '...' : ''} | ${hyphenHasValue ? '✅' : '❌'} hyphenated: ${JSON.stringify(hyphenatedValue).substring(0, 30)}${JSON.stringify(hyphenatedValue).length > 30 ? '...' : ''}`);
    });
    
    console.log('\n🔍 Step 5: Showing all available fields in response...');
    console.log('='.repeat(80));
    
    const allFields = Object.keys(vehicleData).sort();
    console.log(`Total fields available: ${allFields.length}`);
    
    // Mostrar solo campos que contienen alguna de las palabras clave
    const keywords = ['traccio', 'carrosseria', 'consum', 'color', 'aire', 'climat', 'fumador', 'preu', 'propietari', 'llibre', 'revisions', 'impostos', 'canvi'];
    const relevantFields = allFields.filter(field => 
      keywords.some(keyword => field.toLowerCase().includes(keyword.toLowerCase()))
    );
    
    console.log(`\nRelevant fields (${relevantFields.length}):`);
    relevantFields.forEach(field => {
      const value = vehicleData[field];
      const hasValue = value !== null && value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0);
      console.log(`${hasValue ? '✅' : '❌'} ${field.padEnd(30)} = ${JSON.stringify(value).substring(0, 50)}${JSON.stringify(value).length > 50 ? '...' : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Debug failed:', error.response?.data || error.message);
  }
}

// Ejecutar el debug
debugFieldNames();