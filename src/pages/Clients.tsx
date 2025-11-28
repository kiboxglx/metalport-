import React, { useState, useEffect } from 'react';
import { Search, Edit, Eye, Phone, Mail, Trash2, Plus, FileText, MapPin, User, Calendar } from 'lucide-react';
import { Customer, CustomerInsert, Rental } from '@/types/database';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/common/Card';
import { useClientes } from '@/contexts/ClientesContext';
import { rentalsService } from '@/services/rentalsService';
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
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface NewClientForm {
  name: string;
  phone: string;
  email: string;
  document: string;
  address: string;
  rg: string;
  notes: string;
}

const initialFormState: NewClientForm = {
  name: '',
  phone: '',
  email: '',
  document: '',
  address: '',
  rg: '',
  notes: '',
};

const Clients: React.FC = () => {
  const { toast } = useToast();
  const { clientsList, loading, addClient, deleteClient } = useClientes();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState<NewClientForm>(initialFormState);
  const [formErrors, setFormErrors] = useState<Partial<NewClientForm>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Customer | null>(null);

  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Customer | null>(null);
  const [clientRentals, setClientRentals] = useState<Rental[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(false);

  const filteredClients = clientsList.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      (client.document && client.document.includes(searchTerm)) ||
      (client.phone && client.phone.includes(searchTerm)) ||
      (client.email && client.email.toLowerCase().includes(searchLower))
    );
  });

  const validateForm = (): boolean => {
    const errors: Partial<NewClientForm> = {};

    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddClient = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const newClient: CustomerInsert = {
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        email: formData.email.trim() || null,
        document: formData.document.trim() || null,
        address: formData.address.trim() || null,
        rg: formData.rg.trim() || null,
        cpf: formData.document.trim() || null, // Mapping document to CPF for now as they are often same field
        notes: formData.notes.trim() || null,
      };

      await addClient(newClient);

      setIsAddDialogOpen(false);
      setFormData(initialFormState);
      setFormErrors({});

      toast({
        title: 'Cliente adicionado',
        description: `${newClient.name} foi adicionado com sucesso.`,
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao adicionar cliente.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (client: Customer) => {
    setClientToDelete(client);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient(clientToDelete.id);

      toast({
        title: 'Cliente excluído',
        description: `${clientToDelete.name} foi removido da lista.`,
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Falha ao excluir cliente.',
        variant: 'destructive',
      });
    }

    setDeleteDialogOpen(false);
    setClientToDelete(null);
  };

  const handleFormChange = (field: keyof NewClientForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleViewDetails = async (client: Customer) => {
    setSelectedClient(client);
    setDetailDialogOpen(true);
    setLoadingRentals(true);
    try {
      const rentals = await rentalsService.getRentalsByCustomerId(client.id);
      setClientRentals(rentals);
    } catch (error) {
      console.error('Error fetching client rentals:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de aluguéis.',
        variant: 'destructive',
      });
    } finally {
      setLoadingRentals(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes"
        actionLabel="+ Novo Cliente"
        onActionClick={() => setIsAddDialogOpen(true)}
      />

      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4 md:h-5 md:w-5" />
          <input
            type="text"
            placeholder="Buscar por nome, documento, telefone ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-base md:text-sm bg-background text-foreground"
          />
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-3 md:p-4">
          <p className="text-xs md:text-sm text-muted-foreground font-medium">Total de Clientes</p>
          <p className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            {loading ? '...' : clientsList.length}
          </p>
        </Card>
      </div>

      {loading ? (
        <Card className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground">Carregando clientes...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 truncate">{client.name}</h3>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}
                {client.email && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                {client.document && (
                  <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <span>{client.document}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(client)}
                  className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground py-2 rounded-lg font-medium transition-colors text-xs md:text-sm flex items-center justify-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  Ver Detalhes
                </button>
                <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                  <Edit className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDeleteClick(client)}
                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredClients.length === 0 && (
        <Card className="p-8 md:p-12 text-center">
          <p className="text-muted-foreground">Nenhum cliente encontrado.</p>
        </Card>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo cliente. Campos com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                placeholder="Nome completo"
                className={formErrors.name ? 'border-destructive' : ''}
              />
              {formErrors.name && (
                <p className="text-xs text-destructive">{formErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange('phone', e.target.value)}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="document">CPF</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => handleFormChange('document', e.target.value)}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="rg">RG</Label>
                <Input
                  id="rg"
                  value={formData.rg}
                  onChange={(e) => handleFormChange('rg', e.target.value)}
                  placeholder="00.000.000-0"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFormChange('address', e.target.value)}
                placeholder="Rua, Número, Bairro, Cidade - UF"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes">Observações</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFormChange('notes', e.target.value)}
                placeholder="Observações sobre o cliente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddClient} disabled={isSubmitting}>
              <Plus className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Adicionando...' : 'Adicionar Cliente'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
          </DialogHeader>

          {selectedClient && (
            <div className="space-y-6 py-4">
              {/* Client Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-secondary/20 p-4 rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-semibold">{selectedClient.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.phone || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.email || 'Não informado'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>CPF: {selectedClient.cpf || selectedClient.document || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>RG: {selectedClient.rg || 'Não informado'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedClient.address || 'Endereço não informado'}</span>
                  </div>
                </div>
              </div>

              {/* Rental History */}
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Histórico de Aluguéis
                </h3>

                {loadingRentals ? (
                  <div className="text-center py-4 text-muted-foreground">Carregando histórico...</div>
                ) : clientRentals.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border rounded-lg bg-muted/20">
                    Nenhum aluguel encontrado para este cliente.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {clientRentals.map(rental => (
                      <div
                        key={rental.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-colors"
                        onClick={() => {
                          setDetailDialogOpen(false);
                          navigate(`/alugueis/${rental.id}`);
                        }}
                      >
                        <div>
                          <p className="font-medium text-sm">
                            {format(parseISO(rental.start_date), 'dd/MM/yyyy')} - {format(parseISO(rental.end_date), 'dd/MM/yyyy')}
                          </p>
                          <p className={`text-xs mt-1 font-medium
                            ${rental.status === 'confirmed' ? 'text-green-600' :
                              rental.status === 'pending' ? 'text-yellow-600' :
                                rental.status === 'cancelled' ? 'text-red-600' : 'text-muted-foreground'}
                          `}>
                            Status: {rental.status === 'confirmed' ? 'Aprovado' :
                              rental.status === 'pending' ? 'Pagamento Pendente' :
                                rental.status === 'cancelled' ? 'Cancelado' : rental.status}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(rental.total_value)}
                          </p>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                            Ver Detalhes
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cliente <strong>{clientToDelete?.name}</strong>?
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

export default Clients;
