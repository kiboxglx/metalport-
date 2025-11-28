/**
 * ProtectedRoute Component
 * 
 * Guards routes based on user roles. Displays an "Access Denied" message
 * when users try to access pages they don't have permission for.
 * 
 * Usage:
 * <ProtectedRoute allowedRoles={['admin', 'comercial']}>
 *   <SomePage />
 * </ProtectedRoute>
 * 
 * Pass empty array [] to allow all authenticated users.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { ShieldX, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Roles allowed to access this route. Empty array = all authenticated users */
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Allow access if:
  // 1. allowedRoles is empty (no restriction), or
  // 2. userRole is in allowedRoles
  const hasAccess = allowedRoles.length === 0 || 
                    (userRole && allowedRoles.includes(userRole));

  // Show access denied message
  if (!hasAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
          <ShieldX className="w-8 h-8 text-destructive" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Acesso Negado
        </h2>
        <p className="text-muted-foreground max-w-md mb-6">
          Você não tem permissão para acessar esta página. 
          Entre em contato com um administrador se acredita que isso é um erro.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao início
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};
