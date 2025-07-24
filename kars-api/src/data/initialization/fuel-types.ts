// Tipos de combustible con traducciones
// Generado desde datos del sistema existente

export interface FuelTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const fuelTypes: FuelTypeTranslation[] = [
  {
    catalan: "Altres",
    spanish: "Otros",
    french: "Autres",
    english: "Others",
    value: "altres"
  },
  {
    catalan: "Benzina",
    spanish: "Gasolina",
    french: "Essence",
    english: "Gasoline",
    value: "benzina"
  },
  {
    catalan: "Biocombustible",
    spanish: "Biocombustible",
    french: "Biocarburant",
    english: "Biofuel",
    value: "biocombustible"
  },
  {
    catalan: "Dièsel",
    spanish: "Diésel",
    french: "Diesel",
    english: "Diesel",
    value: "diesel"
  },
  {
    catalan: "Elèctric",
    spanish: "Eléctrico",
    french: "Électrique",
    english: "Electric",
    value: "electric"
  },
  {
    catalan: "Elèctric + Combustible",
    spanish: "Eléctrico + Combustible",
    french: "Électrique + Carburant",
    english: "Electric + Fuel",
    value: "electric-combustible"
  },
  {
    catalan: "Gas Natural",
    spanish: "Gas Natural",
    french: "Gaz Naturel",
    english: "Natural Gas",
    value: "gas-natural-gnc"
  },
  {
    catalan: "GLP",
    spanish: "GLP",
    french: "GPL",
    english: "LPG",
    value: "gas-liquat-glp"
  },
  {
    catalan: "Híbrid",
    spanish: "Híbrido",
    french: "Hybride",
    english: "Hybrid",
    value: "hibrid"
  },
  {
    catalan: "Híbrid Endollable",
    spanish: "Híbrido Enchufable",
    french: "Hybride Rechargeable",
    english: "Plug-in Hybrid",
    value: "hibrid-endollable"
  },
  {
    catalan: "Hidrògen",
    spanish: "Hidrógeno",
    french: "Hydrogène",
    english: "Hydrogen",
    value: "hidrogen"
  },
  {
    catalan: "Solar",
    spanish: "Solar",
    french: "Solaire",
    english: "Solar",
    value: "solar"
  },
  {
    catalan: "Solar + Combustible",
    spanish: "Solar + Combustible",
    french: "Solaire + Carburant",
    english: "Solar + Fuel",
    value: "solar-hibrid"
  }
];

// Función helper para obtener tipo de combustible por valor
export const getFuelTypeByValue = (value: string): FuelTypeTranslation | undefined => {
  return fuelTypes.find(fuel => fuel.value === value);
};

// Función helper para obtener todos los valores
export const getFuelTypeValues = (): string[] => {
  return fuelTypes.map(fuel => fuel.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getFuelTypeNames = (): string[] => {
  return fuelTypes.map(fuel => fuel.catalan);
};