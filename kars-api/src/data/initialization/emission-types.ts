// Tipos de emisiones con traducciones
// Generado desde datos del sistema existente

export interface EmissionTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const emissionTypes: EmissionTypeTranslation[] = [
  {
    catalan: "Euro1",
    spanish: "Euro1",
    french: "Euro1",
    english: "Euro1",
    value: "euro1"
  },
  {
    catalan: "Euro2",
    spanish: "Euro2",
    french: "Euro2",
    english: "Euro2",
    value: "euro2"
  },
  {
    catalan: "Euro3",
    spanish: "Euro3",
    french: "Euro3",
    english: "Euro3",
    value: "euro3"
  },
  {
    catalan: "Euro4",
    spanish: "Euro4",
    french: "Euro4",
    english: "Euro4",
    value: "euro4"
  },
  {
    catalan: "Euro5",
    spanish: "Euro5",
    french: "Euro5",
    english: "Euro5",
    value: "euro5"
  },
  {
    catalan: "Euro5+",
    spanish: "Euro5+",
    french: "Euro5+",
    english: "Euro5+",
    value: "euro5-plus"
  },
  {
    catalan: "Euro6",
    spanish: "Euro6",
    french: "Euro6",
    english: "Euro6",
    value: "euro6"
  }
];

// Función helper para obtener tipo de emisión por valor
export const getEmissionTypeByValue = (value: string): EmissionTypeTranslation | undefined => {
  return emissionTypes.find(emission => emission.value === value);
};

// Función helper para obtener todos los valores
export const getEmissionTypeValues = (): string[] => {
  return emissionTypes.map(emission => emission.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getEmissionTypeNames = (): string[] => {
  return emissionTypes.map(emission => emission.catalan);
};