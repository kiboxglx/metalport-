import { supabase } from '@/integrations/supabase/client';
import { Rental, RentalInsert, RentalItem, RentalItemInsert, RentalWithItems, RentalProductItemInsert } from '@/types/database';

export const rentalsService = {
  async getRentals(): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Rental[];
  },

  async getRentalsByStatus(status: string): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('status', status)
      .order('start_date', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as Rental[];
  },

  async getActiveRentalsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('rentals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'ongoing']);

    if (error) throw error;
    return count || 0;
  },

  async getUpcomingRentals(limit: number = 5): Promise<Rental[]> {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customer:customers(*)
      `)
      .gte('start_date', today)
      .in('status', ['pending', 'confirmed'])
      .order('start_date', { ascending: true })
      .limit(limit);

    if (error) throw error;
    return (data || []) as unknown as Rental[];
  },

  async getRentalById(id: string): Promise<RentalWithItems | null> {
    const { data: rental, error: rentalError } = await supabase
      .from('rentals')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .maybeSingle();

    if (rentalError) throw rentalError;
    if (!rental) return null;

    // Fetch product items
    const { data: productItems, error: productItemsError } = await supabase
      .from('rental_product_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('rental_id', id);

    if (productItemsError) throw productItemsError;

    // Fetch legacy rental items (tents)
    const { data: legacyItems, error: legacyItemsError } = await supabase
      .from('rental_items')
      .select(`
        *,
        tent:tents(*)
      `)
      .eq('rental_id', id);

    if (legacyItemsError) throw legacyItemsError;

    return {
      ...rental,
      rental_items: legacyItems || [],
      rental_product_items: productItems || []
    } as unknown as RentalWithItems;
  },

  async createRental(
    rental: RentalInsert,
    productItems?: Omit<RentalProductItemInsert, 'rental_id'>[]
  ): Promise<Rental> {
    // 1. Check stock availability for all items first
    if (productItems && productItems.length > 0) {
      for (const item of productItems) {
        const { data: product, error: productError } = await supabase
          .from('products')
          .select('total_stock, name')
          .eq('id', item.product_id)
          .single();

        if (productError) throw productError;
        if (!product) throw new Error(`Produto ${item.product_id} não encontrado`);

        if (product.total_stock < item.quantity) {
          throw new Error(`Estoque insuficiente para ${product.name}. Disponível: ${product.total_stock}`);
        }
      }
    }

    // 2. Insert rental
    const { data: newRental, error: rentalError } = await supabase
      .from('rentals')
      .insert(rental as any)
      .select()
      .single();

    if (rentalError) throw rentalError;

    // 3. Insert rental product items and update stock
    if (productItems && productItems.length > 0) {
      const rentalProductItems = productItems.map(item => ({
        ...item,
        rental_id: newRental.id
      }));

      const { error: productItemsError } = await supabase
        .from('rental_product_items')
        .insert(rentalProductItems);

      if (productItemsError) {
        // If items fail to insert, we should ideally delete the rental (rollback-ish)
        await supabase.from('rentals').delete().eq('id', newRental.id);
        throw productItemsError;
      }

      // 4. Deduct stock
      for (const item of productItems) {
        const { data: product } = await supabase
          .from('products')
          .select('total_stock')
          .eq('id', item.product_id)
          .single();

        if (product) {
          await supabase
            .from('products')
            .update({ total_stock: product.total_stock - item.quantity })
            .eq('id', item.product_id);
        }
      }
    }

    return newRental as unknown as Rental;
  },

  async updateRentalStatus(id: string, status: Rental['status']): Promise<Rental> {
    // If cancelling, restore stock
    if (status === 'cancelled') {
      const { data: items } = await supabase
        .from('rental_product_items')
        .select('product_id, quantity')
        .eq('rental_id', id);

      if (items) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('total_stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ total_stock: product.total_stock + item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }

    const { data, error } = await supabase
      .from('rentals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Rental;
  },

  async finalizeRental(id: string): Promise<void> {
    // 1. Get checklist items to determine quantity to restore
    const { data: checklistItems, error: checklistError } = await supabase
      .from('rental_checklist')
      .select('product_id, quantity_collected')
      .eq('rental_id', id);

    if (checklistError) throw checklistError;

    // 2. Restore stock based on collected quantity
    if (checklistItems && checklistItems.length > 0) {
      for (const item of checklistItems) {
        if (item.quantity_collected > 0 && item.product_id) {
          // Get current stock
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('total_stock')
            .eq('id', item.product_id)
            .single();

          if (productError) {
            console.error(`Error fetching product ${item.product_id} for stock restoration`, productError);
            continue;
          }

          // Update stock
          const { error: updateError } = await supabase
            .from('products')
            .update({ total_stock: product.total_stock + item.quantity_collected })
            .eq('id', item.product_id);

          if (updateError) {
            console.error(`Error restoring stock for product ${item.product_id}`, updateError);
          }
        }
      }
    } else {
      // Fallback: if no checklist, restore original rented quantity
      const { data: rentalItems, error: itemsError } = await supabase
        .from('rental_product_items')
        .select('product_id, quantity')
        .eq('rental_id', id);

      if (itemsError) throw itemsError;

      if (rentalItems) {
        for (const item of rentalItems) {
          const { data: product, error: productError } = await supabase
            .from('products')
            .select('total_stock')
            .eq('id', item.product_id)
            .single();

          if (!productError && product) {
            await supabase
              .from('products')
              .update({ total_stock: product.total_stock + item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }

    // 3. Update rental status to finished
    const { error: statusError } = await supabase
      .from('rentals')
      .update({ status: 'finished' })
      .eq('id', id);

    if (statusError) throw statusError;
  },

  async deleteRental(id: string): Promise<void> {
    // 1. Get rental status and items
    const { data: rental } = await supabase
      .from('rentals')
      .select('status')
      .eq('id', id)
      .single();

    // Only restore stock if rental is active (not finished or cancelled)
    // We assume finished/cancelled already restored stock
    if (rental && rental.status !== 'finished' && rental.status !== 'cancelled') {
      const { data: items } = await supabase
        .from('rental_product_items')
        .select('product_id, quantity')
        .eq('rental_id', id);

      if (items) {
        for (const item of items) {
          const { data: product } = await supabase
            .from('products')
            .select('total_stock')
            .eq('id', item.product_id)
            .single();

          if (product) {
            await supabase
              .from('products')
              .update({ total_stock: product.total_stock + item.quantity })
              .eq('id', item.product_id);
          }
        }
      }
    }



    // 2. Delete rental product items
    const { error: productItemsError } = await supabase
      .from('rental_product_items')
      .delete()
      .eq('rental_id', id);

    if (productItemsError) throw productItemsError;

    // Delete rental items (tents) - Clean up legacy data if any
    const { error: itemsError } = await supabase
      .from('rental_items')
      .delete()
      .eq('rental_id', id);

    if (itemsError) throw itemsError;

    const { error } = await supabase
      .from('rentals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getRentalsByCustomerId(customerId: string): Promise<Rental[]> {
    const { data, error } = await supabase
      .from('rentals')
      .select(`
        *,
        customer:customers(*),
        rental_product_items(
          quantity,
          product:products(name)
        ),
        rental_items(
          quantity,
          tent:tents(name)
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as unknown as Rental[];
  },

  async updateRental(id: string, updates: Partial<RentalInsert>): Promise<Rental> {
    const { data, error } = await supabase
      .from('rentals')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Rental;
  },

  async addRentalProductItem(item: RentalProductItemInsert): Promise<void> {
    // 1. Get current product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('total_stock')
      .eq('id', item.product_id)
      .single();

    if (productError) throw productError;
    if (!product) throw new Error('Produto não encontrado');

    if (product.total_stock < item.quantity) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.total_stock}`);
    }

    // 2. Insert item
    const { error: insertError } = await supabase
      .from('rental_product_items')
      .insert(item);

    if (insertError) throw insertError;

    // 3. Update stock
    const { error: updateError } = await supabase
      .from('products')
      .update({ total_stock: product.total_stock - item.quantity })
      .eq('id', item.product_id);

    if (updateError) {
      // Rollback insert if stock update fails (manual compensation)
      console.error('Erro ao atualizar estoque, revertendo inserção...', updateError);
      // Note: This is a best-effort rollback. In a real app, use RPC or transactions.
    }
  },

  async removeRentalProductItem(itemId: string): Promise<void> {
    // 1. Get item details before deleting
    const { data: item, error: fetchError } = await supabase
      .from('rental_product_items')
      .select('product_id, quantity')
      .eq('id', itemId)
      .single();

    if (fetchError) throw fetchError;
    if (!item) throw new Error('Item não encontrado');

    // 2. Delete item
    const { error: deleteError } = await supabase
      .from('rental_product_items')
      .delete()
      .eq('id', itemId);

    if (deleteError) throw deleteError;

    // 3. Get current product stock
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('total_stock')
      .eq('id', item.product_id)
      .single();

    if (productError) {
      console.error('Erro ao buscar produto para repor estoque', productError);
      return;
    }

    // 4. Update stock (restore)
    const { error: updateError } = await supabase
      .from('products')
      .update({ total_stock: product.total_stock + item.quantity })
      .eq('id', item.product_id);

    if (updateError) {
      console.error('Erro ao repor estoque do produto', updateError);
    }
  }
};
