const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Importar marcas desde el archivo actualizado
const { brandsData } = require('../dist/data/brands-data.js');

// Usar las marcas del archivo brands-data.ts
const CAR_BRANDS_PAYLOAD = brandsData.carBrands;
const MOTORCYCLE_BRANDS_PAYLOAD = brandsData.motorcycleBrands;

/*
// Comentado: marcas hardcodeadas obsoletas
const CAR_BRANDS_PAYLOAD_OLD = [
  {"value":"abarth","label":"Abarth"},
  {"value":"acura","label":"Acura"},
  {"value":"alfa-romeo","label":"Alfa Romeo"},
  {"value":"alpine","label":"Alpine"},
  {"value":"audi","label":"Audi"},
  {"value":"bentley","label":"Bentley"},
  {"value":"bmw","label":"BMW"},
  {"value":"bugatti","label":"Bugatti"},
  {"value":"buick","label":"Buick"},
  {"value":"byd","label":"BYD"},
  {"value":"cadillac","label":"Cadillac"},
  {"value":"chery","label":"Chery"},
  {"value":"chevrolet","label":"Chevrolet"},
  {"value":"chrysler","label":"Chrysler"},
  {"value":"citroen","label":"Citroën"},
  {"value":"cupra","label":"Cupra"},
  {"value":"dacia","label":"Dacia"},
  {"value":"daewoo","label":"Daewoo"},
  {"value":"daihatsu","label":"Daihatsu"},
  {"value":"dodge","label":"Dodge"},
  {"value":"donkervoort","label":"Donkervoort"},
  {"value":"ds","label":"DS"},
  {"value":"ferrari","label":"Ferrari"},
  {"value":"fiat","label":"Fiat"},
  {"value":"fisker","label":"Fisker"},
  {"value":"ford","label":"Ford"},
  {"value":"genesis","label":"Genesis"},
  {"value":"gmc","label":"GMC"},
  {"value":"honda","label":"Honda"},
  {"value":"hummer","label":"Hummer"},
  {"value":"hyundai","label":"Hyundai"},
  {"value":"infiniti","label":"Infiniti"},
  {"value":"isuzu","label":"Isuzu"},
  {"value":"iveco","label":"Iveco"},
  {"value":"jaguar","label":"Jaguar"},
  {"value":"jeep","label":"Jeep"},
  {"value":"kia","label":"Kia"},
  {"value":"koenigsegg","label":"Koenigsegg"},
  {"value":"lada","label":"Lada"},
  {"value":"lamborghini","label":"Lamborghini"},
  {"value":"lancia","label":"Lancia"},
  {"value":"land-rover","label":"Land Rover"},
  {"value":"lexus","label":"Lexus"},
  {"value":"lincoln","label":"Lincoln"},
  {"value":"lotus","label":"Lotus"},
  {"value":"lucid","label":"Lucid"},
  {"value":"lynk-co","label":"Lynk & Co"},
  {"value":"maserati","label":"Maserati"},
  {"value":"maybach","label":"Maybach"},
  {"value":"mazda","label":"Mazda"},
  {"value":"mclaren","label":"McLaren"},
  {"value":"mercedes-benz","label":"Mercedes-Benz"},
  {"value":"mg","label":"MG"},
  {"value":"mini","label":"MINI"},
  {"value":"mitsubishi","label":"Mitsubishi"},
  {"value":"morgan","label":"Morgan"},
  {"value":"nio","label":"NIO"},
  {"value":"nissan","label":"Nissan"},
  {"value":"opel","label":"Opel"},
  {"value":"pagani","label":"Pagani"},
  {"value":"peugeot","label":"Peugeot"},
  {"value":"polestar","label":"Polestar"},
  {"value":"porsche","label":"Porsche"},
  {"value":"ram","label":"Ram"},
  {"value":"renault","label":"Renault"},
  {"value":"rolls-royce","label":"Rolls-Royce"},
  {"value":"rover","label":"Rover"},
  {"value":"saab","label":"Saab"},
  {"value":"seat","label":"SEAT"},
  {"value":"skoda","label":"Škoda"},
  {"value":"smart","label":"smart"},
  {"value":"ssangyong","label":"SsangYong"},
  {"value":"subaru","label":"Subaru"},
  {"value":"suzuki","label":"Suzuki"},
  {"value":"tesla","label":"Tesla"},
  {"value":"toyota","label":"Toyota"},
  {"value":"volkswagen","label":"Volkswagen"},
  {"value":"volvo","label":"Volvo"},
  {"value":"xpeng","label":"XPeng"}
];

const MOTORCYCLE_BRANDS_PAYLOAD_OLD = [
  {"value":"aprilia","label":"Aprilia"},
  {"value":"benelli","label":"Benelli"},
  {"value":"beta","label":"Beta"},
  {"value":"bmw","label":"BMW"},
  {"value":"bultaco","label":"Bultaco"},
  {"value":"cfmoto","label":"CFMOTO"},
  {"value":"ducati","label":"Ducati"},
  {"value":"gas-gas","label":"Gas Gas"},
  {"value":"harley-davidson","label":"Harley-Davidson"},
  {"value":"honda","label":"Honda"},
  {"value":"husaberg","label":"Husaberg"},
  {"value":"husqvarna","label":"Husqvarna"},
  {"value":"hyosung","label":"Hyosung"},
  {"value":"indian","label":"Indian"},
  {"value":"kawasaki","label":"Kawasaki"},
  {"value":"ktm","label":"KTM"},
  {"value":"kymco","label":"Kymco"},
  {"value":"laverda","label":"Laverda"},
  {"value":"mv-agusta","label":"MV Agusta"},
  {"value":"piaggio","label":"Piaggio"},
  {"value":"sherco","label":"Sherco"},
  {"value":"suzuki","label":"Suzuki"},
  {"value":"triumph","label":"Triumph"},
  {"value":"vespa","label":"Vespa"},
  {"value":"yamaha","label":"Yamaha"}
];
*/

