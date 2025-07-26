const { MongoClient } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

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
    
    // Extras de coche - todos los 58
    extresCotxe: 'abs,airbag-conductor,airbag-passatger,airbags-cortina,airbag-genolls,airbags-laterals,alarma,aparcament-control-remot,apple-car-play-android-auto,arrancada-sense-clau-keyless,assist-aparcament,assist-manteniment-carril,assist-manteniment-carril-protec-colisio-lateral,assist-colisio-lateral,assist-colisio-per-abast,assist-marxa-enrere,assist-parada-emergencia,auto-aparcament,avis-angle-mort,alerta-canvi-involuntari-carril,avis-colisio-encreuament,avis-colisio-frontal,avis-per-cansament,avis-sentit-erroni-de-la-marxa,avis-situacions-de-risc,avis-transit-creuat,bluetooth,camera-visio-davant,camara-visio-posterior,camera-visio-periferica,carregador-inalambric,connexio-internet,connexio-mp3-ipod,connexio-telefon,assist-per-canvi-carril,control-clima-distancia,control-descens,control-estabilitat,control-pressio-pneumatics,control-traccio,cruise-control,cruise-control-adaptatiu,deteccio-vianants-ciclistes,direccio-assistida,endoll-12v,endoll220v,endoll-usb,equip-so-alta-fidelitat,fars-xeno,fars-bi-xeno,frenada-automatica-emergencia,ganxo-remolc,gantxo-remolc-retractil,garantia-fabricant,head-up-display,isofix,kit-carrosseria,lector-senyals-de-transit',
    
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
    ],
    
    author_id: '507f1f77bcf86cd799439011',
    created_at: new Date(),
    updated_at: new Date()
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
    
    // Extras de moto - todos los 47
    extresMoto: 'abs,accesoris-originals,airbag,alarma,arrancada-electrica,arrancada-sense-clau,assistent-aparcament,assistent-arrancada-en-pendent,assist-canvi-marxa,assist-frenada-emergencia,bandes-calefactores-pneumatics,bluetooth,caixa-eines,canvi-automatic,canvi-rapid,carregador-usb,cavallet-central,cavallet-lateral,connexio-smartphone,control-antipatinatge,control-creuer,control-creuer-adaptatiu,control-descens,control-estabilitat,control-llancament,control-pressio-pneumatics,endoll-12v,escape-esportiu,escape-regulable,far-led,frens-radials,gps,llandes-aleacio,llandes-fibra-carboni,maletes-laterals,maleta-posterior,maniguets-calefactables,modes-conduccio,pantalla-color,pantalla-tft,paravents,paravents-ajustable,presa-corrent-accessoris,proteccio-motor,seient-calefactable,sistema-audio,suspensio-ajustable',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Yamaha MT-09 SP completament equipada per testing. <strong>Moto de prova</strong> amb tots els extras.</p><p>Perfecta per verificar la funcionalitat del formulari i la visualització.</p>',
    descripcioAnunciEs: '<p>Yamaha MT-09 SP completamente equipada para testing. <strong>Moto de prueba</strong> con todos los extras.</p><p>Perfecta para verificar la funcionalidad del formulario y la visualización.</p>',
    descripcioAnunciEn: '<p>Yamaha MT-09 SP fully equipped for testing. <strong>Test motorcycle</strong> with all extras.</p><p>Perfect for verifying form functionality and display.</p>',
    descripcioAnunciFr: '<p>Yamaha MT-09 SP entièrement équipée pour les tests. <strong>Moto de test</strong> avec tous les extras.</p><p>Parfaite pour vérifier la fonctionnalité du formulaire et l\'affichage.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1471466054146-e71beb31de2d?w=800&h=600&fit=crop'
    ],
    
    author_id: '507f1f77bcf86cd799439011',
    created_at: new Date(),
    updated_at: new Date()
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
    
    // Extras de autocaravana - todos los 51
    extresAutocaravana: 'abs,aire-condicionat-cabina,aire-condicionat-habitacle,airbag-acompanyant,airbag-conductor,alarma,antena-parabolica,arara-remolc,baca,banys-armaris,bluetooth,boiler,calefaccio-estacionaria,calefaccio-gas,calefaccio-gasoil,camera-marxa-enrere,canvi-automatic,clausor-centralitzat,consola-central,control-estabilitat,control-traccio,convertidor-corrent,cruise-control,direccio-assistida,dutxa,escalfa-plats,finestres-dobles,forn,garatge,generador,gps,lavabo,llit-capcer,llit-elevable,microones,mosquiters,nevera,panells-solars,portabicicletes,porta-esquis,radio-cd,seients-giratoris,sostre-elevable,suport-tv,taulell-extraible,tenda,tv,wc,wc-quimic,vidres-electrics,volant-multifuncio',
    
    // Extras de habitáculo - todos los 17
    extresHabitacle: 'aigua-corrent,antena-satelit,antena-tv,claraboies,congelador,cuina,detector-fums,dutxa,forn,frigorific,llits,microones,mosquitera,nevera,tendall,tv,wc',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Mercedes Sprinter Camper completament equipada. <strong>Autocaravana de prova</strong> amb tots els extras disponibles.</p><p>Inclou tots els sistemes d\'habitacle i carrosseria per testing complet.</p>',
    descripcioAnunciEs: '<p>Mercedes Sprinter Camper completamente equipada. <strong>Autocaravana de prueba</strong> con todos los extras disponibles.</p><p>Incluye todos los sistemas de habitáculo y carrocería para testing completo.</p>',
    descripcioAnunciEn: '<p>Mercedes Sprinter Camper fully equipped. <strong>Test motorhome</strong> with all available extras.</p><p>Includes all cabin and body systems for complete testing.</p>',
    descripcioAnunciFr: '<p>Mercedes Sprinter Camper entièrement équipé. <strong>Camping-car de test</strong> avec tous les extras disponibles.</p><p>Inclut tous les systèmes d\'habitacle et de carrosserie pour un test complet.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1544918504-75f03508b86c?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1613690399151-65ea69478674?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1615719413546-198b45b893e4?w=800&h=600&fit=crop'
    ],
    
    author_id: '507f1f77bcf86cd799439011',
    created_at: new Date(),
    updated_at: new Date()
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
    longitudVehicleComercial: '5.34',
    amplarioVehicleComercial: '2.06',
    alturaVehicleComercial: '1.97',
    pesVehicleComercial: '2800',
    volumenCarga: '8.3',
    'anunci-actiu': true,
    'anunci-destacat': false,
    venut: false,
    
    // Extras básicos para vehículo comercial
    extresVehicleComercial: 'abs,airbag-conductor,airbag-passatger,alarma,bluetooth,camara-visio-posterior,control-estabilitat,control-traccio,cruise-control,direccio-assistida,endoll-12v,ganxo-remolc,vidres-electrics',
    
    // Descripciones multiidioma
    descripcioAnunciCa: '<p>Ford Transit Custom ideal per a ús comercial. <strong>Vehícle de prova comercial</strong> amb equipament complet.</p><p>Perfecte per testing de formularis de vehicles comercials.</p>',
    descripcioAnunciEs: '<p>Ford Transit Custom ideal para uso comercial. <strong>Vehículo de prueba comercial</strong> con equipamiento completo.</p><p>Perfecto para testing de formularios de vehículos comerciales.</p>',
    descripcioAnunciEn: '<p>Ford Transit Custom ideal for commercial use. <strong>Commercial test vehicle</strong> with complete equipment.</p><p>Perfect for testing commercial vehicle forms.</p>',
    descripcioAnunciFr: '<p>Ford Transit Custom idéal pour usage commercial. <strong>Véhicule commercial de test</strong> avec équipement complet.</p><p>Parfait pour tester les formulaires de véhicules commerciaux.</p>',
    
    // Imágenes de ejemplo
    imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1594736797933-d0d62319c96b?w=800&h=600&fit=crop',
    galeriaVehicleUrls: [
      'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop'
    ],
    
    author_id: '507f1f77bcf86cd799439011',
    created_at: new Date(),
    updated_at: new Date()
  }
];

