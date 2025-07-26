import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/types/emissions - Obtener tipos de emisiones
router.get('/emissions', async (req, res) => {
  try {
    const emissions = await prisma.emissionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: emissions.map(emission => ({
        value: emission.value,
        label: emission.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching emission types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching emission types'
    });
  }
});

// GET /api/types/upholstery - Obtener tipos de tapicería
router.get('/upholstery', async (req, res) => {
  try {
    const upholsteryTypes = await prisma.upholsteryType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: upholsteryTypes.map(type => ({
        value: type.value,
        label: type.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching upholstery types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching upholstery types'
    });
  }
});

// GET /api/types/upholstery-colors - Obtener colores de tapicería
router.get('/upholstery-colors', async (req, res) => {
  try {
    const colors = await prisma.upholsteryColor.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Mapa de colores de tapicería con códigos reales
    const colorMap: { [key: string]: string } = {
      'tapisseria-bicolor': 'linear-gradient(45deg, #2D3748 50%, #FFFFFF 50%)',
      'tapisseria-blanc': '#FFFFFF',
      'tapisseria-blau': '#3182CE',
      'tapisseria-bordeus': '#8B0000',
      'tapisseria-camel': '#C19A6B',
      'tapisseria-granat': '#800020',
      'tapisseria-gris': '#718096',
      'tapisseria-groc': '#ECC94B',
      'tapisseria-lila': '#9F7AEA',
      'tapisseria-marro': '#8B4513',
      'tapisseria-negre': '#2D3748',
      'tapisseria-taronja': '#ED8936',
      'tapisseria-verd': '#38A169',
      'tapisseria-vermell': '#E53E3E',
      'altres': '#A0AEC0',
      'antracita': '#36454F',
      'beige': '#F5F5DC'
    };
    
    return res.json({
      success: true,
      data: colors.map(color => ({
        value: color.value,
        label: color.name,
        color: colorMap[color.value] || '#9CA3AF',
      }))
    });
  } catch (error) {
    console.error('Error fetching upholstery colors:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching upholstery colors'
    });
  }
});

// GET /api/types/exterior-colors - Obtener colores exteriores
router.get('/exterior-colors', async (req, res) => {
  try {
    const colors = await prisma.exteriorColor.findMany({
      orderBy: { name: 'asc' }
    });
    
    // Mapa de colores exteriores con códigos reales
    const colorMap: { [key: string]: string } = {
      'bicolor': 'linear-gradient(45deg, #2D3748 50%, #FFFFFF 50%)',
      'blanc': '#FFFFFF',
      'blau': '#3182CE',
      'bordeus': '#8B0000',
      'camel': '#C19A6B',
      'daurate': '#FFD700',
      'granat': '#800020',
      'gris': '#718096',
      'groc': '#ECC94B',
      'lila': '#9F7AEA',
      'marro': '#8B4513',
      'negre': '#2D3748',
      'rosa': '#F687B3',
      'taronja': '#ED8936',
      'verd': '#38A169',
      'vermell': '#E53E3E',
      'altres': '#A0AEC0',
      'antracita': '#36454F',
      'beige': '#F5F5DC'
    };
    
    return res.json({
      success: true,
      data: colors.map(color => ({
        value: color.value,
        label: color.name,
        color: colorMap[color.value] || '#9CA3AF',
      }))
    });
  } catch (error) {
    console.error('Error fetching exterior colors:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching exterior colors'
    });
  }
});

// GET /api/types/battery - Obtener tipos de batería
router.get('/battery', async (req, res) => {
  try {
    const batteryTypes = await prisma.batteryType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: batteryTypes.map(type => ({
        value: type.value,
        label: type.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching battery types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching battery types'
    });
  }
});

// GET /api/types/charging-speed - Obtener velocidades de recarga
router.get('/charging-speed', async (req, res) => {
  try {
    const chargingSpeeds = await prisma.chargingSpeed.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: chargingSpeeds.map(speed => ({
        value: speed.value,
        label: speed.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching charging speeds:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching charging speeds'
    });
  }
});

// GET /api/types/fuel - Obtener tipos de combustible
router.get('/fuel', async (req, res) => {
  try {
    const fuelTypes = await prisma.fuelType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: fuelTypes.map(fuel => ({
        value: fuel.value,
        label: fuel.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching fuel types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching fuel types'
    });
  }
});

// GET /api/types/propulsion - Obtener tipos de propulsión
router.get('/propulsion', async (req, res) => {
  try {
    const propulsionTypes = await prisma.propulsionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: propulsionTypes.map(propulsion => ({
        value: propulsion.value,
        label: propulsion.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching propulsion types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching propulsion types'
    });
  }
});

// GET /api/types/transmission - Obtener tipos de transmisión
router.get('/transmission', async (req, res) => {
  try {
    const transmissionTypes = await prisma.transmissionType.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: transmissionTypes.map(transmission => ({
        value: transmission.value,
        label: transmission.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching transmission types:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching transmission types'
    });
  }
});

// GET /api/types/vehicle-state - Obtener estados de vehículo
router.get('/vehicle-state', async (req, res) => {
  try {
    const vehicleStates = await prisma.vehicleState.findMany({
      orderBy: { name: 'asc' }
    });
    
    return res.json({
      success: true,
      data: vehicleStates.map(state => ({
        value: state.value,
        label: state.name,
      }))
    });
  } catch (error) {
    console.error('Error fetching vehicle states:', error);
    return res.status(500).json({
      success: false,
      error: 'Error fetching vehicle states'
    });
  }
});

export default router;