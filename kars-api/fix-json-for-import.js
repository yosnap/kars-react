#!/usr/bin/env node

const fs = require('fs');

// Leer el archivo JSON existente
const inputFile = 'example_vehicles_kars-----1.json';
const outputFile = 'vehicles_import_ready.json';

try {
  console.log(`📖 Leyendo archivo ${inputFile}...`);
  const fileContent = fs.readFileSync(inputFile, 'utf8');
  const jsonData = JSON.parse(fileContent);
  
  // Extraer solo el array de vehículos - puede estar en 'data' o 'items'
  let vehiclesArray = null;
  
  if (jsonData.data && Array.isArray(jsonData.data)) {
    vehiclesArray = jsonData.data;
  } else if (jsonData.items && Array.isArray(jsonData.items)) {
    vehiclesArray = jsonData.items;
  } else if (Array.isArray(jsonData)) {
    vehiclesArray = jsonData;
  }
  
  if (vehiclesArray) {
    console.log(`📊 Encontrados ${vehiclesArray.length} vehículos`);
    
    // Convertir el formato de campos con guiones a camelCase
    const convertedVehicles = vehiclesArray.map(vehicle => {
      const converted = {};
      
      // Mapeo de campos
      const fieldMapping = {
        'id': 'id',
        'originalId': 'originalId',
        'author_id': 'authorId',
        'userId': 'userId',
        'professionalId': 'professionalId',
        'data-creacio': 'dataCreacio',
        'status': 'status',
        'slug': 'slug',
        'titol-anunci': 'titolAnunci',
        'descripcio-anunci': 'descripcioAnunci',
        'anunci-actiu': 'anunciActiu',
        'anunci-destacat': 'anunciDestacat',
        'venut': 'venut',
        'tipus-vehicle': 'tipusVehicle',
        'marques-cotxe': 'marcaCotxe',
        'models-cotxe': 'modelsCotxe',
        'marques-moto': 'marcaMoto',
        'models-moto': 'modelsMoto',
        'tipus-propulsor': 'tipusPropulsor',
        'tipus-combustible': 'tipusCombustible',
        'tipus-canvi': 'tipusCanvi',
        'estat-vehicle': 'estatVehicle',
        'carroseria-cotxe': 'carrosseriaCotxe',
        'carroseria-moto': 'carrosseriaMoto',
        'carroseria-caravana': 'carrosseriaCaravana',
        'dies-caducitat': 'diesCaducitat',
        'versio': 'versio',
        'any': 'any',
        'quilometratge': 'quilometratge',
        'cilindrada': 'cilindrada',
        'traccio': 'traccio',
        'potencia-cv': 'potenciaCv',
        'potencia-kw': 'potenciaKw',
        'emissions-vehicle': 'emissionsVehicle',
        'color-vehicle': 'colorVehicle',
        'places-cotxe': 'placesCotxe',
        'places-moto': 'placesMoto',
        'aire-acondicionat': 'aireAcondicionat',
        'tipus-tapisseria': 'tipusTapisseria',
        'portes-cotxe': 'portesCotxe',
        'climatitzacio': 'climatitzacio',
        'color-tapisseria': 'colorTapisseria',
        'vehicle-fumador': 'vehicleFumador',
        'roda-recanvi': 'rodaRecanvi',
        'preu': 'preu',
        'imatge-destacada-url': 'imatgeDestacadaUrl',
        'galeria-vehicle-urls': 'galeriaVehicleUrls',
        'extres-cotxe': 'extresCotxe',
        'extres-moto': 'extresMoto',
        'extres-autocaravana': 'extresAutocaravana',
        'extres-habitacle': 'extresHabitacle',
        'garantia': 'garantia',
        'vehicle-accidentat': 'vehicleAccidentat',
        'llibre-manteniment': 'llibreManteniment',
        'revisions-oficials': 'revisionsOficials',
        'impostos-deduibles': 'impostosDeduibles',
        'vehicle-a-canvi': 'vehicleACanvi',
        'nombre-propietaris': 'nombrePropietaris'
      };
      
      // Convertir campos
      for (const [oldKey, newKey] of Object.entries(fieldMapping)) {
        if (vehicle.hasOwnProperty(oldKey)) {
          converted[newKey] = vehicle[oldKey];
        }
      }
      
      // Copiar campos que no necesitan conversión
      for (const key in vehicle) {
        if (!fieldMapping[key] && !key.includes('-')) {
          converted[key] = vehicle[key];
        }
      }
      
      // Asegurar que algunos campos tengan valores por defecto
      converted.userId = converted.userId || converted.authorId || '113';
      converted.professionalId = converted.professionalId || converted.authorId || '113';
      converted.needsSync = true;
      
      // Convertir valores booleanos de string a boolean
      if (converted.anunciActiu === 'true') converted.anunciActiu = true;
      if (converted.anunciActiu === 'false') converted.anunciActiu = false;
      if (converted.venut === 'true') converted.venut = true;
      if (converted.venut === 'false') converted.venut = false;
      
      // Convertir anunciDestacat a número
      converted.anunciDestacat = parseInt(converted.anunciDestacat) || 0;
      
      return converted;
    });
    
    // Guardar solo el array convertido
    fs.writeFileSync(outputFile, JSON.stringify(convertedVehicles, null, 2));
    
    console.log(`✅ Archivo guardado como ${outputFile}`);
    console.log(`🎯 Ahora puedes importar este archivo desde la interfaz web`);
  } else {
    console.error('❌ El archivo no contiene un array de vehículos válido');
  }
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}