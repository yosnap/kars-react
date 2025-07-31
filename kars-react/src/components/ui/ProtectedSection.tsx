import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../api/axiosClient';

interface ProtectedSectionProps {
  role?: UserRole | UserRole[];
  requireSuperAdmin?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Componente que protege secciones según el rol del usuario
 * 
 * @param role - Rol(es) requerido(s) para ver el contenido
 * @param requireSuperAdmin - Si true, solo super admin puede ver el contenido
 * @param fallback - Componente a mostrar si no tiene permisos
 * @param children - Contenido a proteger
 */
export const ProtectedSection: React.FC<ProtectedSectionProps> = ({
  role,
  requireSuperAdmin = false,
  fallback = null,
  children
}) => {
  const { user, isSuperAdmin, isAdmin } = useAuth();

  // Si no hay usuario logueado, no mostrar nada
  if (!user) {
    return <>{fallback}</>;
  }

  // Si se requiere super admin específicamente
  if (requireSuperAdmin && !isSuperAdmin()) {
    return <>{fallback}</>;
  }

  // Si se especifica un rol o roles específicos
  if (role) {
    const requiredRoles = Array.isArray(role) ? role : [role];
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Si pasa todas las validaciones, mostrar el contenido
  return <>{children}</>;
};

export default ProtectedSection;