// Cliente axios con timeout
const apiClient = axios.create({
  timeout: 30000
});

/**
 * Descargar modelos para una marca específica
 */
async function downloadModelsForBrand(brand, vehicleType) {
  try {
    console.log(`📡 Descargando modelos para ${vehicleType === 'car' ? 'coche' : 'moto'}: ${brand.label}...`);
    
    const endpoint = vehicleType === 'car' 
      ? `https://motoraldia.net/wp-json/api-motor/v1/marques-cotxe?marca=${brand.value}`
      : `https://motoraldia.net/wp-json/api-motor/v1/marques-moto?marca=${brand.value}`;
    
    const response = await apiClient.get(endpoint);
    
    let models = [];
    if (response.data?.data && Array.isArray(response.data.data)) {
      models = response.data.data;
    } else if (Array.isArray(response.data)) {
      models = response.data;
    }
    
    // Procesar y limpiar modelos
    const processedModels = models
      .filter(model => {
        const value = model.value || model.slug;
        const label = model.label || model.name;
        return value && label;
      })
      .map(model => ({
        value: model.value || model.slug,
        label: model.label || model.name,
        brandSlug: brand.value
      }));
    
    console.log(`✅ ${processedModels.length} modelos encontrados para ${brand.label}`);
    return processedModels;
    
  } catch (error) {
    console.error(`❌ Error descargando modelos para ${brand.label}:`, error.message);
    return [];
  }
}

/**
 * Función principal
 */
async function downloadAllModels() {
  console.log('🚀 Iniciando descarga de todos los modelos...');
  
  const result = {
    metadata: {
      createdAt: new Date().toISOString(),
      totalCarBrands: CAR_BRANDS_PAYLOAD.length,
      totalMotorcycleBrands: MOTORCYCLE_BRANDS_PAYLOAD.length,
      version: '1.0'
    },
    carBrands: [],
    motorcycleBrands: [],
    carModels: [],
    motorcycleModels: []
  };
  
  // Copiar marcas al resultado
  result.carBrands = CAR_BRANDS_PAYLOAD.map(brand => ({
    ...brand,
    vehicleType: 'car'
  }));
  
  result.motorcycleBrands = MOTORCYCLE_BRANDS_PAYLOAD.map(brand => ({
    ...brand,
    vehicleType: 'motorcycle'
  }));
  
  console.log('\n📋 DESCARGANDO MODELOS DE COCHES...');
  // Descargar modelos de coches
  for (let i = 0; i < CAR_BRANDS_PAYLOAD.length; i++) {
    const brand = CAR_BRANDS_PAYLOAD[i];
    console.log(`\n[${i + 1}/${CAR_BRANDS_PAYLOAD.length}] Procesando: ${brand.label}`);
    
    const models = await downloadModelsForBrand(brand, 'car');
    result.carModels.push(...models);
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('\n🏍️ DESCARGANDO MODELOS DE MOTOS...');
  // Descargar modelos de motos
  for (let i = 0; i < MOTORCYCLE_BRANDS_PAYLOAD.length; i++) {
    const brand = MOTORCYCLE_BRANDS_PAYLOAD[i];
    console.log(`\n[${i + 1}/${MOTORCYCLE_BRANDS_PAYLOAD.length}] Procesando: ${brand.label}`);
    
    const models = await downloadModelsForBrand(brand, 'motorcycle');
    result.motorcycleModels.push(...models);
    
    // Pequeña pausa para no saturar la API
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Actualizar metadata con resultados finales
  result.metadata.totalCarModels = result.carModels.length;
  result.metadata.totalMotorcycleModels = result.motorcycleModels.length;
  result.metadata.totalModels = result.carModels.length + result.motorcycleModels.length;
  
  // Guardar resultado en archivo JSON
  const outputPath = path.join(__dirname, '..', 'data', 'brands-and-models.json');
  
  // Crear directorio data si no existe
  const dataDir = path.join(__dirname, '..', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
  
  console.log('\n✅ DESCARGA COMPLETADA!');
  console.log('📊 ESTADÍSTICAS:');
  console.log(`   • Marcas de coches: ${result.carBrands.length}`);
  console.log(`   • Modelos de coches: ${result.carModels.length}`);
  console.log(`   • Marcas de motos: ${result.motorcycleBrands.length}`);
  console.log(`   • Modelos de motos: ${result.motorcycleModels.length}`);
  console.log(`   • Total modelos: ${result.metadata.totalModels}`);
  console.log(`📁 Archivo guardado: ${outputPath}`);
  
  return result;
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  downloadAllModels()
    .then(() => {
      console.log('\n🎉 Script completado exitosamente!');
      process.exit(0);
    })
    .catch(error => {
      console.error('\n💥 Error ejecutando script:', error);
      process.exit(1);
    });
}

module.exports = { downloadAllModels };