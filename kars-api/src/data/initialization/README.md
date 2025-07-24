# Datos de Inicialización - Extras de Vehículos

Esta carpeta contiene los datos de inicialización para los extras de vehículos con traducciones en 4 idiomas.

## Estructura de Archivos

```
initialization/
├── car-extras.ts           # Extras para coches
├── motorhome-extras.ts     # Extras para autocaravanas
├── motorcycle-extras.ts    # Extras para motos
├── index.ts               # Script principal y utilidades
└── README.md              # Esta documentación
```

## Formato de Datos

Cada archivo de extras contiene un array de objetos con la siguiente estructura:

```typescript
interface ExtraTranslation {
  catalan: string;    // Idioma principal del proyecto
  spanish: string;    // Español
  french: string;     // Francés
  english: string;    // Inglés
}
```

## Uso

### Obtener todos los datos
```typescript
import { getInitializationData } from './index.js';

const data = getInitializationData();
console.log(data.carExtras);
console.log(data.motorhomeExtras);
console.log(data.motorcycleExtras);
```

### Obtener extras por tipo de vehículo
```typescript
import { getExtrasByVehicleType } from './index.js';

const carExtras = getExtrasByVehicleType('cotxe');
const motoExtras = getExtrasByVehicleType('moto');
const motorhomeExtras = getExtrasByVehicleType('autocaravana');
```

### Obtener traducciones de un extra específico
```typescript
import { getExtraTranslations } from './index.js';

const airbagTranslations = getExtraTranslations('Airbag conductor', 'cotxe');
// Retorna: { catalan: "Airbag conductor", spanish: "Airbag conductor", french: "Airbag conducteur", english: "Driver airbag" }
```

### Obtener nombre en idioma específico
```typescript
import { getExtraNameInLanguage } from './index.js';

const nameInEnglish = getExtraNameInLanguage('Airbag conductor', 'cotxe', 'english');
// Retorna: "Driver airbag"
```

## Tipos de Vehículos Soportados

- **Coches**: `cotxe`, `car`, `coche`
- **Motos**: `moto`, `motorcycle`, `motocicleta`
- **Autocaravanas**: `autocaravana`, `camper`, `autocaravana-camper`

## Normalización

El sistema incluye una función de normalización para comparar nombres de extras:

```typescript
import { normalizeExtraName } from './index.js';

const normalized = normalizeExtraName('Airbag conductor');
// Retorna: "airbag-conductor"
```

Esta normalización:
- Convierte a minúsculas
- Reemplaza espacios con guiones
- Elimina puntos
- Normaliza acentos y diacríticos

## Integración con Base de Datos

Estos datos están diseñados para ser cargados en la base de datos durante la inicialización del sistema, proporcionando:

1. **Consistencia**: Todos los extras están estandarizados
2. **Multiidioma**: Soporte completo para los 4 idiomas del proyecto
3. **Escalabilidad**: Fácil agregar nuevos extras o idiomas
4. **Mantenimiento**: Datos centralizados y organizados por tipo de vehículo