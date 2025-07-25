// Cables de recarga con traducciones
// Generado desde datos del sistema existente

export interface ChargingCableTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const chargingCables: ChargingCableTranslation[] = [
  {
    catalan: "Mennekes",
    spanish: "Mennekes",
    french: "Mennekes",
    english: "Mennekes",
    value: "mennekes"
  },
  {
    catalan: "CSS Combo",
    spanish: "CSS Combo",
    french: "CSS Combo",
    english: "CSS Combo",
    value: "css-combo"
  },
  {
    catalan: "Schuko",
    spanish: "Schuko",
    french: "Schuko",
    english: "Schuko",
    value: "cables-schuko"
  },
  {
    catalan: "Súpercharger",
    spanish: "Súpercharger",
    french: "Súpercharger",
    english: "Supercharger",
    value: "cables-supercharger"
  },
  {
    catalan: "CHAdeMo",
    spanish: "CHAdeMo",
    french: "CHAdeMo",
    english: "CHAdeMo",
    value: "cables-chademo"
  },
  {
    catalan: "SAE J1772 Tipo1",
    spanish: "SAE J1772 Tipo1",
    french: "SAE J1772 Type1",
    english: "SAE J1772 Type1",
    value: "cables-sae-j1772-tipo1"
  }
];

// Función helper para obtener cable de recarga por valor
export const getChargingCableByValue = (value: string): ChargingCableTranslation | undefined => {
  return chargingCables.find(cable => cable.value === value);
};

// Función helper para obtener todos los valores
export const getChargingCableValues = (): string[] => {
  return chargingCables.map(cable => cable.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getChargingCableNames = (): string[] => {
  return chargingCables.map(cable => cable.catalan);
};