const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ImportValidator {
  constructor() {
    this.validationCache = {};
    this.newValues = {
      brands: new Set(),
      models: new Set(),
      fuelTypes: new Set(),
      vehicleStates: new Set(),
      transmissionTypes: new Set(),
      propulsionTypes: new Set(),
      bodyTypes: new Set(),
      motorcycleBodyTypes: new Set(),
      caravanBodyTypes: new Set(),
      exteriorColors: new Set(),
      upholsteryTypes: new Set(),
      upholsteryColors: new Set()
    };
  }

  async loadValidationData() {
    console.log('🔄 Cargando datos de validación...');
    
    try {
      // Cargar todas las colecciones existentes
      const [
        brands, fuelTypes, vehicleStates, transmissionTypes, 
        propulsionTypes, bodyTypes, motorcycleBodyTypes, caravanBodyTypes,
        exteriorColors, upholsteryTypes, upholsteryColors
      ] = await Promise.all([
        prisma.brand.findMany({ select: { slug: true, vehicleTypes: true } }),
        prisma.fuelType.findMany({ select: { value: true } }),
        prisma.vehicleState.findMany({ select: { value: true } }),
        prisma.transmissionType.findMany({ select: { value: true } }),
        prisma.propulsionType.findMany({ select: { value: true } }),
        prisma.bodyType.findMany({ select: { value: true } }),
        prisma.motorcycleBodyType.findMany({ select: { value: true } }),
        prisma.caravanBodyType.findMany({ select: { value: true } }),
        prisma.exteriorColor.findMany({ select: { value: true } }),
        prisma.upholsteryType.findMany({ select: { value: true } }),
        prisma.upholsteryColor.findMany({ select: { value: true } })
      ]);

      // Convertir a Sets para búsqueda rápida
      this.validationCache = {
        carBrands: new Set(brands.filter(b => b.vehicleTypes.includes('car')).map(b => b.slug)),
        motorcycleBrands: new Set(brands.filter(b => b.vehicleTypes.includes('motorcycle')).map(b => b.slug)),
        fuelTypes: new Set(fuelTypes.map(f => f.value)),
        vehicleStates: new Set(vehicleStates.map(v => v.value)),
        transmissionTypes: new Set(transmissionTypes.map(t => t.value)),
        propulsionTypes: new Set(propulsionTypes.map(p => p.value)),
        bodyTypes: new Set(bodyTypes.map(b => b.value)),
        motorcycleBodyTypes: new Set(motorcycleBodyTypes.map(b => b.value)),
        caravanBodyTypes: new Set(caravanBodyTypes.map(b => b.value)),
        exteriorColors: new Set(exteriorColors.map(c => c.value)),
        upholsteryTypes: new Set(upholsteryTypes.map(u => u.value)),
        upholsteryColors: new Set(upholsteryColors.map(u => u.value))
      };

      console.log('✅ Datos de validación cargados:');
      console.log(`   • Marcas de coches: ${this.validationCache.carBrands.size}`);
      console.log(`   • Marcas de motos: ${this.validationCache.motorcycleBrands.size}`);
      console.log(`   • Tipos de combustible: ${this.validationCache.fuelTypes.size}`);
      console.log(`   • Estados de vehículo: ${this.validationCache.vehicleStates.size}`);
      console.log(`   • Tipos de transmisión: ${this.validationCache.transmissionTypes.size}`);
      console.log(`   • Tipos de propulsión: ${this.validationCache.propulsionTypes.size}`);

    } catch (error) {
      console.error('❌ Error cargando datos de validación:', error.message);
    }
  }

  validateField(fieldName, value, vehicleSlug = '') {
    if (!value || value === '') return { valid: true };

    let collection = null;
    let newValueCategory = null;

    switch (fieldName) {
      case 'marcaCotxe':
        collection = this.validationCache.carBrands;
        newValueCategory = 'brands';
        break;
      case 'marcaMoto':
        collection = this.validationCache.motorcycleBrands;
        newValueCategory = 'brands';
        break;
      case 'tipusCombustible':
        collection = this.validationCache.fuelTypes;
        newValueCategory = 'fuelTypes';
        break;
      case 'estatVehicle':
        collection = this.validationCache.vehicleStates;
        newValueCategory = 'vehicleStates';
        break;
      case 'tipusCanvi':
        collection = this.validationCache.transmissionTypes;
        newValueCategory = 'transmissionTypes';
        break;
      case 'tipusPropulsor':
        collection = this.validationCache.propulsionTypes;
        newValueCategory = 'propulsionTypes';
        break;
      case 'carrosseriaCotxe':
        collection = this.validationCache.bodyTypes;
        newValueCategory = 'bodyTypes';
        break;
      case 'carrosseriaMoto':
        collection = this.validationCache.motorcycleBodyTypes;
        newValueCategory = 'motorcycleBodyTypes';
        break;
      case 'carrosseriaCaravana':
        collection = this.validationCache.caravanBodyTypes;
        newValueCategory = 'caravanBodyTypes';
        break;
      case 'colorVehicle':
        collection = this.validationCache.exteriorColors;
        newValueCategory = 'exteriorColors';
        break;
      case 'tipusTapisseria':
        collection = this.validationCache.upholsteryTypes;
        newValueCategory = 'upholsteryTypes';
        break;
      case 'colorTapisseria':
        collection = this.validationCache.upholsteryColors;
        newValueCategory = 'upholsteryColors';
        break;
      default:
        return { valid: true }; // Campo no validado
    }

    if (collection && !collection.has(value)) {
      // Valor nuevo encontrado
      this.newValues[newValueCategory].add(value);
      return {
        valid: false,
        fieldName,
        value,
        vehicleSlug,
        message: `Nuevo valor "${value}" para ${fieldName} no existe en la colección`
      };
    }

    return { valid: true };
  }

  validateVehicle(vehicleData) {
    const errors = [];
    const fieldsToValidate = [
      'marcaCotxe', 'marcaMoto', 'tipusCombustible', 'estatVehicle',
      'tipusCanvi', 'tipusPropulsor', 'carrosseriaCotxe', 'carrosseriaMoto',
      'carrosseriaCaravana', 'colorVehicle', 'tipusTapisseria', 'colorTapisseria'
    ];

    fieldsToValidate.forEach(field => {
      const result = this.validateField(field, vehicleData[field], vehicleData.slug);
      if (!result.valid) {
        errors.push(result);
      }
    });

    return errors;
  }

  generateReport() {
    console.log('\n📊 REPORTE DE VALIDACIÓN:');
    console.log('='.repeat(70));
    
    let hasNewValues = false;

    Object.entries(this.newValues).forEach(([category, values]) => {
      if (values.size > 0) {
        hasNewValues = true;
        console.log(`\n❗ ${category.toUpperCase()} - ${values.size} valores nuevos:`);
        Array.from(values).sort().forEach(value => {
          console.log(`   • "${value}"`);
        });
      }
    });

    if (!hasNewValues) {
      console.log('\n✅ Todos los valores coinciden con las colecciones existentes');
    } else {
      console.log('\n🔧 ACCIONES RECOMENDADAS:');
      console.log('   1. Revisar los valores nuevos listados arriba');
      console.log('   2. Agregar valores válidos a las colecciones correspondientes');
      console.log('   3. Corregir valores erróneos en la API externa');
      console.log('   4. Crear mapeo para valores alternativos');
    }

    return {
      hasNewValues,
      newValues: Object.fromEntries(
        Object.entries(this.newValues).map(([k, v]) => [k, Array.from(v)])
      )
    };
  }
}

module.exports = { ImportValidator };