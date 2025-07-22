import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing database connection...');
  console.log('📊 DATABASE_URL:', process.env.DATABASE_URL?.replace(/\/\/.*@/, '//<credentials>@'));
  
  try {
    // Test basic connection
    const count = await prisma.vehicle.count();
    console.log(`✅ Connection successful! Found ${count} vehicles`);
    
    // Test specific queries
    const karsVehicles = await prisma.vehicle.count({ where: { userId: '113' } });
    console.log(`✅ Kars vehicles: ${karsVehicles}`);
    
    // Test field existence
    const sampleVehicle = await prisma.vehicle.findFirst();
    if (sampleVehicle) {
      console.log('✅ Sample vehicle fields:', Object.keys(sampleVehicle));
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();