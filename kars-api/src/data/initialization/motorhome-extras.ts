// Función helper para generar slug desde texto catalán
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[àáâäã]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôöõ]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[·]/g, '')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

// Extras para autocaravanas con traducciones en 4 idiomas
export const motorhomeExtras = [
  {
    catalan: "Nevera trimix",
    spanish: "Nevera trimix",
    french: "Réfrigérateur trimix",
    english: "Trimix refrigerator"
  },
  {
    catalan: "Nevera compressor",
    spanish: "Nevera compresor",
    french: "Réfrigérateur compresseur",
    english: "Compressor refrigerator"
  },
  {
    catalan: "Forn",
    spanish: "Horno",
    french: "Four",
    english: "Oven"
  },
  {
    catalan: "Microones",
    spanish: "Microondas",
    french: "Micro-ondes",
    english: "Microwave"
  },
  {
    catalan: "Fogons a gas",
    spanish: "Fogones a gas",
    french: "Cuisinière à gaz",
    english: "Gas stove"
  },
  {
    catalan: "Aigua calenta",
    spanish: "Agua caliente",
    french: "Eau chaude",
    english: "Hot water"
  },
  {
    catalan: "Calefacció Truma",
    spanish: "Calefacción Truma",
    french: "Chauffage Truma",
    english: "Truma heating"
  },
  {
    catalan: "Calefacció Eberspacher",
    spanish: "Calefacción Eberspacher",
    french: "Chauffage Eberspacher",
    english: "Eberspacher heating"
  },
  {
    catalan: "Aire condicionat sostre",
    spanish: "Aire acondicionado techo",
    french: "Climatisation de toit",
    english: "Roof air conditioning"
  },
  {
    catalan: "Panells solars",
    spanish: "Paneles solares",
    french: "Panneaux solaires",
    english: "Solar panels"
  },
  {
    catalan: "Inversor 12V-220V",
    spanish: "Inversor 12V-220V",
    french: "Convertisseur 12V-220V",
    english: "12V-220V inverter"
  },
  {
    catalan: "Bateria AGM",
    spanish: "Batería AGM",
    french: "Batterie AGM",
    english: "AGM battery"
  },
  {
    catalan: "Bateria Litio",
    spanish: "Batería Litio",
    french: "Batterie Lithium",
    english: "Lithium battery"
  },
  {
    catalan: "Carregador de bateries",
    spanish: "Cargador de baterías",
    french: "Chargeur de batteries",
    english: "Battery charger"
  },
  {
    catalan: "Presa exterior 220V",
    spanish: "Toma exterior 220V",
    french: "Prise extérieure 220V",
    english: "External 220V outlet"
  },
  {
    catalan: "Presa TVE",
    spanish: "Toma TVE",
    french: "Prise TV extérieure",
    english: "External TV outlet"
  },
  {
    catalan: "Antena TV",
    spanish: "Antena TV",
    french: "Antenne TV",
    english: "TV antenna"
  },
  {
    catalan: "Antena satèl·lit",
    spanish: "Antena satélite",
    french: "Antenne satellite",
    english: "Satellite antenna"
  },
  {
    catalan: "TV 12V",
    spanish: "TV 12V",
    french: "TV 12V",
    english: "12V TV"
  },
  {
    catalan: "Dutxa",
    spanish: "Ducha",
    french: "Douche",
    english: "Shower"
  },
  {
    catalan: "WC químic",
    spanish: "WC químico",
    french: "WC chimique",
    english: "Chemical toilet"
  },
  {
    catalan: "WC cassette",
    spanish: "WC cassette",
    french: "WC à cassette",
    english: "Cassette toilet"
  },
  {
    catalan: "Aigües brutes",
    spanish: "Aguas grises",
    french: "Eaux grises",
    english: "Grey water"
  },
  {
    catalan: "Dipòsit aigua neta",
    spanish: "Depósito agua limpia",
    french: "Réservoir eau propre",
    english: "Fresh water tank"
  },
  {
    catalan: "Bomba d'aigua",
    spanish: "Bomba de agua",
    french: "Pompe à eau",
    english: "Water pump"
  },
  {
    catalan: "Filtre d'aigua",
    spanish: "Filtro de agua",
    french: "Filtre à eau",
    english: "Water filter"
  },
  {
    catalan: "Tendal",
    spanish: "Toldo",
    french: "Auvent",
    english: "Awning"
  },
  {
    catalan: "Tendal elèctric",
    spanish: "Toldo eléctrico",
    french: "Auvent électrique",
    english: "Electric awning"
  },
  {
    catalan: "Porta mosquitera",
    spanish: "Puerta mosquitera",
    french: "Porte moustiquaire",
    english: "Fly screen door"
  },
  {
    catalan: "Finestres mosquitera",
    spanish: "Ventanas mosquitera",
    french: "Fenêtres moustiquaire",
    english: "Fly screen windows"
  },
  {
    catalan: "Claraboia",
    spanish: "Claraboya",
    french: "Lanterneau",
    english: "Skylight"
  },
  {
    catalan: "Claraboia ventiladora",
    spanish: "Claraboya ventiladora",
    french: "Lanterneau ventilateur",
    english: "Roof vent"
  },
  {
    catalan: "Llit articulat",
    spanish: "Cama articulada",
    french: "Lit articulé",
    english: "Adjustable bed"
  },
  {
    catalan: "Llit basculant",
    spanish: "Cama basculante",
    french: "Lit basculant",
    english: "Drop-down bed"
  },
  {
    catalan: "Llit central",
    spanish: "Cama central",
    french: "Lit central",
    english: "Central bed"
  },
  {
    catalan: "Llit isla",
    spanish: "Cama isla",
    french: "Lit îlot",
    english: "Island bed"
  },
  {
    catalan: "Sofà llit",
    spanish: "Sofá cama",
    french: "Canapé-lit",
    english: "Sofa bed"
  },
  {
    catalan: "Taula extraïble",
    spanish: "Mesa extraíble",
    french: "Table amovible",
    english: "Removable table"
  },
  {
    catalan: "Seients giratoris",
    spanish: "Asientos giratorios",
    french: "Sièges pivotants",
    english: "Swivel seats"
  },
  {
    catalan: "Armaris",
    spanish: "Armarios",
    french: "Placards",
    english: "Wardrobes"
  },
  {
    catalan: "Prestatges",
    spanish: "Estanterías",
    french: "Étagères",
    english: "Shelves"
  },
  {
    catalan: "Caixa forta",
    spanish: "Caja fuerte",
    french: "Coffre-fort",
    english: "Safe"
  },
  {
    catalan: "Garatge",
    spanish: "Garaje",
    french: "Soute",
    english: "Garage"
  },
  {
    catalan: "Portabicis",
    spanish: "Portabicicletas",
    french: "Porte-vélos",
    english: "Bike rack"
  },
  {
    catalan: "Escala exterior",
    spanish: "Escalera exterior",
    french: "Échelle extérieure",
    english: "External ladder"
  },
  {
    catalan: "Ganxo de remolc",
    spanish: "Enganche de remolque",
    french: "Attelage",
    english: "Tow hitch"
  },
  {
    catalan: "Sistema d'alarma",
    spanish: "Sistema de alarma",
    french: "Système d'alarme",
    english: "Alarm system"
  },
  {
    catalan: "Trackers GPS",
    spanish: "Localizador GPS",
    french: "Traceur GPS",
    english: "GPS tracker"
  },
  {
    catalan: "Caixa d'eines",
    spanish: "Caja de herramientas",
    french: "Boîte à outils",
    english: "Tool box"
  },
  {
    catalan: "Extintor",
    spanish: "Extintor",
    french: "Extincteur",
    english: "Fire extinguisher"
  },
  {
    catalan: "Detector de gas",
    spanish: "Detector de gas",
    french: "Détecteur de gaz",
    english: "Gas detector"
  },
  {
    catalan: "Detector de fum",
    spanish: "Detector de humo",
    french: "Détecteur de fumée",
    english: "Smoke detector"
  },
  {
    catalan: "Detector de monòxid",
    spanish: "Detector de monóxido",
    french: "Détecteur de monoxyde",
    english: "Carbon monoxide detector"
  }
].map(extra => ({
  ...extra,
  value: generateSlug(extra.catalan)
}));

export default motorhomeExtras;