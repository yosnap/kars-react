import axios from 'axios';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Cliente para la API original
const originalApiClient = axios.create({
  baseURL: process.env.ORIGINAL_API_URL,
  auth: {
    username: process.env.ORIGINAL_API_USER || '',
    password: process.env.ORIGINAL_API_PASS || ''
  },
  timeout: 30000
});

interface OriginalUser {
  id: string;
  username: string;
  email: string;
  password?: string; // Solo si la API original nos proporciona el hash
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  role?: string;
  is_active?: boolean;
  business_name?: string;
  tax_id?: string;
  license?: string;
  description?: string;
  is_verified?: boolean;
  is_premium?: boolean;
  created_at?: string;
  last_login?: string;
}

// Migrar todos los usuarios desde la API original
export async function migrateAllUsers(): Promise<{
  success: number;
  failed: number;
  skipped: number;
  errors: string[];
}> {
  console.log('🔄 Starting user migration from original API...');
  
  let success = 0;
  let failed = 0;
  let skipped = 0;
  const errors: string[] = [];

  try {
    // Obtener usuarios de la API original
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await originalApiClient.get('/users', {
          params: {
            page,
            per_page: 100
          }
        });

        const users = response.data.items || response.data.users || [];
        
        if (users.length === 0) {
          hasMore = false;
          break;
        }

        for (const originalUser of users) {
          try {
            const result = await migrateUser(originalUser);
            
            if (result === 'created') {
              success++;
              console.log(`✅ Migrated user: ${originalUser.username}`);
            } else if (result === 'updated') {
              success++;
              console.log(`🔄 Updated user: ${originalUser.username}`);
            } else {
              skipped++;
              console.log(`⏭️ Skipped user: ${originalUser.username} (already exists)`);
            }
          } catch (error) {
            failed++;
            const errorMsg = `Failed to migrate user ${originalUser.username}: ${error instanceof Error ? error.message : 'Unknown error'}`;
            errors.push(errorMsg);
            console.error(`❌ ${errorMsg}`);
          }
        }

        page++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error fetching users page ${page}:`, error instanceof Error ? error.message : 'Unknown error');
        break;
      }
    }

    console.log(`✅ User migration completed: ${success} migrated, ${failed} failed, ${skipped} skipped`);
    
    return { success, failed, skipped, errors };

  } catch (error) {
    console.error('❌ User migration failed:', error);
    throw error;
  }
}

// Migrar un usuario específico
async function migrateUser(originalUser: OriginalUser): Promise<'created' | 'updated' | 'skipped'> {
  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { username: originalUser.username },
        { email: originalUser.email },
        { originalUserId: originalUser.id }
      ]
    }
  });

  // Generar hash de contraseña temporal si no tenemos la original
  // En un escenario real, esto se manejará en el primer login
  let passwordHash: string;
  if (originalUser.password) {
    // Si tenemos el hash original, usarlo
    passwordHash = originalUser.password;
  } else {
    // Generar contraseña temporal que se actualizará en el primer login
    passwordHash = await bcrypt.hash(`temp_${originalUser.username}_${Date.now()}`, 12);
  }

  const userData = {
    username: originalUser.username,
    email: originalUser.email,
    passwordHash,
    name: originalUser.name || originalUser.username,
    phone: originalUser.phone || null,
    address: originalUser.address || null,
    city: originalUser.city || null,
    website: originalUser.website || null,
    role: originalUser.role || 'professional',
    isActive: originalUser.is_active !== false,
    originalUserId: originalUser.id,
    migratedAt: new Date(),
    lastLoginAt: originalUser.last_login ? new Date(originalUser.last_login) : null
  };

  if (existingUser) {
    // Actualizar usuario existente solo si no ha sido migrado
    if (!existingUser.migratedAt) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: {
          ...userData,
          // Mantener la contraseña existente si ya tiene una
          passwordHash: existingUser.passwordHash
        }
      });

      // Crear/actualizar datos de profesional si es necesario
      await upsertProfessionalData(existingUser.id, originalUser);

      return 'updated';
    }
    
    return 'skipped';
  } else {
    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: userData
    });

    // Crear datos de profesional si aplica
    if (originalUser.role === 'professional' || !originalUser.role) {
      await upsertProfessionalData(newUser.id, originalUser);
    }

    return 'created';
  }
}

// Crear o actualizar datos específicos del profesional
async function upsertProfessionalData(userId: string, originalUser: OriginalUser) {
  const existingProfessional = await prisma.professional.findFirst({
    where: { userId }
  });

  const professionalData = {
    userId,
    businessName: originalUser.business_name || null,
    taxId: originalUser.tax_id || null,
    license: originalUser.license || null,
    description: originalUser.description || null,
    isVerified: originalUser.is_verified || false,
    isPremium: originalUser.is_premium || false
  };

  if (existingProfessional) {
    await prisma.professional.update({
      where: { id: existingProfessional.id },
      data: professionalData
    });
  } else {
    await prisma.professional.create({
      data: professionalData
    });
  }
}

// Sincronizar usuario específico desde la API original
export async function syncUserFromOriginal(username: string): Promise<'created' | 'updated' | 'not_found'> {
  try {
    // Buscar usuario en API original
    const response = await originalApiClient.get(`/users/${username}`);
    const originalUser = response.data;

    if (!originalUser) {
      return 'not_found';
    }

    const result = await migrateUser(originalUser);
    return result === 'skipped' ? 'updated' : result;

  } catch (error: any) {
    if (error.response?.status === 404) {
      return 'not_found';
    }
    throw error;
  }
}

// Obtener estadísticas de migración
export async function getMigrationStats() {
  const [totalUsers, migratedUsers, recentMigrations] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { migratedAt: { not: null } } }),
    prisma.user.count({
      where: {
        migratedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // últimas 24 horas
        }
      }
    })
  ]);

  return {
    totalUsers,
    migratedUsers,
    localUsers: totalUsers - migratedUsers,
    recentMigrations,
    migrationPercentage: totalUsers > 0 ? (migratedUsers / totalUsers) * 100 : 0
  };
}

// Limpiar datos de migración (para testing)
export async function cleanMigrationData() {
  console.log('🧹 Cleaning migration data...');
  
  // Eliminar usuarios migrados
  const result = await prisma.user.deleteMany({
    where: {
      migratedAt: { not: null }
    }
  });

  console.log(`🧹 Deleted ${result.count} migrated users`);
  return result.count;
}