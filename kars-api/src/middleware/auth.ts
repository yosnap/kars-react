import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

// Extender Request para incluir usuario autenticado
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        role: string;
      };
    }
  }
}

// Verificar JWT token
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Verificar que el usuario existe y está activo
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid or inactive user' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Verificar credenciales con la API original (fallback)
async function verifyWithOriginalAPI(username: string, password: string): Promise<any | null> {
  try {
    const response = await axios.post(`${process.env.ORIGINAL_API_URL}/auth/login`, {
      username,
      password
    }, {
      timeout: 5000
    });

    return response.data.user || null;
  } catch (error) {
    console.log('Original API verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Migrar usuario desde la API original automáticamente
async function migrateUserFromOriginalAPI(originalUser: any, password: string) {
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    
    const newUser = await prisma.user.create({
      data: {
        username: originalUser.username,
        email: originalUser.email,
        passwordHash,
        name: originalUser.name || originalUser.username,
        phone: originalUser.phone,
        address: originalUser.address,
        city: originalUser.city,
        website: originalUser.website,
        role: originalUser.role || 'professional',
        originalUserId: originalUser.id.toString(),
        migratedAt: new Date(),
        lastLoginAt: new Date()
      }
    });

    // Si es un profesional, crear también el registro Professional
    if (originalUser.role === 'professional' || !originalUser.role) {
      await prisma.professional.create({
        data: {
          userId: newUser.id,
          businessName: originalUser.business_name,
          taxId: originalUser.tax_id,
          license: originalUser.license,
          description: originalUser.description,
          isVerified: originalUser.is_verified || false,
          isPremium: originalUser.is_premium || false
        }
      });
    }

    console.log(`✅ User migrated automatically: ${originalUser.username}`);
    return newUser;
  } catch (error) {
    console.error('❌ Error migrating user:', error);
    throw error;
  }
}

// Login con migración automática transparente
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const credentials = Buffer.from(authHeader.slice(6), 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  if (!username || !password) {
    return res.status(401).json({ error: 'Invalid credentials format' });
  }

  try {
    // 1. Intentar autenticación local primero
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email: username }
        ],
        isActive: true
      },
      include: {
        vehicles: {
          select: {
            id: true,
            slug: true,
            titolAnunci: true
          }
        }
      }
    });

    if (user) {
      // Usuario existe localmente, verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      
      if (isValidPassword) {
        // Actualizar último login
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });

        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        };
        
        return next();
      }
    }

    // 2. Si no existe o la contraseña no coincide, intentar con API original
    console.log(`🔄 Attempting migration for user: ${username}`);
    
    const originalUser = await verifyWithOriginalAPI(username, password);
    
    if (originalUser) {
      // Credenciales válidas en API original, migrar automáticamente
      if (!user) {
        // Usuario no existe, crear nuevo
        const newUser = await migrateUserFromOriginalAPI(originalUser, password);
        user = { ...newUser, vehicles: [] };
      } else {
        // Usuario existe pero contraseña incorrecta, actualizar contraseña
        const newPasswordHash = await bcrypt.hash(password, 12);
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            passwordHash: newPasswordHash,
            lastLoginAt: new Date()
          }
        });
        user = { ...user, ...updatedUser };
        console.log(`🔄 Password updated for user: ${username}`);
      }

      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      return next();
    }

    // 3. Credenciales inválidas en ambos sistemas
    return res.status(401).json({ error: 'Invalid credentials' });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Generar JWT token
export function generateToken(user: { id: string; username: string; email: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' }
  );
}

// Middleware para verificar roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    return next();
  };
};

// Verificar si el usuario puede acceder a un vehículo específico
export const canAccessVehicle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id: vehicleId } = req.params;
    
    // Admin puede acceder a todo
    if (req.user.role === 'admin') {
      return next();
    }

    // Verificar si el vehículo pertenece al usuario
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      select: { userId: true }
    });

    if (!vehicle || vehicle.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    return next();
  } catch (error) {
    console.error('Error checking vehicle access:', error);
    return res.status(500).json({ error: 'Failed to verify access' });
  }
};