// Estados de vehículos con traducciones
// Generado desde datos del sistema existente

export interface VehicleStateTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const vehicleStates: VehicleStateTranslation[] = [
  {
    catalan: "Clàssic",
    spanish: "Clásico", 
    french: "Classique",
    english: "Classic",
    value: "classic"
  },
  {
    catalan: "Km0",
    spanish: "Km0",
    french: "Km0", 
    english: "Km0",
    value: "km0-gerencia"
  },
  {
    catalan: "Lloguer",
    spanish: "Alquiler",
    french: "Location",
    english: "Rental",
    value: "lloguer"
  },
  {
    catalan: "Nou",
    spanish: "Nuevo",
    french: "Neuf",
    english: "New",
    value: "nou"
  },
  {
    catalan: "Ocasió",
    spanish: "Ocasión",
    french: "Occasion",
    english: "Bargain",
    value: "ocasio"
  },
  {
    catalan: "Renting",
    spanish: "Renting",
    french: "Renting",
    english: "Renting",
    value: "renting"
  },
  {
    catalan: "Seminou",
    spanish: "Seminuevo",
    french: "Semi-neuf",
    english: "Pre-owned",
    value: "seminou"
  }
];

// Función helper para obtener estado por valor
export const getVehicleStateByValue = (value: string): VehicleStateTranslation | undefined => {
  return vehicleStates.find(state => state.value === value);
};

// Función helper para obtener todos los valores
export const getVehicleStateValues = (): string[] => {
  return vehicleStates.map(state => state.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getVehicleStateNames = (): string[] => {
  return vehicleStates.map(state => state.catalan);
};