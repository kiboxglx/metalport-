import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, FileText, Calendar, DollarSign, Package, Star, MessageSquare } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/ui/button';
import { rentalsService } from '@/services/rentalsService';
import { RentalWithItems } from '@/types/database';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNotifications } from '@/contexts/NotificationsContext';
import RentalChecklist from '@/components/RentalChecklist';

const RentalFinalization: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [rental, setRental] = useState<RentalWithItems | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [checklistComplete, setChecklistComplete] = useState(false);

    const [returnDate, setReturnDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [returnNotes, setReturnNotes] = useState('');
    const [customerRating, setCustomerRating] = useState(5);
    const [equipmentCondition, setEquipmentCondition] = useState('BOM');

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

    const calculateFinalValues = () => {
        if (!rental) return null;

        const plannedDays = Math.max(1, differenceInDays(parseISO(rental.end_date), parseISO(rental.start_date)) + 1);
        const actualReturnDate = parseISO(returnDate);
        const endDate = parseISO(rental.end_date);

        const actualDays = Math.max(1, differenceInDays(actualReturnDate, parseISO(rental.start_date)) + 1);
        const extraDays = Math.max(0, differenceInDays(actualReturnDate, endDate));

        const dailyRate = Number(rental.daily_rate) || 0;
        const discount = Number(rental.discount) || 0;
        const deliveryFee = Number(rental.delivery_fee) || 0;

        const baseValue = dailyRate * plannedDays;
        const extraValue = dailyRate * extraDays;
        const totalValue = baseValue + extraValue - discount + deliveryFee;

        return {
            plannedDays,
            actualDays,
            extraDays,
            dailyRate,
            baseValue,
            extraValue,
            discount,
            deliveryFee,
            totalValue: Math.max(0, totalValue),
            originalTotal: rental.total_value,
        };
    };

    const handleChecklistComplete = () => {
        setChecklistComplete(true);
        toast.success('Checklist de recolhimento concluído!');
    };

    const handleFinalizeContract = async () => {
        if (!rental || !id) return;

        if (!checklistComplete) {
            toast.error('Complete o checklist de recolhimento antes de finalizar');
            return;
        }

        try {
            setProcessing(true);

            // Update rental status to finished and restore stock
            await rentalsService.finalizeRental(id);

            toast.success('Contrato finalizado com sucesso!');

            addNotification(
                'Contrato Finalizado',
                `Contrato de ${rental.customer?.name} foi finalizado`,
                'success'
            );

            // Navigate to rentals list
            navigate('/alugueis');
        } catch (error) {
            console.error('Error finalizing contract:', error);
            toast.error('Erro ao finalizar contrato');
        } finally {
            setProcessing(false);
        }
    };

    const values = calculateFinalValues();

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
        <div className="space-y-6 max-w-6xl mx-auto pb-24 md:pb-0">
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
                    <h1 className="text-3xl font-bold text-foreground">Finalização do Contrato</h1>
                    <p className="text-muted-foreground">Recolhimento de equipamentos e encerramento</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                                <h2 className="text-2xl font-bold text-foreground">{rental.customer?.name}</h2>
                                <p className="text-sm text-muted-foreground mt-2">
                                    {rental.customer?.phone && `📞 ${rental.customer.phone}`}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {rental.customer?.address && `📍 ${rental.customer.address}`}
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground mb-1">Período Contratado</p>
                                <p className="text-base font-semibold">
                                    {format(parseISO(rental.start_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                                <p className="text-base font-semibold">
                                    {format(parseISO(rental.end_date), 'dd/MM/yyyy', { locale: ptBR })}
                                </p>
                            </div>
                        </div>
                    </Card>

                    {/* Checklist */}
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            <Package className="h-5 w-5 text-primary" />
                            Checklist de Recolhimento
                        </h3>
                        <RentalChecklist
                            rentalId={rental.id}
                            onComplete={handleChecklistComplete}
                        />
                    </Card>

                    {/* Return Details */}
                    <Card className="p-6">
                        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary" />
                            Detalhes da Devolução
                        </h3>

                        <div className="space-y-6">
                            {/* Return Date */}
                            <div className="grid gap-2">
                                <Label htmlFor="returnDate">Data de Devolução *</Label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="returnDate"
                                        type="date"
                                        value={returnDate}
                                        onChange={(e) => setReturnDate(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            {/* Equipment Condition */}
                            <div className="grid gap-2">
                                <Label htmlFor="equipmentCondition">Estado dos Equipamentos</Label>
                                <select
                                    id="equipmentCondition"
                                    value={equipmentCondition}
                                    onChange={(e) => setEquipmentCondition(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none bg-background text-foreground"
                                >
                                    <option value="EXCELENTE">Excelente</option>
                                    <option value="BOM">Bom</option>
                                    <option value="REGULAR">Regular</option>
                                    <option value="DANIFICADO">Danificado</option>
                                </select>
                            </div>

                            {/* Customer Rating */}
                            <div className="grid gap-2">
                                <Label htmlFor="customerRating">Avaliação do Cliente</Label>
                                <div className="flex items-center gap-2">
                                    {[1, 2, 3, 4, 5].map((rating) => (
                                        <button
                                            key={rating}
                                            type="button"
                                            onClick={() => setCustomerRating(rating)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-8 w-8 ${rating <= customerRating
                                                    ? 'fill-yellow-400 text-yellow-400'
                                                    : 'text-gray-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                    <span className="ml-2 text-sm text-muted-foreground">
                                        {customerRating} de 5 estrelas
                                    </span>
                                </div>
                            </div>

                            {/* Return Notes */}
                            <div className="grid gap-2">
                                <Label htmlFor="returnNotes">Observações da Devolução</Label>
                                <Textarea
                                    id="returnNotes"
                                    value={returnNotes}
                                    onChange={(e) => setReturnNotes(e.target.value)}
                                    placeholder="Informações sobre o estado dos equipamentos, problemas encontrados, etc."
                                    rows={4}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column - Summary */}
                <div className="space-y-6">
                    {/* Financial Summary */}
                    <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-primary" />
                            Resumo Financeiro
                        </h3>

                        {values && (
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Diárias Planejadas</span>
                                    <span className="font-medium">{values.plannedDays} dias</span>
                                </div>

                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Diárias Efetivas</span>
                                    <span className="font-medium">{values.actualDays} dias</span>
                                </div>

                                {values.extraDays > 0 && (
                                    <div className="flex justify-between text-sm text-orange-600">
                                        <span>Diárias Extras</span>
                                        <span className="font-medium">+{values.extraDays} dias</span>
                                    </div>
                                )}

                                <div className="border-t pt-3 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Valor Base</span>
                                        <span className="font-medium">{formatCurrency(values.baseValue)}</span>
                                    </div>

                                    {values.extraDays > 0 && (
                                        <div className="flex justify-between text-sm text-orange-600">
                                            <span>Valor Extra</span>
                                            <span className="font-medium">+{formatCurrency(values.extraValue)}</span>
                                        </div>
                                    )}

                                    {values.deliveryFee > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Taxa de Entrega</span>
                                            <span className="font-medium">+{formatCurrency(values.deliveryFee)}</span>
                                        </div>
                                    )}

                                    {values.discount > 0 && (
                                        <div className="flex justify-between text-sm text-green-600">
                                            <span>Desconto</span>
                                            <span className="font-medium">-{formatCurrency(values.discount)}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-base">Total Final</span>
                                        <span className="font-bold text-2xl text-primary">
                                            {formatCurrency(values.totalValue)}
                                        </span>
                                    </div>
                                </div>

                                {values.totalValue !== values.originalTotal && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
                                        <p className="text-yellow-800">
                                            <strong>Atenção:</strong> O valor final difere do valor original
                                            ({formatCurrency(values.originalTotal)}) devido a diárias extras.
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>

                    {/* Status Card */}
                    <Card className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Status da Finalização</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${checklistComplete ? 'bg-green-100' : 'bg-gray-100'
                                    }`}>
                                    <CheckCircle className={`h-5 w-5 ${checklistComplete ? 'text-green-600' : 'text-gray-400'
                                        }`} />
                                </div>
                                <div>
                                    <p className="font-medium text-sm">Checklist Completo</p>
                                    <p className="text-xs text-muted-foreground">
                                        {checklistComplete ? 'Todos os itens verificados' : 'Pendente'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Action Button */}
                    <Button
                        onClick={handleFinalizeContract}
                        disabled={processing || !checklistComplete}
                        className="w-full gap-2 bg-green-600 hover:bg-green-700 h-12 text-base"
                    >
                        <CheckCircle className="h-5 w-5" />
                        {processing ? 'Finalizando...' : 'Finalizar Contrato'}
                    </Button>

                    {!checklistComplete && (
                        <p className="text-xs text-center text-muted-foreground">
                            Complete o checklist para finalizar o contrato
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RentalFinalization;
