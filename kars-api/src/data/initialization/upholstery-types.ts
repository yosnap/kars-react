// Tipos de tapicería con traducciones
// Generado desde datos del sistema existente

export interface UpholsteryTypeTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const upholsteryTypes: UpholsteryTypeTranslation[] = [
  {
    catalan: "Alcántara",
    spanish: "Alcántara",
    french: "Alcantara",
    english: "Alcantara",
    value: "alcantara"
  },
  {
    catalan: "Cuir",
    spanish: "Cuero",
    french: "Cuir",
    english: "Leather",
    value: "cuir"
  },
  {
    catalan: "Cuir / Alcántara",
    spanish: "Cuero / Alcántara",
    french: "Cuir / Alcantara",
    english: "Leather / Alcantara",
    value: "cuir-alcantara"
  },
  {
    catalan: "Cuir sintètic",
    spanish: "Cuero sintético",
    french: "Cuir synthétique",
    english: "Synthetic Leather",
    value: "cuir-sintetic"
  },
  {
    catalan: "Teixit",
    spanish: "Tela",
    french: "Tissu",
    english: "Fabric",
    value: "teixit"
  },
  {
    catalan: "Teixit / Alcántara",
    spanish: "Tela / Alcántara",
    french: "Tissu / Alcantara",
    english: "Fabric / Alcantara",
    value: "teixit-alcantara"
  },
  {
    catalan: "Teixit / Cuir",
    spanish: "Tela / Cuero",
    french: "Tissu / Cuir",
    english: "Fabric / Leather",
    value: "teixit-cuir"
  },
  {
    catalan: "Altres",
    spanish: "Otros",
    french: "Autres",
    english: "Others",
    value: "altres-tipus-tapisseria"
  }
];

// Función helper para obtener tipo de tapicería por valor
export const getUpholsteryTypeByValue = (value: string): UpholsteryTypeTranslation | undefined => {
  return upholsteryTypes.find(upholstery => upholstery.value === value);
};

// Función helper para obtener todos los valores
export const getUpholsteryTypeValues = (): string[] => {
  return upholsteryTypes.map(upholstery => upholstery.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getUpholsteryTypeNames = (): string[] => {
  return upholsteryTypes.map(upholstery => upholstery.catalan);
};