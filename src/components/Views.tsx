import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Package, 
  AlertCircle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Tent,
  MapPin,
  Users,
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Eye,
  Clock,
  ChevronDown,
  CreditCard,
  Banknote,
  Building2
} from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

// Helper function for status colors
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'confirmado':
    case 'concluído':
    case 'concluída':
    case 'pago':
      return 'bg-brand-green/10 text-brand-green';
    case 'em montagem':
    case 'em execução':
    case 'em andamento':
      return 'bg-emerald-100 text-emerald-700';
    case 'pendente':
    case 'rascunho':
    case 'em negociação':
      return 'bg-yellow-100 text-yellow-700';
    case 'atrasado':
    case 'cancelado':
      return 'bg-brand-red/10 text-brand-red';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

// Card component for KPIs
const KPICard: React.FC<{ 
  title: string; 
  value: string | number; 
  subtitle?: string; 
  icon: React.ReactNode;
  trend?: string;
}> = ({ title, value, subtitle, icon, trend }) => (
  <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-xs md:text-sm text-gray-500 font-medium">{title}</p>
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mt-1 md:mt-2">{value}</h3>
        {subtitle && <p className="text-xs md:text-sm text-gray-500 mt-1">{subtitle}</p>}
        {trend && (
          <p className="text-xs text-brand-green font-medium mt-2 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </p>
        )}
      </div>
      <div className="bg-brand-green/10 p-2 md:p-3 rounded-lg flex-shrink-0">
        {icon}
      </div>
    </div>
  </div>
);

