#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios');

async function downloadVehiclesForImport() {
  try {
    console.log('📥 Descargando vehículos para importación...');
    
    // URL con el parámetro raw=true para obtener solo el array
    const response = await axios.get('http://localhost:5001/api/vehicles/json?raw=true&limit=500');
    
    // Guardar directamente el array
    const fileName = 'vehicles_import_ready.json';
    fs.writeFileSync(fileName, JSON.stringify(response.data, null, 2));
    
    console.log(`✅ Archivo guardado como ${fileName}`);
    console.log(`📊 Total de vehículos: ${response.data.length}`);
    
  } catch (error) {
    console.error('❌ Error al descargar vehículos:', error.message);
    process.exit(1);
  }
}

downloadVehiclesForImport();