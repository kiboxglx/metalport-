import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { MainLayout } from './components/layout/MainLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import {
  EventsView,
  ScheduleView,
  ServiceOrdersView,
} from './components/Views';
import Clients from './pages/Clients';
import Dashboard from './pages/Dashboard';
import Rentals from './pages/Rentals';
import NewRental from './pages/NewRental';
import RentalDetail from './pages/RentalDetail';
import EditRental from './pages/EditRental';
import CalendarView from './pages/CalendarView';
import Financial from './pages/Financial';
import Users from './pages/Users';
import Contracts from './pages/Contracts';
import Products from './pages/Products';
import Auth from './pages/Auth';
import Settings from './pages/Settings';

// Context providers for global state management
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ClientesProvider } from './contexts/ClientesContext';
import { AlugueisProvider } from './contexts/AlugueisContext';
import { ProductsProvider } from './contexts/ProductsContext';
import { TentsProvider } from './contexts/TentsContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { ThemeProvider } from './components/theme-provider';

const queryClient = new QueryClient();

/**
 * AppContent Component
 * 
 * Handles authentication state and renders either the Login screen
 * or the main application with routing.
 */
function AppContent() {
  const { user, loading } = useAuth();

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show Auth screen
  if (!user) {
    return <Auth />;
  }

  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* Redirect home to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Produtos - Admin and Comercial */}
          <Route
            path="/produtos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <Products />
              </ProtectedRoute>
            }
          />

          {/* Clientes - Admin and Comercial */}
          <Route
            path="/clientes"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <Clients />
              </ProtectedRoute>
            }
          />

          {/* Aluguéis - All roles (with action restrictions in component) */}
          <Route path="/alugueis" element={<Rentals />} />
          <Route
            path="/alugueis/novo"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <NewRental />
              </ProtectedRoute>
            }
          />
          <Route path="/alugueis/:id" element={<RentalDetail />} />
          <Route
            path="/alugueis/editar/:id"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <EditRental />
              </ProtectedRoute>
            }
          />

          {/* Calendário - All roles */}
          <Route path="/calendario" element={<CalendarView />} />

          {/* Financeiro - Admin and Comercial */}
          <Route
            path="/financeiro"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <Financial />
              </ProtectedRoute>
            }
          />

          {/* Relatórios / Contratos - Admin only */}
          <Route
            path="/relatorios"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Contracts />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contratos"
            element={
              <ProtectedRoute allowedRoles={['admin', 'comercial']}>
                <Contracts />
              </ProtectedRoute>
            }
          />

          {/* Usuários - Admin only */}
          <Route
            path="/usuarios"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <Users />
              </ProtectedRoute>
            }
          />

          {/* Configurações - All roles */}
          <Route path="/configuracoes" element={<Settings />} />

          {/* Secondary pages */}
          <Route path="/eventos" element={<EventsView />} />
          <Route path="/agenda" element={<ScheduleView />} />
          <Route path="/ordens-servico" element={<ServiceOrdersView />} />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

/**
 * App Component
 * 
 * Root component that provides global context providers
 */
const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <AuthProvider>
          <ProductsProvider>
            <ClientesProvider>
              <AlugueisProvider>
                <TentsProvider>
                  <NotificationsProvider>
                    <Toaster />
                    <Sonner />
                    <AppContent />
                  </NotificationsProvider>
                </TentsProvider>
              </AlugueisProvider>
            </ClientesProvider>
          </ProductsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
