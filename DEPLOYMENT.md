# Guía de Despliegue - Kars.ad

## Requisitos Previos

- Docker o servicio de hosting con soporte para contenedores (EasyPanel, etc.)
- MongoDB 7.0+ con soporte para Replica Set
- Node.js 18+
- Dominio configurado con SSL

## Configuración de MongoDB con Replica Set

### 1. Crear contenedor MongoDB

**Configuración en EasyPanel o Docker:**

```yaml
Imagen: mongo:8
Comando: mongod --replSet rs0 --bind_ip_all
Puerto: 27017
```

### 2. Inicializar Replica Set

Acceder al contenedor y ejecutar:

```bash
mongosh
rs.initiate()
```

Verificar que el replica set esté funcionando:
```javascript
rs.status()
```

Deberías ver `"stateStr": "PRIMARY"` en el resultado.

## Configuración de la API

### 1. Variables de Entorno

Configurar en el servicio de la API:

```env
DATABASE_URL=mongodb://motoraldia_karsdb:27017/karsad?replicaSet=rs0
NODE_ENV=production
PORT=3001

# API Original Motoraldia
ORIGINAL_API_URL=https://motoraldia.net/wp-json/api-motor/v1
ORIGINAL_API_USER=Paulo
ORIGINAL_API_PASS=U^q^i2l49rZrX72#Ln!Xe5k0

# Admin Panel
ADMIN_USERNAME=admin
ADMIN_PASSWORD=Motoraldia.2025!

# CORS Origins
CORS_ORIGINS=https://kars.motoraldia.net

# JWT Secret
JWT_SECRET=motoraldia_jwt_secret_2024_secure_key
```

**Nota importante:** Ajustar `motoraldia_karsdb` al nombre exacto del servicio MongoDB en tu plataforma.

### 2. Desplegar API

1. Usar la rama `working-without-replica-set` que tiene todas las correcciones
2. Build con Dockerfile incluido en el proyecto
3. Exponer puerto 3001

## Importación de Datos Inicial

### 1. Importar datos de producción

Una vez la API esté funcionando, ejecutar vía Postman o curl:

```bash
POST https://tu-dominio:3001/api/admin/import-production-data-native
```

Este endpoint:
- Importa 275 marcas y 150 vehículos
- Mapea automáticamente todos los campos al formato correcto
- Asigna valores por defecto a campos requeridos

### 2. Limpiar datos (si es necesario)

Si hay errores de campos null después de la importación:

```bash
POST https://tu-dominio:3001/api/admin/clean-imported-data
```

### 3. Verificar importación

```bash
GET https://tu-dominio:3001/api/vehicles
```

Debería devolver los vehículos importados.

## Configuración del Frontend

### 1. Variables de Entorno

Crear archivo `.env.production`:

```env
VITE_API_URL=https://tu-dominio:3001
```

### 2. Build y Deploy

```bash
npm run build
```

Servir la carpeta `dist` con cualquier servidor web (nginx, apache, etc.)

## Solución de Problemas Comunes

### Error P2031: Replica Set Required

**Síntoma:** "Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set"

**Solución:** Asegurarse de que MongoDB esté iniciado con `--replSet rs0` y que la DATABASE_URL incluya `?replicaSet=rs0`

### Error P2032: Field Conversion Errors

**Síntoma:** "Error converting field X of expected non-nullable type"

**Solución:** Ejecutar el endpoint `/api/admin/clean-imported-data` para corregir campos null

### MongoDB en estado RsGhost

**Síntoma:** "Type: RsGhost" en logs de conexión

**Solución:** 
```javascript
rs.reconfig({
  _id: "rs0",
  members: [
    { _id: 0, host: "nombre-servicio-mongodb:27017" }
  ]
}, {force: true})
```

### Mixed Content Errors

**Síntoma:** Frontend HTTPS intentando acceder a API HTTP

**Solución:** Asegurar que la API también esté servida por HTTPS o configurar proxy reverso

## Checklist de Verificación

- [ ] MongoDB iniciado con replica set
- [ ] Replica set inicializado (`rs.initiate()`)
- [ ] DATABASE_URL incluye `?replicaSet=rs0`
- [ ] API responde en `/health`
- [ ] Datos importados correctamente
- [ ] Frontend puede acceder a la API
- [ ] No hay errores de Mixed Content
- [ ] Listado de vehículos funciona

## Notas Importantes

1. **Siempre usar MongoDB con Replica Set** - Prisma lo requiere para cualquier operación
2. **El archivo `production-import.json`** debe estar en la raíz del proyecto API
3. **Los campos se mapean automáticamente** de camelCase a kebab-case durante la importación
4. **Backup regular** de MongoDB es esencial para producción

## Endpoints Administrativos Disponibles

- `POST /api/admin/import-production-data-native` - Importar datos completos
- `POST /api/admin/clean-imported-data` - Limpiar campos null/corruptos
- `GET /api/admin/export-all-data` - Exportar todos los datos
- `POST /api/admin/emergency-db-fix` - Reparación de emergencia de la BD

Todos requieren autenticación básica con las credenciales configuradas en ADMIN_USERNAME y ADMIN_PASSWORD.