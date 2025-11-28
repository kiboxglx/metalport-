import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Package, AlertTriangle, User } from 'lucide-react';
import { checklistService, ChecklistItem } from '@/services/checklistService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RentalChecklistProps {
  rentalId: string;
  onComplete?: () => void;
}

const RentalChecklist: React.FC<RentalChecklistProps> = ({ rentalId, onComplete }) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectorName, setCollectorName] = useState('');
  const [itemNotes, setItemNotes] = useState<Record<string, string>>({});
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  useEffect(() => {
    loadChecklist();
  }, [rentalId]);

  const loadChecklist = async () => {
    try {
      setLoading(true);
      // Generate checklist if it doesn't exist
      const items = await checklistService.generateChecklistFromRental(rentalId);
      setChecklist(items);
      
      // Initialize quantities
      const quantities: Record<string, number> = {};
      items.forEach(item => {
        quantities[item.id] = item.collected ? item.quantity_collected : item.quantity_expected;
      });
      setItemQuantities(quantities);
    } catch (error) {
      console.error('Error loading checklist:', error);
      toast.error('Erro ao carregar checklist');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleItem = async (item: ChecklistItem) => {
    if (!collectorName.trim()) {
      toast.error('Informe o nome do responsável pela coleta');
      return;
    }

    try {
      const quantity = itemQuantities[item.id] || item.quantity_expected;
      
      if (item.collected) {
        // Unmark as collected
        await checklistService.updateChecklistItem(item.id, {
          collected: false,
          collected_at: undefined,
          collected_by: undefined,
          quantity_collected: 0
        });
      } else {
        // Mark as collected
        await checklistService.markAsCollected(item.id, collectorName, quantity);
        
        // Save notes if any
        if (itemNotes[item.id]) {
          await checklistService.updateChecklistItem(item.id, {
            notes: itemNotes[item.id]
          });
        }
      }
      
      await loadChecklist();
      toast.success(item.collected ? 'Item desmarcado' : 'Item coletado com sucesso');
    } catch (error) {
      console.error('Error updating checklist item:', error);
      toast.error('Erro ao atualizar item');
    }
  };

  const allCollected = checklist.length > 0 && checklist.every(item => item.collected);
  const collectedCount = checklist.filter(item => item.collected).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (checklist.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>Nenhum produto para recolher neste aluguel.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Checklist de Recolhimento
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {collectedCount} de {checklist.length} itens coletados
          </p>
        </div>
        
        {allCollected && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Coleta Completa</span>
          </div>
        )}
      </div>

      {/* Collector Name */}
      <div className="bg-muted/50 rounded-lg p-4">
        <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
          <User className="w-4 h-4" />
          Responsável pela Coleta
        </label>
        <Input
          value={collectorName}
          onChange={(e) => setCollectorName(e.target.value)}
          placeholder="Nome do responsável"
          className="max-w-xs"
        />
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${(collectedCount / checklist.length) * 100}%` }}
        />
      </div>

      {/* Checklist Items */}
      <div className="space-y-3">
        {checklist.map((item) => (
          <div 
            key={item.id} 
            className={`border rounded-lg p-4 transition-all ${
              item.collected 
                ? 'bg-emerald-50 border-emerald-200' 
                : 'bg-card border-border hover:border-primary/50'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={() => handleToggleItem(item)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  item.collected
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-muted-foreground hover:border-primary'
                }`}
              >
                {item.collected && <CheckCircle2 className="w-4 h-4" />}
              </button>

              {/* Item Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <h4 className={`font-medium ${item.collected ? 'text-emerald-700 line-through' : 'text-foreground'}`}>
                    {item.product?.name || 'Produto'}
                  </h4>
                  <span className={`text-sm px-2 py-0.5 rounded-full w-fit ${
                    item.collected 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-primary/10 text-primary'
                  }`}>
                    Qtd: {item.collected ? item.quantity_collected : item.quantity_expected}
                  </span>
                </div>
                
                {item.product?.description && (
                  <p className="text-sm text-muted-foreground mt-1">{item.product.description}</p>
                )}

                {/* Quantity Input (when not collected) */}
                {!item.collected && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs text-muted-foreground">Quantidade coletada:</label>
                      <Input
                        type="number"
                        min={0}
                        max={item.quantity_expected}
                        value={itemQuantities[item.id] || item.quantity_expected}
                        onChange={(e) => setItemQuantities({
                          ...itemQuantities,
                          [item.id]: parseInt(e.target.value) || 0
                        })}
                        className="w-20 h-8"
                      />
                    </div>
                    {(itemQuantities[item.id] || item.quantity_expected) < item.quantity_expected && (
                      <div className="flex items-center gap-1 text-amber-600 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        Quantidade inferior ao esperado
                      </div>
                    )}
                  </div>
                )}

                {/* Notes */}
                {!item.collected && (
                  <div className="mt-2">
                    <Textarea
                      placeholder="Observações (opcional)"
                      value={itemNotes[item.id] || ''}
                      onChange={(e) => setItemNotes({
                        ...itemNotes,
                        [item.id]: e.target.value
                      })}
                      className="text-sm h-16"
                    />
                  </div>
                )}

                {/* Collected Info */}
                {item.collected && (
                  <div className="mt-2 text-xs text-emerald-600 space-y-1">
                    <p>Coletado por: <span className="font-medium">{item.collected_by}</span></p>
                    {item.collected_at && (
                      <p>Em: {format(parseISO(item.collected_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
                    )}
                    {item.notes && (
                      <p className="text-muted-foreground">Obs: {item.notes}</p>
                    )}
                    {item.quantity_collected < item.quantity_expected && (
                      <p className="text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Coletado {item.quantity_collected} de {item.quantity_expected} unidades
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Complete Button */}
      {allCollected && onComplete && (
        <Button onClick={onComplete} className="w-full" size="lg">
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Finalizar Recolhimento
        </Button>
      )}
    </div>
  );
};

export default RentalChecklist;
