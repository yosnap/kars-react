import express from 'express';
import { PrismaClient } from '@prisma/client';
import { migrateAllUsers, getMigrationStats, syncUserFromOriginal, cleanMigrationData } from '../services/userMigrationService';
import { initializeCronSync } from '../services/syncService';
import { importFromDefaultJson, importVehiclesFromJson, getImportStatus } from '../services/vehicleImporter';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación básica para admin
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('🔐 Auth middleware called');
  console.log('Expected username:', process.env.ADMIN_USERNAME);
  console.log('Expected password:', process.env.ADMIN_PASSWORD);
  
  const authHeader = req.headers.authorization;
  console.log('Auth header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    console.log('❌ No auth header or wrong format');
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('ascii');
  const [username, password] = credentials.split(':');
  
  console.log('Received username:', username);
  console.log('Received password:', password);
  console.log('Username match:', username === process.env.ADMIN_USERNAME);
  console.log('Password match:', password === process.env.ADMIN_PASSWORD);

  // Temporal fix para el problema del escape del !
  const expectedPassword = process.env.ADMIN_PASSWORD;
  const passwordsMatch = password === expectedPassword || password === expectedPassword?.replace('!', '\\!');
  
  if (username !== process.env.ADMIN_USERNAME || !passwordsMatch) {
    console.log('❌ Invalid credentials');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log('✅ Authentication successful');
  return next();
};

// Aplicar autenticación a todas las rutas admin
router.use(authenticateAdmin);

// GET /api/admin/stats - Estadísticas generales
router.get('/stats', async (req, res) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      featuredVehicles,
      recentSyncs,
      vehiclesByType,
      lastSync
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { anunciActiu: true } }),
      prisma.vehicle.count({ where: { anunciDestacat: { not: 0 } } }),
      prisma.syncLog.count({ where: { createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.vehicle.groupBy({
        by: ['tipusVehicle'],
        _count: true
      }),
      prisma.syncLog.findFirst({
        orderBy: { createdAt: 'desc' }
      })
    ]);

    return res.json({
      totalVehicles,
      activeVehicles,
      featuredVehicles,
      recentSyncs,
      vehiclesByType: Object.fromEntries(
        vehiclesByType.map(v => [v.tipusVehicle, v._count])
      ),
      lastSync: lastSync ? {
        ...lastSync,
        duration: lastSync.completedAt 
          ? lastSync.completedAt.getTime() - lastSync.startedAt.getTime()
          : null
      } : null
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/sync-logs - Historial de sincronizaciones
router.get('/sync-logs', async (req, res) => {
  try {
    const { page = '1', per_page = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    const [logs, total] = await Promise.all([
      prisma.syncLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.syncLog.count()
    ]);

    return res.json({
      logs: logs.map(log => ({
        ...log,
        duration: log.completedAt 
          ? log.completedAt.getTime() - log.startedAt.getTime()
          : null
      })),
      total,
      pages: Math.ceil(total / perPage),
      currentPage: pageNum
    });

  } catch (error) {
    console.error('Error fetching sync logs:', error);
    return res.status(500).json({ error: 'Failed to fetch sync logs' });
  }
});

// GET /api/admin/config - Configuración actual
router.get('/config', async (req, res) => {
  try {
    const configs = await prisma.config.findMany();
    
    const configMap = Object.fromEntries(
      configs.map(c => [c.key, { value: c.value, description: c.description }])
    );

    // Añadir configuración por defecto si no existe
    const defaultConfigs = {
      sync_interval_minutes: { value: '30', description: 'Intervalo de sincronización automática en minutos' },
      enable_auto_sync: { value: 'true', description: 'Activar sincronización automática' },
      max_vehicles_per_sync: { value: '1000', description: 'Máximo de vehículos por sincronización' }
    };

    for (const [key, config] of Object.entries(defaultConfigs)) {
      if (!configMap[key]) {
        configMap[key] = config;
      }
    }

    return res.json(configMap);

  } catch (error) {
    console.error('Error fetching config:', error);
    return res.status(500).json({ error: 'Failed to fetch config' });
  }
});

// PUT /api/admin/config - Actualizar configuración
router.put('/config', async (req, res) => {
  try {
    const { configs } = req.body;

    if (!configs || typeof configs !== 'object') {
      return res.status(400).json({ error: 'Invalid config format' });
    }

    // Actualizar cada configuración
    const updates = Object.entries(configs).map(([key, value]) =>
      prisma.config.upsert({
        where: { key },
        create: { key, value: String(value) },
        update: { value: String(value) }
      })
    );

    await Promise.all(updates);

    // Reinicializar crons si se actualizaron configuraciones relacionadas
    const configKeys = Object.keys(configs);
    const syncConfigKeys = ['sync_interval_minutes', 'enable_auto_sync'];
    const blogSyncConfigKeys = ['blog_sync_interval_hours', 'enable_blog_auto_sync'];
    
    if (syncConfigKeys.some(key => configKeys.includes(key))) {
      console.log('🔄 Reinitializing vehicle sync cron due to config changes...');
      try {
        await initializeCronSync();
      } catch (error) {
        console.error('Error reinitializing vehicle sync cron:', error);
      }
    }
    
    // Blog sync disabled temporarily
    // if (blogSyncConfigKeys.some(key => configKeys.includes(key))) {
    //   console.log('📚 Reinitializing blog sync cron due to config changes...');
    //   try {
    //     await initializeBlogCronSync();
    //   } catch (error) {
    //     console.error('Error reinitializing blog sync cron:', error);
    //   }
    // }

    return res.json({ message: 'Configuration updated successfully' });

  } catch (error) {
    console.error('Error updating config:', error);
    return res.status(500).json({ error: 'Failed to update config' });
  }
});

// DELETE /api/admin/vehicles/:id - Eliminar vehículo
router.delete('/vehicles/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    await prisma.vehicle.delete({
      where: { id }
    });

    return res.json({ message: 'Vehicle deleted successfully' });

  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return res.status(500).json({ error: 'Failed to delete vehicle' });
  }
});

// PUT /api/admin/vehicles/:id/toggle-active - Activar/desactivar vehículo
router.put('/vehicles/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: { anunciActiu: !vehicle.anunciActiu }
    });

    return res.json({
      message: `Vehicle ${updatedVehicle.anunciActiu ? 'activated' : 'deactivated'} successfully`,
      vehicle: updatedVehicle
    });

  } catch (error) {
    console.error('Error toggling vehicle status:', error);
    return res.status(500).json({ error: 'Failed to toggle vehicle status' });
  }
});

// POST /api/admin/migrate-users - Migrar todos los usuarios desde la API original
router.post('/migrate-users', async (req, res) => {
  try {
    const result = await migrateAllUsers();
    
    return res.json({
      message: 'User migration completed',
      ...result
    });

  } catch (error) {
    console.error('Error migrating users:', error);
    return res.status(500).json({ error: 'Failed to migrate users' });
  }
});

// GET /api/admin/migration-stats - Estadísticas de migración de usuarios
router.get('/migration-stats', async (req, res) => {
  try {
    const stats = await getMigrationStats();
    return res.json(stats);

  } catch (error) {
    console.error('Error fetching migration stats:', error);
    return res.status(500).json({ error: 'Failed to fetch migration stats' });
  }
});

// POST /api/admin/sync-user/:username - Sincronizar usuario específico
router.post('/sync-user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await syncUserFromOriginal(username);
    
    const messages = {
      'created': 'User created successfully',
      'updated': 'User updated successfully',
      'not_found': 'User not found in original API'
    };

    return res.json({
      message: messages[result],
      result,
      username
    });

  } catch (error) {
    console.error('Error syncing user:', error);
    return res.status(500).json({ error: 'Failed to sync user' });
  }
});

