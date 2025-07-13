# Compatibilidad API Externa vs API Interna

Este documento detalla las diferencias entre la API externa de WordPress y la nueva API interna, así como los cambios necesarios para la rama `api-integration`.

## 📋 Estado Actual

### ✅ Endpoints Compatibles (Ya funcionan)
- `GET /vehicles` - Listado de vehículos con paginación
- `GET /vehicles/{slug}` - Detalle de vehículo por slug
- `GET /admin/stats` - Estadísticas del sistema
- `GET /admin/blog-posts` - Gestión de posts del blog

### ✅ Endpoints Implementados

#### 1. **Filtros y Metadatos**
```
# API Externa (WordPress)          # API Interna (Implementado)
GET /estat-vehicle                 → GET /vehicle-states ✅
GET /tipus-combustible             → GET /fuel-types ✅  
GET /tipus-propulsor              → GET /transmission-types ✅
GET /colors-exterior              → GET /exterior-colors ✅
GET /marques-cotxe                → GET /brands/cars ✅
GET /marques-moto                 → GET /brands/motorcycles ✅
```

#### 2. **Usuarios y Vendedores**
```
# API Externa                      # API Interna (Implementado)
GET /sellers                      → GET /professionals ✅
GET /sellers?user_id={id}         → GET /professionals/{id} ✅
```

#### 3. **Estructura de Respuesta**
La API interna debe mantener estas estructuras para compatibilidad:

```json
// Estructura esperada para /vehicles
{
  "items": [...],
  "total": 123,
  "pages": 5,
  "facets": {
    "tipusVehicle": {...},
    "marca": {...}
  }
}

// Estructura esperada para filtros (/fuel-types, etc.)
{
  "data": [
    {"id": 1, "name": "Gasoline", "slug": "gasoline"},
    {"id": 2, "name": "Diesel", "slug": "diesel"}
  ]
}
```

## 🔧 Cambios Realizados en la Rama api-integration

### 1. **Variables de Entorno**
```env
# Antes (.env.development - API externa)
VITE_API_BASE_URL=https://motoraldia.net/wp-json/api-motor/v1
VITE_API_ADMIN_USER=Paulo
VITE_API_ADMIN_PASS="U^q^i2l49rZrX72#Ln!Xe5k0"

# Ahora (.env - API interna)
VITE_API_BASE_URL=http://localhost:3001/api
VITE_API_ADMIN_USER=admin
VITE_API_ADMIN_PASS=admin_password
```

### 2. **Archivos Modificados**
- ✅ `.env` - Nueva configuración para API interna
- ✅ `.env.example` - Documentación de variables
- ✅ `API_COMPATIBILITY.md` - Este documento

## ✅ Endpoints Completamente Implementados en motoraldia-api

### 1. **Filtros y Metadatos** - `src/routes/metadata.ts`
```typescript
// ✅ GET /api/vehicle-states
// Devuelve todos los estados de vehículo (Nou, Ocasió, Km0, etc.)

// ✅ GET /api/fuel-types  
// Devuelve todos los tipos de combustible (Benzina, Dièsel, Elèctric, etc.)

// ✅ GET /api/transmission-types
// Devuelve todos los tipos de transmisión (Automàtic, Manual, Seqüencial, etc.)

// ✅ GET /api/exterior-colors
// Extrae colores únicos de vehículos existentes

// ✅ GET /api/brands/cars
// Devuelve marcas de coches con sus modelos

// ✅ GET /api/brands/motorcycles  
// Devuelve marcas de motos con sus modelos
```

### 2. **Profesionales** - `src/routes/professionals.ts`
```typescript
// ✅ GET /api/professionals
// Listado paginado de profesionales/vendedores únicos

// ✅ GET /api/professionals/:id
// Detalle completo de profesional con información y vehículos

// ✅ GET /api/professionals/:id/vehicles
// Vehículos paginados de un profesional específico
```

## 🔄 Plan de Migración

### Fase 1: Funcionalidad Básica (Actual)
- ✅ Configuración de variables de entorno
- ✅ Endpoints principales (/vehicles, /admin/*)
- ⚠️ **Limitación**: Los filtros avanzados no funcionarán hasta la Fase 2

### Fase 2: Filtros y Metadatos
- Implementar endpoints de filtros en motoraldia-api
- Verificar compatibilidad con componentes existentes
- Testing de búsqueda avanzada

### Fase 3: Profesionales
- Implementar endpoints de profesionales
- Verificar perfiles y secciones de vendedores
- Testing completo de funcionalidad

## 🧪 Testing

### Comandos de Verificación
```bash
# 1. Verificar API interna está corriendo
curl http://localhost:3001/api/vehicles

# 2. Verificar endpoints administrativos
curl -u "admin:admin_password" http://localhost:3001/api/admin/stats

# 3. Verificar estructura de respuesta
curl http://localhost:3001/api/vehicles | jq '.items | length'
```

### Checklist de Funcionalidades
- [ ] **Listado de vehículos**: Página principal y categorías
- [ ] **Detalle de vehículo**: Página individual con información completa
- [ ] **Búsqueda básica**: Búsqueda por texto
- [ ] **Búsqueda avanzada**: Filtros por tipo, marca, precio, etc. (Requiere Fase 2)
- [ ] **Favoritos**: Gestión de vehículos favoritos
- [ ] **Perfiles profesionales**: Páginas de vendedores (Requiere Fase 3)
- [ ] **Panel admin**: Gestión completa del sistema

## 📝 Notas Importantes

### Compatibilidad hacia Atrás
- La rama `main` se mantiene intacta con la API externa
- La rama `api-integration` es independiente y puede desarrollarse en paralelo
- Se puede cambiar fácilmente entre APIs modificando las variables de entorno

### Estructura de Datos
- Los campos de vehículos se mantienen iguales (kebab-case como en WordPress)
- Las respuestas mantienen el formato `{items, total, pages, facets}`
- Los IDs y slugs se preservan para mantener enlaces existentes

### Desarrollo Incremental
1. **Empezar con funcionalidad básica** (solo listados y detalles)
2. **Agregar filtros** cuando se implementen los endpoints
3. **Completar con profesionales** al final

## 🚀 Comandos de Desarrollo

### Iniciar Desarrollo Local
```bash
# Terminal 1: API interna
cd motoraldia-api
npm run dev

# Terminal 2: Frontend (rama api-integration)  
cd motoraldia-react
git checkout api-integration
npm run dev

# Terminal 3: Admin panel
cd motoraldia-admin
npm run dev
```

### Alternar entre APIs
```bash
# Usar API interna
git checkout api-integration
cp .env.example .env
# Editar .env con configuración interna

# Volver a API externa
git checkout main
# Usar .env.development existente
```

Esta configuración permite un desarrollo seguro e incremental, manteniendo la funcionalidad existente mientras se migra gradualmente a la nueva arquitectura.