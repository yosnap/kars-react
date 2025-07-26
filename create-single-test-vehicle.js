const { MongoClient, ObjectId } = require('mongodb');

const MONGO_URI = 'mongodb://localhost:27017';
const DB_NAME = 'karsad';

// Función para generar slug único
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

// Vehículo de prueba completo - COCHE
const testVehicle = {
  tipusVehicle: 'cotxe',
  titolAnunci: 'BMW Serie 3 320d M Sport - Test Completo',
  slug: generateSlug('BMW Serie 3 320d M Sport - Test Completo'),
  marcaCotxe: 'BMW',
  modelsCotxe: 'Serie 3',
  versio: '320d M Sport',
  any: '2023',
  quilometratge: '15000',
  preu: 45000.0,
  preuAnterior: 50000.0,
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
  
  // INCLUIR TODOS LOS EXTRAS DISPONIBLES (58) + algunos con mapeo
  extresCotxe: 'abs,airbag-conductor,airbag-passatger,airbags-cortina,airbag-genolls,airbags-laterals,alarma,aparcament-control-remot,apple-car-play-android-auto,arrancada-sense-clau-keyless,assist-aparcament,assist-manteniment-carril,assist-manteniment-carril-protec-colisio-lateral,assist-colisio-lateral,assist-colisio-per-abast,assist-marxa-enrere,assist-parada-emergencia,auto-aparcament,avis-angle-mort,alerta-canvi-involuntari-carril,avis-colisio-encreuament,avis-colisio-frontal,avis-per-cansament,avis-sentit-erroni-de-la-marxa,avis-situacions-de-risc,avis-transit-creuat,bluetooth,camera-visio-davant,camara-visio-posterior,camera-visio-periferica,carregador-inalambric,connexio-internet,connexio-mp3-ipod,connexio-telefon,assist-per-canvi-carril,control-clima-distancia,control-descens,control-estabilitat,control-pressio-pneumatics,control-traccio,cruise-control,cruise-control-adaptatiu,deteccio-vianants-ciclistes,direccio-assistida,endoll-12v,endoll220v,endoll-usb,equip-so-alta-fidelitat,fars-xeno,fars-bi-xeno,frenada-automatica-emergencia,ganxo-remolc,gantxo-remolc-retractil,garantia-fabricant,head-up-display,isofix,kit-carrosseria,lector-senyals-de-transit,gps,llandes-alliatge,llums-led,pintura-metallitzada',
  
  // Descripciones multiidioma completas
  descripcioAnunciCa: '<h2>BMW Serie 3 320d M Sport - Vehicle de Prova Complet</h2><p>Aquest BMW Serie 3 és el <strong>vehicle de prova definitiu</strong> per testejar totes les funcionalitats del sistema.</p><ul><li>✅ Tots els extras disponibles</li><li>✅ Totes les traduccions multiidioma</li><li>✅ Imatges de galeria completa</li><li>✅ Tots els camps del formulari</li></ul><p>Inclou fins i tot els extras amb <em>mapeo condicional</em> com GPS, llantas d\'aleació, llums LED i pintura metal·litzada.</p>',
  
  descripcioAnunciEs: '<h2>BMW Serie 3 320d M Sport - Vehículo de Prueba Completo</h2><p>Este BMW Serie 3 es el <strong>vehículo de prueba definitivo</strong> para testear todas las funcionalidades del sistema.</p><ul><li>✅ Todos los extras disponibles</li><li>✅ Todas las traducciones multiidioma</li><li>✅ Imágenes de galería completa</li><li>✅ Todos los campos del formulario</li></ul><p>Incluye incluso los extras con <em>mapeo condicional</em> como GPS, llantas de aleación, luces LED y pintura metalizada.</p>',
  
  descripcioAnunciEn: '<h2>BMW Series 3 320d M Sport - Complete Test Vehicle</h2><p>This BMW Series 3 is the <strong>ultimate test vehicle</strong> for testing all system functionalities.</p><ul><li>✅ All available extras</li><li>✅ All multilingual translations</li><li>✅ Complete gallery images</li><li>✅ All form fields</li></ul><p>Includes even the extras with <em>conditional mapping</em> like GPS, alloy wheels, LED lights and metallic paint.</p>',
  
  descripcioAnunciFr: '<h2>BMW Série 3 320d M Sport - Véhicule de Test Complet</h2><p>Cette BMW Série 3 est le <strong>véhicule de test ultime</strong> pour tester toutes les fonctionnalités du système.</p><ul><li>✅ Tous les extras disponibles</li><li>✅ Toutes les traductions multilingues</li><li>✅ Images de galerie complètes</li><li>✅ Tous les champs du formulaire</li></ul><p>Inclut même les extras avec <em>mappage conditionnel</em> comme GPS, jantes alliage, éclairage LED et peinture métallisée.</p>',
  
  // Imágenes de ejemplo
  imatgeDestacadaUrl: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop',
  galeriaVehicleUrls: [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop'
  ],
  
  author_id: '507f1f77bcf86cd799439011',
  created_at: new Date(),
  updated_at: new Date()
};

async function createTestVehicle() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    console.log('📁 Conectado a MongoDB');
    
    const db = client.db(DB_NAME);
    const collection = db.collection('Vehicle');
    
    // Verificar si ya existe un vehículo con este slug
    const existingVehicle = await collection.findOne({ slug: testVehicle.slug });
    if (existingVehicle) {
      // Agregar timestamp al slug para hacerlo único
      testVehicle.slug = `${testVehicle.slug}-${Date.now()}`;
      console.log(`🔄 Slug modificado para evitar duplicados: ${testVehicle.slug}`);
    }
    
    // Insertar el vehículo
    const result = await collection.insertOne(testVehicle);
    
    console.log('✅ Vehículo de prueba creado exitosamente:');
    console.log(`   ID: ${result.insertedId}`);
    console.log(`   Tipo: ${testVehicle.tipusVehicle.toUpperCase()}`);
    console.log(`   Título: ${testVehicle.titolAnunci}`);
    console.log(`   Slug: ${testVehicle.slug}`);
    console.log(`   URL: http://localhost:3000/vehicle/${testVehicle.slug}`);
    console.log('');
    console.log('📊 Datos incluidos:');
    console.log(`   • Extras: ${testVehicle.extresCotxe.split(',').length} extras`);
    console.log(`   • Descripciones: 4 idiomas (ca, es, en, fr)`);
    console.log(`   • Imágenes: 1 destacada + ${testVehicle.galeriaVehicleUrls.length} galería`);
    console.log(`   • Precio: ${testVehicle.preu}€ (antes: ${testVehicle.preuAnterior}€)`);
    console.log('');
    console.log('🧪 Testing disponible:');
    console.log('   ✅ Formulario de edición con todos los campos populados');
    console.log('   ✅ Página de detalle con extras mapeados correctamente');
    console.log('   ✅ Extras con mapeo: gps, llandes-alliatge, llums-led, pintura-metallitzada');
    console.log('   ✅ Traducciones multiidioma completas');
    console.log('   ✅ Galería de imágenes funcional');
    
  } catch (error) {
    console.error('❌ Error creando vehículo de prueba:', error);
  } finally {
    await client.close();
    console.log('📁 Conexión MongoDB cerrada');
  }
}

// Ejecutar el script
createTestVehicle();