// POST /api/admin/sync-professionals - Sincronizar todos los profesionales
router.post('/sync-professionals', async (req, res) => {
  try {
    console.log('🚀 Sync of all professionals temporarily disabled...');
    // const result = await syncAllProfessionals();
    
    return res.json({
      message: 'Professionals sync temporarily disabled - function not available',
      usersCreated: 0,
      usersUpdated: 0,
      errors: 0
    });

  } catch (error) {
    console.error('Error syncing professionals:', error);
    return res.status(500).json({ error: 'Failed to sync professionals' });
  }
});

// DELETE /api/admin/migration-data - Limpiar datos de migración (solo para testing)
router.delete('/migration-data', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    const deletedCount = await cleanMigrationData();
    
    return res.json({
      message: 'Migration data cleaned',
      deletedUsers: deletedCount
    });

  } catch (error) {
    console.error('Error cleaning migration data:', error);
    return res.status(500).json({ error: 'Failed to clean migration data' });
  }
});

// GET /api/admin/external-vehicles - Obtener todos los vehículos de la API externa para administración
router.get('/external-vehicles', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    console.log(`🔍 Fetching external vehicles - Page: ${page}, Limit: ${limit}`);
    
    // Configurar cliente axios para API externa
    const axios = require('axios');
    const apiClient = axios.create({
      baseURL: process.env.ORIGINAL_API_URL || 'https://motoraldia.net/wp-json/api-motor/v1',
      auth: {
        username: process.env.ORIGINAL_API_USER || 'Paulo',
        password: process.env.ORIGINAL_API_PASS || 'U^q^i2l49rZrX72#Ln!Xe5k0'
      },
      timeout: 30000
    });

    // Obtener TODOS los vehículos de la API externa
    // La API no respeta per_page=-1, necesitamos usar un número alto
    const response = await apiClient.get('/vehicles', {
      params: {
        per_page: 1000  // Obtener hasta 1000 vehículos por petición
      }
    });

    console.log('🔍 External API Response structure:', {
      hasData: !!response.data,
      hasItems: !!response.data?.items,
      itemsLength: response.data?.items?.length,
      total: response.data?.total,
      status: response.data?.status
    });

    const allVehicles = response.data.items || response.data || [];
    const totalVehicles = allVehicles.length;
    
    // Paginar los resultados para el admin
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVehicles = allVehicles.slice(startIndex, endIndex);
    
    console.log(`📊 Found ${totalVehicles} vehicles in external API, showing ${paginatedVehicles.length} on page ${page}`);
    
    // Verificar cuáles ya existen en nuestra base de datos
    const allSlugs = allVehicles.map((v: any) => v.slug).filter(Boolean);
    const existingVehicles = await prisma.vehicle.findMany({
      where: { slug: { in: allSlugs } },
      select: { slug: true, lastSyncAt: true }
    });
    
    const existingSlugsMap = new Map(existingVehicles.map(v => [v.slug, v.lastSyncAt]));
    
    // Enriquecer datos con información de sincronización
    const enrichedVehicles = paginatedVehicles.map((vehicle: any) => ({
      // Todos los datos del vehículo de la API externa
      id: vehicle.id,
      slug: vehicle.slug,
      'titol-anunci': vehicle['titol-anunci'],
      'descripcio-anunci': vehicle['descripcio-anunci'],
      preu: vehicle.preu,
      quilometratge: vehicle.quilometratge,
      any: vehicle.any || vehicle['any-fabricacio'],
      'tipus-vehicle': vehicle['tipus-vehicle'],
      'marca-cotxe': vehicle['marca-cotxe'] || vehicle['marques-cotxe'],
      'marca-moto': vehicle['marca-moto'] || vehicle['marques-moto'],
      'models-cotxe': vehicle['models-cotxe'],
      'models-moto': vehicle['models-moto'],
      versio: vehicle.versio,
      'tipus-combustible': vehicle['tipus-combustible'] || vehicle.combustible,
      'tipus-canvi': vehicle['tipus-canvi'] || vehicle.transmissio,
      traccio: vehicle.traccio,
      'potencia-cv': vehicle['potencia-cv'] || vehicle.potencia,
      cilindrada: vehicle.cilindrada,
      'portes-cotxe': vehicle['portes-cotxe'] || vehicle['num-portes'],
      'color-vehicle': vehicle['color-vehicle'] || vehicle.color,
      'anunci-actiu': vehicle['anunci-actiu'],
      'anunci-destacat': vehicle['anunci-destacat'],
      venut: vehicle.venut,
      'data-creacio': vehicle['data-creacio'],
      'data-modificacio': vehicle['data-modificacio'],
      'imatge-destacada-url': vehicle['imatge-destacada-url'],
      'galeria-vehicle-urls': vehicle['galeria-vehicle-urls'] || vehicle.imatges || [],
      'professional-id': vehicle['professional-id'] || vehicle['author_id'],
      
      // Campos adicionales del payload completo
      'estat-vehicle': vehicle['estat-vehicle'],
      'carroseria-cotxe': vehicle['carroseria-cotxe'],
      'carroseria-moto': vehicle['carroseria-moto'],
      'carroseria-caravana': vehicle['carroseria-caravana'],
      garantia: vehicle.garantia,
      'vehicle-accidentat': vehicle['vehicle-accidentat'],
      'llibre-manteniment': vehicle['llibre-manteniment'],
      'revisions-oficials': vehicle['revisions-oficials'],
      'impostos-deduibles': vehicle['impostos-deduibles'],
      'vehicle-a-canvi': vehicle['vehicle-a-canvi'],
      'nombre-propietaris': vehicle['nombre-propietaris'],
      'places-cotxe': vehicle['places-cotxe'],
      'places-moto': vehicle['places-moto'],
      'aire-acondicionat': vehicle['aire-acondicionat'],
      'tipus-tapisseria': vehicle['tipus-tapisseria'],
      'color-tapisseria': vehicle['color-tapisseria'],
      climatitzacio: vehicle.climatitzacio,
      'vehicle-fumador': vehicle['vehicle-fumador'],
      'roda-recanvi': vehicle['roda-recanvi'],
      'numero-maleters-cotxe': vehicle['numero-maleters-cotxe'],
      'capacitat-maleters-cotxe': vehicle['capacitat-maleters-cotxe'],
      'capacitat-total-l': vehicle['capacitat-total-l'],
      'acceleracio-0-60': vehicle['acceleracio-0-60'],
      'acceleracio-0-100-cotxe': vehicle['acceleracio-0-100-cotxe'],
      'velocitat-maxima': vehicle['velocitat-maxima'],
      'tipus-de-canvi-moto': vehicle['tipus-de-canvi-moto'],
      'preu-mensual': vehicle['preu-mensual'],
      'preu-diari': vehicle['preu-diari'],
      'preu-antic': vehicle['preu-antic'],
      'video-vehicle': vehicle['video-vehicle'],
      'cv-motor-3': vehicle['cv-motor-3'],
      'kw-motor-3': vehicle['kw-motor-3'],
      'cv-motor-4': vehicle['cv-motor-4'],
      'kw-motor-4': vehicle['kw-motor-4'],
      
      // Campos de vehículos eléctricos
      'autonomia-wltp': vehicle['autonomia-wltp'],
      'autonomia-urbana-wltp': vehicle['autonomia-urbana-wltp'],
      'autonomia-extraurbana-wltp': vehicle['autonomia-extraurbana-wltp'],
      'autonomia-electrica': vehicle['autonomia-electrica'],
      bateria: vehicle.bateria,
      'cables-recarrega': vehicle['cables-recarrega'],
      connectors: vehicle.connectors,
      'velocitat-recarrega': vehicle['velocitat-recarrega'],
      'frenada-regenerativa': vehicle['frenada-regenerativa'],
      'one-pedal': vehicle['one-pedal'],
      'temps-recarrega-total': vehicle['temps-recarrega-total'],
      'temps-recarrega-fins-80': vehicle['temps-recarrega-fins-80'],
      
      // Campos de motor
      'numero-motors': vehicle['numero-motors'],
      'cv-motor-davant': vehicle['cv-motor-davant'],
      'kw-motor-davant': vehicle['kw-motor-davant'],
      'cv-motor-darrere': vehicle['cv-motor-darrere'],
      'kw-motor-darrere': vehicle['kw-motor-darrere'],
      'potencia-combinada': vehicle['potencia-combinada'],
      'emissions-vehicle': vehicle['emissions-vehicle'],
      
      // Extras
      'extres-cotxe': vehicle['extres-cotxe'] || [],
      'extres-moto': vehicle['extres-moto'] || [],
      'extres-autocaravana': vehicle['extres-autocaravana'] || [],
      'extres-habitacle': vehicle['extres-habitacle'] || [],
      
      // Estado de sincronización
      existsInDatabase: existingSlugsMap.has(vehicle.slug),
      lastSyncAt: existingSlugsMap.get(vehicle.slug) || null,
      hasImages: !!(vehicle['imatge-destacada-url'] || (vehicle['galeria-vehicle-urls'] && vehicle['galeria-vehicle-urls'].length > 0))
    }));

    const totalPages = Math.ceil(totalVehicles / limit);
    
    // Estadísticas generales
    const withImages = allVehicles.filter((v: any) => v['imatge-destacada-url'] || (v['galeria-vehicle-urls'] && v['galeria-vehicle-urls'].length > 0)).length;
    const activeVehicles = allVehicles.filter((v: any) => v['anunci-actiu'] === true || v['anunci-actiu'] === 'true').length;
    const featuredVehicles = allVehicles.filter((v: any) => v['anunci-destacat'] && (v['anunci-destacat'] === true || v['anunci-destacat'] > 0)).length;
    const existingInDb = existingVehicles.length;

    return res.json({
      vehicles: enrichedVehicles,
      pagination: {
        total: totalVehicles,
        pages: totalPages,
        currentPage: page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      statistics: {
        totalExternalVehicles: totalVehicles,
        withImages: withImages,
        activeVehicles: activeVehicles,
        featuredVehicles: featuredVehicles,
        existingInDatabase: existingInDb,
        notImported: totalVehicles - existingInDb
      }
    });

  } catch (error) {
    console.error('❌ Error fetching external vehicles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch external vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-vehicle/:slug - Importar un vehículo específico desde la API externa
router.post('/import-vehicle/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    console.log(`🔄 Importing single vehicle: ${slug}`);
    
    const { syncVehicle } = require('../services/syncService');
    const axios = require('axios');
    
    // Configurar cliente axios para API externa
    const apiClient = axios.create({
      baseURL: process.env.ORIGINAL_API_URL || 'https://motoraldia.net/wp-json/api-motor/v1',
      auth: {
        username: process.env.ORIGINAL_API_USER || 'Paulo',
        password: process.env.ORIGINAL_API_PASS || 'U^q^i2l49rZrX72#Ln!Xe5k0'
      },
      timeout: 30000
    });

    // Buscar el vehículo específico en la API externa
    const response = await apiClient.get('/vehicles', {
      params: {
        slug: slug
      }
    });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ 
        error: 'Vehicle not found in external API',
        slug: slug
      });
    }

    const vehicleData = response.data.items[0];
    
    // Sincronizar el vehículo
    const result = await syncVehicle(vehicleData);
    
    console.log(`✅ Vehicle ${slug} ${result}`);
    
    return res.json({
      message: `Vehicle ${slug} successfully ${result}`,
      result: result,
      vehicle: {
        slug: vehicleData.slug,
        title: vehicleData['titol-anunci'],
        hasImages: !!(vehicleData['imatge-destacada-url'] || vehicleData['galeria-vehicle-urls']?.length > 0)
      }
    });

  } catch (error) {
    console.error(`❌ Error importing vehicle ${req.params.slug}:`, error);
    return res.status(500).json({ 
      error: 'Failed to import vehicle',
      slug: req.params.slug,
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-all-vehicles - Importar todos los vehículos desde la API externa
router.post('/import-all-vehicles', async (req, res) => {
  try {
    console.log('🚀 Starting bulk import of all vehicles from external API...');
    
    const { startFullSync } = require('../services/syncService');
    
    // Iniciar sincronización completa
    const syncId = await startFullSync('admin-bulk-import');
    
    return res.json({
      message: 'Bulk import of all vehicles started',
      syncId: syncId,
      status: 'started',
      note: 'Check sync status at /api/sync/status to monitor progress'
    });

  } catch (error) {
    console.error('❌ Error starting bulk import:', error);
    return res.status(500).json({ 
      error: 'Failed to start bulk import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/users/preview - Vista previa de usuarios con información completa
router.get('/users/preview', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const users = await prisma.user.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        registeredDate: true,
        logoEmpresa: true,
        logoEmpresaHome: true,
        nomEmpresa: true,
        telefonMobile: true,
        telefonComercial: true,
        telefonWhatsapp: true,
        localitat: true,
        address: true,
        nomContacte: true,
        cognomsContacte: true,
        descripcioEmpresa: true,
        website: true,
        galeriaProfessionals: true,
        totalVehicles: true,
        activeVehicles: true,
        originalUserId: true,
        migratedAt: true,
        lastSyncAt: true,
        createdAt: true
      }
    });

    const total = await prisma.user.count();
    const pages = Math.ceil(total / limit);

    // Estadísticas globales detalladas
    const [
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      usersWithVehicles,
      totalVehiclesByUsers,
      usersWithLogos,
      usersWithCompanyInfo,
      migratedUsers,
      recentUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
      }),
      prisma.user.count({
        where: {
          vehicles: {
            some: {}
          }
        }
      }),
      prisma.vehicle.count(),
      prisma.user.count({
        where: {
          OR: [
            { logoEmpresa: { not: null } },
            { logoEmpresaHome: { not: null } }
          ]
        }
      }),
      prisma.user.count({ where: { nomEmpresa: { not: null } } }),
      prisma.user.count({ where: { originalUserId: { not: null } } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
          }
        }
      })
    ]);

    // Top usuarios con más vehículos (usando el campo totalVehicles)
    const topUsersWithVehicles = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        nomEmpresa: true,
        role: true,
        totalVehicles: true
      },
      orderBy: {
        totalVehicles: 'desc'
      },
      take: 10,
      where: {
        totalVehicles: {
          gt: 0
        }
      }
    });

    // Formatear estadísticas por rol
    const roleStats = usersByRole.reduce((acc: any, item) => {
      acc[item.role] = item._count.role;
      return acc;
    }, {});

    // Calcular promedios
    const avgVehiclesPerUser = usersWithVehicles > 0 ? (totalVehiclesByUsers / usersWithVehicles).toFixed(1) : '0';

    return res.json({
      users: users.map(user => ({
        ...user,
        hasLogo: !!(user.logoEmpresa || user.logoEmpresaHome),
        hasCompanyInfo: !!user.nomEmpresa,
        isMigrated: !!user.originalUserId,
        isRecentlyCreated: user.createdAt && new Date().getTime() - user.createdAt.getTime() < 30 * 24 * 60 * 60 * 1000,
        vehicleCount: user.totalVehicles || 0
      })),
      pagination: {
        total,
        pages,
        currentPage: page,
        limit
      },
      statistics: {
        global: {
          totalUsers: totalUsers,
          activeUsers: activeUsers,
          inactiveUsers: inactiveUsers,
          recentUsers: recentUsers,
          usersWithVehicles: usersWithVehicles,
          usersWithoutVehicles: totalUsers - usersWithVehicles,
          usersWithLogos: usersWithLogos,
          usersWithCompanyInfo: usersWithCompanyInfo,
          migratedUsers: migratedUsers,
          localUsers: totalUsers - migratedUsers,
          avgVehiclesPerUser: parseFloat(avgVehiclesPerUser)
        },
        byRole: roleStats,
        vehicleDistribution: {
          totalVehicles: totalVehiclesByUsers,
          averagePerUser: avgVehiclesPerUser
        },
        topUsers: topUsersWithVehicles.map(user => ({
          id: user.id,
          username: user.username,
          name: user.name || user.nomEmpresa || 'Sin nombre',
          role: user.role,
          vehicleCount: user.totalVehicles || 0
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching users preview:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch users preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/users - Listado de usuarios para admin
router.get('/users', async (req, res) => {
  try {
    const {
      page = '1',
      per_page = '20',
      role = 'all', // 'professional', 'admin', 'user', 'all'
      status = 'all', // 'active', 'inactive', 'all'
      migrated = 'all', // 'migrated', 'local', 'all'
      search = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    const where: any = {};
    
    if (role !== 'all') {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    if (migrated === 'migrated') {
      where.migratedAt = { not: null };
    } else if (migrated === 'local') {
      where.migratedAt = null;
    }

    if (search) {
      where.OR = [
        { username: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { name: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: perPage,
        select: {
          id: true,
          username: true,
          email: true,
          name: true,
          role: true,
          isActive: true,
          migratedAt: true,
          lastLoginAt: true,
          createdAt: true,
          totalVehicles: true,
          activeVehicles: true,
          originalUserId: true,
          _count: {
            select: {
              vehicles: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      users: users.map(user => ({
        ...user,
        vehicleCount: user._count.vehicles,
        total_vehicles: user.totalVehicles || 0,
        active_vehicles: user.activeVehicles || 0,
        original_user_id: user.originalUserId,
        isMigrated: user.migratedAt !== null
      })),
      total,
      pages: Math.ceil(total / perPage),
      currentPage: pageNum
    });

  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PUT /api/admin/users/:id/toggle-active - Activar/desactivar usuario
router.put('/users/:id/toggle-active', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive }
    });

    return res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        isActive: updatedUser.isActive
      }
    });

  } catch (error) {
    console.error('Error toggling user status:', error);
    return res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// GET /api/admin/vehicles/preview - Vista previa de vehículos con imágenes
router.get('/vehicles/preview', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const vehicles = await prisma.vehicle.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        titolAnunci: true,
        tipusVehicle: true,
        marcaCotxe: true,
        marcaMoto: true,
        preu: true,
        any: true,
        quilometratge: true,
        estatVehicle: true,
        tipusCombustible: true,
        anunciActiu: true,
        anunciDestacat: true,
        venut: true,
        imatgeDestacadaUrl: true,
        galeriaVehicleUrls: true,
        professionalId: true,
        dataCreacio: true,
        lastSyncAt: true
      }
    });

    const total = await prisma.vehicle.count();
    const pages = Math.ceil(total / limit);

    // Estadísticas de imágenes
    const withImages = vehicles.filter(v => v.imatgeDestacadaUrl).length;
    const withGallery = vehicles.filter(v => v.galeriaVehicleUrls && v.galeriaVehicleUrls.length > 0).length;

    return res.json({
      vehicles,
      pagination: {
        total,
        pages,
        currentPage: page,
        limit
      },
      statistics: {
        total: vehicles.length,
        withFeaturedImage: withImages,
        withGallery: withGallery,
        withoutImages: vehicles.length - withImages
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles preview:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles preview' });
  }
});

// GET /api/admin/vehicles - Listado de vehículos para admin (incluye inactivos)
router.get('/vehicles', async (req, res) => {
  try {
    const {
      page = '1',
      per_page = '20',
      status = 'all', // 'active', 'inactive', 'all'
      search = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    const where: any = {};
    
    if (status === 'active') {
      where.anunciActiu = true;
    } else if (status === 'inactive') {
      where.anunciActiu = false;
    }

    if (search) {
      where.OR = [
        { titolAnunci: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
        { marcaCotxe: { contains: search as string, mode: 'insensitive' } },
        { marcaMoto: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: { dataCreacio: 'desc' },
        skip,
        take: perPage,
        select: {
          id: true,
          slug: true,
          titolAnunci: true,
          tipusVehicle: true,
          marcaCotxe: true,
          marcaMoto: true,
          preu: true,
          anunciActiu: true,
          anunciDestacat: true,
          dataCreacio: true,
          lastSyncAt: true
        }
      }),
      prisma.vehicle.count({ where })
    ]);

    return res.json({
      vehicles,
      total,
      pages: Math.ceil(total / perPage),
      currentPage: pageNum
    });

  } catch (error) {
    console.error('Error fetching admin vehicles:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
});

// GET /api/admin/blog-posts - Listado de posts del blog
router.get('/blog-posts', async (req, res) => {
  try {
    const {
      page = '1',
      per_page = '20',
      status = 'all', // 'publish', 'draft', 'all'
      search = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    const where: any = {};
    
    if (status !== 'all') {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { slug: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.blogPost.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: perPage,
        select: {
          id: true,
          originalId: true,
          title: true,
          slug: true,
          content: true,
          excerpt: true,
          featuredImage: true,
          date: true,
          author: true,
          categories: true,
          tags: true,
          status: true,
          isActive: true,
          seoTitle: true,
          seoDescription: true,
          seoKeywords: true,
          lastSyncAt: true,
          createdAt: true
        }
      }),
      prisma.blogPost.count({ where })
    ]);

    return res.json({
      posts,
      total,
      pages: Math.ceil(total / perPage),
      currentPage: pageNum
    });

  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return res.status(500).json({ error: 'Failed to fetch blog posts' });
  }
});

// GET /api/admin/blog-posts/:id - Detalle de un post
router.get('/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    return res.json(post);

  } catch (error) {
    console.error('Error fetching blog post:', error);
    return res.status(500).json({ error: 'Failed to fetch blog post' });
  }
});

// POST /api/admin/blog-posts - Crear nuevo post
router.post('/blog-posts', async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      categories,
      tags,
      status = 'draft',
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    if (!title || !slug || !content) {
      return res.status(400).json({ error: 'Title, slug and content are required' });
    }

    const post = await prisma.blogPost.create({
      data: {
        originalId: `local-${Date.now()}`, // ID local para posts creados en admin
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        date: new Date(),
        author: 'Admin',
        categories: categories || [],
        tags: tags || [],
        status,
        isActive: status === 'publish',
        seoTitle,
        seoDescription,
        seoKeywords
      }
    });

    return res.json({
      message: 'Post created successfully',
      post
    });

  } catch (error) {
    console.error('Error creating blog post:', error);
    return res.status(500).json({ error: 'Failed to create blog post' });
  }
});

// PUT /api/admin/blog-posts/:id - Actualizar post
router.put('/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      featuredImage,
      categories,
      tags,
      status,
      seoTitle,
      seoDescription,
      seoKeywords
    } = req.body;

    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title,
        slug,
        content,
        excerpt,
        featuredImage,
        categories,
        tags,
        status,
        isActive: status === 'publish',
        seoTitle,
        seoDescription,
        seoKeywords,
        updatedAt: new Date()
      }
    });

    return res.json({
      message: 'Post updated successfully',
      post: updatedPost
    });

  } catch (error) {
    console.error('Error updating blog post:', error);
    return res.status(500).json({ error: 'Failed to update blog post' });
  }
});

// DELETE /api/admin/blog-posts/:id - Eliminar post
router.delete('/blog-posts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.blogPost.findUnique({
      where: { id }
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await prisma.blogPost.delete({
      where: { id }
    });

    return res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Error deleting blog post:', error);
    return res.status(500).json({ error: 'Failed to delete blog post' });
  }
});

