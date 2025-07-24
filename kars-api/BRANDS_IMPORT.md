# Importación de Marcas - Guía de Producción

Este documento explica cómo realizar la importación de marcas en diferentes entornos.

## Métodos de Importación Disponibles

### 1. API Endpoint (Recomendado para Producción)
```bash
# Desde la interfaz web (botón "Importar desde JSON")
# O mediante curl:
curl -X POST http://localhost:3001/api/brands/import-from-json \
  -H "Authorization: Basic <base64_encoded_credentials>"
```

### 2. Script NPM (Desarrollo)
```bash
# En desarrollo (usa archivo JSON)
npm run import:brands:dev

# En producción (usa datos embebidos)
npm run import:brands
```

### 3. Docker Container
```bash
# Ejecutar importación dentro del container
docker exec -it <container_name> npm run import:brands

# O durante el despliegue inicial
docker run --rm -e DATABASE_URL="your_db_url" your-image npm run import:brands
```

## Datos Incluidos

- **137 marcas de coches** (incluyendo autocaravanas y comerciales)
- **140 marcas de motos**
- **8 marcas duplicadas** que se manejan automáticamente

## Estructura de Archivos

```
kars-api/
├── data/
│   └── brands.json                          # Archivo JSON original (desarrollo)
├── src/
│   ├── data/
│   │   └── brands-data.ts                   # Datos embebidos (producción)
│   ├── routes/
│   │   └── brands.ts                        # API endpoint para importación
│   └── scripts/
│       ├── importBrands.ts                  # Script de desarrollo
│       └── importBrandsProduction.ts        # Script de producción
```

## Funcionamiento en Docker

1. **Build Time**: Los datos se incluyen en la imagen Docker
2. **Runtime**: Los datos están disponibles como módulo TypeScript
3. **No Dependencies**: No requiere archivos externos ni filesystem access

## Consideraciones de Producción

- ✅ **Compatible con Docker**: Los datos están embebidos en el código
- ✅ **No Filesystem Dependencies**: No necesita acceso a archivos externos
- ✅ **Transaccional**: La importación es atómica por marca
- ✅ **Idempotente**: Se puede ejecutar múltiples veces sin problemas
- ✅ **Logging Completo**: Registro detallado de todas las operaciones

## Troubleshooting

### Error: "Cannot find module '../data/brands-data'"
```bash
# Verificar que el archivo existe
ls -la src/data/brands-data.ts

# Recompilar TypeScript
npm run build
```

### Error: Database Connection
```bash
# Verificar conexión a la base de datos
npm run test:connection

# Verificar variable de entorno
echo $DATABASE_URL
```

### Marcas sin nombre o slug
Este problema se solucionó usando datos embebidos en lugar de archivos JSON.

## Monitoreo

La importación proporciona un resumen completo:
```
📊 IMPORT SUMMARY
==================
🚗 Car brands imported: X
🏍️ Motorcycle brands imported: Y
🔄 Duplicate brands updated: Z
✅ Total brands processed: Total
```

## Actualizaciones Futuras

Para actualizar las marcas:
1. Modificar `src/data/brands-data.ts`
2. Recompilar y redesplegar
3. Ejecutar importación desde la interfaz web