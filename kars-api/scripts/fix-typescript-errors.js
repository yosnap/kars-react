const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigiendo errores específicos de TypeScript...\n');

// Corregir brands.ts
const brandsPath = path.join(__dirname, '..', 'src', 'routes', 'brands.ts');
let brandsContent = fs.readFileSync(brandsPath, 'utf8');

console.log('📝 Corrigiendo brands.ts');

// Corregir vehicleTypess -> vehicleTypes
brandsContent = brandsContent.replace(/vehicleTypess/g, 'vehicleTypes');

// Corregir whereCondition para usar hasSome
brandsContent = brandsContent.replace(
  /const whereCondition = type \? \{ vehicleTypes: \[type as string\] \} : \{\};/g,
  'const whereCondition = type ? { vehicleTypes: { hasSome: [type as string] } } : {};'
);

// Corregir creación de marca
brandsContent = brandsContent.replace(
  /vehicleType$/gm,
  'vehicleTypes: [vehicleType]'
);

// Corregir actualización de marca
brandsContent = brandsContent.replace(
  /\.\.\.\(vehicleType && \{ vehicleType \}\)/g,
  '...(vehicleType && { vehicleTypes: [vehicleType] })'
);

// Corregir deleteMany con vehicleType
brandsContent = brandsContent.replace(
  /where: \{ vehicleType \}/g,
  'where: { vehicleTypes: { hasSome: [vehicleType] } }'
);

// Corregir comparaciones de vehicleTypes
brandsContent = brandsContent.replace(
  /if \(brand\.vehicleTypes === 'car'\)/g,
  "if (brand.vehicleTypes.includes('car'))"
);
brandsContent = brandsContent.replace(
  /else if \(brand\.vehicleTypes === 'motorcycle'\)/g,
  "else if (brand.vehicleTypes.includes('motorcycle'))"
);

// Remover includes problemáticos en select
brandsContent = brandsContent.replace(
  /,\n\s+models: true,\n\s+_count: \{ select: \{ models: true \} \}/g,
  ''
);

// Corregir array de vehicleTypes en respuesta JSON
brandsContent = brandsContent.replace(
  /vehicleTypes: \[brand\.vehicleTypes\s+\]\}/g,
  'vehicleTypes: brand.vehicleTypes\n      }'
);

fs.writeFileSync(brandsPath, brandsContent, 'utf8');
console.log('✅ brands.ts corregido');

// Corregir metadata.ts
const metadataPath = path.join(__dirname, '..', 'src', 'routes', 'metadata.ts');
let metadataContent = fs.readFileSync(metadataPath, 'utf8');

console.log('📝 Corrigiendo metadata.ts');

// Remover includes problemáticos en select de vehicle
metadataContent = metadataContent.replace(
  /select: \{ colorVehicle: true ,\n\s+models: true,\n\s+_count: \{ select: \{ models: true \} \}\}/g,
  'select: { colorVehicle: true }'
);

fs.writeFileSync(metadataPath, metadataContent, 'utf8');
console.log('✅ metadata.ts corregido');

// Corregir admin.ts
const adminPath = path.join(__dirname, '..', 'src', 'routes', 'admin.ts');
let adminContent = fs.readFileSync(adminPath, 'utf8');

console.log('📝 Corrigiendo admin.ts');

// Corregir vehicleType -> vehicleTypes en queries
adminContent = adminContent.replace(/vehicleType:/g, 'vehicleTypes:');

// Corregir referencias a _count problemáticas
adminContent = adminContent.replace(/\._count/g, '');

// Corregir carBrands y motorcycleBrands en stats
adminContent = adminContent.replace(/stats\.carBrands/g, 'stats.brands');
adminContent = adminContent.replace(/stats\.motorcycleBrands/g, 'stats.motorcycleModels');

// Corregir creación con vehicleTypes como array
adminContent = adminContent.replace(
  /vehicleTypes: ([^,\]\}]+)([,\]\}])/g,
  'vehicleTypes: [$1]$2'
);

fs.writeFileSync(adminPath, adminContent, 'utf8');
console.log('✅ admin.ts corregido');

// Corregir syncService.ts
const syncPath = path.join(__dirname, '..', 'src', 'services', 'syncService.ts');
let syncContent = fs.readFileSync(syncPath, 'utf8');

console.log('📝 Corrigiendo syncService.ts');

// Corregir vehicleTypess -> vehicleTypes
syncContent = syncContent.replace(/vehicleTypess/g, 'vehicleTypes');

fs.writeFileSync(syncPath, syncContent, 'utf8');
console.log('✅ syncService.ts corregido');

console.log('\n🎉 Corrección de errores TypeScript completada!');