// GET /api/admin/blog-sync-logs - Historial de sincronizaciones del blog
router.get('/blog-sync-logs', async (req, res) => {
  try {
    const { page = '1', per_page = '20' } = req.query;
    const pageNum = parseInt(page as string);
    const perPage = parseInt(per_page as string);
    const skip = (pageNum - 1) * perPage;

    const [logs, total] = await Promise.all([
      prisma.blogSyncLog.findMany({
        orderBy: { startedAt: 'desc' },
        skip,
        take: perPage
      }),
      prisma.blogSyncLog.count()
    ]);

    return res.json({
      logs: logs.map(log => ({
        ...log,
        duration: log.completedAt 
          ? log.completedAt.getTime() - log.startedAt.getTime()
          : null
      })),
      total,
      pages: Math.ceil(total / perPage),
      currentPage: pageNum
    });

  } catch (error) {
    console.error('Error fetching blog sync logs:', error);
    return res.status(500).json({ error: 'Failed to fetch blog sync logs' });
  }
});

// GET /api/admin/vehicle-stats - Estadísticas detalladas de vehículos
router.get('/vehicle-stats', async (req, res) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      featuredVehicles,
      soldVehicles,
      vehiclesByType,
      vehiclesByStatus,
      vehiclesByCondition
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { anunciActiu: true } }),
      prisma.vehicle.count({ where: { anunciActiu: false } }),
      prisma.vehicle.count({ where: { anunciDestacat: { not: 0 } } }),
      prisma.vehicle.count({ where: { venut: true } }),
      prisma.vehicle.groupBy({
        by: ['tipusVehicle'],
        _count: true
      }),
      prisma.vehicle.groupBy({
        by: ['anunciActiu'],
        _count: true
      }),
      prisma.vehicle.groupBy({
        by: ['estatVehicle'],
        where: { estatVehicle: { not: null } },
        _count: true
      })
    ]);

    return res.json({
      totalVehicles,
      activeVehicles,
      inactiveVehicles,
      featuredVehicles,
      soldVehicles,
      vehiclesByType: Object.fromEntries(
        vehiclesByType.map(v => [v.tipusVehicle, v._count])
      ),
      vehiclesByStatus: {
        'activo': activeVehicles,
        'inactivo': inactiveVehicles
      },
      vehiclesByCondition: Object.fromEntries(
        vehiclesByCondition.map(v => [v.estatVehicle!, v._count])
      )
    });

  } catch (error) {
    console.error('Error fetching vehicle stats:', error);
    return res.status(500).json({ error: 'Failed to fetch vehicle stats' });
  }
});

