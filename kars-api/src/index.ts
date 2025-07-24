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

// Import sync service
import { initializeCronSync } from './services/syncService';

// Load environment variables
dotenv.config();

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
  res.json({ 
    status: 'API OK', 
    version: '0.1.3',
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
    console.log(`🚀 Motoraldia API running on http://localhost:${port}`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
    
    // Initialize automatic sync
    await initializeCronSync();
    
    // Blog sync disabled temporarily
    // TODO: Re-enable when blog sync is implemented
  });

  return server;
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  // TODO: Add stopCronSync() when implemented
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  // TODO: Add stopCronSync() when implemented
  await prisma.$disconnect();
  process.exit(0);
});

// Start the server
startServer();

export { prisma };