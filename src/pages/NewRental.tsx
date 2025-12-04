import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, Trash2, Package, ShoppingCart, Calendar, User } from 'lucide-react';
import { Product } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { toast } from 'sonner';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useClientes } from '@/contexts/ClientesContext';
import { useProducts } from '@/contexts/ProductsContext';
import { useAlugueis } from '@/contexts/AlugueisContext';
import { useNotifications } from '@/contexts/NotificationsContext';
import { DatePicker } from '@/components/ui/date-picker';

interface ProductItemForm {
  productId: string;
  product: Product;
  quantity: number;
  dailyRate: number;
  totalDays: number;
  itemTotal: number;
}

const NewRental: React.FC = () => {
  const navigate = useNavigate();

  const { clientsList } = useClientes();
  const { productsList } = useProducts();
  const { addRental } = useAlugueis();
  const { addNotification } = useNotifications();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [installationDate, setInstallationDate] = useState('');
  const [installationTime, setInstallationTime] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');

  // Product State
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);
  const [productItems, setProductItems] = useState<ProductItemForm[]>([]);

  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClient = clientsList.find(c => c.id === selectedClientId);
  const selectedProduct = productsList.find(p => p.id === selectedProductId);

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const days = differenceInDays(parseISO(endDate), parseISO(startDate));
    return Math.max(1, days);
  };

  const totalDays = calculateDays();

  const productsSubtotal = productItems.reduce((sum, item) => sum + item.itemTotal, 0);
  const subtotal = productsSubtotal;
  const total = Math.max(0, subtotal - discount);

  const handleDateChange = (setter: (value: string) => void) => (date?: Date) => {
    if (date) {
      setter(format(date, 'yyyy-MM-dd'));
    } else {
      setter('');
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto para adicionar');
      return;
    }

    if (productQuantity < 1) {
      toast.error('Quantidade deve ser pelo menos 1');
      return;
    }

    if (totalDays === 0) {
      toast.error('Selecione o período da locação');
      return;
    }

    // Check existing quantity in cart
    const existingItemIndex = productItems.findIndex(item => item.productId === selectedProduct.id);
    const existingQuantity = existingItemIndex >= 0 ? productItems[existingItemIndex].quantity : 0;
    const totalQuantity = existingQuantity + productQuantity;

    if (totalQuantity > selectedProduct.total_stock) {
      toast.error(`Quantidade total (${totalQuantity}) excede o estoque disponível (${selectedProduct.total_stock})`);
      return;
    }

    const itemTotal = selectedProduct.daily_rental_price * productQuantity * totalDays;

    if (existingItemIndex >= 0) {
      // Merge items
      const updatedItems = [...productItems];
      updatedItems[existingItemIndex].quantity = totalQuantity;
      updatedItems[existingItemIndex].itemTotal = selectedProduct.daily_rental_price * totalQuantity * totalDays;
      setProductItems(updatedItems);
      toast.success('Quantidade atualizada no carrinho');
    } else {
      // Add new item
      const newItem: ProductItemForm = {
        productId: selectedProduct.id,
        product: selectedProduct,
        quantity: productQuantity,
        dailyRate: selectedProduct.daily_rental_price,
        totalDays,
        itemTotal,
      };
      setProductItems([...productItems, newItem]);
      toast.success('Produto adicionado à locação');
    }

    setSelectedProductId('');
    setProductQuantity(1);
  };

  const handleRemoveProduct = (index: number) => {
    const updatedItems = productItems.filter((_, i) => i !== index);
    setProductItems(updatedItems);
    toast.info('Produto removido');
  };

  const handleRegisterRental = async () => {
    if (!selectedClient) {
      toast.error('Selecione um cliente');
      return;
    }

    if (!startDate || !endDate) {
      toast.error('Selecione o período da locação');
      return;
    }

    if (productItems.length === 0) {
      toast.error('Adicione pelo menos um produto à locação');
      return;
    }

    setIsSubmitting(true);

    try {
      const rentalData = {
        customer_id: selectedClientId,
        start_date: startDate,
        end_date: endDate,
        status: 'pending' as const,
        total_value: total,
        notes: notes.trim() || null,
        installation_date: installationDate || null,
        installation_time: installationTime || null,
      };

      const productItemsData = productItems.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: item.dailyRate,
      }));

      await addRental(
        rentalData,
        selectedClient,
        productItemsData,
        productsList
      );

      addNotification(
        'Nova Locação Criada',
        `Locação para ${selectedClient.name} registrada com sucesso. Valor: ${formatCurrency(total)}`,
        'success'
      );

      toast.success('Locação registrada e contrato gerado com sucesso!');
      navigate('/alugueis');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao registrar locação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div className="space-y-4 md:space-y-6 pb-24 md:pb-0">
      <PageHeader
        title="Nova Locação"
        subtitle="Crie um novo contrato de aluguel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Left Column: Form */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Período e Cliente</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data Inicial</label>
                  <DatePicker
                    date={startDate ? parseISO(startDate) : undefined}
                    setDate={handleDateChange(setStartDate)}
                    placeholder="Início"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data Final</label>
                  <DatePicker
                    date={endDate ? parseISO(endDate) : undefined}
                    setDate={handleDateChange(setEndDate)}
                    placeholder="Fim"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Data Instalação</label>
                  <DatePicker
                    date={installationDate ? parseISO(installationDate) : undefined}
                    setDate={handleDateChange(setInstallationDate)}
                    placeholder="Instalação"
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Hora Instalação</label>
                  <input
                    type="time"
                    value={installationTime}
                    onChange={(e) => setInstallationTime(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
                  />
                </div>
              </div>
              {totalDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Duração: <span className="font-semibold text-primary">{totalDays}</span> dia{totalDays > 1 ? 's' : ''}
                </p>
              )}

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Cliente
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
                >
                  <option value="">-- Selecione --</option>
                  {clientsList.map(client => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Products Selection */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Adicionar Produtos</h2>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Produto</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
                >
                  <option value="">-- Selecione --</option>
                  {productsList.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} (Estoque: {product.total_stock})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Quantidade</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setProductQuantity(Math.max(1, productQuantity - 1))}
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Minus className="w-4 h-4 text-secondary-foreground" />
                  </button>
                  <input
                    type="number"
                    min="1"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm text-center font-semibold bg-background text-foreground"
                  />
                  <button
                    onClick={() => setProductQuantity(productQuantity + 1)}
                    className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4 text-secondary-foreground" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddProduct}
                className="w-full bg-primary/10 hover:bg-primary/20 text-primary py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 border border-primary/20"
              >
                <Plus className="w-4 h-4" />
                Adicionar Produto
              </button>
            </div>
          </Card>
        </div>

        {/* Right Column: Summary */}
        <div className="space-y-4 md:space-y-6">
          <Card className="h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">Resumo da Locação</h2>
            </div>

            <div className="flex-1 space-y-4">
              {productItems.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Carrinho vazio</p>
                  <p className="text-sm">Adicione itens para continuar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Products List */}
                  {productItems.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Produtos</h3>
                      {productItems.map((item, index) => (
                        <div key={`prod-${index}`} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border/50">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-primary/70" />
                              <p className="font-medium text-foreground text-sm truncate">{item.product.name}</p>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.quantity}x {formatCurrency(item.dailyRate)} × {item.totalDays} dias
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-2">
                            <span className="font-semibold text-foreground text-sm whitespace-nowrap">
                              {formatCurrency(item.itemTotal)}
                            </span>
                            <button
                              onClick={() => handleRemoveProduct(index)}
                              className="p-1.5 hover:bg-destructive/10 rounded-md transition-colors group"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-destructive transition-colors" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="border-t border-border pt-4 space-y-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Desconto (R$)</label>
                  <input
                    type="number"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Observações</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Observações sobre a locação..."
                    rows={3}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Desktop Footer (Hidden on Mobile) */}
            <div className="hidden md:block mt-6 p-4 bg-secondary/20 rounded-lg space-y-2 border border-border/50">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{formatCurrency(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-destructive">-{formatCurrency(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                <span className="text-foreground">Total</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>

              <button
                onClick={handleRegisterRental}
                disabled={isSubmitting || productItems.length === 0}
                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
              >
                {isSubmitting ? 'Registrando...' : 'Registrar Locação'}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Fixed Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Estimado</p>
            <p className="text-lg font-bold text-primary">{formatCurrency(total)}</p>
          </div>
          <button
            onClick={handleRegisterRental}
            disabled={isSubmitting || productItems.length === 0}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
          >
            {isSubmitting ? '...' : 'Registrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewRental;
