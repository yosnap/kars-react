// Conectores eléctricos con traducciones
// Generado desde datos del sistema existente

export interface ElectricConnectorTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const electricConnectors: ElectricConnectorTranslation[] = [
  {
    catalan: "Connector Shuko",
    spanish: "Conector Shuko",
    french: "Connecteur Shuko",
    english: "Shuko Connector",
    value: "connector-shuko"
  },
  {
    catalan: "Connector Mennekes (Tipo 2)",
    spanish: "Conector Mennekes (Tipo 2)",
    french: "Connecteur Mennekes (Type 2)",
    english: "Mennekes Connector (Type 2)",
    value: "connector-mennekes"
  },
  {
    catalan: "Connector combinado CSS (Combo 2)",
    spanish: "Conector combinado CSS (Combo 2)",
    french: "Connecteur combiné CSS (Combo 2)",
    english: "Combined CSS Connector (Combo 2)",
    value: "connector-combinado-css"
  },
  {
    catalan: "Connector Supercharger",
    spanish: "Conector Supercharger",
    french: "Connecteur Supercharger",
    english: "Supercharger Connector",
    value: "connector-supercharger"
  },
  {
    catalan: "Connector CHAdeMo",
    spanish: "Conector CHAdeMo",
    french: "Connecteur CHAdeMo",
    english: "CHAdeMo Connector",
    value: "conector-chademo"
  },
  {
    catalan: "Connector SAE J1772 (Tipo 1)",
    spanish: "Conector SAE J1772 (Tipo 1)",
    french: "Connecteur SAE J1772 (Type 1)",
    english: "SAE J1772 Connector (Type 1)",
    value: "conector-sae-j1772"
  }
];

// Función helper para obtener conector eléctrico por valor
export const getElectricConnectorByValue = (value: string): ElectricConnectorTranslation | undefined => {
  return electricConnectors.find(connector => connector.value === value);
};

// Función helper para obtener todos los valores
export const getElectricConnectorValues = (): string[] => {
  return electricConnectors.map(connector => connector.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getElectricConnectorNames = (): string[] => {
  return electricConnectors.map(connector => connector.catalan);
};