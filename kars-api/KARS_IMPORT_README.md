# Kars.ad - Importación de Vehículos desde JSON

Este documento explica cómo importar vehículos para Kars.ad usando datos JSON.

## 🚀 Uso Rápido

### 1. Preparar el archivo JSON

Coloca tu archivo JSON con los vehículos en el directorio raíz del proyecto API:

```bash
# Ejemplo: vehicles_kars.json
```

### 2. Ejecutar la importación

```bash
# Importar sin limpiar la base de datos
node scripts/import-kars-vehicles.js vehicles_kars.json

# Importar limpiando la base de datos primero
node scripts/import-kars-vehicles.js vehicles_kars.json --clear
```

## 📋 Formato del JSON

El archivo JSON debe contener un array de vehículos con la siguiente estructura:

```json
[
  {
    "id": "123",
    "slug": "bmw-serie-3-320d",
    "titol-anunci": "BMW Serie 3 320d",
    "descripcio-anunci": "Descripción del vehículo en catalán",
    "preu": "25000",
    "quilometratge": "50000",
    "any": "2020",
    "tipus-vehicle": "COTXE",
    "marques-cotxe": "BMW",
    "models-cotxe": "Serie 3",
    "versio": "320d",
    "tipus-combustible": "diesel",
    "anunci-actiu": true,
    "venut": false,
    "anunci-destacat": 0,
    "data-creacio": "2024-01-15T10:30:00Z",
    "imatge-destacada-url": "https://example.com/image.jpg",
    "galeria-vehicle-urls": [
      "https://example.com/image1.jpg",
      "https://example.com/image2.jpg"
    ]
  }
]
```

## 🔧 Funcionalidades

### Generación Automática de Títulos
- Los títulos se generan automáticamente: `marca + modelo + versión`
- Ejemplo: "BMW" + "Serie 3" + "320d" = "BMW Serie 3 320d"

### Soporte Multiidioma
- Solo las descripciones necesitan traducción manual
- El sistema guarda la descripción inicial en catalán
- Los otros idiomas (EN, FR, ES) se rellenan desde el formulario

### Campos de Sincronización
- `needsSync`: Se marca como `false` (no necesita sync hacia Motoraldia)
- `userId`: Se asigna automáticamente a "113" (info@kars.ad)
- `motoraldiaVehicleId`: Se guarda el ID original para referencia

## 🔌 API Endpoints

### POST /api/vehicles/import-json
Importa vehículos desde JSON proporcionado en el body.

**Request Body:**
```json
{
  "vehiclesData": [...], // Array de vehículos
  "clearDatabase": false // Opcional: limpiar BD antes de importar
}
```

**Response:**
```json
{
  "success": true,
  "message": "JSON Import completed: 10 imported, 0 skipped",
  "data": {
    "imported": 10,
    "skipped": 0,
    "errors": []
  }
}
```

### GET /api/vehicles/import/stats
Obtiene estadísticas de la importación.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVehicles": 100,
    "vehiclesForKarsUser": 50,
    "vehiclesNeedingSync": 5,
    "lastImport": "2024-01-15T10:30:00Z"
  }
}
```

### DELETE /api/vehicles/clear
Limpia toda la base de datos de vehículos.

## 🐛 Solución de Problemas

### Error: "File not found"
- Verifica que la ruta del archivo JSON sea correcta
- Usa rutas absolutas o relativas desde el directorio del API

### Error: "Invalid JSON format"
- Verifica que el JSON sea válido usando un validador online
- Asegúrate de que no haya comas al final ni caracteres extraños

### Error: "No response from server"
- Verifica que el servidor API esté ejecutándose (`npm run dev`)
- Comprueba que el puerto sea el correcto (por defecto: 3001)

### Error: "vehiclesData must be an array"
- El JSON debe contener un array en la raíz, no un objeto

## 💡 Consejos

1. **Backup antes de `--clear`**: Siempre haz backup antes de usar `--clear`
2. **Archivos grandes**: Para archivos grandes (>1000 vehículos), considera importar en lotes
3. **Validación previa**: Valida el JSON antes de importar para evitar errores
4. **Logs**: Revisa los logs del servidor para más detalles sobre errores

## 🔄 Proceso de Importación

1. ✅ **Validación**: Se valida el formato JSON y estructura
2. 🗑️ **Limpieza** (opcional): Se limpia la BD si `--clear` está activado
3. 🔄 **Procesamiento**: Se procesa cada vehículo individualmente
4. 🏷️ **Título**: Se genera automáticamente el título
5. 💾 **Guardado**: Se guarda en la BD con usuario "113"
6. 📊 **Estadísticas**: Se muestran los resultados finales

¡Listo para importar tus vehículos de Kars.ad! 🚗✨