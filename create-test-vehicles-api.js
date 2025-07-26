const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000/api';
const ADMIN_AUTH = {
  username: 'admin',
  password: 'admin123'
};

// Datos completos para testing
const testVehicles = [
  {
    // COCHE COMPLETO
    tipusVehicle: 'cotxe',
    titolAnunci: 'BMW Serie 3 320d M Sport - Vehículo Test Completo',
    marcaCotxe: 'BMW',
    modelsCotxe: 'Serie 3',
    versio: '320d M Sport',
    any: '2023',
    quilometratge: '15000',
    preu: 45000,
    preuAnterior: 50000,
    tipusCombustible: 'Dièsel',
    potenciaCv: '190',
    potenciaKw: '140',
    motor: '2.0 TDI',
    transmissio: 'Automàtic',
    portesCotxe: '4',
    seientsCotxe: '5',
    estatVehicle: 'seminous',
    colorExterior: 'Negre',
    colorInterior: 'Cuir negre',
    consumMixt: '4.2',
    emissions: '110',
    'anunci-actiu': true,
    'anunci-destacat': true,
    venut: false,
    
    // Extras de coche - los primeros 20 para testing
    extresCotxe: 'abs,airbag-conductor,airbag-passatger,airbags-cortina,airbag-genolls,airbags-laterals,alarma,apple-car-play-android-auto,bluetooth,camera-visio-davant,camara-visio-posterior,cruise-control,direccio-assistida,endoll-12v,equip-so-alta-fidelitat,fars-xeno,head-up-display,isofix,kit-carrosseria,lector-senyals-de-transit',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>BMW Serie 3 amb totes les característiques de prova. <strong>Vehicle complet</strong> per testing del sistema.</p><p>Inclou tots els extras disponibles i totes les funcionalitats del formulari.</p>',
    descripcioAnunciEs: '<p>BMW Serie 3 con todas las características de prueba. <strong>Vehículo completo</strong> para testing del sistema.</p><p>Incluye todos los extras disponibles y todas las funcionalidades del formulario.</p>',
    descripcioAnunciEn: '<p>BMW Series 3 with all test features. <strong>Complete vehicle</strong> for system testing.</p><p>Includes all available extras and all form functionalities.</p>',
    descripcioAnunciFr: '<p>BMW Série 3 avec toutes les caractéristiques de test. <strong>Véhicule complet</strong> pour tester le système.</p><p>Inclut tous les extras disponibles et toutes les fonctionnalités du formulaire.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop'
    ]
  },
  
  {
    // MOTO COMPLETA
    tipusVehicle: 'moto',
    titolAnunci: 'Yamaha MT-09 SP - Moto Test Completa',
    marcaMoto: 'Yamaha',
    modelsMoto: 'MT-09',
    versio: 'SP',
    any: '2023',
    quilometratge: '8000',
    preu: 12000,
    preuAnterior: 13500,
    tipusCombustible: 'Gasolina',
    potenciaCv: '115',
    potenciaKw: '85',
    motor: '847cc',
    transmissio: 'Manual',
    estatVehicle: 'seminous',
    colorExterior: 'Blau',
    consumMixt: '5.8',
    emissions: '135',
    'anunci-actiu': true,
    'anunci-destacat': false,
    venut: false,
    
    // Extras de moto - los primeros 15 para testing
    extresMoto: 'abs,airbag,alarma,bluetooth,canvi-rapid,control-creuer,escape-esportiu,far-led,gps,llandes-aleacio,modes-conduccio,pantalla-tft,proteccio-motor,sistema-audio,suspensio-ajustable',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Yamaha MT-09 SP completament equipada per testing. <strong>Moto de prova</strong> amb tots els extras.</p>',
    descripcioAnunciEs: '<p>Yamaha MT-09 SP completamente equipada para testing. <strong>Moto de prueba</strong> con todos los extras.</p>',
    descripcioAnunciEn: '<p>Yamaha MT-09 SP fully equipped for testing. <strong>Test motorcycle</strong> with all extras.</p>',
    descripcioAnunciFr: '<p>Yamaha MT-09 SP entièrement équipée pour les tests. <strong>Moto de test</strong> avec tous les extras.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1471466054146-e71beb31de2d?w=800&h=600&fit=crop'
    ]
  },
  
  {
    // AUTOCARAVANA COMPLETA
    tipusVehicle: 'autocaravana-camper',
    titolAnunci: 'Mercedes Sprinter Camper - Autocaravana Test Completa',
    marcaAutocaravana: 'Mercedes',
    modelsAutocaravana: 'Sprinter',
    versio: '319 CDI 4x4',
    any: '2022',
    quilometratge: '25000',
    preu: 85000,
    preuAnterior: 90000,
    tipusCombustible: 'Dièsel',
    potenciaCv: '190',
    potenciaKw: '140',
    motor: '2.1 CDI',
    transmissio: 'Manual',
    estatVehicle: 'ocasio',
    colorExterior: 'Blanc',
    colorInterior: 'Gris',
    consumMixt: '8.5',
    emissions: '199',
    longitudAutocaravana: '6.99',
    amplarioAutocaravana: '2.05',
    alturaAutocaravana: '2.80',
    pesAutocaravana: '3500',
    llitsAutocaravana: '4',
    'anunci-actiu': true,
    'anunci-destacat': true,
    venut: false,
    
    // Extras de autocaravana - los primeros 15 para testing
    extresAutocaravana: 'abs,aire-condicionat-cabina,aire-condicionat-habitacle,bluetooth,boiler,calefaccio-gas,camera-marxa-enrere,cruise-control,dutxa,forn,gps,microones,nevera,tv,wc',
    
    // Extras de habitáculo - los primeros 10 para testing
    extresHabitacle: 'aigua-corrent,cuina,dutxa,forn,frigorific,llits,microones,nevera,tv,wc',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Mercedes Sprinter Camper completament equipada. <strong>Autocaravana de prova</strong> amb tots els extras disponibles.</p>',
    descripcioAnunciEs: '<p>Mercedes Sprinter Camper completamente equipada. <strong>Autocaravana de prueba</strong> con todos los extras disponibles.</p>',
    descripcioAnunciEn: '<p>Mercedes Sprinter Camper fully equipped. <strong>Test motorhome</strong> with all available extras.</p>',
    descripcioAnunciFr: '<p>Mercedes Sprinter Camper entièrement équipé. <strong>Camping-car de test</strong> avec tous les extras disponibles.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1544918504-75f03508b86c?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613690399151-65ea69478674?w=800&h=600&fit=crop'
    ]
  },
  
  {
    // VEHÍCULO COMERCIAL / FURGONETA
    tipusVehicle: 'vehicle-comercial',
    titolAnunci: 'Ford Transit Custom - Vehículo Comercial Test',
    marcaVehicleComercial: 'Ford',
    modelsVehicleComercial: 'Transit Custom',
    versio: '2.0 TDCi L2H1',
    any: '2021',
    quilometratge: '45000',
    preu: 28000,
    preuAnterior: 32000,
    tipusCombustible: 'Dièsel',
    potenciaCv: '130',
    potenciaKw: '96',
    motor: '2.0 TDCi',
    transmissio: 'Manual',
    estatVehicle: 'ocasio',
    colorExterior: 'Blanc',
    colorInterior: 'Negre',
    consumMixt: '7.2',
    emissions: '165',
    'anunci-actiu': true,
    'anunci-destacat': false,
    venut: false,
    
    // Extras básicos para vehículo comercial
    extresVehicleComercial: 'abs,airbag-conductor,bluetooth,camara-visio-posterior,cruise-control,direccio-assistida,endoll-12v,ganxo-remolc',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Ford Transit Custom ideal per a ús comercial. <strong>Vehícle de prova comercial</strong> amb equipament complet.</p>',
    descripcioAnunciEs: '<p>Ford Transit Custom ideal para uso comercial. <strong>Vehículo de prueba comercial</strong> con equipamiento completo.</p>',
    descripcioAnunciEn: '<p>Ford Transit Custom ideal for commercial use. <strong>Commercial test vehicle</strong> with complete equipment.</p>',
    descripcioAnunciFr: '<p>Ford Transit Custom idéal pour usage commercial. <strong>Véhicule commercial de test</strong> avec équipement complet.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1594736797933-d0d62319c96b?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop'
    ]
  }
];

