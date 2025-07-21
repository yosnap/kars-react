# Motoraldia API

API backend para el sistema de gestión de vehículos de Motoraldia. Proporciona sincronización automática con la API de WordPress, gestión de usuarios y administración de contenido.

## 🚀 Características

- **Sincronización automática** de vehículos desde API externa
- **Gestión de blog** con sincronización de posts de WordPress
- **Sistema de usuarios** con roles y permisos
- **API REST** completa para frontend y admin
- **Base de datos MongoDB** con Prisma ORM
- **Autenticación básica** para endpoints administrativos
- **Logs detallados** de sincronización
- **Configuración flexible** por interfaz web

## 📋 Requisitos

- Node.js 18+
- MongoDB 7+
- npm o yarn

## ⚙️ Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd motoraldia-api
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. **Configurar base de datos**
```bash
npx prisma generate
npx prisma db push
```

5. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La API estará disponible en `http://localhost:3001`

## 🔧 Configuración

### Variables de Entorno

```env
# Base de datos
DATABASE_URL="mongodb://localhost:27017/motoraldia"

# API Externa (WordPress)
ORIGINAL_API_URL="https://motoraldia.net/wp-json/api-motor/v1"
ORIGINAL_API_USER="tu_usuario_wordpress"
ORIGINAL_API_PASS="tu_password_wordpress"

# Admin Panel
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="tu_password_admin_panel"

# Puerto del servidor
PORT=3001

# Entorno
NODE_ENV="development"
```

### Configuración Automática

La API se configura automáticamente con valores por defecto:
- Sincronización automática cada 30 minutos
- Sincronización de blog cada 8 horas
- Máximo 1000 vehículos por sincronización
- Máximo 100 posts por sincronización

Estas configuraciones se pueden cambiar desde el panel de administración.

## 📡 Endpoints Principales

### Públicos (Sin autenticación)

```
GET  /api/vehicles              # Listar vehículos
GET  /api/vehicles/:id          # Obtener vehículo por ID
GET  /api/brands/cars           # Marcas de coches
GET  /api/brands/motorcycles    # Marcas de motos
GET  /api/sync/status          # Estado de sincronización
```

### Administración (Requiere autenticación)

```
POST /api/admin/login          # Login de administrador
GET  /api/admin/stats          # Estadísticas generales
GET  /api/admin/vehicles       # Gestión de vehículos
GET  /api/admin/users          # Gestión de usuarios
GET  /api/admin/blog-posts     # Gestión de posts
GET  /api/admin/config         # Configuración del sistema
PUT  /api/admin/config         # Actualizar configuración
POST /api/admin/backup         # Crear backup de BD
POST /api/admin/restore        # Restaurar backup de BD
```

### Sincronización (Requiere autenticación)

```
POST /api/sync/manual          # Sincronización manual completa
POST /api/sync/incremental     # Sincronización incremental
POST /api/sync/blog-posts      # Sincronizar posts del blog
POST /api/sync/brands          # Sincronizar marcas y modelos
GET  /api/sync/logs/:id        # Detalle de sincronización
```

## 🔄 Sincronización

### Automática
- **Vehículos**: Cada 30 minutos (configurable)
- **Blog**: Cada 8 horas (configurable)
- **Marcas**: Se ejecuta con la sincronización de vehículos

### Manual
Se puede ejecutar desde el panel de administración o mediante endpoints:
```bash
# Sincronización completa de vehículos
curl -X POST http://localhost:3001/api/sync/manual \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"

# Sincronización de blog con tamaño de lote personalizado
curl -X POST http://localhost:3001/api/sync/blog-posts \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)" \
  -H "Content-Type: application/json" \
  -d '{"batchSize": 50}'
```

## 📊 Monitoreo

### Logs de Sincronización
Todos los procesos de sincronización se registran con:
- Timestamp de inicio y finalización
- Número de registros procesados/creados/actualizados
- Errores y advertencias
- Duración del proceso

### Estadísticas
La API proporciona estadísticas en tiempo real:
- Total de vehículos activos/inactivos
- Posts del blog publicados/borradores
- Últimas sincronizaciones
- Distribución por tipos y marcas

## 🗄️ Base de Datos

### Esquema Principal

```
vehicles          # Datos de vehículos sincronizados
users             # Usuarios del sistema
blogPosts         # Posts del blog sincronizados
syncLogs          # Logs de sincronización de vehículos
blogSyncLogs      # Logs de sincronización de blog
config            # Configuración del sistema
```

### Backup y Restauración

```bash
# Crear backup (mediante API)
curl -X POST http://localhost:3001/api/admin/backup \
  -H "Authorization: Basic $(echo -n 'admin:password' | base64)"

# El backup se descarga como archivo JSON con toda la información
```

## 🧪 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot reload
npm run build        # Compilar TypeScript
npm run start        # Producción
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar cambios al esquema
npm run db:studio    # Abrir Prisma Studio
npm run lint         # Ejecutar ESLint
```

## 🚀 Despliegue

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm run build
npm start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔒 Seguridad

- **Autenticación básica** para endpoints administrativos
- **Validación de datos** en todos los endpoints
- **Rate limiting** en endpoints públicos
- **Sanitización** de datos de entrada
- **Logs de seguridad** para accesos administrativos

## 🐛 Solución de Problemas

### MongoDB no conecta
```bash
# Verificar que MongoDB esté corriendo
mongosh mongodb://localhost:27017/motoraldia

# Si no existe la base de datos, Prisma la creará automáticamente
npx prisma db push
```

### Errores de sincronización
```bash
# Verificar logs en consola del servidor
# Los errores se almacenan en syncLogs y blogSyncLogs

# Verificar conectividad con API externa
curl -u "usuario:password" https://motoraldia.net/wp-json/api-motor/v1/vehicles
```

### Variables de entorno
```bash
# Verificar que .env existe y está correctamente formateado
cat .env

# Reiniciar servidor después de cambios en .env
```

## 📚 Documentación Adicional

- [Guía de Migración](MIGRATION_GUIDE.md)
- [API Externa - Documentación](https://github.com/yosnap/custom-api-vehicles/blob/main/API-DOCUMENTATION.md)
- [Prisma Documentation](https://www.prisma.io/docs/)

## 🤝 Contribuir

1. Fork el repositorio
2. Crear rama para la feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit los cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.