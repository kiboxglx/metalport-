import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, Clock, CreditCard, Banknote, Plus, Check } from 'lucide-react';
import { paymentsService, Payment } from '@/services/paymentsService';
import { rentalsService } from '@/services/rentalsService';
import { Rental } from '@/types/database';
import { format, parseISO, isBefore, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type PaymentStatus = 'PAGO' | 'PENDENTE' | 'ATRASADO';

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case 'PAGO':
      return 'bg-emerald-100 text-emerald-700';
    case 'PENDENTE':
      return 'bg-yellow-100 text-yellow-700';
    case 'ATRASADO':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case 'PAGO':
      return 'Pago';
    case 'PENDENTE':
      return 'Pendente';
    case 'ATRASADO':
      return 'Atrasado';
    default:
      return status;
  }
};

const getPaymentMethodIcon = (method: string) => {
  switch (method) {
    case 'PIX':
    case 'DINHEIRO':
      return <DollarSign className="w-4 h-4" />;
    case 'CARTAO':
      return <CreditCard className="w-4 h-4" />;
    case 'BOLETO':
      return <Banknote className="w-4 h-4" />;
    default:
      return <DollarSign className="w-4 h-4" />;
  }
};

const Financial: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form state
  const [selectedRentalId, setSelectedRentalId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [method, setMethod] = useState<string>('PIX');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, rentalsData] = await Promise.all([
        paymentsService.getPayments(),
        rentalsService.getRentals()
      ]);

      // Auto-update overdue payments
      const today = startOfDay(new Date());
      const updatedPayments = paymentsData.map(payment => {
        if (payment.status === 'PENDENTE' && isBefore(parseISO(payment.due_date), today)) {
          return { ...payment, status: 'ATRASADO' };
        }
        return payment;
      });

      setPayments(updatedPayments);
      setRentals(rentalsData);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!selectedRentalId || !amount || !dueDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await paymentsService.createPayment({
        rental_id: selectedRentalId,
        amount: parseFloat(amount),
        due_date: dueDate,
        method,
        status: 'PENDENTE'
      });
      toast.success('Pagamento criado com sucesso');
      setIsDialogOpen(false);
      setSelectedRentalId('');
      setAmount('');
      setDueDate('');
      setMethod('PIX');
      loadData();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Erro ao criar pagamento');
    }
  };

  const handleMarkAsPaid = async (paymentId: string) => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      await paymentsService.updatePaymentStatus(paymentId, 'PAGO', today);
      toast.success('Pagamento marcado como pago');
      loadData();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Erro ao atualizar pagamento');
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (statusFilter === 'TODOS') return true;
    return payment.status === statusFilter;
  });

  const totalReceivable = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPaid = payments.filter(p => p.status === 'PAGO').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter(p => p.status === 'PENDENTE').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalOverdue = payments.filter(p => p.status === 'ATRASADO').reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Controle de pagamentos e recebimentos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Pagamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Aluguel</Label>
                <Select value={selectedRentalId} onValueChange={setSelectedRentalId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um aluguel" />
                  </SelectTrigger>
                  <SelectContent>
                    {rentals.map((rental) => (
                      <SelectItem key={rental.id} value={rental.id}>
                        {rental.customer?.name} - R$ {Number(rental.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="CARTAO">Cartão</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreatePayment} className="w-full">
                Criar Pagamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Faturamento Total</p>
            <div className="bg-primary/10 p-2 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-foreground">
            R$ {totalReceivable.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Recebido</p>
            <div className="bg-emerald-100 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-emerald-600">
            R$ {totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {totalReceivable > 0 ? Math.round((totalPaid / totalReceivable) * 100) : 0}% do total
          </p>
        </div>

        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">A Receber</p>
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-yellow-600">
            R$ {totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-muted-foreground mt-1">{payments.filter(p => p.status === 'PENDENTE').length} pendentes</p>
        </div>

        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs md:text-sm text-muted-foreground font-medium">Atrasado</p>
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold text-red-600">
            R$ {totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-red-600 mt-1">{payments.filter(p => p.status === 'ATRASADO').length} pagamentos</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">Filtrar por Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos os Pagamentos</SelectItem>
                <SelectItem value="PAGO">Pagos</SelectItem>
                <SelectItem value="PENDENTE">Pendentes</SelectItem>
                <SelectItem value="ATRASADO">Atrasados</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-border">
          <h3 className="text-base md:text-lg font-semibold text-foreground">Pagamentos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-muted/50 border-b border-border">
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cliente</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vencimento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Método</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => {
                const rental = rentals.find(r => r.id === payment.rental_id);
                return (
                  <tr key={payment.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground font-medium">
                      {rental?.customer?.name || '-'}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-foreground font-semibold">
                      R$ {Number(payment.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-muted-foreground whitespace-nowrap">
                      {format(parseISO(payment.due_date), "dd/MM/yyyy")}
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-muted-foreground">
                        {getPaymentMethodIcon(payment.method)}
                        {payment.method}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3 md:py-4">
                      {payment.status !== 'PAGO' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsPaid(payment.id)}
                          className="gap-1"
                        >
                          <Check className="w-3 h-3" />
                          Pago
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-8 md:p-12 text-center">
          <p className="text-muted-foreground">Nenhum pagamento encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  );
};

export default Financial;
