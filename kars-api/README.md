# Motoraldia API

API intermedia para Motoraldia con sincronización automática de datos desde la API original.

## Características

- 🚀 **API REST optimizada** con MongoDB + Prisma
- 🔄 **Sincronización automática** configurable con cron jobs
- 📊 **Panel de administración** para gestión y monitoreo
- 🎯 **Facets pre-calculados** para filtros rápidos
- 🔒 **Autenticación** para operaciones administrativas
- 📦 **Webhooks** para sincronización en tiempo real

## Arquitectura

```
API Original (motoraldia.net) → Sync Service → MongoDB → Nueva API → Frontend
```

## Instalación

### Requisitos
- Node.js 18+
- MongoDB
- npm/yarn

### Setup

1. **Clonar e instalar dependencias**
```bash
cd motoraldia-api
npm install
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus credenciales
```

3. **Configurar base de datos**
```bash
npm run db:generate
npm run db:push
```

4. **Iniciar en desarrollo**
```bash
npm run dev
```

## Variables de Entorno

```env
# Database
DATABASE_URL="mongodb://localhost:27017/motoraldia"

# API Original Motoraldia
ORIGINAL_API_URL="https://motoraldia.net"
ORIGINAL_API_USER="admin_user"
ORIGINAL_API_PASS="admin_password"

# Server Configuration
PORT=3001
NODE_ENV=development

# Sync Configuration
SYNC_INTERVAL_MINUTES=30
ENABLE_AUTO_SYNC=true

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_here

# CORS Origins (comma separated)
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
```

## Endpoints API

### Vehículos Públicos

#### `GET /api/vehicles`
Listado de vehículos con filtros y paginación.

**Parámetros de consulta:**
- `page` - Página (default: 1)
- `per_page` - Elementos por página (max: 100, default: 12)
- `orderby` - Ordenar por: featured, price, date, title
- `order` - Dirección: ASC, DESC
- `anunci-actiu` - Filtrar activos (true/false)
- `tipus-vehicle` - Tipo de vehículo
- `marca-cotxe` - Marca de coche
- `marca-moto` - Marca de moto
- `search` - Búsqueda de texto

**Respuesta:**
```json
{
  "items": [...],
  "total": 150,
  "pages": 13,
  "current_page": 1,
  "per_page": 12,
  "facets": {
    "tipus-vehicle": {"cotxe": 100, "moto": 50},
    "marca-cotxe": {"audi": 20, "bmw": 15}
  }
}
```

#### `GET /api/vehicles/:slug`
Detalle de un vehículo específico.

### Administración

> **Autenticación requerida:** Basic Auth con ADMIN_USERNAME/ADMIN_PASSWORD

#### `GET /api/admin/stats`
Estadísticas generales del sistema.

#### `GET /api/admin/vehicles`
Listado de vehículos para admin (incluye inactivos).

#### `GET /api/admin/config`
Configuración actual del sistema.

#### `PUT /api/admin/config`
Actualizar configuración.

#### `DELETE /api/admin/vehicles/:id`
Eliminar vehículo.

#### `PUT /api/admin/vehicles/:id/toggle-active`
Activar/desactivar vehículo.

### Sincronización

> **Autenticación requerida:** Basic Auth para operaciones manuales

#### `GET /api/sync/status`
Estado actual de sincronización.

#### `POST /api/sync/manual`
Iniciar sincronización manual completa.

#### `POST /api/sync/incremental`
Iniciar sincronización incremental.

#### `POST /api/sync/webhook`
Endpoint para webhooks de la API original.

## Sincronización

### Tipos de Sincronización

1. **Completa (Full)**: Sincroniza todos los vehículos
2. **Incremental**: Solo cambios recientes
3. **Manual**: Disparada por administrador
4. **Webhook**: En tiempo real para vehículos específicos

### Configuración

La sincronización se configura vía `/api/admin/config`:

