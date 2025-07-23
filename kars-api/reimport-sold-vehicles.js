const fs = require('fs');
const path = require('path');

async function reimportSoldVehicles() {
  try {
    console.log('🔄 Reimporting sold vehicles with correct data...');
    
    // Leer vehículos vendidos
    const soldVehiclesPath = path.join(__dirname, 'data', 'venut-true.json');
    const soldVehiclesFile = JSON.parse(fs.readFileSync(soldVehiclesPath, 'utf8'));
    
    // Extraer solo el array de items
    const soldVehiclesData = soldVehiclesFile.items || soldVehiclesFile;
    
    console.log(`📊 Found ${soldVehiclesData.length} sold vehicles to reimport`);
    
    // Hacer petición al endpoint de importación
    const response = await fetch('http://localhost:3001/api/vehicles/import-json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehiclesData: soldVehiclesData,
        clearDatabase: false
      })
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Reimport completed successfully:', result);
    } else {
      console.error('❌ Reimport failed:', result);
    }
    
  } catch (error) {
    console.error('❌ Error during reimport:', error);
  }
}

// Ejecutar la reimportación
reimportSoldVehicles();