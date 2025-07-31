# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-es/1.0.0/),
y este proyecto adhiere al [Versionado Semántico](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-07-31

### 🔐 Sistema de Control de Acceso Basado en Roles (RBAC)

### ✅ Añadido

#### Sistema de Autenticación Multi-usuario
- **Dos niveles de usuario**: Super Admin y Admin Regular con permisos diferenciados
- **Variables de entorno separadas**: Credenciales independientes para cada tipo de usuario
- **Detección automática de rol**: El sistema identifica el tipo de usuario al hacer login
- **Backend actualizado**: Middleware de autenticación soporta múltiples usuarios y roles

#### Componente ProtectedSection
- **Nuevo componente reutilizable**: `ProtectedSection` para proteger elementos de UI
- **Control granular**: Permite restringir secciones completas o elementos individuales
- **Soporte para múltiples roles**: Configurable para requerir roles específicos
- **Fallback personalizable**: Opción de mostrar contenido alternativo para usuarios sin permisos

#### Restricciones para Admin Regular
- **Configuración limitada**: Solo acceso a pestaña "WhatsApp" en Configuración
- **Sin acceso a sincronización**: Pestañas de sincronización ocultas (Motor, Busco)
- **Sin gestión de traducciones**: Pestañas de traducciones restringidas
- **Importación/Exportación bloqueada**: Botones de import/export ocultos
- **Brands/Models restringido**: Pestaña de gestión de marcas/modelos solo para super admin
- **Sistema de información limitado**: Sección "Tecnologies i Dependències" oculta
- **Campo notas internes oculto**: En formulario de vehículos, solo super admin puede ver/editar

#### Mejoras de Seguridad
- **Autenticación robusta**: Validación de credenciales en cada request
- **Roles en contexto**: AuthContext actualizado con información de rol del usuario
- **Helpers de rol**: Funciones `isSuperAdmin()` y `isAdmin()` para verificación rápida

### 🔧 Modificado

#### AuthContext Mejorado
- **Detección de rol integrada**: `detectUserRole()` identifica el tipo de usuario
- **Estado de rol persistente**: Se mantiene el rol durante toda la sesión
- **Login actualizado**: Proceso de login ahora incluye detección y almacenamiento de rol

#### Variables de Entorno Reorganizadas
- **Frontend**: `VITE_API_SUPER_ADMIN_USER/PASS` y `VITE_API_ADMIN_USER/PASS`
- **Backend**: `SUPER_ADMIN_USER/PASS` y `ADMIN_USER/PASS`
- **Consistencia**: Nombres de variables alineados entre frontend y backend

#### Middleware de Autenticación
- **Soporte multi-usuario**: Valida contra múltiples conjuntos de credenciales
- **Asignación de rol**: Añade `userRole` al request para uso posterior
- **Logs mejorados**: Información detallada sobre el tipo de autenticación

### 🐛 Corregido

#### Errores de Autenticación
- **Variables undefined**: Corregido problema de variables de entorno no cargadas
- **Sincronización de credenciales**: Frontend y backend ahora usan las mismas variables
- **Validación robusta**: Manejo mejorado de casos edge en autenticación

#### Errores de JSX
- **Estructura HTML**: Corregidos múltiples errores de divs sin cerrar
- **Comentarios JSX**: Convertidos comentarios JS a formato JSX válido
- **Anidamiento**: Arreglada estructura de componentes ProtectedSection

### 📚 Documentación

#### Archivo .env.example
- **Creado para referencia**: Documenta todas las variables de entorno necesarias
- **Separación clara**: Variables de super admin vs admin regular
- **Comentarios explicativos**: Descripción del propósito de cada variable

#### Sistema de Roles
- **Super Admin**: Acceso completo a todas las funcionalidades
- **Admin Regular**: Acceso restringido a funciones básicas y operativas
- **Extensibilidad**: Arquitectura preparada para añadir más roles en el futuro

### 💡 Notas de Implementación

- El sistema está diseñado para ser extensible a más roles si es necesario
- Las restricciones se aplican tanto en UI como en API para máxima seguridad
- Los componentes protegidos simplemente no se renderizan para usuarios sin permisos
- El campo de notas internas mantiene la información sensible solo para super admins

## [0.3.7] - 2025-07-31

### 🚗 Campo "Reservat" y Correcciones de Producción

### ✅ Añadido

#### Campo "Reservat" (Reservado)
- **Nuevo campo booleano**: Added `reservat` field to vehicle schema and forms
- **UI en formulario**: Switch naranja en paso 7, agrupado con Venut, Destacat y Actiu
- **Tabla admin**: Nueva columna con toggle optimista y filtro funcional
- **Facets manuales**: Cálculo especial para manejar valores null en MongoDB
- **Persistencia completa**: Campo guardado correctamente en base de datos

### 🔧 Modificado

#### Endpoint de Detalle de Vehículo
- **Campos multiidioma añadidos**: `descripcioAnunciCA/ES/EN/FR` en respuesta
- **Sin fallback**: Frontend muestra solo descripción del idioma actual
- **Sección condicional**: Se oculta completamente si no hay descripción disponible

### 🐛 Corregido

#### Mobile Menu Z-Index
- **Problema**: Flechas del slider aparecían sobre el menú móvil
- **Solución**: Sidebar z-index: 70, overlay z-index: 60
- **Mejora**: Gestión de clases CSS para estado del menú

#### Traducciones de Extras en Producción
- **MongoDB compatibility**: Eliminado `mode: 'insensitive'` no soportado
- **Inicialización completa**: Script actualizado con 153 traducciones
- **Nombres de campo**: Corregidos de camelCase a snake_case

#### Toggle de Reservat
- **Lógica corregida**: Manejo de undefined con Boolean() conversion
- **Estado visual**: Switch muestra estado correcto desde API
- **Conteo de filtros**: Facets calculados manualmente para precisión

## [0.3.6] - 2025-07-31

### 🎯 Mejoras de Rendimiento y UX

### ✅ Añadido
- **Carga optimizada de modelos**: Los modelos se cargan solo cuando se selecciona una marca
- **Validación de marca**: Se verifica que la marca existe antes de intentar cargar modelos (previene errores 404)

### 🔧 Modificado
- **Comportamiento del selector de tipo de vehículo**: Al cambiar entre coche/moto se limpian marca y modelo para evitar inconsistencias
- **Gestión de estado mejorada**: Mejor sincronización entre los selectores de marca/modelo

### 🐛 Corregido
- **Error 404 en modelos**: Se previene la llamada a la API cuando no hay marca seleccionada
- **Limpieza de formulario**: Los campos incompatibles se limpian al cambiar el tipo de vehículo

## [0.3.5] - 2025-07-30

### 🍪 Sistema de Cookies y Páginas Legales

### ✅ Añadido

#### Sistema Completo de Gestión de Cookies
- **Componente CookieBanner**: Banner flotante con diseño moderno y responsive
- **Categorías de cookies**: Necesarias, Analíticas, Marketing (solo necesarias activadas por defecto)
- **CookieProvider**: Context API para gestión global del estado de cookies
- **Persistencia**: Preferencias guardadas en localStorage con expiración de 365 días
- **Hook useCookies**: Para acceso fácil al estado y funciones de cookies

#### Modal de Configuración de Cookies
- **Diseño a pantalla completa**: Modal moderno con backdrop oscuro
- **Switches interactivos**: Control individual por categoría de cookies
- **Descripciones detalladas**: Explicación clara de cada tipo de cookie
- **Tabla de cookies**: Listado completo con nombre, tipo, duración y descripción

#### Páginas Legales Completas
- **Política de Privacidad**: `/politica-privacitat` con contenido legal completo
- **Política de Cookies**: `/politica-cookies` con información detallada GDPR
- **Aviso Legal**: `/avis-legal` con información de la empresa
- **Términos y Condiciones**: `/termes-condicions` con términos de uso

#### Footer Mejorado
- **Sección legal**: Enlaces a todas las páginas legales
- **Gestión de cookies**: Botón para reabrir configuración de cookies
- **Diseño responsive**: Layout optimizado para móvil y desktop
- **Integración con CookieProvider**: Botón funcional para gestionar preferencias

### 🔧 Modificado

#### Estructura del Footer
- **Reorganización**: Nueva sección "Legal" con todos los enlaces legales
- **Componente PrivacyLinks**: Extraído para reutilización
- **Estilo mejorado**: Mejor espaciado y organización visual

#### Sistema de Rutas
- **Nuevas rutas**: Añadidas todas las rutas de páginas legales
- **URLs limpias**: Formato kebab-case consistente

### 🎨 Características de Diseño

#### Cookie Banner
- **Posición**: Fijo en esquina inferior derecha
- **Animación**: Aparece con transición suave
- **Colores**: Fondo blanco con bordes grises, botones azules
- **Responsive**: Se adapta a móvil con ancho completo

#### Modal de Cookies
- **Backdrop**: Fondo oscuro con opacidad para focus
- **Scrollable**: Contenido con scroll si es necesario
- **Accesibilidad**: Cierre con tecla ESC y click fuera

## [0.3.4] - 2025-07-30

### 🌐 Sistema de Idiomas Completo y Especificaciones Eléctricas

### ✅ Añadido

#### Sistema Completo de Especificaciones Eléctricas
- **Sección eléctrica en VehicleDetail**: Nueva sección después de "Característiques" con todos los campos eléctricos
- **Soporte multiidioma completo**: Traducciones para CA, ES, EN, FR de todas las etiquetas y valores
- **Mapeo completo de valores**: Tipos de batería, cables, conectores y velocidades de carga
- **Renderizado condicional**: Se muestra solo para vehículos eléctricos/híbridos o con datos eléctricos
- **Layouts responsivos**: Versiones optimizadas para móvil/tablet y desktop

#### Arreglos del Sistema de Idiomas  
- **Cambio de idiomas corregido**: URLs se traducen correctamente entre todos los idiomas
- **Mapeo bidireccional**: Rutas localizadas funcionan en ambas direcciones (CA ↔ ES ↔ EN ↔ FR)
- **Rutas de favoritos**: Agregadas todas las rutas localizadas faltantes (/favoritos, /favorites, /favoris)
- **Algoritmo mejorado**: `getPathWithoutLanguage()` maneja rutas dinámicas correctamente

#### Traducciones de Contenido
- **Títulos de taller**: "Bosch Car Services" traducido contextualmente según idioma
- **Catalan**: "Taller Bosch Car Service"
- **Español**: "Taller Bosch Car Service" 
- **Inglés**: "Bosch Car Service Workshop"
- **Francés**: "Atelier Bosch Car Service"

### 🔧 Técnico

#### Mejoras en LanguageContext
- **Función `getPathWithoutLanguage()` mejorada**: Busca mapeos parciales para rutas dinámicas
- **Mapeo de rutas ampliado**: Agregado soporte para `/favorits` en todos los idiomas
- **Limpieza de código**: Removidos console.log de debug y arreglados warnings TypeScript
- **Algoritmo robusto**: Maneja correctamente rutas complejas y parámetros dinámicos

#### Implementación de Especificaciones Eléctricas
- **VehicleDetail.tsx actualizado**: Nueva sección con 10+ campos eléctricos
- **Mapeo completo de valores**: Diccionarios de traducción para todos los valores específicos
- **Condicional inteligente**: Se muestra basado en tipo de propulsión o presencia de datos
- **Design consistente**: Mantiene el estilo visual del resto de la aplicación

#### Sistema de Rutas Localizadas
- **App.tsx actualizado**: Agregadas rutas faltantes para favoritos en todos los idiomas
- **Rutas agregadas**:
  - `/es/favoritos` → FavoritosPage
  - `/en/favorites` → FavoritosPage  
  - `/fr/favoris` → FavoritosPage
  - `/ca/favorits` → FavoritosPage

### 🎯 Estado del Sistema
- ✅ **Cambio de idiomas**: Funciona correctamente en todas las páginas
- ✅ **Especificaciones eléctricas**: Sección completa con soporte multiidioma
- ✅ **Traducciones de contenido**: Títulos contextualizados según idioma
- ✅ **Rutas localizadas**: Todas las páginas accesibles en 4 idiomas
- ✅ **Reload intencional**: Mantiene comportamiento de recarga para consistencia

## [0.3.2] - 2025-07-28

### 🚀 Sistema de Eliminación de Vehículos y Limpieza de Producción

### ✅ Añadido

#### Sistema Completo de Eliminación de Vehículos
- **DELETE endpoint**: `/vehicles/:id/sync-to-motoraldia/remove` para eliminar vehículos de Motoraldia API
- **Eliminación desde admin**: Botón directo en tabla de listado de vehículos admin
- **Limpieza automática**: Campos de sincronización se limpian en base de datos después de eliminación
- **Manejo de credenciales**: API usa credenciales almacenadas en configuración

#### Configuración de Sincronización Mejorada
- **Persistencia de credenciales**: Credenciales se guardan automáticamente en localStorage
- **Campo userId eliminado**: WordPress auto-detecta usuario a través de credenciales
- **Variable PUBLIC_BASE_URL**: Configuración para conversión de URLs de imágenes
- **Sistema robusto de errores**: Logs detallados para debugging de sincronización

#### Limpieza de Logs para Producción
- **Eliminación masiva**: Todos los console.log de debug removidos de la aplicación
- **Logs críticos conservados**: console.error mantenidos para monitoreo en producción
- **Logs con emojis eliminados**: Limpieza de mensajes de desarrollo
- **Aplicación production-ready**: Sin logs innecesarios para despliegue

### 🔧 Técnico

#### Implementación Backend
- **DELETE endpoint completo**: `vehicles.ts:1200+` con manejo de credenciales
- **Función convertToFullUrl()**: Conversión de paths locales a URLs completas
- **Limpieza de campos sync**: motorIdSync, syncError se limpian después de eliminación
- **Validación mejorada**: Verificación de credenciales antes de llamada API

#### Implementación Frontend
- **AdminSettings mejorado**: Sistema de persistencia de credenciales
- **KarsVehicles actualizado**: Botón eliminar conectado con endpoint DELETE
- **Manejo de errores**: Toast notifications para operaciones exitosas/fallidas
- **Estado de sincronización**: Indicadores visuales de estado de sync

### 🎯 Estado del Sistema
- ✅ **Eliminación de vehículos**: Funcionalidad completa desde panel admin
- ✅ **Persistencia de credenciales**: Guardado automático en configuración
- ✅ **Production ready**: Logs limpiados para despliegue
- ✅ **Sync de imágenes**: URLs convertidas correctamente para API externa
- ✅ **Manejo de errores**: Sistema robusto implementado

## [0.3.1] - 2025-07-27

### 🔗 URLs Separadas para Vehículos y Mejoras SEO Críticas

### ✅ Añadido

#### Diferenciación de Estructuras URL
- **URLs específicas por estado**:
  - **Vehículos disponibles**: `/vehicles/brand`, `/vehicle/slug`
  - **Vehículos vendidos**: `/ultimes-vendes/marca/brand`, `/ultimes-vendes/vehicle/slug`
  - **Soporte multiidioma**: Todas las rutas en 4 idiomas
  - **Separación semántica**: Clara distinción para SEO y experiencia de usuario

#### Sistema de Estado Activo en Menú
- **Detección inteligente**: Reconoce rutas padre para ítems de menú
- **Rutas anidadas**: Páginas de detalle activan menú padre correctamente
- **Variaciones de idioma**: Funciona con todas las estructuras URL
- **Menús responsive**: Highlighting correcto en desktop y móvil

#### Mejoras SEO Críticas
- **Atributo lang dinámico**: `<html lang="xx">` basado en idioma actual
- **Detección por buscadores**: Identificación correcta de idioma por motores de búsqueda
- **Indexación corregida**: Eliminado problema de todas las páginas indexadas como catalán
- **Compliance multiidioma**: SEO completamente compatible con 4 idiomas

#### Mejoras en Navegación Breadcrumbs
- **Breadcrumbs contextuales**: Diferenciación entre vehículos vendidos/disponibles
- **Efectos hover arreglados**: Solo afectan enlaces individuales
- **Enlaces de marca**: Mantienen contexto de estado del vehículo
- **Texto localizado**: Breadcrumbs en todos los idiomas

### 🔧 Técnico
- **Configuración Router**: Mapeo completo de rutas vendidos/disponibles
- **Navigation Hooks**: `useLocalizedNavigation` mejorado para routing complejo
- **Detección de Estado**: Función `isActiveRoute()` inteligente para estados de menú
- **Optimización SEO**: Gestión dinámica del atributo lang HTML
- **Componentes actualizados**: VehicleCard, VehicleDetail, Header, PageBreadcrumbs

## [0.3.0] - 2025-07-27

### 🌐 Sistema de URLs Localizadas y Mejoras de Internacionalización

### ✅ Añadido

#### URLs Amigables con Prefijo de Idioma
- **Sistema completo de URLs localizadas**:
  - Español: `/es/vehiculos`, `/es/quienes-somos`, `/es/servicios`
  - Inglés: `/en/vehicles`, `/en/about-us`, `/en/services`
  - Francés: `/fr/vehicules`, `/fr/qui-sommes-nous`, `/fr/services`
  - Catalán: `/vehicles`, `/qui-som`, `/serveis` (sin prefijo, idioma por defecto)

#### Navegación Persistente de Idioma
- **Hook `useLocalizedNavigation()`**: Navegación que preserva el idioma actual
- **Función `getLocalizedPath()`**: Generación automática de URLs localizadas
- **Detección automática**: El idioma se detecta desde la URL path
- **Persistencia completa**: El idioma se mantiene en toda la navegación

#### Páginas de Detalle Localizadas
- **URLs de vehículos traducidas**:
  - `/es/vehiculo/audi-a4-2020`
  - `/en/vehicle/audi-a4-2020`
  - `/fr/vehicule/audi-a4-2020`
  - `/vehicle/audi-a4-2020` (catalán)
- **Breadcrumbs localizados**: Enlaces de vuelta mantienen el idioma
- **Componentes actualizados**: VehicleCard, VehicleListCard, Header

#### Atributo HTML Lang Dinámico
- **`<html lang="xx">`**: Se actualiza automáticamente según idioma seleccionado
- **Detección por navegador**: Mejora accesibilidad y SEO
- **Herramientas de traducción**: Funcionan correctamente con el idioma detectado

#### Traducciones de Interface Completas
- **Controles de listado**: "Mostrando X-Y de Z resultados", "Ordenar por", "Mostrar"
- **Paginación**: "Anterior", "Siguiente", "Précédent", "Next"
- **Títulos de páginas**: Todos los títulos ahora son dinámicos por idioma
- **40+ nuevas traducciones** en 4 idiomas

#### Banderas de Idiomas Corregidas
- **Imágenes reales**: Reemplazado emojis por archivos PNG/SVG
- **Bandera catalana correcta**: Usa `/flags/ca.png` con rayas amarillas y rojas
- **Estilo consistente**: Todas las banderas con el mismo formato visual

### 🔧 Técnico

#### Archivos Nuevos
- `hooks/useLocalizedNavigation.ts`: Hook para navegación localizada
- `components/LocalizedRouter.tsx`: Enrutador con soporte multiidioma
- `components/LocalizedRoute.tsx`: Componente de rutas localizadas

#### Funciones Helper
- `getLocalizedPath()`: Generar URLs con prefijo de idioma
- `getPathWithoutLanguage()`: Extraer path sin prefijo
- `getLanguageFromPath()`: Detectar idioma desde URL
- Mapeo completo de rutas traducidas por idioma

### 🚀 Beneficios

- ✅ **UX mejorada**: Los usuarios nunca pierden su idioma al navegar
- ✅ **SEO optimizado**: URLs específicas por idioma (`/es/vehiculos` vs `/en/vehicles`)
- ✅ **Accesibilidad**: Lectores de pantalla detectan idioma correctamente
- ✅ **Herramientas de traducción**: Navegadores ofrecen traducciones apropiadas
- ✅ **Escalabilidad**: Fácil agregar nuevas rutas localizadas

---

## [0.2.2] - 2025-07-27

### 🌐 Sistema de Traducciones Automáticas

### ✅ Añadido

#### Panel de Configuración de Traducciones
- **Nueva pestaña "Traduccions"** en configuración de administrador
  - Configuración completa de webhook n8n para traducciones automáticas
  - Campos para URL del webhook, usuario y contraseña
  - Selección de idioma fuente (catalán) y idiomas objetivo
  - Toggle para habilitar/deshabilitar traducciones automáticas
  - Configuración de timeout personalizable
- **Navegación con parámetros URL**: Las pestañas ahora usan parámetros URL
  - `/admin/settings?tab=whatsapp`
  - `/admin/settings?tab=api-sync` 
  - `/admin/settings?tab=translations`
  - Navegación persistente y enlaces directos a pestañas específicas

#### Traducción Automática en Formularios
- **Integración en formulario de vehículos**: Al guardar/editar vehículo con descripción en catalán
  - Envío automático al servicio de traducción n8n
  - Traducción en background sin bloquear la navegación
  - Notificaciones de progreso para el usuario
  - Logging detallado para debugging

#### Endpoints del Backend
- **POST /api/admin/translation-config**: Guardar configuración de traducciones
- **GET /api/admin/translation-config**: Obtener configuración actual
- **POST /api/admin/receive-translations**: Recibir traducciones desde n8n
  - Actualización automática de campos `descripcioAnunciES`, `descripcioAnunciEN`, `descripcioAnunciFR`
  - Validación de vehículo existente
  - Logging completo del proceso
- **POST /api/admin/sync-translations**: Sincronizar traducciones de vehículos existentes
- **POST /api/admin/test-translation-webhook**: Probar conexión con webhook

### 🛠️ Flujo de Traducción Implementado

1. **Frontend → n8n**: Envía descripción en catalán + ID del vehículo
2. **n8n → OpenRouter/LLM**: Procesa traducciones automáticas  
3. **n8n → Backend**: Devuelve traducciones al endpoint `/receive-translations`
4. **Backend → Database**: Guarda automáticamente en campos multiidioma

### 🔧 Mejoras Técnicas

#### Frontend (v0.2.2)
- **AdminSettings.tsx**: Panel completo de configuración de traducciones en catalán
- **VehicleForm.tsx**: Integración con servicio de traducción automática
- **useSearchParams**: Navegación con parámetros URL para pestañas
- **Persistent configuration**: Carga automática de configuración guardada

#### Backend (v0.2.3)
- **admin.ts**: Nuevos endpoints para gestión completa de traducciones
- **Validación robusta**: Verificación de vehículos existentes y configuración válida
- **Error handling**: Manejo completo de errores y logging detallado
- **Webhook integration**: Soporte completo para recepción de traducciones desde n8n

### 🎯 Sistema Listo para Producción
- ✅ Configuración persistente de traducciones
- ✅ Integración completa con n8n workflows
- ✅ Traducción automática al guardar vehículos
- ✅ Soporte multiidioma (catalán, español, inglés, francés)
- ✅ Interface en catalán según especificaciones del proyecto

## [0.2.1] - 2025-07-26

### 🎉 Vehicle Form Complete Fix - Extras and Commercial Vehicles

### ✅ Corregido

#### Sistema de Extras de Vehículos
- **Datos de inicialización de extras**: Actualización completa de todos los extras
  - Extras de coches: 93 elementos correctos (antes mostraba 58)
  - Extras de autocaravanas: 84 elementos correctos (antes mostraba 51)
  - Extras de motos: 30 elementos correctos con valores sin sufijos
- **Contador de instalador**: Corregidos los números mostrados en el instalador
- **Funcionalidad "Seleccionar todos"**: Fix del botón que solo seleccionaba el último elemento
  - Implementación de selección/deselección por lotes
  - Funciones batch para mejorar performance
- **Separación de extras**: Autocaravanas ahora muestran dos secciones distintas
  - Extras de autocaravana
  - Extras del habitáculo (sin duplicados)

#### Sistema de Marcas y Modelos
- **Vehículos comerciales**: Configurados para usar marcas/modelos de coches
  - Ahora usan `marcaCotxe` y `modelsCotxe`
  - Migración automática de datos antiguos
  - Compatible con vehículos existentes
- **Autocaravanas**: Ya configuradas previamente para usar marcas de coches
- **Preselección de modelos**: Corregido problema de carga en formulario de edición

#### Integración con API
- **Estructura de respuesta**: Fix del check de respuesta API
  - Eliminado check innecesario de `response.data?.success`
  - Ahora verifica directamente `response.data?.data`
- **Carga dinámica**: Extras ahora se cargan desde API en lugar de datos hardcodeados

### 🔧 Mejoras Técnicas

#### Frontend
- **ExtrasGrid.tsx**: Implementación de selección múltiple eficiente
- **useVehicleExtras.ts**: Corrección de interpretación de respuesta API
- **EquipmentExtrasStep.tsx**: Separación completa de secciones de extras
- **VehicleForm.tsx**: Migración de campos para compatibilidad

#### Backend
- **Inicialización de datos**: Arrays actualizados con datos correctos
- **Instalador**: Contadores actualizados para reflejar números reales
- **Compatibilidad**: Sistema de migración para campos antiguos

### 📊 Resumen de Cambios

- ✅ Extras de coches: 58 → 93 elementos
- ✅ Extras de autocaravanas: 51 → 84 elementos  
- ✅ Extras de motos: Valores corregidos sin sufijos
- ✅ Vehículos comerciales: Ahora usan campos de coches
- ✅ Selección múltiple: Funcionalidad completamente operativa
- ✅ API: Interpretación correcta de respuestas

### 🎯 Estado del Sistema

Todos los tipos de vehículos ahora funcionan correctamente con:
- Selección correcta de marcas y modelos
- Extras cargados dinámicamente desde API
- Datos de inicialización actualizados y precisos
- Formularios completamente funcionales para crear y editar

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