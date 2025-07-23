import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/vehicles - Listado de vehículos con filtros y paginación
router.get('/', async (req, res) => {
  try {
    console.log('🔍 GET /vehicles called with query:', req.query);
    
    const {
      page = '1',
      per_page = '12',
      orderby = 'date',
      order = 'DESC',
      'anunci-actiu': anunciActiu,
      'anunci-destacat': anunciDestacat,
      'venut': venut,
      'tipus-vehicle': tipusVehicle,
      'estat-vehicle': estatVehicle,
      'marca-cotxe': marcaCotxe,
      'marca-moto': marcaMoto,
      model,
      'any-fabricacio': any,
      preu,
      quilometratge,
      tipusCombustible,
      search
    } = req.query;

    const pageNum = parseInt(page as string);
    const perPage = Math.min(parseInt(per_page as string), 500); // Límite máximo aumentado
    const skip = (pageNum - 1) * perPage;

    // Construir filtros
    const where: any = {};
    
    // Solo aplicar filtro de anunci-actiu si no es 'all'
    if (anunciActiu === 'true') {
      where.anunciActiu = true;
    } else if (anunciActiu === 'false') {
      where.anunciActiu = false;
    }
    // Si anunciActiu === 'all' o undefined, no aplicamos filtro
    
    if (tipusVehicle) {
      where.tipusVehicle = tipusVehicle;
    }
    
    if (estatVehicle) {
      where.estatVehicle = estatVehicle;
    }
    
    if (marcaCotxe) {
      where.marcaCotxe = marcaCotxe;
    }
    
    if (marcaMoto) {
      where.marcaMoto = marcaMoto;
    }
    
    if (model) {
      where.model = { contains: model as string, mode: 'insensitive' };
    }
    
    if (any) {
      where.any = any;
    }
    
    if (tipusCombustible) {
      where.tipusCombustible = tipusCombustible;
    }
    
    // Filtro por vehículos destacados
    if (anunciDestacat === 'true') {
      where.anunciDestacat = { gt: 0 };
    }
    
    // Filtro por vehículos vendidos
    if (venut === 'true') {
      where.venut = true;
    } else if (venut === 'false') {
      where.venut = false;
    }
    
    // Búsqueda de texto
    if (search) {
      where.OR = [
        { titolAnunci: { contains: search as string, mode: 'insensitive' } },
        { descripcioAnunci: { contains: search as string, mode: 'insensitive' } },
        { marcaCotxe: { contains: search as string, mode: 'insensitive' } },
        { marcaMoto: { contains: search as string, mode: 'insensitive' } },
        { modelsCotxe: { contains: search as string, mode: 'insensitive' } },
        { modelsMoto: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    console.log('📋 Where clause:', JSON.stringify(where, null, 2));

    // Construcción del orderBy
    const orderDirection = (order as string).toLowerCase() === 'asc' ? 'asc' : 'desc';
    let orderByClause: any = {};
    
    switch (orderby) {
      case 'featured':
      case 'anunci-destacat':
        orderByClause = { anunciDestacat: orderDirection };
        break;
      case 'price':
      case 'preu':
        orderByClause = { preu: orderDirection };
        break;
      case 'date':
        orderByClause = { dataCreacio: orderDirection };
        break;
      case 'title':
      case 'titol-anunci':
        orderByClause = { titolAnunci: orderDirection };
        break;
      case 'any':
        orderByClause = { any: orderDirection };
        break;
      default:
        orderByClause = { dataCreacio: 'desc' };
    }

    console.log('📊 Order by:', orderByClause);

    // Ejecutar consultas en paralelo
    const [vehicles, total] = await Promise.all([
      prisma.vehicle.findMany({
        where,
        orderBy: orderByClause,
        skip,
        take: perPage,
        select: {
          id: true,
          slug: true,
          titolAnunci: true,
          descripcioAnunci: true,
          tipusVehicle: true,
          marcaCotxe: true,
          marcaMoto: true,
          modelsCotxe: true,
          modelsMoto: true,
          preu: true,
          anunciActiu: true,
          anunciDestacat: true,
          dataCreacio: true,
          imatgeDestacadaUrl: true,
          galeriaVehicleUrls: true,
          any: true,
          quilometratge: true,
          tipusCombustible: true,
          estatVehicle: true,
          potenciaCv: true,
          professionalId: true,
          // Extras arrays
          extresCotxe: true,
          extresMoto: true,
          extresAutocaravana: true,
          extresHabitacle: true,
          // Electric vehicle specs
          frenadaRegenerativa: true,
          onePedal: true,
          // Additional technical fields
          colorVehicle: true,
          tipusCanvi: true,
          cilindrada: true,
          numeroMotors: true,
          nombrePropietaris: true,
          venut: true,
          preuAntic: true
        }
      }),
      prisma.vehicle.count({ where })
    ]);

    console.log(`✅ Found ${total} vehicles, returning ${vehicles.length} items`);

    // Calcular facets (simplificado por ahora)
    const facets = {};

    const totalPages = Math.ceil(total / perPage);

    return res.json({
      items: vehicles.map(transformVehicleForFrontend),
      total,
      pages: totalPages,
      current_page: pageNum,
      per_page: perPage,
      facets
    });

  } catch (error) {
    console.error('❌ Error fetching vehicles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});



// GET /api/vehicles/id/:id - Obtener vehículo por ID
router.get('/id/:id', async (req, res) => {
  try {
    console.log('🔍 GET /vehicles/id/:id called with id:', req.params.id);
    const { id } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      console.log('❌ Vehicle not found');
      return res.status(404).json({ 
        error: 'Vehicle not found',
        id 
      });
    }
    
    console.log('✅ Vehicle found, returning data');
    const transformed = transformVehicleForFrontend(vehicle);
    return res.json(transformed);
    
  } catch (error) {
    console.error('❌ Error fetching vehicle by ID:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle by ID',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/vehicles/:id - Actualizar vehículo
router.put('/:id', async (req, res) => {
  try {
    console.log('📝 PUT /vehicles/:id called with id:', req.params.id);
    const { id } = req.params;
    const updateData = req.body;
    
    // Verificar que el vehículo existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!existingVehicle) {
      return res.status(404).json({ 
        error: 'Vehicle not found',
        id 
      });
    }
    
    // Normalizar campos antes de actualizar
    if (updateData.tipusVehicle) {
      updateData.tipusVehicle = updateData.tipusVehicle.toLowerCase();
    }
    if (updateData.estatVehicle) {
      updateData.estatVehicle = updateData.estatVehicle.toLowerCase();
    }
    
    // Actualizar vehículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...updateData,
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Vehicle updated successfully');
    const transformed = transformVehicleForFrontend(updatedVehicle);
    return res.json({
      success: true,
      data: transformed
    });
    
  } catch (error) {
    console.error('❌ Error updating vehicle:', error);
    return res.status(500).json({ 
      error: 'Failed to update vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vehicles/json - Servir JSON completo de vehículos para importación
router.get('/json', async (req, res) => {
  try {
    console.log('📁 GET /vehicles/json - Sirviendo JSON de vehículos');
    
    const {
      limit = '1000',
      format = 'full',
      raw = 'false'
    } = req.query;
    
    const limitNum = Math.min(parseInt(limit as string), 5000); // Máximo 5000 vehículos
    
    // Obtener vehículos con todos los datos
    const vehicles = await prisma.vehicle.findMany({
      take: limitNum,
      orderBy: { dataCreacio: 'desc' },
      // Incluir todos los campos necesarios para importación
    });
    
    console.log(`📊 Sirviendo ${vehicles.length} vehículos en formato JSON`);
    
    // Si raw=true, devolver solo el array para importación directa
    if (raw === 'true') {
      return res.json(vehicles);
    }
    
    if (format === 'minimal') {
      // Versión mínima con solo campos esenciales
      const minimalVehicles = vehicles.map(v => ({
        id: v.id,
        slug: v.slug,
        titolAnunci: v.titolAnunci,
        preu: v.preu,
        tipusVehicle: v.tipusVehicle,
        marcaCotxe: v.marcaCotxe,
        marcaMoto: v.marcaMoto,
        modelsCotxe: v.modelsCotxe,
        modelsMoto: v.modelsMoto,
        any: v.any,
        quilometratge: v.quilometratge,
        anunciActiu: v.anunciActiu,
        venut: v.venut,
        dataCreacio: v.dataCreacio
      }));
      
      return res.json({
        success: true,
        total: minimalVehicles.length,
        format: 'minimal',
        data: minimalVehicles
      });
    }
    
    // Formato completo por defecto
    return res.json({
      success: true,
      total: vehicles.length,
      format: 'full',
      data: vehicles
    });
    
  } catch (error) {
    console.error('❌ Error sirviendo JSON de vehículos:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener JSON de vehículos',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vehicles/:slug - Detalle de vehículo
router.get('/:slug', async (req, res) => {
  try {
    console.log('🔍 GET /vehicles/:slug called with slug:', req.params.slug);
    
    const { slug } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        titolAnunci: true,
        descripcioAnunci: true,
        tipusVehicle: true,
        marcaCotxe: true,
        marcaMoto: true,
        modelsCotxe: true,
        modelsMoto: true,
        preu: true,
        anunciActiu: true,
        anunciDestacat: true,
        dataCreacio: true,
        imatgeDestacadaUrl: true,
        galeriaVehicleUrls: true,
        any: true,
        quilometratge: true,
        tipusCombustible: true,
        estatVehicle: true,
        professionalId: true,
        colorVehicle: true,
        tipusCanvi: true,
        cilindrada: true,
        potenciaCv: true,
        // Extras arrays
        extresCotxe: true,
        extresMoto: true,
        extresAutocaravana: true,
        extresHabitacle: true,
        // Electric vehicle specs
        frenadaRegenerativa: true,
        onePedal: true,
        // Additional fields for detail view
        numeroMotors: true,
        cvMotorDavant: true,
        kwMotorDavant: true,
        cvMotorDarrere: true,
        kwMotorDarrere: true,
        venut: true,
        preuAntic: true,
        versio: true,
        traccio: true,
        emissionsVehicle: true,
        // Electric vehicle additional fields
        autonomiaWltp: true,
        autonomiaUrbanaWltp: true,
        autonomiaExtraurbanaWltp: true,
        autonomiaElectrica: true,
        bateria: true,
        cablesRecarrega: true,
        connectors: true,
        velocitatRecarrega: true,
        tempsRecarregaTotal: true,
        tempsRecarregaFins80: true,
        // Physical characteristics
        placesCotxe: true,
        placesMoto: true,
        aireAcondicionat: true,
        tipusTapisseria: true,
        portesCotxe: true,
        climatitzacio: true,
        colorTapisseria: true,
        numeroMaletersCotxe: true,
        capacitatMaletersCotxe: true,
        capacitatTotalL: true,
        vehicleFumador: true,
        rodaRecanvi: true,
        // Performance
        acceleracio060: true,
        acceleracio0100Cotxe: true,
        velocitatMaxima: true,
        // Motorcycle specific
        tipusCanviMoto: true,
        // Video
        videoVehicle: true,
        // Guarantees and state
        garantia: true,
        vehicleAccidentat: true,
        llibreManteniment: true,
        revisionsOficials: true,
        impostosDeduibles: true,
        vehicleACanvi: true,
        nombrePropietaris: true
      }
    });

    console.log('📋 Vehicle found:', vehicle ? 'YES' : 'NO');

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const transformed = transformVehicleForFrontend(vehicle);
    console.log('✅ Returning transformed vehicle');
    
    return res.json(transformed);

  } catch (error) {
    console.error('❌ Error fetching vehicle:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Función para calcular facets
async function calculateFacets(baseWhere: any) {
  try {
    const [
      tipusVehicleFacets,
      marcaCotxeFacets,
      marcaMotoFacets,
      combustibleFacets,
      anyFabricacioFacets
    ] = await Promise.all([
      // Tipos de vehículo
      prisma.vehicle.groupBy({
        by: ['tipusVehicle'],
        where: baseWhere,
        _count: true
      }),
      // Marcas de coche
      prisma.vehicle.groupBy({
        by: ['marcaCotxe'],
        where: { ...baseWhere, marcaCotxe: { not: null } },
        _count: true
      }),
      // Marcas de moto
      prisma.vehicle.groupBy({
        by: ['marcaMoto'],
        where: { ...baseWhere, marcaMoto: { not: null } },
        _count: true
      }),
      // Combustibles
      prisma.vehicle.groupBy({
        by: ['tipusCombustible'],
        where: { ...baseWhere, tipusCombustible: { not: null } },
        _count: true
      }),
      // Años
      prisma.vehicle.groupBy({
        by: ['any'],
        where: baseWhere,
        _count: true
      })
    ]);

    return {
      'tipus-vehicle': Object.fromEntries(
        tipusVehicleFacets.map(f => [f.tipusVehicle, f._count])
      ),
      'marca-cotxe': Object.fromEntries(
        marcaCotxeFacets.map(f => [f.marcaCotxe!, f._count])
      ),
      'marca-moto': Object.fromEntries(
        marcaMotoFacets.map(f => [f.marcaMoto!, f._count])
      ),
      'combustible': Object.fromEntries(
        combustibleFacets.map(f => [f.tipusCombustible!, f._count])
      ),
      'any-fabricacio': Object.fromEntries(
        anyFabricacioFacets.map(f => [f.any, f._count])
      )
    };
  } catch (error) {
    console.error('Error calculating facets:', error);
    return {};
  }
}

// Transformar vehículo para el frontend (mantener compatibilidad)
function transformVehicleForFrontend(vehicle: any) {
  return {
    ...vehicle,
    // Mantener nombres originales para compatibilidad
    'titol-anunci': vehicle.titolAnunci,
    'descripcio-anunci': vehicle.descripcioAnunci,
    'tipus-vehicle': vehicle.tipusVehicle,
    'marca-cotxe': vehicle.marcaCotxe,
    'marca-moto': vehicle.marcaMoto,
    'models-cotxe': vehicle.modelsCotxe,
    'models-moto': vehicle.modelsMoto,
    'any-fabricacio': vehicle.any,
    'anunci-actiu': String(vehicle.anunciActiu),
    'anunci-destacat': String(vehicle.anunciDestacat),
    'venut': String(vehicle.venut || false),
    'data-creacio': vehicle.dataCreacio,
    'data-modificacio': vehicle.dataModificacio,
    'num-portes': vehicle.numPortes,
    // Campos técnicos
    'estat-vehicle': vehicle.estatVehicle,
    'tipus-combustible': vehicle.tipusCombustible,
    'potencia-cv': vehicle.potenciaCv,
    // Campos de imagen para el frontend
    'imatge-destacada-url': vehicle.imatgeDestacadaUrl,
    'galeria-vehicle-urls': vehicle.galeriaVehicleUrls,
    // Extras arrays - mantener como arrays
    'extres-cotxe': vehicle.extresCotxe || [],
    'extres-moto': vehicle.extresMoto || [],
    'extres-autocaravana': vehicle.extresAutocaravana || [],
    'extres-habitacle': vehicle.extresHabitacle || [],
    // Electric vehicle specs
    'frenada-regenerativa': vehicle.frenadaRegenerativa,
    'one-pedal': vehicle.onePedal,
    // Additional fields
    'color-vehicle': vehicle.colorVehicle,
    'tipus-canvi': vehicle.tipusCanvi,
    'preu-anterior': vehicle.preuAntic,
    'nombre-propietaris': vehicle.nombrePropietaris,
    // Technical specs
    'numero-motors': vehicle.numeroMotors,
    'cv-motor-davant': vehicle.cvMotorDavant,
    'kw-motor-davant': vehicle.kwMotorDavant,
    'cv-motor-darrere': vehicle.cvMotorDarrere,
    'kw-motor-darrere': vehicle.kwMotorDarrere,
    versio: vehicle.versio,
    traccio: vehicle.traccio,
    'emissions-vehicle': vehicle.emissionsVehicle,
    // Electric vehicle fields
    'autonomia-wltp': vehicle.autonomiaWltp,
    'autonomia-urbana-wltp': vehicle.autonomiaUrbanaWltp,
    'autonomia-extraurbana-wltp': vehicle.autonomiaExtraurbanaWltp,
    'autonomia-electrica': vehicle.autonomiaElectrica,
    bateria: vehicle.bateria,
    'cables-recarrega': vehicle.cablesRecarrega,
    connectors: vehicle.connectors,
    'velocitat-recarrega': vehicle.velocitatRecarrega,
    'temps-recarrega-total': vehicle.tempsRecarregaTotal,
    'temps-recarrega-fins-80': vehicle.tempsRecarregaFins80,
    // Physical characteristics
    'places-cotxe': vehicle.placesCotxe,
    'places-moto': vehicle.placesMoto,
    'aire-acondicionat': vehicle.aireAcondicionat,
    'tipus-tapisseria': vehicle.tipusTapisseria,
    'portes-cotxe': vehicle.portesCotxe,
    climatitzacio: vehicle.climatitzacio,
    'color-tapisseria': vehicle.colorTapisseria,
    'numero-maleters-cotxe': vehicle.numeroMaletersCotxe,
    'capacitat-maleters-cotxe': vehicle.capacitatMaletersCotxe,
    'capacitat-total-l': vehicle.capacitatTotalL,
    'vehicle-fumador': vehicle.vehicleFumador,
    'roda-recanvi': vehicle.rodaRecanvi,
    // Performance
    'acceleracio-0-60': vehicle.acceleracio060,
    'acceleracio-0-100-cotxe': vehicle.acceleracio0100Cotxe,
    'velocitat-maxima': vehicle.velocitatMaxima,
    // Motorcycle specific
    'tipus-canvi-moto': vehicle.tipusCanviMoto,
    // Video
    'video-vehicle': vehicle.videoVehicle,
    // Guarantees and state
    garantia: vehicle.garantia,
    'vehicle-accidentat': vehicle.vehicleAccidentat,
    'llibre-manteniment': vehicle.llibreManteniment,
    'revisions-oficials': vehicle.revisionsOficials,
    'impostos-deduibles': vehicle.impostosDeduibles,
    'vehicle-a-canvi': vehicle.vehicleACanvi
  };
}

// POST /api/vehicles - Crear nuevo vehículo
router.post('/', async (req, res) => {
  try {
    console.log('🚗 Creating new vehicle...');
    console.log('📝 Raw vehicle data:', JSON.stringify(req.body, null, 2));
    
    const vehicleData = req.body;
    
    // Validación básica
    const missingFields: string[] = [];
    if (!vehicleData.titolAnunci) missingFields.push('titolAnunci');
    if (!vehicleData.tipusVehicle) missingFields.push('tipusVehicle');
    if (!vehicleData.preu && vehicleData.preu !== 0) missingFields.push('preu');
    
    if (missingFields.length > 0) {
      console.log('❌ Missing required fields:', missingFields);
      console.log('❌ Received data:', vehicleData);
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
        missingFields,
        receivedData: vehicleData
      });
    }
    
    // Generar slug único si no se proporciona
    if (!vehicleData.slug) {
      vehicleData.slug = await generateUniqueSlug(vehicleData.titolAnunci);
    }
    
    // Asegurar que needsSync esté configurado correctamente para Kars.ad
    vehicleData.needsSync = vehicleData.needsSync !== false; // Default true
    // Omitir userId por ahora - MongoDB lo manejará como null
    delete vehicleData.userId;
    
    // Normalizar tipusVehicle a minúsculas
    if (vehicleData.tipusVehicle) {
      vehicleData.tipusVehicle = vehicleData.tipusVehicle.toLowerCase();
    }
    
    // Lista de campos válidos según el schema de Prisma
    const validFields = [
      'id', 'originalId', 'authorId', 'status', 'slug', 'titolAnunci', 'descripcioAnunci',
      'descripcioAnunciCA', 'descripcioAnunciEN', 'descripcioAnunciFR', 'descripcioAnunciES',
      'anunciActiu', 'anunciDestacat', 'venut', 'diesCaducitat', 'tipusVehicle',
      'marquesAutocaravana', 'modelsAutocaravana', 'marcaCotxe', 'marcaMoto', 'modelsCotxe', 'modelsMoto',
      'estatVehicle', 'tipusPropulsor', 'tipusCombustible', 'tipusCanvi', 'carrosseriaCotxe',
      'carrosseriaMoto', 'carrosseriaCaravana', 'versio', 'any', 'quilometratge', 'cilindrada',
      'traccio', 'potenciaCv', 'numeroMotors', 'cvMotorDavant', 'kwMotorDavant', 'potenciaKw',
      'emissionsVehicle', 'cvMotorDarrere', 'kwMotorDarrere', 'potenciaCombinada',
      'autonomiaWltp', 'autonomiaUrbanaWltp', 'autonomiaExtraurbanaWltp', 'autonomiaElectrica',
      'bateria', 'cablesRecarrega', 'connectors', 'velocitatRecarrega', 'frenadaRegenerativa',
      'onePedal', 'tempsRecarregaTotal', 'tempsRecarregaFins80', 'colorVehicle', 'placesCotxe',
      'placesMoto', 'aireAcondicionat', 'tipusTapisseria', 'portesCotxe', 'climatitzacio',
      'colorTapisseria', 'numeroMaletersCotxe', 'capacitatMaletersCotxe', 'capacitatTotalL',
      'vehicleFumador', 'rodaRecanvi', 'acceleracio060', 'acceleracio0100Cotxe', 'velocitatMaxima',
      'tipusCanviMoto', 'preuMensual', 'preuDiari', 'preuAntic', 'videoVehicle', 'cvMotor3',
      'kwMotor3', 'cvMotor4', 'kwMotor4', 'extresCotxe', 'extresMoto', 'extresAutocaravana',
      'extresHabitacle', 'emissionsCo2', 'consumUrba', 'consumCarretera', 'consumMixt',
      'categoriaEcologica', 'origen', 'iva', 'finacament', 'garantia', 'vehicleAccidentat',
      'llibreManteniment', 'revisionsOficials', 'impostosDeduibles', 'vehicleACanvi', 'nombrePropietaris',
      'preu', 'imatgeDestacadaUrl', 'galeriaVehicleUrls', 'dataCreacio', 'userId', 'professionalId',
      'lastSyncAt', 'syncedToMotoraldiaAt', 'motoraldiaVehicleId', 'needsSync', 'syncError',
      'createdAt', 'updatedAt'
    ];

    // Filtrar solo campos válidos
    const filteredData: any = {};
    for (const [key, value] of Object.entries(vehicleData)) {
      if (validFields.includes(key)) {
        filteredData[key] = value;
      } else {
        console.log(`⚠️ Filtering out unknown field: ${key}`);
      }
    }

    // Convertir datos numéricos y booleans
    const processedData = {
      ...filteredData,
      preu: parseFloat(vehicleData.preu) || 0,
      anunciDestacat: parseInt(vehicleData.anunciDestacat) || 0,
      anunciActiu: Boolean(vehicleData.anunciActiu),
      venut: Boolean(vehicleData.venut),
      dataCreacio: new Date(vehicleData.dataCreacio || new Date()),
      galeriaVehicleUrls: vehicleData.galeriaVehicleUrls || [],
      // Asegurar campo de descripción en catalán
      descripcioAnunci: vehicleData.descripcioAnunciCA || vehicleData.descripcioAnunci || ''
    };
    
    console.log('💾 Processed data for creation:', JSON.stringify(processedData, null, 2));
    
    const newVehicle = await prisma.vehicle.create({
      data: processedData
    });
    
    console.log('✅ Vehicle created successfully:', newVehicle.slug);
    
    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: newVehicle,
      slug: newVehicle.slug
    });
    
  } catch (error) {
    console.error('❌ Error creating vehicle:', error);
    // Si es un error de Prisma, dar más detalles
    if (error instanceof Error && error.message.includes('prisma')) {
      console.error('❌ Prisma error details:', JSON.stringify(error, null, 2));
    }
    return res.status(500).json({
      error: 'Failed to create vehicle',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Helper function to generate unique slug
async function generateUniqueSlug(title: string): Promise<string> {
  const baseSlug = title
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .replace(/^-|-$/g, '');
  
  let slug = baseSlug;
  let counter = 1;
  
  // Check if slug exists and increment if needed
  while (await prisma.vehicle.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  
  return slug;
}

// IMPORTACIÓN DE VEHÍCULOS PARA KARS.AD
import { 
  importVehiclesFromJSON,
  importVehiclesFromMotoralia, 
  clearVehicleDatabase, 
  getImportStats 
} from '../services/karsImportService';

// POST /api/vehicles/import-json - Importar vehículos desde JSON
router.post('/import-json', async (req, res) => {
  try {
    const { 
      vehiclesData,
      clearDatabase = false
    } = req.body;

    if (!vehiclesData || !Array.isArray(vehiclesData)) {
      return res.status(400).json({
        success: false,
        error: 'vehiclesData must be an array'
      });
    }

    console.log('📥 Starting JSON vehicle import...', { 
      vehicleCount: vehiclesData.length, 
      clearDatabase 
    });

    const results = await importVehiclesFromJSON(
      vehiclesData,
      clearDatabase
    );

    return res.json({
      success: true,
      message: `JSON Import completed: ${results.imported} imported, ${results.skipped} skipped`,
      data: results
    });

  } catch (error) {
    console.error('❌ JSON Import error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to import vehicles from JSON',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/vehicles/import - DEPRECATED: Importar vehículos desde Motoraldia API
router.post('/import', async (req, res) => {
  try {
    console.log('⚠️ DEPRECATED endpoint called: /import');
    
    res.status(410).json({
      success: false,
      error: 'This endpoint is deprecated. Use /import-json instead.',
      message: 'Please use POST /api/vehicles/import-json with vehiclesData in the request body'
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to import vehicles',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/vehicles/clear - Limpiar base de datos
router.delete('/clear', async (req, res) => {
  try {
    console.log('🗑️ Clearing vehicle database...');
    
    await clearVehicleDatabase();
    
    res.json({
      success: true,
      message: 'Vehicle database cleared successfully'
    });

  } catch (error) {
    console.error('❌ Clear database error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear database',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vehicles/import/stats - Estadísticas de importación
router.get('/import/stats', async (req, res) => {
  try {
    const stats = await getImportStats();
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get import stats',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vehicles/kars/stats - Estadísticas específicas de Kars.ad
router.get('/kars/stats', async (req, res) => {
  try {
    console.log('📊 Getting Kars stats...');
    
    // Test database connection first
    try {
      const testCount = await prisma.vehicle.count();
      console.log(`✅ Database connection OK, total vehicles: ${testCount}`);
    } catch (dbError) {
      console.error('❌ Database connection error:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown'}`);
    }
    
    const [
      totalVehicles,
      karsVehicles,
      pendingSync,
      syncedVehicles,
      syncErrors,
      lastSyncedVehicle
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { userId: '113' } }),
      prisma.vehicle.count({ where: { userId: '113', needsSync: true } }),
      prisma.vehicle.count({ 
        where: { 
          userId: '113', 
          motoraldiaVehicleId: { not: null }
        } 
      }),
      prisma.vehicle.count({ 
        where: { 
          userId: '113', 
          syncError: { not: null }
        } 
      }),
      prisma.vehicle.findFirst({
        where: { 
          userId: '113',
          syncedToMotoraldiaAt: { not: null }
        },
        orderBy: { syncedToMotoraldiaAt: 'desc' },
        select: { syncedToMotoraldiaAt: true }
      })
    ]);

    console.log('✅ Stats retrieved successfully');
    
    res.json({
      success: true,
      data: {
        totalVehicles,
        karsVehicles,
        pendingSync,
        syncedVehicles,
        syncErrors,
        lastSyncedVehicle: lastSyncedVehicle?.syncedToMotoraldiaAt
      }
    });
  } catch (error) {
    console.error('❌ Error getting Kars stats:', error);
    
    // Check if it's a Prisma/MongoDB connection error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isPrismaError = errorMessage.includes('prisma') || errorMessage.includes('mongodb');
    
    res.status(500).json({
      success: false,
      error: 'Failed to get Kars stats',
      details: errorMessage,
      type: isPrismaError ? 'database_connection' : 'unknown'
    });
  }
});

// POST /api/vehicles/:id/sync-to-motoraldia - Sincronizar vehículo específico a Motoraldia
router.post('/:id/sync-to-motoraldia', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        error: 'Vehicle not found'
      });
    }

    // Check if it's a Kars.ad vehicle
    if (vehicle.userId !== '113') {
      return res.status(400).json({
        success: false,
        error: 'Only Kars.ad vehicles can be synced to Motoraldia'
      });
    }

    // TODO: Implement actual sync to Motoraldia API
    // For now, we'll simulate the sync
    console.log(`🔄 Syncing vehicle ${vehicle.slug} to Motoraldia...`);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful sync
    const motoraldiaVehicleId = `motoraldia_${Date.now()}`;
    
    // Update vehicle with sync info
    await prisma.vehicle.update({
      where: { id },
      data: {
        needsSync: false,
        motoraldiaVehicleId,
        syncedToMotoraldiaAt: new Date(),
        syncError: null,
        lastSyncAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Vehicle synced successfully to Motoraldia',
      data: {
        motoraldiaVehicleId,
        syncedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error syncing to Motoraldia:', error);
    
    // Update vehicle with error
    try {
      await prisma.vehicle.update({
        where: { id: req.params.id },
        data: {
          syncError: error instanceof Error ? error.message : 'Unknown sync error',
          lastSyncAt: new Date()
        }
      });
    } catch (updateError) {
      console.error('❌ Error updating sync error:', updateError);
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to sync vehicle to Motoraldia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;