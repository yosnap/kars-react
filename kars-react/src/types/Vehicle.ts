// Tipado unificado para vehículos Motoraldia
// https://api.motoraldia.com/api-documentation/

export type Vehicle = {
  id: string;
  "titol-anunci"?: string;
  "descripcio-anunci"?: string;
  
  // Multilingual descriptions
  "descripcio-anunci-ca"?: string; // Catalan (primary)
  "descripcio-anunci-en"?: string; // English
  "descripcio-anunci-fr"?: string; // French
  "descripcio-anunci-es"?: string; // Spanish
  
  // Sync fields for Motoraldia integration
  "needs-sync"?: boolean; // Flag for pending sync
  "motoraldia-vehicle-id"?: string; // ID in Motoraldia after sync
  "sync-error"?: string; // Last sync error message
  "synced-to-motoraldia-at"?: string; // When pushed to Motoraldia
  "marques-cotxe"?: string;
  "models-cotxe"?: string;
  "versio"?: string;
  "tipus-vehicle"?: string;
  "tipus-combustible"?: string;
  "tipus-canvi-cotxe"?: string;
  "tipus-propulsor"?: string;
  "estat-vehicle"?: string;
  "anunci-destacat"?: boolean;
  venut?: boolean;
  reservat?: boolean;
  "llibre-manteniment"?: boolean;
  "revisions-oficials"?: boolean;
  "impostos-deduibles"?: boolean;
  "vehicle-a-canvi"?: boolean;
  garantia?: boolean;
  "vehicle-accidentat"?: boolean;
  "any-fabricacio"?: string;
  any?: string;
  "nombre-propietaris"?: string;
  "emissions-vehicle"?: string;
  "numero-motors"?: string;
  traccio?: string;
  "roda-recanvi"?: string;
  "carrosseria-cotxe"?: string;
  "dies-caducitat"?: number;
  preu?: number;
  "preu-mensual"?: number;
  "preu-diari"?: number;
  "preu-antic"?: number;
  quilometratge?: number;
  cilindrada?: number;
  "potencia-cv"?: number;
  "potencia-kw"?: number;
  "portes-cotxe"?: number;
  "places-cotxe"?: number;
  "velocitat-max-cotxe"?: number;
  "acceleracio-0-100-cotxe"?: number;
  "capacitat-maleters-cotxe"?: number;
  "numero-maleters-cotxe"?: number;
  "imatge-destacada-url"?: string;
  "galeria-vehicle-urls"?: string[];
  "aire-acondicionat"?: boolean;
  climatitzacio?: string;
  "vehicle-fumador"?: string;
  "color-vehicle"?: string;
  "tipus-tapisseria"?: string;
  "color-tapisseria"?: string;
  "extres-cotxe"?: string[];
  "anunci-actiu"?: boolean;
  slug: string; // Slug obligatorio para rutas amigables
  // Otros campos relevantes pueden añadirse aquí
}; 