import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { startFullSync, startIncrementalSync, getSyncStatus, syncBrandsAndModels, syncVehicleStates, syncFuelTypes, syncTransmissionTypes, syncBodyTypes, syncMotorcycleBodyTypes, syncCaravanBodyTypes, syncCommercialVehicleBodyTypes, syncCarExtras, syncExteriorColors, syncUpholsteryTypes, syncUpholsteryColors, syncMotorcycleExtras, syncCaravanExtras, syncHabitacleExtras, syncUsers, syncBlogPosts, syncVehicle } from '../services/syncService';
import { mapVehicleToMotoraldiaPayload, cleanMotoraldiaPayload } from '../services/motoraldiaMapper';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación para sync (reutilizar del admin)
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  // Verificar si es super admin o admin regular
  const isSuperAdmin = username === process.env.SUPER_ADMIN_USER && password === process.env.SUPER_ADMIN_PASS;
  const isAdmin = username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
  
  if (!isSuperAdmin && !isAdmin) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  return next();
};

// Aplicar autenticación a rutas sensibles
router.use(['/manual', '/full', '/incremental', '/stop'], authenticateAdmin);

// GET /api/sync/status - Estado actual de sincronización
router.get('/status', async (req, res) => {
  try {
    const status = await getSyncStatus();
    return res.json(status);
  } catch (error) {
    console.error('Error getting sync status:', error);
    return res.status(500).json({ error: 'Failed to get sync status' });
  }
});

// POST /api/sync/manual - Sincronización manual completa
router.post('/manual', async (req, res) => {
  try {
    const currentStatus = await getSyncStatus();
    
    if (currentStatus.isRunning) {
      return res.status(409).json({ 
        error: 'Sync already running',
        currentSync: currentStatus.currentSync
      });
    }

    const syncId = await startFullSync('manual');
    
    return res.json({
      message: 'Manual sync started',
      syncId,
      status: 'started'
    });

  } catch (error) {
    console.error('Error starting manual sync:', error);
    return res.status(500).json({ error: 'Failed to start manual sync' });
  }
});

// POST /api/sync/full - Sincronización completa (igual que manual)
router.post('/full', async (req, res) => {
  try {
    const currentStatus = await getSyncStatus();
    
    if (currentStatus.isRunning) {
      return res.status(409).json({ 
        error: 'Sync already running',
        currentSync: currentStatus.currentSync
      });
    }

    const syncId = await startFullSync('full');
    
    return res.json({
      message: 'Full sync started',
      syncId,
      status: 'started'
    });

  } catch (error) {
    console.error('Error starting full sync:', error);
    return res.status(500).json({ error: 'Failed to start full sync' });
  }
});

// POST /api/sync/incremental - Sincronización incremental
router.post('/incremental', async (req, res) => {
  try {
    const currentStatus = await getSyncStatus();
    
    if (currentStatus.isRunning) {
      return res.status(409).json({ 
        error: 'Sync already running',
        currentSync: currentStatus.currentSync
      });
    }

    const { since } = req.body;
    const syncId = await startIncrementalSync(since);
    
    return res.json({
      message: 'Incremental sync started',
      syncId,
      status: 'started'
    });

  } catch (error) {
    console.error('Error starting incremental sync:', error);
    return res.status(500).json({ error: 'Failed to start incremental sync' });
  }
});

// POST /api/sync/stop - Detener sincronización actual
router.post('/stop', async (req, res) => {
  try {
    const currentStatus = await getSyncStatus();
    
    if (!currentStatus.isRunning) {
      return res.status(400).json({ error: 'No sync currently running' });
    }

    // Actualizar el log como cancelado
    if (currentStatus.currentSync) {
      await prisma.syncLog.update({
        where: { id: currentStatus.currentSync.id },
        data: {
          status: 'failed',
          completedAt: new Date(),
          errorMessage: 'Manually stopped by admin'
        }
      });
    }

    return res.json({
      message: 'Sync stop requested',
      stoppedSyncId: currentStatus.currentSync?.id
    });

  } catch (error) {
    console.error('Error stopping sync:', error);
    return res.status(500).json({ error: 'Failed to stop sync' });
  }
});

// GET /api/sync/logs - Obtener todos los logs de sincronización
router.get('/logs', authenticateAdmin, async (req, res) => {
  try {
    const { page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        orderBy: { startedAt: 'desc' },
        skip: offset,
        take: limitNum,
        select: {
          id: true,
          type: true,
          status: true,
          startedAt: true,
          completedAt: true,
          vehiclesProcessed: true,
          vehiclesCreated: true,
          vehiclesUpdated: true,
          vehiclesDeleted: true,
          errorMessage: true
        }
      }),
      prisma.syncLog.count()
    ]);

    const logsWithDuration = logs.map(log => ({
      ...log,
      duration: log.completedAt 
        ? log.completedAt.getTime() - log.startedAt.getTime()
        : null
    }));

    return res.json({
      logs: logsWithDuration,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
});

