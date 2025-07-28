/**
 * Motoraldia API Data Mapper
 * 
 * Este archivo contiene todas las funciones de mapeo necesarias para convertir
 * los datos de nuestro sistema (Kars.ad) al formato que espera la API de Motoraldia.
 * 
 * La API de Motoraldia tiene valores específicos que difieren de nuestro sistema,
 * por lo que necesitamos mapear los datos antes de enviarlos.
 */

/**
 * Convierte una ruta local de imagen a URL completa
 * Si la URL ya es completa (empieza con http), la devuelve tal como está
 */
function convertToFullUrl(imagePath: string | null | undefined): string | null {
  if (!imagePath) return null;
  
  // Si ya es una URL completa, devolverla tal como está
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Si empieza con /media/, convertir a URL completa
  if (imagePath.startsWith('/media/')) {
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
    return `${baseUrl}${imagePath}`;
  }
  
  // Para cualquier otra ruta local, asumir que es relativa
  if (imagePath.startsWith('/')) {
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
    return `${baseUrl}${imagePath}`;
  }
  
  // Si no empieza con /, asumir que es relativa
  const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:5173';
  return `${baseUrl}/${imagePath}`;
}

export interface MotoraldiaVehiclePayload {
  'titol-anunci': string;
  'tipus-vehicle': string;
  'marques-cotxe'?: string;
  'marques-de-moto'?: string;
  'models-cotxe'?: string;
  'models-de-moto'?: string;
  'versio'?: string;
  'any'?: string;
  'quilometratge'?: string;
  'preu': number;
  'estat-vehicle'?: string;
  'tipus-combustible'?: string;
  'tipus-canvi'?: string;
  'carrosseria-cotxe'?: string;
  'carrosseria-moto'?: string;
  'potencia-cv'?: string;
  'potencia-kw'?: string;
  'cilindrada'?: string;
  'color-vehicle'?: string;
  'color-tapiceria'?: string;
  'tipus-tapisseria'?: string;
  'anunci-actiu': boolean;
  'venut': boolean;
  'anunci-destacat': number;
  'imatge-destacada-url'?: string;
  'galeria-vehicle-urls'?: string[];
  'descripcio-anunci'?: string;
  'extres-cotxe'?: string[];
  'extres-moto'?: string[];
  'extres-autocaravana'?: string[];
  'extres-habitacle'?: string[];
}

/**
 * Mapea el tipo de combustible de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - combustible-altres, combustible-benzina, combustible-biocombustible, combustible-diesel
 * - combustible-electric, combustible-electric-combustible, electriccombustible
 * - combustible-gas-natural-gnc, combustible-gas-liquat-glp, hibrid, hibrid-endollable
 * - combustible-hidrogen, combustible-solar, combustible-solar-hibrid
 */
