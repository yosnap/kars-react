const { MongoClient } = require('mongodb');

async function fixData() {
  const url = 'mongodb://kars:c@D*PZmWQZ49gMYD@motoraldia_kars-db:27017/karsad?tls=false';
  const client = new MongoClient(url);

  try {
    console.log('🔌 Conectando a la base de datos...');
    await client.connect();
    const db = client.db();
    
    console.log('🔍 Analizando datos existentes...');
    
    // Contar problemas antes de corregir
    const preuStrings = await db.collection('Vehicle').countDocuments({ preu: { $type: 'string' } });
    const garantiaBools = await db.collection('Vehicle').countDocuments({ garantia: { $type: 'bool' } });
    
    console.log('📊 Precios como string encontrados:', preuStrings);
    console.log('📊 Garantías como boolean encontradas:', garantiaBools);
    
    if (preuStrings === 0 && garantiaBools === 0) {
      console.log('✅ No hay problemas de tipos de datos para corregir');
      return;
    }

    console.log('🔧 Corrigiendo tipos de datos...');

    // Corregir precios: string -> number
    const result1 = await db.collection('Vehicle').updateMany(
      { preu: { $type: 'string' } },
      [{ $set: { preu: { $toDouble: { $ifNull: [{ $toDouble: '$preu' }, 0] } } } }]
    );

    // Corregir garantías: boolean -> string
    const result2 = await db.collection('Vehicle').updateMany(
      { garantia: { $type: 'bool' } },
      [{ $set: { garantia: { $toString: '$garantia' } } }]
    );

    console.log('✅ Corrección completada:');
    console.log('   📈 Precios corregidos:', result1.modifiedCount);
    console.log('   🛡️  Garantías corregidas:', result2.modifiedCount);
    
    // Verificar que todo está correcto
    const remainingPreuStrings = await db.collection('Vehicle').countDocuments({ preu: { $type: 'string' } });
    const remainingGarantiaBools = await db.collection('Vehicle').countDocuments({ garantia: { $type: 'bool' } });
    
    if (remainingPreuStrings === 0 && remainingGarantiaBools === 0) {
      console.log('🎉 ¡Perfecto! Todos los tipos de datos han sido corregidos');
      console.log('🔄 Ahora puedes reiniciar el servicio en Easypanel');
    } else {
      console.log('⚠️  Aún quedan algunos problemas:');
      console.log('   📊 Precios string restantes:', remainingPreuStrings);
      console.log('   📊 Garantías boolean restantes:', remainingGarantiaBools);
    }
    
  } catch (error) {
    console.error('❌ Error durante la corrección:', error.message);
    console.error('💡 Verifica que la URL de conexión sea correcta');
  } finally {
    await client.close();
    console.log('🔌 Conexión cerrada');
  }
}

console.log('🚀 Iniciando corrección de tipos de datos en producción...');
console.log('=' .repeat(60));
fixData();