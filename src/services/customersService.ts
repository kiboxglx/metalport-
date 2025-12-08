import { supabase } from '@/integrations/supabase/client';
import { Customer, CustomerInsert, CustomerUpdate } from '@/types/database';
// Importamos a tipagem do Frontend para fazer o mapeamento se necessário
import { Client } from '@/types';

// Estendendo a tipagem do banco temporariamente para incluir os campos novos
// até que você rode o 'supabase gen types' novamente.
interface ExtendedCustomerInsert extends CustomerInsert {
  address_street?: string;
  address_number?: string;
  address_neighborhood?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  type?: string;
}

export const customersService = {
  async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar clientes:', error);
      throw error;
    }
    return data || [];
  },

  async getCustomerById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async createCustomer(customerData: any): Promise<Customer> {
    console.log("🚀 Payload recebido do Form:", customerData);

    // Mapeamento Inteligente: Frontend -> Backend
    const payload: ExtendedCustomerInsert = {
      name: customerData.name,
      // Mapeia cpf_cnpj (frontend) para document (banco)
      document: customerData.cpf_cnpj || customerData.document,
      email: customerData.email,
      // Mapeia phone_whatsapp (frontend) para phone (banco)
      phone: customerData.phone_whatsapp || customerData.phone,
      notes: customerData.notes,

      // Mapeia os endereços (agora que criamos as colunas no Passo 1)
      address_street: customerData.address_street,
      address_number: customerData.address_number,
      address_neighborhood: customerData.address_neighborhood,
      address_city: customerData.address_city,
      address_state: customerData.address_state,
      address_zip: customerData.address_zip,
      type: customerData.type || 'PF'
    };

    console.log("📡 Enviando para Supabase:", payload);

    // Tenta enviar com todos os campos novos
    const { data, error } = await supabase
      .from('customers')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('❌ Erro Supabase createCustomer (Tentativa 1 - Completa):', error);

      // FALLBACK: Se der erro de coluna inexistente (PGRST204 ou 400), tenta enviar sem os campos novos
      // Isso garante que o cliente seja criado mesmo se o cache estiver desatualizado
      if (error.code === 'PGRST204' || error.code === '42703' || error.message.includes('Could not find')) {
        console.warn('⚠️ Tentando fallback sem campos de endereço/tipo...');

        const fallbackPayload = {
          name: customerData.name,
          document: customerData.cpf_cnpj || customerData.document,
          email: customerData.email,
          phone: customerData.phone_whatsapp || customerData.phone,
          notes: customerData.notes
        };

        const { data: dataFallback, error: errorFallback } = await supabase
          .from('customers')
          .insert(fallbackPayload)
          .select()
          .single();

        if (errorFallback) {
          console.error('❌ Erro Supabase createCustomer (Tentativa 2 - Fallback):', errorFallback);
          throw errorFallback;
        }

        console.log("✅ Cliente criado (Fallback):", dataFallback);
        return dataFallback;
      }

      throw error;
    }

    console.log("✅ Cliente criado:", data);
    return data;
  },

  async updateCustomer(id: string, customerData: any): Promise<Customer> {
    const payload: ExtendedCustomerInsert = {
      name: customerData.name,
      document: customerData.cpf_cnpj || customerData.document,
      email: customerData.email,
      phone: customerData.phone_whatsapp || customerData.phone,
      notes: customerData.notes,
      address_street: customerData.address_street,
      address_number: customerData.address_number,
      address_neighborhood: customerData.address_neighborhood,
      address_city: customerData.address_city,
      address_state: customerData.address_state,
      address_zip: customerData.address_zip,
      type: customerData.type
    };

    const { data, error } = await supabase
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomer(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getCustomersCount(): Promise<number> {
    const { count, error } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }
};
