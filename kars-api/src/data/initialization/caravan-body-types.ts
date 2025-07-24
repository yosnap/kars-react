// Tipos de carrocería para caravanas con traducciones
// Generado desde datos del sistema existente

export interface CaravanBodyTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const caravanBodyTypes: CaravanBodyTypeTranslation[] = [
  {
    catalan: "Caputxina",
    spanish: "Capuchina",
    french: "Capucine",
    english: "Overcab",
    value: "c-caputxina"
  },
  {
    catalan: "Perfilada",
    spanish: "Perfilada",
    french: "Profilé",
    english: "Low Profile",
    value: "c-perfilada"
  },
  {
    catalan: "Integral",
    spanish: "Integral",
    french: "Intégral",
    english: "A-Class",
    value: "c-integral"
  },
  {
    catalan: "Camper",
    spanish: "Camper",
    french: "Camping-car",
    english: "Camper Van",
    value: "c-camper"
  }
];

// Función helper para obtener tipo de carrocería de caravana por valor
export const getCaravanBodyTypeByValue = (value: string): CaravanBodyTypeTranslation | undefined => {
  return caravanBodyTypes.find(bodyType => bodyType.value === value);
};

// Función helper para obtener todos los valores
export const getCaravanBodyTypeValues = (): string[] => {
  return caravanBodyTypes.map(bodyType => bodyType.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getCaravanBodyTypeNames = (): string[] => {
  return caravanBodyTypes.map(bodyType => bodyType.catalan);
};