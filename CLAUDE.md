## Deployment
- Estoy desplegando en easypanel con un dockerfile

## Database Configuration
- En desarrollo: Usamos MongoDB local sin Docker (conexión directa)
- En producción: Usamos Docker con docker-compose
- NO usar Docker en desarrollo local

## Project Language and Communication
- Project will be exclusively in Catalan, but code will be in English following programmer guidelines for code readability
- Communication will always be in SPANISH
- Website will support 4 languages: Catalan (primary), English, French, and Spanish
- Háblame siempre en español (Always speak to me in Spanish)

## Git Workflow
- No hagas push mientras yo no lo pida

## Code Organization
- Si un archivo tiene más de 1000 líneas de código hay que fraccionarlo y meter los archivos en una carpeta nueva

## Version Management
- Cuando subimos versión y pido actualizar documentación, tienes siempre que actualizar el changelog, "SIEMPRE"

## Recent Updates (v0.3.7 - 2025-07-31)

### Vehicle Propulsion Type Field Implementation (NEW)
- **Backend**: Added `tipusPropulsor` field to `/vehicles/:slug` endpoint select
- **Frontend**: Implemented complete translation system for propulsion types
- **Value Mappings**: Added new `propulsionTypeValues` category with 4 values
- **Translation System**: Complete sync with installer data (combustio, electric, hibrid, hibrid-endollable)
- **Display**: Vehicle detail now shows "Eléctrico" instead of raw "electric" value

### Complete Vehicle Value Mappings Sync
- **Fuel Types**: Expanded from 7 to 13 values - fully synced with installer
- **Transmission Types**: Added `semi-automatic` and improved translations
- **Body Types**: Expanded from 5 to 12 specific values (utilitari-petit, turisme-mig, etc.)
- **Propulsion Types**: NEW category with 4 values from installer
- **Consistency**: All frontend mappings now 100% aligned with backend installer data

### Version Management System
- **Backend**: Updated to v0.3.7 with automatic version reading from package.json
- **Frontend**: Updated to v0.3.7 with centralized version config
- **Dashboard**: SystemInfo component shows both frontend and API versions
- **API Endpoints**: `/api` and `/api/system/info` return correct versions dynamically

### Previous Updates (v0.3.6 - 2025-07-31)

#### Vehicle "Reservat" Field Implementation
- **Frontend**: Added "Reservat" (Reserved) boolean field to vehicle form step 7
- **Backend**: Added `reservat` field to Prisma schema and API endpoints
- **UI**: Orange Switch component in 2x2 grid layout with Vehicle Venut, Destacat, and Actiu
- **Database**: Proper field persistence with boolean transformation
- **Admin Table**: Added column, filter, and optimistic toggle functionality

#### Mobile Menu Z-Index Fix
- **Issue**: Slider arrows appeared over mobile sidebar menu during scroll
- **Solution**: Increased mobile sidebar z-index to 70, overlay to 60
- **Enhancement**: Added CSS class management for menu state
- **Result**: Mobile menu now properly covers all content when open

#### Multilingual Vehicle Descriptions
- **Issue**: Vehicle detail page showed fallback descriptions instead of language-specific content
- **Root Cause**: Backend `/vehicles/:slug` endpoint missing multilingual description fields
- **Solution**: Added `descripcioAnunciCA/ES/EN/FR` fields to endpoint select
- **Frontend**: Implemented no-fallback logic - only shows description in current language
- **Behavior**: Hides description section if not available in selected language

#### Technical Improvements
- **API**: Enhanced vehicle detail endpoint with complete multilingual support
- **Performance**: Optimistic updates for all admin toggle switches
- **UX**: Improved mobile navigation with proper scroll control
- **Database**: Extended vehicle schema with reservation status tracking