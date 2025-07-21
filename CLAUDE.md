## Project Language and Communication
- Project will be exclusively in Catalan, but code will be in English following programmer guidelines for code readability
- Communication will always be in SPANISH
- Website will support 4 languages: Catalan (primary), English, French, and Spanish

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