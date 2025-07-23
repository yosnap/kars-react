const fs = require('fs');
const path = require('path');

// Leer los archivos JSON
const carBrands = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'car-brands-complete.json'), 'utf8'));
const motorcycleBrands = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'motorcycle-brands-complete.json'), 'utf8'));

// Encontrar marcas duplicadas
const carBrandSlugs = new Set(carBrands.map(b => b.value));
const duplicateBrands = motorcycleBrands.filter(mb => carBrandSlugs.has(mb.value));

console.log('🔍 Marcas que fabrican tanto coches como motos:');
duplicateBrands.forEach(brand => {
  console.log(`   - ${brand.label} (${brand.value})`);
});

console.log(`\nTotal: ${duplicateBrands.length} marcas duplicadas`);

// Crear el archivo brands.json actualizado con TODAS las marcas
const brandsData = {
  metadata: {
    createdAt: new Date().toISOString(),
    totalCarBrands: carBrands.length,
    totalMotorcycleBrands: motorcycleBrands.length,
    duplicateBrands: duplicateBrands.length,
    duplicateBrandsList: duplicateBrands.map(b => ({ value: b.value, label: b.label })),
    version: '2.0'
  },
  carBrands: carBrands,
  motorcycleBrands: motorcycleBrands
};

// Guardar el archivo actualizado
const outputPath = path.join(__dirname, '..', 'data', 'brands.json');
fs.writeFileSync(outputPath, JSON.stringify(brandsData, null, 2), 'utf8');

console.log('\n✅ Archivo brands.json actualizado con:');
console.log(`   • ${carBrands.length} marcas de coches`);
console.log(`   • ${motorcycleBrands.length} marcas de motos`);
console.log(`   • ${duplicateBrands.length} marcas duplicadas`);
console.log(`📁 Archivo guardado: ${outputPath}`);