export const mapFuelTypeToMotoraldi = (fuelType: string | null): string | undefined => {
  if (!fuelType) return undefined;
  
  const mapping: Record<string, string> = {
    // Combustibles tradicionales con prefijo combustible-
    'benzina': 'combustible-benzina',
    'gasolina': 'combustible-benzina',
    'combustible-benzina': 'combustible-benzina',
    
    'diesel': 'combustible-diesel',
    'gasoil': 'combustible-diesel',
    'combustible-diesel': 'combustible-diesel',
    
    // Eléctricos con prefijo combustible-
    'electric': 'combustible-electric',
    'electrico': 'combustible-electric',
    'combustible-electric': 'combustible-electric',
    
    'electric-combustible': 'combustible-electric-combustible',
    'electriccombustible': 'electriccombustible', // Este valor no tiene prefijo según la API
    'combustible-electric-combustible': 'combustible-electric-combustible',
    
    // Híbridos SIN prefijo combustible- según la API
    'hibrid': 'hibrid',
    'hibrido': 'hibrid',
    'hibrid-endollable': 'hibrid-endollable',
    'hibrido-enchufable': 'hibrid-endollable',
    'plug-in': 'hibrid-endollable',
    
    // Gases con prefijo combustible-
    'gas-natural': 'combustible-gas-natural-gnc',
    'gnc': 'combustible-gas-natural-gnc',
    'combustible-gas-natural-gnc': 'combustible-gas-natural-gnc',
    
    'gas-liquat': 'combustible-gas-liquat-glp',
    'glp': 'combustible-gas-liquat-glp',
    'autogas': 'combustible-gas-liquat-glp',
    'combustible-gas-liquat-glp': 'combustible-gas-liquat-glp',
    
    // Alternativos con prefijo combustible-
    'hidrogen': 'combustible-hidrogen',
    'hidrogeno': 'combustible-hidrogen',
    'combustible-hidrogen': 'combustible-hidrogen',
    
    'biocombustible': 'combustible-biocombustible',
    'biodiesel': 'combustible-biocombustible',
    'bioetanol': 'combustible-biocombustible',
    'combustible-biocombustible': 'combustible-biocombustible',
    
    'solar': 'combustible-solar',
    'combustible-solar': 'combustible-solar',
    
    'solar-hibrid': 'combustible-solar-hibrid',
    'solar-hibrido': 'combustible-solar-hibrid',
    'combustible-solar-hibrid': 'combustible-solar-hibrid',
    
    // Otros con prefijo combustible-
    'altres': 'combustible-altres',
    'otros': 'combustible-altres',
    'other': 'combustible-altres',
    'combustible-altres': 'combustible-altres'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'combustible-altres',
    'combustible-benzina',
    'combustible-biocombustible', 
    'combustible-diesel',
    'combustible-electric',
    'combustible-electric-combustible',
    'electriccombustible',
    'combustible-gas-natural-gnc',
    'combustible-gas-liquat-glp',
    'hibrid',
    'hibrid-endollable',
    'combustible-hidrogen',
    'combustible-solar',
    'combustible-solar-hibrid'
  ];
  
  if (validMotoraldiaValues.includes(fuelType)) {
    return fuelType;
  }
  
  return mapping[fuelType] || 'combustible-altres'; // fallback a 'combustible-altres' si no encuentra el mapeo
};

/**
 * Mapea el tipo de transmisión de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - auto-sequencial (Auto-Seqüencial)
 * - automatic (Automàtic)
 * - geartronic (Geartronic)
 * - manual (Manual)
 * - semi-automatic (Semi-Automàtic)
 * - sequencial (Seqüencial)
 */
export const mapTransmissionTypeToMotoraldi = (transmission: string | null): string | undefined => {
  if (!transmission) return undefined;
  
  const mapping: Record<string, string> = {
    // Transmisiones principales
    'manual': 'manual',
    'automatica': 'automatic',
    'automatic': 'automatic',
    'automatico': 'automatic',
    'auto': 'automatic',
    
    // Secuenciales
    'auto-sequencial': 'auto-sequencial',
    'auto-secuencial': 'auto-sequencial',
    'sequencial': 'sequencial',
    'secuencial': 'sequencial',
    'sequential': 'sequencial',
    
    // Semi-automática
    'semi-automatic': 'semi-automatic',
    'semi-automatica': 'semi-automatic',
    'semi-automatico': 'semi-automatic',
    'semiautomatica': 'semi-automatic',
    
    // Geartronic (específico)
    'geartronic': 'geartronic',
    
    // CVT y otros
    'cvt': 'automatic', // CVT se mapea a automático
    'tiptronic': 'automatic',
    'multitronic': 'automatic'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'auto-sequencial',
    'automatic',
    'geartronic',
    'manual',
    'semi-automatic',
    'sequencial'
  ];
  
  if (validMotoraldiaValues.includes(transmission)) {
    return transmission;
  }
  
  return mapping[transmission] || 'manual'; // fallback a 'manual' si no encuentra el mapeo
};

/**
 * Mapea el estado del vehículo de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - classic (Clàssic)
 * - km0-gerencia (Km0)
 * - lloguer (Lloguer) 
 * - nou (Nou)
 * - ocasio (Ocasió)
 * - renting (Renting)
 * - seminou (Seminou)
 */
export const mapVehicleStateToMotoraldi = (state: string | null): string | undefined => {
  if (!state) return undefined;
  
  const mapping: Record<string, string> = {
    // Estados principales
    'nou': 'nou',
    'nuevo': 'nou',
    'new': 'nou',
    'ocasio': 'ocasio',
    'ocasion': 'ocasio',
    'used': 'ocasio',
    'usado': 'ocasio',
    'seminou': 'seminou',
    'seminuevo': 'seminou',
    'km0': 'km0-gerencia',
    'km0-gerencia': 'km0-gerencia',
    'gerencia': 'km0-gerencia',
    
    // Estados especiales
    'classic': 'classic',
    'clasico': 'classic',
    'vintage': 'classic',
    'lloguer': 'lloguer',
    'alquiler': 'lloguer',
    'rental': 'lloguer',
    'renting': 'renting',
    'leasing': 'renting'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'classic',
    'km0-gerencia', 
    'lloguer',
    'nou',
    'ocasio',
    'renting',
    'seminou'
  ];
  
  if (validMotoraldiaValues.includes(state)) {
    return state;
  }
  
  return mapping[state] || 'ocasio'; // fallback a 'ocasio' si no encuentra el mapeo
};