async function createTestVehiclesViaAPI() {
  try {
    console.log('🚀 Creando vehículos de prueba via API...');
    
    const createdVehicles = [];
    
    for (let i = 0; i < testVehicles.length; i++) {
      const vehicle = testVehicles[i];
      
      try {
        console.log(`\n📝 Creando ${vehicle.tipusVehicle.toUpperCase()}: ${vehicle.titolAnunci}`);
        
        const response = await axios.post(`${API_BASE_URL}/vehicles`, vehicle, {
          auth: ADMIN_AUTH,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.status === 201) {
          const createdVehicle = response.data;
          createdVehicles.push(createdVehicle);
          console.log(`✅ Creado exitosamente - ID: ${createdVehicle.id || createdVehicle._id}`);
          console.log(`   Slug: ${createdVehicle.slug}`);
          console.log(`   Extras: ${vehicle.extresCotxe || vehicle.extresMoto || vehicle.extresAutocaravana || vehicle.extresVehicleComercial || 'Ninguno'}`);
        }
        
      } catch (error) {
        console.error(`❌ Error creando ${vehicle.tipusVehicle}:`, error.response?.data || error.message);
      }
    }
    
    console.log(`\n🎯 Proceso completado. Creados ${createdVehicles.length}/${testVehicles.length} vehículos`);
    console.log('\n📋 Vehículos creados para testing:');
    createdVehicles.forEach(vehicle => {
      console.log(`   • ${vehicle.tipusVehicle?.toUpperCase()}: ${vehicle.titolAnunci}`);
      console.log(`     URL: http://localhost:3000/vehicle/${vehicle.slug}`);
    });
    
    console.log('\n🧪 Ahora puedes:');
    console.log('   - Probar el formulario de edición desde el admin');
    console.log('   - Verificar la página de detalle en el frontend');
    console.log('   - Comprobar la visualización de extras con mapeo');
    console.log('   - Testing completo del sistema');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar el script
createTestVehiclesViaAPI();