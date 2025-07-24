import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = express.Router();
const prisma = new PrismaClient();

interface ExternalModel {
  value?: string;
  slug?: string;
  label?: string;
  name?: string;
}

// GET /api/brands/cars - Obtener marcas para coches, autocaravanas y vehículos comerciales
router.get('/cars', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        vehicleTypes: { hasSome: ['car'] }
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleTypes: true
      }
    });

    return res.json({
      success: true,
      total: brands.length,
      data: brands.map(brand => ({
        value: brand.slug,
        label: brand.name
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching car brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch car brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/brands/motorcycles - Obtener marcas de motos
router.get('/motorcycles', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: {
        vehicleTypes: { hasSome: ['motorcycle'] }
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleTypes: true
      }
    });

    return res.json({
      success: true,
      total: brands.length,
      data: brands.map(brand => ({
        value: brand.slug,
        label: brand.name
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching motorcycle brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch motorcycle brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/brands - Obtener todas las marcas (con filtro opcional por tipo)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    console.log(`🔍 GET /brands - Obteniendo marcas${type ? ` de tipo ${type}` : ''}`);
    
    const whereCondition = type ? { vehicleTypes: { hasSome: [type as string] } } : {};
    
    const brands = await prisma.brand.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleTypes: true,
        _count: {
          select: { models: true }
        }
      }
    });

    console.log(`✅ Found ${brands.length} brands`);

    return res.json({
      success: true,
      total: brands.length,
      data: brands.map(brand => ({
        id: brand.id,
        value: brand.slug,
        label: brand.name,
        slug: brand.slug,
        name: brand.name,
        vehicleTypes: brand.vehicleTypes,
        modelCount: brand._count.models
      }))
    });

  } catch (error) {
    console.error('❌ Error fetching brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/brands/clear-all - Limpiar todas las marcas (solo para debugging)
router.post('/clear-all', async (req, res) => {
  try {
    console.log('🗑️ POST /brands/clear-all - Clearing all brands');
    
    const deletedCount = await prisma.brand.deleteMany({});
    
    console.log(`✅ Deleted ${deletedCount.count} brands`);
    
    return res.json({
      success: true,
      message: `Deleted ${deletedCount.count} brands`,
      data: {
        deletedCount: deletedCount.count
      }
    });
    
  } catch (error) {
    console.error('❌ Error clearing brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clear brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/brands/import-from-json - Importar marcas desde datos embebidos
router.post('/import-from-json', async (req, res) => {
  try {
    console.log('📥 POST /brands/import-from-json - Importing brands from embedded data');
    
    // Importar marcas desde datos embebidos (compatible con Docker/producción)
    const { brandsData } = await import('../data/brands-data');
    
    let importedCars = 0;
    let importedMotorcycles = 0;
    let skippedCars = 0;
    let skippedMotorcycles = 0;
    let updatedDuplicates = 0;
    
    console.log(`📊 Found ${brandsData.metadata.totalCarBrands} car brands and ${brandsData.metadata.totalMotorcycleBrands} motorcycle brands`);
    console.log('🔍 First car brand sample:', JSON.stringify(brandsData.carBrands[0], null, 2));
    console.log('🔍 First motorcycle brand sample:', JSON.stringify(brandsData.motorcycleBrands[0], null, 2));
    
    // Importar marcas de coches
    console.log('🚗 Importing car brands...');
    for (const brand of brandsData.carBrands) {
      try {
        // Validar que el brand tenga los campos necesarios
        if (!brand || !brand.value || !brand.label) {
          console.warn('⚠️ Invalid car brand data:', brand);
          skippedCars++;
          continue;
        }
        
        console.log(`🔍 Processing car brand: ${brand.label} (${brand.value})`);
        
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
            updatedDuplicates++;
            console.log(`✅ Updated existing brand: ${brand.label} (added car type)`);
          } else {
            skippedCars++;
            console.log(`⏭️ Car brand already exists: ${brand.label}`);
          }
        } else {
          await prisma.brand.create({
            data: {
              name: brand.label,
              slug: brand.value,
              vehicleTypes: ['car']
            }
          });
          importedCars++;
          console.log(`✅ Imported car brand: ${brand.label}`);
        }
      } catch (error) {
        console.error(`❌ Error importing car brand ${brand?.label || 'unknown'}:`, error);
        skippedCars++;
      }
    }
    
    // Importar marcas de motos
    console.log('🏍️ Importing motorcycle brands...');
    for (const brand of brandsData.motorcycleBrands) {
      try {
        // Validar que el brand tenga los campos necesarios
        if (!brand || !brand.value || !brand.label) {
          console.warn('⚠️ Invalid motorcycle brand data:', brand);
          skippedMotorcycles++;
          continue;
        }
        
        console.log(`🔍 Processing motorcycle brand: ${brand.label} (${brand.value})`);
        
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
            updatedDuplicates++;
            console.log(`✅ Updated existing brand: ${brand.label} (added motorcycle type)`);
          } else {
            skippedMotorcycles++;
            console.log(`⏭️ Motorcycle brand already exists: ${brand.label}`);
          }
        } else {
          await prisma.brand.create({
            data: {
              name: brand.label,
              slug: brand.value,
              vehicleTypes: ['motorcycle']
            }
          });
          importedMotorcycles++;
          console.log(`✅ Imported motorcycle brand: ${brand.label}`);
        }
      } catch (error) {
        console.error(`❌ Error importing motorcycle brand ${brand?.label || 'unknown'}:`, error);
        skippedMotorcycles++;
      }
    }
    
    console.log(`📊 Import completed: ${importedCars} cars, ${importedMotorcycles} motorcycles, ${updatedDuplicates} updated, ${skippedCars + skippedMotorcycles} skipped`);
    
    // Obtener estadísticas actualizadas
    const totalCarBrands = await prisma.brand.count({
      where: { vehicleTypes: { hasSome: ['car'] } }
    });
    const totalMotorcycleBrands = await prisma.brand.count({
      where: { vehicleTypes: { hasSome: ['motorcycle'] } }
    });
    const totalBrands = await prisma.brand.count();
    
    console.log('✅ Brands import completed successfully');
    
    return res.json({
      success: true,
      message: 'Brands imported successfully from JSON file',
      data: {
        totalCarBrands,
        totalMotorcycleBrands,
        totalBrands,
        importedCars,
        importedMotorcycles,
        updatedDuplicates,
        skippedCars,
        skippedMotorcycles,
        importedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error importing brands from JSON:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import brands from JSON file',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/brands/:brandSlug/models - Obtener modelos de una marca específica
router.get('/:brandSlug/models', async (req, res) => {
  try {
    const { brandSlug } = req.params;
    console.log(`🔍 GET /brands/${brandSlug}/models - Obteniendo modelos`);
    
    // Verificar que la marca existe
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: `Brand with slug '${brandSlug}' not found`
      });
    }
    
    const models = await prisma.model.findMany({
      where: { brandId: brand.id },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        brandId: true
      }
    });

    console.log(`✅ Found ${models.length} models for brand ${brand.name}`);

    return res.json({
      success: true,
      total: models.length,
      data: models
    });

  } catch (error) {
    console.error('❌ Error fetching models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/brands/import-models - Importar todos los modelos desde archivo JSON
router.post('/import-models', async (req, res) => {
  try {
    console.log('📥 POST /brands/import-models - Importing models from JSON file');
    
    // Cargar archivo de modelos
    const fs = require('fs');
    const path = require('path');
    
    let modelsData: any;
    
    // Intentar múltiples rutas para encontrar el archivo models.json
    const possiblePaths = [
      path.join(process.cwd(), 'data/models.json'),                    // Desde directorio de trabajo
      path.join(__dirname, '../../../data/models.json'),              // Desde src/routes/
      path.join(__dirname, '../../data/models.json'),                 // Desde dist/routes/
      path.join(__dirname, '../../../../data/models.json')            // Alternativa
    ];
    
    console.log('🔍 Looking for models file...');
    console.log('📂 Current directory:', __dirname);
    console.log('📂 Process cwd:', process.cwd());
    
    let fileFound = false;
    for (const filePath of possiblePaths) {
      console.log('🔍 Trying path:', filePath);
      if (fs.existsSync(filePath)) {
        console.log('✅ Found models file at:', filePath);
        try {
          const modelsFileContent = fs.readFileSync(filePath, 'utf-8');
          modelsData = JSON.parse(modelsFileContent);
          fileFound = true;
          break;
        } catch (parseError) {
          console.error('❌ Error parsing JSON at', filePath, ':', parseError);
          continue;
        }
      }
    }
    
    if (!fileFound) {
      throw new Error(`Models file not found. Tried paths: ${possiblePaths.join(', ')}`);
    }
    
    let importedCarModels = 0;
    let importedMotorcycleModels = 0;
    let skippedCarModels = 0;
    let skippedMotorcycleModels = 0;
    let brandNotFoundErrors = 0;
    
    console.log(`📊 Found ${modelsData.metadata.totalCarModels} car models and ${modelsData.metadata.totalMotorcycleModels} motorcycle models`);
    
    // Importar modelos de coches
    console.log('🚗 Importing car models...');
    for (const model of modelsData.carModels) {
      try {
        if (!model || !model.value || !model.label || !model.brandSlug) {
          skippedCarModels++;
          continue;
        }
        
        // Buscar la marca
        const brand = await prisma.brand.findUnique({
          where: { slug: model.brandSlug }
        });
        
        if (!brand) {
          console.warn(`⚠️ Brand not found: ${model.brandSlug} for model ${model.label}`);
          brandNotFoundErrors++;
          skippedCarModels++;
          continue;
        }
        
        // Verificar si el modelo ya existe
        const existingModel = await prisma.model.findFirst({
          where: {
            slug: model.value,
            brandId: brand.id
          }
        });
        
        if (existingModel) {
          skippedCarModels++;
        } else {
          await prisma.model.create({
            data: {
              name: model.label,
              slug: model.value,
              brandId: brand.id
            }
          });
          importedCarModels++;
          if (importedCarModels % 100 === 0) {
            console.log(`🚗 Imported ${importedCarModels} car models...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error importing car model ${model?.label}:`, error);
        skippedCarModels++;
      }
    }
    
    // Importar modelos de motos
    console.log('🏍️ Importing motorcycle models...');
    for (const model of modelsData.motorcycleModels) {
      try {
        if (!model || !model.value || !model.label || !model.brandSlug) {
          skippedMotorcycleModels++;
          continue;
        }
        
        // Buscar la marca
        const brand = await prisma.brand.findUnique({
          where: { slug: model.brandSlug }
        });
        
        if (!brand) {
          console.warn(`⚠️ Brand not found: ${model.brandSlug} for model ${model.label}`);
          brandNotFoundErrors++;
          skippedMotorcycleModels++;
          continue;
        }
        
        // Verificar si el modelo ya existe
        const existingModel = await prisma.model.findFirst({
          where: {
            slug: model.value,
            brandId: brand.id
          }
        });
        
        if (existingModel) {
          skippedMotorcycleModels++;
        } else {
          await prisma.model.create({
            data: {
              name: model.label,
              slug: model.value,
              brandId: brand.id
            }
          });
          importedMotorcycleModels++;
          if (importedMotorcycleModels % 100 === 0) {
            console.log(`🏍️ Imported ${importedMotorcycleModels} motorcycle models...`);
          }
        }
      } catch (error) {
        console.error(`❌ Error importing motorcycle model ${model?.label}:`, error);
        skippedMotorcycleModels++;
      }
    }
    
    // Obtener estadísticas finales
    const totalModels = await prisma.model.count();
    
    console.log('✅ Models import completed successfully');
    
    return res.json({
      success: true,
      message: 'Models imported successfully',
      data: {
        totalModels,
        importedCarModels,
        importedMotorcycleModels,
        skippedCarModels,
        skippedMotorcycleModels,
        brandNotFoundErrors,
        importedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error importing models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/brands/models-status - Verificar estado de modelos por marca
router.get('/models-status', async (req, res) => {
  try {
    console.log('📊 GET /brands/models-status - Verificando estado de modelos');
    
    const brands = await prisma.brand.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        vehicleTypes: true,
        _count: {
          select: { models: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const brandsWithModels = brands.filter(brand => brand._count.models > 0);
    const brandsWithoutModels = brands.filter(brand => brand._count.models === 0);
    
    const carBrandsWithoutModels = brandsWithoutModels.filter(brand => 
      brand.vehicleTypes.includes('car')
    );
    
    const motorcycleBrandsWithoutModels = brandsWithoutModels.filter(brand => 
      brand.vehicleTypes.includes('motorcycle')
    );
    
    console.log(`📈 Total brands: ${brands.length}`);
    console.log(`✅ Brands with models: ${brandsWithModels.length}`);
    console.log(`❌ Brands without models: ${brandsWithoutModels.length}`);
    console.log(`🚗 Car brands without models: ${carBrandsWithoutModels.length}`);
    console.log(`🏍️ Motorcycle brands without models: ${motorcycleBrandsWithoutModels.length}`);
    
    return res.json({
      success: true,
      data: {
        summary: {
          totalBrands: brands.length,
          brandsWithModels: brandsWithModels.length,
          brandsWithoutModels: brandsWithoutModels.length,
          carBrandsWithoutModels: carBrandsWithoutModels.length,
          motorcycleBrandsWithoutModels: motorcycleBrandsWithoutModels.length
        },
        brandsWithModels: brandsWithModels.map(brand => ({
          name: brand.name,
          slug: brand.slug,
          vehicleTypes: brand.vehicleTypes,
          modelCount: brand._count.models
        })),
        brandsWithoutModels: brandsWithoutModels.map(brand => ({
          name: brand.name,
          slug: brand.slug,
          vehicleTypes: brand.vehicleTypes,
          modelCount: 0
        })),
        carBrandsWithoutModels: carBrandsWithoutModels.map(brand => ({
          name: brand.name,
          slug: brand.slug
        })),
        motorcycleBrandsWithoutModels: motorcycleBrandsWithoutModels.map(brand => ({
          name: brand.name,
          slug: brand.slug
        }))
      }
    });
    
  } catch (error) {
    console.error('❌ Error checking models status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check models status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/brands/:brandSlug/sync-models - Sincronizar modelos de una marca desde API externa
router.post('/:brandSlug/sync-models', async (req, res) => {
  try {
    const { brandSlug } = req.params;
    const { clearExisting = false } = req.body;
    
    console.log(`🔄 POST /brands/${brandSlug}/sync-models - Sincronizando modelos`);
    
    // Verificar que la marca existe
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    });
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        error: `Brand with slug '${brandSlug}' not found`
      });
    }

    // Limpiar modelos existentes si se solicita
    if (clearExisting) {
      console.log(`🗑️ Clearing existing models for brand: ${brand.name}`);
      await prisma.model.deleteMany({
        where: { brandId: brand.id }
      });
    }

    // Determinar qué endpoints consultar según los tipos de vehículo de la marca
    const hasCars = brand.vehicleTypes.includes('car');
    const hasMotorcycles = brand.vehicleTypes.includes('motorcycle');
    
    let allExternalModels: ExternalModel[] = [];
    let totalFromApis = 0;
    
    // Consultar endpoint de coches si la marca tiene coches
    if (hasCars) {
      try {
        const carApiUrl = `https://api.motoraldia.com/wp-json/api-motor/v1/marques-cotxe?marca=${brandSlug}`;
        console.log(`🚗 Fetching car models from: ${carApiUrl}`);
        
        const carResponse = await axios.get(carApiUrl);
        console.log('🔍 Car API response:', carResponse.data);
        
        if (carResponse.data && carResponse.data.status === 'success' && Array.isArray(carResponse.data.data)) {
          allExternalModels = [...allExternalModels, ...carResponse.data.data];
          totalFromApis += carResponse.data.total || carResponse.data.data.length;
          console.log(`✅ Added ${carResponse.data.data.length} car models`);
        }
      } catch (error) {
        console.log('⚠️ Error fetching car models:', error);
      }
    }
    
    // Consultar endpoint de motos si la marca tiene motos
    if (hasMotorcycles) {
      try {
        const motoApiUrl = `https://api.motoraldia.com/wp-json/api-motor/v1/marques-moto?marca=${brandSlug}`;
        console.log(`🏍️ Fetching motorcycle models from: ${motoApiUrl}`);
        
        const motoResponse = await axios.get(motoApiUrl);
        console.log('🔍 Motorcycle API response:', motoResponse.data);
        
        if (motoResponse.data && motoResponse.data.status === 'success' && Array.isArray(motoResponse.data.data)) {
          allExternalModels = [...allExternalModels, ...motoResponse.data.data];
          totalFromApis += motoResponse.data.total || motoResponse.data.data.length;
          console.log(`✅ Added ${motoResponse.data.data.length} motorcycle models`);
        }
      } catch (error) {
        console.log('⚠️ Error fetching motorcycle models:', error);
      }
    }
    
    // Verificar que tengamos modelos para importar
    if (allExternalModels.length === 0) {
      console.log('❌ No models found in any API endpoint');
      return res.json({
        success: false,
        message: `No models found for brand ${brand.name} in external APIs`,
        data: {
          brandName: brand.name,
          brandSlug: brand.slug,
          importedCount: 0,
          skippedCount: 0,
          totalFromApi: 0,
          syncedAt: new Date().toISOString(),
          checkedEndpoints: { cars: hasCars, motorcycles: hasMotorcycles }
        }
      });
    }
    
    const externalModels = allExternalModels;
    
    console.log(`📥 Received ${externalModels.length} models from external API`);
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const modelData of externalModels) {
      try {
        // Normalizar datos del modelo
        const modelName = modelData.label || modelData.name || modelData.value;
        const modelSlug = modelData.value || modelData.slug || modelName?.toLowerCase().replace(/\s+/g, '-');
        
        if (!modelName || !modelSlug) {
          console.warn('⚠️ Invalid model data:', modelData);
          skippedCount++;
          continue;
        }
        
        // Verificar si el modelo ya existe
        const existingModel = await prisma.model.findFirst({
          where: {
            slug: modelSlug,
            brandId: brand.id
          }
        });
        
        if (existingModel && !clearExisting) {
          skippedCount++;
          continue;
        }
        
        // Crear o actualizar modelo
        if (existingModel && clearExisting) {
          await prisma.model.update({
            where: { id: existingModel.id },
            data: {
              name: modelName,
              slug: modelSlug
            }
          });
        } else {
          await prisma.model.create({
            data: {
              name: modelName,
              slug: modelSlug,
              brandId: brand.id
            }
          });
        }
        
        importedCount++;
        
      } catch (error) {
        console.error(`❌ Error processing model:`, modelData, error);
        skippedCount++;
      }
    }
    
    console.log(`✅ Sync completed: ${importedCount} imported, ${skippedCount} skipped`);
    
    return res.json({
      success: true,
      message: `Successfully synced ${importedCount} models for ${brand.name}`,
      data: {
        brandName: brand.name,
        brandSlug: brand.slug,
        importedCount,
        skippedCount,
        totalFromApi: totalFromApis,
        totalProcessed: externalModels.length,
        syncedAt: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Error syncing models from external API:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync models from external API',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;