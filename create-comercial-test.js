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

// VEHÍCULO COMERCIAL DE PRUEBA
const testComercial = {
  tipusVehicle: 'vehicle-comercial',
  titolAnunci: 'Ford Transit Custom - Vehículo Comercial Test',
  slug: generateSlug('Ford Transit Custom - Vehículo Comercial Test'),
  marcaVehicleComercial: 'Ford',
  modelsVehicleComercial: 'Transit Custom',
  versio: '2.0 TDCi L2H1',
  any: '2021',
  quilometratge: '45000',
  preu: 28000.0,
  preuAnterior: 32000.0,
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
  
  // Extras básicos para vehículo comercial usando extras de coche
  extresVehicleComercial: 'abs,airbag-conductor,airbag-passatger,alarma,bluetooth,camara-visio-posterior,control-estabilitat,control-traccio,cruise-control,direccio-assistida,endoll-12v,ganxo-remolc,vidres-electrics,endoll220v,equip-so-alta-fidelitat',
  
  // Descripciones multiidioma completas
  descripcioAnunciCa: '<h2>Ford Transit Custom - Vehicle Comercial Perfect</h2><p>Una <strong>furgoneta comercial ideal</strong> per a empreses i professionals.</p><ul><li>📦 8.3m³ de volum de càrrega</li><li>🔧 Equipament comercial complet</li><li>📱 Connectivitat Bluetooth</li><li>📹 Càmera de visió posterior</li><li>⚡ Endolls 12V i 220V</li><li>🎵 Equip de so d\'alta fidelitat</li></ul><p>Perfecte per a <em>distribució, transport i treballs professionals</em>!</p>',
  
  descripcioAnunciEs: '<h2>Ford Transit Custom - Vehículo Comercial Perfecto</h2><p>Una <strong>furgoneta comercial ideal</strong> para empresas y profesionales.</p><ul><li>📦 8.3m³ de volumen de carga</li><li>🔧 Equipamiento comercial completo</li><li>📱 Conectividad Bluetooth</li><li>📹 Cámara de visión posterior</li><li>⚡ Enchufes 12V y 220V</li><li>🎵 Equipo de sonido de alta fidelidad</li></ul><p>Perfecto para <em>distribución, transporte y trabajos profesionales</em>!</p>',
  
  descripcioAnunciEn: '<h2>Ford Transit Custom - Perfect Commercial Vehicle</h2><p>An <strong>ideal commercial van</strong> for businesses and professionals.</p><ul><li>📦 8.3m³ cargo volume</li><li>🔧 Complete commercial equipment</li><li>📱 Bluetooth connectivity</li><li>📹 Rear view camera</li><li>⚡ 12V and 220V sockets</li><li>🎵 High fidelity sound system</li></ul><p>Perfect for <em>distribution, transport and professional work</em>!</p>',
  
  descripcioAnunciFr: '<h2>Ford Transit Custom - Véhicule Commercial Parfait</h2><p>Un <strong>fourgon commercial idéal</strong> pour les entreprises et professionnels.</p><ul><li>📦 8.3m³ de volume de chargement</li><li>🔧 Équipement commercial complet</li><li>📱 Connectivité Bluetooth</li><li>📹 Caméra de vision arrière</li><li>⚡ Prises 12V et 220V</li><li>🎵 Système audio haute fidélité</li></ul><p>Parfait pour <em>la distribution, le transport et le travail professionnel</em>!</p>',
  
  // Imágenes de ejemplo
  imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1594736797933-d0d62319c96b?w=800&h=600&fit=crop',
  galeriaVehicleUrls: [
    'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605624956464-30cd2c8fdf78?w=800&h=600&fit=crop'
  ],
  
  author_id: '507f1f77bcf86cd799439011',
  created_at: new Date(),
  updated_at: new Date()
};

async function createTestComercial() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Verificar si ya existe
    const existingVehicle = await collection.findOne({ slug: testComercial.slug });
    if (existingVehicle) {
      testComercial.slug = `${testComercial.slug}-${Date.now()}`;
    }
    
    const result = await collection.insertOne(testComercial);
    
    console.log('🚐 VEHÍCULO COMERCIAL de prueba creado exitosamente:');
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Título: ${testComercial.titolAnunci}`);
    console.log(`   Slug: ${testComercial.slug}`);
    console.log(`   Extras: ${testComercial.extresVehicleComercial.split(',').length} extras`);
    console.log(`   URL: http://localhost:3000/vehicle/${testComercial.slug}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

createTestComercial();