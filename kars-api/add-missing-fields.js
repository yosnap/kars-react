const fs = require('fs');
const path = require('path');

// Campos que faltan en el schema actual
const missingFields = [
  // Marcas comerciales (ya existen marcaCotxe y marcaMoto)
  { name: 'marquesComercial', type: 'String?', map: 'marques-comercial', comment: 'Marca de vehículo comercial' },
  { name: 'modelsComercial', type: 'String?', map: 'models-comercial', comment: 'Modelo de vehículo comercial' },
  
  // Campos técnicos adicionales que faltan
  { name: 'placesMoto', exists: true }, // Ya existe
  
  // Comfort y características que no están
  { name: 'climatitzacio', exists: true }, // Ya existe
  { name: 'vehicleFumador', exists: true }, // Ya existe
  
  // Precios adicionales que no están
  { name: 'preuMensual', exists: true }, // Ya existe
  { name: 'preuDiari', exists: true }, // Ya existe
  { name: 'preuAntic', exists: true }, // Ya existe
  
  // Información de propietarios y mantenimiento que no están
  { name: 'nombrePropietaris', exists: true }, // Ya existe
  { name: 'llibreManteniment', exists: true }, // Ya existe
  { name: 'revisionsOficials', exists: true }, // Ya existe
  { name: 'impostosDeduibles', exists: true }, // Ya existe
  { name: 'vehicleACanvi', exists: true }, // Ya existe
  
  // Descripciones multiidioma que no están (solo está descripcioAnunci)
  { name: 'descripcioAnunciCA', exists: true }, // Ya existe
  { name: 'descripcioAnunciEN', exists: true }, // Ya existe
  { name: 'descripcioAnunciFR', exists: true }, // Ya existe
  { name: 'descripcioAnunciES', exists: true }, // Ya existe
  
  // Imágenes que no están
  { name: 'imatgeDestacadaUrl', exists: true }, // Ya existe
  { name: 'galeriaVehicleUrls', exists: true }, // Ya existe
  
  // Estado del anuncio que no está
  { name: 'anunciActiu', exists: true }, // Ya existe
  { name: 'anunciDestacat', exists: true }, // Ya existe
  { name: 'venut', exists: true }, // Ya existe
  
  // Metadatos que no están
  { name: 'notesInternes', exists: true }, // Ya existe
];

// Nuevos campos que realmente faltan
const actuallyMissingFields = [
  // Nuevos campos necesarios para completar paridad
  'marquesComercial',
  'modelsComercial'
];

function updatePrismaSchema() {
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  let schema = fs.readFileSync(schemaPath, 'utf8');
  
  console.log('🔧 Analizando schema actual...');
  
  // Verificar qué campos realmente faltan
  const fieldsToAdd = [];
  
  // Buscar la posición para insertar los nuevos campos
  const vehicleModelMatch = schema.match(/(model Vehicle \{[\s\S]*?)(\/\/ Tipo y marca[\s\S]*?)(  modelsMoto[\s\S]*?\n)/);
  
  if (vehicleModelMatch) {
    const beforeSection = vehicleModelMatch[1] + vehicleModelMatch[2];
    const afterModelsMoto = vehicleModelMatch[3];
    
    // Verificar si marquesComercial ya existe
    if (!schema.includes('marquesComercial')) {
      fieldsToAdd.push(`  marquesComercial  String?  @map("marques-comercial")`);
    }
    
    // Verificar si modelsComercial ya existe
    if (!schema.includes('modelsComercial')) {
      fieldsToAdd.push(`  modelsComercial   String?  @map("models-comercial")`);
    }
    
    if (fieldsToAdd.length > 0) {
      const newSchema = beforeSection + 
        afterModelsMoto + 
        fieldsToAdd.join('\n') + '\n';
      
      // Agregar el resto del schema después de modelsMoto
      const restOfSchema = schema.substring(vehicleModelMatch.index + vehicleModelMatch[0].length);
      const finalSchema = newSchema + restOfSchema;
      
      fs.writeFileSync(schemaPath, finalSchema);
      console.log(`✅ Agregados ${fieldsToAdd.length} campos al schema`);
      fieldsToAdd.forEach(field => console.log(`   • ${field}`));
    } else {
      console.log('✅ Todos los campos necesarios ya están presentes');
    }
  }
  
  return fieldsToAdd.length;
}

function countCurrentFields() {
  console.log('📊 Contando campos actuales en el schema...\n');
  
  const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  
  // Buscar el modelo Vehicle
  const vehicleModelMatch = schema.match(/model Vehicle \{([\s\S]*?)\n\n/);
  
  if (vehicleModelMatch) {
    const vehicleContent = vehicleModelMatch[1];
    
    // Contar campos (líneas que empiezan con espacios y contienen String, Boolean, Int, etc.)
    const fieldLines = vehicleContent.split('\n').filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.startsWith('//') && 
             !trimmed.startsWith('@@') &&
             !trimmed.startsWith('id ') &&
             (trimmed.includes('String') || trimmed.includes('Boolean') || trimmed.includes('Int') || trimmed.includes('Float') || trimmed.includes('DateTime') || trimmed.includes('Json'));
    });
    
    console.log(`📋 CAMPOS ACTUALES EN EL SCHEMA (${fieldLines.length}):`);
    fieldLines.forEach((line, index) => {
      const fieldName = line.trim().split(/\s+/)[0];
      console.log(`   ${(index + 1).toString().padStart(2)}. ${fieldName}`);
    });
    
    return fieldLines.length;
  }
  
  return 0;
}

async function main() {
  console.log('🔍 Completando campos faltantes en la API interna...\n');
  
  // Contar campos actuales
  const currentCount = countCurrentFields();
  
  // Agregar campos faltantes
  const addedCount = updatePrismaSchema();
  
  console.log(`\n🎯 RESUMEN:`);
  console.log(`   • Campos antes: ${currentCount}`);
  console.log(`   • Campos agregados: ${addedCount}`);
  console.log(`   • Campos después: ${currentCount + addedCount}`);
  
  if (addedCount > 0) {
    console.log(`\n📋 PRÓXIMOS PASOS:`);
    console.log(`   1. Regenerar el cliente Prisma: npx prisma generate`);
    console.log(`   2. Aplicar migración: npx prisma db push`);
    console.log(`   3. Actualizar el frontend para usar los nuevos campos`);
  } else {
    console.log(`\n✅ El schema ya está completo - no se necesitan cambios`);
  }
}

main().catch(console.error);