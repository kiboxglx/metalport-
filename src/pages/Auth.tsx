import React, { useState } from 'react';
import { Lock, Mail, Shield } from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('operacional');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, signUp, userRole } = useAuth();
  const { toast } = useToast();

  // Only admins can select roles when creating new accounts
  const isAdmin = userRole === 'admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Erro ao entrar",
            description: error.message === 'Invalid login credentials'
              ? 'E-mail ou senha incorretos.'
              : error.message,
            variant: "destructive",
          });
        }
      } else {
        const roleToAssign = isAdmin ? selectedRole : 'operacional';
        const { error } = await signUp(email, password, roleToAssign);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: "Erro",
              description: "Este e-mail já está cadastrado.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro ao cadastrar",
              description: error.message,
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Cadastro realizado!",
            description: "Verifique seu e-mail para confirmar o cadastro.",
          });
          setIsLogin(true);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-secondary to-background relative overflow-hidden px-4 py-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-primary/5 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[5%] w-[50%] md:w-[30%] h-[50%] rounded-full bg-destructive/5 blur-3xl"></div>
      </div>

      <div className="bg-card p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-border backdrop-blur-sm">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <img
            src="/logo-dark.png"
            alt="Metalport"
            className="h-12 md:h-16 w-auto mb-4 md:mb-5 object-contain rounded-sm"
          />
          <h1 className="text-xl md:text-2xl font-bold text-foreground tracking-tight">
            {isLogin ? 'Acesso Interno' : 'Criar Conta'}
          </h1>
          <p className="text-muted-foreground mt-2 text-xs md:text-sm text-center">
            {isLogin
              ? 'Use seu e-mail corporativo para entrar no sistema.'
              : 'Preencha os dados para criar sua conta.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="email">
              E-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="email"
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-foreground placeholder-muted-foreground bg-background"
                placeholder="nome@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1" htmlFor="password">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
              </div>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm text-foreground placeholder-muted-foreground bg-background"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role selector - only visible for admins creating new accounts */}
          {!isLogin && isAdmin && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-1" htmlFor="role">
                Papel do Usuário
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                </div>
                <Select value={selectedRole || 'operacional'} onValueChange={(value) => setSelectedRole(value as UserRole)}>
                  <SelectTrigger className="w-full pl-10 py-2.5 md:py-3 bg-background border-border">
                    <SelectValue placeholder="Selecione o papel" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="operacional">Operacional</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full font-semibold py-2.5 md:py-3 mt-2"
          >
            {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>

        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-border text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
