import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'ca' | 'es' | 'en' | 'fr';

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Traducciones estáticas para la interfaz
const translations: Record<Language, Record<string, string>> = {
  ca: {
    // Navegación
    'nav.home': 'Inici',
    'nav.vehicles': 'Vehicles',
    'nav.about': 'Qui som',
    'nav.workshop': 'Taller',
    'nav.services': 'Serveis',
    'nav.contact': 'Contacta',
    'nav.latest_sales': 'Últimes vendes',
    'nav.professional_area': 'Àrea Professional',
    'nav.logout': 'Tancar sessió',
    'nav.favorites': 'Favorits',
    'nav.admin': 'Admin',
    
    // Página de vehículo
    'vehicle.year': 'Any',
    'vehicle.engine': 'Motor',
    'vehicle.power': 'Potència',
    'vehicle.bodywork': 'Carroceria',
    'vehicle.doors': 'Portes',
    'vehicle.seats': 'Places',
    'vehicle.color': 'Color exterior',
    'vehicle.upholstery_color': 'Color tapisseria',
    'vehicle.upholstery_type': 'Tipus tapisseria',
    'vehicle.air_conditioning': 'Climatització',
    'vehicle.air_conditioner': 'Aire acondicionat',
    'vehicle.smoker_vehicle': 'Vehicle fumador',
    'vehicle.condition': 'Estat',
    'vehicle.total_capacity': 'Capacitat total',
    'vehicle.fuel_type': 'Combustible',
    'vehicle.transmission': 'Canvi',
    'vehicle.traction': 'Tracció',
    'vehicle.emissions': 'Emissions CO2',
    'vehicle.consumption_urban': 'Consum urbà',
    'vehicle.consumption_highway': 'Consum carretera',
    'vehicle.consumption_mixed': 'Consum mixt',
    'vehicle.description': 'Descripció',
    'vehicle.technical_specs': 'Especificacions tècniques',
    'vehicle.features': 'Característiques',
    'vehicle.commercial_info': 'Informació comercial',
    'vehicle.extras': 'Extres',
    'vehicle.mileage': 'Quilometratge',
    
    // Listado de vehículos
    'vehicles.filter_title': 'Filtrar vehicles',
    'vehicles.applied_filters': 'Filtres aplicats:',
    'vehicles.no_results': 'No s\'han trobat vehicles amb els filtres aplicats',
    'vehicles.loading': 'Carregant vehicles...',
    'vehicles.error_loading': 'Error en carregar vehicles',
    'vehicles.view_vehicle': 'Veure vehicle',
    'vehicles.sold': 'Venut',
    'vehicles.consult_price': 'A consultar',
    'vehicles.featured_title': 'Vehicles Destacats',
    
    // Favorites
    'favorites.title': 'Els Meus Favorits',
    'favorites.error_loading': 'Error en carregar favorits',
    'favorites.no_vehicles': 'No tens vehicles guardats als favorits.',
    'favorites.back_home': 'TORNAR A L\'INICI',
    
    // Página Qui Som
    'about.title': 'Qui som?',
    'about.intro1': "Que avui dia KARS estigui considerat un referent en el sector de vehicles premium multimarca, no és resultat de la casualitat. Trenta anys d'experiència i de creixement constant, tant de la nostra empresa, com del nombre de clients satisfets, són les garanties més sòlides de la qualitat del servei que oferim.",
    'about.intro2': "En tots aquests anys d'activitat hem desenvolupat una eficient, sòlida i fiable xarxa de professionals per tal de poder satisfer totes les necessitats dels nostres clients i dels seus vehicles, siguin els actuals o els futurs. En aquest sentit, més enllà de l'exposició permanent, a Kars disposem d'un servei d'importació-exportació a la carta, d'un taller Bosch Car Service a les mateixes instal·lacions, també de serveis de planxa i pintura, assegurances i lloguer de vehicles, entre altres.",
    'about.trust_reasons': 'Raons de confiança:',
    'about.trust1': 'Cada vehicle es verifica sistemàticament al nostre taller, incloent el seu historial des del seu origen.',
    'about.trust2': "Disposem d'una important xarxa de professionals fiables, tant a Andorra com a l'extranger.",
    'about.trust3': "Som l'únic centre de compra i venda que dóna 12 mesos de garantia complementària incloent:",
    'about.warranty_eu': 'Garantia europea',
    'about.warranty_comfort': 'Elements de confort (climatització, finestres o sostre obert, escapament, transmissió, caixa de canvis, suspensió ...)',
    'about.independence': 'Independència',
    'about.independence_intro': 'KARS no està vinculat a cap marca oficial. Això significa que:',
    'about.independence1': 'Som sempre molt objectius, doncs no tenim interès en vendre cap marca en particular.',
    'about.independence2': 'Gaudireu d\'un assessorament basat en les millors opcions per tal de satisfer les vostres necessitats.',
    'about.independence3': 'Podem acceptar com a part de pagament qualsevol marca, sense penalitzacions.',
    'about.independence4': 'Estem preparats per atendre les necessitats de tota la família i això inclou qualsevol tipus de vehicle, sigui del segment que sigui, sempre incloent els serveis complementaris que oferim.',
    'about.involvement': 'Implicació',
    'about.involvement1': 'No hi ha èxit sense implicació humana, per això a KARS rebreu l\'atenció directa dels propietaris.',
    'about.involvement2': "Si ho necessiteu, durant el procés de selecció del vehicle idoni rebreu consells i comparatives entre diferents opcions. A més, amb l'objectiu de ser transparents i altament eficients, les negociacions es faran sense intermediaris. Un cop feta una primera selecció, estudiarem i fins i tot provarem cada vehicle seleccionat per tal de poder esvair qualsevol dubte i respondre tots els interrogants que pugui haver-hi durant el procés.",
    'about.involvement3': "Gràcies a l'estreta relació amb els nostres clients, fruit de molts anys de relació, a Kars coneixem els seus gustos i preferències. Aquest fet ens permet anticipar-nos a l'hora de fer o proposar un canvi, sigui per la sortida al mercat d'un nou model o simplement per fer un canvi de vehicle en funció del temps d'ús habitual.",
    
    // Footer
    'footer.about_us': 'Nosaltres',
    'footer.vehicles': 'Vehicles',
    'footer.professional_access': 'Accés professional',
    'footer.available_vehicles': 'Vehicles disponibles',
    'footer.legal': 'Legal',
    'footer.legal_notice': 'Avís legal',
    'footer.cookies_policy': 'Política de galetes',
    'footer.follow_us': 'Segueix-nos',
    'footer.phone': 'Telèfon',
    'footer.rights_reserved': 'Tots els drets reservats.',
    'footer.location': "Andorra la Vella, Principat d'Andorra",
    
    // Valores comunes
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.manual': 'Manual',
    'common.automatic': 'Automàtic',
    'common.cc': 'cc',
    'common.cv': 'CV',
    'common.km_l': 'km/l',
    'common.g_km': 'g/km',
    
    // Controles de listado
    'controls.showing': 'Mostrant',
    'controls.of': 'de',
    'controls.results': 'resultats',
    'controls.sort_by': 'Ordenar per:',
    'controls.show': 'Mostrar:',
    'controls.select_option': 'Selecciona una opció',
    'controls.featured_first': 'Destacats primer',
    'controls.price_low_high': 'Preu: menor a major',
    'controls.price_high_low': 'Preu: major a menor',
    'controls.newest_first': 'Més recents',
    'controls.oldest_first': 'Més antics',
    'controls.alphabetic_az': 'Alfabètic (A-Z)',
    'controls.alphabetic_za': 'Alfabètic (Z-A)',
    
    // Paginación
    'pagination.previous': 'Anterior',
    'pagination.next': 'Següent',
    
    // Páginas
    'pages.latest_sales': 'Últimes vendes',
    'pages.all_vehicles': 'Tots els vehicles',
    'pages.classic_cars_andorra': 'Cotxes clàssics a Andorra',
    'pages.second_hand_cars_andorra': 'Cotxes de segona mà a Andorra', 
    'pages.new_cars_andorra': 'Cotxes nous a Andorra',
    'pages.km0_cars_andorra': 'Cotxes km0 a Andorra',
    'pages.renting_cars_andorra': 'Cotxes de renting a Andorra',
    'pages.rental_cars_andorra': 'Cotxes de lloguer a Andorra',
    'pages.seminew_cars_andorra': 'Cotxes seminous a Andorra',
    'pages.vehicles_by_state': 'Vehicles en estat',
    
    // Disclaimer
    'disclaimer': '*HEM ESTAT CUROSOS EN LA DESCRIPCIÓ DE LES CARACTERÍSTIQUES D\'AQUEST VEHICLE. TOT I AIXÍ NO REPRESENTEN UNA GARANTIA PER ERRORS D\'ESCRIPTURA I LA TRANSMISSIÓ DE LES DADES.'
  },
  
  es: {
    // Navegación
    'nav.home': 'Inicio',
    'nav.vehicles': 'Vehículos',
    'nav.about': 'Quiénes somos',
    'nav.workshop': 'Taller',
    'nav.services': 'Servicios',
    'nav.contact': 'Contacto',
    'nav.latest_sales': 'Últimas ventas',
    'nav.professional_area': 'Área Profesional',
    'nav.logout': 'Cerrar sesión',
    'nav.favorites': 'Favoritos',
    'nav.admin': 'Admin',
    
    // Página de vehículo
    'vehicle.year': 'Año',
    'vehicle.engine': 'Motor',
    'vehicle.power': 'Potencia',
    'vehicle.bodywork': 'Carrocería',
    'vehicle.doors': 'Puertas',
    'vehicle.seats': 'Plazas',
    'vehicle.color': 'Color exterior',
    'vehicle.upholstery_color': 'Color tapicería',
    'vehicle.upholstery_type': 'Tipo tapicería',
    'vehicle.air_conditioning': 'Climatización',
    'vehicle.air_conditioner': 'Aire acondicionado',
    'vehicle.smoker_vehicle': 'Vehículo fumador',
    'vehicle.condition': 'Estado',
    'vehicle.total_capacity': 'Capacidad total',
    'vehicle.fuel_type': 'Combustible',
    'vehicle.transmission': 'Cambio',
    'vehicle.traction': 'Tracción',
    'vehicle.emissions': 'Emisiones CO2',
    'vehicle.consumption_urban': 'Consumo urbano',
    'vehicle.consumption_highway': 'Consumo carretera',
    'vehicle.consumption_mixed': 'Consumo mixto',
    'vehicle.description': 'Descripción',
    'vehicle.technical_specs': 'Especificaciones técnicas',
    'vehicle.features': 'Características',
    'vehicle.commercial_info': 'Información comercial',
    'vehicle.extras': 'Extras',
    'vehicle.mileage': 'Kilometraje',
    
    // Listado de vehículos
    'vehicles.filter_title': 'Filtrar vehículos',
    'vehicles.applied_filters': 'Filtros aplicados:',
    'vehicles.no_results': 'No se han encontrado vehículos con los filtros aplicados',
    'vehicles.loading': 'Cargando vehículos...',
    'vehicles.error_loading': 'Error al cargar vehículos',
    'vehicles.view_vehicle': 'Ver vehículo',
    'vehicles.sold': 'Vendido',
    'vehicles.consult_price': 'A consultar',
    'vehicles.featured_title': 'Vehículos Destacados',
    
    // Favorites
    'favorites.title': 'Mis Favoritos',
    'favorites.error_loading': 'Error al cargar favoritos',
    'favorites.no_vehicles': 'No tienes vehículos guardados en favoritos.',
    'favorites.back_home': 'VOLVER AL INICIO',
    
    // Página Qui Som
    'about.title': '¿Quiénes somos?',
    'about.intro1': "Que hoy día KARS esté considerado un referente en el sector de vehículos premium multimarca, no es resultado de la casualidad. Treinta años de experiencia y de crecimiento constante, tanto de nuestra empresa, como del número de clientes satisfechos, son las garantías más sólidas de la calidad del servicio que ofrecemos.",
    'about.intro2': "En todos estos años de actividad hemos desarrollado una eficiente, sólida y fiable red de profesionales para poder satisfacer todas las necesidades de nuestros clientes y de sus vehículos, sean los actuales o los futuros. En este sentido, más allá de la exposición permanente, en Kars disponemos de un servicio de importación-exportación a la carta, de un taller Bosch Car Service en las mismas instalaciones, también de servicios de chapa y pintura, seguros y alquiler de vehículos, entre otros.",
    'about.trust_reasons': 'Razones de confianza:',
    'about.trust1': 'Cada vehículo se verifica sistemáticamente en nuestro taller, incluyendo su historial desde su origen.',
    'about.trust2': "Disponemos de una importante red de profesionales fiables, tanto en Andorra como en el extranjero.",
    'about.trust3': "Somos el único centro de compra y venta que da 12 meses de garantía complementaria incluyendo:",
    'about.warranty_eu': 'Garantía europea',
    'about.warranty_comfort': 'Elementos de confort (climatización, ventanas o techo abierto, escape, transmisión, caja de cambios, suspensión ...)',
    'about.independence': 'Independencia',
    'about.independence_intro': 'KARS no está vinculado a ninguna marca oficial. Esto significa que:',
    'about.independence1': 'Somos siempre muy objetivos, pues no tenemos interés en vender ninguna marca en particular.',
    'about.independence2': 'Disfrutaréis de un asesoramiento basado en las mejores opciones para satisfacer vuestras necesidades.',
    'about.independence3': 'Podemos aceptar como parte de pago cualquier marca, sin penalizaciones.',
    'about.independence4': 'Estamos preparados para atender las necesidades de toda la familia y eso incluye cualquier tipo de vehículo, sea del segmento que sea, siempre incluyendo los servicios complementarios que ofrecemos.',
    'about.involvement': 'Implicación',
    'about.involvement1': 'No hay éxito sin implicación humana, por eso en KARS recibiréis la atención directa de los propietarios.',
    'about.involvement2': "Si lo necesitáis, durante el proceso de selección del vehículo idóneo recibiréis consejos y comparativas entre diferentes opciones. Además, con el objetivo de ser transparentes y altamente eficientes, las negociaciones se harán sin intermediarios. Una vez hecha una primera selección, estudiaremos e incluso probaremos cada vehículo seleccionado para poder despejar cualquier duda y responder todos los interrogantes que pueda haber durante el proceso.",
    'about.involvement3': "Gracias a la estrecha relación con nuestros clientes, fruto de muchos años de relación, en Kars conocemos sus gustos y preferencias. Este hecho nos permite anticiparnos a la hora de hacer o proponer un cambio, sea por la salida al mercado de un nuevo modelo o simplemente para hacer un cambio de vehículo en función del tiempo de uso habitual.",
    
    // Footer
    'footer.about_us': 'Nosotros',
    'footer.vehicles': 'Vehículos', 
    'footer.professional_access': 'Acceso profesional',
    'footer.available_vehicles': 'Vehículos disponibles',
    'footer.legal': 'Legal',
    'footer.legal_notice': 'Aviso legal',
    'footer.cookies_policy': 'Política de cookies',
    'footer.follow_us': 'Síguenos',
    'footer.phone': 'Teléfono',
    'footer.rights_reserved': 'Todos los derechos reservados.',
    'footer.location': "Andorra la Vella, Principado de Andorra",
    
    // Valores comunes
    'common.yes': 'Sí',
    'common.no': 'No',
    'common.manual': 'Manual',
    'common.automatic': 'Automático',
    'common.cc': 'cc',
    'common.cv': 'CV',
    'common.km_l': 'km/l',
    'common.g_km': 'g/km',
    
    // Controles de listado
    'controls.showing': 'Mostrando',
    'controls.of': 'de',
    'controls.results': 'resultados',
    'controls.sort_by': 'Ordenar por:',
    'controls.show': 'Mostrar:',
    'controls.select_option': 'Selecciona una opción',
    'controls.featured_first': 'Destacados primero',
    'controls.price_low_high': 'Precio: menor a mayor',
    'controls.price_high_low': 'Precio: mayor a menor',
    'controls.newest_first': 'Más recientes',
    'controls.oldest_first': 'Más antiguos',
    'controls.alphabetic_az': 'Alfabético (A-Z)',
    'controls.alphabetic_za': 'Alfabético (Z-A)',
    
    // Paginación
    'pagination.previous': 'Anterior',
    'pagination.next': 'Siguiente',
    
    // Páginas
    'pages.latest_sales': 'Últimas ventas',
    'pages.all_vehicles': 'Todos los vehículos',
    'pages.classic_cars_andorra': 'Coches clásicos en Andorra',
    'pages.second_hand_cars_andorra': 'Coches de segunda mano en Andorra',
    'pages.new_cars_andorra': 'Coches nuevos en Andorra', 
    'pages.km0_cars_andorra': 'Coches km0 en Andorra',
    'pages.renting_cars_andorra': 'Coches de renting en Andorra',
    'pages.rental_cars_andorra': 'Coches de alquiler en Andorra',
    'pages.seminew_cars_andorra': 'Coches seminuevos en Andorra',
    'pages.vehicles_by_state': 'Vehículos en estado',
    
    // Disclaimer
    'disclaimer': '*HEMOS SIDO CUIDADOSOS EN LA DESCRIPCIÓN DE LAS CARACTERÍSTICAS DE ESTE VEHÍCULO. AUN ASÍ NO REPRESENTAN UNA GARANTÍA POR ERRORES DE ESCRITURA Y LA TRANSMISIÓN DE LOS DATOS.'
  },
  
  en: {
    // Navegación
    'nav.home': 'Home',
    'nav.vehicles': 'Vehicles',
    'nav.about': 'About us',
    'nav.workshop': 'Workshop',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.latest_sales': 'Latest sales',
    'nav.professional_area': 'Professional Area',
    'nav.logout': 'Logout',
    'nav.favorites': 'Favorites',
    'nav.admin': 'Admin',
    
    // Página de vehículo
    'vehicle.year': 'Year',
    'vehicle.engine': 'Engine',
    'vehicle.power': 'Power',
    'vehicle.bodywork': 'Bodywork',
    'vehicle.doors': 'Doors',
    'vehicle.seats': 'Seats',
    'vehicle.color': 'Exterior color',
    'vehicle.upholstery_color': 'Upholstery color',
    'vehicle.upholstery_type': 'Upholstery type',
    'vehicle.air_conditioning': 'Air conditioning',
    'vehicle.air_conditioner': 'Air conditioner',
    'vehicle.smoker_vehicle': 'Smoker vehicle',
    'vehicle.condition': 'Condition',
    'vehicle.total_capacity': 'Total capacity',
    'vehicle.fuel_type': 'Fuel type',
    'vehicle.transmission': 'Transmission',
    'vehicle.traction': 'Traction',
    'vehicle.emissions': 'CO2 emissions',
    'vehicle.consumption_urban': 'Urban consumption',
    'vehicle.consumption_highway': 'Highway consumption',
    'vehicle.consumption_mixed': 'Mixed consumption',
    'vehicle.description': 'Description',
    'vehicle.technical_specs': 'Technical specifications',
    'vehicle.features': 'Features',
    'vehicle.commercial_info': 'Commercial information',
    'vehicle.extras': 'Extras',
    'vehicle.mileage': 'Mileage',
    
    // Vehicle listing
    'vehicles.filter_title': 'Filter vehicles',
    'vehicles.applied_filters': 'Applied filters:',
    'vehicles.no_results': 'No vehicles found with the applied filters',
    'vehicles.loading': 'Loading vehicles...',
    'vehicles.error_loading': 'Error loading vehicles',
    'vehicles.view_vehicle': 'View vehicle',
    'vehicles.sold': 'Sold',
    'vehicles.consult_price': 'Price on request',
    'vehicles.featured_title': 'Featured Vehicles',
    
    // Favorites
    'favorites.title': 'My Favorites',
    'favorites.error_loading': 'Error loading favorites',
    'favorites.no_vehicles': 'You have no vehicles saved in favorites.',
    'favorites.back_home': 'BACK TO HOME',
    
    // About Page
    'about.title': 'Who are we?',
    'about.intro1': "That today KARS is considered a benchmark in the multi-brand premium vehicle sector is not the result of chance. Thirty years of experience and constant growth, both of our company and the number of satisfied customers, are the most solid guarantees of the quality of the service we offer.",
    'about.intro2': "In all these years of activity we have developed an efficient, solid and reliable network of professionals to meet all the needs of our customers and their vehicles, whether current or future. In this sense, beyond the permanent exhibition, at Kars we have an import-export service to order, a Bosch Car Service workshop in the same facilities, also bodywork and painting services, insurance and vehicle rental, among others.",
    'about.trust_reasons': 'Reasons to trust:',
    'about.trust1': 'Each vehicle is systematically verified in our workshop, including its history from its origin.',
    'about.trust2': "We have an important network of reliable professionals, both in Andorra and abroad.",
    'about.trust3': "We are the only purchase and sale center that gives 12 months of complementary warranty including:",
    'about.warranty_eu': 'European warranty',
    'about.warranty_comfort': 'Comfort elements (air conditioning, windows or sunroof, exhaust, transmission, gearbox, suspension ...)',
    'about.independence': 'Independence',
    'about.independence_intro': 'KARS is not linked to any official brand. This means that:',
    'about.independence1': 'We are always very objective, as we have no interest in selling any particular brand.',
    'about.independence2': 'You will enjoy advice based on the best options to meet your needs.',
    'about.independence3': 'We can accept any brand as part payment, without penalties.',
    'about.independence4': 'We are prepared to meet the needs of the whole family and that includes any type of vehicle, whatever the segment, always including the complementary services we offer.',
    'about.involvement': 'Involvement',
    'about.involvement1': 'There is no success without human involvement, which is why at KARS you will receive direct attention from the owners.',
    'about.involvement2': "If you need it, during the selection process of the ideal vehicle you will receive advice and comparisons between different options. In addition, with the aim of being transparent and highly efficient, negotiations will be done without intermediaries. Once a first selection has been made, we will study and even test each selected vehicle to be able to clear any doubt and answer all the questions that may arise during the process.",
    'about.involvement3': "Thanks to the close relationship with our customers, the result of many years of relationship, at Kars we know their tastes and preferences. This fact allows us to anticipate when making or proposing a change, whether due to the release of a new model or simply to change vehicles based on the usual time of use.",
    
    // Footer
    'footer.about_us': 'About us',
    'footer.vehicles': 'Vehicles',
    'footer.professional_access': 'Professional access', 
    'footer.available_vehicles': 'Available vehicles',
    'footer.legal': 'Legal',
    'footer.legal_notice': 'Legal notice',
    'footer.cookies_policy': 'Cookies policy',
    'footer.follow_us': 'Follow us',
    'footer.phone': 'Phone',
    'footer.rights_reserved': 'All rights reserved.',
    'footer.location': "Andorra la Vella, Principality of Andorra",
    
    // Valores comunes
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.manual': 'Manual',
    'common.automatic': 'Automatic',
    'common.cc': 'cc',
    'common.cv': 'HP',
    'common.km_l': 'km/l',
    'common.g_km': 'g/km',
    
    // List controls
    'controls.showing': 'Showing',
    'controls.of': 'of',
    'controls.results': 'results',
    'controls.sort_by': 'Sort by:',
    'controls.show': 'Show:',
    'controls.select_option': 'Select an option',
    'controls.featured_first': 'Featured first',
    'controls.price_low_high': 'Price: low to high',
    'controls.price_high_low': 'Price: high to low',
    'controls.newest_first': 'Newest first',
    'controls.oldest_first': 'Oldest first',
    'controls.alphabetic_az': 'Alphabetic (A-Z)',
    'controls.alphabetic_za': 'Alphabetic (Z-A)',
    
    // Pagination
    'pagination.previous': 'Previous',
    'pagination.next': 'Next',
    
    // Pages
    'pages.latest_sales': 'Latest sales',
    'pages.all_vehicles': 'All vehicles',
    'pages.classic_cars_andorra': 'Classic cars in Andorra',
    'pages.second_hand_cars_andorra': 'Second hand cars in Andorra',
    'pages.new_cars_andorra': 'New cars in Andorra',
    'pages.km0_cars_andorra': 'Km0 cars in Andorra',
    'pages.renting_cars_andorra': 'Renting cars in Andorra',
    'pages.rental_cars_andorra': 'Rental cars in Andorra',
    'pages.seminew_cars_andorra': 'Semi-new cars in Andorra',
    'pages.vehicles_by_state': 'Vehicles by state',
    
    // Disclaimer
    'disclaimer': '*WE HAVE BEEN CAREFUL IN DESCRIBING THE CHARACTERISTICS OF THIS VEHICLE. HOWEVER, THEY DO NOT REPRESENT A GUARANTEE FOR WRITING ERRORS AND DATA TRANSMISSION.'
  },
  
  fr: {
    // Navegación
    'nav.home': 'Accueil',
    'nav.vehicles': 'Véhicules',
    'nav.about': 'Qui sommes-nous',
    'nav.workshop': 'Atelier',
    'nav.services': 'Services',
    'nav.contact': 'Contact',
    'nav.latest_sales': 'Dernières ventes',
    'nav.professional_area': 'Espace Professionnel',
    'nav.logout': 'Déconnexion',
    'nav.favorites': 'Favoris',
    'nav.admin': 'Admin',
    
    // Página de vehículo
    'vehicle.year': 'Année',
    'vehicle.engine': 'Moteur',
    'vehicle.power': 'Puissance',
    'vehicle.bodywork': 'Carrosserie',
    'vehicle.doors': 'Portes',
    'vehicle.seats': 'Places',
    'vehicle.color': 'Couleur extérieure',
    'vehicle.upholstery_color': 'Couleur sellerie',
    'vehicle.upholstery_type': 'Type sellerie',
    'vehicle.air_conditioning': 'Climatisation',
    'vehicle.air_conditioner': 'Climatiseur',
    'vehicle.smoker_vehicle': 'Véhicule fumeur',
    'vehicle.condition': 'État',
    'vehicle.total_capacity': 'Capacité totale',
    'vehicle.fuel_type': 'Carburant',
    'vehicle.transmission': 'Transmission',
    'vehicle.traction': 'Traction',
    'vehicle.emissions': 'Émissions CO2',
    'vehicle.consumption_urban': 'Consommation urbaine',
    'vehicle.consumption_highway': 'Consommation autoroute',
    'vehicle.consumption_mixed': 'Consommation mixte',
    'vehicle.description': 'Description',
    'vehicle.technical_specs': 'Spécifications techniques',
    'vehicle.features': 'Caractéristiques',
    'vehicle.commercial_info': 'Information commerciale',
    'vehicle.extras': 'Extras',
    'vehicle.mileage': 'Kilométrage',
    
    // Liste de véhicules
    'vehicles.filter_title': 'Filtrer véhicules',
    'vehicles.applied_filters': 'Filtres appliqués:',
    'vehicles.no_results': 'Aucun véhicule trouvé avec les filtres appliqués',
    'vehicles.loading': 'Chargement véhicules...',
    'vehicles.error_loading': 'Erreur lors du chargement des véhicules',
    'vehicles.view_vehicle': 'Voir véhicule',
    'vehicles.sold': 'Vendu',
    'vehicles.consult_price': 'Prix sur demande',
    'vehicles.featured_title': 'Véhicules En Vedette',
    
    // Favorites
    'favorites.title': 'Mes Favoris',
    'favorites.error_loading': 'Erreur lors du chargement des favoris',
    'favorites.no_vehicles': 'Vous n\'avez aucun véhicule sauvegardé dans les favoris.',
    'favorites.back_home': 'RETOUR À L\'ACCUEIL',
    
    // Page À propos
    'about.title': 'Qui sommes-nous ?',
    'about.intro1': "Qu'aujourd'hui KARS soit considéré comme une référence dans le secteur des véhicules premium multimarques n'est pas le fruit du hasard. Trente ans d'expérience et de croissance constante, tant de notre entreprise que du nombre de clients satisfaits, sont les garanties les plus solides de la qualité du service que nous offrons.",
    'about.intro2': "Au cours de toutes ces années d'activité, nous avons développé un réseau efficace, solide et fiable de professionnels pour répondre à tous les besoins de nos clients et de leurs véhicules, qu'ils soient actuels ou futurs. En ce sens, au-delà de l'exposition permanente, chez Kars nous disposons d'un service d'import-export sur mesure, d'un atelier Bosch Car Service dans les mêmes installations, ainsi que de services de carrosserie et peinture, d'assurances et de location de véhicules, entre autres.",
    'about.trust_reasons': 'Raisons de confiance :',
    'about.trust1': 'Chaque véhicule est systématiquement vérifié dans notre atelier, y compris son historique depuis son origine.',
    'about.trust2': "Nous disposons d'un important réseau de professionnels fiables, tant en Andorre qu'à l'étranger.",
    'about.trust3': "Nous sommes le seul centre d'achat et de vente qui offre 12 mois de garantie complémentaire incluant :",
    'about.warranty_eu': 'Garantie européenne',
    'about.warranty_comfort': 'Éléments de confort (climatisation, fenêtres ou toit ouvrant, échappement, transmission, boîte de vitesses, suspension ...)',
    'about.independence': 'Indépendance',
    'about.independence_intro': "KARS n'est lié à aucune marque officielle. Cela signifie que :",
    'about.independence1': "Nous sommes toujours très objectifs, car nous n'avons aucun intérêt à vendre une marque en particulier.",
    'about.independence2': 'Vous bénéficierez de conseils basés sur les meilleures options pour répondre à vos besoins.',
    'about.independence3': 'Nous pouvons accepter n\'importe quelle marque comme partie du paiement, sans pénalités.',
    'about.independence4': 'Nous sommes prêts à répondre aux besoins de toute la famille et cela inclut tout type de véhicule, quel que soit le segment, en incluant toujours les services complémentaires que nous offrons.',
    'about.involvement': 'Implication',
    'about.involvement1': "Il n'y a pas de succès sans implication humaine, c'est pourquoi chez KARS vous recevrez l'attention directe des propriétaires.",
    'about.involvement2': "Si vous en avez besoin, pendant le processus de sélection du véhicule idéal, vous recevrez des conseils et des comparaisons entre différentes options. De plus, dans le but d'être transparents et très efficaces, les négociations se feront sans intermédiaires. Une fois une première sélection effectuée, nous étudierons et même testerons chaque véhicule sélectionné pour pouvoir dissiper tout doute et répondre à toutes les questions qui peuvent survenir pendant le processus.",
    'about.involvement3': "Grâce à la relation étroite avec nos clients, fruit de nombreuses années de relation, chez Kars nous connaissons leurs goûts et préférences. Ce fait nous permet d'anticiper lors de la proposition d'un changement, que ce soit pour la sortie d'un nouveau modèle ou simplement pour changer de véhicule en fonction du temps d'utilisation habituel.",
    
    // Footer
    'footer.about_us': 'À propos',
    'footer.vehicles': 'Véhicules',
    'footer.professional_access': 'Accès professionnel',
    'footer.available_vehicles': 'Véhicules disponibles', 
    'footer.legal': 'Légal',
    'footer.legal_notice': 'Avis légal',
    'footer.cookies_policy': 'Politique de cookies',
    'footer.follow_us': 'Suivez-nous',
    'footer.phone': 'Téléphone',
    'footer.rights_reserved': 'Tous droits réservés.',
    'footer.location': "Andorra la Vella, Principauté d'Andorre",
    
    // Valores comunes
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.manual': 'Manuelle',
    'common.automatic': 'Automatique',
    'common.cc': 'cc',
    'common.cv': 'CV',
    'common.km_l': 'km/l',
    'common.g_km': 'g/km',
    
    // Contrôles de liste
    'controls.showing': 'Affichage',
    'controls.of': 'de',
    'controls.results': 'résultats',
    'controls.sort_by': 'Trier par:',
    'controls.show': 'Afficher:',
    'controls.select_option': 'Sélectionnez une option',
    'controls.featured_first': 'En vedette d\'abord',
    'controls.price_low_high': 'Prix: bas à élevé',
    'controls.price_high_low': 'Prix: élevé à bas',
    'controls.newest_first': 'Plus récents',
    'controls.oldest_first': 'Plus anciens',
    'controls.alphabetic_az': 'Alphabétique (A-Z)',
    'controls.alphabetic_za': 'Alphabétique (Z-A)',
    
    // Pagination
    'pagination.previous': 'Précédent',
    'pagination.next': 'Suivant',
    
    // Pages
    'pages.latest_sales': 'Dernières ventes',
    'pages.all_vehicles': 'Tous les véhicules',
    'pages.classic_cars_andorra': 'Voitures classiques en Andorre',
    'pages.second_hand_cars_andorra': 'Voitures d\'occasion en Andorre',
    'pages.new_cars_andorra': 'Voitures neuves en Andorre',
    'pages.km0_cars_andorra': 'Voitures km0 en Andorre',
    'pages.renting_cars_andorra': 'Voitures de leasing en Andorre',
    'pages.rental_cars_andorra': 'Voitures de location en Andorre',
    'pages.seminew_cars_andorra': 'Voitures semi-neuves en Andorre',
    'pages.vehicles_by_state': 'Véhicules par état',
    
    // Disclaimer
    'disclaimer': '*NOUS AVONS ÉTÉ SOIGNEUX DANS LA DESCRIPTION DES CARACTÉRISTIQUES DE CE VÉHICULE. NÉANMOINS, ELLES NE REPRÉSENTENT PAS UNE GARANTIE POUR LES ERREURS D\'ÉCRITURE ET LA TRANSMISSION DES DONNÉES.'
  }
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Detectar idioma desde URL path (ej: /es/vehiculos) o parámetro, default a catalán
  const getInitialLanguage = (): Language => {
    // Primero, intentar obtener el idioma desde el path URL (ej: /es/vehiculos)
    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const firstSegment = pathSegments[0];
    if (firstSegment && ['ca', 'es', 'en', 'fr'].includes(firstSegment)) {
      return firstSegment as Language;
    }
    
    // Fallback: intentar obtener desde parámetro de búsqueda (compatibilidad)
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') as Language;
    if (urlLang && ['ca', 'es', 'en', 'fr'].includes(urlLang)) {
      return urlLang;
    }
    
    // Default a catalán
    return 'ca';
  };

  const [currentLanguage, setCurrentLanguage] = useState<Language>(getInitialLanguage);

  // Establecer el idioma en el HTML cuando cambie
  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  // Función para cambiar idioma
  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('selectedLanguage', language);
    
    // Actualizar atributo lang del HTML para que el navegador detecte el idioma
    document.documentElement.lang = language;
    
    // Obtener el path actual sin prefijo de idioma
    const currentPathWithoutLang = getPathWithoutLanguage(window.location.pathname);
    const currentSearch = window.location.search;
    
    // Generar nueva URL localizada
    const newPath = getLocalizedPath(currentPathWithoutLang, language);
    const newUrl = `${newPath}${currentSearch}`;
    
    // Navegar a la nueva URL en lugar de solo actualizar el historial
    window.location.href = newUrl;
  };

  // Función de traducción
  const t = (key: string): string => {
    return translations[currentLanguage]?.[key] || translations.ca[key] || key;
  };

  // Inicializar atributo lang del HTML y escuchar cambios en la URL
  useEffect(() => {
    // Actualizar atributo lang al cargar la página
    document.documentElement.lang = currentLanguage;
    
    const handlePopState = () => {
      // Detectar idioma desde el path de la nueva URL
      const newLanguage = getLanguageFromPath(window.location.pathname);
      
      if (newLanguage !== currentLanguage) {
        setCurrentLanguage(newLanguage);
        document.documentElement.lang = newLanguage;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Función helper para obtener descripción del vehículo según idioma actual
export const getVehicleDescription = (vehicle: any, language: Language): string => {
  if (!vehicle) return '';
  
  const descriptionFields = {
    'ca': 'descripcioAnunciCA',
    'es': 'descripcioAnunciES', 
    'en': 'descripcioAnunciEN',
    'fr': 'descripcioAnunciFR'
  };
  
  // Intentar obtener la descripción en el idioma solicitado
  const fieldName = descriptionFields[language];
  let description = vehicle[fieldName] as string;
  
  // Si tenemos la descripción en el idioma solicitado, devolverla
  if (description && description.trim() !== '') {
    return description;
  }
  
  // Fallback hierarchy: Catalan -> Spanish -> English -> French -> legacy field
  const fallbackFields = [
    vehicle.descripcioAnunciCA,
    vehicle.descripcioAnunciES,
    vehicle.descripcioAnunciEN,
    vehicle.descripcioAnunciFR,
    vehicle.descripcioAnunci
  ];
  
  for (const fallback of fallbackFields) {
    if (fallback && typeof fallback === 'string' && fallback.trim() !== '') {
      return fallback;
    }
  }
  
  return '';
};

// Mapeo de rutas localizadas - bidireccional
const routeMappings: Record<string, Record<Language, string>> = {
  '/': { ca: '/', es: '/', en: '/', fr: '/' },
  '/vehicles': { ca: '/vehicles', es: '/vehiculos', en: '/vehicles', fr: '/vehicules' },
  '/vehicle': { ca: '/vehicle', es: '/vehiculo', en: '/vehicle', fr: '/vehicule' },
  '/ultimes-vendes': { ca: '/ultimes-vendes', es: '/ultimas-ventas', en: '/latest-sales', fr: '/dernieres-ventes' },
  '/ultimes-vendes/vehicle': { ca: '/ultimes-vendes/vehicle', es: '/ultimas-ventas/vehicle', en: '/latest-sales/vehicle', fr: '/dernieres-ventes/vehicle' },
  '/ultimes-vendes/marca': { ca: '/ultimes-vendes/marca', es: '/ultimas-ventas/marca', en: '/latest-sales/brand', fr: '/dernieres-ventes/marque' },
  '/qui-som': { ca: '/qui-som', es: '/quienes-somos', en: '/about-us', fr: '/qui-sommes-nous' },
  '/taller': { ca: '/taller', es: '/taller', en: '/workshop', fr: '/atelier' },
  '/serveis': { ca: '/serveis', es: '/servicios', en: '/services', fr: '/services' },
  '/contacta': { ca: '/contacta', es: '/contacto', en: '/contact', fr: '/contact' }
};

// Crear mapeo inverso para facilitar la traducción
const createReverseMapping = () => {
  const reverseMap: Record<string, string> = {};
  
  Object.entries(routeMappings).forEach(([basePath, translations]) => {
    Object.entries(translations).forEach(([lang, translatedPath]) => {
      reverseMap[translatedPath] = basePath;
    });
  });
  
  return reverseMap;
};

const reverseRouteMappings = createReverseMapping();

// Función helper para generar URLs localizadas
export const getLocalizedPath = (path: string, language: Language = 'ca'): string => {
  // Si es el idioma por defecto (catalán), devolver el path original
  if (language === 'ca') {
    return path;
  }
  
  // Separar path de query parameters
  const [basePath, queryString] = path.split('?');
  
  // Separar el path base de los parámetros dinámicos
  const pathParts = basePath.split('/');
  
  // Buscar el mapeo más específico primero (3 segmentos, luego 2, luego 1)
  let basePathSegment = '';
  let dynamicParts: string[] = [];
  let mapping = null;
  
  // Intentar con 3 segmentos (/ultimes-vendes/vehicle)
  if (pathParts.length >= 3) {
    basePathSegment = pathParts.slice(0, 3).join('/');
    mapping = routeMappings[basePathSegment];
    if (mapping) {
      dynamicParts = pathParts.slice(3);
    }
  }
  
  // Si no hay mapeo, intentar con 2 segmentos (/vehicle)
  if (!mapping && pathParts.length >= 2) {
    basePathSegment = pathParts.slice(0, 2).join('/');
    mapping = routeMappings[basePathSegment];
    if (mapping) {
      dynamicParts = pathParts.slice(2);
    }
  }
  
  // Si no hay mapeo, usar el path completo como base
  if (!mapping) {
    basePathSegment = basePath;
    dynamicParts = [];
  }
  
  const localizedBasePath = mapping ? mapping[language] : basePathSegment;
  
  // Reconstruir path completo
  const fullLocalizedPath = dynamicParts.length > 0 
    ? `${localizedBasePath}/${dynamicParts.join('/')}`
    : localizedBasePath;
  
  // Agregar prefijo de idioma y query parameters si existen
  const localizedPathWithPrefix = `/${language}${fullLocalizedPath}`;
  return queryString ? `${localizedPathWithPrefix}?${queryString}` : localizedPathWithPrefix;
};

// Función helper para extraer el path sin prefijo de idioma y traducirlo a la ruta base
export const getPathWithoutLanguage = (fullPath: string): string => {
  const pathSegments = fullPath.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  // Si el primer segmento es un idioma, removerlo
  let pathWithoutLang = fullPath;
  if (firstSegment && ['ca', 'es', 'en', 'fr'].includes(firstSegment)) {
    pathWithoutLang = '/' + pathSegments.slice(1).join('/');
  }
  
  // Separar query parameters
  const [basePath, queryString] = pathWithoutLang.split('?');
  
  // Buscar si esta ruta está en el mapeo inverso (es una ruta traducida)
  const baseRoute = reverseRouteMappings[basePath];
  if (baseRoute) {
    // Si encontramos la ruta base, devolverla
    return queryString ? `${baseRoute}?${queryString}` : baseRoute;
  }
  
  // Si no está en el mapeo, devolver tal cual
  return pathWithoutLang;
};

// Función helper para obtener el idioma actual desde una URL
export const getLanguageFromPath = (path: string): Language => {
  const pathSegments = path.split('/').filter(Boolean);
  const firstSegment = pathSegments[0];
  
  if (firstSegment && ['ca', 'es', 'en', 'fr'].includes(firstSegment)) {
    return firstSegment as Language;
  }
  
  return 'ca'; // Default
};