const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function fixNullTipusVehicle() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // 1. Encontrar vehículos con tipusVehicle null o undefined
    const vehiclesWithNullType = await collection.find({
      $or: [
        { tipusVehicle: null },
        { tipusVehicle: { $exists: false } },
        { tipusVehicle: "" }
      ]
    }).toArray();
    
    console.log(`🔍 Encontrados ${vehiclesWithNullType.length} vehículos con tipusVehicle null/vacío`);
    
    if (vehiclesWithNullType.length === 0) {
      console.log('✅ No hay vehículos con tipusVehicle null - el problema puede estar en otro lado');
      return;
    }
    
    // 2. Intentar inferir el tipo basado en campos disponibles
    let fixedCount = 0;
    
    for (const vehicle of vehiclesWithNullType) {
      let inferredType = null;
      
      // Lógica para inferir el tipo basado en campos específicos
      if (vehicle.marcaCotxe || vehicle.modelsCotxe || vehicle.portesCotxe) {
        inferredType = 'cotxe';
      } else if (vehicle.marcaMoto || vehicle.modelsMoto) {
        inferredType = 'moto';
      } else if (vehicle.marcaAutocaravana || vehicle.modelsAutocaravana || vehicle.llitsAutocaravana) {
        inferredType = 'autocaravana-camper';
      } else if (vehicle.marcaVehicleComercial || vehicle.modelsVehicleComercial || vehicle.volumenCarga) {
        inferredType = 'vehicle-comercial';
      } else {
        // Si no podemos inferir, asignar como 'cotxe' por defecto
        inferredType = 'cotxe';
      }
      
      // Actualizar el vehículo
      const updateResult = await collection.updateOne(
        { _id: vehicle._id },
        { 
          $set: { 
            tipusVehicle: inferredType,
            updated_at: new Date()
          } 
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        fixedCount++;
        console.log(`   ✅ Vehículo ${vehicle._id} actualizado: ${vehicle.titolAnunci || 'Sin título'} → ${inferredType}`);
      }
    }
    
    console.log(`\n📊 Resumen:`);
    console.log(`   • Total vehículos con problema: ${vehiclesWithNullType.length}`);
    console.log(`   • Vehículos corregidos: ${fixedCount}`);
    
    // 3. Verificar que no queden vehículos con tipusVehicle null
    const remainingNullVehicles = await collection.countDocuments({
      $or: [
        { tipusVehicle: null },
        { tipusVehicle: { $exists: false } },
        { tipusVehicle: "" }
      ]
    });
    
    if (remainingNullVehicles === 0) {
      console.log('✅ Todos los vehículos tienen tipusVehicle asignado correctamente');
      console.log('🎯 El error de facetas debería estar resuelto');
    } else {
      console.log(`⚠️  Todavía quedan ${remainingNullVehicles} vehículos con tipusVehicle null`);
    }
    
    // 4. Mostrar estadísticas de tipos de vehículo
    const typeStats = await collection.aggregate([
      {
        $group: {
          _id: '$tipusVehicle',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    console.log('\n📈 Estadísticas de tipos de vehículo:');
    typeStats.forEach(stat => {
      console.log(`   • ${stat._id || 'null'}: ${stat.count} vehículos`);
    });
    
  } catch (error) {
    console.error('❌ Error arreglando tipusVehicle:', error);
  } finally {
    await client.close();
    console.log('📁 Conexión MongoDB cerrada');
  }
}

// Ejecutar el script
fixNullTipusVehicle();