# Motoraldia Admin Panel

Panel de administración para el sistema de gestión de vehículos de Motoraldia. Interfaz web para administrar contenido, usuarios, configuraciones y realizar backups de la base de datos.

## 🚀 Características

- **Dashboard** con estadísticas en tiempo real
- **Gestión de vehículos** con filtros avanzados
- **Gestión de usuarios** y profesionales
- **Editor de blog** con soporte Markdown
- **Sincronización manual** de contenido
- **Sistema de backup/restore** de base de datos
- **Configuración del sistema** con interfaz intuitiva
- **Monitoreo de logs** de sincronización
- **Autenticación segura** con Basic Auth

## 📋 Requisitos

- Node.js 18+
- API de Motoraldia corriendo
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd motoraldia-admin
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con la URL de tu API
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

El panel estará disponible en `http://localhost:3002`

## 🔧 Configuración

### Variables de Entorno

```env
# URL de la API backend
VITE_API_URL="http://localhost:3001"

# Puerto para desarrollo (opcional)
PORT=3002
```

### Credenciales de Acceso

El panel usa autenticación básica. Las credenciales se configuran en la API:
- **Usuario**: Configurado en `ADMIN_USERNAME` de la API
- **Contraseña**: Configurado en `ADMIN_PASSWORD` de la API

## 🎯 Funcionalidades Principales

### 📊 Dashboard
- **Estadísticas generales**: Vehículos, usuarios, posts
- **Gráficos**: Distribución por tipos, marcas, estados
- **Estado de sincronización**: Última ejecución, próxima programada
- **Alertas**: Errores recientes, acciones requeridas

### 🚗 Gestión de Vehículos
- **Listado paginado** con filtros por tipo, marca, estado
- **Búsqueda avanzada** por múltiples criterios
- **Activar/desactivar** vehículos individualmente
- **Eliminar** vehículos del sistema
- **Vista detalle** con toda la información

### 👥 Gestión de Usuarios
- **Listado de usuarios** con roles y estados
- **Activar/desactivar** cuentas de usuario
- **Filtros** por rol (profesional, admin, usuario)
- **Estadísticas** de vehículos por usuario
- **Migración** desde API externa

### 📚 Gestión de Blog
- **Editor de posts** con soporte Markdown
- **Categorías y tags** con selección intuitiva
- **Campos SEO** completos (título, descripción, keywords)
- **Imágenes destacadas** con vista previa
- **Estados** de publicación (borrador, publicado)
- **Sincronización** manual desde WordPress

### 🔄 Sincronización
- **Manual completa**: Todos los vehículos y contenido
- **Incremental**: Solo cambios recientes
- **Por módulos**: Vehículos, blog, marcas, usuarios
- **Configuración de lotes**: Tamaño personalizable
- **Logs detallados**: Historial completo con métricas

### ⚙️ Configuración del Sistema
- **Intervalos de sincronización**: Vehículos y blog
- **Límites de procesamiento**: Registros por lote
- **Activar/desactivar** sincronización automática
- **Configuración en tiempo real**: Cambios se aplican inmediatamente

### 🗄️ Backup y Restauración
- **Backup completo** de toda la base de datos
- **Descarga automática** del archivo JSON
- **Restauración** desde archivo de backup
- **Información detallada**: Tablas, registros, tamaño
- **Validación** de integridad de datos

## 🎨 Interfaz de Usuario

### Tecnologías
- **React 19** con TypeScript
- **Tailwind CSS** para estilos
- **Radix UI** para componentes
- **Lucide React** para iconos
- **Vite** para desarrollo y build

### Componentes Principales
```
src/
├── components/
│   ├── Dashboard.tsx           # Panel principal
│   ├── VehicleManager.tsx      # Gestión de vehículos
│   ├── UserManager.tsx         # Gestión de usuarios
│   ├── BlogManager.tsx         # Gestión de blog
│   ├── BlogPostModal.tsx       # Editor de posts
│   ├── SyncManager.tsx         # Sincronización
│   ├── ConfigManager.tsx       # Configuración
│   └── DatabaseBackup.tsx     # Backup/Restore
├── utils/
│   └── api.ts                  # Cliente API
└── pages/
    └── AdminDashboard.tsx      # Página principal
```