// GET /api/admin/user-stats - Estadísticas detalladas de usuarios
router.get('/user-stats', async (req, res) => {
  try {
    const [
      totalUsers,
      adminUsers,
      professionalUsers,
      regularUsers,
      usersByRole,
      usersWithVehicles,
      topUsersWithVehicles
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'professional' } }),
      prisma.user.count({ where: { role: { in: ['user', 'particular'] } } }),
      prisma.user.groupBy({
        by: ['role'],
        _count: true
      }),
      prisma.user.count({
        where: { totalVehicles: { gt: 0 } }
      }),
      prisma.user.findMany({
        select: {
          username: true,
          totalVehicles: true
        },
        where: { totalVehicles: { gt: 0 } },
        orderBy: { totalVehicles: 'desc' },
        take: 5
      })
    ]);

    // Calcular distribución por número de vehículos
    const vehicleDistribution = await prisma.user.findMany({
      select: { totalVehicles: true }
    });

    const usersByVehicleCount = vehicleDistribution.reduce((acc, user) => {
      const count = user.totalVehicles || 0;
      let range = '0 vehículos';
      if (count > 0 && count <= 5) range = '1-5 vehículos';
      else if (count > 5 && count <= 20) range = '6-20 vehículos';
      else if (count > 20) range = '21+ vehículos';
      
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalVehicles = vehicleDistribution.reduce((sum, user) => sum + (user.totalVehicles || 0), 0);
    const avgVehiclesPerUser = usersWithVehicles > 0 ? totalVehicles / usersWithVehicles : 0;

    return res.json({
      totalUsers,
      adminUsers,
      professionalUsers,
      regularUsers,
      usersByRole: Object.fromEntries(
        usersByRole.map(u => [u.role === 'particular' ? 'user' : u.role, u._count])
      ),
      usersByVehicleCount,
      avgVehiclesPerUser,
      mostActiveUsers: topUsersWithVehicles.map(u => ({
        username: u.username,
        vehicleCount: u.totalVehicles || 0
      }))
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    return res.status(500).json({ error: 'Failed to fetch user stats' });
  }
});

// GET /api/admin/blog-stats - Estadísticas del blog
router.get('/blog-stats', async (req, res) => {
  try {
    const [
      totalPosts,
      activePosts,
      draftPosts,
      recentSyncs,
      postsByStatus,
      lastSync
    ] = await Promise.all([
      prisma.blogPost.count(),
      prisma.blogPost.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { status: 'draft' } }),
      prisma.blogSyncLog.count({ where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } }),
      prisma.blogPost.groupBy({
        by: ['status'],
        _count: true
      }),
      prisma.blogSyncLog.findFirst({
        orderBy: { startedAt: 'desc' }
      })
    ]);

    return res.json({
      totalPosts,
      activePosts,
      draftPosts,
      recentSyncs,
      postsByStatus: Object.fromEntries(
        postsByStatus.map(p => [p.status, p._count])
      ),
      lastSync: lastSync ? {
        ...lastSync,
        duration: lastSync.completedAt 
          ? lastSync.completedAt.getTime() - lastSync.startedAt.getTime()
          : null
      } : null
    });

  } catch (error) {
    console.error('Error fetching blog stats:', error);
    return res.status(500).json({ error: 'Failed to fetch blog stats' });
  }
});

