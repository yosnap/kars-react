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

// Extras para motos con traducciones en 4 idiomas
export const motorcycleExtras = [
  {
    catalan: "ABS",
    spanish: "ABS",
    french: "ABS",
    english: "ABS"
  },
  {
    catalan: "Control de tracció",
    spanish: "Control de tracción",
    french: "Contrôle de traction",
    english: "Traction control"
  },
  {
    catalan: "Control de creuer",
    spanish: "Control de crucero",
    french: "Régulateur de vitesse",
    english: "Cruise control"
  },
  {
    catalan: "Modes de conducció",
    spanish: "Modos de conducción",
    french: "Modes de conduite",
    english: "Riding modes"
  },
  {
    catalan: "Suspensió ajustable",
    spanish: "Suspensión ajustable",
    french: "Suspension réglable",
    english: "Adjustable suspension"
  },
  {
    catalan: "Suspensió electrònica",
    spanish: "Suspensión electrónica",
    french: "Suspension électronique",
    english: "Electronic suspension"
  },
  {
    catalan: "Embrague antisalt",
    spanish: "Embrague antisalto",
    french: "Embrayage antisaut",
    english: "Slipper clutch"
  },
  {
    catalan: "Quickshifter",
    spanish: "Quickshifter",
    french: "Quickshifter",
    english: "Quickshifter"
  },
  {
    catalan: "Llums LED",
    spanish: "Luces LED",
    french: "Éclairage LED",
    english: "LED lights"
  },
  {
    catalan: "Llums de dia LED",
    spanish: "Luces de día LED",
    french: "Feux de jour LED",
    english: "LED daytime running lights"
  },
  {
    catalan: "Llums adaptatives",
    spanish: "Luces adaptativas",
    french: "Éclairage adaptatif",
    english: "Adaptive lighting"
  },
  {
    catalan: "Pantalla TFT",
    spanish: "Pantalla TFT",
    french: "Écran TFT",
    english: "TFT display"
  },
  {
    catalan: "Connectivitat",
    spanish: "Conectividad",
    french: "Connectivité",
    english: "Connectivity"
  },
  {
    catalan: "Navegador GPS",
    spanish: "Navegador GPS",
    french: "Navigation GPS",
    english: "GPS navigation"
  },
  {
    catalan: "Casc integral",
    spanish: "Casco integral",
    french: "Casque intégral",
    english: "Full face helmet"
  },
  {
    catalan: "Casc modular",
    spanish: "Casco modular",
    french: "Casque modulaire",
    english: "Modular helmet"
  },
  {
    catalan: "Jaqueta de cuir",
    spanish: "Chaqueta de cuero",
    french: "Veste en cuir",
    english: "Leather jacket"
  },
  {
    catalan: "Jaqueta tèxtil",
    spanish: "Chaqueta textil",
    french: "Veste textile",
    english: "Textile jacket"
  },
  {
    catalan: "Pantalons de cuir",
    spanish: "Pantalones de cuero",
    french: "Pantalon en cuir",
    english: "Leather pants"
  },
  {
    catalan: "Pantalons tèxtils",
    spanish: "Pantalones textiles",
    french: "Pantalon textile",
    english: "Textile pants"
  },
  {
    catalan: "Guants",
    spanish: "Guantes",
    french: "Gants",
    english: "Gloves"
  },
  {
    catalan: "Botes",
    spanish: "Botas",
    french: "Bottes",
    english: "Boots"
  },
  {
    catalan: "Proteccions genoll",
    spanish: "Protecciones rodilla",
    french: "Protections genoux",
    english: "Knee protection"
  },
  {
    catalan: "Proteccions colze",
    spanish: "Protecciones codo",
    french: "Protections coudes",
    english: "Elbow protection"
  },
  {
    catalan: "Proteccions esquena",
    spanish: "Protecciones espalda",
    french: "Protections dos",
    english: "Back protection"
  },
  {
    catalan: "Topcase",
    spanish: "Baúl trasero",
    french: "Top case",
    english: "Top box"
  },
  {
    catalan: "Maletes laterals",
    spanish: "Maletas laterales",
    french: "Sacoches latérales",
    english: "Side cases"
  },
  {
    catalan: "Dipòsit de reserva",
    spanish: "Tanque de reserva",
    french: "Réservoir de réserve",
    english: "Reserve tank"
  },
  {
    catalan: "Seient passatger",
    spanish: "Asiento pasajero",
    french: "Siège passager",
    english: "Passenger seat"
  },
  {
    catalan: "Seient de pilot esportiu",
    spanish: "Asiento de piloto deportivo",
    french: "Selle pilote sport",
    english: "Sport rider seat"
  },
  {
    catalan: "Seient confort",
    spanish: "Asiento confort",
    french: "Selle confort",
    english: "Comfort seat"
  },
  {
    catalan: "Seient amb calefacció",
    spanish: "Asiento con calefacción",
    french: "Selle chauffante",
    english: "Heated seat"
  },
  {
    catalan: "Puny de passatger",
    spanish: "Asidero de pasajero",
    french: "Poignée passager",
    english: "Passenger grab handle"
  },
  {
    catalan: "Reposapeus passatger",
    spanish: "Estriberas pasajero",
    french: "Repose-pieds passager",
    english: "Passenger footpegs"
  },
  {
    catalan: "Paravents",
    spanish: "Parabrisas",
    french: "Pare-brise",
    english: "Windshield"
  },
  {
    catalan: "Paravents ajustable",
    spanish: "Parabrisas ajustable",
    french: "Pare-brise réglable",
    english: "Adjustable windshield"
  },
  {
    catalan: "Puny de frè auxiliar",
    spanish: "Palanca de freno auxiliar",
    french: "Levier de frein auxiliaire",
    english: "Auxiliary brake lever"
  },
  {
    catalan: "Sistema antirrobo",
    spanish: "Sistema antirrobo",
    french: "Système antivol",
    english: "Anti-theft system"
  },
  {
    catalan: "Alarma",
    spanish: "Alarma",
    french: "Alarme",
    english: "Alarm"
  },
  {
    catalan: "Localizador GPS",
    spanish: "Localizador GPS",
    french: "Traceur GPS",
    english: "GPS tracker"
  },
  {
    catalan: "Kit de reparació",
    spanish: "Kit de reparación",
    french: "Kit de réparation",
    english: "Repair kit"
  },
  {
    catalan: "Compressor portatil",
    spanish: "Compresor portátil",
    french: "Compresseur portable",
    english: "Portable compressor"
  },
  {
    catalan: "Carregador USB",
    spanish: "Cargador USB",
    french: "Chargeur USB",
    english: "USB charger"
  },
  {
    catalan: "Presa 12V",
    spanish: "Toma 12V",
    french: "Prise 12V",
    english: "12V outlet"
  },
  {
    catalan: "Il·luminació auxiliar",
    spanish: "Iluminación auxiliar",
    french: "Éclairage auxiliaire",
    english: "Auxiliary lighting"
  },
  {
    catalan: "Deflectors de vent",
    spanish: "Deflectores de viento",
    french: "Déflecteurs de vent",
    english: "Wind deflectors"
  },
  {
    catalan: "Proteccions motor",
    spanish: "Protecciones motor",
    french: "Protections moteur",
    english: "Engine protection"
  },
  {
    catalan: "Barres de protecció",
    spanish: "Barras de protección",
    french: "Barres de protection",
    english: "Crash bars"
  },
  {
    catalan: "Sistema d'escapament esportiu",
    spanish: "Sistema de escape deportivo",
    french: "Système d'échappement sport",
    english: "Sport exhaust system"
  }
].map(extra => ({
  ...extra,
  value: generateSlug(extra.catalan)
}));

export default motorcycleExtras;