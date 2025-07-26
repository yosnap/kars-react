const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

// Vehículo de prueba completo: COCHE
const testCoche = {
  // Información básica
  titolAnunci: "BMW M3 Competition - Coche Test Completo",
  descripcioAnunci: "<p>BMW M3 Competition con todos los extras disponibles. Vehículo de prueba para verificar formulario de edición y página de detalle.</p><p>Incluye equipamiento completo y todas las especificaciones técnicas para testing.</p>",
  tipusVehicle: "cotxe",
  slug: "bmw-m3-competition-coche-test-completo",
  
  // Estado del anuncio
  anunciActiu: true,
  anunciDestacat: 1,
  venut: false,
  
  // Marca y modelo
  marcaCotxe: "bmw",
  modelsCotxe: "m3",
  versio: "Competition",
  
  // Especificaciones técnicas
  any: "2024",
  quilometratge: "5000",
  estatVehicle: "seminou",
  tipusCombustible: "benzina",
  tipusCanvi: "auto-sequencial",
  cilindrada: "2993",
  potenciaCv: "510",
  traccio: "posterior",
  emissionsVehicle: "EURO-6",
  
  // Características físicas
  colorVehicle: "blau",
  placesCotxe: "4",
  portesCotxe: "4",
  numeroMaletersCotxe: "1",
  capacitatMaletersCotxe: "480",
  
  // Performance
  acceleracio0100Cotxe: "3.9",
  velocitatMaxima: "250",
  consumMixt: "10.8",
  emissionsCo2: "246",
  
  // Extras completos para coche (usando la lista de 58 elementos)
  extresCotxe: [
    "abs", "airbag-conductor", "airbag-passatger", "airbags-cortina", "airbags-laterals",
    "alarma", "apple-car-play-android-auto", "arrancada-sense-clau-keyless", "assist-aparcament",
    "assist-marxa-enrere", "avis-angle-mort", "bluetooth", "camera-visio-davant", "camara-visio-posterior",
    "connexio-internet", "connexio-mp3-ipod", "connexio-telefon", "control-per-canvi-carril",
    "control-descens", "control-estabilitat", "control-traccio", "cruise-control", "direccio-assistida",
    "endoll-usb", "equip-so-alta-fidelitat", "garantia-fabricant", "llandes-alliatge", "llums-adaptatives",
    "llums-anti-boira", "llums-de-dia", "llums-led", "navegador-gps", "ordinador-de-bord",
    "pintura-metallitzada", "radio-cd", "retrovisors-calefactables", "retrovisors-electrics",
    "seients-calefactables", "seients-electrics", "seients-esportius", "sensors-aparcament",
    "sensors-anti-colisio", "sensors-llums", "sensors-pluja", "sostre-obert", "sostre-panoramic",
    "start-stop", "tanca-centralitzada", "vidres-tintats", "vidres-electrics", "volant-multifuncio"
  ],
  
  // Precios
  preu: 89900,
  preuAntic: "95000",
  
  // Imágenes
  imatgeDestacadaUrl: "https://example.com/bmw-m3-main.jpg",
  galeriaVehicleUrls: [
    "https://example.com/bmw-m3-1.jpg",
    "https://example.com/bmw-m3-2.jpg",
    "https://example.com/bmw-m3-3.jpg"
  ],
  
  // Información adicional
  nombrePropietaris: "1",
  dataCreacio: new Date().toISOString(),
  professionalId: "113"
};

