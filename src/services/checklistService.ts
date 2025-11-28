import { supabase } from '@/integrations/supabase/client';

export interface ChecklistItem {
  id: string;
  rental_id: string;
  product_id: string;
  quantity_expected: number;
  quantity_collected: number;
  collected: boolean;
  collected_at: string | null;
  collected_by: string | null;
  notes: string | null;
  created_at: string;
  product?: {
    id: string;
    name: string;
    description: string | null;
  };
}

export interface ChecklistItemInsert {
  rental_id: string;
  product_id: string;
  quantity_expected: number;
  quantity_collected?: number;
  collected?: boolean;
  collected_by?: string | null;
  notes?: string | null;
}

export const checklistService = {
  async getChecklistByRentalId(rentalId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('rental_checklist')
      .select(`
        *,
        product:products(id, name, description)
      `)
      .eq('rental_id', rentalId)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createChecklist(items: ChecklistItemInsert[]): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from('rental_checklist')
      .insert(items)
      .select(`
        *,
        product:products(id, name, description)
      `);
    
    if (error) throw error;
    return data || [];
  },

  async updateChecklistItem(
    id: string, 
    updates: { 
      quantity_collected?: number; 
      collected?: boolean; 
      collected_at?: string; 
      collected_by?: string;
      notes?: string;
    }
  ): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('rental_checklist')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        product:products(id, name, description)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async markAsCollected(id: string, collectedBy: string, quantityCollected: number): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from('rental_checklist')
      .update({
        collected: true,
        collected_at: new Date().toISOString(),
        collected_by: collectedBy,
        quantity_collected: quantityCollected
      })
      .eq('id', id)
      .select(`
        *,
        product:products(id, name, description)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteChecklistByRentalId(rentalId: string): Promise<void> {
    const { error } = await supabase
      .from('rental_checklist')
      .delete()
      .eq('rental_id', rentalId);
    
    if (error) throw error;
  },

  async generateChecklistFromRental(rentalId: string): Promise<ChecklistItem[]> {
    // Get rental product items
    const { data: productItems, error: productError } = await supabase
      .from('rental_product_items')
      .select('product_id, quantity')
      .eq('rental_id', rentalId);
    
    if (productError) throw productError;
    if (!productItems || productItems.length === 0) return [];

    // Check if checklist already exists
    const existing = await this.getChecklistByRentalId(rentalId);
    if (existing.length > 0) return existing;

    // Create checklist items
    const checklistItems: ChecklistItemInsert[] = productItems.map(item => ({
      rental_id: rentalId,
      product_id: item.product_id,
      quantity_expected: item.quantity,
      quantity_collected: 0,
      collected: false
    }));

    return await this.createChecklist(checklistItems);
  }
};