// GET /api/admin/blog-categories - Obtener todas las categorías disponibles
router.get('/blog-categories', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        categories: true
      }
    });

    const categoriesSet = new Set<string>();
    
    posts.forEach(post => {
      if (post.categories && Array.isArray(post.categories)) {
        post.categories.forEach((cat: any) => {
          const categoryName = typeof cat === 'string' ? cat : cat.name || cat.slug;
          if (categoryName) categoriesSet.add(categoryName);
        });
      }
    });

    const categories = Array.from(categoriesSet).sort();
    
    return res.json({
      categories,
      total: categories.length
    });

  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return res.status(500).json({ error: 'Failed to fetch blog categories' });
  }
});

// GET /api/admin/blog-tags - Obtener todos los tags disponibles
router.get('/blog-tags', async (req, res) => {
  try {
    const posts = await prisma.blogPost.findMany({
      select: {
        tags: true
      }
    });

    const tagsSet = new Set<string>();
    
    posts.forEach(post => {
      if (post.tags && Array.isArray(post.tags)) {
        post.tags.forEach((tag: any) => {
          const tagName = typeof tag === 'string' ? tag : tag.name || tag.slug;
          if (tagName) tagsSet.add(tagName);
        });
      }
    });

    const tags = Array.from(tagsSet).sort();
    
    return res.json({
      tags,
      total: tags.length
    });

  } catch (error) {
    console.error('Error fetching blog tags:', error);
    return res.status(500).json({ error: 'Failed to fetch blog tags' });
  }
});

