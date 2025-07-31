import express from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { mapVehicleToMotoraldiaPayload, cleanMotoraldiaPayload } from '../services/motoraldiaMapper';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/vehicles - Listado de vehículos con filtros y paginación
router.get('/', async (req, res) => {
  try {
    
    const {
      page = '1',
      per_page = '12',
      orderby = 'date',
      order = 'DESC',
      'anunci-actiu': anunciActiu,
      'anunci-destacat': anunciDestacat,
      'venut': venut,
      'reservat': reservat,
      'tipus-vehicle': tipusVehicle,
      'estat-vehicle': estatVehicle,
      'marca-cotxe': marcaCotxe,
      'marca-moto': marcaMoto,
      'marques-cotxe': marquesCotxe,
      'marques-moto': marquesMoto,
      'marca': marca, // Filtro unificado para marca
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
    
    if (marcaCotxe || marquesCotxe) {
      where.marcaCotxe = marcaCotxe || marquesCotxe;
    }
    
    if (marcaMoto || marquesMoto) {
      where.marcaMoto = marcaMoto || marquesMoto;
    }
    
    // Filtro unificado de marca (busca en ambos campos)
    if (marca) {
      where.OR = [
        { marcaCotxe: marca },
        { marcaMoto: marca }
      ];
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
    if (anunciDestacat !== undefined) {
      const destacatValue = parseInt(anunciDestacat as string);
      if (!isNaN(destacatValue)) {
        where.anunciDestacat = destacatValue;
      }
    }
    
    // Filtro por vehículos vendidos
    if (venut === 'true') {
      where.venut = true;
    } else if (venut === 'false') {
      where.venut = false;
    }
    
    // Filtro por vehículos reservados
    if (reservat === 'true') {
      where.reservat = true;
    } else if (reservat === 'false') {
      where.reservat = false;
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
          reservat: true,
          preuAntic: true,
          // Campos de sincronización simplificados
          motorIdSync: true,
          buscoIdSync: true,
          lastSyncAt: true,
          syncError: true,
          needsSync: true
        }
      }),
      prisma.vehicle.count({ where })
    ]);


    // Calcular facets si se solicitan (sin filtros aplicados para mostrar todas las opciones disponibles)
    let facets = {};
    if (req.query.facets === 'true') {
      facets = await calculateFacets({});
    }

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
    const { id } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id }
    });
    
    if (!vehicle) {
      return res.status(404).json({ 
        error: 'Vehicle not found',
        id 
      });
    }
    
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
    
    // Lista de campos válidos según el schema de Prisma
    const validFields = [
      'id', 'originalId', 'authorId', 'status', 'slug', 'titolAnunci', 'descripcioAnunci',
      'descripcioAnunciCA', 'descripcioAnunciEN', 'descripcioAnunciFR', 'descripcioAnunciES',
      'anunciActiu', 'anunciDestacat', 'venut', 'reservat', 'diesCaducitat', 'tipusVehicle',
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
      'preu', 'imatgeDestacadaUrl', 'galeriaVehicleUrls', 'notesInternes', 'dataCreacio', 'userId', 'professionalId',
      'lastSyncAt', 'motorIdSync', 'buscoIdSync', 'needsSync', 'syncError',
      'createdAt', 'updatedAt'
    ];
    
    // Filtrar campos inválidos y registrar cuáles se eliminan
    const filteredData: any = {};
    const invalidFields: string[] = [];
    
    Object.keys(updateData).forEach(key => {
      if (validFields.includes(key)) {
        filteredData[key] = updateData[key];
      } else {
        invalidFields.push(key);
        console.log(`🗑️ Campo inválido eliminado en PUT: ${key} = ${updateData[key]}`);
      }
    });
    
    if (invalidFields.length > 0) {
      console.log(`⚠️ Campos inválidos encontrados: ${invalidFields.join(', ')}`);
    }
    
    // Normalizar campos antes de actualizar
    if (filteredData.tipusVehicle) {
      filteredData.tipusVehicle = filteredData.tipusVehicle.toLowerCase();
    }
    if (filteredData.estatVehicle) {
      filteredData.estatVehicle = filteredData.estatVehicle.toLowerCase();
    }
    
    // Convertir tipos de datos igual que en POST
    if (filteredData.preu !== undefined) {
      filteredData.preu = parseFloat(filteredData.preu) || 0;
    }
    if (filteredData.anunciDestacat !== undefined) {
      filteredData.anunciDestacat = parseInt(filteredData.anunciDestacat) || 0;
    }
    if (filteredData.anunciActiu !== undefined) {
      filteredData.anunciActiu = Boolean(filteredData.anunciActiu);
    }
    if (filteredData.venut !== undefined) {
      filteredData.venut = Boolean(filteredData.venut);
    }
    if (filteredData.reservat !== undefined) {
      filteredData.reservat = Boolean(filteredData.reservat);
    }
    // Convertir garantia a String como en producción
    if (filteredData.garantia !== undefined) {
      filteredData.garantia = filteredData.garantia !== null ? String(filteredData.garantia) : null;
    }
    
    console.log('✅ Datos filtrados y convertidos para actualización:', JSON.stringify(filteredData, null, 2));
    
    // Actualizar vehículo
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        ...filteredData,
        updatedAt: new Date()
      }
    });
    
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

