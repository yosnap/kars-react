import express from 'express';
import { PrismaClient } from '@prisma/client';
import { brandsData } from '../data/brands-data';
import { carExtras } from '../data/initialization/car-extras';
import { motorhomeExtras } from '../data/initialization/motorhome-extras';
import { motorcycleExtras } from '../data/initialization/motorcycle-extras';
import { vehicleStates } from '../data/initialization/vehicle-states';
import { fuelTypes } from '../data/initialization/fuel-types';
import { propulsionTypes } from '../data/initialization/propulsion-types';
import { carBodyTypes } from '../data/initialization/car-body-types';
import { motorcycleBodyTypes } from '../data/initialization/motorcycle-body-types';
import { caravanBodyTypes } from '../data/initialization/caravan-body-types';
import { commercialVehicleBodyTypes } from '../data/initialization/commercial-vehicle-body-types';
import { habitacleExtras } from '../data/initialization/habitacle-extras';
import { exteriorColors } from '../data/initialization/exterior-colors';
import { upholsteryTypes } from '../data/initialization/upholstery-types';
import { upholsteryColors } from '../data/initialization/upholstery-colors';
import { transmissionTypes } from '../data/initialization/transmission-types';

const router = express.Router();
const prisma = new PrismaClient();

interface InstallationStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  progress: number;
  details?: string;
  count?: number;
}

