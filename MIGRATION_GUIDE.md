# Guía de Migración a Arquitectura de Microservicios

Esta guía te ayudará a migrar el proyecto actual a una arquitectura de microservicios con repositorios separados.

## 📁 Nueva Estructura de Repositorios

### 1. **motoraldia-api** (Nuevo repositorio)
- **Descripción**: API backend con Express, Prisma y MongoDB
- **Puerto**: 3001
- **Responsabilidades**: 
  - Sincronización con API externa
  - Gestión de base de datos
  - Endpoints para frontend y admin

### 2. **motoraldia-admin** (Nuevo repositorio)
- **Descripción**: Panel de administración con React
- **Puerto**: 3002
- **Responsabilidades**:
  - Gestión de contenido
  - Configuración del sistema
  - Backups de base de datos
  - Monitoreo de sincronizaciones

### 3. **motoraldia-react** (Repositorio actual)
- **Rama actual**: `main` (conecta a API externa)
- **Nueva rama**: `api-integration` (conecta a nueva API)
- **Puerto**: 5173
- **Responsabilidades**: Frontend público para usuarios

## 🚀 Pasos de Migración

### Paso 1: Crear repositorio motoraldia-api
```bash
# 1. Crear nuevo repositorio en GitHub/GitLab
# 2. Clonar localmente
git clone <motoraldia-api-repo-url>
cd motoraldia-api

# 3. Copiar archivos del proyecto actual
cp -r /path/to/current/motoraldia-react/motoraldia-api/* .

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# 5. Instalar dependencias y configurar
npm install
npx prisma generate
npx prisma db push

# 6. Primer commit
git add .
git commit -m "Initial API setup with sync functionality"
git push origin main
```

### Paso 2: Crear repositorio motoraldia-admin
```bash
# 1. Crear nuevo repositorio en GitHub/GitLab
# 2. Clonar localmente
git clone <motoraldia-admin-repo-url>
cd motoraldia-admin

# 3. Copiar archivos del proyecto actual
cp -r /path/to/current/motoraldia-react/motoraldia-admin/* .

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con la URL de la API

# 5. Instalar dependencias
npm install

# 6. Primer commit
git add .
git commit -m "Initial admin panel setup with backup functionality"
git push origin main
```

### Paso 3: Crear nueva rama en motoraldia-react
```bash
cd motoraldia-react

# 1. Crear nueva rama para integración con API
git checkout -b api-integration

# 2. Modificar configuraciones para usar nueva API
# Actualizar variables de entorno
# Cambiar endpoints de API externa a API interna

# 3. Commit cambios
git add .
git commit -m "Add API integration branch"
git push origin api-integration
```

## ⚙️ Configuración de Variables de Entorno

### motoraldia-api (.env)
```env
# Base de datos
DATABASE_URL="mongodb://localhost:27017/motoraldia"

# API Externa (WordPress)
ORIGINAL_API_URL="https://motoraldia.net/wp-json/api-motor/v1"
ORIGINAL_API_USER="tu_usuario"
ORIGINAL_API_PASS="tu_password"

# Admin Panel
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="tu_password_admin"

# Puerto
PORT=3001
```

### motoraldia-admin (.env)
```env
# API Backend
VITE_API_URL="http://localhost:3001"

# Puerto (para desarrollo)
PORT=3002
```

### motoraldia-react (.env - rama api-integration)
```env
# Nueva API (en lugar de API externa)
VITE_API_BASE_URL="http://localhost:3001"
VITE_API_ADMIN_USER="admin"
VITE_API_ADMIN_PASS="tu_password_admin"

# Puerto
PORT=5173
```

## 📦 Scripts de package.json recomendados

### motoraldia-api
```json
{
  "scripts": {
    "dev": "nodemon src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:studio": "prisma studio"
  }
}
```

### motoraldia-admin
```json
{
  "scripts": {
    "dev": "vite --port 3002",
    "build": "vite build",
    "preview": "vite preview --port 3002"
  }
}
```

### motoraldia-react (rama api-integration)
```json
{
  "scripts": {
    "dev": "vite --port 5173",
    "build": "vite build",
    "preview": "vite preview --port 5173"
  }
}
```

## 🐳 Docker Compose (Opcional)

Para ejecutar todos los servicios juntos:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

  api:
    build: ./motoraldia-api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=mongodb://mongodb:27017/motoraldia
    depends_on:
      - mongodb

  admin:
    build: ./motoraldia-admin
    ports:
      - "3002:3002"
    environment:
      - VITE_API_URL=http://localhost:3001

  frontend:
    build: ./motoraldia-react
    ports:
      - "5173:5173"
    environment:
      - VITE_API_BASE_URL=http://localhost:3001

volumes:
  mongodb_data:
```

## 🔄 Flujo de Desarrollo

### Desarrollo Local
```bash
# Terminal 1: API
cd motoraldia-api
npm run dev

# Terminal 2: Admin
cd motoraldia-admin
npm run dev

# Terminal 3: Frontend (rama api-integration)
cd motoraldia-react
git checkout api-integration
npm run dev

# Terminal 4: Base de datos (si no usas Docker)
mongod
```

### Orden de Despliegue
1. **Primero**: motoraldia-api (base de datos y backend)
2. **Segundo**: motoraldia-admin (panel de administración)
3. **Tercero**: motoraldia-react (frontend público)

## 📋 Checklist de Migración

- [ ] Crear repositorio motoraldia-api
- [ ] Crear repositorio motoraldia-admin
- [ ] Crear rama api-integration en motoraldia-react
- [ ] Configurar variables de entorno en todos los proyectos
- [ ] Probar sincronización de vehículos
- [ ] Probar sincronización de blog
- [ ] Probar panel de administración
- [ ] Probar sistema de backup/restore
- [ ] Configurar CI/CD para cada repositorio
- [ ] Documentar APIs y endpoints
- [ ] Realizar pruebas de integración

## 🚨 Consideraciones Importantes

1. **Base de Datos**: Asegúrate de que MongoDB esté corriendo antes de iniciar la API
2. **Sincronización**: La primera sincronización puede tardar varios minutos
3. **Backups**: Programa backups regulares antes de realizar cambios importantes
4. **Ramas**: Mantén la rama `main` del frontend funcionando con la API externa como fallback
5. **Monitoreo**: Usa el panel admin para monitorear el estado de las sincronizaciones

## 🆘 Solución de Problemas

### API no conecta a MongoDB
```bash
# Verificar que MongoDB esté corriendo
mongosh
# Si no funciona, instalar MongoDB Community Edition
```

### Variables de entorno no se cargan
```bash
# Verificar que el archivo .env existe y tiene el formato correcto
cat .env
# Reiniciar el servidor después de cambios en .env
```

### Problemas de CORS
```javascript
// En motoraldia-api/src/index.ts, verificar configuración CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3002'],
  credentials: true
}))
```

Esta arquitectura te permitirá escalar cada componente independientemente y facilitar el mantenimiento del código.