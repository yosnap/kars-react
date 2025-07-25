// Velocidades de recarga con traducciones
// Generado desde datos del sistema existente

export interface ChargingSpeedTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const chargingSpeeds: ChargingSpeedTranslation[] = [
  {
    catalan: "Lenta",
    spanish: "Lenta",
    french: "Lente",
    english: "Slow",
    value: "v_lenta"
  },
  {
    catalan: "Mitjana",
    spanish: "Media",
    french: "Moyenne",
    english: "Medium",
    value: "v_mitjana"
  },
  {
    catalan: "Ràpida",
    spanish: "Rápida",
    french: "Rapide",
    english: "Fast",
    value: "v_rapida"
  },
  {
    catalan: "Súper ràpida",
    spanish: "Súper rápida",
    french: "Super rapide",
    english: "Super fast",
    value: "v_super_rapida"
  }
];

// Función helper para obtener velocidad de recarga por valor
export const getChargingSpeedByValue = (value: string): ChargingSpeedTranslation | undefined => {
  return chargingSpeeds.find(speed => speed.value === value);
};

// Función helper para obtener todos los valores
export const getChargingSpeedValues = (): string[] => {
  return chargingSpeeds.map(speed => speed.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getChargingSpeedNames = (): string[] => {
  return chargingSpeeds.map(speed => speed.catalan);
};