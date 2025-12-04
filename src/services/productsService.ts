import { supabase } from '@/integrations/supabase/client';

export interface Product {
  id: string;
  name: string;
  description: string | null;
  unit_price: number;
  daily_rental_price: number;
  total_stock: number;
  category: string | null;
  created_at: string;
}

export interface ProductInsert {
  name: string;
  description?: string | null;
  unit_price: number;
  daily_rental_price: number;
  total_stock: number;
  category?: string | null;
}

export type ProductUpdate = Partial<ProductInsert>;

export const productsService = {
  async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createProduct(product: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateProduct(id: string, product: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getProductsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  },

  async seedDefaultProducts(): Promise<void> {
    const defaultProducts = [
      { name: 'Tenda Piramidal 3x3', description: 'Tenda branca 3x3m com calhas', category: 'Tendas', unit_price: 1500.00, daily_rental_price: 150.00, total_stock: 10 },
      { name: 'Tenda Piramidal 5x5', description: 'Tenda branca 5x5m reforçada', category: 'Tendas', unit_price: 2500.00, daily_rental_price: 250.00, total_stock: 5 },
      { name: 'Tenda Sanfonada 3x3', description: 'Tenda montagem rápida', category: 'Tendas', unit_price: 800.00, daily_rental_price: 100.00, total_stock: 15 },
      { name: 'Palco 4x4m', description: 'Palco modular com carpete', category: 'Palcos', unit_price: 5000.00, daily_rental_price: 500.00, total_stock: 2 },
      { name: 'Grade de Isolamento', description: 'Grade de ferro 2m', category: 'Estruturas', unit_price: 200.00, daily_rental_price: 20.00, total_stock: 50 },
      { name: 'Andaime Tubular 1.0m', description: 'Painel de andaime 1.0x1.0m', category: 'Estruturas', unit_price: 150.00, daily_rental_price: 10.00, total_stock: 40 },
      { name: 'Mesa Plástica', description: 'Mesa quadrada branca', category: 'Mesas e Cadeiras', unit_price: 80.00, daily_rental_price: 8.00, total_stock: 100 },
      { name: 'Cadeira Plástica', description: 'Cadeira branca sem braço', category: 'Mesas e Cadeiras', unit_price: 40.00, daily_rental_price: 4.00, total_stock: 400 },
      { name: 'Escada Extensiva 7m', description: 'Escada de alumínio', category: 'Escadas', unit_price: 600.00, daily_rental_price: 40.00, total_stock: 3 },
      { name: 'Holofote LED 100W', description: 'Refletor para iluminação', category: 'Acessórios', unit_price: 120.00, daily_rental_price: 15.00, total_stock: 20 }
    ];

    for (const product of defaultProducts) {
      const { data } = await supabase
        .from('products')
        .select('id')
        .eq('name', product.name)
        .maybeSingle();

      if (!data) {
        await supabase.from('products').insert(product);
      }
    }
  }
};
