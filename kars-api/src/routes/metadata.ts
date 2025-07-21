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
    // Extraer colores únicos de los vehículos existentes
    const vehicles = await prisma.vehicle.findMany({
      select: { colorVehicle: true },
      where: { 
        colorVehicle: { not: null },
        anunciActiu: true // Solo vehículos activos
      }
    });
    
    const uniqueColors = [...new Set(vehicles
      .map(v => v.colorVehicle)
      .filter(color => color && color.trim() !== '')
    )];
    
    const formattedColors = uniqueColors.map((color, index) => ({
      id: index + 1,
      name: String(color || ''),
      slug: String(color || '').toLowerCase().replace(/\s+/g, '-') || ''
    }));
    
    res.json({
      data: formattedColors.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    });
  } catch (error) {
    console.error('Error fetching exterior colors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/brands/cars
router.get('/brands/cars', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { vehicleType: 'car' },
      include: {
        models: {
          orderBy: { name: 'asc' }
        }
      },
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

// GET /api/brands/motorcycles
router.get('/brands/motorcycles', async (req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      where: { vehicleType: 'motorcycle' },
      include: {
        models: {
          orderBy: { name: 'asc' }
        }
      },
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
      where: { vehicleType: 'cotxe' },
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
      where: { vehicleType: 'moto' },
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

export default router;