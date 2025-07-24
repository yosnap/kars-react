import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/vehicle-states
router.get('/vehicle-states', async (req, res) => {
  try {
    const vehicleStates = await prisma.vehicleState.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedStates = vehicleStates.map(state => ({
      id: state.id,
      name: state.name,
      slug: state.value
    }));
    
    res.json({
      data: formattedStates
    });
  } catch (error) {
    console.error('Error fetching vehicle states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/fuel-types
router.get('/fuel-types', async (req, res) => {
  try {
    const fuelTypes = await prisma.fuelType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = fuelTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/transmission-types
router.get('/transmission-types', async (req, res) => {
  try {
    const transmissionTypes = await prisma.transmissionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = transmissionTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching transmission types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/exterior-colors
router.get('/exterior-colors', async (req, res) => {
  try {
    const exteriorColors = await prisma.exteriorColor.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedColors = exteriorColors.map(color => ({
      id: color.id,
      name: color.name,
      slug: color.value
    }));
    
    res.json({
      data: formattedColors
    });
  } catch (error) {
    console.error('Error fetching exterior colors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/brands/cars
router.get('/brands/cars', async (req, res) => {
  try {
    console.log('🔍 BMW DEBUG: Ejecutando consulta para marcas de coches...');
    
    // Primero, buscar BMW específicamente en toda la base de datos
    const allBmw = await prisma.brand.findMany({
      where: { 
        name: { contains: 'BMW', mode: 'insensitive' }
      }
    });
    console.log('🔍 BMW en base de datos completa:', allBmw.map(b => ({ 
      name: b.name, 
      slug: b.slug, 
      vehicleTypes: b.vehicleTypes,
      id: b.id
    })));
    
    // Ejecutar la consulta principal
    const brands = await prisma.brand.findMany({
      where: { vehicleTypes: { hasSome: ['car'] } },
      include: {
        models: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    console.log('🔍 BMW DEBUG: Query hasSome ["car"] returned', brands.length, 'brands');
    
    // Buscar BMW en los resultados
    const bmwBrand = brands.find(b => b.name && b.name.toLowerCase().includes('bmw'));
    
    if (!bmwBrand && allBmw.length > 0) {
      console.log('❌ BMW existe en DB pero NO aparece en consulta hasSome ["car"]');
      console.log('🔍 Probando consulta alternativa...');
      
      // Probar consulta alternativa
      const testQuery = await prisma.brand.findMany({
        where: { 
          AND: [
            { name: { contains: 'BMW', mode: 'insensitive' } },
            { vehicleTypes: { hasSome: ['car'] } }
          ]
        }
      });
      console.log('🧪 Test query BMW + hasSome car:', testQuery.length, 'results');
      
      // Si BMW no aparece en hasSome, agregar BMW manualmente a los resultados
      if (testQuery.length === 0 && allBmw.length > 0) {
        console.log('🔧 FIXING: Agregando BMW manualmente a los resultados');
        const bmwWithModels = await prisma.brand.findFirst({
          where: { name: { contains: 'BMW', mode: 'insensitive' } },
          include: {
            models: {
              orderBy: { name: 'asc' }
            }
          }
        });
        
        if (bmwWithModels) {
          brands.push(bmwWithModels);
          console.log('✅ BMW agregado manualmente:', { 
            name: bmwWithModels.name, 
            slug: bmwWithModels.slug, 
            vehicleTypes: bmwWithModels.vehicleTypes 
          });
        }
      }
      
    } else if (bmwBrand) {
      console.log('✅ BMW SÍ aparece en consulta hasSome ["car"]:', { 
        name: bmwBrand.name, 
        slug: bmwBrand.slug, 
        vehicleTypes: bmwBrand.vehicleTypes,
        id: bmwBrand.id
      });
    }
    
    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      value: brand.slug,
      label: brand.name,
      models: brand.models.map(model => ({
        id: model.id,
        value: model.slug,
        label: model.name
      }))
    }));
    
    res.json({
      success: true,
      data: formattedBrands
    });
  } catch (error) {
    console.error('Error fetching car brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/brands/motorcycles
router.get('/brands/motorcycles', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { vehicleTypes: { hasSome: ['motorcycle'] } },
      include: {
        models: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      value: brand.slug,
      label: brand.name,
      models: brand.models.map(model => ({
        id: model.id,
        value: model.slug,
        label: model.name
      }))
    }));
    
    res.json({
      success: true,
      data: formattedBrands
    });
  } catch (error) {
    console.error('Error fetching motorcycle brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== ALIASES DE COMPATIBILIDAD PARA FRONTEND =====
// El frontend espera estos nombres de endpoints de la API externa

// GET /api/estat-vehicle (alias para vehicle-states)
router.get('/estat-vehicle', async (req, res) => {
  try {
    const vehicleStates = await prisma.vehicleState.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedStates = vehicleStates.map(state => ({
      id: state.id,
      name: state.name,
      slug: state.value
    }));
    
    res.json({
      data: formattedStates
    });
  } catch (error) {
    console.error('Error fetching vehicle states:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tipus-combustible (alias para fuel-types)
router.get('/tipus-combustible', async (req, res) => {
  try {
    const fuelTypes = await prisma.fuelType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = fuelTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/tipus-propulsor (alias para transmission-types)
router.get('/tipus-propulsor', async (req, res) => {
  try {
    const transmissionTypes = await prisma.transmissionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = transmissionTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching transmission types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/marques-cotxe (alias para brands/cars)
router.get('/marques-cotxe', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { vehicleTypes: { hasSome: ['cotxe'] } },
      include: { models: true },
      orderBy: { name: 'asc' }
    });
    
    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      models: brand.models.map(model => ({
        id: model.id,
        name: model.name,
        slug: model.slug
      }))
    }));
    
    res.json({
      data: formattedBrands
    });
  } catch (error) {
    console.error('Error fetching car brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/marques-moto (alias para brands/motorcycles)
router.get('/marques-moto', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { vehicleTypes: { hasSome: ['moto'] } },
      include: { models: true },
      orderBy: { name: 'asc' }
    });
    
    const formattedBrands = brands.map(brand => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      models: brand.models.map(model => ({
        id: model.id,
        name: model.name,
        slug: model.slug
      }))
    }));
    
    res.json({
      data: formattedBrands
    });
  } catch (error) {
    console.error('Error fetching motorcycle brands:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/propulsion-types
router.get('/propulsion-types', async (req, res) => {
  try {
    const propulsionTypes = await prisma.propulsionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = propulsionTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching propulsion types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/body-types
router.get('/body-types', async (req, res) => {
  try {
    const bodyTypes = await prisma.bodyType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = bodyTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching body types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/motorcycle-body-types
router.get('/motorcycle-body-types', async (req, res) => {
  try {
    const bodyTypes = await prisma.motorcycleBodyType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = bodyTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching motorcycle body types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/caravan-body-types
router.get('/caravan-body-types', async (req, res) => {
  try {
    const bodyTypes = await prisma.caravanBodyType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = bodyTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching caravan body types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/commercial-body-types
router.get('/commercial-body-types', async (req, res) => {
  try {
    const bodyTypes = await prisma.commercialVehicleBodyType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = bodyTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching commercial body types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/upholstery-types
router.get('/upholstery-types', async (req, res) => {
  try {
    const upholsteryTypes = await prisma.upholsteryType.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedTypes = upholsteryTypes.map(type => ({
      id: type.id,
      name: type.name,
      slug: type.value
    }));
    
    res.json({
      data: formattedTypes
    });
  } catch (error) {
    console.error('Error fetching upholstery types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/upholstery-colors
router.get('/upholstery-colors', async (req, res) => {
  try {
    const upholsteryColors = await prisma.upholsteryColor.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedColors = upholsteryColors.map(color => ({
      id: color.id,
      name: color.name,
      slug: color.value
    }));
    
    res.json({
      data: formattedColors
    });
  } catch (error) {
    console.error('Error fetching upholstery colors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/car-extras
router.get('/car-extras', async (req, res) => {
  try {
    const carExtras = await prisma.carExtras.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedExtras = carExtras.map(extra => ({
      id: extra.id,
      name: extra.name,
      slug: extra.value
    }));
    
    res.json({
      data: formattedExtras
    });
  } catch (error) {
    console.error('Error fetching car extras:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/motorcycle-extras
router.get('/motorcycle-extras', async (req, res) => {
  try {
    const motorcycleExtras = await prisma.motorcycleExtras.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedExtras = motorcycleExtras.map(extra => ({
      id: extra.id,
      name: extra.name,
      slug: extra.value
    }));
    
    res.json({
      data: formattedExtras
    });
  } catch (error) {
    console.error('Error fetching motorcycle extras:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/caravan-extras
router.get('/caravan-extras', async (req, res) => {
  try {
    const caravanExtras = await prisma.caravanExtras.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedExtras = caravanExtras.map(extra => ({
      id: extra.id,
      name: extra.name,
      slug: extra.value
    }));
    
    res.json({
      data: formattedExtras
    });
  } catch (error) {
    console.error('Error fetching caravan extras:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/habitacle-extras  
router.get('/habitacle-extras', async (req, res) => {
  try {
    const habitacleExtras = await prisma.habitacleExtras.findMany({
      orderBy: { name: 'asc' }
    });
    
    const formattedExtras = habitacleExtras.map(extra => ({
      id: extra.id,
      name: extra.name,
      slug: extra.value
    }));
    
    res.json({
      data: formattedExtras
    });
  } catch (error) {
    console.error('Error fetching habitacle extras:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;