const { MongoClient } = require('mongodb');
const fs = require('fs');

async function importVehicles() {
  const url = 'mongodb://kars:c@D*PZmWQZ49gMYD@motoraldia_kars-db:27017/karsad?tls=false';
  const client = new MongoClient(url);

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    const db = client.db();
    
    console.log('📄 Cargando vehículos desde JSON...');
    let vehiclesData;
    
    try {
      const jsonData = fs.readFileSync('vehicles_export.json', 'utf-8');
      vehiclesData = JSON.parse(jsonData);
    } catch (error) {
      console.error('❌ No se pudo cargar vehicles_export.json:', error.message);
      console.log('💡 Asegúrate de que el archivo existe en el directorio actual');
      return;
    }
    
    const vehicles = vehiclesData.vehicles || vehiclesData;
    
    if (!Array.isArray(vehicles) || vehicles.length === 0) {
      console.log('⚠️  No se encontraron vehículos para importar');
      return;
    }
    
    console.log(`📊 Preparando importación de ${vehicles.length} vehículos...`);
    
    // Limpiar colección existente
    console.log('🗑️  Limpiando vehículos existentes...');
    const deleteResult = await db.collection('Vehicle').deleteMany({});
    console.log(`🗑️  Eliminados ${deleteResult.deletedCount} vehículos existentes`);
    
    // Procesar e insertar vehículos
    console.log('💾 Insertando vehículos...');
    let insertedCount = 0;
    let errors = 0;

    for (const vehicle of vehicles) {
      try {
        // Limpiar datos del vehículo
        const { _id, ...cleanVehicle } = vehicle;
        
        // Asegurar tipos correctos
        const processedVehicle = {
          ...cleanVehicle,
          // Asegurar que preu es número
          ...(cleanVehicle.preu && { 
            preu: typeof cleanVehicle.preu === 'number' ? cleanVehicle.preu : parseFloat(cleanVehicle.preu) || 0 
          }),
          // Asegurar que garantia es string
          ...(cleanVehicle.garantia !== undefined && { 
            garantia: String(cleanVehicle.garantia) 
          }),
          // Asegurar fechas
          createdAt: cleanVehicle.createdAt ? new Date(cleanVehicle.createdAt) : new Date(),
          updatedAt: new Date()
        };

        await db.collection('Vehicle').insertOne(processedVehicle);
        insertedCount++;
        
        if (insertedCount % 25 === 0) {
          console.log(`💾 Procesados ${insertedCount}/${vehicles.length} vehículos...`);
        }
        
      } catch (error) {
        console.error(`❌ Error insertando vehículo:`, error.message);
        errors++;
      }
    }

    console.log('\n✅ Importación completada:');
    console.log(`📊 Vehículos insertados: ${insertedCount}`);
    console.log(`❌ Errores: ${errors}`);
    
    // Verificar importación
    const finalCount = await db.collection('Vehicle').countDocuments();
    console.log(`🔍 Total en base de datos: ${finalCount}`);
    
    if (finalCount === insertedCount) {
      console.log('🎉 ¡Importación exitosa! Reinicia el servicio en Easypanel');
    } else {
      console.log('⚠️  Puede haber problemas con la importación');
    }
    
  } catch (error) {
    console.error('❌ Error durante la importación:', error.message);
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

console.log('🚀 Iniciando importación de vehículos...');
console.log('=' .repeat(50));
importVehicles();