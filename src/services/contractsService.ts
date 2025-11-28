import { supabase } from '@/integrations/supabase/client';

export interface Contract {
  id: string;
  contract_number: number;
  rental_id: string;
  customer_id: string;
  generated_at: string;
  pdf_url: string | null;
  customer_name: string;
  customer_document: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  start_date: string;
  end_date: string;
  total_value: number;
  equipment_value: number;
  items_json: ContractItem[];
  notes: string | null;
  created_at: string;
}

export interface ContractItem {
  name: string;
  quantity: number;
  daily_rate: number;
  days: number;
  total: number;
}

export interface ContractInsert {
  rental_id: string;
  customer_id: string;
  customer_name: string;
  customer_document?: string | null;
  customer_phone?: string | null;
  customer_address?: string | null;
  start_date: string;
  end_date: string;
  total_value: number;
  equipment_value?: number;
  items_json: ContractItem[];
  notes?: string | null;
}

export const contractsService = {
  async getContracts(): Promise<Contract[]> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .order('contract_number', { ascending: false });
    
    if (error) throw error;
    return (data || []) as unknown as Contract[];
  },

  async getContractById(id: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data as unknown as Contract | null;
  },

  async getContractByRentalId(rentalId: string): Promise<Contract | null> {
    const { data, error } = await supabase
      .from('contracts')
      .select('*')
      .eq('rental_id', rentalId)
      .maybeSingle();
    
    if (error) throw error;
    return data as unknown as Contract | null;
  },

  async createContract(contract: ContractInsert): Promise<Contract> {
    const { data, error } = await supabase
      .from('contracts')
      .insert(contract as any)
      .select()
      .single();
    
    if (error) throw error;
    return data as unknown as Contract;
  },

  async deleteContract(id: string): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async getContractsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('contracts')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return count || 0;
  }
};