// GET /api/vehicles/by-id/:id - Obtener vehículo por ID para edición
router.get('/by-id/:id', async (req, res) => {
  try {
    
    const { id } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    
    // Transformar para el frontend
    const transformedVehicle = transformVehicleForFrontend(vehicle);
    
    return res.json(transformedVehicle);
    
  } catch (error) {
    console.error('❌ Error fetching vehicle by ID:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch vehicle',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/vehicles/:slug - Detalle de vehículo
router.get('/:slug', async (req, res) => {
  try {
    
    const { slug } = req.params;
    
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        titolAnunci: true,
        descripcioAnunci: true,
        // Multilingual descriptions
        descripcioAnunciCA: true,
        descripcioAnunciES: true,
        descripcioAnunciEN: true,
        descripcioAnunciFR: true,
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
        tipusPropulsor: true,
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
        reservat: true,
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
        // Carrocería por tipo de vehículo
        carrosseriaCotxe: true,
        carrosseriaMoto: true,
        carrosseriaCaravana: true,
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
        nombrePropietaris: true,
        // Campos de sincronización simplificados
        motorIdSync: true,
        buscoIdSync: true,
        lastSyncAt: true,
        syncError: true,
        needsSync: true
      }
    });


    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const transformed = transformVehicleForFrontend(vehicle);
    
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
      venutFacets,
      estatVehicleFacets,
      anunciActiuFacets,
      anunciDestacatFacets,
      marcaCotxeFacets,
      marcaMotoFacets,
      combustibleFacets,
      anyFabricacioFacets
    ] = await Promise.all([
      // Tipos de vehículo
      prisma.vehicle.groupBy({
        by: ['tipusVehicle'],
        where: { ...baseWhere, tipusVehicle: { not: null } },
        _count: true
      }),
      // Vendido
      prisma.vehicle.groupBy({
        by: ['venut'],
        where: baseWhere,
        _count: true
      }),
      // Reservado - COMENTADO TEMPORALMENTE
      // prisma.vehicle.groupBy({
      //   by: ['reservat'],
      //   where: { ...baseWhere, reservat: { not: null } },
      //   _count: true
      // }),
      // Estado del vehículo
      prisma.vehicle.groupBy({
        by: ['estatVehicle'],
        where: baseWhere,
        _count: true
      }),
      // Anuncio activo
      prisma.vehicle.groupBy({
        by: ['anunciActiu'],
        where: baseWhere,
        _count: true
      }),
      // Anuncio destacado
      prisma.vehicle.groupBy({
        by: ['anunciDestacat'],
        where: baseWhere,
        _count: true
      }),
      // Marcas de coche
      prisma.vehicle.groupBy({
        by: ['marcaCotxe'],
        where: baseWhere,
        _count: true
      }),
      // Marcas de moto
      prisma.vehicle.groupBy({
        by: ['marcaMoto'],
        where: baseWhere,
        _count: true
      }),
      // Combustibles
      prisma.vehicle.groupBy({
        by: ['tipusCombustible'],
        where: baseWhere,
        _count: true
      }),
      // Años
      prisma.vehicle.groupBy({
        by: ['any'],
        where: baseWhere,
        _count: true
      })
    ]);

    const facetsResult = {
      'tipus-vehicle': Object.fromEntries(
        tipusVehicleFacets.map(f => [f.tipusVehicle, f._count])
      ),
      'venut': Object.fromEntries(
        venutFacets.map(f => [f.venut.toString(), f._count])
      ),
      'estat-vehicle': Object.fromEntries(
        estatVehicleFacets.map(f => [f.estatVehicle!, f._count])
      ),
      'anunci-actiu': Object.fromEntries(
        anunciActiuFacets.map(f => [f.anunciActiu.toString(), f._count])
      ),
      'anunci-destacat': Object.fromEntries(
        anunciDestacatFacets.map(f => [f.anunciDestacat.toString(), f._count])
      ),
      'marca-cotxe': Object.fromEntries(
        marcaCotxeFacets.map(f => [f.marcaCotxe!, f._count])
      ),
      'marca-moto': Object.fromEntries(
        marcaMotoFacets.map(f => [f.marcaMoto!, f._count])
      ),
      'tipus-combustible': Object.fromEntries(
        combustibleFacets.map(f => [f.tipusCombustible!, f._count])
      ),
      'any-fabricacio': Object.fromEntries(
        anyFabricacioFacets.map(f => [f.any, f._count])
      )
    };

    // Calcular facets de reservat manualmente
    try {
      const [reservatTrue, reservatFalse] = await Promise.all([
        prisma.vehicle.count({ where: { ...baseWhere, reservat: true } }),
        prisma.vehicle.count({ where: { ...baseWhere, reservat: { not: true } } })
      ]);
      
      facetsResult['reservat'] = {
        'true': reservatTrue,
        'false': reservatFalse
      };
    } catch (reservatError) {
      console.error('❌ Error calculating reservat facets:', reservatError);
    }

    return facetsResult;
  } catch (error) {
    console.error('❌ Error calculating facets:', error);
    console.error('❌ Error stack:', error instanceof Error ? error.stack : 'No stack');
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
    return {};
  }
}

// Transformar vehículo para el frontend (mantener compatibilidad)
function transformVehicleForFrontend(vehicle: any) {
  if (!vehicle) return vehicle;
  
  // Mapping de campos kebab-case a camelCase para el frontend
  const fieldMapping = {
    'tipus-propulsor': 'tipusPropulsor',
    'estat-vehicle': 'estatVehicle', 
    'carrosseria-cotxe': 'carrosseriaCotxe',
    'carrosseria-moto': 'carrosseriaMoto',
    'carrosseria-caravana': 'carrosseriaCaravana',
    'tipus-combustible': 'tipusCombustible',
    'tipus-canvi': 'tipusCanvi',
    'tipus-vehicle': 'tipusVehicle',
    'marca-cotxe': 'marcaCotxe',
    'models-cotxe': 'modelsCotxe',
    'marca-moto': 'marcaMoto',
    'models-moto': 'modelsMoto',
    'color-vehicle': 'colorVehicle',
    'places-cotxe': 'placesCotxe',
    'places-moto': 'placesMoto',
    'portes-cotxe': 'portesCotxe',
    'numero-maleters-cotxe': 'numeroMaleters',
    'capacitat-maleters-cotxe': 'capacitatTotal',
    'roda-recanvi': 'rodaRecanvi',
    'velocitat-maxima': 'velocitatMaxima',
    'acceleracio-0-100': 'acceleracio0100',
    'potencia-cv': 'potenciaCv',
    'potencia-kw': 'potenciaKw',
    'emissions-vehicle': 'emissionsVehicle',
    'emissions-co2': 'emissionsCo2',
    'consum-urba': 'consumUrba',
    'consum-carretera': 'consumCarretera',
    'consum-mixt': 'consumMixt',
    'acceleracio-0-100-cotxe': 'acceleracio0100Cotxe',
    'tipus-canvi-moto': 'tipusCanviMoto',
    'extres-cotxe': 'extresCotxe',
    'extres-moto': 'extresMoto',
    'extres-autocaravana': 'extresAutocaravana',
    'extres-habitacle': 'extresHabitacle',
    'imatge-destacada-url': 'imatgeDestacadaUrl',
    'galeria-vehicle-urls': 'galeriaVehicleUrls',
    'titol-anunci': 'titolAnunci',
    'descripcio-anunci': 'descripcioAnunci',
    'anunci-actiu': 'anunciActiu',
    'anunci-destacat': 'anunciDestacat',
    'vehicle-fumador': 'vehicleFumador',
    'vehicle-accidentat': 'vehicleAccidentat',
    'vehicle-a-canvi': 'vehicleACanvi',
    'llibre-manteniment': 'llibreManteniment',
    'revisions-oficials': 'revisionsOficials',
    'impostos-deduibles': 'impostosDeduibles',
    'nombre-propietaris': 'nombrePropietaris',
    'preu-antic': 'preuAntic',
    'data-creacio': 'dataCreacio',
    'notes-internes': 'notesInternes'
  };
  
  // Crear objeto transformado
  const transformed = { ...vehicle };
  
  // Aplicar transformaciones de campo
  Object.entries(fieldMapping).forEach(([kebabKey, camelKey]) => {
    if (vehicle[kebabKey] !== undefined) {
      transformed[camelKey] = vehicle[kebabKey];
      // No eliminar el campo original por compatibilidad
    }
  });

  // Mapeos adicionales para compatibilidad con formulario
  if (vehicle.capacitatMaletersCotxe !== undefined) {
    transformed.capacitatTotal = vehicle.capacitatMaletersCotxe;
  }
  if (vehicle.numeroMaletersCotxe !== undefined) {
    transformed.numeroMaleters = vehicle.numeroMaletersCotxe;
  }
  if (vehicle.acceleracio0100Cotxe !== undefined) {
    transformed.acceleracio0100 = vehicle.acceleracio0100Cotxe;
  }
  
  // Asegurar que ciertos campos sean strings si existen
  const stringFields = ['quilometratge', 'preu', 'any', 'cilindrada', 'potenciaCv', 'potenciaKw'];
  stringFields.forEach(field => {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      transformed[field] = String(transformed[field]);
    }
  });
  
  // Asegurar que ciertos campos sean boolean si existen  
  const booleanFields = ['anunciActiu', 'venut', 'reservat', 'vehicleFumador', 'climatitzacio'];
  booleanFields.forEach(field => {
    if (transformed[field] !== undefined && transformed[field] !== null) {
      transformed[field] = Boolean(transformed[field]);
    }
  });
  
  // Incluir campos de sincronización simplificados para el frontend
  transformed.motorIdSync = vehicle.motorIdSync || null;
  transformed.buscoIdSync = vehicle.buscoIdSync || null;
  transformed.lastSyncAt = vehicle.lastSyncAt || null;
  transformed.syncError = vehicle.syncError || null;
  transformed.needsSync = vehicle.needsSync || false;
  
  return transformed;
}

