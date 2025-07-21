import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { startFullSync, startIncrementalSync, getSyncStatus, syncBrandsAndModels, syncVehicleStates, syncFuelTypes, syncTransmissionTypes, syncBodyTypes, syncMotorcycleBodyTypes, syncCaravanBodyTypes, syncCommercialVehicleBodyTypes, syncCarExtras, syncExteriorColors, syncUpholsteryTypes, syncUpholsteryColors, syncMotorcycleExtras, syncCaravanExtras, syncHabitacleExtras, syncUsers, syncBlogPosts, syncVehicle } from '../services/syncService';

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

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
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

export default router;