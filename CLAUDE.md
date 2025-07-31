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

## Recent Updates (v0.3.6 - 2025-07-31)

### Vehicle "Reservat" Field Implementation
- **Frontend**: Added "Reservat" (Reserved) boolean field to vehicle form step 7
- **Backend**: Added `reservat` field to Prisma schema and API endpoints
- **UI**: Orange Switch component in 2x2 grid layout with Vehicle Venut, Destacat, and Actiu
- **Database**: Proper field persistence with boolean transformation
- **Admin Table**: Added column, filter, and optimistic toggle functionality

### Mobile Menu Z-Index Fix
- **Issue**: Slider arrows appeared over mobile sidebar menu during scroll
- **Solution**: Increased mobile sidebar z-index to 70, overlay to 60
- **Enhancement**: Added CSS class management for menu state
- **Result**: Mobile menu now properly covers all content when open

### Multilingual Vehicle Descriptions
- **Issue**: Vehicle detail page showed fallback descriptions instead of language-specific content
- **Root Cause**: Backend `/vehicles/:slug` endpoint missing multilingual description fields
- **Solution**: Added `descripcioAnunciCA/ES/EN/FR` fields to endpoint select
- **Frontend**: Implemented no-fallback logic - only shows description in current language
- **Behavior**: Hides description section if not available in selected language

### Technical Improvements
- **API**: Enhanced vehicle detail endpoint with complete multilingual support
- **Performance**: Optimistic updates for all admin toggle switches
- **UX**: Improved mobile navigation with proper scroll control
- **Database**: Extended vehicle schema with reservation status tracking