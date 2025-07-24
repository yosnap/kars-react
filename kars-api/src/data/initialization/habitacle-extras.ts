// Extras de habitáculo con traducciones
// Generado desde datos del sistema existente

export interface HabitacleExtraTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const habitacleExtras: HabitacleExtraTranslation[] = [
  {
    catalan: "Aigua corrent",
    spanish: "Agua corriente",
    french: "Eau courante",
    english: "Running Water",
    value: "aigua-corrent"
  },
  {
    catalan: "Antena Satèl·lit",
    spanish: "Antena Satélite",
    french: "Antenne Satellite",
    english: "Satellite Antenna",
    value: "antena-satelit"
  },
  {
    catalan: "Antena TV",
    spanish: "Antena TV",
    french: "Antenne TV",
    english: "TV Antenna",
    value: "antena-tv"
  },
  {
    catalan: "Claraboies",
    spanish: "Claraboyas",
    french: "Lucarnes",
    english: "Skylights",
    value: "claraboies"
  },
  {
    catalan: "Congelador",
    spanish: "Congelador",
    french: "Congélateur",
    english: "Freezer",
    value: "congelador"
  },
  {
    catalan: "Cuina",
    spanish: "Cocina",
    french: "Cuisine",
    english: "Kitchen",
    value: "cuina"
  },
  {
    catalan: "Detector fums",
    spanish: "Detector de humos",
    french: "Détecteur de fumée",
    english: "Smoke Detector",
    value: "detector-fums"
  },
  {
    catalan: "Dutxa",
    spanish: "Ducha",
    french: "Douche",
    english: "Shower",
    value: "dutxa"
  },
  {
    catalan: "Forn",
    spanish: "Horno",
    french: "Four",
    english: "Oven",
    value: "forn"
  },
  {
    catalan: "Frigorífic",
    spanish: "Frigorífico",
    french: "Réfrigérateur",
    english: "Refrigerator",
    value: "frigorific"
  },
  {
    catalan: "Llits",
    spanish: "Camas",
    french: "Lits",
    english: "Beds",
    value: "llits"
  },
  {
    catalan: "Microones",
    spanish: "Microondas",
    french: "Micro-ondes",
    english: "Microwave",
    value: "microones"
  },
  {
    catalan: "Mosquitera",
    spanish: "Mosquitera",
    french: "Moustiquaire",
    english: "Mosquito Net",
    value: "mosquitera"
  },
  {
    catalan: "Nevera",
    spanish: "Nevera",
    french: "Glacière",
    english: "Cooler",
    value: "nevera"
  },
  {
    catalan: "Tendall",
    spanish: "Toldo",
    french: "Auvent",
    english: "Awning",
    value: "tendall"
  },
  {
    catalan: "TV",
    spanish: "TV",
    french: "Télévision",
    english: "Television",
    value: "tv"
  },
  {
    catalan: "WC",
    spanish: "WC",
    french: "Toilettes",
    english: "Toilet",
    value: "wc"
  }
];

// Función helper para obtener extra de habitáculo por valor
export const getHabitacleExtraByValue = (value: string): HabitacleExtraTranslation | undefined => {
  return habitacleExtras.find(extra => extra.value === value);
};

// Función helper para obtener todos los valores
export const getHabitacleExtraValues = (): string[] => {
  return habitacleExtras.map(extra => extra.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getHabitacleExtraNames = (): string[] => {
  return habitacleExtras.map(extra => extra.catalan);
};