const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[àáâäã]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[·]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// AUTOCARAVANA DE PRUEBA COMPLETA
const testAutocaravana = {
  tipusVehicle: 'autocaravana-camper',
  titolAnunci: 'Mercedes Sprinter Camper - Autocaravana Test Completa',
  slug: generateSlug('Mercedes Sprinter Camper - Autocaravana Test Completa'),
  marcaAutocaravana: 'Mercedes',
  modelsAutocaravana: 'Sprinter',
  versio: '319 CDI 4x4',
  any: '2022',
  quilometratge: '25000',
  preu: 85000.0,
  preuAnterior: 90000.0,
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
  
  // TODOS LOS EXTRAS DE AUTOCARAVANA (51)
  extresAutocaravana: 'abs,aire-condicionat-cabina,aire-condicionat-habitacle,airbag-acompanyant,airbag-conductor,alarma,antena-parabolica,arara-remolc,baca,banys-armaris,bluetooth,boiler,calefaccio-estacionaria,calefaccio-gas,calefaccio-gasoil,camera-marxa-enrere,canvi-automatic,clausor-centralitzat,consola-central,control-estabilitat,control-traccio,convertidor-corrent,cruise-control,direccio-assistida,dutxa,escalfa-plats,finestres-dobles,forn,garatge,generador,gps,lavabo,llit-capcer,llit-elevable,microones,mosquiters,nevera,panells-solars,portabicicletes,porta-esquis,radio-cd,seients-giratoris,sostre-elevable,suport-tv,taulell-extraible,tenda,tv,wc,wc-quimic,vidres-electrics,volant-multifuncio',
  
  // TODOS LOS EXTRAS DE HABITÁCULO (17)
  extresHabitacle: 'aigua-corrent,antena-satelit,antena-tv,claraboies,congelador,cuina,detector-fums,dutxa,forn,frigorific,llits,microones,mosquitera,nevera,tendall,tv,wc',
  
  // Descripciones multiidioma completas
  descripcioAnunciCa: '<h2>Mercedes Sprinter Camper - Autocaravana Completa</h2><p>Una <strong>autocaravana de luxe completament equipada</strong> per a aventures familiars.</p><ul><li>🏠 Habitacle complet amb tots els extres</li><li>🚿 Bany amb dutxa i WC</li><li>🍳 Cuina equipada amb forn i microones</li><li>❄️ Nevera i congelador</li><li>📺 TV i antena parabòlica</li><li>⚡ Panells solars i generador</li></ul><p>Perfecta per a <em>viatges llargs amb tota la comoditat</em>!</p>',
  
  descripcioAnunciEs: '<h2>Mercedes Sprinter Camper - Autocaravana Completa</h2><p>Una <strong>autocaravana de lujo completamente equipada</strong> para aventuras familiares.</p><ul><li>🏠 Habitáculo completo con todos los extras</li><li>🚿 Baño con ducha y WC</li><li>🍳 Cocina equipada con horno y microondas</li><li>❄️ Nevera y congelador</li><li>📺 TV y antena parabólica</li><li>⚡ Paneles solares y generador</li></ul><p>Perfecta para <em>viajes largos con toda la comodidad</em>!</p>',
  
  descripcioAnunciEn: '<h2>Mercedes Sprinter Camper - Complete Motorhome</h2><p>A <strong>fully equipped luxury motorhome</strong> for family adventures.</p><ul><li>🏠 Complete living area with all extras</li><li>🚿 Bathroom with shower and WC</li><li>🍳 Kitchen equipped with oven and microwave</li><li>❄️ Refrigerator and freezer</li><li>📺 TV and satellite antenna</li><li>⚡ Solar panels and generator</li></ul><p>Perfect for <em>long trips with all comfort</em>!</p>',
  
  descripcioAnunciFr: '<h2>Mercedes Sprinter Camper - Camping-car Complet</h2><p>Un <strong>camping-car de luxe entièrement équipé</strong> pour les aventures familiales.</p><ul><li>🏠 Habitacle complet avec tous les extras</li><li>🚿 Salle de bain avec douche et WC</li><li>🍳 Cuisine équipée avec four et micro-ondes</li><li>❄️ Réfrigérateur et congélateur</li><li>📺 TV et antenne parabolique</li><li>⚡ Panneaux solaires et générateur</li></ul><p>Parfait pour <em>les longs voyages avec tout le confort</em>!</p>',
  
  // Imágenes de ejemplo
  imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1544918504-75f03508b86c?w=800&h=600&fit=crop',
  galeriaVehicleUrls: [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1613690399151-65ea69478674?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1615719413546-198b45b893e4?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1562580624-d1b8c3f23c80?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1578650699798-ec5b90e5fb40?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1607870849095-6cdbd25c4b6f?w=800&h=600&fit=crop'
  ],
  
  author_id: '507f1f77bcf86cd799439011',
  created_at: new Date(),
  updated_at: new Date()
};

async function createTestAutocaravana() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Verificar si ya existe
    const existingVehicle = await collection.findOne({ slug: testAutocaravana.slug });
    if (existingVehicle) {
      testAutocaravana.slug = `${testAutocaravana.slug}-${Date.now()}`;
    }
    
    const result = await collection.insertOne(testAutocaravana);
    
    console.log('🚐 AUTOCARAVANA de prueba creada exitosamente:');
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Título: ${testAutocaravana.titolAnunci}`);
    console.log(`   Slug: ${testAutocaravana.slug}`);
    console.log(`   Extras Autocaravana: ${testAutocaravana.extresAutocaravana.split(',').length} extras`);
    console.log(`   Extras Habitáculo: ${testAutocaravana.extresHabitacle.split(',').length} extras`);
    console.log(`   URL: http://localhost:3000/vehicle/${testAutocaravana.slug}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestAutocaravana();