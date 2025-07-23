import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';
import axios from 'axios';

const router = express.Router();

// Middleware de autenticación básica
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

// Configuración de multer para subir archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB límite
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

// Crear directorio de media con estructura por fecha
const getMediaDir = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return path.join(process.cwd(), '..', 'kars-react', 'public', 'media', year.toString(), month);
};

const ensureMediaDir = async (mediaDir: string) => {
  try {
    await fsPromises.access(mediaDir);
  } catch {
    await fsPromises.mkdir(mediaDir, { recursive: true });
  }
};

// Función para comprimir y convertir imagen a WebP
const processImage = async (buffer: Buffer, filename: string, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}): Promise<{ filename: string; url: string; relativePath: string }> => {
  const mediaDir = getMediaDir();
  await ensureMediaDir(mediaDir);
  
  const { width = 1200, height = 800, quality = 80 } = options;
  const webpFilename = `${Date.now()}-${filename.replace(/\.[^/.]+$/, '')}.webp`;
  const filepath = path.join(mediaDir, webpFilename);
  
  await sharp(buffer)
    .resize(width, height, {
      fit: 'inside',
      withoutEnlargement: true
    })
    .webp({ quality })
    .toFile(filepath);
  
  // URL relativa para la web (desde /media/)
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const relativePath = `/media/${year}/${month}/${webpFilename}`;
  
  // Devolver solo la ruta relativa - el frontend la convertirá en URL completa
  const url = relativePath;
  
  return { filename: webpFilename, url, relativePath };
};

// Función para descargar imagen desde URL y procesarla
const processImageFromUrl = async (imageUrl: string, options: {
  width?: number;
  height?: number;
  quality?: number;
} = {}): Promise<{ filename: string; url: string; relativePath: string }> => {
  try {
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 10000
    });
    
    const buffer = Buffer.from(response.data);
    const filename = path.basename(new URL(imageUrl).pathname) || 'image';
    
    return await processImage(buffer, filename, options);
  } catch (error) {
    throw new Error(`Error descargando imagen: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// POST /api/upload/image - Subir imagen desde archivo
router.post('/image', authenticateAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se ha subido ninguna imagen' });
    }

    const options = {
      width: req.body.width ? parseInt(req.body.width) : undefined,
      height: req.body.height ? parseInt(req.body.height) : undefined,
      quality: req.body.quality ? parseInt(req.body.quality) : 80
    };

    const result = await processImage(req.file.buffer, req.file.originalname, options);
    
    return res.json({
      success: true,
      message: 'Imagen subida y procesada correctamente',
      data: result
    });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    return res.status(500).json({
      error: 'Error procesando la imagen',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/upload/image-from-url - Subir imagen desde URL
router.post('/image-from-url', authenticateAdmin, async (req, res) => {
  try {
    const { url: imageUrl, width, height, quality } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'URL de imagen requerida' });
    }

    // Validar que no sea una URL local
    if (imageUrl.includes('localhost') || imageUrl.includes('127.0.0.1') || imageUrl.startsWith('/media/')) {
      return res.status(400).json({ 
        error: 'No es pot descarregar imatges des de URLs locals. Utilitza una URL externa vàlida.' 
      });
    }

    const options = {
      width: width ? parseInt(width) : undefined,
      height: height ? parseInt(height) : undefined,
      quality: quality ? parseInt(quality) : 80
    };

    const result = await processImageFromUrl(imageUrl, options);
    
    return res.json({
      success: true,
      message: 'Imagen descargada y procesada correctamente',
      data: result
    });
  } catch (error) {
    console.error('Error descargando imagen:', error);
    return res.status(500).json({
      error: 'Error procesando la imagen desde URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/upload/gallery - Subir múltiples imágenes para galería
router.post('/gallery', authenticateAdmin, upload.array('images', 10), async (req, res) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se han subido imágenes' });
    }

    const options = {
      width: req.body.width ? parseInt(req.body.width) : 1200,
      height: req.body.height ? parseInt(req.body.height) : 800,
      quality: req.body.quality ? parseInt(req.body.quality) : 80
    };

    const results = await Promise.all(
      files.map(file => processImage(file.buffer, file.originalname, options))
    );
    
    return res.json({
      success: true,
      message: `${results.length} imágenes subidas y procesadas correctamente`,
      data: results
    });
  } catch (error) {
    console.error('Error subiendo galería:', error);
    return res.status(500).json({
      error: 'Error procesando las imágenes',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/upload/image/:year/:month/:filename - Eliminar imagen
router.delete('/image/:year/:month/:filename', authenticateAdmin, async (req, res) => {
  try {
    const { year, month, filename } = req.params;
    
    if (!year || !month || !filename) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }
    
    const mediaDir = path.join(process.cwd(), '..', 'kars-react', 'public', 'media', year, month);
    const filepath = path.join(mediaDir, filename);
    
    // Verificar que el archivo existe
    try {
      await fsPromises.access(filepath);
    } catch {
      return res.status(404).json({ error: 'Imagen no encontrada' });
    }
    
    // Eliminar archivo
    await fsPromises.unlink(filepath);
    
    return res.json({
      success: true,
      message: 'Imagen eliminada correctamente'
    });
  } catch (error) {
    console.error('Error eliminando imagen:', error);
    return res.status(500).json({
      error: 'Error eliminando la imagen',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;