const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores TypeScript específicos restantes...\n');

// Corregir admin.ts - errores específicos
const adminPath = path.join(__dirname, '..', 'src', 'routes', 'admin.ts');
let adminContent = fs.readFileSync(adminPath, 'utf8');

console.log('📝 Corrigiendo admin.ts - errores específicos');

// 1. Corregir error línea 884 - cambiar .vehicles a ._count.vehicles
adminContent = adminContent.replace(/userStats\.vehicles/g, 'userStats._count.vehicles');

// 2. Corregir error línea 2245 - vehicleType -> vehicleTypes
adminContent = adminContent.replace(/vehicleTypes: ([^,}]+)([,}])/g, 'vehicleTypes: { hasSome: [$1] }$2');

// 3. Corregir errores de creación con vehicleType -> vehicleTypes
adminContent = adminContent.replace(/vehicleType: ([^,}]+)([,}])/g, 'vehicleTypes: [$1]$2');

// 4. Remover referencias a .models que no existen en el select
adminContent = adminContent.replace(/\.models\.length/g, '._count.models || 0');

// 5. Corregir referencias a vehicleTypess
adminContent = adminContent.replace(/vehicleTypess/g, 'vehicleTypes');

// 6. Corregir stats.carBrands -> stats.brands
adminContent = adminContent.replace(/stats\.carBrands/g, 'stats.brands');
adminContent = adminContent.replace(/stats\.motorcycleBrands/g, 'stats.motorcycleModels');

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log('✅ admin.ts corregido');

// Corregir brands.ts
const brandsPath = path.join(__dirname, '..', 'src', 'routes', 'brands.ts');
let brandsContent = fs.readFileSync(brandsPath, 'utf8');

console.log('📝 Corrigiendo brands.ts');

// Buscar línea específica del whereCondition y corregirla
brandsContent = brandsContent.replace(
  /const whereCondition = type \? \{ vehicleTypes: \[type as string\] \} : \{\};/g,
  'const whereCondition = type ? { vehicleTypes: { hasSome: [type as string] } } : {};'
);

fs.writeFileSync(brandsPath, brandsContent, 'utf8');
console.log('✅ brands.ts corregido');

// Corregir syncService.ts
const syncPath = path.join(__dirname, '..', 'src', 'services', 'syncService.ts');
let syncContent = fs.readFileSync(syncPath, 'utf8');

console.log('📝 Corrigiendo syncService.ts');

// Corregir comparación de arrays con strings
syncContent = syncContent.replace(
  /brand\.vehicleTypes === 'car'/g,
  "brand.vehicleTypes.includes('car')"
);
syncContent = syncContent.replace(
  /brand\.vehicleTypes === 'motorcycle'/g,
  "brand.vehicleTypes.includes('motorcycle')"
);

fs.writeFileSync(syncPath, syncContent, 'utf8');
console.log('✅ syncService.ts corregido');

console.log('\n🎉 Corrección de errores específicos completada!');