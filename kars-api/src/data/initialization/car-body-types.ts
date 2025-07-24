// Tipos de carrocería para coches con traducciones
// Generado desde datos del sistema existente

export interface CarBodyTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const carBodyTypes: CarBodyTypeTranslation[] = [
  {
    catalan: "Utilitari Petit",
    spanish: "Utilitario Pequeño",
    french: "Petite Citadine",
    english: "Small City Car",
    value: "utilitari-petit"
  },
  {
    catalan: "Turisme Mig",
    spanish: "Turismo Medio",
    french: "Berline Compacte",
    english: "Mid-size Car",
    value: "turisme-mig"
  },
  {
    catalan: "Sedan-Berlina",
    spanish: "Sedán-Berlina",
    french: "Berline",
    english: "Sedan",
    value: "sedan"
  },
  {
    catalan: "Coupé",
    spanish: "Coupé",
    french: "Coupé",
    english: "Coupe",
    value: "coupe"
  },
  {
    catalan: "Gran Turisme",
    spanish: "Gran Turismo",
    french: "Grand Tourisme",
    english: "Grand Tourer",
    value: "gran-turisme"
  },
  {
    catalan: "Familiar",
    spanish: "Familiar",
    french: "Break",
    english: "Station Wagon",
    value: "familiar"
  },
  {
    catalan: "SUV",
    spanish: "SUV",
    french: "SUV",
    english: "SUV",
    value: "suv"
  },
  {
    catalan: "4x4 Tot Terreny",
    spanish: "4x4 Todo Terreno",
    french: "4x4 Tout-Terrain",
    english: "4x4 Off-Road",
    value: "4x4"
  },
  {
    catalan: "Monovolum",
    spanish: "Monovolumen",
    french: "Monospace",
    english: "MPV",
    value: "monovolum"
  },
  {
    catalan: "Furgoneta passatgers",
    spanish: "Furgoneta de pasajeros",
    french: "Fourgonnette passagers",
    english: "Passenger Van",
    value: "furgo-passatgers"
  },
  {
    catalan: "Cabrio",
    spanish: "Descapotable",
    french: "Cabriolet",
    english: "Convertible",
    value: "cabrio-descapotable"
  },
  {
    catalan: "Pick up",
    spanish: "Pick up",
    french: "Pick-up",
    english: "Pickup Truck",
    value: "pickup"
  }
];

// Función helper para obtener tipo de carrocería por valor
export const getCarBodyTypeByValue = (value: string): CarBodyTypeTranslation | undefined => {
  return carBodyTypes.find(bodyType => bodyType.value === value);
};

// Función helper para obtener todos los valores
export const getCarBodyTypeValues = (): string[] => {
  return carBodyTypes.map(bodyType => bodyType.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getCarBodyTypeNames = (): string[] => {
  return carBodyTypes.map(bodyType => bodyType.catalan);
};