import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Function to read package.json version
function getApiVersion() {
  try {
    const packagePath = path.join(process.cwd(), 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    return packageJson.version || 'unknown';
  } catch (error) {
    console.error('Error reading API version:', error);
    return 'unknown';
  }
}

// Get system information
router.get('/info', async (req, res) => {
  try {
    // Get basic system info
    const apiVersion = getApiVersion();
    const nodeVersion = process.version;
    const platform = process.platform;
    const arch = process.arch;
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    
    // Get database info
    let dbInfo = {};
    try {
      // Test database connection and get some basic stats
      const vehicleCount = await prisma.vehicle.count();
      const fuelTypeCount = await prisma.fuelType.count();
      const exteriorColorCount = await prisma.exteriorColor.count();
      
      dbInfo = {
        status: 'connected',
        vehicleCount,
        collectionsInitialized: {
          fuelTypes: fuelTypeCount,
          exteriorColors: exteriorColorCount
        }
      };
    } catch (error) {
      dbInfo = {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Get environment info
    const environment = {
      nodeEnv: process.env.NODE_ENV || 'development',
      port: process.env.PORT || 3001,
      corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:5173']
    };

    res.json({
      api: {
        name: 'Kars API',
        version: apiVersion,
        status: 'running',
        uptime: Math.floor(uptime),
        timestamp: new Date().toISOString()
      },
      system: {
        nodeVersion,
        platform,
        architecture: arch,
        memory: {
          rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
          heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
          heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) // MB
        }
      },
      database: dbInfo,
      environment
    });

  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({
      error: 'Failed to get system information',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;