// POST /api/admin/backup - Crear backup de la base de datos
router.post('/backup', async (req, res) => {
  try {
    console.log('🗄️ Creating database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `motoraldia-backup-${timestamp}.json`;
    
    // Obtener todos los datos de las tablas principales
    const [
      vehicles,
      users,
      blogPosts,
      syncLogs,
      blogSyncLogs,
      configs
    ] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.user.findMany(),
      prisma.blogPost.findMany(),
      prisma.syncLog.findMany(),
      prisma.blogSyncLog.findMany(),
      prisma.config.findMany()
    ]);

    const backupData = {
      metadata: {
        createdAt: new Date().toISOString(),
        version: '1.0',
        source: 'motoraldia-admin'
      },
      tables: {
        vehicles,
        users,
        blogPosts,
        syncLogs,
        blogSyncLogs,
        configs
      }
    };

    const recordCounts = {
      vehicles: vehicles.length,
      users: users.length,
      blogPosts: blogPosts.length,
      syncLogs: syncLogs.length,
      blogSyncLogs: blogSyncLogs.length,
      configs: configs.length
    };

    const dataString = JSON.stringify(backupData, null, 2);
    const sizeInBytes = Buffer.byteLength(dataString, 'utf8');
    const sizeFormatted = formatFileSize(sizeInBytes);

    console.log(`✅ Backup created: ${filename} (${sizeFormatted})`);
    console.log(`📊 Records: ${JSON.stringify(recordCounts)}`);

    return res.json({
      filename,
      size: sizeFormatted,
      createdAt: new Date().toISOString(),
      tables: Object.keys(backupData.tables),
      recordCounts,
      data: dataString
    });

  } catch (error) {
    console.error('Error creating backup:', error);
    return res.status(500).json({ error: 'Failed to create backup' });
  }
});

// POST /api/admin/restore - Restaurar backup de la base de datos
router.post('/restore', async (req, res) => {
  try {
    const { backupData } = req.body;
    
    if (!backupData || !backupData.tables) {
      return res.status(400).json({ error: 'Invalid backup data format' });
    }

    console.log('🔄 Starting database restoration...');
    console.log('📋 Backup metadata:', backupData.metadata);

    const tables = backupData.tables;
    let restoredCounts: Record<string, number> = {};

    // Limpiar tablas existentes (en orden para evitar conflictos de FK)
    console.log('🗑️ Clearing existing data...');
    await prisma.syncLog.deleteMany();
    await prisma.blogSyncLog.deleteMany();
    await prisma.blogPost.deleteMany();
    await prisma.vehicle.deleteMany();
    await prisma.user.deleteMany();
    await prisma.config.deleteMany();

    // Restaurar datos (en orden correcto)
    if (tables.configs && Array.isArray(tables.configs)) {
      console.log(`📝 Restoring ${tables.configs.length} configs...`);
      for (const config of tables.configs) {
        await prisma.config.create({ data: config });
      }
      restoredCounts.configs = tables.configs.length;
    }

    if (tables.users && Array.isArray(tables.users)) {
      console.log(`👥 Restoring ${tables.users.length} users...`);
      for (const user of tables.users) {
        await prisma.user.create({ data: user });
      }
      restoredCounts.users = tables.users.length;
    }

    if (tables.vehicles && Array.isArray(tables.vehicles)) {
      console.log(`🚗 Restoring ${tables.vehicles.length} vehicles...`);
      for (const vehicle of tables.vehicles) {
        await prisma.vehicle.create({ data: vehicle });
      }
      restoredCounts.vehicles = tables.vehicles.length;
    }

    if (tables.blogPosts && Array.isArray(tables.blogPosts)) {
      console.log(`📚 Restoring ${tables.blogPosts.length} blog posts...`);
      for (const post of tables.blogPosts) {
        await prisma.blogPost.create({ data: post });
      }
      restoredCounts.blogPosts = tables.blogPosts.length;
    }

    if (tables.syncLogs && Array.isArray(tables.syncLogs)) {
      console.log(`📊 Restoring ${tables.syncLogs.length} sync logs...`);
      for (const log of tables.syncLogs) {
        await prisma.syncLog.create({ data: log });
      }
      restoredCounts.syncLogs = tables.syncLogs.length;
    }

    if (tables.blogSyncLogs && Array.isArray(tables.blogSyncLogs)) {
      console.log(`📊 Restoring ${tables.blogSyncLogs.length} blog sync logs...`);
      for (const log of tables.blogSyncLogs) {
        await prisma.blogSyncLog.create({ data: log });
      }
      restoredCounts.blogSyncLogs = tables.blogSyncLogs.length;
    }

    console.log('✅ Database restoration completed successfully');
    console.log('📊 Restored records:', restoredCounts);

    return res.json({
      message: 'Database restored successfully',
      restoredCounts,
      backupMetadata: backupData.metadata
    });

  } catch (error) {
    console.error('Error restoring backup:', error);
    return res.status(500).json({ error: 'Failed to restore backup' });
  }
});

