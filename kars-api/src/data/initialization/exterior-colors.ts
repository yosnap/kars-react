// Colores exteriores con traducciones
// Generado desde datos del sistema existente

export interface ExteriorColorTranslation {
  catalan: string;
  spanish: string;
  french: string;
  english: string;
  value: string;
}

export const exteriorColors: ExteriorColorTranslation[] = [
  {
    catalan: "Bicolor",
    spanish: "Bicolor",
    french: "Bicolore",
    english: "Two-tone",
    value: "bicolor"
  },
  {
    catalan: "Blanc",
    spanish: "Blanco",
    french: "Blanc",
    english: "White",
    value: "blanc"
  },
  {
    catalan: "Negre",
    spanish: "Negro",
    french: "Noir",
    english: "Black",
    value: "negre"
  },
  {
    catalan: "Gris",
    spanish: "Gris",
    french: "Gris",
    english: "Gray",
    value: "gris"
  },
  {
    catalan: "Antracita",
    spanish: "Antracita",
    french: "Anthracite",
    english: "Anthracite",
    value: "antracita"
  },
  {
    catalan: "Beige",
    spanish: "Beige",
    french: "Beige",
    english: "Beige",
    value: "beige"
  },
  {
    catalan: "Camel",
    spanish: "Camel",
    french: "Camel",
    english: "Camel",
    value: "camel"
  },
  {
    catalan: "Marró",
    spanish: "Marrón",
    french: "Marron",
    english: "Brown",
    value: "marro"
  },
  {
    catalan: "Blau",
    spanish: "Azul",
    french: "Bleu",
    english: "Blue",
    value: "blau"
  },
  {
    catalan: "Bordeus",
    spanish: "Burdeos",
    french: "Bordeaux",
    english: "Burgundy",
    value: "bordeus"
  },
  {
    catalan: "Granat",
    spanish: "Granate",
    french: "Grenat",
    english: "Maroon",
    value: "granat"
  },
  {
    catalan: "Lila",
    spanish: "Lila",
    french: "Lilas",
    english: "Purple",
    value: "lila"
  },
  {
    catalan: "Vermell",
    spanish: "Rojo",
    french: "Rouge",
    english: "Red",
    value: "vermell"
  },
  {
    catalan: "Taronja",
    spanish: "Naranja",
    french: "Orange",
    english: "Orange",
    value: "taronja"
  },
  {
    catalan: "Groc",
    spanish: "Amarillo",
    french: "Jaune",
    english: "Yellow",
    value: "groc"
  },
  {
    catalan: "Verd",
    spanish: "Verde",
    french: "Vert",
    english: "Green",
    value: "verd"
  },
  {
    catalan: "Altres",
    spanish: "Otros",
    french: "Autres",
    english: "Others",
    value: "altres-exterior"
  },
  {
    catalan: "Rosa",
    spanish: "Rosa",
    french: "Rose",
    english: "Pink",
    value: "rosa"
  },
  {
    catalan: "Daurat",
    spanish: "Dorado",
    french: "Doré",
    english: "Gold",
    value: "daurat"
  }
];

// Función helper para obtener color exterior por valor
export const getExteriorColorByValue = (value: string): ExteriorColorTranslation | undefined => {
  return exteriorColors.find(color => color.value === value);
};

// Función helper para obtener todos los valores
export const getExteriorColorValues = (): string[] => {
  return exteriorColors.map(color => color.value);
};

// Función helper para obtener nombres en catalán (idioma principal)
export const getExteriorColorNames = (): string[] => {
  return exteriorColors.map(color => color.catalan);
};