// Vehículo de prueba completo: MOTO
const testMoto = {
  // Información básica
  titolAnunci: "Yamaha MT-09 SP - Moto Test Completa",
  descripcioAnunci: "<p>Yamaha MT-09 SP con todos los extras de moto disponibles. Vehículo de prueba para verificar formulario de edición y página de detalle.</p><p>Equipamiento completo para testing de funcionalidades.</p>",
  tipusVehicle: "moto",
  slug: "yamaha-mt-09-sp-moto-test-completa",
  
  // Estado del anuncio
  anunciActiu: true,
  anunciDestacat: 1,
  venut: false,
  
  // Marca y modelo
  marcaMoto: "yamaha",
  modelsMoto: "mt-09",
  versio: "SP",
  
  // Especificaciones técnicas
  any: "2024",
  quilometratge: "2500",
  estatVehicle: "seminou",
  tipusCombustible: "benzina",
  tipusCanviMoto: "manual",
  cilindrada: "889",
  potenciaCv: "119",
  
  // Características físicas
  colorVehicle: "negre",
  placesMoto: "2",
  
  // Performance
  acceleracio0100Cotxe: "3.1",
  velocitatMaxima: "220",
  consumMixt: "5.6",
  
  // Extras completos para moto (usando la lista de 47 elementos)
  extresMoto: [
    "abs-moto", "alarma-moto", "arrancada-electrica", "bluetooth-moto", "carenatge-esportiu",
    "cavallet-central", "cavallet-lateral", "claxon-potent", "control-traccio-moto", "cruise-control-moto",
    "deflector-vent", "direccio-assistida-moto", "endolls-auxiliars", "equip-so-moto", "esmorteidor-direccio",
    "fars-led-moto", "fre-motor", "guardabarros-davant", "guardabarros-darrere", "intermitents-led",
    "kit-carrosseria-moto", "llandes-fibra-carboni", "llums-adaptatives-moto", "llums-anti-boira-moto",
    "llums-posicio-led", "maleta-lateral", "maleta-superior", "navegador-gps-moto", "ordinador-bord-moto",
    "para-motor", "pilot-led", "pintura-personalitzada", "pneumatics-esportius", "proteccio-motor",
    "proteccio-radiador", "quickshifter", "retrovisors-esportius", "seient-esportiu-moto", "sensors-angle-mort-moto",
    "sistema-escape-esportiu", "sistema-suspenio-regulable", "suport-movil", "tanca-antifurt", "velocimetre-digital",
    "windscreen-regulable", "xenon-moto"
  ],
  
  // Precios
  preu: 12500,
  preuAntic: "13200",
  
  // Imágenes
  imatgeDestacadaUrl: "https://example.com/yamaha-mt09-main.jpg",
  galeriaVehicleUrls: [
    "https://example.com/yamaha-mt09-1.jpg",
    "https://example.com/yamaha-mt09-2.jpg",
    "https://example.com/yamaha-mt09-3.jpg"
  ],
  
  // Información adicional
  nombrePropietaris: "1",
  dataCreacio: new Date().toISOString(),
  professionalId: "113"
};

// Vehículo de prueba completo: AUTOCARAVANA
const testAutocaravana = {
  // Información básica
  titolAnunci: "Hymer B588 - Autocaravana Test Completa",
  descripcioAnunci: "<p>Hymer B588 con todos los extras de autocaravana disponibles. Vehículo de prueba para verificar formulario de edición y página de detalle.</p><p>Equipamiento completo para camping y viajes.</p>",
  tipusVehicle: "autocaravana-camper",
  slug: "hymer-b588-autocaravana-test-completa",
  
  // Estado del anuncio
  anunciActiu: true,
  anunciDestacat: 1,
  venut: false,
  
  // Marca y modelo (usan marcas de coche temporalmente)
  marcaCotxe: "hymer",
  modelsCotxe: "b588",
  versio: "Dynamic Line",
  
  // Especificaciones técnicas
  any: "2023",
  quilometratge: "8500",
  estatVehicle: "ocasio",
  tipusCombustible: "diesel",
  tipusCanvi: "manual",
  cilindrada: "2287",
  potenciaCv: "140",
  
  // Características físicas
  colorVehicle: "blanc",
  capacitatTotalL: "3500",
  
  // Extras completos para autocaravana (usando la lista de 51 elementos)
  extresAutocaravana: [
    "aire-acondicionat-autocaravana", "alarma-autocaravana", "antena-tv-autocaravana", "awning-electric",
    "awning-manual", "baguls-exteriors", "banqueta-exterior", "bici-rack", "bomba-aigua-pressio",
    "boiler-aigua-calenta", "calefaccio-aire", "calefaccio-aigua", "camera-marxa-enrere-autocaravana",
    "dipòsit-aigües-grises", "dipòsit-aigües-netes", "dutxa-exterior", "escaló-electric", "forn-microones",
    "frigorífic-autocaravana", "generador-electric", "instal-lacio-gas", "inversors-12v-220v", "kit-nivelacio",
    "llits-individuals", "llit-matrimoni", "marcador-nivell-dipòsits", "mosquiteres", "parabòlica-tv",
    "plaques-solars", "porta-bicicletes-autocaravana", "preinstal-lacio-alarma", "regulador-càrrega-solar",
    "sistema-entreteniment", "sistema-navegacio-autocaravana", "sistema-vigilancia", "taula-exterior",
    "taula-interior-extensible", "tendal-lateral", "terra-radiant", "toldo-electric", "tv-autocaravana",
    "ventiladors-sostre", "wc-químic", "wifi-autocaravana", "kit-camping", "cuina-completa", 
    "nevera-congelador", "rentaplats-autocaravana", "sistema-agua-caliente", "climatitzador-autocaravana",
    "estabilitzadors-autocaravana", "kit-seguretat-autocaravana"
  ],
  
  // Precios
  preu: 78500,
  preuAntic: "82000",
  
  // Imágenes
  imatgeDestacadaUrl: "https://example.com/hymer-b588-main.jpg",
  galeriaVehicleUrls: [
    "https://example.com/hymer-b588-1.jpg",
    "https://example.com/hymer-b588-2.jpg",
    "https://example.com/hymer-b588-3.jpg"
  ],
  
  // Información adicional
  nombrePropietaris: "1",
  dataCreacio: new Date().toISOString(),
  professionalId: "113"
};

