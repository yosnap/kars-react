# Guía de Despliegue: Nuevos Campos de Sincronización

## Resumen
Este documento describe los pasos necesarios para desplegar los nuevos campos de sincronización (`motorIdSync` y `buscoIdSync`) en el entorno de producción.

## Cambios Realizados

### Base de Datos (Prisma Schema)
Se agregaron dos nuevos campos al modelo `Vehicle`:

```prisma
motorIdSync       String? @map("motor_id_sync") // NEW: Simple field for Motor sync ID
buscoIdSync       String? @map("busco_id_sync") // NEW: Simple field for Busco sync ID
```

### Backend (API)
- **Archivo**: `kars-api/src/routes/vehicles.ts`
- **Cambios**: Actualización de `transformVehicleForFrontend` para incluir los nuevos campos
- **Endpoint de Sync**: Modificado para guardar IDs en los nuevos campos simples

### Frontend (React)
- **Archivo**: `kars-react/src/pages/Admin/KarsVehicles.tsx`
- **Cambios**: Uso de `motorIdSync` para verificar estado de sincronización en lugar de `motoraldiaVehicleId`

## Pasos de Despliegue en Producción

### 1. Backup de Base de Datos
```bash
# Crear backup antes de cualquier cambio
mongodump --uri="mongodb://usuario:password@host:port/database" --out=backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Migración de Base de Datos
```bash
# En el servidor de producción
cd kars-api

# Aplicar cambios de schema a la base de datos
npx prisma db push

# Regenerar cliente de Prisma
npx prisma generate
```

### 3. Verificación de Migración
```bash
# Verificar que los campos se crearon correctamente
npx prisma studio
# O conectar a MongoDB y verificar la estructura
```

### 4. Despliegue del Backend
```bash
# Construir y desplegar la aplicación backend
npm run build
npm run start
# O según tu proceso de deployment (PM2, Docker, etc.)
```

### 5. Despliegue del Frontend
```bash
# En el directorio del frontend
cd kars-react

# Construir para producción
npm run build

# Desplegar los archivos estáticos
# (Vercel, Netlify, servidor web, etc.)
```

### 6. Verificación Post-Despliegue

#### 6.1 Verificar API Response
```bash
# Verificar que el endpoint devuelve los nuevos campos
curl -X GET "https://api.kars.ad/api/vehicles?page=1&per_page=1" \
  -H "Authorization: Basic [tu_auth_token]"

# Debe incluir en la respuesta:
# "motorIdSync": null,
# "buscoIdSync": null,
```

#### 6.2 Probar Sincronización
1. Ir al panel de administración
2. Seleccionar un vehículo
3. Hacer clic en "Sincronitzar amb Motor"
4. Verificar que:
   - El proceso se completa sin errores
   - El botón cambia de estado
   - Se muestra el ID de Motoraldia
   - Los logs muestran que `motorIdSync` se guardó correctamente

#### 6.3 Verificar UI Frontend
- [ ] Los botones de sincronización muestran el estado correcto
- [ ] Los vehículos ya sincronizados muestran el ID
- [ ] No hay errores de consola relacionados con los campos sync

## Troubleshooting

### Problema: Prisma no puede aplicar la migración
```bash
# Solución: Verificar conexión a base de datos
npx prisma db pull
npx prisma db push --force-reset
```

### Problema: Frontend no muestra los nuevos campos
1. Verificar que el build del backend incluye los cambios
2. Verificar que la respuesta de la API incluye los campos
3. Limpiar caché del frontend

### Problema: Sync falla después del despliegue
1. Verificar logs del backend
2. Verificar que los mappers de Motoraldia están actualizados
3. Probar con un vehículo simple primero

## Validación Final

### Lista de Verificación
- [ ] Base de datos migrada exitosamente
- [ ] Backend desplegado con nuevos campos
- [ ] Frontend desplegado con cambios de UI
- [ ] Sincronización funciona correctamente
- [ ] Botones cambian de estado
- [ ] IDs se muestran en la UI
- [ ] No hay errores en logs de producción

### Comandos de Verificación
```bash
# Verificar estructura de base de datos
npx prisma db pull

# Verificar que el servicio está corriendo
curl -f https://api.kars.ad/health || echo "API no responde"

# Verificar logs del backend
tail -f /var/log/kars-api/production.log
```

## Rollback (Si es Necesario)

### 1. Rollback de Base de Datos
```bash
# Los nuevos campos son opcionales, no es necesario rollback
# Pero si es necesario:
db.Vehicle.updateMany({}, { $unset: { motor_id_sync: "", busco_id_sync: "" } })
```

### 2. Rollback de Código
```bash
# Volver a la versión anterior
git checkout [commit_anterior]
npm run build
npm run start
```

## Contactos
- **Desarrollador**: Paulo
- **Base de Datos**: MongoDB Atlas/Local
- **Entorno**: Producción Kars.ad

## Fechas
- **Cambios Implementados**: 28 Julio 2025
- **Despliegue Planeado**: [Fecha a definir]
- **Última Actualización**: 28 Julio 2025