// GET /api/installer/status - Verificar estado del sistema
router.get('/status', async (req, res) => {
  try {
    console.log('🔍 Checking system installation status...');
    
    const [
      brandsCount,
      modelsCount,
      vehiclesCount,
      carExtrasCount,
      caravanExtrasCount,
      motorcycleExtrasCount,
      vehicleStatesCount,
      fuelTypesCount,
      propulsionTypesCount,
      carBodyTypesCount,
      motorcycleBodyTypesCount,
      caravanBodyTypesCount,
      commercialVehicleBodyTypesCount,
      habitacleExtrasCount,
      exteriorColorsCount,
      upholsteryTypesCount,
      upholsteryColorsCount,
      transmissionTypesCount
    ] = await Promise.all([
      prisma.brand.count(),
      prisma.model.count(),
      prisma.vehicle.count(),
      prisma.carExtras.count(),
      prisma.caravanExtras.count(),
      prisma.motorcycleExtras.count(),
      prisma.vehicleState.count(),
      prisma.fuelType.count(),
      prisma.propulsionType.count(),
      prisma.bodyType.count(),
      prisma.motorcycleBodyType.count(),
      prisma.caravanBodyType.count(),
      prisma.commercialVehicleBodyType.count(),
      prisma.habitacleExtras.count(),
      prisma.exteriorColor.count(),
      prisma.upholsteryType.count(),
      prisma.upholsteryColor.count(),
      prisma.transmissionType.count()
    ]);

    const steps: InstallationStep[] = [
      {
        id: 'brands',
        name: 'Marcas de Vehículos',
        description: 'Importar 275 marcas (137 coches + 140 motos)',
        status: brandsCount >= 275 ? 'completed' : 'pending',
        progress: brandsCount >= 275 ? 100 : 0,
        count: brandsCount
      },
      {
        id: 'models',
        name: 'Modelos de Vehículos',
        description: 'Importar 2,816 modelos vinculados a sus marcas',
        status: modelsCount >= 2800 ? 'completed' : 'pending',
        progress: modelsCount >= 2800 ? 100 : Math.round((modelsCount / 2816) * 100),
        count: modelsCount
      },
      {
        id: 'car-extras',
        name: 'Extras de Coches',
        description: 'Instalar 58 extras para coches con traducciones',
        status: carExtrasCount >= 58 ? 'completed' : 'pending',
        progress: carExtrasCount >= 58 ? 100 : Math.round((carExtrasCount / 58) * 100),
        count: carExtrasCount
      },
      {
        id: 'motorhome-extras',
        name: 'Extras de Autocaravanas',
        description: 'Instalar 51 extras para autocaravanas con traducciones',
        status: caravanExtrasCount >= 51 ? 'completed' : 'pending',
        progress: caravanExtrasCount >= 51 ? 100 : Math.round((caravanExtrasCount / 51) * 100),
        count: caravanExtrasCount
      },
      {
        id: 'motorcycle-extras',
        name: 'Extras de Motos',
        description: 'Instalar 47 extras para motos con traducciones',
        status: motorcycleExtrasCount >= 47 ? 'completed' : 'pending',
        progress: motorcycleExtrasCount >= 47 ? 100 : Math.round((motorcycleExtrasCount / 47) * 100),
        count: motorcycleExtrasCount
      },
      {
        id: 'vehicle-states',
        name: 'Estados de Vehículos',
        description: 'Configurar 7 estados: Nou, Ocasió, Km0, etc.',
        status: vehicleStatesCount >= 7 ? 'completed' : 'pending',
        progress: vehicleStatesCount >= 7 ? 100 : Math.round((vehicleStatesCount / 7) * 100),
        count: vehicleStatesCount
      },
      {
        id: 'fuel-types',
        name: 'Tipos de Combustible',
        description: 'Configurar 13 tipos: Benzina, Dièsel, Elèctric, etc.',
        status: fuelTypesCount >= 13 ? 'completed' : 'pending',
        progress: fuelTypesCount >= 13 ? 100 : Math.round((fuelTypesCount / 13) * 100),
        count: fuelTypesCount
      },
      {
        id: 'propulsion-types',
        name: 'Tipos de Propulsor',
        description: 'Configurar 4 tipos: Combustió, Elèctric, Híbrid, etc.',
        status: propulsionTypesCount >= 4 ? 'completed' : 'pending',
        progress: propulsionTypesCount >= 4 ? 100 : Math.round((propulsionTypesCount / 4) * 100),
        count: propulsionTypesCount
      },
      {
        id: 'car-body-types',
        name: 'Carrocerías de Coche',
        description: 'Configurar 12 tipos: SUV, Sedan, Familiar, etc.',
        status: carBodyTypesCount >= 12 ? 'completed' : 'pending',
        progress: carBodyTypesCount >= 12 ? 100 : Math.round((carBodyTypesCount / 12) * 100),
        count: carBodyTypesCount
      },
      {
        id: 'motorcycle-body-types',
        name: 'Carrocerías de Moto',
        description: 'Configurar 16 tipos: Sport, Naked, Enduro, etc.',
        status: motorcycleBodyTypesCount >= 16 ? 'completed' : 'pending',
        progress: motorcycleBodyTypesCount >= 16 ? 100 : Math.round((motorcycleBodyTypesCount / 16) * 100),
        count: motorcycleBodyTypesCount
      },
      {
        id: 'caravan-body-types',
        name: 'Carrocerías de Caravana',
        description: 'Configurar 4 tipos: Caputxina, Perfilada, Integral, etc.',
        status: caravanBodyTypesCount >= 4 ? 'completed' : 'pending',
        progress: caravanBodyTypesCount >= 4 ? 100 : Math.round((caravanBodyTypesCount / 4) * 100),
        count: caravanBodyTypesCount
      },
      {
        id: 'commercial-vehicle-body-types',
        name: 'Carrocerías Comerciales',
        description: 'Configurar 1 tipo: Furgoneta comercial',
        status: commercialVehicleBodyTypesCount >= 1 ? 'completed' : 'pending',
        progress: commercialVehicleBodyTypesCount >= 1 ? 100 : 0,
        count: commercialVehicleBodyTypesCount
      },
      {
        id: 'habitacle-extras',
        name: 'Extras de Habitáculo',
        description: 'Configurar 17 extras: Cuina, Dutxa, TV, etc.',
        status: habitacleExtrasCount >= 17 ? 'completed' : 'pending',
        progress: habitacleExtrasCount >= 17 ? 100 : Math.round((habitacleExtrasCount / 17) * 100),
        count: habitacleExtrasCount
      },
      {
        id: 'exterior-colors',
        name: 'Colores Exteriores',
        description: 'Configurar 19 colores: Blanc, Negre, Blau, etc.',
        status: exteriorColorsCount >= 19 ? 'completed' : 'pending',
        progress: exteriorColorsCount >= 19 ? 100 : Math.round((exteriorColorsCount / 19) * 100),
        count: exteriorColorsCount
      },
      {
        id: 'upholstery-types',
        name: 'Tipos de Tapicería',
        description: 'Configurar 8 tipos: Cuir, Teixit, Alcántara, etc.',
        status: upholsteryTypesCount >= 8 ? 'completed' : 'pending',
        progress: upholsteryTypesCount >= 8 ? 100 : Math.round((upholsteryTypesCount / 8) * 100),
        count: upholsteryTypesCount
      },
      {
        id: 'upholstery-colors',
        name: 'Colores de Tapicería',
        description: 'Configurar 17 colores: Negre, Blanc, Beige, etc.',
        status: upholsteryColorsCount >= 17 ? 'completed' : 'pending',
        progress: upholsteryColorsCount >= 17 ? 100 : Math.round((upholsteryColorsCount / 17) * 100),
        count: upholsteryColorsCount
      },
      {
        id: 'transmission-types',
        name: 'Tipos de Cambio',
        description: 'Configurar 6 tipos: Manual, Automàtic, Seqüencial, etc.',
        status: transmissionTypesCount >= 6 ? 'completed' : 'pending',
        progress: transmissionTypesCount >= 6 ? 100 : Math.round((transmissionTypesCount / 6) * 100),
        count: transmissionTypesCount
      }
    ];

    const isSystemInstalled = steps.every(step => step.status === 'completed');
    const overallProgress = Math.round(
      steps.reduce((sum, step) => sum + step.progress, 0) / steps.length
    );

    console.log(`✅ System status checked - Overall progress: ${overallProgress}%`);

    return res.json({
      success: true,
      data: {
        isInstalled: isSystemInstalled,
        overallProgress,
        steps,
        statistics: {
          brands: brandsCount,
          models: modelsCount,
          vehicles: vehiclesCount
        }
      }
    });

  } catch (error) {
    console.error('❌ Error checking installation status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check installation status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/installer/install - Ejecutar instalación completa
router.post('/install', async (req, res) => {
  try {
    console.log('🚀 Starting complete system installation...');
    
    const results = {
      brands: { imported: 0, skipped: 0, errors: 0 },
      models: { imported: 0, skipped: 0, errors: 0 },
      extras: { imported: 0, skipped: 0, errors: 0 },
      states: { imported: 0, skipped: 0, errors: 0 },
      fuelTypes: { imported: 0, skipped: 0, errors: 0 },
      propulsionTypes: { imported: 0, skipped: 0, errors: 0 },
      carBodyTypes: { imported: 0, skipped: 0, errors: 0 },
      motorcycleBodyTypes: { imported: 0, skipped: 0, errors: 0 },
      caravanBodyTypes: { imported: 0, skipped: 0, errors: 0 },
      commercialVehicleBodyTypes: { imported: 0, skipped: 0, errors: 0 },
      habitacleExtras: { imported: 0, skipped: 0, errors: 0 },
      exteriorColors: { imported: 0, skipped: 0, errors: 0 },
      upholsteryTypes: { imported: 0, skipped: 0, errors: 0 },
      upholsteryColors: { imported: 0, skipped: 0, errors: 0 },
      transmissionTypes: { imported: 0, skipped: 0, errors: 0 }
    };

    // Paso 1: Instalar marcas
    console.log('📦 Step 1: Installing brands...');
    try {
      // Importar marcas de coches
      for (const brand of brandsData.carBrands) {
        try {
          const existingBrand = await prisma.brand.findUnique({
            where: { slug: brand.value }
          });
          
          if (existingBrand) {
            if (!existingBrand.vehicleTypes.includes('car')) {
              await prisma.brand.update({
                where: { id: existingBrand.id },
                data: {
                  vehicleTypes: [...existingBrand.vehicleTypes, 'car']
                }
              });
            }
            results.brands.skipped++;
          } else {
            await prisma.brand.create({
              data: {
                name: brand.label,
                slug: brand.value,
                vehicleTypes: ['car']
              }
            });
            results.brands.imported++;
          }
        } catch (error) {
          results.brands.errors++;
          console.error(`Error importing car brand ${brand.label}:`, error);
        }
      }

      // Importar marcas de motos
      for (const brand of brandsData.motorcycleBrands) {
        try {
          const existingBrand = await prisma.brand.findUnique({
            where: { slug: brand.value }
          });
          
          if (existingBrand) {
            if (!existingBrand.vehicleTypes.includes('motorcycle')) {
              await prisma.brand.update({
                where: { id: existingBrand.id },
                data: {
                  vehicleTypes: [...existingBrand.vehicleTypes, 'motorcycle']
                }
              });
            }
            results.brands.skipped++;
          } else {
            await prisma.brand.create({
              data: {
                name: brand.label,
                slug: brand.value,
                vehicleTypes: ['motorcycle']
              }
            });
            results.brands.imported++;
          }
        } catch (error) {
          results.brands.errors++;
          console.error(`Error importing motorcycle brand ${brand.label}:`, error);
        }
      }

      console.log(`✅ Brands installed: ${results.brands.imported} imported, ${results.brands.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing brands:', error);
      throw error;
    }

    // Paso 2: Instalar modelos
    console.log('📦 Step 2: Installing models...');
    try {
      // Cargar modelos desde archivo JSON
      const fs = require('fs');
      const path = require('path');
      
      const possiblePaths = [
        path.join(process.cwd(), 'data/models.json'),
        path.join(__dirname, '../../../data/models.json'),
        path.join(__dirname, '../../data/models.json')
      ];
      
      let modelsData: any;
      for (const filePath of possiblePaths) {
        if (fs.existsSync(filePath)) {
          const modelsFileContent = fs.readFileSync(filePath, 'utf-8');
          modelsData = JSON.parse(modelsFileContent);
          break;
        }
      }

      if (!modelsData) {
        throw new Error('Models file not found');
      }

      // Importar modelos de coches
      for (const model of modelsData.carModels) {
        try {
          const brand = await prisma.brand.findUnique({
            where: { slug: model.brandSlug }
          });
          
          if (!brand) {
            results.models.errors++;
            continue;
          }
          
          const existingModel = await prisma.model.findFirst({
            where: {
              slug: model.value,
              brandId: brand.id
            }
          });
          
          if (existingModel) {
            results.models.skipped++;
          } else {
            await prisma.model.create({
              data: {
                name: model.label,
                slug: model.value,
                brandId: brand.id
              }
            });
            results.models.imported++;
          }
        } catch (error) {
          results.models.errors++;
        }
      }

      // Importar modelos de motos
      for (const model of modelsData.motorcycleModels) {
        try {
          const brand = await prisma.brand.findUnique({
            where: { slug: model.brandSlug }
          });
          
          if (!brand) {
            results.models.errors++;
            continue;
          }
          
          const existingModel = await prisma.model.findFirst({
            where: {
              slug: model.value,
              brandId: brand.id
            }
          });
          
          if (existingModel) {
            results.models.skipped++;
          } else {
            await prisma.model.create({
              data: {
                name: model.label,
                slug: model.value,
                brandId: brand.id
              }
            });
            results.models.imported++;
          }
        } catch (error) {
          results.models.errors++;
        }
      }

      console.log(`✅ Models installed: ${results.models.imported} imported, ${results.models.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing models:', error);
      throw error;
    }

    // Paso 3: Configurar estados de vehículos
    console.log('📦 Step 3: Installing vehicle states...');
    try {
      for (const state of vehicleStates) {
        try {
          const existingState = await prisma.vehicleState.findUnique({
            where: { value: state.value }
          });
          
          if (existingState) {
            results.states.skipped++;
            console.log(`⏭️ Vehicle state already exists: ${state.catalan}`);
          } else {
            await prisma.vehicleState.create({
              data: {
                name: state.catalan, // Usar catalán como nombre principal
                value: state.value
              }
            });
            results.states.imported++;
            console.log(`✅ Imported vehicle state: ${state.catalan} (${state.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing vehicle state ${state.catalan}:`, error);
          results.states.errors++;
        }
      }
      
      console.log(`✅ Vehicle states installed: ${results.states.imported} imported, ${results.states.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing vehicle states:', error);
      throw error;
    }

    // Paso 4: Configurar tipos de combustible
    console.log('📦 Step 4: Installing fuel types...');
    try {
      for (const fuelType of fuelTypes) {
        try {
          const existingFuelType = await prisma.fuelType.findUnique({
            where: { value: fuelType.value }
          });
          
          if (existingFuelType) {
            results.fuelTypes.skipped++;
            console.log(`⏭️ Fuel type already exists: ${fuelType.catalan}`);
          } else {
            await prisma.fuelType.create({
              data: {
                name: fuelType.catalan, // Usar catalán como nombre principal
                value: fuelType.value
              }
            });
            results.fuelTypes.imported++;
            console.log(`✅ Imported fuel type: ${fuelType.catalan} (${fuelType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing fuel type ${fuelType.catalan}:`, error);
          results.fuelTypes.errors++;
        }
      }
      
      console.log(`✅ Fuel types installed: ${results.fuelTypes.imported} imported, ${results.fuelTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing fuel types:', error);
      throw error;
    }

    // Paso 5: Configurar tipos de propulsor
    console.log('📦 Step 5: Installing propulsion types...');
    try {
      for (const propulsionType of propulsionTypes) {
        try {
          const existingPropulsionType = await prisma.propulsionType.findUnique({
            where: { value: propulsionType.value }
          });
          
          if (existingPropulsionType) {
            results.propulsionTypes.skipped++;
            console.log(`⏭️ Propulsion type already exists: ${propulsionType.catalan}`);
          } else {
            await prisma.propulsionType.create({
              data: {
                name: propulsionType.catalan, // Usar catalán como nombre principal
                value: propulsionType.value
              }
            });
            results.propulsionTypes.imported++;
            console.log(`✅ Imported propulsion type: ${propulsionType.catalan} (${propulsionType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing propulsion type ${propulsionType.catalan}:`, error);
          results.propulsionTypes.errors++;
        }
      }
      
      console.log(`✅ Propulsion types installed: ${results.propulsionTypes.imported} imported, ${results.propulsionTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing propulsion types:', error);
      throw error;
    }

    // Paso 6: Configurar carrocerías de coche
    console.log('📦 Step 6: Installing car body types...');
    try {
      for (const carBodyType of carBodyTypes) {
        try {
          const existingCarBodyType = await prisma.bodyType.findUnique({
            where: { value: carBodyType.value }
          });
          
          if (existingCarBodyType) {
            results.carBodyTypes.skipped++;
            console.log(`⏭️ Car body type already exists: ${carBodyType.catalan}`);
          } else {
            await prisma.bodyType.create({
              data: {
                name: carBodyType.catalan, // Usar catalán como nombre principal
                value: carBodyType.value
              }
            });
            results.carBodyTypes.imported++;
            console.log(`✅ Imported car body type: ${carBodyType.catalan} (${carBodyType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing car body type ${carBodyType.catalan}:`, error);
          results.carBodyTypes.errors++;
        }
      }
      
      console.log(`✅ Car body types installed: ${results.carBodyTypes.imported} imported, ${results.carBodyTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing car body types:', error);
      throw error;
    }

    // Paso 7: Configurar carrocerías de moto
    console.log('📦 Step 7: Installing motorcycle body types...');
    try {
      for (const motorcycleBodyType of motorcycleBodyTypes) {
        try {
          const existingMotorcycleBodyType = await prisma.motorcycleBodyType.findUnique({
            where: { value: motorcycleBodyType.value }
          });
          
          if (existingMotorcycleBodyType) {
            results.motorcycleBodyTypes.skipped++;
            console.log(`⏭️ Motorcycle body type already exists: ${motorcycleBodyType.catalan}`);
          } else {
            await prisma.motorcycleBodyType.create({
              data: {
                name: motorcycleBodyType.catalan, // Usar catalán como nombre principal
                value: motorcycleBodyType.value
              }
            });
            results.motorcycleBodyTypes.imported++;
            console.log(`✅ Imported motorcycle body type: ${motorcycleBodyType.catalan} (${motorcycleBodyType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing motorcycle body type ${motorcycleBodyType.catalan}:`, error);
          results.motorcycleBodyTypes.errors++;
        }
      }
      
      console.log(`✅ Motorcycle body types installed: ${results.motorcycleBodyTypes.imported} imported, ${results.motorcycleBodyTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing motorcycle body types:', error);
      throw error;
    }

    // Paso 8: Configurar carrocerías de caravana
    console.log('📦 Step 8: Installing caravan body types...');
    try {
      for (const caravanBodyType of caravanBodyTypes) {
        try {
          const existingCaravanBodyType = await prisma.caravanBodyType.findUnique({
            where: { value: caravanBodyType.value }
          });
          
          if (existingCaravanBodyType) {
            results.caravanBodyTypes.skipped++;
            console.log(`⏭️ Caravan body type already exists: ${caravanBodyType.catalan}`);
          } else {
            await prisma.caravanBodyType.create({
              data: {
                name: caravanBodyType.catalan, // Usar catalán como nombre principal
                value: caravanBodyType.value
              }
            });
            results.caravanBodyTypes.imported++;
            console.log(`✅ Imported caravan body type: ${caravanBodyType.catalan} (${caravanBodyType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing caravan body type ${caravanBodyType.catalan}:`, error);
          results.caravanBodyTypes.errors++;
        }
      }
      
      console.log(`✅ Caravan body types installed: ${results.caravanBodyTypes.imported} imported, ${results.caravanBodyTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing caravan body types:', error);
      throw error;
    }

    // Paso 9: Configurar carrocerías de vehículos comerciales
    console.log('📦 Step 9: Installing commercial vehicle body types...');
    try {
      for (const commercialVehicleBodyType of commercialVehicleBodyTypes) {
        try {
          const existingCommercialVehicleBodyType = await prisma.commercialVehicleBodyType.findUnique({
            where: { value: commercialVehicleBodyType.value }
          });
          
          if (existingCommercialVehicleBodyType) {
            results.commercialVehicleBodyTypes.skipped++;
            console.log(`⏭️ Commercial vehicle body type already exists: ${commercialVehicleBodyType.catalan}`);
          } else {
            await prisma.commercialVehicleBodyType.create({
              data: {
                name: commercialVehicleBodyType.catalan, // Usar catalán como nombre principal
                value: commercialVehicleBodyType.value
              }
            });
            results.commercialVehicleBodyTypes.imported++;
            console.log(`✅ Imported commercial vehicle body type: ${commercialVehicleBodyType.catalan} (${commercialVehicleBodyType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing commercial vehicle body type ${commercialVehicleBodyType.catalan}:`, error);
          results.commercialVehicleBodyTypes.errors++;
        }
      }
      
      console.log(`✅ Commercial vehicle body types installed: ${results.commercialVehicleBodyTypes.imported} imported, ${results.commercialVehicleBodyTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing commercial vehicle body types:', error);
      throw error;
    }

    // Paso 10: Configurar extras de habitáculo
    console.log('📦 Step 10: Installing habitacle extras...');
    try {
      for (const habitacleExtra of habitacleExtras) {
        try {
          const existingHabitacleExtra = await prisma.habitacleExtras.findUnique({
            where: { value: habitacleExtra.value }
          });
          
          if (existingHabitacleExtra) {
            results.habitacleExtras.skipped++;
            console.log(`⏭️ Habitacle extra already exists: ${habitacleExtra.catalan}`);
          } else {
            await prisma.habitacleExtras.create({
              data: {
                name: habitacleExtra.catalan, // Usar catalán como nombre principal
                value: habitacleExtra.value
              }
            });
            results.habitacleExtras.imported++;
            console.log(`✅ Imported habitacle extra: ${habitacleExtra.catalan} (${habitacleExtra.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing habitacle extra ${habitacleExtra.catalan}:`, error);
          results.habitacleExtras.errors++;
        }
      }
      
      console.log(`✅ Habitacle extras installed: ${results.habitacleExtras.imported} imported, ${results.habitacleExtras.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing habitacle extras:', error);
      throw error;
    }

    // Paso 11: Configurar colores exteriores
    console.log('📦 Step 11: Installing exterior colors...');
    try {
      for (const exteriorColor of exteriorColors) {
        try {
          const existingExteriorColor = await prisma.exteriorColor.findUnique({
            where: { value: exteriorColor.value }
          });
          
          if (existingExteriorColor) {
            results.exteriorColors.skipped++;
            console.log(`⏭️ Exterior color already exists: ${exteriorColor.catalan}`);
          } else {
            await prisma.exteriorColor.create({
              data: {
                name: exteriorColor.catalan, // Usar catalán como nombre principal
                value: exteriorColor.value
              }
            });
            results.exteriorColors.imported++;
            console.log(`✅ Imported exterior color: ${exteriorColor.catalan} (${exteriorColor.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing exterior color ${exteriorColor.catalan}:`, error);
          results.exteriorColors.errors++;
        }
      }
      
      console.log(`✅ Exterior colors installed: ${results.exteriorColors.imported} imported, ${results.exteriorColors.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing exterior colors:', error);
      throw error;
    }

    // Paso 12: Configurar tipos de tapicería
    console.log('📦 Step 12: Installing upholstery types...');
    try {
      for (const upholsteryType of upholsteryTypes) {
        try {
          const existingUpholsteryType = await prisma.upholsteryType.findUnique({
            where: { value: upholsteryType.value }
          });
          
          if (existingUpholsteryType) {
            results.upholsteryTypes.skipped++;
            console.log(`⏭️ Upholstery type already exists: ${upholsteryType.catalan}`);
          } else {
            await prisma.upholsteryType.create({
              data: {
                name: upholsteryType.catalan, // Usar catalán como nombre principal
                value: upholsteryType.value
              }
            });
            results.upholsteryTypes.imported++;
            console.log(`✅ Imported upholstery type: ${upholsteryType.catalan} (${upholsteryType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing upholstery type ${upholsteryType.catalan}:`, error);
          results.upholsteryTypes.errors++;
        }
      }
      
      console.log(`✅ Upholstery types installed: ${results.upholsteryTypes.imported} imported, ${results.upholsteryTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing upholstery types:', error);
      throw error;
    }

    // Paso 13: Configurar colores de tapicería
    console.log('📦 Step 13: Installing upholstery colors...');
    try {
      for (const upholsteryColor of upholsteryColors) {
        try {
          const existingUpholsteryColor = await prisma.upholsteryColor.findUnique({
            where: { value: upholsteryColor.value }
          });
          
          if (existingUpholsteryColor) {
            results.upholsteryColors.skipped++;
            console.log(`⏭️ Upholstery color already exists: ${upholsteryColor.catalan}`);
          } else {
            await prisma.upholsteryColor.create({
              data: {
                name: upholsteryColor.catalan, // Usar catalán como nombre principal
                value: upholsteryColor.value
              }
            });
            results.upholsteryColors.imported++;
            console.log(`✅ Imported upholstery color: ${upholsteryColor.catalan} (${upholsteryColor.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing upholstery color ${upholsteryColor.catalan}:`, error);
          results.upholsteryColors.errors++;
        }
      }
      
      console.log(`✅ Upholstery colors installed: ${results.upholsteryColors.imported} imported, ${results.upholsteryColors.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing upholstery colors:', error);
      throw error;
    }

    // Paso 14: Configurar tipos de cambio
    console.log('📦 Step 14: Installing transmission types...');
    try {
      for (const transmissionType of transmissionTypes) {
        try {
          const existingTransmissionType = await prisma.transmissionType.findUnique({
            where: { value: transmissionType.value }
          });
          
          if (existingTransmissionType) {
            results.transmissionTypes.skipped++;
            console.log(`⏭️ Transmission type already exists: ${transmissionType.catalan}`);
          } else {
            await prisma.transmissionType.create({
              data: {
                name: transmissionType.catalan, // Usar catalán como nombre principal
                value: transmissionType.value
              }
            });
            results.transmissionTypes.imported++;
            console.log(`✅ Imported transmission type: ${transmissionType.catalan} (${transmissionType.value})`);
          }
        } catch (error) {
          console.error(`❌ Error importing transmission type ${transmissionType.catalan}:`, error);
          results.transmissionTypes.errors++;
        }
      }
      
      console.log(`✅ Transmission types installed: ${results.transmissionTypes.imported} imported, ${results.transmissionTypes.skipped} skipped`);
    } catch (error) {
      console.error('❌ Error installing transmission types:', error);
      throw error;
    }

    const totalBrands = await prisma.brand.count();
    const totalModels = await prisma.model.count();

    console.log('🎉 Installation completed successfully!');

    return res.json({
      success: true,
      message: 'System installation completed successfully',
      data: {
        results,
        statistics: {
          totalBrands,
          totalModels,
          installedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    console.error('❌ Installation failed:', error);
    return res.status(500).json({
      success: false,
      error: 'Installation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/installer/step/:stepId - Ejecutar paso específico
router.post('/step/:stepId', async (req, res) => {
  try {
    const { stepId } = req.params;
    console.log(`🔄 Running installation step: ${stepId}`);

    let result = { imported: 0, skipped: 0, errors: 0 };

    switch (stepId) {
      case 'brands':
        // Implementar instalación solo de marcas
        break;
      case 'models':
        // Implementar instalación solo de modelos
        break;
      case 'car-extras':
        // Instalar extras de coches
        for (const carExtra of carExtras) {
          try {
            const existingCarExtra = await prisma.carExtras.findUnique({
              where: { value: carExtra.value }
            });
            
            if (existingCarExtra) {
              result.skipped++;
            } else {
              await prisma.carExtras.create({
                data: {
                  name: carExtra.catalan,
                  value: carExtra.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing car extra ${carExtra.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'vehicle-states':
        // Instalar estados de vehículos
        for (const state of vehicleStates) {
          try {
            const existingState = await prisma.vehicleState.findUnique({
              where: { value: state.value }
            });
            
            if (existingState) {
              result.skipped++;
            } else {
              await prisma.vehicleState.create({
                data: {
                  name: state.catalan,
                  value: state.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing vehicle state ${state.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'fuel-types':
        // Instalar tipos de combustible
        for (const fuelType of fuelTypes) {
          try {
            const existingFuelType = await prisma.fuelType.findUnique({
              where: { value: fuelType.value }
            });
            
            if (existingFuelType) {
              result.skipped++;
            } else {
              await prisma.fuelType.create({
                data: {
                  name: fuelType.catalan,
                  value: fuelType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing fuel type ${fuelType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'propulsion-types':
        // Instalar tipos de propulsor
        for (const propulsionType of propulsionTypes) {
          try {
            const existingPropulsionType = await prisma.propulsionType.findUnique({
              where: { value: propulsionType.value }
            });
            
            if (existingPropulsionType) {
              result.skipped++;
            } else {
              await prisma.propulsionType.create({
                data: {
                  name: propulsionType.catalan,
                  value: propulsionType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing propulsion type ${propulsionType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'car-body-types':
        // Instalar carrocerías de coche
        for (const carBodyType of carBodyTypes) {
          try {
            const existingCarBodyType = await prisma.bodyType.findUnique({
              where: { value: carBodyType.value }
            });
            
            if (existingCarBodyType) {
              result.skipped++;
            } else {
              await prisma.bodyType.create({
                data: {
                  name: carBodyType.catalan,
                  value: carBodyType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing car body type ${carBodyType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'motorcycle-body-types':
        // Instalar carrocerías de moto
        for (const motorcycleBodyType of motorcycleBodyTypes) {
          try {
            const existingMotorcycleBodyType = await prisma.motorcycleBodyType.findUnique({
              where: { value: motorcycleBodyType.value }
            });
            
            if (existingMotorcycleBodyType) {
              result.skipped++;
            } else {
              await prisma.motorcycleBodyType.create({
                data: {
                  name: motorcycleBodyType.catalan,
                  value: motorcycleBodyType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing motorcycle body type ${motorcycleBodyType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'caravan-body-types':
        // Instalar carrocerías de caravana
        for (const caravanBodyType of caravanBodyTypes) {
          try {
            const existingCaravanBodyType = await prisma.caravanBodyType.findUnique({
              where: { value: caravanBodyType.value }
            });
            
            if (existingCaravanBodyType) {
              result.skipped++;
            } else {
              await prisma.caravanBodyType.create({
                data: {
                  name: caravanBodyType.catalan,
                  value: caravanBodyType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing caravan body type ${caravanBodyType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'commercial-vehicle-body-types':
        // Instalar carrocerías de vehículos comerciales
        for (const commercialVehicleBodyType of commercialVehicleBodyTypes) {
          try {
            const existingCommercialVehicleBodyType = await prisma.commercialVehicleBodyType.findUnique({
              where: { value: commercialVehicleBodyType.value }
            });
            
            if (existingCommercialVehicleBodyType) {
              result.skipped++;
            } else {
              await prisma.commercialVehicleBodyType.create({
                data: {
                  name: commercialVehicleBodyType.catalan,
                  value: commercialVehicleBodyType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing commercial vehicle body type ${commercialVehicleBodyType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'habitacle-extras':
        // Instalar extras de habitáculo
        for (const habitacleExtra of habitacleExtras) {
          try {
            const existingHabitacleExtra = await prisma.habitacleExtras.findUnique({
              where: { value: habitacleExtra.value }
            });
            
            if (existingHabitacleExtra) {
              result.skipped++;
            } else {
              await prisma.habitacleExtras.create({
                data: {
                  name: habitacleExtra.catalan,
                  value: habitacleExtra.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing habitacle extra ${habitacleExtra.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'exterior-colors':
        // Instalar colores exteriores
        for (const exteriorColor of exteriorColors) {
          try {
            const existingExteriorColor = await prisma.exteriorColor.findUnique({
              where: { value: exteriorColor.value }
            });
            
            if (existingExteriorColor) {
              result.skipped++;
            } else {
              await prisma.exteriorColor.create({
                data: {
                  name: exteriorColor.catalan,
                  value: exteriorColor.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing exterior color ${exteriorColor.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'upholstery-types':
        // Instalar tipos de tapicería
        for (const upholsteryType of upholsteryTypes) {
          try {
            const existingUpholsteryType = await prisma.upholsteryType.findUnique({
              where: { value: upholsteryType.value }
            });
            
            if (existingUpholsteryType) {
              result.skipped++;
            } else {
              await prisma.upholsteryType.create({
                data: {
                  name: upholsteryType.catalan,
                  value: upholsteryType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing upholstery type ${upholsteryType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'upholstery-colors':
        // Instalar colores de tapicería
        for (const upholsteryColor of upholsteryColors) {
          try {
            const existingUpholsteryColor = await prisma.upholsteryColor.findUnique({
              where: { value: upholsteryColor.value }
            });
            
            if (existingUpholsteryColor) {
              result.skipped++;
            } else {
              await prisma.upholsteryColor.create({
                data: {
                  name: upholsteryColor.catalan,
                  value: upholsteryColor.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing upholstery color ${upholsteryColor.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'transmission-types':
        // Instalar tipos de cambio
        for (const transmissionType of transmissionTypes) {
          try {
            const existingTransmissionType = await prisma.transmissionType.findUnique({
              where: { value: transmissionType.value }
            });
            
            if (existingTransmissionType) {
              result.skipped++;
            } else {
              await prisma.transmissionType.create({
                data: {
                  name: transmissionType.catalan,
                  value: transmissionType.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing transmission type ${transmissionType.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'motorhome-extras':
        // Instalar extras de autocaravanas (usando CaravanExtras)
        for (const motorhomeExtra of motorhomeExtras) {
          try {
            const existingMotorhomeExtra = await prisma.caravanExtras.findUnique({
              where: { value: motorhomeExtra.value }
            });
            
            if (existingMotorhomeExtra) {
              result.skipped++;
            } else {
              await prisma.caravanExtras.create({
                data: {
                  name: motorhomeExtra.catalan,
                  value: motorhomeExtra.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing motorhome extra ${motorhomeExtra.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      case 'motorcycle-extras':
        // Instalar extras de motos
        for (const motorcycleExtra of motorcycleExtras) {
          try {
            const existingMotorcycleExtra = await prisma.motorcycleExtras.findUnique({
              where: { value: motorcycleExtra.value }
            });
            
            if (existingMotorcycleExtra) {
              result.skipped++;
            } else {
              await prisma.motorcycleExtras.create({
                data: {
                  name: motorcycleExtra.catalan,
                  value: motorcycleExtra.value
                }
              });
              result.imported++;
            }
          } catch (error) {
            console.error(`Error importing motorcycle extra ${motorcycleExtra.catalan}:`, error);
            result.errors++;
          }
        }
        break;
      // ... otros casos
      default:
        throw new Error(`Unknown step: ${stepId}`);
    }

    return res.json({
      success: true,
      message: `Step ${stepId} completed`,
      data: result
    });

  } catch (error) {
    console.error(`❌ Error running step ${req.params.stepId}:`, error);
    return res.status(500).json({
      success: false,
      error: `Failed to run step ${req.params.stepId}`,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;