// GET /api/sync/logs/:id - Detalle de una sincronización específica
router.get('/logs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const syncLog = await prisma.syncLog.findUnique({
      where: { id }
    });

    if (!syncLog) {
      return res.status(404).json({ error: 'Sync log not found' });
    }

    return res.json({
      ...syncLog,
      duration: syncLog.completedAt 
        ? syncLog.completedAt.getTime() - syncLog.startedAt.getTime()
        : null
    });

  } catch (error) {
    console.error('Error fetching sync log:', error);
    return res.status(500).json({ error: 'Failed to fetch sync log' });
  }
});

// DELETE /api/sync/logs/:id - Eliminar un log específico
router.delete('/logs/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await prisma.syncLog.delete({
      where: { id }
    });

    return res.json({
      message: 'Sync log deleted successfully',
      deletedLog: {
        id: deletedLog.id,
        type: deletedLog.type,
        startedAt: deletedLog.startedAt
      }
    });

  } catch (error) {
    console.error('Error deleting sync log:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Sync log not found' });
    }
    return res.status(500).json({ error: 'Failed to delete sync log' });
  }
});

// DELETE /api/sync/logs - Eliminar múltiples logs o todos
router.delete('/logs', authenticateAdmin, async (req, res) => {
  try {
    const { ids, deleteAll } = req.body;

    if (deleteAll) {
      // Eliminar todos los logs
      const result = await prisma.syncLog.deleteMany({});
      
      return res.json({
        message: `All sync logs deleted successfully`,
        deletedCount: result.count
      });
    } else if (ids && Array.isArray(ids)) {
      // Eliminar logs específicos
      const result = await prisma.syncLog.deleteMany({
        where: {
          id: { in: ids }
        }
      });
      
      return res.json({
        message: `${result.count} sync logs deleted successfully`,
        deletedCount: result.count
      });
    } else {
      return res.status(400).json({ 
        error: 'Either provide ids array or set deleteAll to true' 
      });
    }

  } catch (error) {
    console.error('Error deleting sync logs:', error);
    return res.status(500).json({ error: 'Failed to delete sync logs' });
  }
});