/**
 * Mapea la carrocería de coche de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - utilitari-petit, turisme-mig, sedan, coupe, gran-turisme
 * - familiar, suv, 4x4, monovolum, furgo-passatgers
 * - cabrio-descapotable, pickup
 */
export const mapCarBodyTypeToMotoraldi = (bodyType: string | null): string | undefined => {
  if (!bodyType) return undefined;
  
  const mapping: Record<string, string> = {
    // Tipos básicos
    'sedan': 'sedan',
    'berlina': 'sedan',
    'sedan-berlina': 'sedan',
    'coupe': 'coupe',
    'cupe': 'coupe',
    
    // Utilitarios
    'hatchback': 'utilitari-petit',
    'utilitari': 'utilitari-petit',
    'utilitari-petit': 'utilitari-petit',
    'compacto': 'utilitari-petit',
    
    // Turismos
    'turisme': 'turisme-mig',
    'turisme-mig': 'turisme-mig',
    'turismo': 'turisme-mig',
    
    // Gran turisme
    'gran-turisme': 'gran-turisme',
    'gran-turismo': 'gran-turisme',
    'gt': 'gran-turisme',
    
    // Familiar y SUV
    'familiar': 'familiar',
    'estate': 'familiar',
    'suv': 'suv',
    '4x4': '4x4',
    'todo-terreno': '4x4',
    'todoterreno': '4x4',
    
    // Monovolum
    'monovolum': 'monovolum',
    'monovolumen': 'monovolum',
    'mpv': 'monovolum',
    
    // Furgonetas
    'furgoneta': 'furgo-passatgers',
    'furgo': 'furgo-passatgers',
    'furgo-passatgers': 'furgo-passatgers',
    'van': 'furgo-passatgers',
    
    // Descapotables
    'cabrio': 'cabrio-descapotable',
    'descapotable': 'cabrio-descapotable',
    'cabrio-descapotable': 'cabrio-descapotable',
    'convertible': 'cabrio-descapotable',
    
    // Pick up
    'pickup': 'pickup',
    'pick-up': 'pickup',
    'pick_up': 'pickup'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'utilitari-petit',
    'turisme-mig',
    'sedan',
    'coupe',
    'gran-turisme',
    'familiar',
    'suv',
    '4x4',
    'monovolum',
    'furgo-passatgers',
    'cabrio-descapotable',
    'pickup'
  ];
  
  if (validMotoraldiaValues.includes(bodyType)) {
    return bodyType;
  }
  
  return mapping[bodyType] || 'sedan'; // fallback a 'sedan' si no encuentra el mapeo
};

/**
 * Mapea la carrocería de moto de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - ciclomotor, escuter, maxi-escuter, naked, moto-gran-turisme
 * - bobber, cafe-racer, moto-trail, enduro, c-trial
 * - c-quad, atv, scrambler
 */
