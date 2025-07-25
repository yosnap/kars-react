const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const AUTH = 'Basic ' + Buffer.from('admin:Motoraldia.2025!').toString('base64');

async function testSyncEndpoints() {
  console.log('🔍 Testing Sync API Endpoints...\n');

  try {
    // 1. Test GET /api/sync/config
    console.log('1. Testing GET /api/sync/config...');
    const configResponse = await axios.get(`${BASE_URL}/api/sync/config`, {
      headers: { Authorization: AUTH }
    });
    console.log('✅ Config loaded:', {
      apiUrl: configResponse.data.apiUrl,
      username: configResponse.data.username,
      autoSync: configResponse.data.autoSync
    });

    // 2. Test POST /api/sync/test-connection
    console.log('\n2. Testing POST /api/sync/test-connection...');
    const testConfig = {
      apiUrl: 'https://motoraldia.net/wp-json/api-motor/v1/vehicles',
      username: 'Paulo',
      password: 'U^q^i2l49rZrX72#Ln!Xe5k0'
    };

    const connectionResponse = await axios.post(
      `${BASE_URL}/api/sync/test-connection`,
      testConfig,
      { headers: { Authorization: AUTH } }
    );
    console.log('✅ Connection test:', connectionResponse.data.message);

    // 3. Test POST /api/sync/config (save configuration)
    console.log('\n3. Testing POST /api/sync/config...');
    const saveConfig = {
      ...testConfig,
      userId: '113',
      importSold: true,
      importNotSold: true,
      convertImages: true,
      imageFormat: 'avif',
      autoSync: false,
      syncFrequency: 60,
      batchSize: 50
    };

    const saveResponse = await axios.post(
      `${BASE_URL}/api/sync/config`,
      saveConfig,
      { headers: { Authorization: AUTH } }
    );
    console.log('✅ Configuration saved:', saveResponse.data.message);

    console.log('\n🎉 All sync endpoints are working correctly!');

  } catch (error) {
    console.error('❌ Error testing endpoints:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.error || error.response.data.message);
    } else {
      console.error(error.message);
    }
  }
}

testSyncEndpoints();