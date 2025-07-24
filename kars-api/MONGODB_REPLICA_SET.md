# MongoDB con Replica Set para EasyPanel

Este documento explica cómo configurar MongoDB con replica set usando el Dockerfile personalizado para resolver los problemas de transacciones de Prisma.

## 🚨 Problema

Prisma requiere que MongoDB esté configurado como replica set para poder realizar transacciones y comandos como `$runCommandRaw`. Sin esta configuración, obtienes errores como:

```
Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set
```

## ✅ Solución

### Opción 1: Dockerfile Personalizado (Recomendado)

1. **Usar el Dockerfile.mongodb** que incluye:
   - MongoDB 7.0 
   - Configuración automática de replica set
   - Scripts de inicialización
   - Configuración para single-node replica set

### Opción 2: EasyPanel con MongoDB existente

Si ya tienes MongoDB en EasyPanel, puedes configurar replica set manualmente:

1. **Conectar a tu contenedor MongoDB:**
```bash
docker exec -it <mongodb-container-id> bash
```

2. **Inicializar replica set:**
```bash
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [{
    _id: 0,
    host: 'localhost:27017'
  }]
})"
```

3. **Verificar el estado:**
```bash
mongosh --eval "rs.status()"
```

## 📋 Configuración en EasyPanel

### Para nuevo proyecto:

1. **Crear dos servicios:**
   - **MongoDB Service**: Usar `Dockerfile.mongodb`
   - **API Service**: Usar el `Dockerfile` existente

2. **Variables de entorno para la API:**
```env
DATABASE_URL=mongodb://mongodb-service:27017/kars?replicaSet=rs0
MONGODB_URL=mongodb://mongodb-service:27017/kars?replicaSet=rs0
```

3. **Network Configuration:**
   - Asegurar que ambos servicios estén en la misma red interna
   - El servicio MongoDB no necesita puerto público (solo interno 27017)

### Para proyecto existente:

1. **Opción A - Recrear MongoDB:**
   - Hacer backup de datos
   - Eliminar servicio MongoDB actual
   - Crear nuevo con `Dockerfile.mongodb`
   - Restaurar datos

2. **Opción B - Configurar manualmente:**
   - Conectar al contenedor actual
   - Ejecutar comandos de inicialización de replica set

## 🔧 Testing

Para verificar que funciona correctamente:

```bash
# Conectar a MongoDB
mongosh "mongodb://localhost:27017/kars?replicaSet=rs0"

# Verificar replica set
rs.status()

# Debería mostrar algo como:
# {
#   "set": "rs0",
#   "myState": 1,
#   "members": [...]
# }
```

## 📱 URL de Conexión

La URL de conexión debe incluir `?replicaSet=rs0`:

```
mongodb://host:27017/database?replicaSet=rs0
```

## ⚠️ Notas Importantes

1. **Single Node Replica Set**: Esta configuración es para un solo nodo, perfecta para desarrollo/staging
2. **Producción**: Para producción considera un cluster real con múltiples nodos
3. **Persistencia**: Asegurar que el volumen de datos esté montado correctamente
4. **Network**: Los servicios deben poder comunicarse entre sí

## 🎯 Beneficios

- ✅ Soporte completo para transacciones de Prisma
- ✅ Comandos `$runCommandRaw` funcionan
- ✅ Sin errores P2031
- ✅ Compatible con todas las operaciones de Prisma
- ✅ Fácil deployment en EasyPanel

Una vez configurado, todos los endpoints de admin que usan transacciones funcionarán correctamente, incluyendo el fix de fechas.