- `sync_interval_minutes`: Intervalo en minutos (default: 30)
- `enable_auto_sync`: Activar sync automático (true/false)
- `max_vehicles_per_sync`: Límite por sincronización (default: 1000)

### Monitoreo

- Logs detallados en `/api/admin/sync-logs`
- Estado en tiempo real en `/api/sync/status`
- Métricas en `/api/admin/stats`

## Estructura del Proyecto

```
src/
├── index.ts              # Servidor principal
├── routes/
│   ├── vehicles.ts       # API pública de vehículos
│   ├── admin.ts          # Panel de administración
│   └── sync.ts           # Endpoints de sincronización
├── services/
│   └── syncService.ts    # Lógica de sincronización
└── prisma/
    └── schema.prisma     # Esquema de base de datos
```

## Modelos de Datos

### Vehicle
```prisma
model Vehicle {
  id                String   @id @default(auto()) @map("_id") @db.ObjectId
  slug              String   @unique
  titolAnunci       String   @map("titol-anunci")
  // ... otros campos
  anunciActiu       Boolean  @map("anunci-actiu")
  lastSyncAt        DateTime @default(now())
}
```

### SyncLog
```prisma
model SyncLog {
  id              String    @id @default(auto()) @map("_id") @db.ObjectId
  type            String    // "full", "incremental", "manual"
  status          String    // "pending", "running", "completed", "failed"
  vehiclesProcessed Int     @default(0)
  // ... métricas de sincronización
}
```

## Scripts

```bash
npm run dev          # Desarrollo con nodemon
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar schema a DB
npm run sync         # Ejecutar sync manual
```

## Migración desde API Original

### Fase 1: Setup Paralelo
1. Instalar y configurar nueva API
2. Ejecutar sincronización inicial: `POST /api/sync/manual`
3. Verificar datos en `/api/admin/stats`

### Fase 2: Testing
1. Configurar frontend para usar nueva API
2. Comparar respuestas con API original
3. Ajustar mapeo de datos si es necesario

### Fase 3: Migración Gradual
1. Migrar endpoint `/vehicles` primero
2. Configurar webhooks en API original
3. Monitorear logs y rendimiento

### Fase 4: Deprecación
1. Desactivar API original en frontend
2. Configurar redirects si es necesario

## Troubleshooting

### Sync no funciona
1. Verificar credenciales en `.env`
2. Revisar logs: `GET /api/admin/sync-logs`
3. Comprobar conectividad a API original

### Performance lento
1. Verificar índices MongoDB
2. Ajustar `max_vehicles_per_sync`
3. Optimizar filtros de consulta

### Datos inconsistentes
1. Ejecutar sync manual completo
2. Comparar facets con API original
3. Revistar transformación de datos

## Desarrollo

### Añadir nuevo filtro
1. Actualizar schema Prisma si es necesario
2. Modificar query en `routes/vehicles.ts`
3. Actualizar función `calculateFacets`
4. Añadir índice en MongoDB

### Webhooks
Para activar webhooks en la API original, configurar:
```
URL: https://tu-api.com/api/sync/webhook
Events: vehicle.created, vehicle.updated, vehicle.deleted
```

## Monitoreo Producción

- **Health check**: `GET /health`
- **Logs**: Integrar con sistemas como Datadog/Sentry
- **Métricas**: Usar `/api/admin/stats` para dashboards
- **Alertas**: Configurar para fallos de sync

## Seguridad

- Basic Auth para rutas admin
- Validación de datos de entrada
- Rate limiting recomendado
- HTTPS obligatorio en producción
- Validación de webhooks con firmas

## Performance

- **Facets cached**: Calculados en sync, no en tiempo real
- **Índices MongoDB**: Optimizados para filtros comunes
- **Paginación**: Límite máximo para evitar sobrecarga
- **Paralelización**: Queries concurrentes donde sea posible

## Licencia

MIT - AreaF Design