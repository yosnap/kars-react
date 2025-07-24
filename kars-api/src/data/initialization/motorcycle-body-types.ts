// Tipos de carrocería para motos con traducciones
// Generado desde datos del sistema existente

export interface MotorcycleBodyTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const motorcycleBodyTypes: MotorcycleBodyTypeTranslation[] = [
  {
    catalan: "Adventure Sport",
    spanish: "Adventure Sport",
    french: "Adventure Sport",
    english: "Adventure Sport",
    value: "adventure-sport"
  },
  {
    catalan: "ATV",
    spanish: "ATV",
    french: "Quad ATV",
    english: "ATV",
    value: "atv"
  },
  {
    catalan: "Bobber",
    spanish: "Bobber",
    french: "Bobber",
    english: "Bobber",
    value: "bobber"
  },
  {
    catalan: "Café racer",
    spanish: "Café racer",
    french: "Café racer",
    english: "Café racer",
    value: "cafe-racer"
  },
  {
    catalan: "Ciclomotor",
    spanish: "Ciclomotor",
    french: "Cyclomoteur",
    english: "Moped",
    value: "ciclomotor"
  },
  {
    catalan: "Enduro",
    spanish: "Enduro",
    french: "Enduro",
    english: "Enduro",
    value: "enduro"
  },
  {
    catalan: "Escúter",
    spanish: "Escúter",
    french: "Scooter",
    english: "Scooter",
    value: "escuter"
  },
  {
    catalan: "Gran turisme",
    spanish: "Gran turismo",
    french: "Grand tourisme",
    english: "Grand Tourer",
    value: "moto-gran-turisme"
  },
  {
    catalan: "Maxi-Escúter",
    spanish: "Maxi-Escúter",
    french: "Maxi-Scooter",
    english: "Maxi-Scooter",
    value: "maxi-escuter"
  },
  {
    catalan: "Motocross",
    spanish: "Motocross",
    french: "Motocross",
    english: "Motocross",
    value: "motocross"
  },
  {
    catalan: "Naked",
    spanish: "Naked",
    french: "Roadster",
    english: "Naked",
    value: "naked"
  },
  {
    catalan: "Scrambler",
    spanish: "Scrambler",
    french: "Scrambler",
    english: "Scrambler",
    value: "scrambler"
  },
  {
    catalan: "Trail",
    spanish: "Trail",
    french: "Trail",
    english: "Trail",
    value: "moto-trail"
  },
  {
    catalan: "Trial",
    spanish: "Trial",
    french: "Trial",
    english: "Trial",
    value: "trial"
  },
  {
    catalan: "QUAD",
    spanish: "QUAD",
    french: "QUAD",
    english: "QUAD",
    value: "c-quad"
  },
  {
    catalan: "Sport",
    spanish: "Sport",
    french: "Sportive",
    english: "Sport",
    value: "sport"
  }
];

// Función helper para obtener tipo de carrocería de moto por valor
export const getMotorcycleBodyTypeByValue = (value: string): MotorcycleBodyTypeTranslation | undefined => {
  return motorcycleBodyTypes.find(bodyType => bodyType.value === value);
};

// Función helper para obtener todos los valores
export const getMotorcycleBodyTypeValues = (): string[] => {
  return motorcycleBodyTypes.map(bodyType => bodyType.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getMotorcycleBodyTypeNames = (): string[] => {
  return motorcycleBodyTypes.map(bodyType => bodyType.catalan);
};