async function createTestVehicles() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Eliminar vehículos de prueba anteriores
    const deleteResult = await collection.deleteMany({
      titolAnunci: { $regex: /Test|Prueba|Prova/ }
    });
    console.log(`🗑️ Eliminados ${deleteResult.deletedCount} vehículos de prueba anteriores`);
    
    // Insertar nuevos vehículos de prueba
    const insertResult = await collection.insertMany(testVehicles);
    console.log(`✅ Creados ${insertResult.insertedCount} vehículos de prueba completos:`);
    
    testVehicles.forEach((vehicle, index) => {
      const id = insertResult.insertedIds[index];
      console.log(`   • ${vehicle.tipusVehicle.toUpperCase()}: ${vehicle.titolAnunci}`);
      console.log(`     ID: ${id}`);
      console.log(`     Extras: ${vehicle.extresCotxe || vehicle.extresMoto || vehicle.extresAutocaravana || vehicle.extresVehicleComercial || ''}`);
      console.log('');
    });
    
    console.log('🎯 Vehículos de prueba creados correctamente');
    console.log('📋 Puedes usar estos vehículos para:');
    console.log('   - Probar el formulario de edición');
    console.log('   - Verificar la página de detalle');
    console.log('   - Comprobar la visualización de extras');
    console.log('   - Testing completo del sistema');
    
  } catch (error) {
    console.error('❌ Error creando vehículos de prueba:', error);
  } finally {
    await client.close();
    console.log('📁 Conexión MongoDB cerrada');
  }
}

// Ejecutar el script
createTestVehicles();