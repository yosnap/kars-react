const fs = require('fs');
const path = require('path');

// Leer el archivo del servicio de inicialización
const servicePath = path.join(__dirname, '..', 'src', 'services', 'initializationService.ts');
let content = fs.readFileSync(servicePath, 'utf8');

console.log('🔧 Actualizando initializationService.ts para usar vehicleTypes (array)...\n');

// 1. Reemplazar las llamadas a funciones individuales por una función unificada
content = content.replace(
  /\/\/ 2\. Importar marcas de coches[\s\S]*?await this\.importCarBrands\(maxBrands\);[\s\S]*?\/\/ 4\. Importar marcas de motos[\s\S]*?await this\.importMotorcycleBrands\(maxBrands\);/,
  `// 2. Importar todas las marcas (coches y motos) con manejo de duplicados
      this.updateProgress({
        stage: 'car_brands',
        stageLabel: 'Importando todas las marcas...',
        stageProgress: 0,
        currentItem: 'Procesando marcas desde JSON...'
      });
      await this.importAllBrands(maxBrands);`
);

// 2. Actualizar las consultas que usan vehicleType por vehicleTypes
content = content.replace(/vehicleType: 'car'/g, "vehicleTypes: { has: 'car' }");
content = content.replace(/vehicleType: 'motorcycle'/g, "vehicleTypes: { has: 'motorcycle' }");
content = content.replace(/where: { vehicleType: /g, "where: { vehicleTypes: { has: ");
content = content.replace(/brand: {\s*vehicleType: 'car'\s*}/g, "brand: { vehicleTypes: { has: 'car' } }");
content = content.replace(/brand: {\s*vehicleType: 'motorcycle'\s*}/g, "brand: { vehicleTypes: { has: 'motorcycle' } }");

console.log('✅ Actualizadas las referencias de vehicleType a vehicleTypes');

// Escribir el archivo actualizado
fs.writeFileSync(servicePath, content, 'utf8');

console.log('📁 initializationService.ts actualizado correctamente');

console.log('\n⚠️  NOTA: Necesitarás añadir manualmente la nueva función importAllBrands()');
console.log('   Esta función ya está diseñada en el plan anterior.');