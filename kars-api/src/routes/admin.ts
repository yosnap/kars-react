import express from 'express';
import { PrismaClient } from '@prisma/client';
import { migrateAllUsers, getMigrationStats, syncUserFromOriginal, cleanMigrationData } from '../services/userMigrationService';
import { initializeCronSync } from '../services/syncService';
import { importFromDefaultJson, importVehiclesFromJson, getImportStatus } from '../services/vehicleImporter';
import { createInitialTranslations } from '../data/initial-vehicle-translations';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación básica para admin
const authenticateAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log('🔐 Auth middleware called');
  console.log('Expected super admin:', process.env.SUPER_ADMIN_USER);
  console.log('Expected admin:', process.env.ADMIN_USER);
  
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

  // Verificar credenciales para super admin
  const isSuperAdmin = username === process.env.SUPER_ADMIN_USER && password === process.env.SUPER_ADMIN_PASS;
  
  // Verificar credenciales para admin regular
  const isAdmin = username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS;
  
  console.log('Super admin match:', isSuperAdmin);
  console.log('Admin match:', isAdmin);
  
  if (!isSuperAdmin && !isAdmin) {
    console.log('❌ Invalid credentials');
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Agregar información del rol al request para uso posterior
  (req as any).userRole = isSuperAdmin ? 'super_admin' : 'admin';
  (req as any).username = username;

  console.log('✅ Authentication successful as:', (req as any).userRole);
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

// POST /api/admin/emergency-db-fix - Fix SOLO para este problema específico (SIN AUTH)
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
        // Paso 1: SKIP Brand cleanup (too corrupted, needs replica set)
        console.log('🔧 Skipping Brand table cleanup (corrupted dates, would need replica set)...');
        let brandDatesFixed = 0;
        console.log(`⚠️ Brand cleanup skipped - use installer instead`);
        
        // Paso 2: Limpiar datos de vehículos
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
          brandDatesFixed,
          success: true
        };
        
        results.steps.push(`✅ Fixed ${brandDatesFixed} brand dates, ${preuFixed} prices and ${garantiaFixed} guarantees`);
        
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
            // Limpiar vehículos existentes uno por uno (sin transacciones)
            const existingVehicles = await prisma.vehicle.findMany({ select: { id: true } });
            let deletedCount = 0;
            
            for (const vehicle of existingVehicles) {
              try {
                await prisma.vehicle.delete({ where: { id: vehicle.id } });
                deletedCount++;
              } catch (deleteError) {
                console.log(`Error deleting vehicle ${vehicle.id}:`, deleteError);
              }
            }
            
            results.steps.push(`🗑️ Deleted ${deletedCount} existing vehicles`);
            
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
              
              // Insertar vehículos uno por uno (sin transacciones)
              for (const vehicleData of documentsToInsert) {
                try {
                  await prisma.vehicle.create({
                    data: vehicleData
                  });
                  imported++;
                  if (imported % 10 === 0) {
                    console.log(`💾 Imported ${imported}/${vehicles.length} vehicles...`);
                  }
                } catch (createError) {
                  console.error('Error creating vehicle:', createError);
                  errors++;
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

// POST /api/admin/nuclear-db-reset - Recrear base de datos completamente
router.post('/nuclear-db-reset', async (req, res) => {
  try {
    console.log('💥 NUCLEAR DB RESET: Recreating entire database...');
    
    let results = {
      droppedCollections: [] as string[],
      errors: [] as string[]
    };
    
    // Lista de colecciones a limpiar
    const collectionsToClean = ['Brand', 'Vehicle', 'Model', 'CarExtra', 'MotorcycleExtra', 'MotorhomeExtra'];
    
    for (const collection of collectionsToClean) {
      try {
        console.log(`🗑️ Dropping collection ${collection}...`);
        
        // Usar Prisma para encontrar y borrar documentos individualmente
        if (collection === 'Vehicle') {
          const vehicles = await prisma.vehicle.findMany({ select: { id: true } });
          for (const vehicle of vehicles) {
            try {
              await prisma.vehicle.delete({ where: { id: vehicle.id } });
            } catch (e) { /* ignore */ }
          }
          results.droppedCollections.push(`Vehicle (${vehicles.length} docs)`);
        }
        // Saltamos Brand porque está corrupta
        else if (collection === 'Brand') {
          console.log('⚠️ Skipping Brand (too corrupted)');
          results.errors.push('Brand collection too corrupted to clean');
        }
        // Otros modelos
        else {
          console.log(`⚠️ Skipping ${collection} (not implemented)`);
        }
        
      } catch (error) {
        console.error(`Error cleaning ${collection}:`, error);
        results.errors.push(`${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
    
    return res.json({
      message: 'Nuclear DB reset completed',
      success: true,
      results,
      recommendation: 'Database partially cleaned. You may need to drop the database manually in MongoDB for complete reset.'
    });
    
  } catch (error) {
    console.error('❌ Error in nuclear-db-reset:', error);
    return res.status(500).json({ 
      error: 'Failed to perform nuclear DB reset',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-production-data-native - Importar datos usando MongoDB nativo
router.post('/import-production-data-native', async (req, res) => {
  try {
    console.log('📥 Starting NATIVE MongoDB import...');
    
    const { MongoClient } = require('mongodb');
    const fs = require('fs');
    
    // Obtener URL de MongoDB desde Prisma
    const dbUrl = process.env.DATABASE_URL || '';
    const client = new MongoClient(dbUrl);
    
    await client.connect();
    const db = client.db();
    
    // Leer datos
    const jsonPath = 'production-import.json';
    if (!fs.existsSync(jsonPath)) {
      await client.close();
      return res.status(400).json({ error: 'production-import.json not found' });
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    let results = {
      brands: { imported: 0, errors: 0 },
      vehicles: { imported: 0, errors: 0 }
    };
    
    // Importar marcas directamente
    try {
      const brandCollection = db.collection('Brand');
      await brandCollection.deleteMany({}); // Limpiar
      
      for (const brand of data.brands) {
        brand.lastSyncAt = new Date(brand.lastSyncAt);
        brand.createdAt = new Date(brand.createdAt);
        brand.updatedAt = new Date(brand.updatedAt);
      }
      
      const brandResult = await brandCollection.insertMany(data.brands);
      results.brands.imported = brandResult.insertedCount;
    } catch (error) {
      console.error('Brand import error:', error);
      results.brands.errors = data.brands.length;
    }
    
    // Importar vehículos directamente
    try {
      const vehicleCollection = db.collection('Vehicle');
      await vehicleCollection.deleteMany({}); // Limpiar
      
      // Mapear campos correctamente
      const mappedVehicles = data.vehicles.map(vehicle => {
        const mapped: any = {};
        
        // Mapeo de campos con guiones
        const fieldMap = {
          'titolAnunci': 'titol-anunci',
          'descripcioAnunci': 'descripcio-anunci',
          'descripcioAnunciCA': 'descripcio-anunci-ca',
          'descripcioAnunciEN': 'descripcio-anunci-en',
          'descripcioAnunciFR': 'descripcio-anunci-fr',
          'descripcioAnunciES': 'descripcio-anunci-es',
          'anunciActiu': 'anunci-actiu',
          'anunciDestacat': 'anunci-destacat',
          'diesCaducitat': 'dies-caducitat',
          'tipusVehicle': 'tipus-vehicle',
          'marquesAutocaravana': 'marques-autocaravana',
          'modelsAutocaravana': 'models-autocaravana',
          'marcaCotxe': 'marca-cotxe',
          'marcaMoto': 'marca-moto',
          'modelsCotxe': 'models-cotxe',
          'modelsMoto': 'models-moto',
          'estatVehicle': 'estat-vehicle',
          'tipusPropulsor': 'tipus-propulsor',
          'tipusCombustible': 'tipus-combustible',
          'tipusCanvi': 'tipus-canvi',
          'carrosseriaCotxe': 'carrosseria-cotxe',
          'carrosseriaMoto': 'carrosseria-moto',
          'carrosseriaCaravana': 'carrosseria-caravana',
          'potenciaCv': 'potencia-cv',
          'numeroMotors': 'numero-motors',
          'cvMotorDavant': 'cv-motor-davant',
          'kwMotorDavant': 'kw-motor-davant',
          'potenciaKw': 'potencia-kw',
          'emissionsVehicle': 'emissions-vehicle',
          'cvMotorDarrere': 'cv-motor-darrere',
          'kwMotorDarrere': 'kw-motor-darrere',
          'potenciaCombinada': 'potencia-combinada',
          'autonomiaWltp': 'autonomia-wltp',
          'autonomiaUrbanaWltp': 'autonomia-urbana-wltp',
          'autonomiaExtraurbanaWltp': 'autonomia-extraurbana-wltp',
          'autonomiaElectrica': 'autonomia-electrica',
          'cablesRecarrega': 'cables-recarrega',
          'velocitatRecarrega': 'velocitat-recarrega',
          'frenadaRegenerativa': 'frenada-regenerativa',
          'onePedal': 'one-pedal',
          'tempsRecarregaTotal': 'temps-recarrega-total',
          'tempsRecarregaFins80': 'temps-recarrega-fins-80',
          'colorVehicle': 'color-vehicle',
          'placesCotxe': 'places-cotxe',
          'placesMoto': 'places-moto',
          'aireAcondicionat': 'aire-acondicionat',
          'tipusTapisseria': 'tipus-tapisseria',
          'portesCotxe': 'portes-cotxe',
          'colorTapisseria': 'color-tapisseria',
          'numeroMaletersCotxe': 'numero-maleters-cotxe',
          'capacitatMaletersCotxe': 'capacitat-maleters-cotxe',
          'capacitatTotalL': 'capacitat-total-l',
          'vehicleFumador': 'vehicle-fumador',
          'rodaRecanvi': 'roda-recanvi',
          'acceleracio060': 'acceleracio-0-60',
          'acceleracio0100Cotxe': 'acceleracio-0-100-cotxe',
          'velocitatMaxima': 'velocitat-maxima',
          'tipusCanviMoto': 'tipus-de-canvi-moto',
          'preuMensual': 'preu-mensual',
          'preuDiari': 'preu-diari',
          'preuAntic': 'preu-antic',
          'videoVehicle': 'video-vehicle',
          'cvMotor3': 'cv-motor-3',
          'kwMotor3': 'kw-motor-3',
          'cvMotor4': 'cv-motor-4',
          'kwMotor4': 'kw-motor-4',
          'extresCotxe': 'extres-cotxe',
          'extresMoto': 'extres-moto',
          'extresAutocaravana': 'extres-autocaravana',
          'extresHabitacle': 'extres-habitacle',
          'emissionsCo2': 'emissions-co2',
          'consumUrba': 'consum-urba',
          'consumCarretera': 'consum-carretera',
          'consumMixt': 'consum-mixt',
          'categoriaEcologica': 'categoria-ecologica',
          'vehicleAccidentat': 'vehicle-accidentat',
          'llibreManteniment': 'llibre-manteniment',
          'revisionsOficials': 'revisions-oficials',
          'impostosDeduibles': 'impostos-deduibles',
          'vehicleACanvi': 'vehicle-a-canvi',
          'nombrePropietaris': 'nombre-propietaris',
          'imatgeDestacadaUrl': 'imatge-destacada-url',
          'galeriaVehicleUrls': 'galeria-vehicle-urls',
          'notesInternes': 'notes-internes',
          'dataCreacio': 'data-creacio',
          'dataModificacio': 'data-modificacio'
        };
        
        // Mapear cada campo
        for (const [key, value] of Object.entries(vehicle)) {
          const mappedKey = fieldMap[key] || key;
          
          // Valores por defecto para campos requeridos
          if (mappedKey === 'anunci-actiu' && value === null) {
            mapped[mappedKey] = true;
          } else if (mappedKey === 'anunci-destacat' && value === null) {
            mapped[mappedKey] = 0;
          } else if (mappedKey === 'tipus-vehicle' && !value) {
            mapped[mappedKey] = 'cotxe';
          } else if (mappedKey === 'titol-anunci' && !value) {
            mapped[mappedKey] = 'Vehicle';
          } else if (mappedKey === 'slug' && !value) {
            mapped[mappedKey] = 'vehicle-default';
          } else if (mappedKey === 'venut' && value === null) {
            mapped[mappedKey] = false;
          } else if (mappedKey === 'estat' && !value) {
            mapped[mappedKey] = 'nou';
          } else if (mappedKey === 'preu' && (value === null || value === undefined)) {
            mapped[mappedKey] = 0;
          } else {
            mapped[mappedKey] = value;
          }
        }
        
        // Convertir fechas
        if (mapped['data-creacio']) mapped['data-creacio'] = new Date(mapped['data-creacio']);
        if (mapped['data-modificacio']) mapped['data-modificacio'] = new Date(mapped['data-modificacio']);
        if (mapped.dataCreacio) mapped.dataCreacio = new Date(mapped.dataCreacio);
        if (mapped.dataModificacio) mapped.dataModificacio = new Date(mapped.dataModificacio);
        if (mapped.createdAt) mapped.createdAt = new Date(mapped.createdAt);
        if (mapped.updatedAt) mapped.updatedAt = new Date(mapped.updatedAt);
        if (mapped.lastSyncAt) mapped.lastSyncAt = new Date(mapped.lastSyncAt);
        
        // Asegurar arrays
        if (!Array.isArray(mapped.imatges)) mapped.imatges = [];
        if (!Array.isArray(mapped.extras)) mapped.extras = [];
        if (!Array.isArray(mapped['extres-cotxe'])) mapped['extres-cotxe'] = [];
        if (!Array.isArray(mapped['extres-moto'])) mapped['extres-moto'] = [];
        if (!Array.isArray(mapped['extres-autocaravana'])) mapped['extres-autocaravana'] = [];
        if (!Array.isArray(mapped['extres-habitacle'])) mapped['extres-habitacle'] = [];
        if (!Array.isArray(mapped['galeria-vehicle-urls'])) mapped['galeria-vehicle-urls'] = [];
        
        return mapped;
      });
      
      const vehicleResult = await vehicleCollection.insertMany(mappedVehicles);
      results.vehicles.imported = vehicleResult.insertedCount;
    } catch (error) {
      console.error('Vehicle import error:', error);
      results.vehicles.errors = data.vehicles.length;
    }
    
    await client.close();
    
    return res.json({
      success: true,
      message: 'Native MongoDB import completed',
      results
    });
    
  } catch (error) {
    console.error('Native import error:', error);
    return res.status(500).json({
      error: 'Native import failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/import-production-data - Importar datos desde JSON
router.post('/import-production-data', async (req, res) => {
  try {
    console.log('📥 Starting production data import...');
    
    // PASO 0: Limpiar base de datos primero
    console.log('🧹 Cleaning existing data...');
    try {
      // Borrar vehículos existentes
      const existingVehicles = await prisma.vehicle.findMany({ select: { id: true } });
      for (const vehicle of existingVehicles) {
        try {
          await prisma.vehicle.delete({ where: { id: vehicle.id } });
        } catch (e) { /* ignore */ }
      }
      
      // Saltamos brands corruptas - no podemos acceder
      console.log('⚠️ Skipping brand cleanup due to corruption');
      
    } catch (cleanError) {
      console.log('⚠️ Cleanup had issues, continuing with import...');
    }
    
    const fs = require('fs');
    const jsonPath = 'production-import.json';
    
    if (!fs.existsSync(jsonPath)) {
      return res.status(400).json({
        success: false,
        error: 'production-import.json file not found'
      });
    }
    
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    let results = {
      brands: { imported: 0, errors: 0 },
      vehicles: { imported: 0, errors: 0 },
      steps: [] as string[]
    };
    
    // Importar marcas
    console.log(`📂 Importing ${data.brands.length} brands...`);
    results.steps.push(`Starting import of ${data.brands.length} brands`);
    
    for (const brand of data.brands) {
      try {
        const { id, ...brandData } = brand;
        
        // Usar upsert para evitar duplicados
        await prisma.brand.upsert({
          where: { slug: brandData.slug },
          create: {
            ...brandData,
            lastSyncAt: new Date(brandData.lastSyncAt),
            createdAt: new Date(brandData.createdAt),
            updatedAt: new Date(brandData.updatedAt)
          },
          update: {
            ...brandData,
            lastSyncAt: new Date(brandData.lastSyncAt),
            updatedAt: new Date()
          }
        });
        results.brands.imported++;
      } catch (error) {
        console.error(`Error importing brand ${brand.slug}:`, error.message);
        results.brands.errors++;
      }
    }
    
    // Importar vehículos
    console.log(`🚗 Importing ${data.vehicles.length} vehicles...`);
    results.steps.push(`Starting import of ${data.vehicles.length} vehicles`);
    
    for (const vehicle of data.vehicles) {
      try {
        const { id, ...vehicleData } = vehicle;
        await prisma.vehicle.create({
          data: {
            ...vehicleData,
            'data-creacio': new Date(vehicleData['data-creacio']),
            'data-modificacio': vehicleData['data-modificacio'] ? new Date(vehicleData['data-modificacio']) : null,
            dataCreacio: new Date(vehicleData.dataCreacio),
            dataModificacio: vehicleData.dataModificacio ? new Date(vehicleData.dataModificacio) : null,
            createdAt: new Date(vehicleData.createdAt),
            updatedAt: new Date(vehicleData.updatedAt),
            lastSyncAt: vehicleData.lastSyncAt ? new Date(vehicleData.lastSyncAt) : null
          }
        });
        results.vehicles.imported++;
      } catch (error) {
        console.error(`Error importing vehicle ${vehicle.slug}:`, error);
        results.vehicles.errors++;
      }
    }
    
    results.steps.push(`✅ Import completed: ${results.brands.imported} brands, ${results.vehicles.imported} vehicles`);
    
    return res.json({
      success: true,
      message: 'Production data import completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Error importing production data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import production data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/admin/clean-imported-data - Limpiar datos importados para compatibilidad con Prisma
router.post('/clean-imported-data', async (req, res) => {
  try {
    console.log('🧹 Starting data cleanup for Prisma compatibility...');
    
    const { MongoClient } = require('mongodb');
    
    // Obtener URL de MongoDB desde Prisma
    const dbUrl = process.env.DATABASE_URL || '';
    const client = new MongoClient(dbUrl);
    
    await client.connect();
    const db = client.db();
    
    const results = {
      vehiclesFixed: 0,
      brandsFixed: 0,
      errors: 0,
      steps: [] as string[]
    };
    
    results.steps.push('🔍 Analyzing Vehicle collection...');
    
    // Limpiar colección Vehicle
    const vehicleCollection = db.collection('Vehicle');
    const vehicles = await vehicleCollection.find({}).toArray();
    results.steps.push(`📊 Found ${vehicles.length} vehicles to check`);
    
    for (const vehicle of vehicles) {
      try {
        const updates: any = {};
        let needsUpdate = false;
        
        // Asegurar campos requeridos no-null
        if (!vehicle.titolAnunci || vehicle.titolAnunci === null) {
          updates.titolAnunci = vehicle.slug || vehicle.marca || 'Vehicle';
          needsUpdate = true;
        }
        
        if (!vehicle.slug || vehicle.slug === null) {
          updates.slug = vehicle.titolAnunci || vehicle.marca || `vehicle-${vehicle._id}`;
          needsUpdate = true;
        }
        
        if (!vehicle.marca || vehicle.marca === null) {
          updates.marca = 'Unknown';
          needsUpdate = true;
        }
        
        if (!vehicle.model || vehicle.model === null) {
          updates.model = 'Unknown';
          needsUpdate = true;
        }
        
        if (!vehicle.tipusVehicle || vehicle.tipusVehicle === null) {
          updates.tipusVehicle = 'cotxe';
          needsUpdate = true;
        }
        
        if (!vehicle.tipusCarrosseria || vehicle.tipusCarrosseria === null) {
          updates.tipusCarrosseria = 'Unknown';
          needsUpdate = true;
        }
        
        if (!vehicle.tipusCombustible || vehicle.tipusCombustible === null) {
          updates.tipusCombustible = 'Unknown';
          needsUpdate = true;
        }
        
        if (!vehicle.tipusTransmissio || vehicle.tipusTransmissio === null) {
          updates.tipusTransmissio = 'Unknown';
          needsUpdate = true;
        }
        
        if (!vehicle.estat || vehicle.estat === null) {
          updates.estat = 'nou';
          needsUpdate = true;
        }
        
        if (!vehicle.preu || vehicle.preu === null) {
          updates.preu = 0;
          needsUpdate = true;
        }
        
        // Asegurar que arrays no sean null
        if (!Array.isArray(vehicle.imatges)) {
          updates.imatges = [];
          needsUpdate = true;
        }
        
        if (!Array.isArray(vehicle.extras)) {
          updates.extras = [];
          needsUpdate = true;
        }
        
        // Limpiar campos de fecha
        const dateFields = ['dataCreacio', 'dataModificacio', 'createdAt', 'updatedAt', 'lastSyncAt'];
        for (const field of dateFields) {
          if (vehicle[field] && typeof vehicle[field] === 'string') {
            // Remover comillas dobles si existen
            const cleanDate = vehicle[field].replace(/^"|"$/g, '');
            try {
              updates[field] = new Date(cleanDate);
              needsUpdate = true;
            } catch (e) {
              if (field === 'dataCreacio' || field === 'createdAt') {
                updates[field] = new Date();
                needsUpdate = true;
              }
            }
          }
        }
        
        if (needsUpdate) {
          await vehicleCollection.updateOne(
            { _id: vehicle._id },
            { $set: updates }
          );
          results.vehiclesFixed++;
        }
        
      } catch (error) {
        console.error(`Error fixing vehicle ${vehicle._id}:`, error);
        results.errors++;
      }
    }
    
    results.steps.push(`✅ Fixed ${results.vehiclesFixed} vehicles`);
    
    // Limpiar colección Brand
    results.steps.push('🔍 Analyzing Brand collection...');
    const brandCollection = db.collection('Brand');
    const brands = await brandCollection.find({}).toArray();
    results.steps.push(`📊 Found ${brands.length} brands to check`);
    
    for (const brand of brands) {
      try {
        const updates: any = {};
        let needsUpdate = false;
        
        if (!brand.name || brand.name === null) {
          updates.name = brand.slug || 'Unknown Brand';
          needsUpdate = true;
        }
        
        if (!brand.slug || brand.slug === null) {
          updates.slug = brand.name || `brand-${brand._id}`;
          needsUpdate = true;
        }
        
        if (!Array.isArray(brand.vehicleTypes)) {
          updates.vehicleTypes = ['cotxe'];
          needsUpdate = true;
        }
        
        if (needsUpdate) {
          await brandCollection.updateOne(
            { _id: brand._id },
            { $set: updates }
          );
          results.brandsFixed++;
        }
        
      } catch (error) {
        console.error(`Error fixing brand ${brand._id}:`, error);
        results.errors++;
      }
    }
    
    results.steps.push(`✅ Fixed ${results.brandsFixed} brands`);
    
    await client.close();
    
    results.steps.push('🎉 Data cleanup completed successfully!');
    
    return res.json({
      success: true,
      message: 'Data cleanup completed',
      results
    });
    
  } catch (error) {
    console.error('❌ Error cleaning imported data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to clean imported data',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// ===========================
// ENDPOINTS DE CONFIGURACIÓ DE TRADUCCIÓ
// ===========================

// GET /api/admin/translation-config - Obtenir configuració de traducció
router.get('/translation-config', async (req, res) => {
  try {
    console.log('📋 Obtenint configuració de traducció...');
    
    const config = await prisma.config.findFirst({
      where: { key: 'translation-config' }
    });
    
    if (!config) {
      // Retornar configuració per defecte
      const defaultConfig = {
        webhookUrl: '',
        username: '',
        password: '',
        enabled: false,
        autoTranslateNewVehicles: false,
        sourceLanguage: 'catalan',
        targetLanguages: ['spanish', 'french', 'english'],
        timeout: 30000
      };
      
      return res.json({
        success: true,
        config: defaultConfig,
        isDefault: true
      });
    }
    
    const translationConfig = JSON.parse(config.value);
    
    return res.json({
      success: true,
      config: translationConfig,
      isDefault: false,
      updatedAt: config.updatedAt
    });
    
  } catch (error) {
    console.error('❌ Error obtenint configuració de traducció:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error en obtenir la configuració de traducció',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/translation-config - Guardar configuració de traducció
router.post('/translation-config', async (req, res) => {
  try {
    console.log('💾 Guardant configuració de traducció...');
    
    const {
      webhookUrl,
      username,
      password,
      enabled,
      autoTranslateNewVehicles,
      sourceLanguage,
      targetLanguages,
      timeout
    } = req.body;
    
    // Validacions bàsiques
    if (!webhookUrl || typeof webhookUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'La URL del webhook és obligatòria i ha de ser una cadena vàlida'
      });
    }
    
    if (!Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Almenys un idioma de destinació ha de ser especificat'
      });
    }
    
    const validLanguages = ['catalan', 'spanish', 'french', 'english'];
    if (!validLanguages.includes(sourceLanguage)) {
      return res.status(400).json({
        success: false,
        error: `L'idioma d'origen ha de ser un de: ${validLanguages.join(', ')}`
      });
    }
    
    const invalidTargetLanguages = targetLanguages.filter(lang => !validLanguages.includes(lang));
    if (invalidTargetLanguages.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Idiomes de destinació no vàlids: ${invalidTargetLanguages.join(', ')}`
      });
    }
    
    const translationConfig = {
      webhookUrl: webhookUrl.trim(),
      username: username || '',
      password: password || '',
      enabled: Boolean(enabled),
      autoTranslateNewVehicles: Boolean(autoTranslateNewVehicles),
      sourceLanguage,
      targetLanguages,
      timeout: parseInt(timeout) || 30000,
      updatedAt: new Date().toISOString()
    };
    
    // Guardar o actualitzar configuració
    await prisma.config.upsert({
      where: { key: 'translation-config' },
      create: {
        key: 'translation-config',
        value: JSON.stringify(translationConfig),
        description: 'Configuració per a traducció automàtica de descripcions de vehicles via webhook n8n'
      },
      update: {
        value: JSON.stringify(translationConfig),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Configuració de traducció guardada correctament');
    
    return res.json({
      success: true,
      message: 'Configuració de traducció guardada correctament',
      config: translationConfig
    });
    
  } catch (error) {
    console.error('❌ Error guardant configuració de traducció:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error en guardar la configuració de traducció',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/test-translation-webhook - Provar webhook de traducció
router.post('/test-translation-webhook', async (req, res) => {
  try {
    console.log('🧪 Provant webhook de traducció...');
    
    // Obtenir configuració
    const configRecord = await prisma.config.findFirst({
      where: { key: 'translation-config' }
    });
    
    if (!configRecord) {
      return res.status(400).json({
        success: false,
        error: 'Configuració de traducció no trobada'
      });
    }
    
    const config = JSON.parse(configRecord.value);
    
    if (!config.webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'URL del webhook no configurada'
      });
    }
    
    // Dades de prova
    const testData = {
      text: 'Aquest és un text de prova per comprovar la traducció automàtica.',
      sourceLanguage: config.sourceLanguage,
      targetLanguages: config.targetLanguages
    };
    
    // Preparar capçaleres
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (config.username && config.password) {
      const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
      headers['Authorization'] = `Basic ${credentials}`;
    }
    
    // Fer petició al webhook
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(config.webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(testData),
      timeout: config.timeout || 30000
    });
    
    const responseData = await response.json();
    
    console.log(`📡 Estat de resposta del webhook: ${response.status}`);
    
    if (!response.ok) {
      return res.status(400).json({
        success: false,
        error: 'Prova del webhook fallida',
        status: response.status,
        statusText: response.statusText,
        responseData
      });
    }
    
    return res.json({
      success: true,
      message: 'Prova del webhook exitosa',
      status: response.status,
      testData,
      responseData
    });
    
  } catch (error) {
    console.error('❌ Error provant webhook de traducció:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error en provar el webhook de traducció',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/sync-translations - Sincronitzar traduccions per a vehicles existents
router.post('/sync-translations', async (req, res) => {
  try {
    console.log('🔄 Iniciant sincronització de traduccions per a vehicles existents...');
    
    // Obtenir configuració
    const configRecord = await prisma.config.findFirst({
      where: { key: 'translation-config' }
    });
    
    if (!configRecord) {
      return res.status(400).json({
        success: false,
        error: 'Configuració de traducció no trobada'
      });
    }
    
    const config = JSON.parse(configRecord.value);
    
    if (!config.enabled || !config.webhookUrl) {
      return res.status(400).json({
        success: false,
        error: 'El servei de traducció no està habilitat o la URL del webhook no està configurada'
      });
    }
    
    const { vehicleIds, forceUpdate = false } = req.body;
    
    // Si s'especifiquen IDs específics, usar aquests; sinó, obtenir vehicles que necessiten traducció
    let vehicles;
    if (vehicleIds && Array.isArray(vehicleIds)) {
      vehicles = await prisma.vehicle.findMany({
        where: { 
          id: { in: vehicleIds },
          descripcioAnunci: { not: null }
        },
        select: {
          id: true,
          slug: true,
          descripcioAnunci: true,
          descripcioAnunciCA: true,
          descripcioAnunciES: true,
          descripcioAnunciFR: true,
          descripcioAnunciEN: true
        }
      });
    } else {
      // Obtenir vehicles que tenen descripció en català però els falten traduccions
      const whereCondition: any = {
        descripcioAnunci: { not: null },
        OR: []
      };
      
      if (forceUpdate) {
        // Si és forçat, actualitzar tots els que tinguin descripció
        whereCondition.OR.push({ descripcioAnunci: { not: '' } });
      } else {
        // Només els que els faltin traduccions
        if (config.targetLanguages.includes('spanish')) {
          whereCondition.OR.push({ descripcioAnunciES: null });
        }
        if (config.targetLanguages.includes('english')) {
          whereCondition.OR.push({ descripcioAnunciEN: null });
        }
        if (config.targetLanguages.includes('french')) {
          whereCondition.OR.push({ descripcioAnunciFR: null });
        }
      }
      
      vehicles = await prisma.vehicle.findMany({
        where: whereCondition,
        select: {
          id: true,
          slug: true,
          descripcioAnunci: true,
          descripcioAnunciCA: true,
          descripcioAnunciES: true,
          descripcioAnunciFR: true,
          descripcioAnunciEN: true
        },
        take: 50 // Limitar a 50 per evitar sobrecàrrega
      });
    }
    
    if (vehicles.length === 0) {
      return res.json({
        success: true,
        message: 'Cap vehicle necessita actualitzacions de traducció',
        processed: 0,
        errors: 0
      });
    }
    
    console.log(`📝 Trobats ${vehicles.length} vehicles per traduir`);
    
    let processed = 0;
    let errors = 0;
    const errorDetails: any[] = [];
    
    // Processar vehicles en lots per evitar sobrecarregar el webhook
    const batchSize = 5;
    for (let i = 0; i < vehicles.length; i += batchSize) {
      const batch = vehicles.slice(i, i + batchSize);
      
      for (const vehicle of batch) {
        try {
          const sourceText = vehicle.descripcioAnunci || vehicle.descripcioAnunciCA;
          
          if (!sourceText || sourceText.trim() === '') {
            console.log(`⚠️ Saltant vehicle ${vehicle.slug} - no hi ha text d'origen`);
            continue;
          }
          
          const translationData = {
            text: sourceText,
            sourceLanguage: config.sourceLanguage,
            targetLanguages: config.targetLanguages
          };
          
          // Preparar capçaleres
          const headers: Record<string, string> = {
            'Content-Type': 'application/json',
          };
          
          if (config.username && config.password) {
            const credentials = Buffer.from(`${config.username}:${config.password}`).toString('base64');
            headers['Authorization'] = `Basic ${credentials}`;
          }
          
          // Cridar al webhook
          const fetch = (await import('node-fetch')).default;
          const response = await fetch(config.webhookUrl, {
            method: 'POST',
            headers,
            body: JSON.stringify(translationData),
            timeout: config.timeout || 30000
          });
          
          if (!response.ok) {
            throw new Error(`El webhook ha respost amb estat ${response.status}`);
          }
          
          const translations = await response.json();
          
          // Actualitzar vehicle amb les traduccions
          const updateData: any = {};
          
          if (translations.spanish && config.targetLanguages.includes('spanish')) {
            updateData.descripcioAnunciES = translations.spanish;
          }
          if (translations.english && config.targetLanguages.includes('english')) {
            updateData.descripcioAnunciEN = translations.english;
          }
          if (translations.french && config.targetLanguages.includes('french')) {
            updateData.descripcioAnunciFR = translations.french;
          }
          
          if (Object.keys(updateData).length > 0) {
            await prisma.vehicle.update({
              where: { id: vehicle.id },
              data: {
                ...updateData,
                updatedAt: new Date()
              }
            });
          }
          
          processed++;
          console.log(`✅ Vehicle ${vehicle.slug} traduït (${processed}/${vehicles.length})`);
          
        } catch (error) {
          errors++;
          const errorMessage = error instanceof Error ? error.message : 'Error desconegut';
          console.error(`❌ Error traduint vehicle ${vehicle.slug}:`, errorMessage);
          errorDetails.push({
            vehicleId: vehicle.id,
            vehicleSlug: vehicle.slug,
            error: errorMessage
          });
        }
      }
      
      // Pausa entre lots per no sobrecarregar el webhook
      if (i + batchSize < vehicles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log(`🎉 Sincronització de traduccions completada: ${processed} processats, ${errors} errors`);
    
    return res.json({
      success: true,
      message: 'Sincronització de traduccions completada',
      totalVehicles: vehicles.length,
      processed,
      errors,
      errorDetails: errorDetails.slice(0, 10) // Només els primers 10 errors
    });
    
  } catch (error) {
    console.error('❌ Error sincronitzant traduccions:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Error en sincronitzar les traduccions',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/receive-translations - Rebre traduccions des de n8n
router.post('/receive-translations', async (req, res) => {
  try {
    const { vehicleId, translations } = req.body;

    if (!vehicleId || !translations) {
      return res.status(400).json({
        success: false,
        error: 'vehicleId i translations són obligatoris'
      });
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle no trobat'
      });
    }

    console.log(`📝 Rebent traduccions per al vehicle ${vehicleId}:`, translations);

    // Preparar datos de actualización
    const updateData: any = {};
    
    if (translations.spanish) {
      updateData.descripcioAnunciES = translations.spanish;
    }
    if (translations.english) {
      updateData.descripcioAnunciEN = translations.english;
    }
    if (translations.french) {
      updateData.descripcioAnunciFR = translations.french;
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: updateData
      });
      
      console.log(`✅ Vehicle ${vehicleId} actualitzat amb ${Object.keys(updateData).length} traduccions`);
    }

    return res.json({
      success: true,
      message: 'Traduccions guardades correctament',
      vehicleId,
      translationsApplied: Object.keys(updateData)
    });

  } catch (error) {
    console.error('❌ Error rebent traduccions:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en guardar les traduccions',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// ===========================
// ENDPOINTS DE GESTIÓ DE TRADUCCIONS DE VEHICLES
// ===========================

// GET /api/admin/vehicle-translations - Obtenir totes les traduccions de vehicles
router.get('/vehicle-translations', async (req, res) => {
  try {
    console.log('📋 Obtenint traduccions de vehicles...');
    
    const {
      category = 'all',
      search = ''
    } = req.query;

    const where: any = {};
    
    // Filtrar por categoría si se especifica
    if (category !== 'all') {
      where.category = category;
    }

    // Filtrar por búsqueda si se especifica
    if (search) {
      where.OR = [
        { key: { contains: search as string } },
        { ca: { contains: search as string } },
        { es: { contains: search as string } },
        { en: { contains: search as string } },
        { fr: { contains: search as string } },
        { description: { contains: search as string } }
      ];
    }

    const translations = await prisma.vehicleTranslation.findMany({
      where,
      select: {
        id: true,
        key: true,
        category: true,
        ca: true,
        es: true,
        en: true,
        fr: true,
        description: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { category: 'asc' },
        { key: 'asc' }
      ]
    });

    console.log(`✅ Trobades ${translations.length} traduccions`);

    return res.json({
      success: true,
      translations,
      total: translations.length
    });

  } catch (error) {
    console.error('❌ Error obtenint traduccions de vehicles:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en obtenir les traduccions de vehicles',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/vehicle-translations - Crear nova traducció de vehicle
router.post('/vehicle-translations', async (req, res) => {
  try {
    console.log('➕ Creant nova traducció de vehicle...');
    
    const { key, category, ca, es, en, fr, description } = req.body;

    // Validaciones
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La clau és obligatòria'
      });
    }

    if (!ca || !ca.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en català és obligatòria'
      });
    }

    if (!es || !es.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en espanyol és obligatòria'
      });
    }

    if (!en || !en.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en anglès és obligatòria'
      });
    }

    if (!fr || !fr.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en francès és obligatòria'
      });
    }

    // Validar formato de la clave
    if (!/^[a-zA-Z0-9._-]+$/.test(key.trim())) {
      return res.status(400).json({
        success: false,
        error: 'La clau només pot contenir lletres, números, punts, guions i guions baixos'
      });
    }

    // Verificar que la clave no existe ya
    const existingTranslation = await prisma.vehicleTranslation.findUnique({
      where: { key: key.trim() }
    });

    if (existingTranslation) {
      return res.status(400).json({
        success: false,
        error: 'Ja existeix una traducció amb aquesta clau'
      });
    }

    // Crear la nueva traducción
    const newTranslation = await prisma.vehicleTranslation.create({
      data: {
        key: key.trim(),
        category: category || 'general',
        ca: ca.trim(),
        es: es.trim(),
        en: en.trim(),
        fr: fr.trim(),
        description: description?.trim() || null
      }
    });

    console.log(`✅ Traducció creada amb ID: ${newTranslation.id}`);

    return res.json({
      success: true,
      translation: newTranslation,
      message: 'Traducció creada correctament'
    });

  } catch (error) {
    console.error('❌ Error creant traducció de vehicle:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en crear la traducció de vehicle',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// PUT /api/admin/vehicle-translations/:id - Actualitzar traducció de vehicle
router.put('/vehicle-translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`✏️ Actualitzant traducció de vehicle amb ID: ${id}...`);
    
    const { key, category, ca, es, en, fr, description } = req.body;

    // Validaciones
    if (!key || !key.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La clau és obligatòria'
      });
    }

    if (!ca || !ca.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en català és obligatòria'
      });
    }

    if (!es || !es.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en espanyol és obligatòria'
      });
    }

    if (!en || !en.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en anglès és obligatòria'
      });
    }

    if (!fr || !fr.trim()) {
      return res.status(400).json({
        success: false,
        error: 'La traducció en francès és obligatòria'
      });
    }

    // Validar formato de la clave
    if (!/^[a-zA-Z0-9._-]+$/.test(key.trim())) {
      return res.status(400).json({
        success: false,
        error: 'La clau només pot contenir lletres, números, punts, guions i guions baixos'
      });
    }

    // Verificar que la traducción existe
    const existingTranslation = await prisma.vehicleTranslation.findUnique({
      where: { id }
    });

    if (!existingTranslation) {
      return res.status(404).json({
        success: false,
        error: 'Traducció no trobada'
      });
    }

    // Verificar que la clave no esté siendo usada por otra traducción
    if (key.trim() !== existingTranslation.key) {
      const keyConflict = await prisma.vehicleTranslation.findUnique({
        where: { key: key.trim() }
      });

      if (keyConflict) {
        return res.status(400).json({
          success: false,
          error: 'Ja existeix una altra traducció amb aquesta clau'
        });
      }
    }

    // Actualizar la traducción
    const updatedTranslation = await prisma.vehicleTranslation.update({
      where: { id },
      data: {
        key: key.trim(),
        category: category || 'general',
        ca: ca.trim(),
        es: es.trim(),
        en: en.trim(),
        fr: fr.trim(),
        description: description?.trim() || null
      }
    });

    console.log(`✅ Traducció actualitzada correctament`);

    return res.json({
      success: true,
      translation: updatedTranslation,
      message: 'Traducció actualitzada correctament'
    });

  } catch (error) {
    console.error('❌ Error actualitzant traducció de vehicle:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en actualitzar la traducció de vehicle',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// DELETE /api/admin/vehicle-translations/:id - Eliminar traducció de vehicle
router.delete('/vehicle-translations/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Eliminant traducció de vehicle amb ID: ${id}...`);

    // Verificar que la traducción existe
    const existingTranslation = await prisma.vehicleTranslation.findUnique({
      where: { id }
    });

    if (!existingTranslation) {
      return res.status(404).json({
        success: false,
        error: 'Traducció no trobada'
      });
    }

    // Eliminar la traducción
    await prisma.vehicleTranslation.delete({
      where: { id }
    });

    console.log(`✅ Traducció eliminada correctament`);

    return res.json({
      success: true,
      message: 'Traducció eliminada correctament'
    });

  } catch (error) {
    console.error('❌ Error eliminant traducció de vehicle:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en eliminar la traducció de vehicle',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// GET /api/admin/vehicle-translations/search/:key - Buscar traducció per clau específica
router.get('/vehicle-translations/search/:key', async (req, res) => {
  try {
    const { key } = req.params;
    console.log(`🔍 Buscant traducció per clau: ${key}...`);

    const translation = await prisma.vehicleTranslation.findUnique({
      where: { key }
    });

    if (!translation) {
      return res.status(404).json({
        success: false,
        error: 'Traducció no trobada per aquesta clau'
      });
    }

    console.log(`✅ Traducció trobada per clau: ${key}`);

    return res.json({
      success: true,
      translation
    });

  } catch (error) {
    console.error('❌ Error buscant traducció per clau:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en buscar la traducció',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/vehicle-translations/bulk-create - Crear múltiples traduccions de cop
router.post('/vehicle-translations/bulk-create', async (req, res) => {
  try {
    console.log('📦 Creant múltiples traduccions de vehicles...');
    
    const { translations } = req.body;

    if (!Array.isArray(translations) || translations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Es requereix un array de traduccions'
      });
    }

    // Validar que no hay claves duplicadas en el lote
    const keys = translations.map(t => t.key?.trim()).filter(Boolean);
    const uniqueKeys = new Set(keys);
    
    if (keys.length !== uniqueKeys.size) {
      return res.status(400).json({
        success: false,
        error: 'Hi ha claus duplicades en el lote de traduccions'
      });
    }

    // Verificar que las claves no existen ya en la base de datos
    const existingTranslations = await prisma.vehicleTranslation.findMany({
      where: {
        key: { in: keys }
      },
      select: { key: true }
    });

    if (existingTranslations.length > 0) {
      const existingKeys = existingTranslations.map(t => t.key);
      return res.status(400).json({
        success: false,
        error: `Ja existeixen traduccions amb aquestes claus: ${existingKeys.join(', ')}`
      });
    }

    // Preparar datos para inserción
    const translationsData = translations.map(t => ({
      key: t.key?.trim(),
      category: t.category || 'general',
      ca: t.ca?.trim(),
      es: t.es?.trim(),
      en: t.en?.trim(),
      fr: t.fr?.trim(),
      description: t.description?.trim() || null
    }));

    // Validar datos
    for (const t of translationsData) {
      if (!t.key || !t.ca || !t.es || !t.en || !t.fr) {
        return res.status(400).json({
          success: false,
          error: 'Totes les traduccions han de tenir clau i tots els idiomes'
        });
      }
    }

    // Crear todas las traducciones una por una para manejar duplicados
    let createdCount = 0;
    
    for (const translation of translationsData) {
      try {
        // Verificar si ya existe
        const existing = await prisma.vehicleTranslation.findUnique({
          where: { key: translation.key }
        });
        
        if (!existing) {
          await prisma.vehicleTranslation.create({
            data: translation
          });
          createdCount++;
          console.log(`✅ Creada traducció: ${translation.key}`);
        } else {
          console.log(`⏭️ Traducció ja existeix: ${translation.key}`);
        }
      } catch (error) {
        console.error(`❌ Error creant traducció ${translation.key}:`, error);
      }
    }

    console.log(`✅ Creades ${createdCount} traduccions de ${translationsData.length} totals`);

    return res.json({
      success: true,
      created: createdCount,
      message: `${createdCount} traduccions creades correctament`
    });

  } catch (error) {
    console.error('❌ Error creant múltiples traduccions:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en crear les traduccions múltiples',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// POST /api/admin/vehicle-translations/initialize - Inicialitzar traduccions per defecte
router.post('/vehicle-translations/initialize', async (req, res) => {
  try {
    console.log('🚀 Inicialitzant traduccions per defecte de vehicles...');
    
    const created = await createInitialTranslations(prisma);
    
    console.log(`✅ Inicialització completada - ${created} traduccions creades`);

    return res.json({
      success: true,
      created,
      message: `Inicialització completada - ${created} traduccions creades`
    });

  } catch (error) {
    console.error('❌ Error inicialitzant traduccions per defecte:', error);
    return res.status(500).json({
      success: false,
      error: 'Error en inicialitzar les traduccions per defecte',
      details: error instanceof Error ? error.message : 'Error desconegut'
    });
  }
});

// ==================== MOTORALDIA SYNC OUT CONFIGURATION ====================

// GET /api/admin/motor-sync-out-config - Obtener configuración de sincronización saliente Motor
router.get('/motor-sync-out-config', async (req, res) => {
  try {
    const config = await prisma.config.findFirst({
      where: { key: 'motor_sync_out_config' }
    });

    if (!config) {
      // Devolver configuración por defecto
      return res.json({
        success: true,
        config: {
          apiUrl: '',
          username: '',
          password: '', // No devolver la contraseña
          autoExport: false,
          exportMode: 'available'
        }
      });
    }

    const configData = JSON.parse(config.value);
    // No devolver la contraseña por seguridad
    configData.password = '';

    return res.json({
      success: true,
      config: configData
    });

  } catch (error) {
    console.error('Error getting motor sync out config:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to get motor sync out configuration'
    });
  }
});

// POST /api/admin/motor-sync-out-config - Guardar configuración de sincronización saliente Motor
router.post('/motor-sync-out-config', async (req, res) => {
  try {
    const {
      apiUrl,
      username,
      password,
      autoExport,
      exportMode
    } = req.body;

    // Validar campos requeridos
    if (!apiUrl || !username) {
      return res.status(400).json({
        success: false,
        error: 'API URL and username are required'
      });
    }

    const configData = {
      apiUrl,
      username,
      password: password || '', // Si no se proporciona contraseña, mantener vacía
      autoExport: Boolean(autoExport),
      exportMode: exportMode || 'available'
    };

    // Buscar configuración existente
    const existingConfig = await prisma.config.findFirst({
      where: { key: 'motor_sync_out_config' }
    });

    if (existingConfig) {
      // Si existe y no se proporciona contraseña, mantener la anterior
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
          key: 'motor_sync_out_config',
          value: JSON.stringify(configData),
          description: 'Configuración de sincronización saliente con Motoraldia'
        }
      });
    }

    return res.json({
      success: true,
      message: 'Motor sync out configuration saved successfully',
      config: {
        ...configData,
        password: '' // No devolver la contraseña
      }
    });

  } catch (error) {
    console.error('Error saving motor sync out config:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to save motor sync out configuration'
    });
  }
});

// POST /api/admin/motor-sync-out-config/test - Probar conexión con API de Motoraldia
router.post('/motor-sync-out-config/test', async (req, res) => {
  try {
    const { apiUrl, username, password } = req.body;

    if (!apiUrl || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'API URL, username, and password are required'
      });
    }

    console.log(`🔍 Testing connection to Motoraldia: ${apiUrl}`);

    // Probar conexión con un request simple
    const axios = require('axios');
    const response = await axios.get(`${apiUrl}`, {
      auth: { username, password },
      params: { per_page: 1 },
      timeout: 10000,
      headers: {
        'User-Agent': 'Kars.ad-Sync/1.0'
      }
    });

    // Verificar respuesta
    if (response.status === 200) {
      return res.json({
        success: true,
        message: 'Connection successful',
        apiStatus: response.status,
        responsePreview: typeof response.data === 'object' ? Object.keys(response.data) : response.data
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Connection failed - Invalid response',
        apiStatus: response.status
      });
    }

  } catch (error: any) {
    console.error('Motoraldia connection test failed:', error);
    
    if (error.response) {
      const statusCode = error.response.status;
      const message = statusCode === 401 
        ? 'Authentication failed - Invalid credentials'
        : statusCode === 404
        ? 'API endpoint not found'
        : statusCode === 403
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
        error: error.message
      });
    }
  }
});

// Función auxiliar para formatear tamaño de archivo
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default router;