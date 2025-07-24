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

// Extras para coches con traducciones en 4 idiomas
export const carExtras = [
  {
    catalan: "Airbag conductor",
    spanish: "Airbag conductor",
    french: "Airbag conducteur",
    english: "Driver airbag"
  },
  {
    catalan: "Airbag copilot",
    spanish: "Airbag copiloto",
    french: "Airbag passager",
    english: "Passenger airbag"
  },
  {
    catalan: "Airbag lateral",
    spanish: "Airbag lateral",
    french: "Airbag latéral",
    english: "Side airbag"
  },
  {
    catalan: "Airbag cortina",
    spanish: "Airbag de cortina",
    french: "Airbag rideau",
    english: "Curtain airbag"
  },
  {
    catalan: "ABS",
    spanish: "ABS",
    french: "ABS",
    english: "ABS"
  },
  {
    catalan: "ESP",
    spanish: "ESP",
    french: "ESP",
    english: "ESP"
  },
  {
    catalan: "Sistema de frenada d'emergència",
    spanish: "Sistema de frenado de emergencia",
    french: "Système de freinage d'urgence",
    english: "Emergency braking system"
  },
  {
    catalan: "Assistència de manteniment de carril",
    spanish: "Asistencia de mantenimiento de carril",
    french: "Assistance de maintien de voie",
    english: "Lane keeping assist"
  },
  {
    catalan: "Detector d'angle mort",
    spanish: "Detector de ángulo muerto",
    french: "Détecteur d'angle mort",
    english: "Blind spot monitor"
  },
  {
    catalan: "Avisador sortida carril",
    spanish: "Avisador salida carril",
    french: "Avertisseur sortie de voie",
    english: "Lane departure warning"
  },
  {
    catalan: "Alerta de somnolència",
    spanish: "Alerta de somnolencia",
    french: "Alerte de somnolence",
    english: "Drowsiness alert"
  },
  {
    catalan: "Control de creuer adaptatiu",
    spanish: "Control de crucero adaptativo",
    french: "Régulateur de vitesse adaptatif",
    english: "Adaptive cruise control"
  },
  {
    catalan: "Començada en pendent",
    spanish: "Arranque en pendiente",
    french: "Aide au démarrage en côte",
    english: "Hill start assist"
  },
  {
    catalan: "Descens controlat",
    spanish: "Descenso controlado",
    french: "Descente contrôlée",
    english: "Hill descent control"
  },
  {
    catalan: "Sistema antiarrossegament",
    spanish: "Sistema antiarrastre",
    french: "Système antipatinage",
    english: "Traction control"
  },
  {
    catalan: "Aire condicionat",
    spanish: "Aire acondicionado",
    french: "Climatisation",
    english: "Air conditioning"
  },
  {
    catalan: "Climatitzador automàtic bizona",
    spanish: "Climatizador automático bizona",
    french: "Climatisation automatique bi-zone",
    english: "Automatic dual-zone climate control"
  },
  {
    catalan: "Climatitzador automàtic trizona",
    spanish: "Climatizador automático trizona",
    french: "Climatisation automatique tri-zone",
    english: "Automatic tri-zone climate control"
  },
  {
    catalan: "Seients amb calefacció",
    spanish: "Asientos con calefacción",
    french: "Sièges chauffants",
    english: "Heated seats"
  },
  {
    catalan: "Seients ventilats",
    spanish: "Asientos ventilados",
    french: "Sièges ventilés",
    english: "Ventilated seats"
  },
  {
    catalan: "Seients de memòria",
    spanish: "Asientos de memoria",
    french: "Sièges à mémoire",
    english: "Memory seats"
  },
  {
    catalan: "Seients elèctrics",
    spanish: "Asientos eléctricos",
    french: "Sièges électriques",
    english: "Electric seats"
  },
  {
    catalan: "Volant ajustable elèctricament",
    spanish: "Volante ajustable eléctricamente",
    french: "Volant réglable électriquement",
    english: "Electrically adjustable steering wheel"
  },
  {
    catalan: "Volant de cuir",
    spanish: "Volante de cuero",
    french: "Volant en cuir",
    english: "Leather steering wheel"
  },
  {
    catalan: "Volant multifunció",
    spanish: "Volante multifunción",
    french: "Volant multifonction",
    english: "Multifunction steering wheel"
  },
  {
    catalan: "Finestres elèctriques davant",
    spanish: "Elevalunas eléctricos delanteros",
    french: "Lève-vitres électriques avant",
    english: "Front electric windows"
  },
  {
    catalan: "Finestres elèctriques darrera",
    spanish: "Elevalunas eléctricos traseros",
    french: "Lève-vitres électriques arrière",
    english: "Rear electric windows"
  },
  {
    catalan: "Rètols elèctrics",
    spanish: "Retrovisores eléctricos",
    french: "Rétroviseurs électriques",
    english: "Electric mirrors"
  },
  {
    catalan: "Rètols tèrmics",
    spanish: "Retrovisores térmicos",
    french: "Rétroviseurs chauffants",
    english: "Heated mirrors"
  },
  {
    catalan: "Rètols plegables",
    spanish: "Retrovisores plegables",
    french: "Rétroviseurs rabattables",
    english: "Folding mirrors"
  },
  {
    catalan: "Sistema de navegació GPS",
    spanish: "Sistema de navegación GPS",
    french: "Système de navigation GPS",
    english: "GPS navigation system"
  },
  {
    catalan: "Pantalla tàctil",
    spanish: "Pantalla táctil",
    french: "Écran tactile",
    english: "Touch screen"
  },
  {
    catalan: "Bluetooth",
    spanish: "Bluetooth",
    french: "Bluetooth",
    english: "Bluetooth"
  },
  {
    catalan: "Connexió USB",
    spanish: "Conexión USB",
    french: "Connexion USB",
    english: "USB connection"
  },
  {
    catalan: "Sistema de càrrega inalàmbrica",
    spanish: "Sistema de carga inalámbrica",
    french: "Système de charge sans fil",
    english: "Wireless charging system"
  },
  {
    catalan: "Android Auto",
    spanish: "Android Auto",
    french: "Android Auto",
    english: "Android Auto"
  },
  {
    catalan: "Apple CarPlay",
    spanish: "Apple CarPlay",
    french: "Apple CarPlay",
    english: "Apple CarPlay"
  },
  {
    catalan: "Càmera de visió trasera",
    spanish: "Cámara de visión trasera",
    french: "Caméra de recul",
    english: "Rear view camera"
  },
  {
    catalan: "Càmera 360 graus",
    spanish: "Cámara 360 grados",
    french: "Caméra 360 degrés",
    english: "360-degree camera"
  },
  {
    catalan: "Sensors de pàrquing davant",
    spanish: "Sensores de aparcamiento delanteros",
    french: "Capteurs de stationnement avant",
    english: "Front parking sensors"
  },
  {
    catalan: "Sensors de pàrquing darrera",
    spanish: "Sensores de aparcamiento traseros",
    french: "Capteurs de stationnement arrière",
    english: "Rear parking sensors"
  },
  {
    catalan: "Aparcament automàtic",
    spanish: "Aparcamiento automático",
    french: "Stationnement automatique",
    english: "Automatic parking"
  },
  {
    catalan: "Llums LED davant",
    spanish: "Luces LED delanteras",
    french: "Phares LED avant",
    english: "Front LED lights"
  },
  {
    catalan: "Llums LED darrera",
    spanish: "Luces LED traseras",
    french: "Feux LED arrière",
    english: "Rear LED lights"
  },
  {
    catalan: "Llums de dia LED",
    spanish: "Luces de día LED",
    french: "Feux de jour LED",
    english: "LED daytime running lights"
  },
  {
    catalan: "Llums adaptatius",
    spanish: "Luces adaptativas",
    french: "Phares adaptatifs",
    english: "Adaptive headlights"
  },
  {
    catalan: "Llums automàtics",
    spanish: "Luces automáticas",
    french: "Phares automatiques",
    english: "Automatic headlights"
  },
  {
    catalan: "Sostre solar",
    spanish: "Techo solar",
    french: "Toit ouvrant",
    english: "Sunroof"
  },
  {
    catalan: "Sostre panoràmic",
    spanish: "Techo panorámico",
    french: "Toit panoramique",
    english: "Panoramic roof"
  },
  {
    catalan: "Sostre convertible",
    spanish: "Techo convertible",
    french: "Toit convertible",
    english: "Convertible roof"
  },
  {
    catalan: "Tapisseria de cuir",
    spanish: "Tapicería de cuero",
    french: "Sellerie en cuir",
    english: "Leather upholstery"
  },
  {
    catalan: "Jantes d'aliatge",
    spanish: "Llantas de aleación",
    french: "Jantes en alliage",
    english: "Alloy wheels"
  },
  {
    catalan: "Roda de reserva",
    spanish: "Rueda de repuesto",
    french: "Roue de secours",
    english: "Spare wheel"
  },
  {
    catalan: "Kit antipinxades",
    spanish: "Kit antipinchazos",
    french: "Kit anti-crevaison",
    english: "Puncture repair kit"
  },
  {
    catalan: "Ganxo de remolc",
    spanish: "Enganche de remolque",
    french: "Attelage de remorque",
    english: "Tow hitch"
  },
  {
    catalan: "Barres del sostre",
    spanish: "Barras del techo",
    french: "Barres de toit",
    english: "Roof bars"
  },
  {
    catalan: "Sistema de so premium",
    spanish: "Sistema de sonido premium",
    french: "Système audio premium",
    english: "Premium sound system"
  },
  {
    catalan: "Entrada sense clau",
    spanish: "Entrada sin llave",
    french: "Entrée sans clé",
    english: "Keyless entry"
  },
  {
    catalan: "Arrencada sense clau",
    spanish: "Arranque sin llave",
    french: "Démarrage sans clé",
    english: "Keyless start"
  },
  {
    catalan: "Avís de manteniment",
    spanish: "Aviso de mantenimiento",
    french: "Rappel d'entretien",
    english: "Maintenance reminder"
  }
].map(extra => ({
  ...extra,
  value: generateSlug(extra.catalan)
}));

export default carExtras;