// ========== CLIENTS VIEW ==========
export const ClientsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 md:h-5 md:w-5" />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 md:pl-10 pr-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-sm text-gray-800"
          />
        </div>
        <InteractiveHoverButton
          text="Novo cliente"
          className="w-full sm:w-auto bg-brand-green hover:bg-emerald-700 text-white px-6 py-2.5 shadow-md shadow-emerald-500/20 border-0"
        />
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Empresa</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Telefone</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-mail</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'João Silva', company: 'Metalúrgica ABC', phone: '(11) 99999-9999', email: 'joao@abc.com' },
                { name: 'Maria Santos', company: 'Empresa XYZ Ltda', phone: '(11) 98888-8888', email: 'maria@xyz.com' },
                { name: 'Pedro Costa', company: 'Fazenda São José', phone: '(11) 97777-7777', email: 'pedro@fazenda.com' },
              ].map((client, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 font-medium">{client.name}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{client.company}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">{client.phone}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{client.email}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 md:p-2 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-brand-red" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== EVENTS VIEW ==========
export const EventsView: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState('Todos');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-sm text-gray-700"
          >
            <option>Todos</option>
            <option>Confirmado</option>
            <option>Em montagem</option>
            <option>Pendente</option>
            <option>Cancelado</option>
          </select>
        </div>
        <InteractiveHoverButton
          text="Novo evento"
          className="w-full sm:w-auto bg-brand-green hover:bg-emerald-700 text-white px-6 py-2.5 shadow-md shadow-emerald-500/20 border-0"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {[
          { name: 'Feira Industrial Sul', client: 'Metalúrgica ABC', city: 'São Paulo', date: '15-17 Out 2024', status: 'Confirmado', items: 8 },
          { name: 'Evento Corporativo XYZ', client: 'Empresa XYZ', city: 'Rio de Janeiro', date: '18-19 Out 2024', status: 'Em montagem', items: 5 },
          { name: 'Exposição Agro 2024', client: 'Fazenda São José', city: 'Curitiba', date: '22-24 Out 2024', status: 'Pendente', items: 12 },
        ].map((event, idx) => (
          <div key={idx} className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3 md:mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-1 truncate">{event.name}</h3>
                <p className="text-xs md:text-sm text-gray-600">{event.client}</p>
              </div>
              <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(event.status)} flex-shrink-0`}>
                {event.status}
              </span>
            </div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                {event.city}
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {event.date}
              </div>
              <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                <Package className="w-4 h-4 flex-shrink-0" />
                {event.items} itens alugados
              </div>
            </div>
            <button className="w-full bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm">
              Ver detalhes
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ========== SCHEDULE VIEW ==========
export const ScheduleView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');

  return (
    <div className="space-y-4 md:space-y-6">
      {/* View Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div className="flex gap-2">
          <button 
            onClick={() => setViewMode('list')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm ${
              viewMode === 'list' 
                ? 'bg-brand-green text-white shadow-emerald-500/20' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Lista
          </button>
          <button 
            onClick={() => setViewMode('calendar')}
            className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all text-xs md:text-sm ${
              viewMode === 'calendar' 
                ? 'bg-brand-green text-white shadow-emerald-500/20' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Calendário
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {['Montagem', 'Evento', 'Desmontagem'].map((type) => (
            <span key={type} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
              {type}
            </span>
          ))}
        </div>
      </div>

      {/* Schedule List */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipe</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Horário</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: '15 Out', type: 'Montagem', event: 'Feira Industrial Sul', client: 'Metalúrgica ABC', team: 'Equipe A', time: '08:00' },
                { date: '17 Out', type: 'Evento', event: 'Feira Industrial Sul', client: 'Metalúrgica ABC', team: 'Equipe A', time: '10:00' },
                { date: '17 Out', type: 'Desmontagem', event: 'Feira Industrial Sul', client: 'Metalúrgica ABC', team: 'Equipe B', time: '18:00' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 font-medium whitespace-nowrap">{item.date}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      item.type === 'Montagem' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'Evento' ? 'bg-brand-green/10 text-brand-green' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{item.event}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{item.client}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{item.team}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== SERVICE ORDERS VIEW ==========
export const ServiceOrdersView: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <select className="px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-green/20 focus:border-brand-green transition-all outline-none text-sm text-gray-700">
          <option>Todas OS</option>
          <option>Em andamento</option>
          <option>Concluída</option>
          <option>Atrasada</option>
        </select>
        <InteractiveHoverButton
          text="Nova OS"
          className="w-full sm:w-auto bg-brand-green hover:bg-emerald-700 text-white px-6 py-2.5 shadow-md shadow-emerald-500/20 border-0"
        />
      </div>

      {/* Service Orders Table */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">OS ID</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data/Hora</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Equipe</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'OS-1234', datetime: '15 Out, 08:00', type: 'Montagem', event: 'Feira Industrial Sul', team: 'Equipe A', status: 'Em andamento' },
                { id: 'OS-1235', datetime: '17 Out, 18:00', type: 'Desmontagem', event: 'Feira Industrial Sul', team: 'Equipe B', status: 'Concluída' },
                { id: 'OS-1236', datetime: '18 Out, 10:00', type: 'Montagem', event: 'Evento Corporativo XYZ', team: 'Equipe A', status: 'Atrasada' },
              ].map((order) => (
                <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 font-medium">{order.id}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">{order.datetime}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{order.type}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{order.event}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{order.team}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button className="p-1.5 md:p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ========== FINANCE VIEW ==========
export const FinanceView: React.FC = () => {
  return (
    <div className="space-y-4 md:space-y-6">
      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <KPICard
          title="Receita Total"
          value="R$ 87.5K"
          subtitle="Outubro 2024"
          icon={<DollarSign className="w-5 h-5 md:w-6 md:h-6 text-brand-green" />}
          trend="+12.5%"
        />
        <KPICard
          title="A Receber"
          value="R$ 45.2K"
          subtitle="Pendente"
          icon={<AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />}
        />
        <KPICard
          title="Recebido"
          value="R$ 42.3K"
          subtitle="Este mês"
          icon={<CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-brand-green" />}
        />
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg md:rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-gray-100">
          <h3 className="text-base md:text-lg font-semibold text-gray-800">Pagamentos Recentes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Evento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimento</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Método</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 md:px-6 py-3 md:py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {[
                { event: 'Feira Industrial Sul', client: 'Metalúrgica ABC', value: 'R$ 15.000', due: '20 Out 2024', method: 'Pix', status: 'Pago' },
                { event: 'Evento Corporativo', client: 'Empresa XYZ', value: 'R$ 8.500', due: '25 Out 2024', method: 'Cartão', status: 'Pendente' },
                { event: 'Exposição Agro', client: 'Fazenda São José', value: 'R$ 22.000', due: '30 Out 2024', method: 'Boleto', status: 'Atrasado' },
              ].map((payment, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 font-medium">{payment.event}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700">{payment.client}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-900 font-semibold">{payment.value}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-xs md:text-sm text-gray-700 whitespace-nowrap">{payment.due}</td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs md:text-sm text-gray-700">
                      {payment.method === 'Pix' && <DollarSign className="w-3 h-3" />}
                      {payment.method === 'Cartão' && <CreditCard className="w-3 h-3" />}
                      {payment.method === 'Boleto' && <Banknote className="w-3 h-3" />}
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-3 md:py-4 text-right">
                    {payment.status !== 'Pago' && (
                      <button className="text-xs bg-brand-green hover:bg-emerald-700 text-white px-3 py-1.5 rounded transition-colors shadow-sm">
                        Marcar como pago
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
