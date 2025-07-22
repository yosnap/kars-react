# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-es/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [0.1.2] - 2025-01-22

### Added
- 📦 **JSON Export Endpoint**: Nuevo endpoint `/api/vehicles/json` con soporte para exportación directa
  - Parámetro `raw=true` para obtener array JSON directo sin wrapper
  - Parámetros `limit` y `format` para controlar la salida
- 🔍 **Database Connection Test**: Script `test:connection` para diagnosticar problemas de conexión
- 📊 **Enhanced Error Logging**: Logging mejorado en `/api/vehicles/kars/stats` para debug en producción
- 📥 **JSON Import Improvements**: 
  - Límite de body parser aumentado a 10MB para archivos grandes
  - Scripts auxiliares para conversión de formatos JSON
  - Conversión automática de campos kebab-case a camelCase

### Changed
- 🏷️ **Project Rename**: Renombrado de "motoraldia-api" a "kars-api"
- 📚 **Documentation Update**: README actualizado para reflejar el propósito real del proyecto
- 🐛 **Error Handling**: Respuestas de error 500 ahora incluyen más detalles para diagnóstico

### Fixed
- 🚫 **PayloadTooLargeError**: Corregido error al importar archivos JSON grandes
- 📄 **JSON Import Format**: Ahora acepta correctamente arrays JSON directos
- 🔄 **Field Conversion**: Conversión automática de campos con guiones a camelCase en importación

## [0.1.1] - 2025-01-21

### Added
- ✅ **Docker Support**: Dockerfiles para React y API configurados para despliegue en EasyPanel
  - `/kars-react/Dockerfile`: Multistage build con nginx para servir la aplicación React
  - `/kars-api/Dockerfile`: Contenedor Node.js Alpine con usuario no-root y dumb-init
  - `/kars-react/nginx.conf`: Configuración nginx optimizada con gzip, security headers y SPA routing
- ✅ **Multi-step Vehicle Form**: Implementación completa del formulario de vehículos en 5 pasos
  - Selección de tipo de vehículo (Coche, Moto, Autocaravana, Vehículo Comercial)
  - Generación automática de títulos basada en marca, modelo y versión
  - Validación de pasos y navegación entre formularios
  - Descripciones multiidioma (Catalán, Inglés, Francés, Español)
  - Gestión de imágenes y estado de anuncios

### Fixed
- 🔧 **Media Organization**: Reorganización correcta de assets a `/public/media/`
- 🔧 **Import Paths**: Actualización de todas las rutas de imágenes y assets
- 🔧 **Git Repository**: Configuración correcta del repositorio con .gitignore optimizado

### Infrastructure
- 🐳 **Production Ready**: Contenedores Docker optimizados para producción
- 🔒 **Security**: Headers de seguridad, usuarios no-root, y configuración segura
- 📦 **Asset Management**: Cache optimizado para assets estáticos y media

## [0.1.0] - 2025-01-21

### Added
- 🎉 **Initial Release**: Primera versión completa de la plataforma Kars.ad
- ⚛️ **React 19 + TypeScript**: Aplicación moderna con Vite como bundler
- 🎨 **UI System**: Implementación completa con Tailwind CSS + Radix UI components
- 🚗 **Vehicle Management**: Sistema completo de gestión de vehículos
  - Listado con filtros avanzados y paginación
  - Vista grid/lista intercambiable
  - Búsqueda y filtrado por múltiples criterios
  - Sistema de favoritos
- 🔐 **Admin Panel**: Panel de administración completo
  - Dashboard con estadísticas reales de vehículos
  - Gestión de sincronización con API Motoraldia
  - Sistema de información del sistema
- 🌐 **API Integration**: Integración completa con API de Motoraldia
  - Sincronización automática y manual
  - Importación desde JSON
  - Autenticación Basic Auth
- 📱 **Responsive Design**: Diseño completamente responsivo
- 🌍 **Multi-language Support**: Preparado para Catalán, Inglés, Francés y Español
- 🎯 **Professional Features**: 
  - Hero section con carrusel de imágenes
  - Footer con información de contacto
  - Breadcrumb navigation
  - Loading states y skeleton loaders
  - Toast notifications

### Technical Features
- 📊 **State Management**: Context API para autenticación y favoritos
- 🛣️ **Routing**: React Router DOM con rutas dinámicas y protegidas
- 🔄 **API Client**: Axios con interceptors y manejo de errores
- 🎨 **Styling**: Tailwind CSS con sistema de design tokens
- 🧪 **Type Safety**: TypeScript completo con tipos definidos
- 🏗️ **Architecture**: Componentes reutilizables y layout system

### Infrastructure
- 🚀 **MongoDB**: Base de datos principal
- 🔌 **REST API**: API Node.js con Express
- 🐳 **Docker Ready**: Preparado para contenedores
- 🌐 **CORS**: Configuración para múltiples dominios