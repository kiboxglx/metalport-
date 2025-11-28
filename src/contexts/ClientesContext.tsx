/**
 * ClientesContext - Customer State Management
 * 
 * Manages the global state for customer data including:
 * - Loading and caching customer data from Supabase
 * - CRUD operations with optimistic updates
 * - Error handling and loading states
 * 
 * TODO: Consider adding pagination for large customer bases (500+ records)
 * TODO: Consider adding search/filter at the API level for better performance
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, CustomerInsert, CustomerUpdate } from '@/types/database';
import { customersService } from '@/services/customersService';

interface ClientesContextType {
  /** List of all customers */
  clientsList: Customer[];
  /** True while loading data */
  loading: boolean;
  /** Error message if last operation failed */
  error: string | null;
  /** Add a new customer */
  addClient: (client: CustomerInsert) => Promise<Customer>;
  /** Delete a customer by ID */
  deleteClient: (id: string) => Promise<void>;
  /** Update an existing customer */
  updateClient: (id: string, client: CustomerUpdate) => Promise<Customer>;
  /** Refresh customer list from database */
  refreshClients: () => Promise<void>;
}

const ClientesContext = createContext<ClientesContextType | undefined>(undefined);

interface ClientesProviderProps {
  children: ReactNode;
}

export const ClientesProvider: React.FC<ClientesProviderProps> = ({ children }) => {
  const [clientsList, setClientsList] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await customersService.getCustomers();
      setClientsList(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar clientes';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addClient = async (client: CustomerInsert): Promise<Customer> => {
    const newClient = await customersService.createCustomer(client);
    // Optimistic update - add to beginning of list
    setClientsList(prev => [newClient, ...prev]);
    return newClient;
  };

  const deleteClient = async (id: string): Promise<void> => {
    await customersService.deleteCustomer(id);
    // Optimistic update - remove from list
    setClientsList(prev => prev.filter(c => c.id !== id));
  };

  const updateClient = async (id: string, updatedFields: CustomerUpdate): Promise<Customer> => {
    const updated = await customersService.updateCustomer(id, updatedFields);
    // Optimistic update - replace in list
    setClientsList(prev =>
      prev.map(c => (c.id === id ? updated : c))
    );
    return updated;
  };

  const refreshClients = async () => {
    await loadClients();
  };

  return (
    <ClientesContext.Provider value={{ 
      clientsList, 
      loading, 
      error,
      addClient, 
      deleteClient, 
      updateClient, 
      refreshClients 
    }}>
      {children}
    </ClientesContext.Provider>
  );
};

/**
 * Hook to access customer context
 * Must be used within a ClientesProvider
 */
export const useClientes = (): ClientesContextType => {
  const context = useContext(ClientesContext);
  if (!context) {
    throw new Error('useClientes must be used within a ClientesProvider');
  }
  return context;
};

export { ClientesContext };
