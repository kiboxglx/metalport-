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

    const { data: items, error: itemsError } = await supabase
      .from('rental_items')
      .select(`
        *,
        tent:tents(*)
      `)
      .eq('rental_id', id);

    if (itemsError) throw itemsError;

    const { data: productItems, error: productItemsError } = await supabase
      .from('rental_product_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('rental_id', id);

    if (productItemsError) throw productItemsError;

    return {
      ...rental,
      rental_items: items || [],
      rental_product_items: productItems || []
    } as unknown as RentalWithItems;
  },

  async createRental(
    rental: RentalInsert,
    items: Omit<RentalItemInsert, 'rental_id'>[],
    productItems?: Omit<RentalProductItemInsert, 'rental_id'>[]
  ): Promise<Rental> {
    // Insert rental
    const { data: newRental, error: rentalError } = await supabase
      .from('rentals')
      .insert(rental as any)
      .select()
      .single();

    if (rentalError) throw rentalError;

    // Insert rental items (tents)
    if (items.length > 0) {
      const rentalItems = items.map(item => ({
        ...item,
        rental_id: newRental.id
      }));

      const { error: itemsError } = await supabase
        .from('rental_items')
        .insert(rentalItems);

      if (itemsError) throw itemsError;
    }

    // Insert rental product items
    if (productItems && productItems.length > 0) {
      const rentalProductItems = productItems.map(item => ({
        ...item,
        rental_id: newRental.id
      }));

      const { error: productItemsError } = await supabase
        .from('rental_product_items')
        .insert(rentalProductItems);

      if (productItemsError) throw productItemsError;
    }

    return newRental as unknown as Rental;
  },

  async updateRentalStatus(id: string, status: Rental['status']): Promise<Rental> {
    const { data, error } = await supabase
      .from('rentals')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Rental;
  },

  async deleteRental(id: string): Promise<void> {
    // Delete rental items first (cascade should handle this but being explicit)
    const { error: itemsError } = await supabase
      .from('rental_items')
      .delete()
      .eq('rental_id', id);

    if (itemsError) throw itemsError;

    // Delete rental product items
    const { error: productItemsError } = await supabase
      .from('rental_product_items')
      .delete()
      .eq('rental_id', id);

    if (productItemsError) throw productItemsError;

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
        customer:customers(*)
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
  }
};
