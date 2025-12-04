import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, DollarSign, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { rentalsService } from '@/services/rentalsService';
import { paymentsService, PaymentInsert } from '@/services/paymentsService';
import { RentalWithItems } from '@/types/database';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useNotifications } from '@/contexts/NotificationsContext';

const PAYMENT_METHODS = [
    { value: 'PIX', label: 'PIX', icon: '💳' },
    { value: 'DINHEIRO', label: 'Dinheiro', icon: '💵' },
    { value: 'CARTAO', label: 'Cartão', icon: '💳' },
    { value: 'BOLETO', label: 'Boleto', icon: '📄' },
    { value: 'TRANSFERENCIA', label: 'Transferência', icon: '🏦' },
];

const RentalPayment: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [rental, setRental] = useState<RentalWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [paymentMethod, setPaymentMethod] = useState('PIX');
    const [paymentDate, setPaymentDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [paymentNotes, setPaymentNotes] = useState('');
    const [installments, setInstallments] = useState(1);

    const { addNotification } = useNotifications();

    useEffect(() => {
        if (id) {
            loadRental(id);
        }
    }, [id]);

    const loadRental = async (rentalId: string) => {
        try {
            const data = await rentalsService.getRentalById(rentalId);
            setRental(data);
            if (data.payment_method) {
                setPaymentMethod(data.payment_method);
            }
        } catch (error) {
            console.error('Error loading rental:', error);
            toast.error('Erro ao carregar aluguel');
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

    const handleConfirmPayment = async () => {
        if (!rental || !id) return;

        try {
            setProcessing(true);

            // Create payment record
            const paymentData: PaymentInsert = {
                rental_id: id,
                due_date: rental.start_date,
                paid_date: paymentDate,
                amount: rental.total_value,
                method: paymentMethod,
                status: 'PAGO',
                notes: paymentNotes || null,
            };

            await paymentsService.createPayment(paymentData);

            // Update rental status to confirmed
            await rentalsService.updateRentalStatus(id, 'confirmed');

            toast.success('Pagamento confirmado com sucesso!');

            addNotification(
                'Pagamento Confirmado',
                `Pagamento de ${formatCurrency(rental.total_value)} confirmado para ${rental.customer?.name}`,
                'success'
            );

            // Navigate back to rental detail
            navigate(`/alugueis/${id}`);
        } catch (error) {
            console.error('Error confirming payment:', error);
            toast.error('Erro ao confirmar pagamento');
        } finally {
            setProcessing(false);
        }
    };

    const handleSkipPayment = async () => {
        if (!rental || !id) return;

        try {
            setProcessing(true);

            // Just update status to awaiting_payment
            await rentalsService.updateRentalStatus(id, 'awaiting_payment');

            toast.info('Aluguel marcado como aguardando pagamento');

            addNotification(
                'Aguardando Pagamento',
                `Aluguel de ${rental.customer?.name} aguardando confirmação de pagamento`,
                'info'
            );

            navigate(`/alugueis/${id}`);
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Erro ao atualizar status');
        } finally {
            setProcessing(false);
        }
    };

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

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-24 md:pb-0">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => navigate(`/alugueis/${id}`)}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Confirmar Pagamento</h1>
                    <p className="text-muted-foreground">Registre o pagamento do aluguel</p>
                </div>
            </div>

            {/* Customer Info */}
            <Card className="p-6">
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                        <h2 className="text-2xl font-bold text-foreground">{rental.customer?.name}</h2>
                        <p className="text-sm text-muted-foreground mt-2">
                            {rental.customer?.phone && `📞 ${rental.customer.phone}`}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Período</p>
                        <p className="text-lg font-semibold">
                            {format(parseISO(rental.start_date), 'dd/MM/yyyy', { locale: ptBR })} - {format(parseISO(rental.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Payment Amount */}
            <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                <div className="text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-primary" />
                    <p className="text-sm text-muted-foreground mb-2">Valor Total</p>
                    <p className="text-5xl font-bold text-foreground mb-4">{formatCurrency(rental.total_value)}</p>

                    {rental.discount && rental.discount > 0 && (
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm">
                            <CheckCircle className="h-4 w-4" />
                            Desconto de {formatCurrency(rental.discount)} aplicado
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment Details */}
            <Card className="p-6">
                <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Detalhes do Pagamento
                </h3>

                <div className="space-y-6">
                    {/* Payment Method */}
                    <div className="grid gap-2">
                        <Label htmlFor="paymentMethod">Forma de Pagamento *</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a forma de pagamento" />
                            </SelectTrigger>
                            <SelectContent className="bg-background border border-border shadow-lg z-50">
                                {PAYMENT_METHODS.map((method) => (
                                    <SelectItem key={method.value} value={method.value}>
                                        <span className="flex items-center gap-2">
                                            <span>{method.icon}</span>
                                            <span>{method.label}</span>
                                        </span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Date */}
                    <div className="grid gap-2">
                        <Label htmlFor="paymentDate">Data do Pagamento *</Label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                id="paymentDate"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Payment Notes */}
                    <div className="grid gap-2">
                        <Label htmlFor="paymentNotes">Observações</Label>
                        <Input
                            id="paymentNotes"
                            value={paymentNotes}
                            onChange={(e) => setPaymentNotes(e.target.value)}
                            placeholder="Informações adicionais sobre o pagamento"
                        />
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                        <h4 className="font-semibold text-sm text-foreground mb-3">Resumo do Pagamento</h4>

                        {rental.daily_rate && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Valor da Diária</span>
                                <span className="font-medium">{formatCurrency(rental.daily_rate)}</span>
                            </div>
                        )}

                        {rental.delivery_fee && rental.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Taxa de Entrega</span>
                                <span className="font-medium">+{formatCurrency(rental.delivery_fee)}</span>
                            </div>
                        )}

                        {rental.discount && rental.discount > 0 && (
                            <div className="flex justify-between text-sm text-green-600">
                                <span>Desconto</span>
                                <span className="font-medium">-{formatCurrency(rental.discount)}</span>
                            </div>
                        )}

                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between">
                                <span className="font-bold">Total</span>
                                <span className="font-bold text-lg text-primary">{formatCurrency(rental.total_value)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    variant="outline"
                    onClick={handleSkipPayment}
                    disabled={processing}
                    className="flex-1 gap-2"
                >
                    <AlertCircle className="h-4 w-4" />
                    Marcar como Aguardando Pagamento
                </Button>
                <Button
                    onClick={handleConfirmPayment}
                    disabled={processing}
                    className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
                >
                    <CheckCircle className="h-4 w-4" />
                    {processing ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
            </div>

            {/* Info Alert */}
            <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex gap-3">
                    <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-900">
                        <p className="font-semibold mb-1">Informação</p>
                        <p>
                            Ao confirmar o pagamento, o status do aluguel será atualizado para "Aprovado" e
                            o contrato estará pronto para iniciar. Se o pagamento ainda não foi recebido,
                            marque como "Aguardando Pagamento" para registrar a pendência.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RentalPayment;