export const mapMotorcycleBodyTypeToMotoraldi = (bodyType: string | null): string | undefined => {
  if (!bodyType) return undefined;
  
  const mapping: Record<string, string> = {
    // Ciclomotores y scooters
    'ciclomotor': 'ciclomotor',
    'scooter': 'escuter',
    'escuter': 'escuter',
    'escúter': 'escuter',
    'maxi-scooter': 'maxi-escuter',
    'maxi-escuter': 'maxi-escuter',
    'maxiscooter': 'maxi-escuter',
    
    // Motos deportivas y naked
    'naked': 'naked',
    'sport': 'naked', // Mapeamos sport a naked como opción más cercana
    'deportiva': 'naked',
    'esportiva': 'naked',
    
    // Gran turismo
    'gran-turisme': 'moto-gran-turisme',
    'gran-turismo': 'moto-gran-turisme',
    'moto-gran-turisme': 'moto-gran-turisme',
    'touring': 'moto-gran-turisme',
    'gt': 'moto-gran-turisme',
    
    // Estilos específicos
    'bobber': 'bobber',
    'cafe-racer': 'cafe-racer',
    'caferacer': 'cafe-racer',
    'scrambler': 'scrambler',
    
    // Off-road
    'trail': 'moto-trail',
    'moto-trail': 'moto-trail',
    'adventure': 'moto-trail',
    'enduro': 'enduro',
    'trial': 'c-trial',
    'c-trial': 'c-trial',
    
    // Quads y ATV
    'quad': 'c-quad',
    'c-quad': 'c-quad',
    'atv': 'atv',
    
    // Cruiser (mapeamos a bobber como más cercano)
    'cruiser': 'bobber',
    'custom': 'bobber'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'ciclomotor',
    'escuter',
    'maxi-escuter',
    'naked',
    'moto-gran-turisme',
    'bobber',
    'cafe-racer',
    'moto-trail',
    'enduro',
    'c-trial',
    'c-quad',
    'atv',
    'scrambler'
  ];
  
  if (validMotoraldiaValues.includes(bodyType)) {
    return bodyType;
  }
  
  return mapping[bodyType] || 'naked'; // fallback a 'naked' si no encuentra el mapeo
};

/**
 * Mapea el color exterior del vehículo de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - bicolor, blanc, negre, gris, antracita, beige, camel, marro
 * - blau, bordeus, granat, lila, vermell, taronja, groc, verd
 * - altres-exterior, rosa, daurat
 */
export const mapVehicleColorToMotoraldi = (vehicleColor: string | null): string | undefined => {
  if (!vehicleColor) return undefined;
  
  const mapping: Record<string, string> = {
    // Colores básicos
    'bicolor': 'bicolor',
    'blanc': 'blanc',
    'blanco': 'blanc',
    'white': 'blanc',
    'negre': 'negre',
    'negro': 'negre',
    'black': 'negre',
    'gris': 'gris',
    'gray': 'gris',
    'grey': 'gris',
    'antracita': 'antracita',
    'anthracite': 'antracita',
    
    // Colores neutros
    'beige': 'beige',
    'camel': 'camel',
    'marro': 'marro',
    'marrón': 'marro',
    'brown': 'marro',
    'marron': 'marro',
    
    // Colores primarios
    'blau': 'blau',
    'azul': 'blau',
    'blue': 'blau',
    'vermell': 'vermell',
    'rojo': 'vermell',
    'red': 'vermell',
    'groc': 'groc',
    'amarillo': 'groc',
    'yellow': 'groc',
    'verd': 'verd',
    'verde': 'verd',
    'green': 'verd',
    
    // Colores específicos
    'bordeus': 'bordeus',
    'burdeos': 'bordeus',
    'burgundy': 'bordeus',
    'granat': 'granat',
    'granate': 'granat',
    'garnet': 'granat',
    'lila': 'lila',
    'lilac': 'lila',
    'purple': 'lila',
    'taronja': 'taronja',
    'naranja': 'taronja',
    'orange': 'taronja',
    'rosa': 'rosa',
    'pink': 'rosa',
    'daurat': 'daurat',
    'dorado': 'daurat',
    'gold': 'daurat',
    
    // Colores metálicos y especiales
    'plata': 'gris',
    'silver': 'gris',
    'plateado': 'gris',
    'bronze': 'marro',
    'bronce': 'marro',
    'cobre': 'marro',
    'copper': 'marro',
    
    // Otros
    'altres': 'altres-exterior',
    'otros': 'altres-exterior',
    'other': 'altres-exterior',
    'altres-exterior': 'altres-exterior'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'bicolor',
    'blanc',
    'negre',
    'gris',
    'antracita',
    'beige',
    'camel',
    'marro',
    'blau',
    'bordeus',
    'granat',
    'lila',
    'vermell',
    'taronja',
    'groc',
    'verd',
    'altres-exterior',
    'rosa',
    'daurat'
  ];
  
  if (validMotoraldiaValues.includes(vehicleColor)) {
    return vehicleColor;
  }
  
  return mapping[vehicleColor] || 'altres-exterior'; // fallback a 'altres-exterior' si no encuentra el mapeo
};

/**
 * Mapea el color de tapicería de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - tapisseria-bicolor, tapisseria-blanc, tapisseria-negre, tapisseria-gris, tapisseria-antracita
 * - tapisseria-beige, tapisseria-camel, tapisseria-marro, tapisseria-blau, tapisseria-bordeus
 * - tapisseria-granat, tapisseria-lila, tapisseria-vermell, tapisseria-taronja, tapisseria-groc
 * - tapisseria-verd, altres-tapisseria
 */