### Características UX
- **Responsive design** para móviles y desktop
- **Tema claro** con colores corporativos
- **Loading states** en todas las operaciones
- **Notificaciones** de éxito/error
- **Confirmaciones** para acciones destructivas
- **Filtros en tiempo real** sin recarga de página

## 📱 Páginas y Secciones

### 🏠 Dashboard (`/`)
- Resumen general del sistema
- Estadísticas rápidas
- Estado de sincronizaciones
- Accesos directos a funciones principales

### 🚗 Vehículos (`/vehicles`)
- Tabla paginada con todos los vehículos
- Filtros por tipo, marca, estado, fecha
- Búsqueda por texto
- Acciones masivas y individuales

### 👥 Usuarios (`/users`)
- Gestión completa de usuarios
- Migración desde API externa
- Estadísticas por usuario
- Control de accesos

### 📚 Blog (`/blog`)
- Listado de posts con filtros
- Editor completo para crear/editar
- Sincronización desde WordPress
- Gestión de categorías y tags

### 🔄 Sincronización (`/sync`)
- Ejecutar sincronizaciones manuales
- Configurar parámetros de lotes
- Ver logs históricos
- Monitorear procesos en curso

### ⚙️ Configuración (`/config`)
- Intervalos de sincronización
- Límites de procesamiento
- Configuración de API externa
- Parámetros del sistema

### 🗄️ Backup (`/backup`)
- Crear backup completo
- Restaurar desde archivo
- Historial de backups
- Recomendaciones de seguridad

## 🧪 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload en puerto 3002
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecutar ESLint
npm run type-check   # Verificar tipos TypeScript
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Variables de Entorno para Producción
```env
VITE_API_URL="https://api.motoraldia.com"
```

### Docker
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 🔒 Seguridad

### Autenticación
- **Basic Auth** con credenciales configuradas en la API
- **Tokens de sesión** para mantener login
- **Logout automático** después de inactividad
- **Validación** en cada request

### Permisos
- **Solo administradores** pueden acceder
- **Confirmaciones** para acciones destructivas
- **Logs de auditoría** de todas las acciones
- **Validación de datos** en frontend y backend

## 📊 Monitoreo y Logs

### Logs Disponibles
- **Sincronización de vehículos**: Detalles completos por ejecución
- **Sincronización de blog**: Logs específicos de posts
- **Acciones de usuario**: Cambios en configuración, eliminaciones
- **Errores del sistema**: Fallos de API, conexión, validación

### Métricas
- **Tiempo de respuesta** de la API
- **Éxito/fallo** de sincronizaciones
- **Uso de recursos** durante procesos
- **Actividad de usuarios** en el panel

## 🐛 Solución de Problemas

### Panel no carga
```bash
# Verificar que la API esté corriendo
curl http://localhost:3001/api/admin/stats

# Verificar variables de entorno
cat .env

# Verificar logs del navegador (F12)
```

### Errores de autenticación
```bash
# Verificar credenciales en la API
# Las credenciales se configuran en motoraldia-api/.env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=tu_password
```

### Problemas de CORS
```bash
# En motoraldia-api, verificar configuración CORS
# Debe incluir http://localhost:3002 en development
```

### Build falla
```bash
# Limpiar node_modules
rm -rf node_modules package-lock.json
npm install

# Verificar tipos TypeScript
npm run type-check
```

## 🔄 Flujo de Trabajo Típico

1. **Login** con credenciales de administrador
2. **Revisar Dashboard** para estado general
3. **Configurar sincronización** según necesidades
4. **Ejecutar sincronización** manual si es necesario
5. **Gestionar contenido** (vehículos, blog, usuarios)
6. **Crear backup** antes de cambios importantes
7. **Monitorear logs** para detectar problemas

## 🚀 Próximas Funcionalidades

- [ ] **Roles de usuario** más granulares
- [ ] **Programación** de backups automáticos
- [ ] **Notificaciones** por email de errores
- [ ] **API de webhooks** para eventos
- [ ] **Dashboard** personalizable
- [ ] **Exportación** de datos a CSV/Excel
- [ ] **Tema oscuro** opcional

## 📚 Documentación Relacionada

- [Guía de Migración](MIGRATION_GUIDE.md)
- [README API](README_API.md)
- [Documentación Técnica](https://docs.motoraldia.com)

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.