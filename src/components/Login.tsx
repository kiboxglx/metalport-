import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate a brief network delay for realism
    setTimeout(() => {
      onLogin();
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden px-4 py-8">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[5%] w-[60%] md:w-[40%] h-[40%] rounded-full bg-brand-green/5 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[5%] w-[50%] md:w-[30%] h-[50%] rounded-full bg-brand-red/5 blur-3xl"></div>
      </div>

      <div className="bg-white p-6 md:p-10 rounded-2xl shadow-2xl w-full max-w-md relative z-10 border border-white/40 backdrop-blur-sm">
        <div className="flex flex-col items-center mb-6 md:mb-8">
          <img 
            src="https://assets.zyrosite.com/cdn-cgi/image/format=auto,w=768,fit=crop,q=95/Awv8D6GZgpToMVGz/logo-AE07a1zRjxfEbrle.jpg" 
            alt="Metalport" 
            className="h-12 md:h-16 w-auto mb-4 md:mb-5 object-contain"
          />
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Acesso Interno</h1>
          <p className="text-gray-500 mt-2 text-xs md:text-sm text-center">
            Use seu e-mail corporativo para entrar no sistema Metalport.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
              E-mail
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-brand-green transition-colors" />
              </div>
              <input 
                id="email"
                type="email" 
                required
                className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="nome@metalport.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
              Senha
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-brand-green transition-colors" />
              </div>
              <input 
                id="password"
                type="password" 
                required
                className="block w-full pl-10 pr-3 py-2.5 md:py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <InteractiveHoverButton
            type="submit" 
            disabled={isLoading}
            text={isLoading ? 'Acessando...' : 'Entrar'}
            className="w-full bg-brand-green hover:bg-emerald-700 text-white font-semibold py-2.5 md:py-3 rounded-lg shadow-md shadow-emerald-500/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2 text-sm md:text-base border-0"
          />
        </form>
        
        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-gray-100 text-center">
          <a href="#" className="text-xs text-gray-400 hover:text-brand-green transition-colors">
            Esqueceu sua senha? Contate o suporte de TI.
          </a>
        </div>
      </div>
    </div>
  );
};
