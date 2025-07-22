// Simple Node.js test for the brands API
const axios = require('axios');

// Configuration matching the frontend
const API_BASE_URL = 'http://localhost:3001/api';
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'Motoraldia.2025!';

function getBasicAuthHeader(username, password) {
  const credentials = Buffer.from(`${username}:${password}`).toString('base64');
  return `Basic ${credentials}`;
}

const axiosAdmin = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: getBasicAuthHeader(ADMIN_USER, ADMIN_PASS)
  }
});

async function testBrandsAPI() {
  console.log('🧪 Testing Brands API...');
  console.log('📍 API Base URL:', API_BASE_URL);
  console.log('👤 Admin User:', ADMIN_USER);
  
  try {
    console.log('\n📡 Testing /brands/cars...');
    const carResponse = await axiosAdmin.get('/brands/cars');
    console.log('✅ Cars Response Status:', carResponse.status);
    console.log('✅ Cars Response Success:', carResponse.data?.success);
    console.log('✅ Cars Total:', carResponse.data?.total);
    console.log('✅ First 3 car brands:', carResponse.data?.data?.slice(0, 3));
    
    console.log('\n📡 Testing /brands/motorcycles...');
    const motoResponse = await axiosAdmin.get('/brands/motorcycles');
    console.log('✅ Motorcycles Response Status:', motoResponse.status);
    console.log('✅ Motorcycles Response Success:', motoResponse.data?.success);
    console.log('✅ Motorcycles Total:', motoResponse.data?.total);
    console.log('✅ First 3 motorcycle brands:', motoResponse.data?.data?.slice(0, 3));
    
    // Simulate frontend logic
    console.log('\n🔄 Simulating frontend logic...');
    const carBrands = carResponse.data?.success && carResponse.data?.data ? carResponse.data.data : [];
    const motorcycleBrands = motoResponse.data?.success && motoResponse.data?.data ? motoResponse.data.data : [];
    
    const formData = { tipusVehicle: 'COTXE' };
    
    const getBrandsForVehicleType = () => {
      switch (formData.tipusVehicle) {
        case 'COTXE':
        case 'AUTOCARAVANA':
        case 'VEHICLE_COMERCIAL':
          return carBrands;
        case 'MOTO':
          return motorcycleBrands;
        default:
          return [];
      }
    };
    
    const currentBrands = getBrandsForVehicleType();
    console.log('🎯 Selected vehicle type:', formData.tipusVehicle);
    console.log('🎯 Brands for this type:', currentBrands.length);
    console.log('🎯 Should populate dropdown with:', currentBrands.length > 0 ? 'SUCCESS' : 'FAILURE');
    
    if (currentBrands.length > 0) {
      console.log('✅ API test PASSED - Brands should appear in dropdown');
    } else {
      console.log('❌ API test FAILED - No brands returned');
    }
    
  } catch (error) {
    console.error('❌ API Test Error:', error.message);
    console.error('❌ Error Details:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
  }
}

testBrandsAPI();