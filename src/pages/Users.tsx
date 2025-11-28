/**
 * Users Management Page
 * 
 * Admin-only page for managing system users and their roles.
 * Allows viewing all users and updating their roles.
 */

import React, { useEffect, useState } from 'react';
import { Shield, Mail, Calendar, RefreshCw, UserCog } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface UserWithRole {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  /**
   * Fetches all users with their roles from user_roles table
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Fetch users from user_roles table
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role, created_at');

      if (rolesError) throw rolesError;

      // Map user roles data
      const usersWithRoles: UserWithRole[] = (rolesData || []).map((item: any) => ({
        id: item.user_id,
        email: item.user_id, // User ID displayed (email can be added via profiles table later)
        created_at: item.created_at,
        role: item.role as UserRole,
      }));

      setUsers(usersWithRoles);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError('Erro ao carregar usuários. Verifique as permissões.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /**
   * Updates a user's role
   */
  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    if (!newRole) return;
    
    setUpdatingUserId(userId);
    
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, role: newRole } : u
      ));

      toast({
        title: 'Papel atualizado',
        description: 'O papel do usuário foi alterado com sucesso.',
      });
    } catch (err: any) {
      console.error('Error updating role:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o papel do usuário.',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  /**
   * Returns badge variant based on role
   */
  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'comercial': return 'default';
      case 'operacional': return 'secondary';
      default: return 'outline';
    }
  };

  /**
   * Returns role display name
   */
  const getRoleDisplayName = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'comercial': return 'Comercial';
      case 'operacional': return 'Operacional';
      default: return 'Sem papel';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Gerenciar Usuários" 
        subtitle="Administração de usuários e permissões do sistema"
      />

      {error && (
        <Card className="p-4 bg-destructive/10 border-destructive/20">
          <div className="flex items-center justify-between">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" size="sm" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCog className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-foreground">Usuários Cadastrados</h3>
            <Badge variant="outline" className="ml-2">{users.length}</Badge>
          </div>
          <Button variant="outline" size="sm" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Usuário
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Papel
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Cadastrado em
                  </div>
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    Nenhum usuário cadastrado.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                          {user.email.includes('@') ? user.email : `ID: ${user.email.slice(0, 8)}...`}
                        </span>
                        {user.id === currentUser?.id && (
                          <span className="text-xs text-primary">(Você)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        value={user.role || 'operacional'}
                        onValueChange={(value) => handleRoleChange(user.id, value as UserRole)}
                        disabled={updatingUserId === user.id || user.id === currentUser?.id}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                          <SelectItem value="operacional">Operacional</SelectItem>
                          <SelectItem value="comercial">Comercial</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 bg-muted/30">
        <h4 className="font-medium text-foreground mb-2">Sobre os papéis</h4>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li><Badge variant="destructive" className="mr-2">Administrador</Badge> Acesso total ao sistema</li>
          <li><Badge variant="default" className="mr-2">Comercial</Badge> Gerencia clientes, aluguéis e financeiro</li>
          <li><Badge variant="secondary" className="mr-2">Operacional</Badge> Visualiza aluguéis e calendário</li>
        </ul>
      </Card>
    </div>
  );
};

export default Users;
