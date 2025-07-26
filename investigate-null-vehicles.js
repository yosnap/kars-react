const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function investigateNullVehicles() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB para investigación');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // 1. Verificar cuándo se crearon los vehículos con tipusVehicle null
    console.log('🔍 Analizando fechas de creación de vehículos...\n');
    
    // Obtener algunos vehículos que acabamos de arreglar para ver sus fechas
    const recentlyFixed = await collection.find({
      tipusVehicle: 'cotxe',
      $or: [
        { titolAnunci: null },
        { titolAnunci: { $exists: false } },
        { titolAnunci: '' }
      ]
    }).limit(10).toArray();
    
    console.log('📅 Fechas de vehículos sin título (posiblemente problemáticos):');
    recentlyFixed.forEach(vehicle => {
      console.log(`   • ID: ${vehicle._id}`);
      console.log(`     Created: ${vehicle.created_at ? vehicle.created_at.toISOString() : 'No date'}`);
      console.log(`     Updated: ${vehicle.updated_at ? vehicle.updated_at.toISOString() : 'No date'}`);
      console.log(`     Título: ${vehicle.titolAnunci || 'Sin título'}`);
      console.log(`     Marca: ${vehicle.marcaCotxe || 'Sin marca'}`);
      console.log('');
    });
    
    // 2. Comparar con vehículos que tienen datos completos
    console.log('📊 Comparando con vehículos con datos completos:');
    const completeVehicles = await collection.find({
      titolAnunci: { $exists: true, $ne: null, $ne: '' },
      tipusVehicle: { $exists: true, $ne: null }
    }).limit(5).toArray();
    
    completeVehicles.forEach(vehicle => {
      console.log(`   • ID: ${vehicle._id}`);
      console.log(`     Created: ${vehicle.created_at ? vehicle.created_at.toISOString() : 'No date'}`);
      console.log(`     Título: ${vehicle.titolAnunci}`);
      console.log(`     Tipo: ${vehicle.tipusVehicle}`);
      console.log('');
    });
    
    // 3. Verificar si hay patrones en los IDs
    console.log('🔢 Analizando patrones en los IDs de vehículos problemáticos...');
    
    const allVehicles = await collection.find({}, { 
      projection: { _id: 1, titolAnunci: 1, tipusVehicle: 1, created_at: 1 } 
    }).sort({ _id: 1 }).toArray();
    
    let nullCount = 0;
    let totalCount = 0;
    let nullRanges = [];
    let currentRange = null;
    
    allVehicles.forEach((vehicle, index) => {
      totalCount++;
      
      const hasNullData = !vehicle.titolAnunci || vehicle.titolAnunci === '';
      
      if (hasNullData) {
        nullCount++;
        
        if (!currentRange) {
          currentRange = {
            start: vehicle._id.toString(),
            startIndex: index,
            count: 1
          };
        } else {
          currentRange.count++;
        }
      } else if (currentRange) {
        // Terminamos un rango de nulls
        currentRange.end = allVehicles[index - 1]._id.toString();
        currentRange.endIndex = index - 1;
        nullRanges.push(currentRange);
        currentRange = null;
      }
    });
    
    // Si terminamos con un rango abierto
    if (currentRange) {
      currentRange.end = allVehicles[allVehicles.length - 1]._id.toString();
      currentRange.endIndex = allVehicles.length - 1;
      nullRanges.push(currentRange);
    }
    
    console.log(`\n📊 Estadísticas de vehículos problemáticos:`);
    console.log(`   • Total vehículos: ${totalCount}`);
    console.log(`   • Vehículos sin datos: ${nullCount}`);
    console.log(`   • Porcentaje problemáticos: ${((nullCount / totalCount) * 100).toFixed(1)}%`);
    
    console.log(`\n📍 Rangos de IDs con problemas:`);
    nullRanges.forEach((range, index) => {
      console.log(`   ${index + 1}. Desde ${range.start.slice(-8)} hasta ${range.end.slice(-8)} (${range.count} vehículos)`);
    });
    
    // 4. Verificar si esto coincide con alguna importación masiva
    console.log(`\n💡 Posibles causas:`);
    if (nullRanges.length > 0) {
      console.log(`   • Los vehículos problemáticos están en rangos consecutivos`);
      console.log(`   • Esto sugiere importaciones masivas sin validación`);
      console.log(`   • Posiblemente desde una API externa o script de migración`);
    }
    
    // 5. Verificar si hay scripts de importación recientes
    const recentImports = await collection.find({
      created_at: { 
        $gte: new Date(Date.now() - (7 * 24 * 60 * 60 * 1000)) // Últimos 7 días
      }
    }).count();
    
    console.log(`\n📈 Vehículos creados en los últimos 7 días: ${recentImports}`);
    
    if (recentImports > 50) {
      console.log(`   ⚠️  Muchos vehículos creados recientemente - posible importación masiva`);
    }
    
  } catch (error) {
    console.error('❌ Error en investigación:', error);
  } finally {
    await client.close();
    console.log('📁 Investigación completada');
  }
}

// Ejecutar investigación
investigateNullVehicles();