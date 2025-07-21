import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, generateToken, authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login - Login con migración automática transparente
router.post('/login', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication failed' });
    }

    // Obtener datos completos del usuario
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicles: {
          where: { anunciActiu: true },
          select: {
            id: true,
            slug: true,
            titolAnunci: true,
            tipusVehicle: true,
            anunciDestacat: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Generar token JWT
    const token = generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });

    // Respuesta compatible con frontend actual
    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        phone: user.phone,
        address: user.address,
        city: user.city,
        website: user.website,
        isActive: user.isActive,
        vehicles: user.vehicles,
        vehicleCount: user.vehicles.length,
        lastLoginAt: user.lastLoginAt
      },
      // Indicador de si fue migración automática
      migrated: user.migratedAt !== null && 
                user.migratedAt.getTime() > (Date.now() - 5 * 60 * 1000) // últimos 5 minutos
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/register - Registro de nuevos usuarios
router.post('/register', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      name,
      phone,
      address,
      city,
      website,
      role = 'professional'
    } = req.body;

    // Validaciones básicas
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: existingUser.username === username ? 'Username already exists' : 'Email already exists'
      });
    }

    // Crear usuario
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
        name: name || username,
        phone,
        address,
        city,
        website,
        role,
        lastLoginAt: new Date()
      }
    });

    // Si es profesional, crear registro Professional
    if (role === 'professional') {
      await prisma.professional.create({
        data: {
          userId: newUser.id
        }
      });
    }

    // Generar token
    const token = generateToken({
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    });

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        phone: newUser.phone,
        address: newUser.address,
        city: newUser.city,
        website: newUser.website,
        isActive: newUser.isActive,
        vehicles: [],
        vehicleCount: 0
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Registration failed' });
  }
});

// GET /api/auth/me - Obtener información del usuario autenticado
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        vehicles: {
          where: { anunciActiu: true },
          select: {
            id: true,
            slug: true,
            titolAnunci: true,
            tipusVehicle: true,
            anunciDestacat: true,
            dataCreacio: true
          },
          orderBy: { dataCreacio: 'desc' }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      phone: user.phone,
      address: user.address,
      city: user.city,
      website: user.website,
      isActive: user.isActive,
      vehicles: user.vehicles,
      vehicleCount: user.vehicles.length,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt
    });

  } catch (error) {
    console.error('Get user error:', error);
    return res.status(500).json({ error: 'Failed to get user information' });
  }
});

// PUT /api/auth/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const {
      name,
      phone,
      address,
      city,
      website
    } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address && { address }),
        ...(city && { city }),
        ...(website && { website })
      }
    });

    return res.json({
      id: updatedUser.id,
      username: updatedUser.username,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      phone: updatedUser.phone,
      address: updatedUser.address,
      city: updatedUser.city,
      website: updatedUser.website,
      isActive: updatedUser.isActive
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Obtener usuario actual
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verificar contraseña actual
    const bcrypt = require('bcrypt');
    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Actualizar contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 12);
    
    await prisma.user.update({
      where: { id: req.user.id },
      data: { passwordHash: newPasswordHash }
    });

    return res.json({ message: 'Password changed successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/auth/logout - Logout (invalida el token en cliente)
router.post('/logout', authenticateToken, (req, res) => {
  // En JWT no podemos invalidar tokens del lado servidor fácilmente
  // El frontend debe eliminar el token
  return res.json({ message: 'Logged out successfully' });
});

export default router;