// Traducciones iniciales para el sistema de vehículos
// Estas traducciones se pueden importar automáticamente o usar como referencia

export interface InitialVehicleTranslation {
  key: string;
  category: 'technical' | 'features' | 'commercial' | 'general';
  ca: string;
  es: string;
  en: string;
  fr: string;
  description?: string;
}

export const initialVehicleTranslations: InitialVehicleTranslation[] = [
  // Especificaciones técnicas
  {
    key: 'vehicle.year',
    category: 'technical',
    ca: 'Any',
    es: 'Año',
    en: 'Year',
    fr: 'Année',
    description: 'Año de fabricación del vehículo'
  },
  {
    key: 'vehicle.engine',
    category: 'technical',
    ca: 'Motor',
    es: 'Motor',
    en: 'Engine',
    fr: 'Moteur',
    description: 'Especificaciones del motor'
  },
  {
    key: 'vehicle.power',
    category: 'technical',
    ca: 'Potència',
    es: 'Potencia',
    en: 'Power',
    fr: 'Puissance',
    description: 'Potencia del vehículo en CV o HP'
  },
  {
    key: 'vehicle.fuel_type',
    category: 'technical',
    ca: 'Combustible',
    es: 'Combustible',
    en: 'Fuel type',
    fr: 'Carburant',
    description: 'Tipo de combustible o energía'
  },
  {
    key: 'vehicle.transmission',
    category: 'technical',
    ca: 'Canvi',
    es: 'Cambio',
    en: 'Transmission',
    fr: 'Transmission',
    description: 'Tipo de transmisión'
  },
  {
    key: 'vehicle.mileage',
    category: 'technical',
    ca: 'Quilometratge',
    es: 'Kilometraje',
    en: 'Mileage',
    fr: 'Kilométrage',
    description: 'Distancia recorrida por el vehículo'
  },
  {
    key: 'vehicle.emissions',
    category: 'technical',
    ca: 'Emissions CO2',
    es: 'Emisiones CO2',
    en: 'CO2 emissions',
    fr: 'Émissions CO2',
    description: 'Emisiones de CO2 del vehículo'
  },
  {
    key: 'vehicle.consumption_urban',
    category: 'technical',
    ca: 'Consum urbà',
    es: 'Consumo urbano',
    en: 'Urban consumption',
    fr: 'Consommation urbaine',
    description: 'Consumo en ciudad'
  },
  {
    key: 'vehicle.consumption_highway',
    category: 'technical',
    ca: 'Consum carretera',
    es: 'Consumo carretera',
    en: 'Highway consumption',
    fr: 'Consommation autoroute',
    description: 'Consumo en carretera'
  },
  {
    key: 'vehicle.consumption_mixed',
    category: 'technical',
    ca: 'Consum mixt',
    es: 'Consumo mixto',
    en: 'Mixed consumption',
    fr: 'Consommation mixte',
    description: 'Consumo promedio'
  },
  {
    key: 'vehicle.traction',
    category: 'technical',
    ca: 'Tracció',
    es: 'Tracción',
    en: 'Traction',
    fr: 'Traction',
    description: 'Sistema de tracción del vehículo'
  },

  // Características físicas y features
  {
    key: 'vehicle.bodywork',
    category: 'features',
    ca: 'Carroceria',
    es: 'Carrocería',
    en: 'Bodywork',
    fr: 'Carrosserie',
    description: 'Tipo de carrocería del vehículo'
  },
  {
    key: 'vehicle.doors',
    category: 'features',
    ca: 'Portes',
    es: 'Puertas',
    en: 'Doors',
    fr: 'Portes',
    description: 'Número de puertas'
  },
  {
    key: 'vehicle.seats',
    category: 'features',
    ca: 'Places',
    es: 'Plazas',
    en: 'Seats',
    fr: 'Places',
    description: 'Número de asientos'
  },
  {
    key: 'vehicle.color',
    category: 'features',
    ca: 'Color exterior',
    es: 'Color exterior',
    en: 'Exterior color',
    fr: 'Couleur extérieure',
    description: 'Color exterior del vehículo'
  },
  {
    key: 'vehicle.upholstery_color',
    category: 'features',
    ca: 'Color tapisseria',
    es: 'Color tapicería',
    en: 'Upholstery color',
    fr: 'Couleur sellerie',
    description: 'Color de la tapicería interior'
  },
  {
    key: 'vehicle.upholstery_type',
    category: 'features',
    ca: 'Tipus tapisseria',
    es: 'Tipo tapicería',
    en: 'Upholstery type',
    fr: 'Type sellerie',
    description: 'Tipo de material de la tapicería'
  },
  {
    key: 'vehicle.air_conditioning',
    category: 'features',
    ca: 'Climatització',
    es: 'Climatización',
    en: 'Air conditioning',
    fr: 'Climatisation',
    description: 'Sistema de climatización'
  },
  {
    key: 'vehicle.air_conditioner',
    category: 'features',
    ca: 'Aire acondicionat',
    es: 'Aire acondicionado',
    en: 'Air conditioner',
    fr: 'Climatiseur',
    description: 'Aire acondicionado simple'
  },
  {
    key: 'vehicle.total_capacity',
    category: 'features',
    ca: 'Capacitat total',
    es: 'Capacidad total',
    en: 'Total capacity',
    fr: 'Capacité totale',
    description: 'Capacidad total del vehículo'
  },

  // Información comercial
  {
    key: 'vehicle.condition',
    category: 'commercial',
    ca: 'Estat',
    es: 'Estado',
    en: 'Condition',
    fr: 'État',
    description: 'Estado o condición del vehículo'
  },
  {
    key: 'vehicle.smoker_vehicle',
    category: 'commercial',
    ca: 'Vehicle fumador',
    es: 'Vehículo fumador',
    en: 'Smoker vehicle',
    fr: 'Véhicule fumeur',
    description: 'Si el vehículo ha sido usado por fumadores'
  },
  {
    key: 'vehicles.sold',
    category: 'commercial',
    ca: 'Venut',
    es: 'Vendido',
    en: 'Sold',
    fr: 'Vendu',
    description: 'Estado de vehículo vendido'
  },
  {
    key: 'vehicles.consult_price',
    category: 'commercial',
    ca: 'A consultar',
    es: 'A consultar',
    en: 'Price on request',
    fr: 'Prix sur demande',
    description: 'Precio bajo consulta'
  },

  // Secciones generales
  {
    key: 'vehicle.description',
    category: 'general',
    ca: 'Descripció',
    es: 'Descripción',
    en: 'Description',
    fr: 'Description',
    description: 'Descripción del vehículo'
  },
  {
    key: 'vehicle.technical_specs',
    category: 'general',
    ca: 'Especificacions tècniques',
    es: 'Especificaciones técnicas',
    en: 'Technical specifications',
    fr: 'Spécifications techniques',
    description: 'Título de sección técnica'
  },
  {
    key: 'vehicle.features',
    category: 'general',
    ca: 'Característiques',
    es: 'Características',
    en: 'Features',
    fr: 'Caractéristiques',
    description: 'Título de sección de características'
  },
  {
    key: 'vehicle.commercial_info',
    category: 'general',
    ca: 'Informació comercial',
    es: 'Información comercial',
    en: 'Commercial information',
    fr: 'Information commerciale',
    description: 'Título de sección comercial'
  },
  {
    key: 'vehicle.extras',
    category: 'general',
    ca: 'Extres',
    es: 'Extras',
    en: 'Extras',
    fr: 'Extras',
    description: 'Equipamiento adicional'
  },

  // Filtros y listados
  {
    key: 'vehicles.filter_title',
    category: 'general',
    ca: 'Filtrar vehicles',
    es: 'Filtrar vehículos',
    en: 'Filter vehicles',
    fr: 'Filtrer véhicules',
    description: 'Título de filtros'
  },
  {
    key: 'vehicles.applied_filters',
    category: 'general',
    ca: 'Filtres aplicats:',
    es: 'Filtros aplicados:',
    en: 'Applied filters:',
    fr: 'Filtres appliqués:',
    description: 'Filtros activos'
  },
  {
    key: 'vehicles.no_results',
    category: 'general',
    ca: 'No s\'han trobat vehicles amb els filtres aplicats',
    es: 'No se han encontrado vehículos con los filtros aplicados',
    en: 'No vehicles found with the applied filters',
    fr: 'Aucun véhicule trouvé avec les filtres appliqués',
    description: 'Mensaje sin resultados'
  },
  {
    key: 'vehicles.loading',
    category: 'general',
    ca: 'Carregant vehicles...',
    es: 'Cargando vehículos...',
    en: 'Loading vehicles...',
    fr: 'Chargement véhicules...',
    description: 'Estado de carga'
  },
  {
    key: 'vehicles.error_loading',
    category: 'general',
    ca: 'Error en carregar vehicles',
    es: 'Error al cargar vehículos',
    en: 'Error loading vehicles',
    fr: 'Erreur lors du chargement des véhicules',
    description: 'Error al cargar'
  },
  {
    key: 'vehicles.view_vehicle',
    category: 'general',
    ca: 'Veure vehicle',
    es: 'Ver vehículo',
    en: 'View vehicle',
    fr: 'Voir véhicule',
    description: 'Enlace para ver detalle'
  },
  {
    key: 'vehicles.featured_title',
    category: 'general',
    ca: 'Vehicles Destacats',
    es: 'Vehículos Destacados',
    en: 'Featured Vehicles',
    fr: 'Véhicules En Vedette',
    description: 'Título de vehículos destacados'
  },

  // Valores comunes
  {
    key: 'common.yes',
    category: 'general',
    ca: 'Sí',
    es: 'Sí',
    en: 'Yes',
    fr: 'Oui',
    description: 'Valor afirmativo'
  },
  {
    key: 'common.no',
    category: 'general',
    ca: 'No',
    es: 'No',
    en: 'No',
    fr: 'Non',
    description: 'Valor negativo'
  },
  {
    key: 'common.manual',
    category: 'general',
    ca: 'Manual',
    es: 'Manual',
    en: 'Manual',
    fr: 'Manuelle',
    description: 'Transmisión manual'
  },
  {
    key: 'common.automatic',
    category: 'general',
    ca: 'Automàtic',
    es: 'Automático',
    en: 'Automatic',
    fr: 'Automatique',
    description: 'Transmisión automática'
  },
  {
    key: 'common.cc',
    category: 'general',
    ca: 'cc',
    es: 'cc',
    en: 'cc',
    fr: 'cc',
    description: 'Unidad centímetros cúbicos'
  },
  {
    key: 'common.cv',
    category: 'general',
    ca: 'CV',
    es: 'CV',
    en: 'HP',
    fr: 'CV',
    description: 'Unidad de potencia'
  },
  {
    key: 'common.km_l',
    category: 'general',
    ca: 'km/l',
    es: 'km/l',
    en: 'km/l',
    fr: 'km/l',
    description: 'Unidad de consumo'
  },
  {
    key: 'common.g_km',
    category: 'general',
    ca: 'g/km',
    es: 'g/km',
    en: 'g/km',
    fr: 'g/km',
    description: 'Unidad de emisiones'
  }
];

// Función para crear las traducciones iniciales en la base de datos
export const createInitialTranslations = async (prisma: any): Promise<number> => {
  console.log('🔄 Creant traduccions inicials de vehicles...');
  
  let created = 0;
  
  for (const translation of initialVehicleTranslations) {
    try {
      // Verificar si ya existe
      const existing = await prisma.vehicleTranslation.findUnique({
        where: { key: translation.key }
      });
      
      if (!existing) {
        await prisma.vehicleTranslation.create({
          data: translation
        });
        created++;
        console.log(`✅ Creada traducció: ${translation.key}`);
      } else {
        console.log(`⏭️ Traducció ja existeix: ${translation.key}`);
      }
    } catch (error) {
      console.error(`❌ Error creant traducció ${translation.key}:`, error);
    }
  }
  
  console.log(`✅ Creades ${created} traduccions inicials de ${initialVehicleTranslations.length} totals`);
  return created;
};