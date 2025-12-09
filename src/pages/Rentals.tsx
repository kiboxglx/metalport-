import React, { useState, useMemo } from 'react';
import { Search, Eye, Calendar, User, Trash2, Plus, FileDown, X, Edit } from 'lucide-react';
import { Rental, RentalInsert, RentalProductItemInsert } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { MobileCard, MobileCardHeader, MobileCardContent, MobileCardFooter, MobileCardActions } from '@/components/ui/mobile-card';
import { MobileActionButton, MobileIconButton } from '@/components/ui/mobile-buttons';
import { StatusBadge } from '@/components/common/StatusBadge';
import { format, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useAlugueis } from '@/contexts/AlugueisContext';
import { useClientes } from '@/contexts/ClientesContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { useNavigate } from 'react-router-dom';
import { generateRentalPDF } from '@/utils/generateRentalPDF';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const STATUS_CONFIG: Record<string, { label: string; colorClass: string }> = {
  pending: { label: 'Pagamento Pendente', colorClass: 'bg-yellow-100 text-yellow-800' },
  awaiting_payment: { label: 'Aguardando Pagamento', colorClass: 'bg-orange-100 text-orange-800' },
  confirmed: { label: 'Aprovado', colorClass: 'bg-green-100 text-green-800' },
  ongoing: { label: 'Em Andamento', colorClass: 'bg-emerald-100 text-emerald-800' },
  collecting: { label: 'Recolher Material', colorClass: 'bg-purple-100 text-purple-800' },
  finished: { label: 'Contrato Expirado', colorClass: 'bg-gray-100 text-gray-600' },
  cancelled: { label: 'Cancelado', colorClass: 'bg-red-100 text-red-800' },
};

interface SelectedProduct {
  productId: string;
  quantity: number;
}

interface NewRentalForm {
  customerId: string;
  startDate: string;
  endDate: string;
  notes: string;
  paymentMethod: string;
  discount: string;
  deliveryFee: string;
  duration?: string;
}

const initialFormState: NewRentalForm = {
  customerId: '',
  startDate: '',
  endDate: '',
  notes: '',
  paymentMethod: 'PIX',
  discount: '0',
  deliveryFee: '0',
};

