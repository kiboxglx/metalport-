import { supabase } from '@/integrations/supabase/client';

export interface Payment {
  id: string;
  rental_id: string;
  due_date: string;
  paid_date: string | null;
  amount: number;
  method: string;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface PaymentInsert {
  rental_id: string;
  due_date: string;
  paid_date?: string | null;
  amount: number;
  method?: string;
  status?: string;
  notes?: string | null;
}

export const paymentsService = {
  async getPayments(): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('due_date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getPaymentsByRentalId(rentalId: string): Promise<Payment[]> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('rental_id', rentalId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createPayment(payment: PaymentInsert): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert(payment)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePaymentStatus(id: string, status: string, paidDate?: string): Promise<Payment> {
    const updateData: { status: string; paid_date?: string } = { status };
    if (paidDate) {
      updateData.paid_date = paidDate;
    }

    const { data, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updatePayment(id: string, payment: Partial<PaymentInsert>): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .update(payment)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deletePayment(id: string): Promise<void> {
    const { error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async getFinancialSummary(): Promise<{
    totalReceivable: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }> {
    const { data, error } = await supabase
      .from('payments')
      .select('amount, status');

    if (error) throw error;

    const payments = data || [];

    return {
      totalReceivable: payments.reduce((sum, p) => sum + Number(p.amount), 0),
      totalPaid: payments.filter(p => p.status === 'PAGO').reduce((sum, p) => sum + Number(p.amount), 0),
      totalPending: payments.filter(p => p.status === 'PENDENTE').reduce((sum, p) => sum + Number(p.amount), 0),
      totalOverdue: payments.filter(p => p.status === 'ATRASADO').reduce((sum, p) => sum + Number(p.amount), 0),
    };
  }
};
