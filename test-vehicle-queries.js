const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

async function testVehicleQueries() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Connected to MongoDB for testing queries\n');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // 1. Total de vehículos
    const totalVehicles = await collection.countDocuments();
    console.log(`📊 Total vehicles in database: ${totalVehicles}`);
    
    // 2. Vehículos por tipo
    console.log('\n📋 Vehicles by type:');
    const typeStats = await collection.aggregate([
      {
        $group: {
          _id: '$tipusVehicle',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    typeStats.forEach(stat => {
      console.log(`   • ${stat._id || 'null'}: ${stat.count} vehicles`);
    });
    
    // 3. Test específico: filtrar solo motos
    console.log('\n🏍️ Testing motorcycle filter:');
    const motoCount = await collection.countDocuments({ tipusVehicle: 'moto' });
    console.log(`   • Total motos found: ${motoCount}`);
    
    if (motoCount > 0) {
      const motoData = await collection.findOne({ tipusVehicle: 'moto' });
      console.log(`   • Sample moto data:`);
      console.log(`     - ID: ${motoData._id}`);
      console.log(`     - Title: ${motoData.titolAnunci || 'No title'}`);
      console.log(`     - Brand: ${motoData.marcaMoto || 'No brand'}`);
      console.log(`     - Model: ${motoData.modelsMoto || 'No model'}`);
      console.log(`     - Active: ${motoData['anunci-actiu']}`);
      console.log(`     - Sold: ${motoData.venut}`);
    }
    
    // 4. Test de vehículos activos
    console.log('\n✅ Testing active vehicles:');
    const activeCount = await collection.countDocuments({ 'anunci-actiu': true });
    const inactiveCount = await collection.countDocuments({ 'anunci-actiu': false });
    const nullActiveCount = await collection.countDocuments({ 
      $or: [
        { 'anunci-actiu': null },
        { 'anunci-actiu': { $exists: false } }
      ]
    });
    
    console.log(`   • Active (true): ${activeCount}`);
    console.log(`   • Inactive (false): ${inactiveCount}`);
    console.log(`   • Null/undefined: ${nullActiveCount}`);
    
    // 5. Test de vehículos vendidos
    console.log('\n💰 Testing sold vehicles:');
    const soldCount = await collection.countDocuments({ venut: true });
    const availableCount = await collection.countDocuments({ venut: false });
    const nullSoldCount = await collection.countDocuments({ 
      $or: [
        { venut: null },
        { venut: { $exists: false } }
      ]
    });
    
    console.log(`   • Sold (true): ${soldCount}`);
    console.log(`   • Available (false): ${availableCount}`);
    console.log(`   • Null/undefined: ${nullSoldCount}`);
    
    // 6. Test combinado: motos activas y disponibles
    console.log('\n🎯 Testing combined filter (active motos not sold):');
    const combinedQuery = {
      tipusVehicle: 'moto',
      'anunci-actiu': true,
      venut: false
    };
    
    const combinedCount = await collection.countDocuments(combinedQuery);
    console.log(`   • Active motos not sold: ${combinedCount}`);
    
    if (combinedCount > 0) {
      const combinedData = await collection.findOne(combinedQuery);
      console.log(`   • Sample combined result:`);
      console.log(`     - Title: ${combinedData.titolAnunci}`);
      console.log(`     - Type: ${combinedData.tipusVehicle}`);
      console.log(`     - Active: ${combinedData['anunci-actiu']}`);
      console.log(`     - Sold: ${combinedData.venut}`);
    }
    
    // 7. Verificar campos de fecha para determinar si hay problemas de schema
    console.log('\n📅 Testing date fields:');
    const sampleVehicle = await collection.findOne({});
    console.log(`   • Sample vehicle fields:`, Object.keys(sampleVehicle).slice(0, 10));
    
    // 8. Test the exact query structure that the API might be using
    console.log('\n🔍 Testing API-like query structure:');
    const apiQuery = {
      $and: [
        { 'anunci-actiu': true },
        { venut: { $ne: true } }
      ]
    };
    
    const apiCount = await collection.countDocuments(apiQuery);
    console.log(`   • API-style query count: ${apiCount}`);
    
    console.log('\n💡 Diagnosis:');
    if (totalVehicles > 0 && activeCount === 0) {
      console.log(`   ⚠️  Problem: ${totalVehicles} vehicles exist but none are marked as active`);
      console.log(`   📝 Recommendation: Check anunci-actiu field values`);
    }
    
    if (motoCount === 0) {
      console.log(`   ⚠️  Problem: No motorcycles found with tipusVehicle='moto'`);
    }
    
    if (combinedCount === 0 && motoCount > 0) {
      console.log(`   ⚠️  Problem: Motorcycles exist but none are active and available`);
    }
    
  } catch (error) {
    console.error('❌ Error testing queries:', error);
  } finally {
    await client.close();
    console.log('\n📁 MongoDB connection closed');
  }
}

// Execute the test
testVehicleQueries();