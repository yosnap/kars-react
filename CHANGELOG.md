# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-es/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-07-25

### 🎉 NEW FEATURE - Sistema de Versiones Unificado

### ✅ Añadido

#### Sistema de Versiones API/Frontend
- **Endpoint de información del sistema**: Nuevo endpoint `/api/system/info` que retorna:
  - Versión de la API (extraída dinámicamente de package.json)
  - Información del sistema (Node.js version, platform, arquitectura)
  - Estado de memoria (RSS, heap total, heap usado)
  - Información de base de datos (estado de conexión, conteos de colecciones)
  - Variables de entorno (NODE_ENV, PORT, CORS origins)
- **Seguimiento de versión unificado**: Ambos proyectos ahora en versión 0.2.0
- **getApiVersion()**: Función helper para leer versión dinámicamente del package.json

#### Interfaz de Usuario Mejorada
- **SystemInfo.tsx**: Actualizado para usar datos reales de la API
  - Muestra versiones separadas de Frontend y API
  - Estado de conexión de MongoDB con colores indicativos
  - Información del sistema actualizada en tiempo real
  - Función `formatUptime()` para mostrar uptime en formato legible
- **AdminDashboard.tsx**: Widget de información del sistema mejorado
  - Versiones Frontend/API mostradas por separado
  - Estado de base de datos con indicadores visuales
  - Grid de 4 columnas para mejor distribución de información

### 🔧 Mejoras Técnicas

#### Frontend
- **Fetch en tiempo real**: Sistema info se actualiza desde API en lugar de datos estáticos
- **Manejo de errores**: Graceful degradation si la API no está disponible
- **TypeScript**: Interfaces apropiadas para `SystemData` y `SystemInfo`
- **Refresh automático**: Botón de actualización refesca tanto system info como vehicle stats

#### Backend
- **Lectura dinámica de versiones**: No más hardcoding de versiones en el código
- **Información completa del sistema**: Memoria, CPU, uptime, database stats
- **Error handling robusto**: Manejo de errores en caso de problemas de BD
- **Información de entorno**: Variables importantes expuestas de forma segura

### 📊 Cambios de Archivos

#### API (kars-api)
- `package.json` - Versión actualizada a 0.2.0
- `src/index.ts` - Versión actualizada en endpoint status
- `src/routes/system.ts` - Nuevo endpoint con información completa del sistema

#### Frontend (kars-react)
- `package.json` - Versión actualizada a 0.2.0
- `src/config/version.ts` - Versión actualizada a 0.2.0
- `src/pages/Admin/SystemInfo.tsx` - Integración completa con API real
- `src/pages/Admin/AdminDashboard.tsx` - Widget de sistema mejorado con versiones separadas

### 🎯 Estado del Sistema

- ✅ **Versionado unificado**: Ambos proyectos sincronizados en v0.2.0
- ✅ **System info endpoint**: API funcional con información completa
- ✅ **UI actualizada**: Interfaces muestran datos reales de la API
- ✅ **Dashboard mejorado**: Información del sistema con versiones separadas
- ✅ **Error handling**: Manejo robusto de errores y fallbacks

### 📝 Notas de Implementación

Esta versión introduce un sistema robusto de seguimiento de versiones que permite:
- Monitoreo independiente de versiones de API y Frontend
- Información del sistema en tiempo real desde el backend
- Mejor debugging y diagnóstico de problemas
- Base sólida para futuras implementaciones de CI/CD

El sistema está preparado para evolucionar con implementaciones futuras de automatic versioning y deployment tracking.

## [0.1.4] - 2025-07-23

### 🎉 MAJOR SYSTEM OVERHAUL - Vehicle Management Complete Fix

Esta versión representa una corrección integral del sistema de gestión de vehículos, resolviendo todos los problemas críticos que impedían la creación, edición y listado correctos de vehículos.

### ✅ Corregido

#### Sistema de Gestión de Imágenes
- **Error de previsualización de imagen destacada**: Corregido preview que no aparecía después de subir imagen desde URL
- **Sistema de carga de imágenes de galería**: Funcionalidad completa de upload y preview
- **Funciones separadas de procesamiento**: `getFeaturedImageUrl()` y `getGalleryImageUrl()` para manejo diferenciado
- **Manejo de errores de carga**: Retroalimentación al usuario cuando las imágenes fallan al cargar
- **Servido de imágenes**: Fix para desarrollo y producción con configuración correcta de Vite

#### Sistema de Formulario de Vehículos
- **Error 500 en guardado**: Eliminado completamente el error durante envío de formulario
- **Validación de campos**: Sistema completo de validación antes del envío a API
- **Normalización de datos**: Precio como float, conversiones boolean correctas
- **Filtrado de campos**: Eliminación automática de campos no soportados (`seguretat`, `confort`, `multimedia`)
- **Manejo de userId**: Fix para compatibilidad con ObjectId de MongoDB

#### Sistema de Marcas y Modelos
- **Error 404 en búsqueda de modelos**: Validación de existencia de marca antes de llamadas API
- **Filtrado de marcas por tipo**: Separación correcta entre marcas de coches y motos
- **Migración de datos**: 23 marcas de motos corregidas de categorización incorrecta 'car' a 'motorcycle'
- **Cambio de tipo de vehículo**: Limpieza automática de selecciones incompatibles

