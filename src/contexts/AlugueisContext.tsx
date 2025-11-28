/**
 * AlugueisContext - Rental State Management
 * 
 * Manages the global state for rental data including:
 * - Loading rentals with customer data (joins)
 * - CRUD operations with optimistic updates
 * - Status management for rental lifecycle
 * - Error handling and loading states
 * 
 * Rental Status Flow:
 * pending -> confirmed -> ongoing -> finished
 *                    \-> cancelled
 * 
 * TODO: Consider adding filtering by date range at API level
 * TODO: Add real-time subscriptions for collaborative updates
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Rental, RentalInsert, RentalItemInsert, RentalProductItemInsert, Tent, Customer, Product } from '@/types/database';
import { rentalsService } from '@/services/rentalsService';
import { contractsService, ContractItem } from '@/services/contractsService';
import { differenceInDays } from 'date-fns';

interface AlugueisContextType {
  /** List of all rentals with customer data */
  rentalsList: Rental[];
  /** True while loading data */
  loading: boolean;
  /** Error message if last operation failed */
  error: string | null;
  /** Create a new rental with items and generate contract */
  addRental: (
    rental: RentalInsert, 
    items: Omit<RentalItemInsert, 'rental_id'>[],
    customer?: Customer,
    tents?: Tent[],
    productItems?: Omit<RentalProductItemInsert, 'rental_id'>[],
    products?: Product[]
  ) => Promise<Rental>;
  /** Delete a rental and its items */
  deleteRental: (id: string) => Promise<void>;
  /** Update rental status */
  updateRentalStatus: (id: string, status: Rental['status']) => Promise<Rental>;
  /** Refresh rental list from database */
  refreshRentals: () => Promise<void>;
}

const AlugueisContext = createContext<AlugueisContextType | undefined>(undefined);

interface AlugueisProviderProps {
  children: ReactNode;
}

export const AlugueisProvider: React.FC<AlugueisProviderProps> = ({ children }) => {
  const [rentalsList, setRentalsList] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rentalsService.getRentals();
      setRentalsList(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar aluguéis';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const addRental = async (
    rental: RentalInsert, 
    items: Omit<RentalItemInsert, 'rental_id'>[],
    customer?: Customer,
    tents?: Tent[],
    productItems?: Omit<RentalProductItemInsert, 'rental_id'>[],
    products?: Product[]
  ): Promise<Rental> => {
    const newRental = await rentalsService.createRental(rental, items, productItems);
    
    // Create contract automatically
    if (customer && (tents || products)) {
      try {
        const days = differenceInDays(new Date(rental.end_date), new Date(rental.start_date)) || 1;
        
        const contractItems: ContractItem[] = [];
        
        // Add tent items
        if (tents) {
          items.forEach(item => {
            const tent = tents.find(t => t.id === item.tent_id);
            contractItems.push({
              name: tent?.name || 'Tenda',
              quantity: item.quantity,
              daily_rate: item.unit_price,
              days: days,
              total: item.unit_price * item.quantity * days,
            });
          });
        }
        
        // Add product items
        if (products && productItems) {
          productItems.forEach(item => {
            const product = products.find(p => p.id === item.product_id);
            contractItems.push({
              name: product?.name || 'Produto',
              quantity: item.quantity,
              daily_rate: item.unit_price,
              days: days,
              total: item.unit_price * item.quantity * days,
            });
          });
        }

        await contractsService.createContract({
          rental_id: newRental.id,
          customer_id: rental.customer_id,
          customer_name: customer.name,
          customer_document: customer.document,
          customer_phone: customer.phone,
          customer_address: null,
          start_date: rental.start_date,
          end_date: rental.end_date,
          total_value: rental.total_value,
          equipment_value: contractItems.reduce((sum, item) => sum + item.total * 10, 0),
          items_json: contractItems,
          notes: rental.notes,
        });
      } catch (err) {
        console.error('Error creating contract:', err);
      }
    }
    
    await loadRentals();
    return newRental;
  };

  const deleteRental = async (id: string): Promise<void> => {
    await rentalsService.deleteRental(id);
    // Optimistic update - remove from list
    setRentalsList(prev => prev.filter(r => r.id !== id));
  };

  const updateRentalStatus = async (id: string, status: Rental['status']): Promise<Rental> => {
    const updated = await rentalsService.updateRentalStatus(id, status);
    // Optimistic update - update status in list
    setRentalsList(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
    return updated;
  };

  const refreshRentals = async () => {
    await loadRentals();
  };

  return (
    <AlugueisContext.Provider value={{ 
      rentalsList, 
      loading, 
      error,
      addRental, 
      deleteRental, 
      updateRentalStatus, 
      refreshRentals 
    }}>
      {children}
    </AlugueisContext.Provider>
  );
};

/**
 * Hook to access rentals context
 * Must be used within an AlugueisProvider
 */
export const useAlugueis = (): AlugueisContextType => {
  const context = useContext(AlugueisContext);
  if (!context) {
    throw new Error('useAlugueis must be used within an AlugueisProvider');
  }
  return context;
};

export { AlugueisContext };
