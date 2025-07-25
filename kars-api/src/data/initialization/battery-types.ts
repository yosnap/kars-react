// Tipos de batería con traducciones
// Generado desde datos del sistema existente

export interface BatteryTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const batteryTypes: BatteryTypeTranslation[] = [
  {
    catalan: "Ions de Liti (Li-on)",
    spanish: "Iones de Litio (Li-ion)",
    french: "Ions de Lithium (Li-ion)",
    english: "Lithium Ion (Li-ion)",
    value: "ions-liti"
  },
  {
    catalan: "Níquel / Cadmi (NiCd)",
    spanish: "Níquel / Cadmio (NiCd)",
    french: "Nickel / Cadmium (NiCd)",
    english: "Nickel / Cadmium (NiCd)",
    value: "niquel-cadmi"
  },
  {
    catalan: "Fosfat de ferro i liti (LifeP04)",
    spanish: "Fosfato de hierro y litio (LifeP04)",
    french: "Phosphate de fer et lithium (LifeP04)",
    english: "Iron phosphate and lithium (LifeP04)",
    value: "fosfat-ferro"
  },
  {
    catalan: "Polimer ions de liti (Li-Po)",
    spanish: "Polímero iones de litio (Li-Po)",
    french: "Polymère ions de lithium (Li-Po)",
    english: "Lithium ion polymer (Li-Po)",
    value: "polimer-ions-liti"
  },
  {
    catalan: "Sodi-ion (Na-ion)",
    spanish: "Sodio-ion (Na-ion)",
    french: "Sodium-ion (Na-ion)",
    english: "Sodium-ion (Na-ion)",
    value: "sodi-ion"
  }
];

// Función helper para obtener tipo de batería por valor
export const getBatteryTypeByValue = (value: string): BatteryTypeTranslation | undefined => {
  return batteryTypes.find(battery => battery.value === value);
};

// Función helper para obtener todos los valores
export const getBatteryTypeValues = (): string[] => {
  return batteryTypes.map(battery => battery.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getBatteryTypeNames = (): string[] => {
  return batteryTypes.map(battery => battery.catalan);
};