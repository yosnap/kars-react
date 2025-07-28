# Comandos Rápidos para EasyPanel - Sync Fields

## Comandos de Preparación Local

```bash
# Ejecutar script automatizado de preparación
./deploy-sync-fields.sh
```

## Comandos Directos para EasyPanel

### Backend (kars-api)
```bash
# En EasyPanel Terminal del servicio backend:
cd /app
npm ci
npx prisma db push
npx prisma generate
npm run build
npm start
```

### Frontend (kars-react)
```bash
# En EasyPanel Terminal del servicio frontend:
cd /app
npm ci
npm run build
# EasyPanel servirá automáticamente desde dist/
```

## Verificación Rápida

### 1. API Response
```bash
# Probar endpoint (cambiar URL por tu dominio)
curl "https://kars-api.tu-dominio.app/api/vehicles?page=1&per_page=1"

# Debe incluir:
# "motorIdSync": null,
# "buscoIdSync": null,
```

### 2. Base de Datos
```bash
# En terminal del backend
npx prisma studio
# Verificar que Vehicle model tiene los nuevos campos
```

### 3. Logs en Tiempo Real
```bash
# En EasyPanel - Ver logs del backend
tail -f logs/production.log

# En EasyPanel - Ver logs del frontend
# (Usar consola del navegador)
```

## Solución Rápida de Problemas

### Problema: Prisma no encuentra la base de datos
```bash
# Verificar variable de entorno
echo $DATABASE_URL

# Re-aplicar migración
npx prisma db push --force-reset
```

### Problema: Frontend no carga
```bash
# Re-construir frontend
rm -rf dist/
npm run build

# Verificar que dist/ se creó
ls -la dist/
```

### Problema: API devuelve error 500
```bash
# Verificar dependencias
npm list

# Re-instalar dependencias
rm -rf node_modules/
npm ci
```

## Variables de Entorno Necesarias

### Backend (.env)
```bash
DATABASE_URL="tu_connection_string_mongodb"
```

### Frontend (en EasyPanel)
```bash
VITE_API_BASE_URL="https://kars-api.tu-dominio.app"
VITE_API_ADMIN_USER="admin_user"
VITE_API_ADMIN_PASS="admin_pass"
```

## Test Rápido Post-Despliegue

1. **Backend OK**: `curl https://kars-api.tu-dominio.app/api/vehicles`
2. **Frontend OK**: Abrir `https://kars-frontend.tu-dominio.app`
3. **Sync OK**: Admin → Vehículos → Sincronizar un vehículo
4. **UI OK**: Verificar que botón cambia de estado

## Rollback Rápido (Si es necesario)

```bash
# Volver a commit anterior
git checkout HEAD~1

# Re-desplegar
npm ci && npm run build
```

## Contacto Rápido
- **Issues**: Verificar logs en EasyPanel
- **Database**: Usar Prisma Studio para debug
- **Frontend**: Usar DevTools del navegador