export const mapUpholsteryColorToMotoraldi = (upholsteryColor: string | null): string | undefined => {
  if (!upholsteryColor) return undefined;
  
  const mapping: Record<string, string> = {
    // Colores básicos con prefijo tapisseria-
    'bicolor': 'tapisseria-bicolor',
    'tapisseria-bicolor': 'tapisseria-bicolor',
    
    'blanc': 'tapisseria-blanc',
    'blanco': 'tapisseria-blanc',
    'white': 'tapisseria-blanc',
    'tapisseria-blanc': 'tapisseria-blanc',
    
    'negre': 'tapisseria-negre',
    'negro': 'tapisseria-negre',
    'black': 'tapisseria-negre',
    'tapisseria-negre': 'tapisseria-negre',
    
    'gris': 'tapisseria-gris',
    'gray': 'tapisseria-gris',
    'grey': 'tapisseria-gris',
    'tapisseria-gris': 'tapisseria-gris',
    
    'antracita': 'tapisseria-antracita',
    'anthracite': 'tapisseria-antracita',
    'tapisseria-antracita': 'tapisseria-antracita',
    
    // Colores neutros
    'beige': 'tapisseria-beige',
    'tapisseria-beige': 'tapisseria-beige',
    
    'camel': 'tapisseria-camel',
    'tapisseria-camel': 'tapisseria-camel',
    
    'marro': 'tapisseria-marro',
    'marrón': 'tapisseria-marro',
    'brown': 'tapisseria-marro',
    'marron': 'tapisseria-marro',
    'tapisseria-marro': 'tapisseria-marro',
    
    // Colores primarios
    'blau': 'tapisseria-blau',
    'azul': 'tapisseria-blau',
    'blue': 'tapisseria-blau',
    'tapisseria-blau': 'tapisseria-blau',
    
    'vermell': 'tapisseria-vermell',
    'rojo': 'tapisseria-vermell',
    'red': 'tapisseria-vermell',
    'tapisseria-vermell': 'tapisseria-vermell',
    
    'groc': 'tapisseria-groc',
    'amarillo': 'tapisseria-groc',
    'yellow': 'tapisseria-groc',
    'tapisseria-groc': 'tapisseria-groc',
    
    'verd': 'tapisseria-verd',
    'verde': 'tapisseria-verd',
    'green': 'tapisseria-verd',
    'tapisseria-verd': 'tapisseria-verd',
    
    // Colores específicos
    'bordeus': 'tapisseria-bordeus',
    'burdeos': 'tapisseria-bordeus',
    'burgundy': 'tapisseria-bordeus',
    'tapisseria-bordeus': 'tapisseria-bordeus',
    
    'granat': 'tapisseria-granat',
    'granate': 'tapisseria-granat',
    'garnet': 'tapisseria-granat',
    'tapisseria-granat': 'tapisseria-granat',
    
    'lila': 'tapisseria-lila',
    'lilac': 'tapisseria-lila',
    'purple': 'tapisseria-lila',
    'tapisseria-lila': 'tapisseria-lila',
    
    'taronja': 'tapisseria-taronja',
    'naranja': 'tapisseria-taronja',
    'orange': 'tapisseria-taronja',
    'tapisseria-taronja': 'tapisseria-taronja',
    
    // Otros
    'altres': 'altres-tapisseria',
    'otros': 'altres-tapisseria',
    'other': 'altres-tapisseria',
    'altres-tapisseria': 'altres-tapisseria'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'tapisseria-bicolor',
    'tapisseria-negre',
    'tapisseria-antracita',
    'tapisseria-gris',
    'tapisseria-blanc',
    'tapisseria-beige',
    'tapisseria-camel',
    'tapisseria-marro',
    'tapisseria-bordeus',
    'tapisseria-granat',
    'tapisseria-blau',
    'tapisseria-lila',
    'tapisseria-vermell',
    'tapisseria-taronja',
    'tapisseria-groc',
    'tapisseria-verd',
    'altres-tapisseria'
  ];
  
  if (validMotoraldiaValues.includes(upholsteryColor)) {
    return upholsteryColor;
  }
  
  return mapping[upholsteryColor] || 'altres-tapisseria'; // fallback a 'altres-tapisseria' si no encuentra el mapeo
};

