import React, { useState, useEffect } from 'react';
import { DollarSign, AlertCircle, CheckCircle2, Clock, CreditCard, Banknote, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { paymentsService, Payment } from '@/services/paymentsService';
import { rentalsService } from '@/services/rentalsService';
import { Rental } from '@/types/database';
import { format, parseISO, isBefore, startOfDay, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

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
      console.log('Dados de pagamentos carregados:', paymentsData);
      const today = startOfDay(new Date());
      const updatedPayments = paymentsData.map(payment => {
        if (payment.status === 'PENDENTE' && isBefore(parseISO(payment.due_date), today)) {
          return { ...payment, status: 'ATRASADO' };
        }
        return payment;
      });

      setPayments(updatedPayments);
      setRentals(rentalsData);
      processChartData(updatedPayments);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  const processChartData = (paymentsData: Payment[]) => {
    const today = new Date();
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(today, i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      const monthLabel = format(date, 'MMM', { locale: ptBR }).toUpperCase();

      const monthlyTotal = paymentsData
        .filter(p => {
          if (p.status !== 'PAGO') return false;
          const paymentDate = p.paid_date ? parseISO(p.paid_date) : parseISO(p.due_date);
          return isWithinInterval(paymentDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, p) => sum + Number(p.amount), 0);

      data.push({ name: monthLabel, total: monthlyTotal });
    }
    setChartData(data);
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

  const handleDeleteClick = (payment: Payment) => {
    setPaymentToDelete(payment);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!paymentToDelete) return;

    // Optimistic update
    const previousPayments = [...payments];
    setPayments(payments.filter(p => p.id !== paymentToDelete.id));

    try {
      await paymentsService.deletePayment(paymentToDelete.id);
      toast.success('Pagamento excluído com sucesso');
      // No need to reload data if successful, as we already updated the UI
    } catch (error: any) {
      console.error('Error deleting payment:', error);
      // Revert changes if failed
      setPayments(previousPayments);
      toast.error(`Erro ao excluir pagamento: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setDeleteDialogOpen(false);
      setPaymentToDelete(null);
    }
  };

  const openEditDialog = (payment: Payment) => {
    setEditingPayment(payment);
    setSelectedRentalId(payment.rental_id);
    setAmount(payment.amount.toString());
    setDueDate(payment.due_date);
    setMethod(payment.method);
    setIsEditDialogOpen(true);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment || !selectedRentalId || !amount || !dueDate) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      await paymentsService.updatePayment(editingPayment.id, {
        rental_id: selectedRentalId,
        amount: parseFloat(amount),
        due_date: dueDate,
        method,
      });
      toast.success('Pagamento atualizado com sucesso');
      setIsEditDialogOpen(false);
      setEditingPayment(null);
      setSelectedRentalId('');
      setAmount('');
      setDueDate('');
      setMethod('PIX');
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

      {/* Revenue Chart */}
      <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Faturamento Mensal (Últimos 6 Meses)</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip
                formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Faturamento']}
                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
              />
              <Bar
                dataKey="total"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                barSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
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
                      <div className="flex items-center gap-2">
                        {payment.status !== 'PAGO' && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleMarkAsPaid(payment.id)}
                            title="Marcar como Pago"
                            className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEditDialog(payment)}
                          title="Editar"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleDeleteClick(payment)}
                          title="Excluir"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
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
            <Button onClick={handleUpdatePayment} className="w-full">
              Salvar Alterações
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Financial;
