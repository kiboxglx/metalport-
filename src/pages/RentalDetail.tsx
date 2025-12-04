import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, Calendar, User, FileText, Package, ChevronRight, Clock, DollarSign, CreditCard, AlertTriangle, MapPin, Phone, Trash2, X } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { StatusBadge } from '@/components/common/StatusBadge';
import { Button } from '@/components/ui/button';
import { rentalsService } from '@/services/rentalsService';
import { RentalWithItems } from '@/types/database';
import { format, differenceInDays, parseISO, isAfter, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNotifications } from '@/contexts/NotificationsContext';
import { AddToCalendarButton } from 'add-to-calendar-button-react';
import { DatePicker } from '@/components/ui/date-picker';
import { generateContractPDF, generateReceiptPDF } from '@/utils/pdfGenerator';

import { useProducts } from '@/contexts/ProductsContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; order: number }> = {
  pending: { label: 'Pagamento Pendente', colorClass: 'bg-yellow-100 text-yellow-800', order: 0 },
  awaiting_payment: { label: 'Aguardando Pagamento', colorClass: 'bg-orange-100 text-orange-800', order: 1 },
  confirmed: { label: 'Aprovado', colorClass: 'bg-green-100 text-green-800', order: 2 },
  ongoing: { label: 'Em Andamento', colorClass: 'bg-emerald-100 text-emerald-800', order: 3 },
  collecting: { label: 'Recolher Material', colorClass: 'bg-purple-100 text-purple-800', order: 4 },
  finished: { label: 'Contrato Expirado', colorClass: 'bg-gray-100 text-gray-600', order: 5 },
  cancelled: { label: 'Cancelado', colorClass: 'bg-red-100 text-red-800', order: 6 },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  PIX: 'PIX',
  DINHEIRO: 'Dinheiro',
  CARTAO: 'Cartão',
  BOLETO: 'Boleto',
  TRANSFERENCIA: 'Transferência',
};

const STATUS_FLOW = ['pending', 'awaiting_payment', 'confirmed', 'ongoing', 'collecting', 'finished'];

const RentalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<RentalWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [installationDate, setInstallationDate] = useState('');
  const [installationTime, setInstallationTime] = useState('');

  const { productsList } = useProducts();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState(1);
  const [isAddingItem, setIsAddingItem] = useState(false);

  const { addNotification } = useNotifications();

  const handleAddItem = async () => {
    if (!rental || !selectedProductId) return;

    const product = productsList.find(p => p.id === selectedProductId);
    if (!product) return;

    try {
      setIsAddingItem(true);
      await rentalsService.addRentalProductItem({
        rental_id: rental.id,
        product_id: selectedProductId,
        quantity: newItemQuantity,
        unit_price: product.daily_rental_price
      });

      toast.success('Item adicionado com sucesso');
      setSelectedProductId('');
      setNewItemQuantity(1);
      await loadRental(rental.id);
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Erro ao adicionar item');
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    if (!rental) return;
    if (!confirm('Tem certeza que deseja remover este item?')) return;

    try {
      await rentalsService.removeRentalProductItem(itemId);
      toast.success('Item removido com sucesso');
      await loadRental(rental.id);
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Erro ao remover item');
    }
  };

  useEffect(() => {
    if (id) {
      loadRental(id);
    }
  }, [id]);

  const loadRental = async (rentalId: string) => {
    try {
      const data = await rentalsService.getRentalById(rentalId);
      setRental(data);
      if (data.installation_date) setInstallationDate(data.installation_date);
      if (data.installation_time) setInstallationTime(data.installation_time);
    } catch (error) {
      console.error('Error loading rental:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!rental || !id) return;

    try {
      setUpdatingStatus(true);
      await rentalsService.updateRentalStatus(id, newStatus as any);
      await loadRental(id);

      const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
      toast.success(`Status atualizado para ${statusLabel}`);

      addNotification(
        'Status Atualizado',
        `O aluguel de ${rental.customer?.name} foi atualizado para: ${statusLabel}`,
        'info'
      );

      // Force navigation for collecting status
      if (newStatus === 'collecting') {
        console.log('Navigating to finalization page...');
        navigate(`/alugueis/${id}/finalizacao`);
      }
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(`Erro ao atualizar status: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleUpdateInstallation = async () => {
    if (!rental || !id) return;
    try {
      // In a real app, we would update the rental with installation data here
      // For now, we'll just simulate it and close the modal
      // await rentalsService.updateRentalInstallation(id, { installation_date: installationDate, installation_time: installationTime });

      toast.success('Dados de instalação atualizados!');

      addNotification(
        'Instalação Agendada',
        `Instalação para ${rental.customer?.name} definida para ${format(parseISO(installationDate || rental.start_date), "dd/MM/yyyy")} às ${installationTime || '08:00'}`,
        'info'
      );

      setIsDeliveryModalOpen(false);
    } catch (error) {
      toast.error('Erro ao atualizar instalação');
    }
  };

  const getNextStatus = () => {
    if (!rental) return null;
    const currentIndex = STATUS_FLOW.indexOf(rental.status);
    if (currentIndex === -1 || currentIndex >= STATUS_FLOW.length - 1) return null;
    return STATUS_FLOW[currentIndex + 1];
  };

  // Calculate running days and values
  const calculateRentalMetrics = () => {
    if (!rental) return null;

    const today = startOfDay(new Date());
    const startDate = parseISO(rental.start_date);
    const endDate = parseISO(rental.end_date);

    const plannedDays = Math.max(1, differenceInDays(endDate, startDate) + 1);

    // Calculate actual days based on status
    let actualDays = plannedDays;
    let isOverdue = false;
    let extraDays = 0;

    if (['ongoing', 'collecting'].includes(rental.status)) {
      // If ongoing or collecting, count from start to today
      actualDays = Math.max(1, differenceInDays(today, startDate) + 1);
      if (isAfter(today, endDate)) {
        isOverdue = true;
        extraDays = differenceInDays(today, endDate);
      }
    } else if (rental.status === 'finished' || rental.status === 'cancelled') {
      // Keep planned days for finished/cancelled
      actualDays = plannedDays;
    }

    const dailyRate = Number(rental.daily_rate) || 0;
    const discount = Number(rental.discount) || 0;
    const baseValue = dailyRate * plannedDays;
    const extraValue = dailyRate * extraDays;
    const currentTotal = (dailyRate * actualDays) - discount;

    return {
      plannedDays,
      actualDays,
      extraDays,
      isOverdue,
      dailyRate,
      discount,
      baseValue,
      extraValue,
      currentTotal: Math.max(0, currentTotal),
      originalTotal: rental.total_value,
    };
  };

  const metrics = calculateRentalMetrics();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Aluguel não encontrado.</p>
        <Button onClick={() => navigate('/alugueis')}>Voltar para Aluguéis</Button>
      </div>
    );
  }

  const nextStatus = getNextStatus();

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      {/* Header - Hidden on print */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate('/alugueis')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-foreground">Proposta de Locação de Equipamentos</h1>
        </div>
        <div className="flex gap-2 items-center">
          <div className="z-10">
            <AddToCalendarButton
              name={`Aluguel: ${rental.customer?.name}`}
              description={`Aluguel de equipamentos. Valor Total: ${formatCurrency(rental.total_value)}`}
              startDate={rental.start_date}
              endDate={rental.end_date}
              startTime="08:00"
              endTime="18:00"
              timeZone="America/Sao_Paulo"
              location={rental.customer?.address || 'Endereço do Cliente'}
              options={['Google', 'Outlook.com', 'Apple', 'Yahoo', 'iCal']}
              buttonStyle="round"
              label="Add Calendar"
              size="2"
              lightMode="bodyScheme"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setIsDeliveryModalOpen(true)}
            className="gap-2 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
          >
            <MapPin className="h-4 w-4" />
            Dados da Entrega
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              const toastId = toast.loading('Gerando contrato PDF...');
              try {
                await generateContractPDF(rental, [...(rental.rental_items || []), ...(rental.rental_product_items || [])]);
                toast.dismiss(toastId);
                toast.success('Contrato gerado com sucesso!');
              } catch (error: any) {
                toast.dismiss(toastId);
                console.error('Erro ao gerar PDF:', error);
                toast.error(`Erro ao gerar PDF: ${error.message}`);
              }
            }}
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
          >
            <FileText className="h-4 w-4" />
            Gerar Contrato PDF
          </Button>

          <Button
            variant="outline"
            onClick={async () => {
              const toastId = toast.loading('Gerando recibo PDF...');
              try {
                const paymentMethod = rental.payment_method || 'Dinheiro';
                await generateReceiptPDF(rental, rental.total_value, paymentMethod);
                toast.dismiss(toastId);
                toast.success('Recibo gerado com sucesso!');
              } catch (error) {
                toast.dismiss(toastId);
                console.error('Erro ao gerar recibo:', error);
                toast.error('Erro ao gerar recibo PDF');
              }
            }}
            className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
          >
            <FileText className="h-4 w-4" />
            Gerar Recibo PDF
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6">

        {/* Client Info Card */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="font-bold text-gray-400 min-w-[60px]">Nome:</span>
                <span className="text-white">{rental.customer?.name}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-gray-400 min-w-[60px]">Endereço:</span>
                <span className="text-white">{rental.customer?.address || 'Não informado'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-gray-400 min-w-[60px]">CPF:</span>
                <span className="text-white">{rental.customer?.cpf || rental.customer?.document || 'Não informado'}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <span className="font-bold text-gray-400 min-w-[60px]">Fone:</span>
                <span className="text-white">{rental.customer?.phone || 'Não informado'}</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="font-bold text-gray-400 min-w-[60px]">RG:</span>
                <span className="text-white">{rental.customer?.rg || 'Não informado'}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Rental Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <p className="text-xs font-bold text-gray-500 uppercase mb-1">QUANTIDADE DE DIÁRIAS</p>
            <p className="text-3xl font-normal text-white">{metrics?.plannedDays} Diárias</p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-500 uppercase">DATA INICIAL</p>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-normal text-white">
              {format(parseISO(rental.start_date), "dd/MM/yyyy")}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Instalação: {installationDate ? format(parseISO(installationDate), "dd/MM/yyyy") : format(parseISO(rental.start_date), "dd/MM/yyyy")}
            </p>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-500 uppercase">DATA FINAL</p>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-2xl font-normal text-white">
              {format(parseISO(rental.end_date), "dd/MM/yyyy")}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Desinstalação: {format(parseISO(rental.end_date), "dd/MM/yyyy")}
            </p>
          </Card>
          <Card className="p-4 md:col-span-3 lg:col-span-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-bold text-gray-500 uppercase">VALOR TOTAL</p>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-3xl font-normal text-white">
              {formatCurrency(metrics?.currentTotal || rental.total_value)}
            </p>
          </Card>
        </div>

        {/* Items List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="font-semibold text-gray-700">Lista de Itens</h3>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Package className="h-4 w-4 text-gray-400" />
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Item</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Quant.</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Diárias</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Vlr Diária</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Valor Total</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">

                    {/* Legacy Items (Tents) */}
                    {rental.rental_items?.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-black">{item.tent?.name || 'Tenda'}</p>
                          <p className="text-xs text-gray-500">Item legado</p>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-black font-medium">{item.quantity}</td>
                        <td className="px-4 py-4 text-center text-sm text-black font-medium">{metrics?.plannedDays}</td>
                        <td className="px-4 py-4 text-right text-sm text-black font-medium">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-4 text-right text-sm text-black font-bold">{formatCurrency(item.quantity * item.unit_price * (metrics?.plannedDays || 1))}</td>
                        <td className="px-4 py-4 text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}

                    {/* Products */}
                    {rental.rental_product_items?.map((item) => (
                      <tr key={item.id} className="bg-white">
                        <td className="px-4 py-4">
                          <p className="text-sm font-bold text-black">{item.product?.name}</p>
                        </td>
                        <td className="px-4 py-4 text-center text-sm text-black font-medium">{item.quantity}</td>
                        <td className="px-4 py-4 text-center text-sm text-black font-medium">{metrics?.plannedDays}</td>
                        <td className="px-4 py-4 text-right text-sm text-black font-medium">{formatCurrency(item.unit_price)}</td>
                        <td className="px-4 py-4 text-right text-sm text-black font-bold">{formatCurrency(item.quantity * item.unit_price * (metrics?.plannedDays || 1))}</td>
                        <td className="px-4 py-4 text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {/* Empty State */}
                    {(!rental.rental_items?.length && !rental.rental_product_items?.length) && (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                          Nenhum item registrado nesta locação.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-4">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="flex-1 w-full">
                  <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecionar Item" />
                    </SelectTrigger>
                    <SelectContent>
                      {productsList.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name} ({formatCurrency(product.daily_rental_price)}/dia)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none border-r"
                      onClick={() => setNewItemQuantity(Math.max(1, newItemQuantity - 1))}
                    >
                      -
                    </Button>
                    <div className="w-12 text-center font-medium">{newItemQuantity}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-none border-l"
                      onClick={() => setNewItemQuantity(newItemQuantity + 1)}
                    >
                      +
                    </Button>
                  </div>

                  <Button
                    className="flex-1 md:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleAddItem}
                    disabled={isAddingItem || !selectedProductId}
                  >
                    {isAddingItem ? '...' : 'Adicionar'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column / Actions */}
          <div className="space-y-4">
            {/* Status Control */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-700 mb-3">Status do Aluguel</h3>
              <StatusBadge
                label={STATUS_CONFIG[rental.status]?.label || rental.status}
                colorClass={STATUS_CONFIG[rental.status]?.colorClass || 'bg-gray-100 text-gray-600'}
                className="w-full justify-center py-2 text-base mb-4"
              />

              {/* Payment Button - Show when status is pending */}
              {rental.status === 'pending' && (
                <Button
                  onClick={() => navigate(`/alugueis/${rental.id}/pagamento`)}
                  className="w-full gap-2 mb-2 bg-green-600 hover:bg-green-700"
                >
                  Processar Pagamento
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Finalization Button - Show when status is collecting */}
              {rental.status === 'collecting' && (
                <Button
                  onClick={() => navigate(`/alugueis/${rental.id}/finalizacao`)}
                  className="w-full gap-2 mb-2 bg-purple-600 hover:bg-purple-700"
                >
                  Finalizar Contrato
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Confirmed -> Ongoing */}
              {rental.status === 'confirmed' && (
                <Button
                  onClick={() => handleStatusChange('ongoing')}
                  disabled={updatingStatus}
                  className="w-full gap-2 mb-2 bg-blue-600 hover:bg-blue-700"
                >
                  Confirmar Entrega / Iniciar
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Ongoing -> Collecting */}
              {rental.status === 'ongoing' && (
                <Button
                  onClick={() => handleStatusChange('collecting')}
                  disabled={updatingStatus}
                  className="w-full gap-2 mb-2 bg-orange-600 hover:bg-orange-700"
                >
                  Iniciar Recolhimento
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* Regular status advance button (Fallback for other statuses) */}
              {nextStatus && rental.status !== 'cancelled' && rental.status !== 'pending' && rental.status !== 'collecting' && rental.status !== 'confirmed' && rental.status !== 'ongoing' && (
                <Button
                  onClick={() => handleStatusChange(nextStatus)}
                  disabled={updatingStatus}
                  className="w-full gap-2"
                >
                  Avançar para {STATUS_CONFIG[nextStatus]?.label}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Delivery Modal */}
      <Dialog open={isDeliveryModalOpen} onOpenChange={setIsDeliveryModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-700">Dados da Entrega</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-6">
            {/* Client Header */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <p className="text-sm text-gray-500 mb-1">Cliente:</p>
              <h3 className="text-xl font-bold text-gray-800 mb-3">{rental.customer?.name}</h3>
              <div className="flex gap-2">
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white gap-2 rounded-full">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Button>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white gap-2 rounded-full">
                  <Phone className="h-4 w-4" />
                  Ligar
                </Button>
              </div>
            </div>

            {/* Installation Details */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-cyan-500 p-1.5 rounded-md">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-cyan-500">Instalação</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label>Data Instalação:</Label>
                  <DatePicker
                    date={installationDate ? parseISO(installationDate) : (rental.start_date ? parseISO(rental.start_date) : undefined)}
                    setDate={(date) => setInstallationDate(date ? format(date, 'yyyy-MM-dd') : '')}
                    className="text-lg font-bold text-gray-700 w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Hora Instalação:</Label>
                  <Input
                    type="time"
                    value={installationTime || '08:00'}
                    onChange={(e) => setInstallationTime(e.target.value)}
                    className="text-lg font-bold text-gray-700"
                  />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <Label>Endereço:</Label>
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-lg font-bold text-gray-800">{rental.customer?.address || 'Endereço não cadastrado'}</p>
                  <p className="text-sm text-gray-600">Porteirinha - Minas Gerais</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="font-bold text-sm">Itens</span>
                  <span className="font-bold text-sm">Qtd</span>
                </div>

                {rental.rental_product_items?.map(item => (
                  <div key={item.id} className="flex justify-between items-center py-2">
                    <span className="text-gray-600">{item.product?.name}</span>
                    <span className="text-gray-800 font-medium">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsDeliveryModalOpen(false)} className="bg-gray-400 hover:bg-gray-500 text-white border-none">
              Cancelar
            </Button>
            <Button onClick={handleUpdateInstallation} className="bg-red-500 hover:bg-red-600 text-white">
              Confirmar Instalação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div >
  );
};

export default RentalDetail;
