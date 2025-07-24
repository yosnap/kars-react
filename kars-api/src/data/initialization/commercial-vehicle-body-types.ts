// Tipos de carrocería para vehículos comerciales con traducciones
// Generado desde datos del sistema existente

export interface CommercialVehicleBodyTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const commercialVehicleBodyTypes: CommercialVehicleBodyTypeTranslation[] = [
  {
    catalan: "Furgoneta comercial",
    spanish: "Furgoneta comercial",
    french: "Fourgonnette commerciale",
    english: "Commercial Van",
    value: "c-furgo-industrial"
  }
];

// Función helper para obtener tipo de carrocería comercial por valor
export const getCommercialVehicleBodyTypeByValue = (value: string): CommercialVehicleBodyTypeTranslation | undefined => {
  return commercialVehicleBodyTypes.find(bodyType => bodyType.value === value);
};

// Función helper para obtener todos los valores
export const getCommercialVehicleBodyTypeValues = (): string[] => {
  return commercialVehicleBodyTypes.map(bodyType => bodyType.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getCommercialVehicleBodyTypeNames = (): string[] => {
  return commercialVehicleBodyTypes.map(bodyType => bodyType.catalan);
};