import { useContext, useEffect } from 'react';
import { useLanguage, Language } from '../context/LanguageContext';

// Cache para las traducciones obtenidas del servidor
let translationsCache: Record<string, Record<Language, string>> = {};
let isLoading = false;
let hasInitialized = false;

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
        { key: 'vehicle.transmission', ca: 'Canvi', es: 'Cambio', en: 'Transmission', fr: 'Transmission' },
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
        { key: 'favorites.remove', ca: 'Eliminar dels favorits', es: 'Eliminar de favoritos', en: 'Remove from favorites', fr: 'Retirer des favoris' }
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

  // Cargar traducciones adicionales del servidor de forma asíncrona
  useEffect(() => {
    if (hasInitialized && !isLoading) {
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
    if (isLoading) return;
    
    isLoading = true;
    try {
      if (!import.meta.env.DEV) {
        // En producción, hacer llamada real a la API
        const response = await fetch('/api/admin/vehicle-translations', {
          headers: {
            'Authorization': 'Basic ' + btoa('admin:admin123')
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
      console.error('Error loading server translations:', error);
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
    removeFromFavorites: getTranslation('favorites.remove')
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