// POST /api/vehicles - Crear nuevo vehículo
router.post('/', async (req, res) => {
  try {
    
    const vehicleData = req.body;
    
    // Validación básica
    const missingFields: string[] = [];
    if (!vehicleData.titolAnunci) missingFields.push('titolAnunci');
    if (!vehicleData.tipusVehicle) missingFields.push('tipusVehicle');
    if (!vehicleData.preu && vehicleData.preu !== 0) missingFields.push('preu');
    
    if (missingFields.length > 0) {
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
      'anunciActiu', 'anunciDestacat', 'venut', 'reservat', 'diesCaducitat', 'tipusVehicle',
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
      'preu', 'imatgeDestacadaUrl', 'galeriaVehicleUrls', 'notesInternes', 'dataCreacio', 'userId', 'professionalId',
      'lastSyncAt', 'motorIdSync', 'buscoIdSync', 'needsSync', 'syncError',
      'createdAt', 'updatedAt'
    ];

    // Filtrar solo campos válidos
    const filteredData: any = {};
    for (const [key, value] of Object.entries(vehicleData)) {
      if (validFields.includes(key)) {
        filteredData[key] = value;
      } else {
      }
    }

    // Debug logs
    console.log('🔍 vehicleData.reservat raw:', vehicleData.reservat, typeof vehicleData.reservat);
    console.log('🔍 Boolean(vehicleData.reservat):', Boolean(vehicleData.reservat));
    
    // Convertir datos numéricos y booleans
    const processedData = {
      ...filteredData,
      preu: parseFloat(vehicleData.preu) || 0,
      anunciDestacat: parseInt(vehicleData.anunciDestacat) || 0,
      anunciActiu: Boolean(vehicleData.anunciActiu),
      venut: Boolean(vehicleData.venut),
      reservat: Boolean(vehicleData.reservat),
      dataCreacio: new Date(vehicleData.dataCreacio || new Date()),
      galeriaVehicleUrls: vehicleData.galeriaVehicleUrls || [],
      // Asegurar campo de descripción en catalán
      descripcioAnunci: vehicleData.descripcioAnunciCA || vehicleData.descripcioAnunci || ''
    };
    
    
    const newVehicle = await prisma.vehicle.create({
      data: processedData
    });
    
    console.log('🔍 newVehicle.reservat after creation:', newVehicle.reservat);
    
    return res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        ...newVehicle,
        reservat: newVehicle.reservat, // Asegurar que el campo se incluya
      },
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


    const results = await importVehiclesFromJSON(
      vehiclesData,
      clearDatabase
    );

    return res.json({
      success: true,
      message: `JSON Import completed: ${results.imported} imported, ${results.skipped} skipped`,
      data: results,
      // Incluir informe detallado para debugging
      detailedReport: results.detailedReport,
      summary: {
        total: results.detailedReport.totalVehicles,
        successful: results.detailedReport.successfulImports.length,
        failed: results.detailedReport.failedImports.length,
        failedVehicles: results.detailedReport.failedImports.map(f => ({
          title: f.title,
          slug: f.slug,
          error: f.error
        }))
      }
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
    
    // Test database connection first
    try {
      const testCount = await prisma.vehicle.count();
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
          motorIdSync: { not: null }
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
          lastSyncAt: { not: null }
        },
        orderBy: { lastSyncAt: 'desc' },
        select: { lastSyncAt: true }
      })
    ]);

    
    res.json({
      success: true,
      data: {
        totalVehicles,
        karsVehicles,
        pendingSync,
        syncedVehicles,
        syncErrors,
        lastSyncedVehicle: lastSyncedVehicle?.lastSyncAt
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

    // La API de WordPress detectará automáticamente el usuario a través de las credenciales

    // REAL SYNC TO MOTORALDIA API

    // Validate required fields for Motoraldia
    const requiredFields = ['titolAnunci', 'tipusVehicle', 'preu'];
    const validationErrors: string[] = [];
    
    for (const field of requiredFields) {
      if (!vehicle[field as keyof typeof vehicle]) {
        validationErrors.push(field);
      }
    }
    
    if (validationErrors.length > 0) {
      throw new Error(`Faltan campos obligatorios: ${validationErrors.join(', ')}`);
    }

    // Prepare vehicle data for Motoraldia API using mapper
    const rawPayload = mapVehicleToMotoraldiaPayload(vehicle);
    const motoraldiaPayload = cleanMotoraldiaPayload(rawPayload);

    // Get credentials from request body (sent from frontend localStorage)
    const { motorCredentials } = req.body || {};
    
    // Motoraldia EXPORT API configuration (from frontend localStorage)
    const config = {
      apiUrl: motorCredentials?.apiUrl || 'https://www.motoraldia.com/wp-json/api-motor/v1/vehicles',
      username: motorCredentials?.username || '',
      password: motorCredentials?.password || '',
      timeout: 60000 // 60 seconds timeout
    };

    // Validate API credentials
    if (!config.username || !config.password) {
      throw new Error('Credenciales de Motoraldia no configuradas. Por favor configura las credenciales en el panel de administración.');
    }

    // Make API call to Motoraldia
    const motoraldiaResponse = await axios.post(config.apiUrl, motoraldiaPayload, {
      auth: { username: config.username, password: config.password },
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Kars.ad-Sync/1.0'
      }
    });

    // Extract vehicle ID from Motoraldia response
    let motoraldiaVehicleId = null;
    
    // Try multiple possible paths for the vehicle ID
    const possiblePaths = [
      { path: 'data.id', value: motoraldiaResponse.data?.id },
      { path: 'data.vehicle_id', value: motoraldiaResponse.data?.vehicle_id },
      { path: 'data.data.id', value: motoraldiaResponse.data?.data?.id },
      { path: 'data.post_id', value: motoraldiaResponse.data?.post_id },
      { path: 'data.wp_post_id', value: motoraldiaResponse.data?.wp_post_id }
    ];
    
    for (const { value } of possiblePaths) {
      if (value !== null && value !== undefined) {
        motoraldiaVehicleId = value.toString();
        break;
      }
    }
    
    if (!motoraldiaVehicleId) {
      throw new Error('No vehicle ID found in Motoraldia response');
    }

    // Update vehicle with sync info
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        needsSync: false,
        motorIdSync: motoraldiaVehicleId,
        syncError: null,
        lastSyncAt: new Date()
      }
    });

    return res.json({
      success: true,
      message: 'Vehicle synced successfully to Motoraldia',
      data: {
        motorIdSync: motoraldiaVehicleId,
        syncedAt: new Date(),
        motoraldiaResponse: motoraldiaResponse.data
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

// DELETE /api/vehicles/:id/sync-to-motoraldia/remove - Eliminar vehículo de Motoraldia
router.delete('/:id/sync-to-motoraldia/remove', async (req, res) => {
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

    // Check if vehicle has motorIdSync
    if (!vehicle.motorIdSync) {
      return res.status(400).json({
        success: false,
        error: 'Vehicle is not synced to Motoraldia'
      });
    }

    // Get credentials from request body (sent from frontend localStorage)
    const { motorCredentials } = req.body || {};
    
    // Motoraldia EXPORT API configuration (from frontend localStorage)
    const config = {
      apiUrl: motorCredentials?.apiUrl || 'https://www.motoraldia.com/wp-json/api-motor/v1/vehicles',
      username: motorCredentials?.username || '',
      password: motorCredentials?.password || '',
      timeout: 60000 // 60 seconds timeout
    };

    // Validate API credentials
    if (!config.username || !config.password) {
      throw new Error('Credenciales de Motoraldia no configuradas. Por favor configura las credenciales en el panel de administración.');
    }

    // Make DELETE API call to Motoraldia
    const deleteUrl = `${config.apiUrl}/${vehicle.motorIdSync}`;
    
    try {
      const motoraldiaResponse = await axios.delete(deleteUrl, {
        auth: { username: config.username, password: config.password },
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Kars.ad-Sync/1.0'
        }
      });

      console.log('✅ Vehicle successfully deleted from Motoraldia:', motoraldiaResponse.data);
      
    } catch (axiosError: any) {
      // Handle Motoraldia API errors specifically
      if (axiosError.response) {
        const status = axiosError.response.status;
        const message = axiosError.response.data?.message || axiosError.response.data?.error || axiosError.message;
        
        console.error(`❌ Motoraldia API error ${status}:`, message);
        
        // If vehicle doesn't exist in Motoraldia (404), we still want to clean our database
        if (status !== 404) {
          throw new Error(`Motoraldia API error (${status}): ${message}`);
        }
      } else {
        // Network or other errors
        console.error('❌ Network/connection error:', axiosError.message);
        throw new Error(`Connection error: ${axiosError.message}`);
      }
    }

    // Update vehicle in our database - clear sync data
    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        motorIdSync: null,
        syncError: null,
        lastSyncAt: new Date()
      }
    });

    console.log(`✅ Cleared Motoraldia sync data for vehicle: ${vehicle.slug}`);

    return res.json({
      success: true,
      message: 'Vehicle successfully removed from Motoraldia',
      data: {
        vehicleId: id,
        motoraldiaId: vehicle.motorIdSync,
        removedAt: new Date()
      }
    });

  } catch (error) {
    console.error('❌ Error removing vehicle from Motoraldia:', error);
    
    // Update vehicle with error
    try {
      await prisma.vehicle.update({
        where: { id: req.params.id },
        data: {
          syncError: error instanceof Error ? error.message : 'Unknown removal error',
          lastSyncAt: new Date()
        }
      });
    } catch (updateError) {
      console.error('❌ Error updating removal error:', updateError);
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to remove vehicle from Motoraldia',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/vehicles/:id/sync-to-busco - TEMPORALMENTE DESACTIVADO
// Actualmente nos enfocamos solo en Motor. Busco se implementará más adelante.
router.post('/:id/sync-to-busco', async (req, res) => {
  return res.status(503).json({
    success: false,
    error: 'Busco sync temporarily disabled',
    message: 'Actualmente nos estamos enfocando solo en la sincronización con Motor. La funcionalidad de Busco estará disponible próximamente.'
  });
});

export default router;