/**
 * Mapea el tipo de tapicería de nuestro sistema al formato de Motoraldia
 * 
 * Valores válidos según la API de Motoraldia:
 * - alcantara, cuir, cuir-alcantara, cuir-sintetic, teixit
 * - teixit-alcantara, teixit-cuir, altres-tipus-tapisseria
 */
export const mapUpholsteryTypeToMotoraldi = (upholsteryType: string | null): string | undefined => {
  if (!upholsteryType) return undefined;
  
  const mapping: Record<string, string> = {
    // Tipos principales
    'alcantara': 'alcantara',
    'alcántara': 'alcantara',
    'alcantara-suede': 'alcantara',
    'suede': 'alcantara',
    
    'cuir': 'cuir',
    'cuero': 'cuir',
    'leather': 'cuir',
    'piel': 'cuir',
    
    'cuir-sintetic': 'cuir-sintetic',
    'cuero-sintetico': 'cuir-sintetic',
    'synthetic-leather': 'cuir-sintetic',
    'eco-leather': 'cuir-sintetic',
    'piel-sintetica': 'cuir-sintetic',
    'polipiel': 'cuir-sintetic',
    
    'teixit': 'teixit',
    'tejido': 'teixit',
    'fabric': 'teixit',
    'cloth': 'teixit',
    'tela': 'teixit',
    
    // Combinaciones
    'cuir-alcantara': 'cuir-alcantara',
    'cuero-alcantara': 'cuir-alcantara',
    'leather-alcantara': 'cuir-alcantara',
    'piel-alcantara': 'cuir-alcantara',
    
    'teixit-alcantara': 'teixit-alcantara',
    'tejido-alcantara': 'teixit-alcantara',
    'fabric-alcantara': 'teixit-alcantara',
    'tela-alcantara': 'teixit-alcantara',
    
    'teixit-cuir': 'teixit-cuir',
    'tejido-cuero': 'teixit-cuir',
    'fabric-leather': 'teixit-cuir',
    'tela-piel': 'teixit-cuir',
    'cloth-leather': 'teixit-cuir',
    
    // Otros
    'altres': 'altres-tipus-tapisseria',
    'otros': 'altres-tipus-tapisseria',
    'other': 'altres-tipus-tapisseria',
    'altres-tipus-tapisseria': 'altres-tipus-tapisseria',
    'vinilo': 'altres-tipus-tapisseria',
    'vinyl': 'altres-tipus-tapisseria',
    'plastico': 'altres-tipus-tapisseria',
    'plastic': 'altres-tipus-tapisseria'
  };
  
  // Si el valor ya está en el formato correcto de Motoraldia, lo devolvemos tal cual
  const validMotoraldiaValues = [
    'alcantara',
    'cuir',
    'cuir-alcantara',
    'cuir-sintetic',
    'teixit',
    'teixit-alcantara',
    'teixit-cuir',
    'altres-tipus-tapisseria'
  ];
  
  if (validMotoraldiaValues.includes(upholsteryType)) {
    return upholsteryType;
  }
  
  return mapping[upholsteryType] || 'altres-tipus-tapisseria'; // fallback a 'altres-tipus-tapisseria' si no encuentra el mapeo
};

/**
 * Filtra extras para mantener solo los valores válidos según la API de Motoraldia
 */
export const filterValidExtras = (extras: string[] | null): string[] => {
  if (!extras || !Array.isArray(extras)) return [];
  
  // Lista de valores válidos conocidos basada en el error de la API
  const validExtras = [
    'abs',
    'airbag-conductor',
    'airbag-passatger',
    'airbags-cortina',
    'airbags-laterals',
    'alarma',
    'aparcament-control-remot',
    'apple-car-play-android-auto',
    'arrancada-sense-clau-keyless',
    'assist-aparcament',
    'assist-manteniment-carril',
    'assist-manteniment-carril-protec-colisio-lateral',
    'assist-colisio-lateral',
    'assist-colisio-per-abast',
    'assist-marxa-enrere',
    'assist-parada-emergencia',
    'auto-aparcament',
    'avis-angle-mort',
    'alerta-canvi-involuntari-carril',
    'avis-colisio-encreuament'
    // TODO: Agregar más valores de la lista completa de la API
  ];
  
  // Filtrar solo los extras que están en la lista de válidos
  return extras.filter(extra => validExtras.includes(extra));
};

