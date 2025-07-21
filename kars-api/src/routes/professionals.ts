import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const router = Router();
const prisma = new PrismaClient();

// GET /api/professionals
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Obtener profesionales de la base de datos local (ya sincronizados)
    const professionals = await prisma.user.findMany({
      where: {
        role: 'professional',
        activeVehicles: { gt: 0 } // Solo profesionales con vehículos activos
      },
      orderBy: {
        activeVehicles: 'desc' // Ordenar por número de vehículos activos
      },
      skip: offset,
      take: limit
    });

    const total = await prisma.user.count({
      where: {
        role: 'professional',
        activeVehicles: { gt: 0 }
      }
    });

    // Formatear profesionales con todos los campos sincronizados
    const formattedProfessionals = professionals.map(prof => ({
      id: prof.originalUserId || prof.id,
      name: prof.name || prof.username,
      phone: prof.telefonComercial || prof.telefonWhatsapp || prof.telefonMobile || '',
      email: prof.email,
      website: prof.website || '',
      address: prof.address || '',
      vehicleCount: prof.activeVehicles,
      // Usar el logo de empresa home como avatar principal
      avatar: prof.logoEmpresaHome || prof.logoEmpresa || `https://ui-avatars.com/api/?name=${encodeURIComponent(prof.name || prof.username)}&background=0D1B2A&color=fff&size=200`,
      username: prof.username,
      company: prof.nomEmpresa || prof.name,
      location: prof.localitat || '',
      // Campos adicionales de empresa
      logoEmpresa: prof.logoEmpresa,
      logoEmpresaHome: prof.logoEmpresaHome,
      telefonComercial: prof.telefonComercial,
      telefonWhatsapp: prof.telefonWhatsapp,
      nomContacte: prof.nomContacte,
      cognomsContacte: prof.cognomsContacte,
      descripcioEmpresa: prof.descripcioEmpresa,
      galeriaProfessionals: prof.galeriaProfessionals || [],
      registeredDate: prof.registeredDate
    }));

    return res.json({
      data: formattedProfessionals,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching professionals:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/professionals/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar profesional en la base de datos local
    const professional = await prisma.user.findFirst({
      where: { 
        OR: [
          { originalUserId: id },
          { id: id }
        ],
        role: 'professional'
      }
    });

    if (!professional) {
      return res.status(404).json({ error: 'Professional not found' });
    }

    // Buscar vehículos localmente por professionalId
    const vehicles = await prisma.vehicle.findMany({
      where: {
        professionalId: professional.originalUserId || professional.id,
        anunciActiu: true
      },
      orderBy: { dataCreacio: 'desc' }
    });

    // Formatear respuesta del profesional con todos los datos sincronizados
    const formattedProfessional = {
      id: professional.originalUserId || professional.id,
      name: professional.name || professional.username,
      phone: professional.telefonComercial || professional.telefonWhatsapp || professional.telefonMobile || '',
      email: professional.email,
      website: professional.website || '',
      address: professional.address || '',
      description: professional.descripcioEmpresa || '',
      location: professional.localitat || '',
      contact: professional.nomContacte || '',
      contactSurname: professional.cognomsContacte || '',
      company: professional.nomEmpresa || professional.name,
      vehicleCount: vehicles.length,
      avatar: professional.logoEmpresa || professional.logoEmpresaHome || '',
      logoEmpresa: professional.logoEmpresa,
      logoEmpresaHome: professional.logoEmpresaHome,
      gallery: professional.galeriaProfessionals || [],
      telefonComercial: professional.telefonComercial,
      telefonWhatsapp: professional.telefonWhatsapp,
      registeredDate: professional.registeredDate
    };

    // Formatear vehículos
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      slug: vehicle.slug,
      title: vehicle.titolAnunci,
      price: vehicle.preu?.toString() || '',
      mileage: vehicle.quilometratge?.toString() || '',
      year: vehicle.any?.toString() || '',
      brand: vehicle.marcaCotxe || vehicle.marcaMoto || '',
      model: vehicle.modelsCotxe || vehicle.modelsMoto || '',
      images: vehicle.galeriaVehicleUrls || [],
      vehicleType: vehicle.tipusVehicle
    }));

    return res.json({
      professional: formattedProfessional,
      vehicles: formattedVehicles,
      total: vehicles.length
    });
  } catch (error) {
    console.error('Error fetching professional:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/professionals/:id/vehicles
router.get('/:id/vehicles', async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const vehicles = await prisma.vehicle.findMany({
      where: {
        professionalId: id,
        anunciActiu: true
      },
      skip: offset,
      take: limit,
      orderBy: { dataCreacio: 'desc' }
    });

    const total = await prisma.vehicle.count({
      where: {
        professionalId: id,
        anunciActiu: true
      }
    });

    const pages = Math.ceil(total / limit);

    // Formatear vehículos para la respuesta
    const formattedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      slug: vehicle.slug,
      title: vehicle.titolAnunci,
      price: vehicle.preu?.toString() || '',
      mileage: vehicle.quilometratge?.toString() || '',
      year: vehicle.any?.toString() || '',
      brand: vehicle.marcaCotxe || vehicle.marcaMoto || '',
      model: vehicle.modelsCotxe || vehicle.modelsMoto || '',
      images: vehicle.galeriaVehicleUrls || [],
      vehicleType: vehicle.tipusVehicle,
      createdAt: vehicle.dataCreacio
    }));

    return res.json({
      items: formattedVehicles,
      total,
      pages,
      currentPage: page
    });
  } catch (error) {
    console.error('Error fetching professional vehicles:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


export default router;