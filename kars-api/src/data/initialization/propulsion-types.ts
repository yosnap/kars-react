// Tipos de propulsor con traducciones
// Generado desde datos del sistema existente

export interface PropulsionTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const propulsionTypes: PropulsionTypeTranslation[] = [
  {
    catalan: "Combustió",
    spanish: "Combustión",
    french: "Combustion",
    english: "Combustion",
    value: "combustio"
  },
  {
    catalan: "Elèctric",
    spanish: "Eléctrico",
    french: "Électrique",
    english: "Electric",
    value: "electric"
  },
  {
    catalan: "Híbrid",
    spanish: "Híbrido",
    french: "Hybride",
    english: "Hybrid",
    value: "hibrid"
  },
  {
    catalan: "Hibrid Endollable",
    spanish: "Híbrido Enchufable",
    french: "Hybride Rechargeable",
    english: "Plug-in Hybrid",
    value: "hibrid-endollable"
  }
];

// Función helper para obtener tipo de propulsor por valor
export const getPropulsionTypeByValue = (value: string): PropulsionTypeTranslation | undefined => {
  return propulsionTypes.find(propulsion => propulsion.value === value);
};

// Función helper para obtener todos los valores
export const getPropulsionTypeValues = (): string[] => {
  return propulsionTypes.map(propulsion => propulsion.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getPropulsionTypeNames = (): string[] => {
  return propulsionTypes.map(propulsion => propulsion.catalan);
};