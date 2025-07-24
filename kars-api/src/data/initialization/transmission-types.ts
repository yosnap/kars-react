// Tipos de cambio con traducciones
// Generado desde datos del sistema existente

export interface TransmissionTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const transmissionTypes: TransmissionTypeTranslation[] = [
  {
    catalan: "Auto-Seqüencial",
    spanish: "Auto-Secuencial",
    french: "Auto-Séquentielle",
    english: "Auto-Sequential",
    value: "auto-sequencial"
  },
  {
    catalan: "Automàtic",
    spanish: "Automático",
    french: "Automatique",
    english: "Automatic",
    value: "automatic"
  },
  {
    catalan: "Geartronic",
    spanish: "Geartronic",
    french: "Geartronic",
    english: "Geartronic",
    value: "geartronic"
  },
  {
    catalan: "Manual",
    spanish: "Manual",
    french: "Manuel",
    english: "Manual",
    value: "manual"
  },
  {
    catalan: "Semi-Automàtic",
    spanish: "Semi-Automático",
    french: "Semi-Automatique",
    english: "Semi-Automatic",
    value: "semi-automatic"
  },
  {
    catalan: "Seqüencial",
    spanish: "Secuencial",
    french: "Séquentielle",
    english: "Sequential",
    value: "sequencial"
  }
];

// Función helper para obtener tipo de cambio por valor
export const getTransmissionTypeByValue = (value: string): TransmissionTypeTranslation | undefined => {
  return transmissionTypes.find(transmission => transmission.value === value);
};

// Función helper para obtener todos los valores
export const getTransmissionTypeValues = (): string[] => {
  return transmissionTypes.map(transmission => transmission.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getTransmissionTypeNames = (): string[] => {
  return transmissionTypes.map(transmission => transmission.catalan);
};