/**
 * Filtra extras de moto para mantener solo los valores válidos según la API de Motoraldia
 */
export const filterValidMotorcycleExtras = (extras: string[] | null): string[] => {
  if (!extras || !Array.isArray(extras)) return [];
  
  // Lista de valores válidos para extras de moto basada en el error de la API
  const validMotorcycleExtras = [
    'abs',
    'abs-corba',
    'alarma',
    'car-play-android',
    'arancada-sense-clau',
    'bluetooth',
    'connexio-internet',
    'connexio-telefon',
    'control-pressio',
    'control-traccio',
    'curise-control',
    'endoll-12v',
    'fars-led',
    'fars-xeno',
    'fars-bi-xeno',
    'gps',
    'keyless',
    'limitador-velocitat',
    'llandes-aliatges',
    'llums-de-dia'
    // TODO: Agregar más valores de la lista completa de la API
  ];
  
  // Filtrar solo los extras que están en la lista de válidos
  return extras.filter(extra => validMotorcycleExtras.includes(extra));
};

/**
 * Convierte un vehículo de nuestro sistema al formato de payload de Motoraldia
 */
export const mapVehicleToMotoraldiaPayload = (vehicle: any): MotoraldiaVehiclePayload => {
  return {
    // Información básica
    'titol-anunci': vehicle.titolAnunci,
    'tipus-vehicle': vehicle.tipusVehicle,
    'marques-cotxe': vehicle.marcaCotxe,
    'marques-de-moto': vehicle.marcaMoto,
    'models-cotxe': vehicle.modelsCotxe,
    'models-de-moto': vehicle.modelsMoto,
    'versio': vehicle.versio,
    'any': vehicle.any,
    'quilometratge': vehicle.quilometratge,
    'preu': vehicle.preu,
    
    // Campos mapeados
    'estat-vehicle': mapVehicleStateToMotoraldi(vehicle.estatVehicle),
    'tipus-combustible': mapFuelTypeToMotoraldi(vehicle.tipusCombustible),
    'tipus-canvi': mapTransmissionTypeToMotoraldi(vehicle.tipusCanvi),
    'carrosseria-cotxe': mapCarBodyTypeToMotoraldi(vehicle.carrosseriaCotxe),
    'carrosseria-moto': mapMotorcycleBodyTypeToMotoraldi(vehicle.carrosseriaMoto),
    
    // Especificaciones técnicas
    'potencia-cv': vehicle.potenciaCv,
    'potencia-kw': vehicle.potenciaKw,
    'cilindrada': vehicle.cilindrada,
    'color-vehicle': mapVehicleColorToMotoraldi(vehicle.colorVehicle),
    'color-tapiceria': mapUpholsteryColorToMotoraldi(vehicle.colorTapiceria),
    'tipus-tapisseria': mapUpholsteryTypeToMotoraldi(vehicle.tipusTapisseria),
    
    // Estado del anuncio
    'anunci-actiu': vehicle.anunciActiu,
    'venut': vehicle.venut,
    'anunci-destacat': vehicle.anunciDestacat,
    
    // Imágenes - convertir rutas locales a URLs completas
    'imatge-destacada-url': convertToFullUrl(vehicle.imatgeDestacadaUrl) || undefined,
    'galeria-vehicle-urls': vehicle.galeriaVehicleUrls?.map((url: string) => convertToFullUrl(url)).filter((url): url is string => url !== null) || [],
    
    // Descripción
    'descripcio-anunci': vehicle.descripcioAnunciCA || vehicle.descripcioAnunci,
    
    // Extras - filtrar solo valores válidos
    'extres-cotxe': filterValidExtras(vehicle.extresCotxe || []),
    'extres-moto': filterValidMotorcycleExtras(vehicle.extresMoto || []),
    'extres-autocaravana': vehicle.extresAutocaravana || [],
    'extres-habitacle': vehicle.extresHabitacle || []
  };
};

/**
 * Limpia el payload eliminando campos null, undefined o vacíos
 */
export const cleanMotoraldiaPayload = (payload: MotoraldiaVehiclePayload): MotoraldiaVehiclePayload => {
  const cleaned: any = {};
  
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      // Para arrays, solo incluir si no están vacíos
      if (Array.isArray(value)) {
        if (value.length > 0) {
          cleaned[key] = value;
        }
      } else {
        cleaned[key] = value;
      }
    }
  });
  
  return cleaned;
};