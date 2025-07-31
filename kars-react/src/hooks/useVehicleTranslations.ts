import { useContext, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

// Cache para las traducciones obtenidas del servidor
let translationsCache: Record<string, Record<Language, string>> = {};
let isLoading = false;
let hasInitialized = false;
let serverLoadAttempted = false;

interface VehicleTranslation {
  key: string;
  category: 'technical' | 'features' | 'commercial' | 'general';
  ca: string;
  es: string;
  en: string;
  fr: string;
  description?: string;
}

// Función para inicializar traducciones estáticas inmediatamente
const initializeStaticTranslations = (): void => {
  if (hasInitialized) return;
  
  const staticTranslations = [
        { key: 'vehicle.brand', ca: 'Marca', es: 'Marca', en: 'Brand', fr: 'Marque' },
        { key: 'vehicle.model', ca: 'Model', es: 'Modelo', en: 'Model', fr: 'Modèle' },
        { key: 'vehicle.year', ca: 'Any', es: 'Año', en: 'Year', fr: 'Année' },
        { key: 'vehicle.engine', ca: 'Motor', es: 'Motor', en: 'Engine', fr: 'Moteur' },
        { key: 'vehicle.power', ca: 'Potència', es: 'Potencia', en: 'Power', fr: 'Puissance' },
        { key: 'vehicle.fuel_type', ca: 'Combustible', es: 'Combustible', en: 'Fuel type', fr: 'Carburant' },
        { key: 'vehicle.transmission', ca: 'Canvi', es: 'Tipo de cambio', en: 'Transmission', fr: 'Transmission' },
        { key: 'vehicle.mileage', ca: 'Quilometratge', es: 'Kilometraje', en: 'Mileage', fr: 'Kilométrage' },
        { key: 'vehicle.emissions', ca: 'Emissions CO2', es: 'Emisiones CO2', en: 'CO2 emissions', fr: 'Émissions CO2' },
        { key: 'vehicle.consumption_urban', ca: 'Consum urbà', es: 'Consumo urbano', en: 'Urban consumption', fr: 'Consommation urbaine' },
        { key: 'vehicle.consumption_highway', ca: 'Consum carretera', es: 'Consumo carretera', en: 'Highway consumption', fr: 'Consommation autoroute' },
        { key: 'vehicle.consumption_mixed', ca: 'Consum mixt', es: 'Consumo mixto', en: 'Mixed consumption', fr: 'Consommation mixte' },
        { key: 'vehicle.traction', ca: 'Tracció', es: 'Tracción', en: 'Traction', fr: 'Traction' },
        { key: 'vehicle.bodywork', ca: 'Carrosseria', es: 'Carrocería', en: 'Bodywork', fr: 'Carrosserie' },
        { key: 'vehicle.doors', ca: 'Portes', es: 'Puertas', en: 'Doors', fr: 'Portes' },
        { key: 'vehicle.seats', ca: 'Places', es: 'Plazas', en: 'Seats', fr: 'Places' },
        { key: 'vehicle.color', ca: 'Color', es: 'Color', en: 'Color', fr: 'Couleur' },
        { key: 'vehicle.upholstery_color', ca: 'Color tapisseria', es: 'Color tapicería', en: 'Upholstery color', fr: 'Couleur sellerie' },
        { key: 'vehicle.upholstery_type', ca: 'Tipus tapisseria', es: 'Tipo tapicería', en: 'Upholstery type', fr: 'Type sellerie' },
        { key: 'vehicle.air_conditioning', ca: 'Climatització', es: 'Climatización', en: 'Air conditioning', fr: 'Climatisation' },
        { key: 'vehicle.air_conditioner', ca: 'Aire condicionat', es: 'Aire acondicionado', en: 'Air conditioner', fr: 'Climatiseur' },
        { key: 'vehicle.total_capacity', ca: 'Capacitat total', es: 'Capacidad total', en: 'Total capacity', fr: 'Capacité totale' },
        { key: 'vehicle.condition', ca: 'Estat', es: 'Estado', en: 'Condition', fr: 'État' },
        { key: 'vehicle.smoker_vehicle', ca: 'Vehicle fumador', es: 'Vehículo fumador', en: 'Smoker vehicle', fr: 'Véhicule fumeur' },
        { key: 'vehicles.sold', ca: 'Venut', es: 'Vendido', en: 'Sold', fr: 'Vendu' },
        { key: 'vehicles.consult_price', ca: 'Consultar preu', es: 'Consultar precio', en: 'Consult price', fr: 'Consulter prix' },
        { key: 'vehicle.description', ca: 'Descripció', es: 'Descripción', en: 'Description', fr: 'Description' },
        { key: 'vehicle.technical_specs', ca: 'Especificacions tècniques', es: 'Especificaciones técnicas', en: 'Technical specs', fr: 'Spécifications techniques' },
        { key: 'vehicle.features', ca: 'Característiques', es: 'Características', en: 'Features', fr: 'Caractéristiques' },
        { key: 'vehicle.commercial_info', ca: 'Informació comercial', es: 'Información comercial', en: 'Commercial information', fr: 'Information commerciale' },
        { key: 'vehicle.extras', ca: 'Extres', es: 'Extras', en: 'Extras', fr: 'Extras' },
        { key: 'vehicles.filter_title', ca: 'Filtres', es: 'Filtros', en: 'Filters', fr: 'Filtres' },
        { key: 'vehicles.applied_filters', ca: 'Filtres aplicats', es: 'Filtros aplicados', en: 'Applied filters', fr: 'Filtres appliqués' },
        { key: 'vehicles.no_results', ca: 'No hi ha resultats', es: 'No hay resultados', en: 'No results', fr: 'Aucun résultat' },
        { key: 'vehicles.loading', ca: 'Carregant...', es: 'Cargando...', en: 'Loading...', fr: 'Chargement...' },
        { key: 'vehicles.error_loading', ca: 'Error carregant vehicles', es: 'Error cargando vehículos', en: 'Error loading vehicles', fr: 'Erreur de chargement des véhicules' },
        { key: 'vehicles.view_vehicle', ca: 'Veure vehicle', es: 'Ver vehículo', en: 'View vehicle', fr: 'Voir véhicule' },
        { key: 'vehicles.featured_title', ca: 'Vehicles destacats', es: 'Vehículos destacados', en: 'Featured vehicles', fr: 'Véhicules en vedette' },
        { key: 'common.yes', ca: 'Sí', es: 'Sí', en: 'Yes', fr: 'Oui' },
        { key: 'common.no', ca: 'No', es: 'No', en: 'No', fr: 'Non' },
        { key: 'common.manual', ca: 'Manual', es: 'Manual', en: 'Manual', fr: 'Manuelle' },
        { key: 'common.automatic', ca: 'Automàtic', es: 'Automático', en: 'Automatic', fr: 'Automatique' },
        { key: 'common.cc', ca: 'cc', es: 'cc', en: 'cc', fr: 'cc' },
        { key: 'common.cv', ca: 'CV', es: 'CV', en: 'HP', fr: 'CV' },
        { key: 'common.km_l', ca: 'km/l', es: 'km/l', en: 'km/l', fr: 'km/l' },
        { key: 'common.g_km', ca: 'g/km', es: 'g/km', en: 'g/km', fr: 'g/km' },
        { key: 'favorites.add', ca: 'Afegir als favorits', es: 'Añadir a favoritos', en: 'Add to favorites', fr: 'Ajouter aux favoris' },
        { key: 'favorites.remove', ca: 'Eliminar dels favorits', es: 'Eliminar de favoritos', en: 'Remove from favorites', fr: 'Retirer des favoris' },
        
        // Campos técnicos específicos para las secciones
        { key: 'vehicle.version', ca: 'Versió', es: 'Versión', en: 'Version', fr: 'Version' },
        { key: 'vehicle.emissions', ca: 'Emissions', es: 'Emisiones', en: 'Emissions', fr: 'Émissions' },
        { key: 'vehicle.emissions_co2', ca: 'Emissions CO2', es: 'Emisiones CO2', en: 'CO2 emissions', fr: 'Émissions CO2' },
        { key: 'vehicle.urban_consumption', ca: 'Consum urbà', es: 'Consumo urbano', en: 'Urban consumption', fr: 'Consommation urbaine' },
        { key: 'vehicle.highway_consumption', ca: 'Consum carretera', es: 'Consumo carretera', en: 'Highway consumption', fr: 'Consommation autoroute' },
        { key: 'vehicle.mixed_consumption', ca: 'Consum mixt', es: 'Consumo mixto', en: 'Mixed consumption', fr: 'Consommation mixte' },
        
        // Campos comerciales específicos
        { key: 'vehicle.warranty', ca: 'Garantia', es: 'Garantía', en: 'Warranty', fr: 'Garantie' },
        { key: 'vehicle.maintenance_book', ca: 'Llibre manteniment', es: 'Libro mantenimiento', en: 'Maintenance book', fr: 'Carnet d\'entretien' },
        { key: 'vehicle.previous_price', ca: 'Preu anterior', es: 'Precio anterior', en: 'Previous price', fr: 'Prix précédent' },
        { key: 'vehicle.trade_in', ca: 'Vehicle a canvi', es: 'Vehículo a cambio', en: 'Trade-in vehicle', fr: 'Véhicule en échange' },
        { key: 'vehicle.official_revisions', ca: 'Revisions oficials', es: 'Revisiones oficiales', en: 'Official revisions', fr: 'Révisions officielles' },
        { key: 'vehicle.deductible_taxes', ca: 'Impostos deduïbles', es: 'Impuestos deducibles', en: 'Deductible taxes', fr: 'Taxes déductibles' },
        { key: 'vehicle.accidented', ca: 'Vehicle accidentat', es: 'Vehículo accidentado', en: 'Accident vehicle', fr: 'Véhicule accidenté' },
        { key: 'vehicle.owner_name', ca: 'Nombre propietaris', es: 'Número propietarios', en: 'Number of owners', fr: 'Nombre de propriétaires' },
        
        // Campos adicionales que faltan
        { key: 'vehicle.propeller', ca: 'Tipus de propulsor', es: 'Tipo de propulsor', en: 'Propulsion type', fr: 'Type de propulsion' },
        { key: 'vehicle.expiry_days', ca: 'Dies caducitat', es: 'Días caducidad', en: 'Expiry days', fr: 'Jours d\'expiration' },
        { key: 'vehicle.trunk_number', ca: 'Núm. maleters', es: 'Núm. maleteros', en: 'Trunk number', fr: 'Numéro coffres' },
        { key: 'vehicle.spare_wheel', ca: 'Roda recanvi', es: 'Rueda repuesto', en: 'Spare wheel', fr: 'Roue de secours' },
        { key: 'vehicle.max_speed', ca: 'Velocitat màxima', es: 'Velocidad máxima', en: 'Max speed', fr: 'Vitesse maximale' },
        { key: 'vehicle.acceleration_0_100', ca: 'Acceleració 0-100', es: 'Aceleración 0-100', en: 'Acceleration 0-100', fr: 'Accélération 0-100' },
        { key: 'vehicle.origin', ca: 'Origen', es: 'Origen', en: 'Origin', fr: 'Origine' },
        { key: 'vehicle.vat', ca: 'IVA', es: 'IVA', en: 'VAT', fr: 'TVA' },
        { key: 'vehicle.financing', ca: 'Finançament', es: 'Financiación', en: 'Financing', fr: 'Financement' },
        { key: 'vehicle.monthly_price', ca: 'Preu mensual', es: 'Precio mensual', en: 'Monthly price', fr: 'Prix mensuel' },
        { key: 'vehicle.daily_price', ca: 'Preu diari', es: 'Precio diario', en: 'Daily price', fr: 'Prix quotidien' },
        { key: 'vehicle.mileage_short', ca: 'Quilometratge', es: 'Kilometraje', en: 'Mileage', fr: 'Kilométrage' },
        
        // Especificaciones eléctricas
        { key: 'vehicle.wltp_range', ca: 'Autonomia WLTP', es: 'Autonomía WLTP', en: 'WLTP Range', fr: 'Autonomie WLTP' },
        { key: 'vehicle.wltp_urban_range', ca: 'Autonomia urbana WLTP', es: 'Autonomía urbana WLTP', en: 'Urban WLTP Range', fr: 'Autonomie urbaine WLTP' },
        { key: 'vehicle.wltp_extraurban_range', ca: 'Autonomia extraurbana WLTP', es: 'Autonomía extraurbana WLTP', en: 'Extra-urban WLTP Range', fr: 'Autonomie extra-urbaine WLTP' },
        { key: 'vehicle.electric_range_100', ca: 'Autonomia 100% elèctrica', es: 'Autonomía 100% eléctrica', en: '100% Electric Range', fr: 'Autonomie 100% électrique' },
        { key: 'vehicle.battery', ca: 'Bateria', es: 'Batería', en: 'Battery', fr: 'Batterie' },
        { key: 'vehicle.charging_cables', ca: 'Cables de recàrrega', es: 'Cables de recarga', en: 'Charging cables', fr: 'Câbles de recharge' },
        { key: 'vehicle.connectors', ca: 'Connectors', es: 'Conectores', en: 'Connectors', fr: 'Connecteurs' },
        { key: 'vehicle.charging_speed', ca: 'Velocitat de recàrrega', es: 'Velocidad de recarga', en: 'Charging speed', fr: 'Vitesse de recharge' },
        { key: 'vehicle.full_charge_time', ca: 'Temps recàrrega total', es: 'Tiempo recarga total', en: 'Full charge time', fr: 'Temps de charge complète' },
        { key: 'vehicle.charge_time_80', ca: 'Temps recàrrega fins 80%', es: 'Tiempo recarga hasta 80%', en: 'Charge time to 80%', fr: 'Temps de charge jusqu\'à 80%' },
        { key: 'vehicle.regenerative_braking', ca: 'Frenada regenerativa', es: 'Frenada regenerativa', en: 'Regenerative braking', fr: 'Freinage régénératif' },
        { key: 'vehicle.one_pedal', ca: 'One Pedal', es: 'One Pedal', en: 'One Pedal', fr: 'One Pedal' },
        
        // Títulos de secciones
        { key: 'vehicle.electric_specs', ca: 'Especificacions Elèctriques', es: 'Especificaciones Eléctricas', en: 'Electric Specifications', fr: 'Spécifications Électriques' }
      ];
      
      staticTranslations.forEach((translation: any) => {
        translationsCache[translation.key] = {
          ca: translation.ca,
          es: translation.es,
          en: translation.en,
          fr: translation.fr
        };
      });
      
      hasInitialized = true;
};

export const useVehicleTranslations = () => {
  const { currentLanguage } = useLanguage();

  // Inicializar traducciones estáticas inmediatamente si no se han cargado
  if (!hasInitialized) {
    initializeStaticTranslations();
  }

  // Cargar traducciones adicionales del servidor de forma asíncrona (solo una vez)
  useEffect(() => {
    if (hasInitialized && !isLoading && !serverLoadAttempted && import.meta.env.VITE_API_BASE_URL) {
      loadServerTranslations();
    }
  }, []);

  // Función para obtener una traducción específica
  const getTranslation = (key: string): string => {
    // Primero buscar en cache
    if (translationsCache[key] && translationsCache[key][currentLanguage]) {
      return translationsCache[key][currentLanguage];
    }

    // Si no está en cache, devolver la clave como fallback
    return key;
  };

  // Función para cargar traducciones adicionales del servidor
  const loadServerTranslations = async (): Promise<void> => {
    if (isLoading || serverLoadAttempted) return;
    
    isLoading = true;
    serverLoadAttempted = true;
    try {
      // Intentar cargar traducciones del servidor si está disponible
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      if (apiUrl) {
        const response = await fetch(`${apiUrl}/admin/vehicle-translations`, {
          headers: {
            'Authorization': 'Basic ' + btoa(`${import.meta.env.VITE_API_ADMIN_USER || 'admin'}:${import.meta.env.VITE_API_ADMIN_PASS || 'admin123'}`)
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          // Convertir array de traducciones a objeto cache
          data.translations?.forEach((translation: VehicleTranslation) => {
            translationsCache[translation.key] = {
              ca: translation.ca,
              es: translation.es,
              en: translation.en,
              fr: translation.fr
            };
          });
        }
      }
    } catch (error) {
      console.warn('No se pudieron cargar las traducciones del servidor, usando valores estáticos:', error);
      // No marcar como error crítico, las traducciones estáticas están disponibles
    } finally {
      isLoading = false;
    }
  };

  // Función para obtener traducciones por categoría
  const getTranslationsByCategory = (category: string): Record<string, string> => {
    const categoryTranslations: Record<string, string> = {};
    
    Object.keys(translationsCache).forEach(key => {
      if (key.startsWith(`vehicle.${category}`) || key.startsWith(category)) {
        categoryTranslations[key] = translationsCache[key][currentLanguage];
      }
    });
    
    return categoryTranslations;
  };

  // Traducciones específicas para componentes de vehículos
  const vehicleLabels = {
    // Información básica
    brand: getTranslation('vehicle.brand'),
    model: getTranslation('vehicle.model'),
    
    // Especificaciones técnicas
    year: getTranslation('vehicle.year'),
    engine: getTranslation('vehicle.engine'),
    power: getTranslation('vehicle.power'),
    fuelType: getTranslation('vehicle.fuel_type'),
    transmission: getTranslation('vehicle.transmission'),
    mileage: getTranslation('vehicle.mileage'),
    emissions: getTranslation('vehicle.emissions'),
    consumptionUrban: getTranslation('vehicle.consumption_urban'),
    consumptionHighway: getTranslation('vehicle.consumption_highway'),
    consumptionMixed: getTranslation('vehicle.consumption_mixed'),
    traction: getTranslation('vehicle.traction'),
    
    // Características físicas
    bodywork: getTranslation('vehicle.bodywork'),
    doors: getTranslation('vehicle.doors'),
    seats: getTranslation('vehicle.seats'),
    color: getTranslation('vehicle.color'),
    upholsteryColor: getTranslation('vehicle.upholstery_color'),
    upholsteryType: getTranslation('vehicle.upholstery_type'),
    airConditioning: getTranslation('vehicle.air_conditioning'),
    airConditioner: getTranslation('vehicle.air_conditioner'),
    totalCapacity: getTranslation('vehicle.total_capacity'),
    
    // Información comercial
    condition: getTranslation('vehicle.condition'),
    smokerVehicle: getTranslation('vehicle.smoker_vehicle'),
    sold: getTranslation('vehicles.sold'),
    consultPrice: getTranslation('vehicles.consult_price'),
    
    // Secciones generales
    description: getTranslation('vehicle.description'),
    technicalSpecs: getTranslation('vehicle.technical_specs'),
    features: getTranslation('vehicle.features'),
    commercialInfo: getTranslation('vehicle.commercial_info'),
    extras: getTranslation('vehicle.extras'),
    
    // Campos específicos de secciones
    version: getTranslation('vehicle.version'),
    emissionsCo2: getTranslation('vehicle.emissions_co2'),
    urbanConsumption: getTranslation('vehicle.urban_consumption'),
    highwayConsumption: getTranslation('vehicle.highway_consumption'),
    mixedConsumption: getTranslation('vehicle.mixed_consumption'),
    warranty: getTranslation('vehicle.warranty'),
    maintenanceBook: getTranslation('vehicle.maintenance_book'),
    previousPrice: getTranslation('vehicle.previous_price'),
    tradeIn: getTranslation('vehicle.trade_in'),
    officialRevisions: getTranslation('vehicle.official_revisions'),
    deductibleTaxes: getTranslation('vehicle.deductible_taxes'),
    accidented: getTranslation('vehicle.accidented'),
    ownerName: getTranslation('vehicle.owner_name'),
    
    // Filtros y listados
    filterTitle: getTranslation('vehicles.filter_title'),
    appliedFilters: getTranslation('vehicles.applied_filters'),
    noResults: getTranslation('vehicles.no_results'),
    loading: getTranslation('vehicles.loading'),
    errorLoading: getTranslation('vehicles.error_loading'),
    viewVehicle: getTranslation('vehicles.view_vehicle'),
    featuredTitle: getTranslation('vehicles.featured_title'),
    
    // Valores comunes
    yes: getTranslation('common.yes'),
    no: getTranslation('common.no'),
    manual: getTranslation('common.manual'),
    automatic: getTranslation('common.automatic'),
    cc: getTranslation('common.cc'),
    cv: getTranslation('common.cv'),
    kmL: getTranslation('common.km_l'),
    gKm: getTranslation('common.g_km'),
    
    // Favoritos
    addToFavorites: getTranslation('favorites.add'),
    removeFromFavorites: getTranslation('favorites.remove'),
    
    // Campos adicionales
    propeller: getTranslation('vehicle.propeller'),
    expiryDays: getTranslation('vehicle.expiry_days'),
    trunkNumber: getTranslation('vehicle.trunk_number'),
    spareWheel: getTranslation('vehicle.spare_wheel'),
    maxSpeed: getTranslation('vehicle.max_speed'),
    acceleration0100: getTranslation('vehicle.acceleration_0_100'),
    origin: getTranslation('vehicle.origin'),
    vat: getTranslation('vehicle.vat'),
    financing: getTranslation('vehicle.financing'),
    monthlyPrice: getTranslation('vehicle.monthly_price'),
    dailyPrice: getTranslation('vehicle.daily_price'),
    mileageShort: getTranslation('vehicle.mileage_short'),
    
    // Especificaciones eléctricas
    wltpRange: getTranslation('vehicle.wltp_range'),
    wltpUrbanRange: getTranslation('vehicle.wltp_urban_range'),
    wltpExtraurbanRange: getTranslation('vehicle.wltp_extraurban_range'),
    electricRange100: getTranslation('vehicle.electric_range_100'),
    battery: getTranslation('vehicle.battery'),
    chargingCables: getTranslation('vehicle.charging_cables'),
    connectors: getTranslation('vehicle.connectors'),
    chargingSpeed: getTranslation('vehicle.charging_speed'),
    fullChargeTime: getTranslation('vehicle.full_charge_time'),
    chargeTime80: getTranslation('vehicle.charge_time_80'),
    regenerativeBraking: getTranslation('vehicle.regenerative_braking'),
    onePedal: getTranslation('vehicle.one_pedal'),
    electricSpecs: getTranslation('vehicle.electric_specs')
  };

  return {
    getTranslation,
    loadTranslations: loadServerTranslations,
    getTranslationsByCategory,
    vehicleLabels,
    currentLanguage
  };
};

export default useVehicleTranslations;