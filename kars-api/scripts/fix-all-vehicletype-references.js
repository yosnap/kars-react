const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Archivos a actualizar
const filesToUpdate = [
  'src/routes/admin.ts',
  'src/routes/brands.ts', 
  'src/routes/metadata.ts',
  'src/services/syncService.ts'
];

console.log('🔧 Actualizando referencias de vehicleType a vehicleTypes en todos los archivos...\n');

// Patrones de reemplazo
const replacements = [
  // Consultas donde
  { from: /vehicleType:\s*'([^']+)'/g, to: "vehicleTypes: { hasSome: ['$1'] }" },
  { from: /vehicleType:\s*vehicle\.tipo/g, to: "vehicleTypes: { hasSome: [vehicle.tipo] }" },
  { from: /where:\s*\{\s*vehicleType:\s*([^}]+)\s*\}/g, to: "where: { vehicleTypes: { hasSome: [$1] } }" },
  
  // Selecciones
  { from: /vehicleType:\s*true/g, to: "vehicleTypes: true" },
  
  // Acceso a propiedades
  { from: /\.vehicleType/g, to: ".vehicleTypes" },
  
  // Creación de datos
  { from: /vehicleType:\s*([^,}]+)/g, to: "vehicleTypes: [$1]" },
  
  // Referencias en inicialización
  { from: /carBrands:/g, to: "brands:" },
  { from: /motorcycleBrands:/g, to: "motorcycleModels:" }, // Solo si es en stats
  
  // Consultas específicas con has
  { from: /vehicleTypes:\s*\{\s*has:\s*'([^']+)'\s*\}/g, to: "vehicleTypes: { hasSome: ['$1'] }" },
];

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️ Archivo no encontrado: ${filePath}`);
    return;
  }
  
  console.log(`📝 Actualizando: ${filePath}`);
  
  let content = fs.readFileSync(fullPath, 'utf8');
  let changed = false;
  
  // Aplicar reemplazos específicos por archivo
  if (filePath.includes('admin.ts')) {
    // Reemplazos específicos para admin.ts
    content = content.replace(/carBrands\.imported/g, 'brands.imported');
    content = content.replace(/carBrands\.skipped/g, 'brands.skipped');  
    content = content.replace(/carBrands\.total/g, 'brands.total');
    content = content.replace(/motorcycleBrands\./g, 'motorcycleModels.');
    content = content.replace(/_count/g, '_count');
    changed = true;
  }
  
  if (filePath.includes('brands.ts') || filePath.includes('metadata.ts')) {
    // Agregar include para modelos
    content = content.replace(/select:\s*\{([^}]*)\}/g, (match, selectContent) => {
      if (!selectContent.includes('models') && !selectContent.includes('_count')) {
        return match.replace(selectContent, selectContent + ',\n      models: true,\n      _count: { select: { models: true } }');
      }
      return match;
    });
    changed = true;
  }
  
  // Aplicar reemplazos generales
  replacements.forEach(({ from, to }) => {
    const originalContent = content;
    content = content.replace(from, to);
    if (content !== originalContent) {
      changed = true;
    }
  });
  
  if (changed) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ ${filePath} actualizado`);
  } else {
    console.log(`⏭️ ${filePath} sin cambios`);
  }
});

console.log('\n🎉 Actualización completada!');
console.log('⚠️ Nota: Puede que necesites ajustes manuales adicionales.');