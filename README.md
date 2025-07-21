# Kars Monorepo

Monorepo completo para la plataforma Kars.ad - Sistema de gestión de vehículos con sincronización hacia Motoraldia.

## Estructura del Proyecto

```
kars-monorepo/
├── kars-react/           # Frontend React (Kars.ad)
├── kars-api/            # Backend API Node.js  
└── package.json         # Configuración del monorepo
```

## Comandos Principales

### Desarrollo
```bash
# Ejecutar React + API simultáneamente
npm run dev

# Ejecutar solo React frontend (puerto 5173)
npm run dev:react

# Ejecutar solo API backend (puerto 3001)
npm run dev:api
```

### Build & Deploy
```bash
# Build completo (React + API)
npm run build

# Build individual
npm run build:react
npm run build:api

# Lint código
npm run lint
```

### Instalación
```bash
# Primera instalación - instalar dependencias en todos los proyectos
npm run install:all

# Instalación normal
npm install
```

## Configuración Inicial

1. **Clonar el repositorio**
2. **Instalar dependencias**: `npm run install:all`
3. **Configurar variables de entorno** en cada proyecto
4. **Ejecutar desarrollo**: `npm run dev`

## Proyectos

### kars-react (Frontend)
- **Puerto**: 5173
- **Tecnologías**: React 19, TypeScript, Vite, Tailwind CSS, Radix UI
- **Descripción**: Frontend principal de Kars.ad con panel administrativo integrado

**Características principales:**
- Gestión completa de vehículos Kars.ad
- Panel administrativo integrado
- Sincronización hacia Motoraldia (solo catalán)
- Sistema de backup/restore
- Gestión de blog

### kars-api (Backend)
- **Puerto**: 3001  
- **Tecnologías**: Node.js, Express, Prisma, PostgreSQL
- **Descripción**: API backend para gestión de vehículos y sincronización

**Endpoints principales:**
- `/vehicles` - Gestión de vehículos
- `/admin/sync` - Sincronización hacia Motoraldia
- `/admin/backup` - Backup/restore de BD
- `/admin/blog` - Gestión de blog

## URLs de Desarrollo

- **Frontend Kars.ad**: http://localhost:5173
- **API Backend**: http://localhost:3001
- **Admin Dashboard**: http://localhost:5173/admin

## Panel Administrativo

El panel admin integrado incluye:

### 🚗 Gestión de Vehículos
- Ver todos los vehículos de Kars.ad
- Gestión de estados de sincronización
- Sincronización individual y masiva

### 🔄 Sincronización
- **Configuración de API Motoraldia** - URL destino
- **Solo idioma catalán** - Filtro automático
- Sincronización completa e incremental  
- Monitoreo en tiempo real
- Historial de sincronizaciones

### 📝 Gestión de Blog
- CRUD completo de posts
- Sincronización con API externa
- Gestión de categorías y tags
- Estados: borrador/publicado

### 💾 Backup Base de Datos
- Creación automática de backups
- Descarga de archivos JSON
- Restauración completa
- Validación de integridad

## Configuración de Sincronización

La sincronización hacia Motoraldia requiere:

1. **URL de API destino** - Configurar en Admin > Sincronización
2. **Idioma catalán únicamente** - Filtro automático
3. **Credenciales de autenticación** - Variables de entorno

## Variables de Entorno

### kars-react
```bash
VITE_API_BASE_URL=http://localhost:3001
VITE_API_ADMIN_USER=admin_user
VITE_API_ADMIN_PASS=admin_password
```

### kars-api
```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/kars_db
MOTORALDIA_API_URL=https://api.motoraldia.com
MOTORALDIA_API_USER=sync_user
MOTORALDIA_API_PASS=sync_password
```

## Migración Completada

✅ **Migración exitosa desde motoraldia-admin**:
- Todos los componentes críticos migrados
- Funcionalidad específica para Kars.ad
- Panel administrativo unificado
- motoraldia-admin eliminado

## Desarrollo

Para contribuir al proyecto:

1. Usar workspace commands para trabajar en proyectos específicos
2. Mantener sincronización entre frontend y backend
3. Seguir convenciones de TypeScript estrictas
4. Usar componentes Radix UI para UI consistente

## Support

Para soporte técnico o preguntas sobre la implementación, contacta al equipo de desarrollo.