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

## Recent Updates (July 2025)
### Latest: Brands/Models Management & Data Initialization System (July 23, 2025)

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

## Development Guidelines
- Revisa siempre que la funcionalidad sea tanto en desarrollo como en producción
- Use the field filtering system when adding new vehicle form fields
- Validate brand existence before making model API calls
- Always use Float type for price fields in new code
- Test image uploads in both development and production environments