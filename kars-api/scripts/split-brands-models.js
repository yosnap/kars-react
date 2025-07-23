const fs = require('fs');
const path = require('path');

// Leer el archivo completo
const dataPath = path.join(__dirname, '..', 'data', 'brands-and-models.json');
const fullData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Crear archivo solo para marcas (mucho más pequeño)
const brandsData = {
  metadata: {
    createdAt: fullData.metadata.createdAt,
    version: fullData.metadata.version,
    totalCarBrands: fullData.metadata.totalCarBrands,
    totalMotorcycleBrands: fullData.metadata.totalMotorcycleBrands
  },
  carBrands: fullData.carBrands,
  motorcycleBrands: fullData.motorcycleBrands
};

// Crear archivo solo para modelos (se cargará bajo demanda)
const modelsData = {
  metadata: {
    createdAt: fullData.metadata.createdAt,
    version: fullData.metadata.version,
    totalCarModels: fullData.metadata.totalCarModels,
    totalMotorcycleModels: fullData.metadata.totalMotorcycleModels,
    totalModels: fullData.metadata.totalModels
  },
  carModels: fullData.carModels,
  motorcycleModels: fullData.motorcycleModels
};

// Guardar archivos separados
const brandsPath = path.join(__dirname, '..', 'data', 'brands.json');
const modelsPath = path.join(__dirname, '..', 'data', 'models.json');

fs.writeFileSync(brandsPath, JSON.stringify(brandsData, null, 2));
fs.writeFileSync(modelsPath, JSON.stringify(modelsData, null, 2));

console.log('✅ Archivos separados creados:');
console.log(`📁 Marcas: ${brandsPath} (${Math.round(fs.statSync(brandsPath).size / 1024)}KB)`);
console.log(`📁 Modelos: ${modelsPath} (${Math.round(fs.statSync(modelsPath).size / 1024)}KB)`);
console.log(`📊 Total marcas: ${brandsData.carBrands.length + brandsData.motorcycleBrands.length}`);
console.log(`📊 Total modelos: ${modelsData.carModels.length + modelsData.motorcycleModels.length}`);