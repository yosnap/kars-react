import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Import routes
import vehicleRoutes from './routes/vehicles';
import adminRoutes from './routes/admin';
import syncRoutes from './routes/sync';
import authRoutes from './routes/auth';
import metadataRoutes from './routes/metadata';
import professionalRoutes from './routes/professionals';
import brandRoutes from './routes/brands';
import uploadRoutes from './routes/upload';
import installerRoutes from './routes/installer';
import systemRoutes from './routes/system';
import typesRoutes from './routes/types';

// Import sync service
import { initializeCronSync } from './services/syncService';

// Load environment variables
dotenv.config();

// Debug: Log critical environment variables at startup

const app = express();
const port = process.env.PORT || 3001;

// Initialize Prisma Client
const prisma = new PrismaClient();

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API status check
app.get('/api', (req, res) => {
  // Read version from package.json
  const fs = require('fs');
  const path = require('path');
  let apiVersion = '0.3.7';
  
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    apiVersion = packageJson.version || '0.3.7';
  } catch (error) {
    console.error('Error reading API version:', error);
  }
  
  res.json({ 
    status: 'API OK', 
    version: apiVersion,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/sellers', professionalRoutes); // Alias para compatibilidad
app.use('/api/brands', brandRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/installer', installerRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/types', typesRoutes);
app.use('/api', metadataRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { details: err.message })
  });
});

// Initialize cron sync after server starts
async function startServer() {
  const server = app.listen(port, async () => {
    
    // Initialize automatic sync
    // await initializeCronSync(); // Temporalmente comentado para debugging
    
    // Blog sync disabled temporarily
    // TODO: Re-enable when blog sync is implemented
  });

  return server;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  // TODO: Add stopCronSync() when implemented
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  // TODO: Add stopCronSync() when implemented
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export { prisma };