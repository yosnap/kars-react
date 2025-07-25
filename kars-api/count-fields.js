const axios = require('axios');

async function countFields() {
  try {
    console.log('🔢 Contando campos entre APIs...\n');
    
    // Campos que debería tener según documentación externa (WordPress API)
    const expectedExternalFields = [
      // Básicos
      "slug", "titol-anunci", "preu", "quilometratge", "any", "versio",
      
      // Marcas y modelos
      "marca-cotxe", "marca-moto", "marques-autocaravana", "marques-comercial",
      "models-cotxe", "models-moto", "models-autocaravana", "models-comercial",
      
      // Técnicos
      "tipus-combustible", "tipus-canvi", "tipus-propulsor", "potencia-cv", 
      "potencia-kw", "cilindrada", "color-vehicle", "portes-cotxe", "places-cotxe",
      "estat-vehicle", "traccio", "carrosseria-cotxe", "carrosseria-moto", "carrosseria-caravana",
      
      // Consumos y emisiones
      "consum-urba", "consum-carretera", "consum-mixt", "emissions-co2", 
      "emissions-vehicle", "categoria-ecologica",
      
      // Tapicería y color
      "tipus-tapisseria", "color-tapisseria",
      
      // Equipamiento
      "extres-cotxe", "extres-moto", "extres-autocaravana", "extres-habitacle",
      "aire-acondicionat", "climatitzacio", "vehicle-fumador",
      
      // Comercial
      "garantia", "vehicle-accidentat", "origen", "iva", "finacament",
      "preu-antic", "preu-mensual", "preu-diari", "nombre-propietaris",
      "llibre-manteniment", "revisions-oficials", "impostos-deduibles", "vehicle-a-canvi",
      
      // Descripciones multiidioma
      "descripcio-anunci-ca", "descripcio-anunci-en", "descripcio-anunci-fr", "descripcio-anunci-es",
      
      // Imágenes y estado
      "imatge-destacada-url", "galeria-vehicle-urls", "anunci-actiu", "anunci-destacat", "venut",
      
      // Metadatos
      "data-creacio", "notes-internes"
    ];
    
    // API Interna actual
    console.log('🏠 Obteniendo campos de API interna...');
    const response = await axios.get('http://localhost:3001/api/vehicles?per_page=1');
    const internalFields = Object.keys(response.data.items[0] || {});
    
    // Excluir campos de sistema (IDs, etc.)
    const systemFields = ['id', 'professionalId', 'dataCreacio'];
    const businessFields = internalFields.filter(field => !systemFields.includes(field));
    
    console.log(`📊 CONTEO DE CAMPOS:`);
    console.log(`=${'='.repeat(50)}`);
    console.log(`📡 API Externa esperada: ${expectedExternalFields.length} campos`);
    console.log(`🏠 API Interna actual: ${businessFields.length} campos de negocio`);
    console.log(`🔧 Campos de sistema: ${systemFields.length} (${systemFields.join(', ')})`);
    console.log(`📈 Total API interna: ${internalFields.length} campos\n`);
    
    const difference = expectedExternalFields.length - businessFields.length;
    
    if (difference === 0) {
      console.log(`✅ ¡PERFECTO! Mismo número de campos de negocio`);
    } else if (difference > 0) {
      console.log(`❌ FALTAN ${difference} campos en API interna`);
    } else {
      console.log(`➕ HAY ${Math.abs(difference)} campos adicionales en API interna`);
    }
    
    console.log(`\n📋 CAMPOS DE NEGOCIO EN API INTERNA:`);
    businessFields.sort().forEach((field, index) => {
      console.log(`   ${(index + 1).toString().padStart(2)}. ${field}`);
    });
    
    console.log(`\n🎯 RESULTADO:`);
    console.log(`   • La API interna ${difference === 0 ? 'TIENE' : 'NO TIENE'} el mismo número de campos que la externa`);
    console.log(`   • Diferencia: ${difference} campos`);
    console.log(`   • Estado: ${difference === 0 ? '✅ COMPLETA' : difference > 0 ? '❌ INCOMPLETA' : '➕ EXTENDIDA'}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

countFields();