// Vehículo de prueba completo: VEHÍCULO COMERCIAL
const testComercial = {
  // Información básica
  titolAnunci: "Mercedes Sprinter 319 CDI - Vehículo Comercial Test",
  descripcioAnunci: "<p>Mercedes Sprinter 319 CDI vehículo comercial completo para testing. Verificación de formulario de edición y página de detalle.</p><p>Equipamiento profesional completo.</p>",
  tipusVehicle: "vehicle-comercial",
  slug: "mercedes-sprinter-319-cdi-comercial-test",
  
  // Estado del anuncio
  anunciActiu: true,
  anunciDestacat: 1,
  venut: false,
  
  // Marca y modelo (usan marcas de coche temporalmente)
  marcaCotxe: "mercedes-benz",
  modelsCotxe: "sprinter",
  versio: "319 CDI",
  
  // Especificaciones técnicas
  any: "2023",
  quilometratge: "15000",
  estatVehicle: "ocasio",
  tipusCombustible: "diesel",
  tipusCanvi: "manual",
  cilindrada: "2143",
  potenciaCv: "190",
  
  // Características físicas
  colorVehicle: "blanc",
  capacitatTotalL: "3500",
  
  // Extras para habitáculo (usando la lista de 17 elementos)
  extresHabitacle: [
    "aire-acondicionat-habitacle", "calefaccio-auxiliar-habitacle", "separacio-habitacle",
    "sistema-navegacio-comercial", "radio-comercial", "bluetooth-comercial", "endolls-12v-habitacle",
    "il-luminacio-led-habitacle", "seients-giratoris", "taula-treball-habitacle", "nevera-portàtil",
    "sistema-seguretat-habitacle", "finestres-laterals-habitacle", "aïllament-tèrmic-habitacle",
    "terra-antilliscant", "ganxos-subjecció", "divisoria-mòbil"
  ],
  
  // Precios
  preu: 35500,
  preuAntic: "37800",
  
  // Imágenes
  imatgeDestacadaUrl: "https://example.com/mercedes-sprinter-main.jpg",
  galeriaVehicleUrls: [
    "https://example.com/mercedes-sprinter-1.jpg",
    "https://example.com/mercedes-sprinter-2.jpg",
    "https://example.com/mercedes-sprinter-3.jpg"
  ],
  
  // Información adicional
  nombrePropietaris: "1",
  dataCreacio: new Date().toISOString(),
  professionalId: "113"
};

async function createTestVehicles() {
  const vehicles = [
    { name: "Coche (BMW M3)", data: testCoche },
    { name: "Moto (Yamaha MT-09)", data: testMoto },
    { name: "Autocaravana (Hymer B588)", data: testAutocaravana },
    { name: "Vehículo Comercial (Mercedes Sprinter)", data: testComercial }
  ];

  console.log('🚗 Creando 4 vehículos de prueba completos...\n');

  for (const vehicle of vehicles) {
    try {
      console.log(`📝 Creando ${vehicle.name}...`);
      
      const response = await axios.post(`${API_BASE_URL}/vehicles`, vehicle.data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        console.log(`✅ ${vehicle.name} creado exitosamente`);
        console.log(`   • ID: ${response.data.data.id}`);
        console.log(`   • Slug: ${response.data.slug}`);
        console.log(`   • Extras: ${vehicle.data.extresCotxe?.length || vehicle.data.extresMoto?.length || vehicle.data.extresAutocaravana?.length || vehicle.data.extresHabitacle?.length || 0} elementos\n`);
      } else {
        console.error(`❌ Error creando ${vehicle.name}:`, response.data);
      }
    } catch (error) {
      console.error(`❌ Error creando ${vehicle.name}:`, error.response?.data || error.message);
    }
  }

  console.log('🎯 Proceso completado. Verificar:');
  console.log('   1. Formulario de edición: Todos los campos deben poblarse correctamente');
  console.log('   2. Página de detalle: Todos los datos deben mostrarse correctamente');
  console.log('   3. Extras: Verificar que se muestren las etiquetas correctas en lugar de slugs');
}

// Ejecutar la creación
createTestVehicles().catch(console.error);