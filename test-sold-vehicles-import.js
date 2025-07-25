const axios = require('axios');

async function testSoldVehiclesImport() {
  try {
    console.log('🔄 Testing sold vehicles import...');
    
    const config = {
      apiUrl: 'https://motoraldia.net/wp-json/api-motor/v1/vehicles',
      username: 'Paulo',
      password: 'U^q^i2l49rZrX72#Ln!Xe5k0',
      userId: '113',
      importSold: true,
      importNotSold: false,
      convertImages: true,
      imageFormat: 'avif',
      autoSync: false,
      syncFrequency: 60,
      batchSize: 50
    };

    // Start the import
    const response = await axios.post('http://localhost:3001/api/sync/import-with-config', config, {
      auth: {
        username: 'admin',
        password: 'Motoraldia.2025!'
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Import started:', response.data);
    
    const syncId = response.data.syncId;
    
    // Poll for completion
    console.log('⏳ Polling for completion...');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 20;
    
    while (!completed && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 3000)); // Wait 3 seconds
      
      try {
        const statusResponse = await axios.get(`http://localhost:3001/api/sync/logs/${syncId}`, {
          auth: {
            username: 'admin',
            password: 'Motoraldia.2025!'
          }
        });
        
        const log = statusResponse.data;
        console.log(`📊 Status: ${log.status}, Processed: ${log.vehiclesProcessed}, Created: ${log.vehiclesCreated}, Updated: ${log.vehiclesUpdated}`);
        
        if (log.status === 'completed' || log.status === 'failed') {
          completed = true;
          console.log('🎉 Final result:', log);
        }
        
      } catch (error) {
        console.error('Error checking status:', error.response?.data || error.message);
      }
      
      attempts++;
    }
    
    if (!completed) {
      console.log('⚠️ Import may still be running after maximum polling attempts');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testSoldVehiclesImport();