// GET /api/admin/vehicles/preview - Vista previa de vehículos con estadísticas completas
router.get('/vehicles/preview', async (req, res) => {
  try {
    console.log('📊 Generating vehicles preview for admin...');
    
    // Estadísticas generales
    const [totalVehicles, vehiclesWithImages, vehiclesWithoutImages, featuredVehicles, activeVehicles, soldVehicles] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { imatgeDestacadaUrl: { not: null } } }),
      prisma.vehicle.count({ where: { imatgeDestacadaUrl: null } }),
      prisma.vehicle.count({ where: { anunciDestacat: { not: 0 } } }),
      prisma.vehicle.count({ where: { anunciActiu: true } }),
      prisma.vehicle.count({ where: { venut: true } })
    ]);

    // Ejemplos de vehículos con imágenes (los más recientes sincronizados)
    const vehiclesWithImagesExamples = await prisma.vehicle.findMany({
      where: { imatgeDestacadaUrl: { not: null } },
      select: {
        id: true,
        slug: true,
        titolAnunci: true,
        preu: true,
        marcaCotxe: true,
        marcaMoto: true,
        tipusVehicle: true,
        imatgeDestacadaUrl: true,
        galeriaVehicleUrls: true,
        any: true,
        quilometratge: true,
        anunciActiu: true,
        anunciDestacat: true,
        lastSyncAt: true,
        professionalId: true
      },
      take: 5,
      orderBy: { lastSyncAt: 'desc' }
    });

    // Ejemplos de vehículos sin imágenes (necesitan sincronización)
    const vehiclesWithoutImagesExamples = await prisma.vehicle.findMany({
      where: { imatgeDestacadaUrl: null },
      select: {
        id: true,
        slug: true,
        titolAnunci: true,
        preu: true,
        marcaCotxe: true,
        marcaMoto: true,
        tipusVehicle: true,
        lastSyncAt: true,
        dataCreacio: true,
        professionalId: true
      },
      take: 5,
      orderBy: { dataCreacio: 'desc' }
    });

    // Distribución por tipo de vehículo
    const vehicleTypeDistribution = await prisma.vehicle.groupBy({
      by: ['tipusVehicle'],
      _count: true,
      orderBy: { _count: { tipusVehicle: 'desc' } }
    });

    // Distribución por marcas (top 10)
    const carBrandDistribution = await prisma.vehicle.groupBy({
      by: ['marcaCotxe'],
      where: { marcaCotxe: { not: null } },
      _count: true,
      orderBy: { _count: { marcaCotxe: 'desc' } },
      take: 10
    });

    // Distribución por estado del vehículo (nuevo, seminuevo, km0, etc.)
    const vehicleStateDistribution = await prisma.vehicle.groupBy({
      by: ['estatVehicle'],
      where: { estatVehicle: { not: null } },
      _count: true,
      orderBy: { _count: { estatVehicle: 'desc' } }
    });

    // Estadísticas de imágenes
    const imageStats = {
      withImages: vehiclesWithImages,
      withoutImages: vehiclesWithoutImages,
      total: totalVehicles,
      imagePercentage: totalVehicles > 0 ? Math.round((vehiclesWithImages / totalVehicles) * 100) : 0
    };

    // Estadísticas de estado
    const statusStats = {
      active: activeVehicles,
      inactive: totalVehicles - activeVehicles,
      featured: featuredVehicles,
      sold: soldVehicles,
      available: totalVehicles - soldVehicles
    };

    return res.json({
      summary: {
        totalVehicles,
        imageStats,
        statusStats
      },
      distributions: {
        vehicleTypes: Object.fromEntries(
          vehicleTypeDistribution.map(v => [v.tipusVehicle, v._count])
        ),
        vehicleStates: Object.fromEntries(
          vehicleStateDistribution.map(v => [v.estatVehicle!, v._count])
        ),
        topCarBrands: Object.fromEntries(
          carBrandDistribution.map(v => [v.marcaCotxe!, v._count])
        )
      },
      examples: {
        withImages: vehiclesWithImagesExamples.map(v => ({
          ...v,
          galleryCount: v.galeriaVehicleUrls?.length || 0,
          hasImages: true,
          syncedRecently: v.lastSyncAt && new Date().getTime() - v.lastSyncAt.getTime() < 24 * 60 * 60 * 1000
        })),
        withoutImages: vehiclesWithoutImagesExamples.map(v => ({
          ...v,
          hasImages: false,
          needsSync: true,
          daysSinceCreated: v.dataCreacio ? Math.floor((new Date().getTime() - v.dataCreacio.getTime()) / (24 * 60 * 60 * 1000)) : 0
        }))
      },
      recommendations: {
        syncNeeded: vehiclesWithoutImages > 0,
        prioritySync: vehiclesWithoutImagesExamples.slice(0, 3).map(v => v.slug)
      }
    });

  } catch (error) {
    console.error('❌ Error generating vehicles preview:', error);
    return res.status(500).json({ 
      error: 'Failed to generate vehicles preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/blogs/preview - Vista previa de posts de blog con información completa
router.get('/blogs/preview', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const posts = await prisma.blogPost.findMany({
      skip: offset,
      take: limit,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        originalId: true,
        title: true,
        slug: true,
        content: true,
        excerpt: true,
        featuredImage: true,
        date: true,
        author: true,
        categories: true,
        categoryNames: true,
        tags: true,
        tagNames: true,
        seo: true,
        seoTitle: true,
        seoDescription: true,
        status: true,
        isActive: true,
        lastSyncAt: true,
        createdAt: true
      }
    });

    const total = await prisma.blogPost.count();
    const pages = Math.ceil(total / limit);

    // Estadísticas de posts
    const activePosts = posts.filter(p => p.isActive).length;
    const withFeaturedImage = posts.filter(p => p.featuredImage).length;
    const withSEO = posts.filter(p => p.seoTitle && p.seoDescription).length;
    const withCategories = posts.filter(p => p.categoryNames && p.categoryNames.length > 0).length;
    const withTags = posts.filter(p => p.tagNames && p.tagNames.length > 0).length;
    const publishedPosts = posts.filter(p => p.status === 'publish').length;

    // Estadísticas adicionales de toda la base de datos
    const [totalActivePosts, totalWithImages, totalPublished] = await Promise.all([
      prisma.blogPost.count({ where: { isActive: true } }),
      prisma.blogPost.count({ where: { featuredImage: { not: null } } }),
      prisma.blogPost.count({ where: { status: 'publish' } })
    ]);

    return res.json({
      posts: posts.map(post => ({
        ...post,
        excerpt: post.excerpt ? post.excerpt.substring(0, 200) + '...' : null,
        content: post.content ? post.content.substring(0, 300) + '...' : null,
        categoriesCount: post.categoryNames ? post.categoryNames.length : 0,
        tagsCount: post.tagNames ? post.tagNames.length : 0,
        hasFeaturedImage: !!post.featuredImage,
        hasSEO: !!(post.seoTitle && post.seoDescription)
      })),
      pagination: {
        total,
        pages,
        currentPage: page,
        limit
      },
      statistics: {
        total: posts.length,
        activePosts: activePosts,
        withFeaturedImage: withFeaturedImage,
        withSEO: withSEO,
        withCategories: withCategories,
        withTags: withTags,
        publishedPosts: publishedPosts,
        globalStats: {
          totalPosts: total,
          totalActivePosts: totalActivePosts,
          totalWithImages: totalWithImages,
          totalPublished: totalPublished
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching blogs preview:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch blogs preview',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-vehicles-json - Importar vehículos desde JSON por lotes
router.post('/import-vehicles-json', async (req, res) => {
  try {
    const { batchSize = 50, delayBetweenBatches = 1000 } = req.body;
    
    console.log('🚀 Starting JSON vehicle import...');
    console.log(`📦 Batch size: ${batchSize}, Delay: ${delayBetweenBatches}ms`);
    
    // Usar el archivo JSON por defecto
    const importId = await importFromDefaultJson(batchSize, delayBetweenBatches);
    
    return res.json({
      message: 'Vehicle import from JSON started successfully',
      importId: importId,
      status: 'started',
      batchSize: batchSize,
      delayBetweenBatches: delayBetweenBatches,
      note: 'Check import status at /api/admin/import-status to monitor progress'
    });

  } catch (error) {
    console.error('❌ Error starting JSON import:', error);
    return res.status(500).json({ 
      error: 'Failed to start JSON import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-vehicles-json-file - Importar vehículos desde archivo JSON específico
router.post('/import-vehicles-json-file', async (req, res) => {
  try {
    const { filePath, batchSize = 50, delayBetweenBatches = 1000 } = req.body;
    
    if (!filePath) {
      return res.status(400).json({ error: 'File path is required' });
    }
    
    console.log(`🚀 Starting JSON vehicle import from file: ${filePath}...`);
    console.log(`📦 Batch size: ${batchSize}, Delay: ${delayBetweenBatches}ms`);
    
    const importId = await importVehiclesFromJson(filePath, batchSize, delayBetweenBatches);
    
    return res.json({
      message: 'Vehicle import from JSON file started successfully',
      importId: importId,
      filePath: filePath,
      status: 'started',
      batchSize: batchSize,
      delayBetweenBatches: delayBetweenBatches,
      note: 'Check import status at /api/admin/import-status to monitor progress'
    });

  } catch (error) {
    console.error('❌ Error starting JSON file import:', error);
    return res.status(500).json({ 
      error: 'Failed to start JSON file import',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/admin/import-status - Obtener estado de la importación actual
router.get('/import-status', async (req, res) => {
  try {
    const importLog = getImportStatus();
    
    if (!importLog) {
      return res.json({
        isRunning: false,
        currentImport: null,
        message: 'No import currently running'
      });
    }
    
    const progressPercentage = importLog.totalVehicles > 0 
      ? Math.round((importLog.processedVehicles / importLog.totalVehicles) * 100)
      : 0;
    
    const elapsedTime = importLog.completedAt 
      ? importLog.completedAt.getTime() - importLog.startedAt.getTime()
      : new Date().getTime() - importLog.startedAt.getTime();
    
    const estimatedTimeRemaining = importLog.processedVehicles > 0 && importLog.status === 'running'
      ? Math.round((elapsedTime / importLog.processedVehicles) * (importLog.totalVehicles - importLog.processedVehicles))
      : null;

    return res.json({
      isRunning: importLog.status === 'running',
      currentImport: {
        id: importLog.id,
        status: importLog.status,
        totalVehicles: importLog.totalVehicles,
        processedVehicles: importLog.processedVehicles,
        createdVehicles: importLog.createdVehicles,
        updatedVehicles: importLog.updatedVehicles,
        errorVehicles: importLog.errorVehicles,
        progressPercentage: progressPercentage,
        startedAt: importLog.startedAt,
        completedAt: importLog.completedAt,
        elapsedTimeMs: elapsedTime,
        estimatedTimeRemainingMs: estimatedTimeRemaining,
        errors: importLog.errors.slice(-5) // Solo los últimos 5 errores
      }
    });

  } catch (error) {
    console.error('❌ Error getting import status:', error);
    return res.status(500).json({ 
      error: 'Failed to get import status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoints eliminados por seguridad - solo usar emergency-db-fix

// POST /api/admin/emergency-db-fix - Fix SOLO para este problema específico
router.post('/emergency-db-fix', async (req, res) => {
  try {
    console.log('🚀 Initializing database from admin panel...');
    
    let results = {
      dataTypesFix: null as any,
      vehicleImport: null as any,
      steps: [] as string[]
    };
    
    // Usar comandos raw de MongoDB a través de Prisma para evitar problemas de conexión
    console.log('🔧 Using Prisma raw commands to avoid connection issues...');
    
    try {
      // Paso 1: Corregir tipos de datos usando comandos raw
      console.log('📊 Step 1: Fixing data types...');
      results.steps.push('Starting data type correction...');
      
      try {
        // Usar updateMany para corregir tipos sin replica set
        const vehiclesWithStringPrices = await prisma.vehicle.findMany({
          where: { preu: { not: { gte: 0 } } } // Encuentra precios no numéricos
        });
        
        let preuFixed = 0;
        for (const vehicle of vehiclesWithStringPrices) {
          const numericPrice = parseFloat(String(vehicle.preu)) || 0;
          await prisma.vehicle.update({
            where: { id: vehicle.id },
            data: { preu: numericPrice }
          });
          preuFixed++;
        }
        
        // Para garantía, simplemente asegurar que sea string
        const vehiclesWithBoolGarantia = await prisma.vehicle.findMany({
          where: { garantia: { not: null } }
        });
        
        let garantiaFixed = 0;
        for (const vehicle of vehiclesWithBoolGarantia) {
          if (typeof vehicle.garantia !== 'string') {
            await prisma.vehicle.update({
              where: { id: vehicle.id },
              data: { garantia: String(vehicle.garantia) }
            });
            garantiaFixed++;
          }
        }
        
        const fixPreuResult = { nModified: preuFixed };
        const fixGarantiaResult = { nModified: garantiaFixed };
        
        results.dataTypesFix = {
          preuFixed,
          garantiaFixed,
          success: true
        };
        
        results.steps.push(`✅ Fixed ${preuFixed} prices and ${garantiaFixed} guarantees`);
        
      } catch (fixError) {
        console.error('Error fixing data types:', fixError);
        results.dataTypesFix = {
          error: fixError instanceof Error ? fixError.message : 'Unknown error',
          success: false
        };
        results.steps.push('❌ Error fixing data types');
      }
      
      // Paso 2: Importar vehículos desde JSON si existe
      console.log('📄 Step 2: Importing vehicles from JSON...');
      results.steps.push('Checking for vehicles JSON file...');
      
      try {
        const fs = require('fs');
        const jsonPath = 'vehicles_export.json';
        
        if (fs.existsSync(jsonPath)) {
          results.steps.push('JSON file found, importing vehicles...');
          
          const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
          const vehicles = jsonData.vehicles || jsonData;
          
          if (Array.isArray(vehicles) && vehicles.length > 0) {
            // Limpiar vehículos existentes usando deleteMany
            const deleteResult = await prisma.vehicle.deleteMany({});
            results.steps.push(`🗑️ Deleted existing vehicles`);
            
            // Importar nuevos vehículos usando comando raw
            let imported = 0;
            let errors = 0;
            
            // Procesar vehículos en lotes para mejor rendimiento
            const batchSize = 50;
            for (let i = 0; i < vehicles.length; i += batchSize) {
              const batch = vehicles.slice(i, i + batchSize);
              const documentsToInsert: any[] = [];
              
              for (const vehicle of batch) {
                try {
                  const { _id, ...cleanVehicle } = vehicle;
                  
                  // Asegurar tipos correctos
                  const processedVehicle = {
                    ...cleanVehicle,
                    preu: typeof cleanVehicle.preu === 'number' 
                      ? cleanVehicle.preu 
                      : parseFloat(cleanVehicle.preu) || 0,
                    garantia: cleanVehicle.garantia !== undefined 
                      ? String(cleanVehicle.garantia) 
                      : null,
                    dataCreacio: cleanVehicle.dataCreacio 
                      ? new Date(cleanVehicle.dataCreacio) 
                      : new Date(),
                    createdAt: cleanVehicle.createdAt 
                      ? new Date(cleanVehicle.createdAt) 
                      : new Date(),
                    updatedAt: new Date()
                  };
                  
                  documentsToInsert.push(processedVehicle);
                  
                } catch (vehicleError) {
                  console.error('Error processing vehicle:', vehicleError);
                  errors++;
                }
              }
              
              // Insertar lote usando comando raw
              if (documentsToInsert.length > 0) {
                try {
                  await prisma.vehicle.createMany({
                    data: documentsToInsert
                  });
                  imported += documentsToInsert.length;
                  console.log(`💾 Imported ${imported}/${vehicles.length} vehicles...`);
                } catch (batchError) {
                  console.error('Error inserting batch:', batchError);
                  errors += documentsToInsert.length;
                }
              }
              
              if (errors > 50) break; // Stop if too many errors
            }
            
            results.vehicleImport = {
              imported,
              errors,
              total: vehicles.length,
              success: true
            };
            
            results.steps.push(`✅ Imported ${imported} vehicles (${errors} errors)`);
            
          } else {
            results.steps.push('⚠️ JSON file is empty or invalid format');
            results.vehicleImport = { success: false, message: 'Empty JSON file' };
          }
          
        } else {
          results.steps.push('📄 No JSON file found, skipping import');
          results.vehicleImport = { success: false, message: 'No JSON file found' };
        }
        
      } catch (importError) {
        console.error('Error importing vehicles:', importError);
        results.vehicleImport = {
          error: importError instanceof Error ? importError.message : 'Unknown error',
          success: false
        };
        results.steps.push('❌ Error importing vehicles');
      }
      
    } catch (mainError) {
      console.error('❌ Main error:', mainError);
      return res.status(500).json({ 
        error: 'Failed to initialize database',
        details: mainError instanceof Error ? mainError.message : 'Unknown error'
      });
    }
    
    // Resumen final
    const success = results.dataTypesFix?.success && results.vehicleImport?.success;
    results.steps.push(success ? '🎉 Database initialization completed!' : '⚠️ Initialization completed with some issues');
    
    return res.json({
      message: 'Database initialization completed',
      success: success,
      results: results,
      recommendation: success 
        ? 'Database is ready. You may need to restart the service for all changes to take effect.'
        : 'Some steps failed. Check the results for details.'
    });
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    return res.status(500).json({ 
      error: 'Failed to initialize database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Endpoint eliminado por seguridad - solo usar emergency-db-fix para este caso específico

// Función auxiliar para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;