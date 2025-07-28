## Project Language and Communication
- Project will be exclusively in Catalan, but code will be in English following programmer guidelines for code readability
- Communication will always be in SPANISH
- Website will support 4 languages: Catalan (primary), English, French, and Spanish
- Háblame siempre en español (Always speak to me in Spanish)

## API Integration
- Motoraldia API integration is only for vehicle synchronization
- Vehicles can be sent from a button in the vehicle listing
- Website is primarily for user info@kars.ad
- Vehicles will be stored in their own database
- Vehicles will be created/updated in the API from this web platform
- Import route for vehicles after database reset: /wp-json/api-motor/v1/vehicles?user_id=113&per_page=100

## Website Features
- Filters will be temporarily disabled
- Will have a specific menu structure [Image #1]
- Multi-step form for adding/editing vehicles
  - First step: Select vehicle type
  - Vehicle title will be automatically generated (brand, model, version)
  - Only vehicle description needs translation across languages

## Dashboard
- Admin dashboard will manage:
  - Vehicles
  - Pages
  - SEO
  - Other website content
- Dashboard will be accessible only to administrators

## Version and Update Guidelines
- Cuando subamos versión o algun cambio que eso implique, siempre tienes que preguntarme la versión a la que subimos

## Recent Updates (July 2025)
### Latest: Separate Vehicle URLs & SEO Improvements v0.3.1 (July 27, 2025)

#### ✅ Separate URLs for Sold vs Available Vehicles
1. **URL Structure Differentiation** - Estructuras de URL específicas
   - **Available vehicles**: `/vehicles/brand`, `/vehicle/slug`
   - **Sold vehicles**: `/ultimes-vendes/marca/brand`, `/ultimes-vendes/vehicle/slug`
   - Multilingual support for all routes across 4 languages
   - Clear semantic separation for SEO and user experience

2. **Active Menu State System** - Sistema de estado activo en menú
   - Intelligent route detection for parent menu items
   - Handles nested routes correctly (vehicle detail pages activate parent menu)
   - Works with all language variations and URL structures
   - Proper highlighting in both desktop and mobile menus

3. **SEO-Critical Improvements** - Mejoras críticas para SEO
   - Dynamic `lang` attribute in HTML based on current language
   - Proper language detection by search engines
   - Eliminates incorrect SEO indexing (all pages were indexed as Catalan)
   - Full multilingual SEO compliance

4. **Breadcrumb Navigation Enhancements** - Mejoras en navegación breadcrumbs
   - Context-aware breadcrumbs for sold vs available vehicles
   - Fixed hover effects to only affect individual links
   - Proper brand linking that maintains vehicle state context
   - Localized breadcrumb text for all languages

#### 🔧 Technical Implementation
- **Router Configuration**: Complete route mapping for sold/available vehicles
- **Navigation Hooks**: Enhanced `useLocalizedNavigation` for complex routing
- **State Detection**: Intelligent `isActiveRoute()` function for menu states
- **SEO Optimization**: Dynamic HTML lang attribute management
- **Component Updates**: VehicleCard, VehicleDetail, Header, PageBreadcrumbs

#### 🎯 System Status
- ✅ Separate URLs: Complete implementation for all languages
- ✅ Menu states: Active highlighting working correctly
- ✅ SEO compliance: Dynamic lang attribute functioning
- ✅ Breadcrumbs: Context-aware navigation implemented
- ✅ User experience: Clear distinction between sold/available vehicles

### Previous: Localized URLs System & Internationalization v0.3.0 (July 27, 2025)

#### ✅ Localized URLs System Implementation
1. **Friendly URLs with Language Prefix** - Sistema completo de URLs amigables
   - Spanish: `/es/vehiculos`, `/es/quienes-somos`, `/es/servicios`
   - English: `/en/vehicles`, `/en/about-us`, `/en/services`  
   - French: `/fr/vehicules`, `/fr/qui-sommes-nous`, `/fr/services`
   - Catalan: `/vehicles`, `/qui-som`, `/serveis` (default, no prefix)

2. **Persistent Language Navigation** - Navegación que preserva idioma
   - Hook `useLocalizedNavigation()` for consistent navigation
   - Function `getLocalizedPath()` for automatic URL generation
   - Language detection from URL path instead of query parameters
   - Complete persistence across all navigation

3. **Localized Vehicle Detail Pages** - Páginas de detalle localizadas
   - `/es/vehiculo/vehicle-slug` for Spanish
   - `/en/vehicle/vehicle-slug` for English
   - `/fr/vehicule/vehicle-slug` for French
   - Updated VehicleCard, VehicleListCard components with localized navigation
   - Breadcrumbs maintain language when navigating back

4. **Dynamic HTML Lang Attribute** - Atributo lang dinámico
   - `<html lang="xx">` updates automatically based on selected language
   - Improves browser language detection and accessibility
   - Better SEO and translation tools support

5. **Complete Interface Translations** - Traducciones completas de interfaz
   - List controls: "Showing X-Y of Z results", "Sort by", "Show"
   - Pagination: "Previous", "Next", "Précédent", "Suivant"
   - Dynamic page titles for all vehicle pages
   - 40+ new translations across 4 languages

6. **Fixed Language Flags** - Banderas de idiomas corregidas
   - Replaced emojis with real PNG/SVG image files
   - Correct Catalan flag with yellow and red stripes
   - Consistent visual style across all language flags

#### 🔧 Technical Implementation
- **New Files**: `useLocalizedNavigation.ts`, `LocalizedRouter.tsx`, route mappings
- **Updated Components**: Header, VehicleCard, VehicleListCard, VehicleDetail
- **Helper Functions**: `getLocalizedPath()`, `getPathWithoutLanguage()`, `getLanguageFromPath()`
- **Route Mappings**: Complete translation mapping for all public routes

#### 🚀 System Benefits
- ✅ Improved UX: Users never lose their language preference
- ✅ SEO Optimized: Language-specific URLs for better search indexing
- ✅ Accessibility: Screen readers detect language correctly
- ✅ Translation Tools: Browsers offer appropriate translation suggestions
- ✅ Scalability: Easy to add new localized routes

### Previous: Frontend Improvements & Price Display Fix (July 26, 2025)

#### ✅ Admin Dashboard Enhancements
1. **Brand/Model Statistics** - Nuevo panel de estadísticas en admin dashboard
   - Contadores de marcas y modelos para coches y motos
   - Endpoint `/api/brands/stats` para obtener estadísticas
   - Visualización en tiempo real de totales por tipo de vehículo
   - Integración con sistema existente de estadísticas

2. **Vehicle Management Improvements** - Mejoras en gestión de vehículos
   - Botón "Crear Vehicle" conectado correctamente al formulario
   - Traducción del botón a catalán según especificaciones
   - Eliminado botón "Actualitzar" innecesario de la página de vehículos
   - Navegación mejorada entre secciones de administración

#### ✅ Vehicle Detail Page Enhancements  
1. **Enhanced Technical Specifications** - Ficha técnica completa
   - Secciones organizadas: Especificaciones técnicas, Características, Información comercial
   - Layout de 2 columnas para mejor aprovechamiento del espacio
   - Campos adicionales: color exterior, tapicería, potencia, tracción, carrocería
   - Integración con `useVehicleTypes` para etiquetas correctas

2. **Improved Navigation & UX** - Mejoras de navegación
   - Scroll automático al inicio al abrir detalle de vehículo
   - Enlaces de marca en breadcrumbs filtran vehículos por marca
   - Breadcrumbs clicables con navegación inteligente
   - Mejora en la experiencia de usuario general

3. **E-commerce Style Pricing** - Sistema de precios tipo e-commerce
   - Precio anterior tachado cuando está disponible
   - Layout visual mejorado similar a tiendas online
   - Verificación correcta de campos `preuAntic` y `preuAnterior`
   - Display condicional basado en disponibilidad de datos

#### 🔧 Critical Bug Fixes
1. **Price Display Correction** - Corrección de precios falsos
   - **Issue**: VehicleCard mostraba precios anteriores falsos (precio + 2000€)
   - **Fix**: Eliminado precio anterior hardcodeado e incorrecto
   - **Implementation**: Solo mostrar precio anterior si existe en base de datos
   - **Files**: `VehicleCard.tsx`, `VehicleListLayout.tsx`

2. **API Field Mapping** - Mapeo correcto de campos
   - Carrocería (`carrosseriaCotxe`) añadida al endpoint vehicles
   - Mapping correcto de camelCase a kebab-case en componentes
   - Sincronización de campos entre API y frontend
   - Soporte para múltiples formatos de precio anterior

3. **Database Integration** - Integración con base de datos
   - Labels correctos para emisiones, tapicería y otros campos
   - Uso de colecciones de base de datos en lugar de mappings hardcodeados
   - Sistema de etiquetas consistente entre formulario y detalle
   - Manejo correcto de valores null/undefined

#### 🛠️ Technical Implementation
- **AdminDashboard.tsx**: Estadísticas de marcas y modelos con API endpoint
- **VehicleDetail.tsx**: Especificaciones técnicas completas en 2 columnas
- **VehicleCard.tsx**: Corrección crítica de precios anteriores falsos  
- **VehicleListLayout.tsx**: Mapeo completo de campos de precio
- **useVehicleTypes.ts**: Hook para etiquetas desde base de datos

#### 🎯 System Status
- ✅ Admin statistics: Panel funcional con contadores en tiempo real
- ✅ Technical specs: Fichas técnicas completas implementadas
- ✅ Price display: Sistema corregido sin datos falsos
- ✅ Navigation: Scroll y breadcrumbs funcionando correctamente
- ✅ Database integration: Labels desde API funcionando

### Previous: WhatsApp Integration & Home Page Cleanup (July 24, 2025)

#### ✅ WhatsApp Integration System
1. **Admin Configuration Panel** - Nueva pestaña "Configuración" con gestión de WhatsApp
   - Configuración de número de WhatsApp (34604128777)
   - Nombre de contacto personalizable (Elisabeth)
   - Plantilla de mensaje personalizable con variables dinámicas
   - Toggle para habilitar/deshabilitar el botón flotante

2. **WhatsApp Floating Button** - Botón flotante responsive en frontend
   - **Location**: `src/components/WhatsAppFloatingButton.tsx`
   - Mensajes contextuales según la página (detalle de vehículo vs genérico)
   - Integración con `VehicleContext` para datos del vehículo actual
   - Animaciones y tooltip en catalán
   - Indicador contextual cuando se está viendo un vehículo

3. **Context Integration** - Sistema de contexto para compartir datos de vehículos
   - **VehicleContext**: Gestión del vehículo actual y estado de página
   - **generateVehicleName()**: Función utilitaria para generar nombres de vehículos
   - Integración en `VehicleDetail.tsx` para actualizar contexto automáticamente
   - Limpieza automática del contexto al cambiar de página

#### 🏠 Home Page Simplification
1. **Removed "Últims Vehicles Afegits" Section** - Simplificación de la página principal
   - Eliminado título y listado de últimos vehículos agregados
   - Removido botón "VEURE MÉS VEHICLES"
   - Eliminadas API calls innecesarias y estados de carga
   - Página ahora solo contiene: HeroSection + FeaturedVehicles + Footer

#### 🛠️ Technical Implementation
- **AdminSettings.tsx**: Componente completo para configuración de WhatsApp
- **MainLayout.tsx**: Integración del botón flotante en layout principal
- **Home.tsx**: Simplificación radical eliminando sección de vehículos
- **Context System**: Sistema robusto para compartir datos entre componentes

#### 🎯 System Status
- ✅ WhatsApp configuration: Panel de administración funcional
- ✅ Floating button: Implementado con mensajes contextuales
- ✅ Vehicle context: Sistema de contexto funcionando correctamente
- ✅ Home page cleanup: Página simplificada y optimizada
- 🔄 API integration: Pendiente guardar configuración en backend

### Previous: Brands/Models Management & Data Initialization System (July 23, 2025)

#### ✅ Brands and Models Management Interface
1. **Admin Panel Integration** - Nueva pestaña "Marcas/Modelos" en la página de vehículos
   - Gestión completa de marcas para coches y motos
   - Sincronización automática de modelos desde API externa
   - Interface de administración con crear, editar, eliminar marcas
   - Filtrado por tipo de vehículo y búsqueda de marcas

2. **API Endpoints Fixes** - Corrección de rutas de API para marcas y modelos
   - Fixed: `/marques-cotxe` → `/brands/cars`
   - Fixed: `/marques-moto` → `/brands/motorcycles`
   - Proper error handling para endpoints no disponibles
   - Brand/model mapping para mostrar nombres legibles en lugar de slugs

3. **Data Initialization System** - Sistema completo de inicialización de datos
   - **Location**: `kars-api/src/data/initialization/`
   - **Files**: 
     - `car-extras.ts` - 58 extras para coches con 4 idiomas
     - `motorhome-extras.ts` - 51 extras para autocaravanas con 4 idiomas
     - `motorcycle-extras.ts` - 47 extras para motos con 4 idiomas
     - `index.ts` - Utilidades y funciones helper
   - **Languages**: Catalán (principal), Español, Francés, Inglés
   - **Features**: Normalización, búsqueda, traducciones automáticas

#### 🛠️ Technical Implementation
- **BrandsModelsManager.tsx**: Componente completo para gestión de marcas y modelos
- **Tab System**: Sistema de pestañas integrado en KarsVehicles
- **API Integration**: Conectado con endpoints existentes de brands y sync
- **Multi-language Support**: Sistema preparado para traducciones de extras

#### 📁 New File Structure
```
kars-api/src/data/initialization/
├── car-extras.ts           # Extras coches (58 items)
├── motorhome-extras.ts     # Extras autocaravanas (51 items)  
├── motorcycle-extras.ts    # Extras motos (47 items)
├── index.ts               # Utilities & exports
└── README.md              # Documentation
```

#### 🎯 System Status
- ✅ Brands management: Fully functional with CRUD operations
- ✅ Models sync: API integration working from external source
- ✅ Data initialization: Complete multi-language extras system
- ✅ Admin interface: Integrated in vehicle management page
- 🔄 Database seeding: Ready for integration (pending implementation)

### System Fixes & Improvements

#### ✅ Vehicle Management System Overhaul
1. **Image Handling** - Fixed featured image preview and gallery image uploads
   - Separate URL processing functions for featured vs gallery images
   - Proper URL validation and formatting
   - Fixed image serving in both development and production

2. **Vehicle Creation/Editing** - Complete fix of form submission errors
   - Fixed Error 500 during vehicle save operations
   - Added field validation and filtering for unknown fields
   - Removed incompatible fields (seguretat, confort, multimedia)
   - Fixed userId handling for MongoDB ObjectId compatibility

3. **Brand & Model System** - Corrected brand/model filtering
   - Fixed 404 errors in model search by validating brand existence
   - Separated car brands from motorcycle brands correctly
   - Migrated 23 motorcycle brands from incorrect 'car' categorization
   - Fixed API calls to only load valid brand/model combinations

4. **Database Schema Updates** - Price field migration
   - Migrated `preu` field from String to Float type in Prisma schema
   - Successfully migrated 149 existing vehicles to new schema
   - Fixed GET /api/vehicles endpoint that was failing due to type mismatch
   - Regenerated Prisma client to match updated schema

5. **API Improvements** - Enhanced vehicle endpoints
   - Added field filtering to prevent unknown fields from causing errors
   - Improved error logging and validation in vehicle creation
   - Fixed vehicle listing endpoint performance issues
   - Added proper data normalization before database operations

#### 🔧 Technical Details
- **Prisma Schema**: Updated vehicle model with correct field types
- **MongoDB**: Direct data migration for price field type conversion  
- **Brand Filtering**: Fixed vehicleTypes array handling in database queries
- **Image Processing**: Enhanced URL handling for media files in Vite
- **Error Handling**: Comprehensive error logging and user feedback

#### 🎯 System Status
- ✅ Vehicle creation: Fully functional
- ✅ Image uploads: Working in dev and production
- ✅ Brand/model filtering: Correctly separated by vehicle type
- ✅ Vehicle listing: Fixed performance and data loading
- ✅ Database consistency: All type mismatches resolved

## Environment Variables

### Backend (kars-api/.env)
```bash
# Public Base URL for image URLs in external API sync
# CRITICAL: Converts local image paths (/media/...) to full URLs for external APIs like Motoraldia
# In development: http://localhost:5173 (images won't be accessible from external APIs)  
# In production: https://your-actual-domain.com (MUST be publicly accessible)
PUBLIC_BASE_URL="http://localhost:5173"
```

### Frontend (kars-react/.env)
```bash
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_ADMIN_USER=admin
VITE_API_ADMIN_PASS=Motoraldia.2025!
```

## Development Guidelines
- Revisa siempre que la funcionalidad sea tanto en desarrollo como en producción
- Use the field filtering system when adding new vehicle form fields
- Validate brand existence before making model API calls
- Always use Float type for price fields in new code
- Test image uploads in both development and production environments
- **IMPORTANT**: Update `PUBLIC_BASE_URL` when deploying to production for external API sync to work with images