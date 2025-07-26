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

// MOTO DE PRUEBA COMPLETA
const testMoto = {
  tipusVehicle: 'moto',
  titolAnunci: 'Yamaha MT-09 SP - Moto Test Completa',
  slug: generateSlug('Yamaha MT-09 SP - Moto Test Completa'),
  marcaMoto: 'Yamaha',
  modelsMoto: 'MT-09',
  versio: 'SP',
  any: '2023',
  quilometratge: '8000',
  preu: 12000.0,
  preuAnterior: 13500.0,
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
  
  // TODOS LOS EXTRAS DE MOTO (47)
  extresMoto: 'abs,accesoris-originals,airbag,alarma,arrancada-electrica,arrancada-sense-clau,assistent-aparcament,assistent-arrancada-en-pendent,assist-canvi-marxa,assist-frenada-emergencia,bandes-calefactores-pneumatics,bluetooth,caixa-eines,canvi-automatic,canvi-rapid,carregador-usb,cavallet-central,cavallet-lateral,connexio-smartphone,control-antipatinatge,control-creuer,control-creuer-adaptatiu,control-descens,control-estabilitat,control-llancament,control-pressio-pneumatics,endoll-12v,escape-esportiu,escape-regulable,far-led,frens-radials,gps,llandes-aleacio,llandes-fibra-carboni,maletes-laterals,maleta-posterior,maniguets-calefactables,modes-conduccio,pantalla-color,pantalla-tft,paravents,paravents-ajustable,presa-corrent-accessoris,proteccio-motor,seient-calefactable,sistema-audio,suspensio-ajustable',
  
  // Descripciones multiidioma completas
  descripcioAnunciCa: '<h2>Yamaha MT-09 SP - Moto de Prova Completa</h2><p>Aquesta Yamaha MT-09 SP és la <strong>moto de testing perfecta</strong> amb tots els extras disponibles.</p><ul><li>🏍️ 847cc de potència pura</li><li>⚡ Tots els sistemes electrònics</li><li>🔧 Tots els extras de moto (47)</li><li>📱 Connectivitat completa</li></ul><p>Inclou <em>GPS, frens radials, suspensió ajustable</em> i molt més!</p>',
  
  descripcioAnunciEs: '<h2>Yamaha MT-09 SP - Moto de Prueba Completa</h2><p>Esta Yamaha MT-09 SP es la <strong>moto de testing perfecta</strong> con todos los extras disponibles.</p><ul><li>🏍️ 847cc de potencia pura</li><li>⚡ Todos los sistemas electrónicos</li><li>🔧 Todos los extras de moto (47)</li><li>📱 Conectividad completa</li></ul><p>Incluye <em>GPS, frenos radiales, suspensión ajustable</em> y mucho más!</p>',
  
  descripcioAnunciEn: '<h2>Yamaha MT-09 SP - Complete Test Motorcycle</h2><p>This Yamaha MT-09 SP is the <strong>perfect testing motorcycle</strong> with all available extras.</p><ul><li>🏍️ 847cc of pure power</li><li>⚡ All electronic systems</li><li>🔧 All motorcycle extras (47)</li><li>📱 Complete connectivity</li></ul><p>Includes <em>GPS, radial brakes, adjustable suspension</em> and much more!</p>',
  
  descripcioAnunciFr: '<h2>Yamaha MT-09 SP - Moto de Test Complète</h2><p>Cette Yamaha MT-09 SP est la <strong>moto de test parfaite</strong> avec tous les extras disponibles.</p><ul><li>🏍️ 847cc de puissance pure</li><li>⚡ Tous les systèmes électroniques</li><li>🔧 Tous les extras moto (47)</li><li>📱 Connectivité complète</li></ul><p>Inclut <em>GPS, freins radiaux, suspension réglable</em> et bien plus!</p>',
  
  // Imágenes de ejemplo
  imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=600&fit=crop',
  galeriaVehicleUrls: [
    'https://images.unsplash.com/photo-1449426468159-d96dbf08f19f?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1471466054146-e71beb31de2d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1517654132271-10e8825a50ca?w=800&h=600&fit=crop'
  ],
  
  author_id: '507f1f77bcf86cd799439011',
  created_at: new Date(),
  updated_at: new Date()
};

async function createTestMoto() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Verificar si ya existe
    const existingVehicle = await collection.findOne({ slug: testMoto.slug });
    if (existingVehicle) {
      testMoto.slug = `${testMoto.slug}-${Date.now()}`;
    }
    
    const result = await collection.insertOne(testMoto);
    
    console.log('🏍️ MOTO de prueba creada exitosamente:');
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Título: ${testMoto.titolAnunci}`);
    console.log(`   Slug: ${testMoto.slug}`);
    console.log(`   Extras: ${testMoto.extresMoto.split(',').length} extras`);
    console.log(`   URL: http://localhost:3000/vehicle/${testMoto.slug}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestMoto();