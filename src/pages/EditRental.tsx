import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Trash2, Package, ShoppingCart, Calendar, User, Save, ArrowLeft } from 'lucide-react';
import { Product } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { toast } from 'sonner';
import { differenceInDays, parseISO, format } from 'date-fns';
import { useClientes } from '@/contexts/ClientesContext';
import { useProducts } from '@/contexts/ProductsContext';
import { rentalsService } from '@/services/rentalsService';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';

interface ProductItemForm {
    productId: string;
    product: Product;
    quantity: number;
    dailyRate: number;
    totalDays: number;
    itemTotal: number;
}

const EditRental: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const { clientsList } = useClientes();
    const { productsList } = useProducts();

    const [loading, setLoading] = useState(true);
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
    const [deliveryFee, setDeliveryFee] = useState(0);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedClient = clientsList.find(c => c.id === selectedClientId);
    const selectedProduct = productsList.find(p => p.id === selectedProductId);

    useEffect(() => {
        const fetchRental = async () => {
            if (!id) return;
            try {
                const rental = await rentalsService.getRentalById(id);
                if (rental) {
                    setStartDate(rental.start_date.split('T')[0]);
                    setEndDate(rental.end_date.split('T')[0]);
                    setSelectedClientId(rental.customer_id);
                    setDiscount(rental.discount || 0);
                    setDeliveryFee(rental.delivery_fee || 0);
                    setNotes(rental.notes || '');
                    if (rental.installation_date) setInstallationDate(rental.installation_date);
                    if (rental.installation_time) setInstallationTime(rental.installation_time);

                    const days = Math.max(1, differenceInDays(parseISO(rental.end_date), parseISO(rental.start_date)));

                    const loadedProducts: ProductItemForm[] = rental.rental_product_items.map(item => {
                        const product = item.product!; // Assuming product data is joined
                        return {
                            productId: item.product_id,
                            product: product,
                            quantity: item.quantity,
                            dailyRate: item.unit_price, // Use stored price
                            totalDays: days,
                            itemTotal: item.unit_price * item.quantity * days
                        };
                    });
                    setProductItems(loadedProducts);

                } else {
                    toast.error('Aluguel não encontrado');
                    navigate('/alugueis');
                }
            } catch (error) {
                console.error('Error fetching rental:', error);
                toast.error('Erro ao carregar aluguel');
            } finally {
                setLoading(false);
            }
        };

        fetchRental();
    }, [id, navigate]);

    const calculateDays = (): number => {
        if (!startDate || !endDate) return 0;
        const days = differenceInDays(parseISO(endDate), parseISO(startDate));
        return Math.max(1, days);
    };

    const totalDays = calculateDays();

    // Recalculate totals when days change
    useEffect(() => {
        if (totalDays > 0) {
            setProductItems(prev => prev.map(item => ({
                ...item,
                totalDays,
                itemTotal: item.dailyRate * item.quantity * totalDays
            })));
        }
    }, [totalDays]);


    const productsSubtotal = productItems.reduce((sum, item) => sum + item.itemTotal, 0);
    const subtotal = productsSubtotal;
    const total = Math.max(0, subtotal - discount + deliveryFee);

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
            const updatedItems = [...productItems];
            updatedItems[existingItemIndex].quantity = totalQuantity;
            updatedItems[existingItemIndex].itemTotal = selectedProduct.daily_rental_price * totalQuantity * totalDays;
            setProductItems(updatedItems);
            toast.success('Quantidade atualizada');
        } else {
            const newItem: ProductItemForm = {
                productId: selectedProduct.id,
                product: selectedProduct,
                quantity: productQuantity,
                dailyRate: selectedProduct.daily_rental_price,
                totalDays,
                itemTotal,
            };
            setProductItems([...productItems, newItem]);
            toast.success('Produto adicionado');
        }
        setSelectedProductId('');
        setProductQuantity(1);
    };

    const handleRemoveProduct = (index: number) => {
        const updatedItems = productItems.filter((_, i) => i !== index);
        setProductItems(updatedItems);
    };

    const handleUpdateRental = async () => {
        if (!id) return;
        if (!selectedClient) {
            toast.error('Selecione um cliente');
            return;
        }
        if (!startDate || !endDate) {
            toast.error('Selecione o período da locação');
            return;
        }
        if (productItems.length === 0) {
            toast.error('Adicione pelo menos um item');
            return;
        }

        setIsSubmitting(true);

        try {
            // 1. Update Rental Details
            await rentalsService.updateRental(id, {
                customer_id: selectedClientId,
                start_date: startDate,
                end_date: endDate,
                total_value: total,
                notes: notes.trim() || null,
                discount: discount,
                delivery_fee: deliveryFee,
                installation_date: installationDate || null,
                installation_time: installationTime || null,
            });

            // 2. Update Items
            // Note: Item update logic is still limited as per original file comments, 
            // but we are preserving the structure for products.

            toast.success('Aluguel atualizado com sucesso!');
            navigate('/alugueis');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar aluguel');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Carregando...</div>;
    }

    return (
        <div className="space-y-4 md:space-y-6 pb-24 md:pb-0">
            <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" onClick={() => navigate('/alugueis')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar
                </Button>
                <h1 className="text-2xl font-bold">Editar Aluguel</h1>
            </div>

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
                                        setDate={(date) => setStartDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        className="w-full"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Data Final</label>
                                    <DatePicker
                                        date={endDate ? parseISO(endDate) : undefined}
                                        setDate={(date) => setEndDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-muted-foreground mb-1">Data Instalação</label>
                                    <DatePicker
                                        date={installationDate ? parseISO(installationDate) : undefined}
                                        setDate={(date) => setInstallationDate(date ? format(date, 'yyyy-MM-dd') : '')}
                                        className="w-full"
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

                    {/* Items Section - Simplified for Edit */}
                    <Card>
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                            <p className="text-sm text-yellow-800">
                                Nota: A edição de itens ainda não está totalmente suportada nesta versão.
                                As alterações salvas afetarão apenas os dados do aluguel (datas, cliente, valores, observações).
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Summary */}
                <div className="space-y-4 md:space-y-6">
                    <Card className="h-full flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                            <ShoppingCart className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-semibold text-foreground">Resumo</h2>
                        </div>

                        <div className="flex-1 space-y-4">
                            {/* Items List Display Only for now */}
                            <div className="space-y-2">
                                {productItems.map((item, index) => (
                                    <div key={`prod-${index}`} className="flex justify-between text-sm">
                                        <span>{item.quantity}x {item.product.name}</span>
                                        <span>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.itemTotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-border pt-4 space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-foreground">Frete (R$)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={deliveryFee}
                                        onChange={(e) => setDeliveryFee(Math.max(0, parseFloat(e.target.value) || 0))}
                                        className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
                                    />
                                </div>

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

                        <div className="mt-6 p-4 bg-secondary/20 rounded-lg space-y-2 border border-border/50">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="text-foreground">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                                <span className="text-foreground">Total</span>
                                <span className="text-primary">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}</span>
                            </div>

                            <button
                                onClick={handleUpdateRental}
                                disabled={isSubmitting}
                                className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground py-3 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default EditRental;
