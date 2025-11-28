import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Search,
  LogOut,
  User,
  Check,
  Trash2,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { NavBar } from '@/components/ui/tubelight-navbar';

interface TopBarProps {
  title: string;
  navItems: { name: string; url: string; icon: any }[];
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrador',
  comercial: 'Comercial',
  operacional: 'Operacional',
};

export const TopBar: React.FC<TopBarProps> = ({ title, navItems }) => {
  const { user, userRole, signOut } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications();

  const displayName = user?.email?.split('@')[0] || 'Usuário';
  const roleLabel = userRole ? ROLE_LABELS[userRole] || userRole : 'Usuário';

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 md:h-20 bg-gradient-to-r from-metal-900 to-metal-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shadow-lg relative gap-4">

      {/* Left: Logo */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <img
          src="/logo-dark.png"
          alt="Metalport"
          className="h-8 md:h-10 w-auto object-contain"
        />
      </div>

      {/* Center: Navigation */}
      <div className="flex-1 flex justify-center">
        <NavBar
          items={navItems}
          className="relative transform-none left-auto translate-x-0 mb-0 pt-0 z-0 top-auto bottom-auto"
        />
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="relative p-2 hover:bg-white/10 rounded-full transition-colors text-gray-300 hover:text-white">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 bg-brand-red rounded-full border-2 border-metal-900" />
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-4 bg-card border-border shadow-xl" align="end">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h4 className="font-semibold text-foreground">Notificações</h4>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-auto py-1 px-2"
                  onClick={markAllAsRead}
                >
                  Marcar todas como lidas
                </Button>
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Nenhuma notificação</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p - 4 hover: bg - muted / 50 transition - colors cursor - pointer ${!notification.read ? 'bg-muted/20' : ''} `}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3 items-start">
                        <div className={`mt - 1 p - 1.5 rounded - full flex - shrink - 0 
                          ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                              notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                'bg-red-100 text-red-600'
                          } `}
                        >
                          {notification.type === 'info' && <Info className="h-3 w-3" />}
                          {notification.type === 'warning' && <AlertTriangle className="h-3 w-3" />}
                          {notification.type === 'success' && <CheckCircle className="h-3 w-3" />}
                          {notification.type === 'error' && <XCircle className="h-3 w-3" />}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium leading-none text-foreground">{notification.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true, locale: ptBR })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-primary rounded-full mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
            {notifications.length > 0 && (
              <div className="p-2 border-t border-border bg-muted/20">
                <Button
                  variant="ghost"
                  className="w-full text-xs h-8 justify-center text-muted-foreground hover:text-foreground"
                  onClick={clearNotifications}
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Limpar histórico
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 md:gap-3 p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition-colors group outline-none">
              <div className="h-8 w-8 md:h-9 md:w-9 rounded-full bg-brand-green/20 border border-brand-green/30 flex items-center justify-center text-brand-green group-hover:bg-brand-green/30 transition-colors">
                <User className="h-4 w-4 md:h-5 md:w-5" />
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-none">{displayName}</p>
                <p className="text-xs text-gray-400 mt-1">{roleLabel}</p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sair</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
