#!/usr/bin/env node

/**
 * Script para importar vehículos de Kars.ad desde JSON
 * 
 * Uso:
 * node scripts/import-kars-vehicles.js [path_to_json_file] [--clear]
 * 
 * Ejemplos:
 * node scripts/import-kars-vehicles.js vehicles.json
 * node scripts/import-kars-vehicles.js vehicles.json --clear
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Configuración
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';
const API_ENDPOINT = `${API_BASE_URL}/api/vehicles/import-json`;

async function importVehiclesFromFile(filePath, clearDatabase = false) {
  try {
    console.log('🚀 Kars.ad Vehicle Import Script');
    console.log('================================');
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`❌ Error: File not found: ${filePath}`);
      process.exit(1);
    }
    
    // Leer el archivo JSON
    console.log(`📖 Reading JSON file: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    let vehiclesData;
    try {
      vehiclesData = JSON.parse(fileContent);
    } catch (parseError) {
      console.error('❌ Error: Invalid JSON format');
      console.error(parseError.message);
      process.exit(1);
    }
    
    // Validar que sea un array
    if (!Array.isArray(vehiclesData)) {
      console.error('❌ Error: JSON must contain an array of vehicles');
      process.exit(1);
    }
    
    console.log(`📊 Found ${vehiclesData.length} vehicles in JSON file`);
    
    if (clearDatabase) {
      console.log('🗑️ Will clear database before import');
    }
    
    // Hacer la petición a la API
    console.log('📡 Sending data to API...');
    console.log(`   Endpoint: ${API_ENDPOINT}`);
    
    const response = await axios.post(API_ENDPOINT, {
      vehiclesData,
      clearDatabase
    }, {
      timeout: 300000, // 5 minutos
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    // Mostrar resultados
    const { data } = response.data;
    console.log('\n🎉 Import Results:');
    console.log('==================');
    console.log(`✅ Imported: ${data.imported} vehicles`);
    console.log(`⚠️  Skipped:  ${data.skipped} vehicles`);
    console.log(`❌ Errors:   ${data.errors.length}`);
    
    if (data.errors.length > 0) {
      console.log('\n🔍 Error Details:');
      data.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }
    
    console.log('\n✨ Import completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Import Failed:');
    console.error('================');
    
    if (error.response) {
      console.error(`HTTP Status: ${error.response.status}`);
      console.error(`Response: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      console.error('No response from server. Is the API running?');
      console.error(`API URL: ${API_ENDPOINT}`);
    } else {
      console.error(`Error: ${error.message}`);
    }
    
    process.exit(1);
  }
}

// Procesar argumentos de línea de comandos
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('📖 Kars.ad Vehicle Import Script');
    console.log('Usage: node scripts/import-kars-vehicles.js <json_file> [--clear]');
    console.log('');
    console.log('Examples:');
    console.log('  node scripts/import-kars-vehicles.js vehicles.json');
    console.log('  node scripts/import-kars-vehicles.js vehicles.json --clear');
    console.log('');
    console.log('Options:');
    console.log('  --clear    Clear database before importing');
    process.exit(0);
  }
  
  const filePath = path.resolve(args[0]);
  const clearDatabase = args.includes('--clear');
  
  importVehiclesFromFile(filePath, clearDatabase);
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { importVehiclesFromFile };