#### Sistema de Base de Datos
- **Migración de schema**: Campo `preu` migrado de String a Float en Prisma
- **Migración de datos**: 149 vehículos existentes migrados al nuevo schema Float
- **Endpoint GET /api/vehicles**: Fix completo del endpoint que fallaba por incompatibilidad de tipos
- **Cliente Prisma**: Regeneración completa para coincidir con schema actualizado

### 🔧 Mejoras Técnicas

#### Frontend
- **React Query**: Manejo de errores mejorado y lógica de reintento
- **Estado de formulario**: Mejor gestión a través de los pasos del formulario multi-etapa  
- **Integración API**: Manejo de errores mejorado y validación de datos
- **Procesamiento de imágenes**: Validación de URL mejorada y funcionalidad de preview
- **TypeScript**: Corrección de problemas de seguridad de tipos con datos de formulario

#### Backend
- **Filtrado de campos**: Sistema automático para prevenir campos desconocidos
- **Logging de errores**: Sistema comprehensive de logging en toda la API
- **Validación de endpoints**: Validación mejorada para creación de vehículos
- **Optimización de queries**: Mejor performance en listado de vehículos
- **Manejo de datos**: Normalización mejorada antes de operaciones de BD

### 📊 Cambios de Base de Datos
- **Colección Vehicle**: 149 vehículos migrados de String a Float para precios
- **Colección Brand**: 23 marcas de motos corregidas en su clasificación vehicleTypes
- **Schema Updates**: Schema Prisma actualizado con tipos de campo correctos

### 🎯 Archivos Modificados

#### Frontend
- `src/components/VehicleForm/MultiStepVehicleForm.tsx` - Overhaul completo de manejo de imágenes
- `src/hooks/api/useVehicles.ts` - Manejo de errores API mejorado y normalización de datos
- `src/components/VehicleForm/VehicleForm.tsx` - Lógica de envío de formulario mejorada
- `vite.config.ts` - Configuración de servido de assets estáticos añadida
- `CLAUDE.md` - Documentación actualizada con cambios del frontend

#### Backend
- `src/routes/vehicles.ts` - Operaciones CRUD de vehículos mejoradas con filtrado de campos
- `src/routes/brands.ts` - Filtrado de marcas corregido y corrección de marcas de motos añadida
- `src/services/syncService.ts` - Actualizado para nuevo tipo Float de precio
- `src/services/vehicleImporter.ts` - Manejo de tipo de precio corregido en operaciones de importación
- `prisma/schema.prisma` - Modelo Vehicle actualizado con campo precio Float
- `CLAUDE.md` - Documentación actualizada con cambios del backend

### 🚀 Estado del Sistema Después de las Correcciones
- ✅ **Creación de vehículos**: Completamente funcional sin errores
- ✅ **Subida de imágenes**: Funcionando correctamente en desarrollo y producción
- ✅ **Filtrado marca/modelo**: Correctamente separado por tipo de vehículo
- ✅ **Listado de vehículos**: Performance corregida y errores 500 eliminados
- ✅ **Consistencia de BD**: Todas las incompatibilidades de tipos resueltas
- ✅ **Validación de formularios**: Manejo de errores comprehensive y feedback al usuario

### 🧪 Scripts de Migración Utilizados
- Script de migración directa MongoDB para campo precio (149 vehículos procesados)
- Script de corrección de categorización de marcas de motos (23 marcas corregidas)
- Regeneración de cliente Prisma para actualizaciones de schema

### 📝 Notas
Esta versión corrige todos los problemas críticos que impedían el funcionamiento correcto del sistema de gestión de vehículos. El sistema está ahora listo para uso en producción con capacidades completas de creación, edición y listado de vehículos.

## [0.1.3] - 2025-07-22

### Añadido
- Sistema completo de gestión de marcas y modelos de vehículos
- Endpoints para CRUD de marcas (`/api/brands`)
- Sincronización automática de modelos desde API externa de Motoraldia
- Scripts de sincronización masiva para coches y motos
- Interfaz TypeScript `ExternalModel` para tipado correcto de datos externos
- Soporte para coches, autocaravanas, vehículos comerciales y motocicletas

### Mejorado
- Formulario de vehículos ahora usa selects dinámicos para marcas y modelos
- Carga de modelos en cascada al seleccionar marca
- Manejo robusto de errores en sincronización con reintentos automáticos
- Procesamiento en lotes para evitar sobrecarga de API externa
- Logs detallados para monitoreo de sincronización

### Corregido
- Errores de compilación TypeScript en rutas de marcas
- Tipado correcto para datos de modelos externos
- Validación de formato de respuesta de API externa

### Técnico
- **Base de datos**: 113 marcas de coches con 1,909 modelos sincronizados
- **Base de datos**: 66 marcas de motos con 1,168 modelos sincronizados
- **API**: Rate limiting y timeout de 30s para llamadas externas
- **Arquitectura**: Separación clara entre sincronización de coches y motos

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