// POST /api/sync/brands - Sincronizar marcas y modelos
router.post('/brands', authenticateAdmin, async (req, res) => {
  try {
    console.log('🏷️ Starting brands and models sync via API...');
    
    const result = await syncBrandsAndModels();
    
    return res.json({
      message: 'Brands and models sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing brands and models:', error);
    return res.status(500).json({ 
      error: 'Failed to sync brands and models',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/vehicle-states - Sincronizar estados de vehículos
router.post('/vehicle-states', authenticateAdmin, async (req, res) => {
  try {
    console.log('🏷️ Starting vehicle states sync via API...');
    
    const result = await syncVehicleStates();
    
    return res.json({
      message: 'Vehicle states sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing vehicle states:', error);
    return res.status(500).json({ 
      error: 'Failed to sync vehicle states',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/fuel-types - Sincronizar tipos de combustible
router.post('/fuel-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('⛽ Starting fuel types sync via API...');
    
    const result = await syncFuelTypes();
    
    return res.json({
      message: 'Fuel types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing fuel types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync fuel types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/transmission-types - Sincronizar tipos de transmisión
router.post('/transmission-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('⚙️ Starting transmission types sync via API...');
    
    const result = await syncTransmissionTypes();
    
    return res.json({
      message: 'Transmission types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing transmission types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync transmission types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/body-types - Sincronizar tipos de carrocería
router.post('/body-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚗 Starting body types sync via API...');
    
    const result = await syncBodyTypes();
    
    return res.json({
      message: 'Body types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing body types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync body types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/motorcycle-body-types - Sincronizar tipos de carrocería de motos
router.post('/motorcycle-body-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('🏍️ Starting motorcycle body types sync via API...');
    
    const result = await syncMotorcycleBodyTypes();
    
    return res.json({
      message: 'Motorcycle body types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing motorcycle body types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync motorcycle body types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/caravan-body-types - Sincronizar tipos de carrocería de autocaravanas
router.post('/caravan-body-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚐 Starting caravan body types sync via API...');
    
    const result = await syncCaravanBodyTypes();
    
    return res.json({
      message: 'Caravan body types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing caravan body types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync caravan body types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/commercial-body-types - Sincronizar tipos de carrocería de vehículos comerciales
router.post('/commercial-body-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚚 Starting commercial body types sync via API...');
    
    const result = await syncCommercialVehicleBodyTypes();
    
    return res.json({
      message: 'Commercial body types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing commercial body types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync commercial body types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/car-extras - Sincronizar extras de coches
router.post('/car-extras', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚗 Starting car extras sync via API...');
    
    const result = await syncCarExtras();
    
    return res.json({
      message: 'Car extras sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing car extras:', error);
    return res.status(500).json({ 
      error: 'Failed to sync car extras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/exterior-colors - Sincronizar colores exteriores
router.post('/exterior-colors', authenticateAdmin, async (req, res) => {
  try {
    console.log('🎨 Starting exterior colors sync via API...');
    
    const result = await syncExteriorColors();
    
    return res.json({
      message: 'Exterior colors sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing exterior colors:', error);
    return res.status(500).json({ 
      error: 'Failed to sync exterior colors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/upholstery-types - Sincronizar tipos de tapicería
router.post('/upholstery-types', authenticateAdmin, async (req, res) => {
  try {
    console.log('🪑 Starting upholstery types sync via API...');
    
    const result = await syncUpholsteryTypes();
    
    return res.json({
      message: 'Upholstery types sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing upholstery types:', error);
    return res.status(500).json({ 
      error: 'Failed to sync upholstery types',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/upholstery-colors - Sincronizar colores de tapicería
router.post('/upholstery-colors', authenticateAdmin, async (req, res) => {
  try {
    console.log('🎨 Starting upholstery colors sync via API...');
    
    const result = await syncUpholsteryColors();
    
    return res.json({
      message: 'Upholstery colors sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing upholstery colors:', error);
    return res.status(500).json({ 
      error: 'Failed to sync upholstery colors',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/motorcycle-extras - Sincronizar extras de motos
router.post('/motorcycle-extras', authenticateAdmin, async (req, res) => {
  try {
    console.log('🏍️ Starting motorcycle extras sync via API...');
    
    const result = await syncMotorcycleExtras();
    
    return res.json({
      message: 'Motorcycle extras sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing motorcycle extras:', error);
    return res.status(500).json({ 
      error: 'Failed to sync motorcycle extras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/caravan-extras - Sincronizar extras de caravanas
router.post('/caravan-extras', authenticateAdmin, async (req, res) => {
  try {
    console.log('🚐 Starting caravan extras sync via API...');
    
    const result = await syncCaravanExtras();
    
    return res.json({
      message: 'Caravan extras sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing caravan extras:', error);
    return res.status(500).json({ 
      error: 'Failed to sync caravan extras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/habitacle-extras - Sincronizar extras de habitáculo
router.post('/habitacle-extras', authenticateAdmin, async (req, res) => {
  try {
    console.log('🏠 Starting habitacle extras sync via API...');
    
    const result = await syncHabitacleExtras();
    
    return res.json({
      message: 'Habitacle extras sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing habitacle extras:', error);
    return res.status(500).json({ 
      error: 'Failed to sync habitacle extras',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/users - Sincronizar usuarios y profesionales
router.post('/users', authenticateAdmin, async (req, res) => {
  try {
    console.log('👥 Starting users sync via API...');
    
    const result = await syncUsers();
    
    return res.json({
      message: 'Users sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing users:', error);
    return res.status(500).json({ 
      error: 'Failed to sync users',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Webhook endpoint para recibir notificaciones de cambios
// POST /api/sync/webhook - Webhook para cambios en la API original
router.post('/webhook', async (req, res) => {
  try {
    const { event, vehicle_id, vehicle_slug } = req.body;
    
    console.log('Webhook received:', { event, vehicle_id, vehicle_slug });

    // Validar el webhook (aquí puedes añadir validación de firma)
    if (!event || !vehicle_slug) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Procesar según el tipo de evento
    switch (event) {
      case 'vehicle.created':
      case 'vehicle.updated':
        // Sincronizar este vehículo específico
        await startIncrementalSync(null, vehicle_slug);
        break;
      
      case 'vehicle.deleted':
        // Eliminar el vehículo de nuestra base de datos
        await prisma.vehicle.deleteMany({
          where: { slug: vehicle_slug }
        });
        break;
    }

    return res.json({ 
      message: 'Webhook processed successfully',
      event,
      processed_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// POST /api/sync/blog-posts - Sincronizar posts del blog
router.post('/blog-posts', authenticateAdmin, async (req, res) => {
  try {
    console.log('📚 Starting blog posts sync via API...');
    
    const { batchSize = 50 } = req.body;
    
    const result = await syncBlogPosts('manual', batchSize);
    
    return res.json({
      message: 'Blog posts sync completed',
      ...result
    });
    
  } catch (error) {
    console.error('Error syncing blog posts:', error);
    return res.status(500).json({ 
      error: 'Failed to sync blog posts',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/fix-vehicles - Corregir vehículos con datos nulos
router.post('/fix-vehicles', authenticateAdmin, async (req, res) => {
  try {
    console.log('🔧 Fixing vehicles with null originalId using raw MongoDB...');
    
    // Usar MongoDB directamente para actualizar registros con originalId null
    const mongoResult = await prisma.$runCommandRaw({
      update: 'Vehicle',
      updates: [
        {
          q: {
            $or: [
              { 'original_id': null },
              { 'original_id': '' },
              { 'original_id': 'unknown' },
              { 'original_id': { $exists: false } }
            ]
          },
          u: {
            $set: {
              'original_id': 'migrated_fixed'
            }
          },
          multi: true
        }
      ]
    });
    
    const result = { count: mongoResult.nModified || 0 };

    console.log(`✅ Fixed ${result.count} vehicles with null originalId`);

    return res.json({
      message: `Fixed ${result.count} vehicles with null originalId`,
      count: result.count
    });

  } catch (error) {
    console.error('❌ Error fixing vehicles:', error);
    return res.status(500).json({ 
      error: 'Failed to fix vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/vehicle/:slug - Actualizar imágenes de un vehículo existente
router.post('/vehicle/:slug', authenticateAdmin, async (req, res) => {
  try {
    const { slug } = req.params;
    const apiUrl = process.env.ORIGINAL_API_URL;
    const apiUser = process.env.ORIGINAL_API_USER;
    const apiPass = process.env.ORIGINAL_API_PASS;

    if (!apiUrl || !apiUser || !apiPass) {
      throw new Error('API credentials not configured');
    }

    console.log(`🔄 Updating images for existing vehicle: ${slug}`);

    // Verificar que el vehículo existe en la base de datos local usando solo el slug
    const existingVehicle = await prisma.vehicle.findFirst({
      where: { slug: slug },
      select: { 
        id: true, 
        slug: true, 
        imatgeDestacadaUrl: true, 
        galeriaVehicleUrls: true,
        estatVehicle: true,
        tipusCombustible: true,
        any: true
      }
    });

    if (!existingVehicle) {
      return res.status(404).json({ error: 'Vehicle not found in local database' });
    }

    // Obtener datos completos de la API externa
    const response = await axios.get(`${apiUrl}/vehicles`, {
      auth: { username: apiUser, password: apiPass },
      params: { slug: slug }
    });

    if (response.data.status !== 'success' || !response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found in external API' });
    }

    const externalData = response.data.items[0];
    
    // Actualizar directamente usando updateMany para evitar problemas con originalId
    await prisma.vehicle.updateMany({
      where: { slug: slug },
      data: {
        imatgeDestacadaUrl: externalData['imatge-destacada-url'] || null,
        galeriaVehicleUrls: externalData['galeria-vehicle-urls'] || [],
        lastSyncAt: new Date()
      }
    });

    console.log(`✅ Vehicle ${slug} updated with images`);

    return res.json({
      message: `Vehicle ${slug} successfully updated`,
      hasImages: !!externalData['imatge-destacada-url'],
      updatedFields: {
        imatgeDestacadaUrl: !!externalData['imatge-destacada-url'],
        galeriaVehicleUrls: (externalData['galeria-vehicle-urls'] || []).length,
        estatVehicle: !!externalData['estat-vehicle'],
        tipusCombustible: !!externalData['tipus-combustible'],
        any: !!externalData['any']
      }
    });

  } catch (error) {
    console.error(`❌ Error updating vehicle ${req.params.slug}:`, error);
    return res.status(500).json({ 
      error: 'Failed to update vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/professionals - Sincronizar profesionales desde API externa
router.post('/professionals', authenticateAdmin, async (req, res) => {
  try {
    const apiUrl = process.env.ORIGINAL_API_URL;
    const apiUser = process.env.ORIGINAL_API_USER;
    const apiPass = process.env.ORIGINAL_API_PASS;

    if (!apiUrl || !apiUser || !apiPass) {
      throw new Error('API credentials not configured');
    }

    console.log('👥 Starting professionals sync...');

    // Primero obtener lista de todos los profesionales
    const listResponse = await axios.get(`${apiUrl}/sellers/`, {
      auth: { username: apiUser, password: apiPass },
      params: { per_page: 200 }
    });

    if (listResponse.data.status !== 'success') {
      throw new Error('Failed to fetch professionals list');
    }

    let professionalsProcessed = 0;
    let professionalsCreated = 0;
    let professionalsUpdated = 0;

    // Procesar cada profesional individualmente
    for (const prof of listResponse.data.data) {
      try {
        // Obtener datos completos del profesional
        const detailResponse = await axios.get(`${apiUrl}/sellers/`, {
          auth: { username: apiUser, password: apiPass },
          params: { user_id: prof.id }
        });

        if (detailResponse.data.status === 'success') {
          const fullProfessional = detailResponse.data.data;
          
          // Verificar si ya existe
          const existingUser = await prisma.user.findFirst({
            where: { originalUserId: fullProfessional.id.toString() }
          });

          const userData = {
            originalUserId: fullProfessional.id.toString(),
            username: fullProfessional.username,
            email: fullProfessional.email,
            passwordHash: 'migrated_user_no_password', // Placeholder para usuarios migrados
            name: fullProfessional.name,
            role: fullProfessional.role,
            registeredDate: new Date(fullProfessional.registered_date),
            logoEmpresa: fullProfessional['logo-empresa'] || null,
            logoEmpresaHome: fullProfessional['logo-empresa-home'] || null,
            nomEmpresa: fullProfessional['nom-empresa'] || null,
            telefonMobile: fullProfessional['telefon-mobile-professional'] || null,
            telefonComercial: fullProfessional['telefon-comercial'] || null,
            telefonWhatsapp: fullProfessional['telefon-whatsapp'] || null,
            localitat: fullProfessional['localitat-professional'] || null,
            address: fullProfessional['adreca-professional'] || null,
            nomContacte: fullProfessional['nom-contacte'] || null,
            cognomsContacte: fullProfessional['cognoms-contacte'] || null,
            descripcioEmpresa: fullProfessional['descripcio-empresa'] || null,
            website: fullProfessional['pagina-web'] || null,
            galeriaProfessionals: fullProfessional['galeria-professionals'] || [],
            totalVehicles: fullProfessional.total_vehicles || 0,
            activeVehicles: fullProfessional.active_vehicles || 0
          };

          if (existingUser) {
            // Excluir passwordHash del update para no sobrescribir contraseñas existentes
            const { passwordHash, ...updateData } = userData;
            await prisma.user.update({
              where: { id: existingUser.id },
              data: updateData
            });
            professionalsUpdated++;
          } else {
            await prisma.user.create({
              data: userData
            });
            professionalsCreated++;
          }

          professionalsProcessed++;
          console.log(`✅ Processed professional: ${fullProfessional.name} (${professionalsProcessed})`);
        }
      } catch (error) {
        console.error(`❌ Error processing professional ${prof.id}:`, error);
      }
    }

    console.log(`🎉 Professionals sync completed: ${professionalsProcessed} processed, ${professionalsCreated} created, ${professionalsUpdated} updated`);

    res.json({
      message: 'Professionals sync completed',
      professionalsProcessed,
      professionalsCreated,
      professionalsUpdated
    });

  } catch (error) {
    console.error('❌ Error syncing professionals:', error);
    res.status(500).json({ 
      error: 'Failed to sync professionals',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ==================== NUEVAS RUTAS PARA CONFIGURACIÓN API ====================

// GET /api/sync/config - Obtener configuración actual de sincronización
router.get('/config', authenticateAdmin, async (req, res) => {
  try {
    // Buscar configuración existente o crear una por defecto
    let config = await prisma.config.findFirst({
      where: { key: 'api_sync_config' }
    });

    if (!config) {
      // Crear configuración por defecto
      const defaultConfig = {
        apiUrl: process.env.ORIGINAL_API_URL || '',
        username: process.env.ORIGINAL_API_USER || '',
        password: '', // No exponer la contraseña
        userId: '113',
        importSold: true,
        importNotSold: true,
        convertImages: true,
        imageFormat: 'avif',
        autoSync: false,
        syncFrequency: 60,
        batchSize: 50,
        lastSync: null
      };

      config = await prisma.config.create({
        data: {
          key: 'api_sync_config',
          value: JSON.stringify(defaultConfig)
        }
      });
    }

    const configData = JSON.parse(config.value);
    
    // Obtener información de la última sincronización
    const lastSyncLog = await prisma.syncLog.findFirst({
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        startedAt: true,
        completedAt: true,
        status: true,
        type: true,
        vehiclesProcessed: true,
        vehiclesCreated: true,
        vehiclesUpdated: true
      }
    });

    res.json({
      ...configData,
      lastSync: lastSyncLog?.completedAt || null,
      lastSyncStatus: lastSyncLog || null
    });

  } catch (error) {
    console.error('Error getting sync config:', error);
    res.status(500).json({ 
      error: 'Failed to get sync configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/config - Guardar configuración de sincronización
router.post('/config', authenticateAdmin, async (req, res) => {
  try {
    const {
      apiUrl,
      username,
      password,
      userId,
      importSold,
      importNotSold,
      convertImages,
      imageFormat,
      autoSync,
      syncFrequency,
      batchSize
    } = req.body;

    // Validar campos requeridos
    if (!apiUrl || !username) {
      return res.status(400).json({ error: 'API URL and username are required' });
    }

    const configData = {
      apiUrl,
      username,
      password: password || '', // Si no se proporciona contraseña, mantener la existente
      userId: userId || '',
      importSold: Boolean(importSold),
      importNotSold: Boolean(importNotSold),
      convertImages: Boolean(convertImages),
      imageFormat: imageFormat || 'avif',
      autoSync: Boolean(autoSync),
      syncFrequency: parseInt(syncFrequency) || 60,
      batchSize: parseInt(batchSize) || 50
    };

    // Buscar configuración existente
    const existingConfig = await prisma.config.findFirst({
      where: { key: 'api_sync_config' }
    });

    if (existingConfig) {
      // Si existe, mantener la contraseña anterior si no se proporciona una nueva
      if (!password || password === '') {
        const existingData = JSON.parse(existingConfig.value);
        configData.password = existingData.password || '';
      }

      await prisma.config.update({
        where: { id: existingConfig.id },
        data: {
          value: JSON.stringify(configData),
          updatedAt: new Date()
        }
      });
    } else {
      await prisma.config.create({
        data: {
          key: 'api_sync_config',
          value: JSON.stringify(configData)
        }
      });
    }

    // Actualizar variables de entorno si es necesario
    if (process.env.ORIGINAL_API_URL !== apiUrl) {
      console.log('🔄 API URL updated in configuration');
    }

    return res.json({
      message: 'Sync configuration saved successfully',
      config: {
        ...configData,
        password: '' // No devolver la contraseña
      }
    });

  } catch (error) {
    console.error('Error saving sync config:', error);
    return res.status(500).json({ 
      error: 'Failed to save sync configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/test-connection - Probar conexión con API externa
router.post('/test-connection', authenticateAdmin, async (req, res) => {
  try {
    const { apiUrl, username, password } = req.body;

    if (!apiUrl || !username || !password) {
      return res.status(400).json({ error: 'API URL, username, and password are required' });
    }

    console.log(`🔍 Testing connection to: ${apiUrl}`);

    // Probar conexión con un request simple
    const response = await axios.get(`${apiUrl}`, {
      auth: { username, password },
      params: { per_page: 1 },
      timeout: 10000
    });

    // Verificar respuesta
    if (response.status === 200 && response.data) {
      const hasItems = response.data.items && Array.isArray(response.data.items);
      const itemCount = hasItems ? response.data.items.length : 0;

      return res.json({
        success: true,
        message: 'Connection successful',
        apiStatus: response.status,
        responseFormat: hasItems ? 'valid' : 'unknown',
        sampleItems: itemCount,
        apiVersion: response.headers['x-api-version'] || 'unknown'
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Connection failed - Invalid response format',
        apiStatus: response.status
      });
    }

  } catch (error) {
    console.error('Connection test failed:', error);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const message = error.response?.status === 401 
        ? 'Authentication failed - Invalid credentials'
        : error.response?.status === 404
        ? 'API endpoint not found'
        : error.response?.status === 403
        ? 'Access denied - Insufficient permissions'
        : 'Connection failed';

      return res.status(statusCode).json({
        success: false,
        message,
        error: error.message,
        statusCode
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Connection test failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
});

// POST /api/sync/import-with-config - Importación manual con configuración personalizada
router.post('/import-with-config', authenticateAdmin, async (req, res) => {
  try {
    const config = req.body;

    if (!config.apiUrl || !config.username || !config.password) {
      return res.status(400).json({ error: 'API URL, username, and password are required' });
    }

    console.log('🚀 Starting custom import with provided configuration...');

    // Crear un log de sincronización
    const syncLog = await prisma.syncLog.create({
      data: {
        type: 'manual_custom',
        startedAt: new Date(),
        status: 'running',
        vehiclesProcessed: 0,
        vehiclesCreated: 0,
        vehiclesUpdated: 0
      }
    });

    // Ejecutar importación en background (no bloquear la respuesta)
    setImmediate(async () => {
      try {
        await executeCustomImport(config, syncLog.id);
      } catch (error) {
        console.error('Custom import failed:', error);
        await prisma.syncLog.update({
          where: { id: syncLog.id },
          data: {
            status: 'failed',
            completedAt: new Date(),
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });
      }
    });

    return res.json({
      message: 'Custom import started successfully',
      syncId: syncLog.id,
      status: 'running'
    });

  } catch (error) {
    console.error('Error starting custom import:', error);
    return res.status(500).json({ 
      error: 'Failed to start custom import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Función auxiliar para ejecutar importación personalizada
async function executeCustomImport(config: any, syncLogId: string) {
  let vehiclesProcessed = 0;
  let vehiclesCreated = 0;
  let vehiclesUpdated = 0;

  try {
    console.log(`🔄 Executing custom import with sync ID: ${syncLogId}`);

    const requests: Array<{params: any, type: string}> = [];
    
    // Importar vehículos no vendidos si está habilitado
    if (config.importNotSold) {
      requests.push({
        params: { user_id: config.userId, venut: 'false', per_page: config.batchSize },
        type: 'not_sold'
      });
    }

    // Importar vehículos vendidos si está habilitado
    if (config.importSold) {
      requests.push({
        params: { user_id: config.userId, venut: 'true', per_page: config.batchSize },
        type: 'sold'
      });
    }

    for (const request of requests) {
      try {
        console.log(`📥 Fetching ${request.type} vehicles...`);

        const response = await axios.get(config.apiUrl, {
          auth: { username: config.username, password: config.password },
          params: request.params,
          timeout: 30000
        });

        const vehicles = response.data.items || response.data;

        if (Array.isArray(vehicles)) {
          console.log(`📊 Processing ${vehicles.length} ${request.type} vehicles...`);

          for (const vehicle of vehicles) {
            try {
              console.log(`🔄 Processing vehicle: ${vehicle.slug}`);
              
              // Usar la función syncVehicle del servicio de sincronización
              const result = await syncVehicle(vehicle);
              
              vehiclesProcessed++;
              if (result === 'created') {
                vehiclesCreated++;
              } else if (result === 'updated') {
                vehiclesUpdated++;
              }
              
              console.log(`✅ Vehicle ${vehicle.slug} ${result}`);
              
              // Actualizar progreso cada 10 vehículos
              if (vehiclesProcessed % 10 === 0) {
                await prisma.syncLog.update({
                  where: { id: syncLogId },
                  data: {
                    vehiclesProcessed,
                    vehiclesCreated,
                    vehiclesUpdated
                  }
                });
              }
            } catch (vehicleError) {
              console.error(`❌ Error processing vehicle ${vehicle.slug}:`, vehicleError);
              vehiclesProcessed++;
              // El vehículo falló, pero seguimos contando para el progreso
            }
          }
        }
      } catch (requestError) {
        console.error(`Error fetching ${request.type} vehicles:`, requestError);
        // Registrar error pero continuar
      }
    }

    // Finalizar log de sincronización
    await prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated
      }
    });

    console.log(`✅ Custom import completed: ${vehiclesCreated} created, ${vehiclesUpdated} updated, ${vehiclesProcessed} total`);

  } catch (error) {
    console.error('Custom import failed:', error);
    
    await prisma.syncLog.update({
      where: { id: syncLogId },
      data: {
        status: 'failed',
        completedAt: new Date(),
        vehiclesProcessed,
        vehiclesCreated,
        vehiclesUpdated,
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    
    throw error;
  }
}

// ==================== NUEVAS RUTAS PARA ENVÍO A MOTORALDIA ====================

// POST /api/sync/send-vehicle/:id - Enviar vehículo específico a Motoraldia
router.post('/send-vehicle/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🚀 Sending vehicle ${id} to Motoraldia...`);
    
    // Obtener el vehículo de la base de datos
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Mapear el vehículo al formato de Motoraldia
    const motoraldiaPayload = mapVehicleToMotoraldiaPayload(vehicle);
    const cleanPayload = cleanMotoraldiaPayload(motoraldiaPayload);
    
    // Obtener credenciales de la API
    const apiUrl = process.env.ORIGINAL_API_URL;
    const apiUser = process.env.ORIGINAL_API_USER;
    const apiPass = process.env.ORIGINAL_API_PASS;
    
    if (!apiUrl || !apiUser || !apiPass) {
      return res.status(500).json({ error: 'API credentials not configured' });
    }
    
    console.log('📤 Payload to send:', JSON.stringify(cleanPayload, null, 2));
    
    // Probar conectividad antes de enviar
    try {
      console.log('🔍 Testing connectivity to Motoraldia API...');
      await axios.get(`${apiUrl.replace('/vehicles', '')}`, {
        auth: { username: apiUser, password: apiPass },
        timeout: 10000 // 10 segundos para el test
      });
      console.log('✅ Connectivity test successful');
    } catch (connectivityError) {
      console.log('⚠️ Connectivity test failed, but continuing with send...');
    }
    
    // Enviar a Motoraldia
    const response = await axios.post(`${apiUrl}/vehicles`, cleanPayload, {
      auth: { username: apiUser, password: apiPass },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Kars.ad-Sync/1.0'
      },
      timeout: 120000, // 2 minutos
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    
    console.log('✅ Vehicle sent successfully to Motoraldia');
    console.log('Response:', response.data);
    
    // Actualizar el vehículo para marcar que se envió a Motoraldia
    await prisma.vehicle.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        // Podríamos agregar un campo syncedToMotoraldi: true
      }
    });
    
    return res.json({
      message: 'Vehicle sent to Motoraldia successfully',
      vehicleId: id,
      vehicleSlug: vehicle.slug,
      motoraldiaResponse: response.data,
      sentFields: Object.keys(cleanPayload),
      sentAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error(`❌ Error sending vehicle ${req.params.id} to Motoraldia:`, error);
    
    if (axios.isAxiosError(error)) {
      const statusCode = error.response?.status || 500;
      const errorMessage = error.response?.data?.message || error.message;
      
      return res.status(statusCode).json({
        error: 'Failed to send vehicle to Motoraldia',
        details: errorMessage,
        statusCode,
        apiResponse: error.response?.data
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to send vehicle to Motoraldia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/sync/send-vehicles - Enviar múltiples vehículos a Motoraldia
router.post('/send-vehicles', authenticateAdmin, async (req, res) => {
  try {
    const { vehicleIds } = req.body;
    
    if (!vehicleIds || !Array.isArray(vehicleIds) || vehicleIds.length === 0) {
      return res.status(400).json({ error: 'Vehicle IDs array is required' });
    }
    
    console.log(`🚀 Sending ${vehicleIds.length} vehicles to Motoraldia...`);
    
    const results: {
      successful: Array<{
        vehicleId: string;
        vehicleSlug: string;
        motoraldiaResponse: any;
      }>;
      failed: Array<{
        vehicleId: string;
        error: string;
        details?: any;
      }>;
      total: number;
    } = {
      successful: [],
      failed: [],
      total: vehicleIds.length
    };
    
    // Obtener credenciales de la API
    const apiUrl = process.env.ORIGINAL_API_URL;
    const apiUser = process.env.ORIGINAL_API_USER;
    const apiPass = process.env.ORIGINAL_API_PASS;
    
    if (!apiUrl || !apiUser || !apiPass) {
      return res.status(500).json({ error: 'API credentials not configured' });
    }
    
    // Procesar cada vehículo
    for (const vehicleId of vehicleIds) {
      try {
        // Obtener el vehículo
        const vehicle = await prisma.vehicle.findUnique({
          where: { id: vehicleId }
        });
        
        if (!vehicle) {
          results.failed.push({
            vehicleId,
            error: 'Vehicle not found'
          });
          continue;
        }
        
        // Mapear al formato de Motoraldia
        const motoraldiaPayload = mapVehicleToMotoraldiaPayload(vehicle);
        const cleanPayload = cleanMotoraldiaPayload(motoraldiaPayload);
        
        // Enviar a Motoraldia
        const response = await axios.post(`${apiUrl}/vehicles`, cleanPayload, {
          auth: { username: apiUser, password: apiPass },
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Kars.ad-Sync/1.0'
          },
          timeout: 120000, // 2 minutos
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        
        // Actualizar el vehículo
        await prisma.vehicle.update({
          where: { id: vehicleId },
          data: {
            lastSyncAt: new Date()
          }
        });
        
        results.successful.push({
          vehicleId,
          vehicleSlug: vehicle.slug,
          motoraldiaResponse: response.data
        });
        
        console.log(`✅ Vehicle ${vehicle.slug} sent successfully`);
        
      } catch (error) {
        console.error(`❌ Error sending vehicle ${vehicleId}:`, error);
        
        results.failed.push({
          vehicleId,
          error: error instanceof Error ? error.message : 'Unknown error',
          details: axios.isAxiosError(error) ? error.response?.data : null
        });
      }
    }
    
    console.log(`🎉 Batch send completed: ${results.successful.length} successful, ${results.failed.length} failed`);
    
    return res.json({
      message: 'Batch send to Motoraldia completed',
      results,
      summary: {
        total: results.total,
        successful: results.successful.length,
        failed: results.failed.length,
        successRate: ((results.successful.length / results.total) * 100).toFixed(1) + '%'
      }
    });
    
  } catch (error) {
    console.error('❌ Error in batch send to Motoraldia:', error);
    return res.status(500).json({ 
      error: 'Failed to send vehicles to Motoraldia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/sync/vehicle-preview/:id - Previsualizar cómo se vería el vehículo en Motoraldia
router.get('/vehicle-preview/:id', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Obtener el vehículo de la base de datos
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    // Mapear el vehículo al formato de Motoraldia
    const motoraldiaPayload = mapVehicleToMotoraldiaPayload(vehicle);
    const cleanPayload = cleanMotoraldiaPayload(motoraldiaPayload);
    
    return res.json({
      message: 'Vehicle preview for Motoraldia',
      vehicleId: id,
      vehicleSlug: vehicle.slug,
      originalVehicle: {
        id: vehicle.id,
        slug: vehicle.slug,
        titolAnunci: vehicle.titolAnunci,
        preu: vehicle.preu,
        tipusVehicle: vehicle.tipusVehicle
      },
      motoraldiaPayload: cleanPayload,
      fieldCount: Object.keys(cleanPayload).length,
      mappedFields: Object.keys(cleanPayload)
    });
    
  } catch (error) {
    console.error(`❌ Error previewing vehicle ${req.params.id}:`, error);
    return res.status(500).json({ 
      error: 'Failed to preview vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;