const Rentals: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { userRole } = useAuth();

  const { rentalsList, loading, addRental, deleteRental } = useAlugueis();
  const { clientsList } = useClientes();
  const { productsList } = useProducts();

  const { addNotification } = useNotifications();

  // Role-based permissions
  const canCreate = userRole === 'admin' || userRole === 'comercial';
  const canDelete = userRole === 'admin' || userRole === 'comercial';
  const canDownloadPDF = userRole === 'admin' || userRole === 'comercial';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewRentalForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<NewRentalForm> & { products?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rentalToDelete, setRentalToDelete] = useState<Rental | null>(null);

  // Helper to calculate chargeable days (excluding weekends)
  const countBusinessDays = (start: Date, end: Date) => {
    let count = 0;
    const current = new Date(start);
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    return Math.max(0, count); // Ensure non-negative
  };

  // Calculate totals based on selected products
  const calculatedTotals = useMemo(() => {
    if (!formData.startDate || !formData.endDate || selectedProducts.length === 0) {
      return { dailyRate: 0, subtotal: 0, total: 0, days: 0, chargedDays: 0, deliveryFee: 0 };
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    const days = Math.max(1, differenceInDays(end, start) + 1);
    const chargedDays = countBusinessDays(start, end);

    const discount = parseFloat(formData.discount) || 0;
    const deliveryFee = parseFloat(formData.deliveryFee) || 0;

    let dailyRate = 0;
    selectedProducts.forEach(sp => {
      const product = productsList.find(p => p.id === sp.productId);
      if (product) {
        dailyRate += product.daily_rental_price * sp.quantity;
      }
    });

    const subtotal = dailyRate * chargedDays; // Use chargedDays instead of total days
    const total = Math.max(0, subtotal - discount + deliveryFee);

    return { dailyRate, subtotal, total, days, chargedDays, deliveryFee };
  }, [selectedProducts, formData.startDate, formData.endDate, formData.discount, formData.deliveryFee, productsList]);

  const filteredRentals = rentalsList.filter(rental => {
    const matchesSearch =
      (rental.customer?.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rental.notes && rental.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'TODOS' || rental.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddProduct = (productId: string) => {
    if (!productId || selectedProducts.some(p => p.productId === productId)) return;
    setSelectedProducts([...selectedProducts, { productId, quantity: 1 }]);
    if (formErrors.products) {
      setFormErrors(prev => ({ ...prev, products: undefined }));
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
  };

  const handleProductQuantityChange = (productId: string, quantity: number) => {
    setSelectedProducts(selectedProducts.map(p =>
      p.productId === productId ? { ...p, quantity: Math.max(1, quantity) } : p
    ));
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewRentalForm> & { products?: string } = {};

    if (!formData.customerId) {
      errors.customerId = 'Cliente é obrigatório';
    }

    if (selectedProducts.length === 0) {
      errors.products = 'Selecione pelo menos um produto';
    }

    if (!formData.startDate) {
      errors.startDate = 'Data inicial é obrigatória';
    }

    if (!formData.endDate) {
      errors.endDate = 'Data final é obrigatória';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      errors.endDate = 'Data final deve ser posterior à data inicial';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddRental = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { dailyRate, total, days } = calculatedTotals;
      const discount = parseFloat(formData.discount) || 0;
      const deliveryFee = parseFloat(formData.deliveryFee) || 0;

      const rentalData: RentalInsert = {
        customer_id: formData.customerId,
        start_date: formData.startDate,
        end_date: formData.endDate,
        status: 'pending',
        total_value: total,
        notes: formData.notes.trim() || null,
        payment_method: formData.paymentMethod,
        discount: discount,
        daily_rate: dailyRate,
        delivery_fee: deliveryFee,
      };

      const productItems: Omit<RentalProductItemInsert, 'rental_id'>[] = selectedProducts.map(sp => {
        const product = productsList.find(p => p.id === sp.productId);
        return {
          product_id: sp.productId,
          quantity: sp.quantity,
          unit_price: product?.daily_rental_price || 0,
        };
      });

      const selectedCustomer = clientsList.find(c => c.id === formData.customerId);

      await addRental(rentalData, selectedCustomer, productItems, productsList);

      setIsAddDialogOpen(false);
      setFormData(initialFormState);
      setSelectedProducts([]);
      setFormErrors({});

      toast({
        title: 'Aluguel criado',
        description: 'O aluguel foi criado com sucesso.',
      });

      addNotification(
        'Novo Aluguel',
        `Aluguel criado para ${selectedCustomer?.name}`,
        'success'
      );
    } catch (error: any) {
      console.error('Error creating rental:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao criar aluguel.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (rental: Rental) => {
    setRentalToDelete(rental);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!rentalToDelete) return;

    try {
      await deleteRental(rentalToDelete.id);

      toast({
        title: 'Aluguel excluído',
        description: 'O aluguel foi removido.',
        variant: 'destructive',
      });

      addNotification(
        'Aluguel Excluído',
        `O aluguel de ${rentalToDelete.customer?.name} foi removido`,
        'warning'
      );
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir aluguel.',
        variant: 'destructive',
      });
    }

    setDeleteDialogOpen(false);
    setRentalToDelete(null);
  };

  const handleFormChange = (field: keyof NewRentalForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Aluguéis"
        subtitle="Gerencie seus contratos de aluguel"
        actionLabel={canCreate ? "+ Novo Aluguel" : undefined}
        onActionClick={canCreate ? () => setIsAddDialogOpen(true) : undefined}
      />

      <Card>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 md:h-5 md:w-5" />
            <input
              type="text"
              placeholder="Buscar por cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 md:px-4 py-2 md:py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-sm bg-background text-foreground"
          >
            <option value="TODOS">Todos os Status</option>
            <option value="pending">Pagamento Pendente</option>
            <option value="awaiting_payment">Aguardando Pagamento</option>
            <option value="confirmed">Aprovado</option>
            <option value="ongoing">Em Andamento</option>
            <option value="collecting">Recolher Material</option>
            <option value="finished">Contrato Expirado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Total de Aluguéis</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            {loading ? '...' : rentalsList.length}
          </p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Ativos</p>
          <p className="text-2xl md:text-3xl font-bold text-primary mt-1">
            {loading ? '...' : rentalsList.filter(r => ['pending', 'awaiting_payment', 'confirmed', 'ongoing', 'collecting'].includes(r.status)).length}
          </p>
        </Card>
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Faturamento</p>
          <p className="text-lg md:text-xl font-bold text-foreground mt-1">
            {loading ? '...' : formatCurrency(rentalsList.reduce((sum, r) => sum + r.total_value, 0))}
          </p>
        </Card>
      </div>

      {loading ? (
        <Card className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground">Carregando aluguéis...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
          {filteredRentals.map((rental) => (
            <Card key={rental.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 truncate">
                    {rental.customer?.name || 'Cliente não encontrado'}
                  </h3>
                  <StatusBadge
                    label={STATUS_CONFIG[rental.status]?.label || rental.status}
                    colorClass={STATUS_CONFIG[rental.status]?.colorClass || 'bg-gray-100 text-gray-600'}
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {format(new Date(rental.start_date), "dd/MM/yyyy", { locale: ptBR })} → {format(new Date(rental.end_date), "dd/MM/yyyy", { locale: ptBR })}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs md:text-sm text-muted-foreground">Valor Total</span>
                  <span className="text-sm md:text-base font-bold text-foreground">
                    {formatCurrency(rental.total_value)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(`/alugueis/${rental.id}`)}
                  className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary py-2 rounded-lg font-medium transition-colors text-xs md:text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalhes
                </button>
                {canCreate && (
                  <button
                    onClick={() => navigate(`/alugueis/editar/${rental.id}`)}
                    className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Editar Aluguel"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
                {canDownloadPDF && (
                  <button
                    onClick={() => generateRentalPDF({ rental }).catch(console.error)}
                    className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                    title="Baixar PDF"
                  >
                    <FileDown className="w-4 h-4 text-primary" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => handleDeleteClick(rental)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredRentals.length === 0 && (
        <Card className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground">Nenhum aluguel encontrado.</p>
        </Card>
      )}

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Novo Aluguel</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo aluguel. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Cliente *</Label>
              <Select
                value={formData.customerId}
                onValueChange={(value) => handleFormChange('customerId', value)}
              >
                <SelectTrigger className={formErrors.customerId ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Selecione o cliente" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  {clientsList.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.customerId && (
                <p className="text-xs text-destructive">{formErrors.customerId}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Produtos *</Label>
              <Select
                value=""
                onValueChange={(value) => handleAddProduct(value)}
              >
                <SelectTrigger className={formErrors.products ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Adicionar produto" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border shadow-lg z-50">
                  {productsList
                    .filter(p => !selectedProducts.some(sp => sp.productId === p.id))
                    .map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - {formatCurrency(product.daily_rental_price)}/dia
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {formErrors.products && (
                <p className="text-xs text-destructive">{formErrors.products}</p>
              )}

              {/* Selected Products List */}
              {selectedProducts.length > 0 && (
                <div className="space-y-2 mt-2">
                  {selectedProducts.map((sp) => {
                    const product = productsList.find(p => p.id === sp.productId);
                    if (!product) return null;
                    return (
                      <div key={sp.productId} className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{formatCurrency(product.daily_rental_price)}/dia</p>
                        </div>
                        <Input
                          type="number"
                          min="1"
                          value={sp.quantity}
                          onChange={(e) => handleProductQuantityChange(sp.productId, parseInt(e.target.value) || 1)}
                          className="w-20 h-8"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveProduct(sp.productId)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Data Início *</Label>
                <DatePicker
                  date={formData.startDate ? parseISO(formData.startDate) : undefined}
                  setDate={(date) => {
                    const newStartDate = date ? format(date, 'yyyy-MM-dd') : '';
                    let updates: any = { startDate: newStartDate };

                    // If we have both dates, update duration
                    if (newStartDate && formData.endDate) {
                      const start = new Date(newStartDate);
                      const end = new Date(formData.endDate);
                      const diff = differenceInDays(end, start) + 1;
                      updates.duration = diff > 0 ? diff.toString() : '1';
                    } else if (newStartDate && formData.duration) {
                      // Recalculate End Date based on duration
                      const start = new Date(newStartDate);
                      const days = parseInt(formData.duration) || 1;
                      const newEndDate = new Date(start);
                      newEndDate.setDate(start.getDate() + (days - 1));
                      updates.endDate = format(newEndDate, 'yyyy-MM-dd');
                    }

                    setFormData(prev => ({ ...prev, ...updates }));
                    if (formErrors.startDate) setFormErrors(prev => ({ ...prev, startDate: undefined }));
                  }}
                  className={formErrors.startDate ? 'border-destructive w-full' : 'w-full'}
                  placeholder="Início"
                />
                {formErrors.startDate && (
                  <p className="text-xs text-destructive">{formErrors.startDate}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="duration">Duração (Dias)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formData.duration || ''}
                  onChange={(e) => {
                    const days = parseInt(e.target.value) || 0;
                    let updates: any = { duration: e.target.value };

                    if (days > 0 && formData.startDate) {
                      const start = parseISO(formData.startDate);
                      const newEndDate = new Date(start);
                      newEndDate.setDate(start.getDate() + (days - 1));
                      updates.endDate = format(newEndDate, 'yyyy-MM-dd');
                    }

                    setFormData(prev => ({ ...prev, ...updates }));
                  }}
                  placeholder="Dias"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="endDate">Data Fim *</Label>
                <DatePicker
                  date={formData.endDate ? parseISO(formData.endDate) : undefined}
                  setDate={(date) => {
                    const newEndDate = date ? format(date, 'yyyy-MM-dd') : '';
                    let updates: any = { endDate: newEndDate };

                    if (formData.startDate && newEndDate) {
                      const start = new Date(formData.startDate);
                      const end = new Date(newEndDate);
                      const diff = differenceInDays(end, start) + 1;
                      updates.duration = diff > 0 ? diff.toString() : '';
                    }

                    setFormData(prev => ({ ...prev, ...updates }));
                    if (formErrors.endDate) setFormErrors(prev => ({ ...prev, endDate: undefined }));
                  }}
                  className={formErrors.endDate ? 'border-destructive w-full' : 'w-full'}
                  placeholder="Fim"
                />
                {formErrors.endDate && (
                  <p className="text-xs text-destructive">{formErrors.endDate}</p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Observações sobre o aluguel"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Forma de Pagamento</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => handleFormChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-background border border-border shadow-lg z-50">
                    <SelectItem value="PIX">PIX</SelectItem>
                    <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                    <SelectItem value="CARTAO">Cartão</SelectItem>
                    <SelectItem value="BOLETO">Boleto</SelectItem>
                    <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="deliveryFee">Frete (R$)</Label>
                <Input
                  id="deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.deliveryFee}
                  onChange={(e) => handleFormChange('deliveryFee', e.target.value)}
                  placeholder="0,00"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount">Desconto (R$)</Label>
              <Input
                id="discount"
                type="number"
                min="0"
                step="0.01"
                value={formData.discount}
                onChange={(e) => handleFormChange('discount', e.target.value)}
                placeholder="0,00"
              />
            </div>

            {/* Summary */}
            {selectedProducts.length > 0 && formData.startDate && formData.endDate && (
              <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                <h4 className="font-medium text-sm text-foreground">Resumo do Aluguel</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Período Total</span>
                  <span>{calculatedTotals.days} dias corridos</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Dias Cobrados (Seg-Sex)</span>
                  <span className="font-medium text-primary">{calculatedTotals.chargedDays} dias (Finais de semana grátis)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Diária total</span>
                  <span>{formatCurrency(calculatedTotals.dailyRate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(calculatedTotals.subtotal)}</span>
                </div>
                {parseFloat(formData.deliveryFee) > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span>+{formatCurrency(parseFloat(formData.deliveryFee))}</span>
                  </div>
                )}
                {parseFloat(formData.discount) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600">
                    <span>Desconto</span>
                    <span>-{formatCurrency(parseFloat(formData.discount))}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(calculatedTotals.total)}</span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setSelectedProducts([]);
              setFormData(initialFormState);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleAddRental} disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Criando...' : 'Criar Aluguel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este aluguel?
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

export default Rentals;
