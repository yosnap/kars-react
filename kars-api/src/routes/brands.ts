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
    console.log('🔍 GET /brands/cars - Obteniendo marcas de coches/autocaravanas/comerciales');
    
    const brands = await prisma.brand.findMany({
      where: {
        vehicleType: 'car'
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleType: true
      }
    });

    console.log(`✅ Found ${brands.length} car brands`);

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
    console.log('🔍 GET /brands/motorcycles - Obteniendo marcas de motos');
    
    const brands = await prisma.brand.findMany({
      where: {
        vehicleType: 'motorcycle'
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleType: true
      }
    });

    console.log(`✅ Found ${brands.length} motorcycle brands`);

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
    
    const whereCondition = type ? { vehicleType: type as string } : {};
    
    const brands = await prisma.brand.findMany({
      where: whereCondition,
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true,
        vehicleType: true
      }
    });

    console.log(`✅ Found ${brands.length} brands`);

    return res.json({
      success: true,
      total: brands.length,
      data: brands.map(brand => ({
        value: brand.slug,
        label: brand.name,
        type: brand.vehicleType
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

// POST /api/brands - Crear nueva marca (solo admin)
router.post('/', async (req, res) => {
  try {
    console.log('🚀 POST /brands - Creando nueva marca');
    
    const { name, slug, vehicleType } = req.body;

    // Validación básica
    if (!name || !slug || !vehicleType) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, slug, vehicleType'
      });
    }

    // Validar vehicleType
    if (!['car', 'motorcycle'].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'vehicleType must be either "car" or "motorcycle"'
      });
    }

    // Verificar que no existe una marca con el mismo slug
    const existingBrand = await prisma.brand.findUnique({
      where: { slug }
    });

    if (existingBrand) {
      return res.status(409).json({
        success: false,
        error: 'Brand with this slug already exists'
      });
    }

    const newBrand = await prisma.brand.create({
      data: {
        name,
        slug,
        vehicleType
      }
    });

    console.log(`✅ Brand created: ${newBrand.name} (${newBrand.vehicleType})`);

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: {
        value: newBrand.slug,
        label: newBrand.name,
        type: newBrand.vehicleType
      }
    });

  } catch (error) {
    console.error('❌ Error creating brand:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create brand',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/brands/:id - Actualizar marca (solo admin)
router.put('/:id', async (req, res) => {
  try {
    console.log(`🔄 PUT /brands/${req.params.id} - Actualizando marca`);
    
    const { id } = req.params;
    const { name, slug, vehicleType } = req.body;

    // Verificar que la marca existe
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Validar vehicleType si se proporciona
    if (vehicleType && !['car', 'motorcycle'].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'vehicleType must be either "car" or "motorcycle"'
      });
    }

    // Si se está cambiando el slug, verificar que no existe otro con el mismo slug
    if (slug && slug !== existingBrand.slug) {
      const brandWithSlug = await prisma.brand.findUnique({
        where: { slug }
      });

      if (brandWithSlug) {
        return res.status(409).json({
          success: false,
          error: 'Brand with this slug already exists'
        });
      }
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
        ...(vehicleType && { vehicleType })
      }
    });

    console.log(`✅ Brand updated: ${updatedBrand.name}`);

    return res.json({
      success: true,
      message: 'Brand updated successfully',
      data: {
        value: updatedBrand.slug,
        label: updatedBrand.name,
        type: updatedBrand.vehicleType
      }
    });

  } catch (error) {
    console.error('❌ Error updating brand:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update brand',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/brands/:id - Eliminar marca (solo admin)
router.delete('/:id', async (req, res) => {
  try {
    console.log(`🗑️ DELETE /brands/${req.params.id} - Eliminando marca`);
    
    const { id } = req.params;

    // Verificar que la marca existe
    const existingBrand = await prisma.brand.findUnique({
      where: { id }
    });

    if (!existingBrand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // TODO: Verificar si hay vehículos usando esta marca antes de eliminar
    
    await prisma.brand.delete({
      where: { id }
    });

    console.log(`✅ Brand deleted: ${existingBrand.name}`);

    return res.json({
      success: true,
      message: 'Brand deleted successfully'
    });

  } catch (error) {
    console.error('❌ Error deleting brand:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete brand',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/brands/import - Importar marcas masivamente (solo admin)
router.post('/import', async (req, res) => {
  try {
    console.log('📥 POST /brands/import - Importando marcas masivamente');
    
    const { brands, vehicleType, clearExisting = false } = req.body;

    if (!Array.isArray(brands)) {
      return res.status(400).json({
        success: false,
        error: 'brands must be an array'
      });
    }

    if (!vehicleType || !['car', 'motorcycle'].includes(vehicleType)) {
      return res.status(400).json({
        success: false,
        error: 'vehicleType must be either "car" or "motorcycle"'
      });
    }

    let imported = 0;
    let skipped = 0;

    // Si se solicita limpiar existentes
    if (clearExisting) {
      console.log(`🗑️ Eliminando marcas existentes de tipo ${vehicleType}`);
      await prisma.brand.deleteMany({
        where: { vehicleType }
      });
    }

    // Importar marcas
    for (const brand of brands) {
      try {
        const { value, label } = brand;
        
        if (!value || !label) {
          console.warn('⚠️ Marca inválida saltada:', brand);
          skipped++;
          continue;
        }

        // Verificar si ya existe
        const existing = await prisma.brand.findUnique({
          where: { slug: value }
        });

        if (existing) {
          console.log(`⏭️ Marca ya existe: ${label}`);
          skipped++;
          continue;
        }

        // Crear nueva marca
        await prisma.brand.create({
          data: {
            name: label,
            slug: value,
            vehicleType
          }
        });

        imported++;
        console.log(`✅ Marca importada: ${label}`);

      } catch (brandError) {
        console.error(`❌ Error importando marca ${brand.label}:`, brandError);
        skipped++;
      }
    }

    console.log(`📊 Importación completada: ${imported} importadas, ${skipped} saltadas`);

    return res.json({
      success: true,
      message: `Import completed: ${imported} imported, ${skipped} skipped`,
      data: {
        imported,
        skipped,
        total: brands.length,
        vehicleType
      }
    });

  } catch (error) {
    console.error('❌ Error importing brands:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import brands',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/brands/:brandSlug/models - Obtener modelos de una marca específica
router.get('/:brandSlug/models', async (req, res) => {
  try {
    const { brandSlug } = req.params;
    console.log(`🔍 GET /brands/${brandSlug}/models - Obteniendo modelos de la marca`);
    
    // Buscar la marca en la base de datos
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Obtener modelos desde la base de datos
    const models = await prisma.model.findMany({
      where: {
        brandId: brand.id
      },
      orderBy: {
        name: 'asc'
      },
      select: {
        id: true,
        slug: true,
        name: true
      }
    });

    console.log(`✅ Found ${models.length} models for brand ${brand.name}`);

    return res.json({
      success: true,
      brand: {
        slug: brand.slug,
        name: brand.name,
        vehicleType: brand.vehicleType
      },
      total: models.length,
      data: models.map(model => ({
        value: model.slug,
        label: model.name
      }))
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

// POST /api/brands/:brandSlug/sync-models - Sincronizar modelos desde API externa
router.post('/:brandSlug/sync-models', async (req, res) => {
  try {
    const { brandSlug } = req.params;
    const { clearExisting = false } = req.body;
    
    console.log(`🔄 POST /brands/${brandSlug}/sync-models - Sincronizando modelos desde API externa`);
    
    // Buscar la marca en la base de datos
    const brand = await prisma.brand.findUnique({
      where: { slug: brandSlug }
    });

    if (!brand) {
      return res.status(404).json({
        success: false,
        error: 'Brand not found'
      });
    }

    // Determinar el endpoint de la API según el tipo de vehículo
    let externalApiUrl;
    if (brand.vehicleType === 'car') {
      externalApiUrl = `https://api.motoraldia.com/wp-json/api-motor/v1/marques-cotxe?marca=${brandSlug}`;
    } else if (brand.vehicleType === 'motorcycle') {
      externalApiUrl = `https://api.motoraldia.com/wp-json/api-motor/v1/marques-moto?marca=${brandSlug}`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Model sync is only available for car and motorcycle brands'
      });
    }
    console.log(`📡 Calling external API: ${externalApiUrl}`);
    
    let externalModels: ExternalModel[] = [];
    try {
      const response = await axios.get(externalApiUrl, {
        timeout: 30000, // 30 segundos timeout
        headers: {
          'User-Agent': 'Kars.ad Model Sync',
          'Accept': 'application/json'
        }
      });
      
      if (response.data) {
        // La API devuelve un objeto con estructura {status, total, data}
        if (response.data.data && Array.isArray(response.data.data)) {
          externalModels = response.data.data;
        } else if (Array.isArray(response.data)) {
          // Fallback por si la API devuelve directamente un array
          externalModels = response.data;
        } else {
          console.warn(`⚠️ API returned unexpected format for brand ${brandSlug}:`, response.data);
        }
      }
    } catch (apiError) {
      console.error(`❌ Error calling external API for brand ${brandSlug}:`, apiError);
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch models from external API',
        details: apiError instanceof Error ? apiError.message : 'Unknown API error'
      });
    }

    let imported = 0;
    let skipped = 0;

    // Si se solicita limpiar existentes
    if (clearExisting) {
      console.log(`🗑️ Eliminando modelos existentes para marca ${brand.name}`);
      await prisma.model.deleteMany({
        where: { brandId: brand.id }
      });
    }

    // Importar modelos
    for (const modelData of externalModels) {
      try {
        // Extraer value y label del modelo
        const value = modelData.value || modelData.slug;
        const label = modelData.label || modelData.name;
        
        if (!value || !label) {
          console.warn('⚠️ Modelo inválido saltado:', modelData);
          skipped++;
          continue;
        }

        // Verificar si ya existe
        const existing = await prisma.model.findFirst({
          where: { 
            brandId: brand.id,
            slug: value
          }
        });

        if (existing) {
          console.log(`⏭️ Modelo ya existe: ${label}`);
          skipped++;
          continue;
        }

        // Crear nuevo modelo
        await prisma.model.create({
          data: {
            name: label,
            slug: value,
            brandId: brand.id
          }
        });

        imported++;
        console.log(`✅ Modelo importado: ${label}`);

      } catch (modelError) {
        console.error(`❌ Error importando modelo ${modelData.label}:`, modelError);
        skipped++;
      }
    }

    console.log(`📊 Sincronización completada para ${brand.name}: ${imported} importados, ${skipped} saltados`);

    return res.json({
      success: true,
      message: `Model sync completed for ${brand.name}: ${imported} imported, ${skipped} skipped`,
      data: {
        brand: {
          slug: brand.slug,
          name: brand.name
        },
        imported,
        skipped,
        total: externalModels.length
      }
    });

  } catch (error) {
    console.error('❌ Error syncing models:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;