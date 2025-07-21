const axios = require('axios');

const testVehicles = [
  {
    "titolAnunci": "Audi A4 2.0 TDI",
    "descripcioAnunci": "Audi A4 en excelente estado",
    "anunciActiu": true,
    "anunciDestacat": 0,
    "tipusVehicle": "COTXE", 
    "marcaCotxe": "Audi",
    "modelsCotxe": "A4",
    "tipusCombustible": "Diesel",
    "tipusPropulsor": "Combustió",
    "estatVehicle": "Ocasió",
    "carrosseriaCotxe": "sedan",
    "versio": "2.0 TDI",
    "any": "2020",
    "quilometratge": "45000",
    "cilindrada": "1968",
    "traccio": "Davanter",
    "potenciaCv": "150",
    "potenciaKw": "110",
    "emissionsVehicle": "Euro6",
    "colorVehicle": "Negre",
    "preu": "25000",
    "slug": "audi-a4-2-0-tdi-test",
    "imatgeDestacadaUrl": "https://example.com/audi.jpg"
  },
  {
    "titolAnunci": "BMW X3 xDrive20d",
    "descripcioAnunci": "BMW X3 amb tracció integral",
    "anunciActiu": true, 
    "anunciDestacat": 0,
    "tipusVehicle": "COTXE",
    "marcaCotxe": "BMW",
    "modelsCotxe": "X3",
    "tipusCombustible": "Diesel",
    "tipusPropulsor": "Combustió",
    "estatVehicle": "Ocasió",
    "carrosseriaCotxe": "suv",
    "versio": "xDrive20d",
    "any": "2019",
    "quilometratge": "65000",
    "cilindrada": "1995",
    "traccio": "Integral",
    "potenciaCv": "190",
    "potenciaKw": "140",
    "emissionsVehicle": "Euro6",
    "colorVehicle": "Blanc",
    "preu": "35000",
    "slug": "bmw-x3-xdrive20d-test",
    "imatgeDestacadaUrl": "https://example.com/bmw.jpg"
  },
  {
    "titolAnunci": "Mercedes C220d AMG",
    "descripcioAnunci": "Mercedes Classe C amb paquet AMG",
    "anunciActiu": true,
    "anunciDestacat": 1, 
    "tipusVehicle": "COTXE",
    "marcaCotxe": "Mercedes-Benz",
    "modelsCotxe": "Classe C",
    "tipusCombustible": "Diesel",
    "tipusPropulsor": "Combustió",
    "estatVehicle": "Seminou",
    "carrosseriaCotxe": "sedan",
    "versio": "C220d AMG",
    "any": "2021",
    "quilometratge": "25000",
    "cilindrada": "1950",
    "traccio": "Davanter", 
    "potenciaCv": "200",
    "potenciaKw": "147",
    "emissionsVehicle": "Euro6",
    "colorVehicle": "Gris",
    "preu": "45000",
    "slug": "mercedes-c220d-amg-test",
    "imatgeDestacadaUrl": "https://example.com/mercedes.jpg"
  }
];

async function createTestVehicles() {
  console.log('🚗 Creating test vehicles...');
  
  for (const vehicle of testVehicles) {
    try {
      const response = await axios.post('http://localhost:3001/api/vehicles', vehicle, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + Buffer.from('admin:password').toString('base64')
        }
      });
      
      console.log(`✅ Created: ${vehicle['titol-anunci']}`);
    } catch (error) {
      console.log(`❌ Failed to create: ${vehicle['titol-anunci']}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${JSON.stringify(error.response.data, null, 2)}`);
      } else {
        console.log(`   Error: ${error.message}`);
      }
    }
  }
  
  console.log('\n🎉 Test vehicle creation completed!');
}

createTestVehicles();