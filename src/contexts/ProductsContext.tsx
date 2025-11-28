import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { productsService, Product } from '@/services/productsService';

interface ProductsContextType {
  productsList: Product[];
  loading: boolean;
  error: string | null;
  refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

interface ProductsProviderProps {
  children: ReactNode;
}

export const ProductsProvider: React.FC<ProductsProviderProps> = ({ children }) => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const products = await productsService.getProducts();
      setProductsList(products);
    } catch (err) {
      console.error('Error loading products:', err);
      setError('Falha ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const refreshProducts = async () => {
    await loadProducts();
  };

  return (
    <ProductsContext.Provider value={{ productsList, loading, error, refreshProducts }}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = (): ProductsContextType => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};
