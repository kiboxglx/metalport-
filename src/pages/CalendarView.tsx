import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Eye } from 'lucide-react';
import { rentalsService } from '@/services/rentalsService';
import { Rental } from '@/types/database';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const getRentalStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-500';
    case 'ongoing':
      return 'bg-primary';
    case 'finished':
      return 'bg-emerald-500';
    case 'pending':
      return 'bg-yellow-500';
    case 'awaiting_payment':
      return 'bg-orange-500';
    case 'collecting':
      return 'bg-purple-500';
    case 'cancelled':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pagamento Pendente';
    case 'awaiting_payment':
      return 'Aguardando Pagamento';
    case 'confirmed':
      return 'Aprovado';
    case 'ongoing':
      return 'Em Andamento';
    case 'collecting':
      return 'Recolher Material';
    case 'finished':
      return 'Contrato Expirado';
    case 'cancelled':
      return 'Cancelado';
    default:
      return status;
  }
};

const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    loadRentals();
  }, []);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const data = await rentalsService.getRentals();
      setRentals(data);
    } catch (error) {
      console.error('Error loading rentals:', error);
      toast.error('Erro ao carregar aluguéis');
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDay(null);
  };

  const getRentalsForDay = (day: Date) => {
    return rentals.filter(rental => {
      const rentalStart = parseISO(rental.start_date);
      const rentalEnd = parseISO(rental.end_date);
      return day >= rentalStart && day <= rentalEnd;
    });
  };

  const handleDayClick = (day: Date) => {
    const dayRentals = getRentalsForDay(day);
    if (dayRentals.length > 0) {
      setSelectedDay(day);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const selectedDayRentals = selectedDay ? getRentalsForDay(selectedDay) : [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-stretch sm:items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Calendário</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize todos os aluguéis programados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <h2 className="text-lg md:text-xl font-bold text-foreground capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {/* Weekday Headers */}
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
              <div key={day} className="text-center py-2 text-xs md:text-sm font-semibold text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells for alignment */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Calendar Days */}
            {daysInMonth.map((day) => {
              const dayRentals = getRentalsForDay(day);
              const isToday = isSameDay(day, new Date());
              const isSelected = selectedDay && isSameDay(day, selectedDay);
              const hasRentals = dayRentals.length > 0;

              return (
                <HoverCard key={day.toISOString()} openDelay={200}>
                  <HoverCardTrigger asChild>
                    <div
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square border rounded-lg p-1 md:p-2 
                        ${isToday ? 'bg-primary/10 border-primary' : 'border-border'}
                        ${isSelected ? 'ring-2 ring-primary' : ''}
                        ${hasRentals ? 'cursor-pointer hover:bg-muted' : ''}
                        transition-colors relative group
                      `}
                    >
                      <div className={`text-xs md:text-sm font-medium ${isToday ? 'text-primary' : 'text-foreground'}`}>
                        {format(day, 'd')}
                      </div>
                      <div className="mt-1 space-y-1">
                        {dayRentals.slice(0, 2).map((rental) => (
                          <div
                            key={rental.id}
                            className={`h-1 md:h-1.5 rounded-full ${getRentalStatusColor(rental.status)}`}
                          />
                        ))}
                        {dayRentals.length > 2 && (
                          <div className="text-[8px] md:text-[10px] text-muted-foreground text-center">
                            +{dayRentals.length - 2}
                          </div>
                        )}
                      </div>
                    </div>
                  </HoverCardTrigger>
                  {hasRentals && (
                    <HoverCardContent className="w-80 p-0 overflow-hidden border-border shadow-xl z-50">
                      <div className="bg-muted/50 p-3 border-b border-border">
                        <h4 className="font-semibold text-sm flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-primary" />
                          {format(day, "dd 'de' MMMM", { locale: ptBR })}
                        </h4>
                      </div>
                      <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
                        {dayRentals.map((rental) => (
                          <div key={rental.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                            <div className={`w-2 h-2 mt-1.5 rounded-full flex-shrink-0 ${getRentalStatusColor(rental.status)}`} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{rental.customer?.name}</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="text-xs text-muted-foreground">{getStatusLabel(rental.status)}</span>
                                <span className="text-xs font-semibold text-foreground">
                                  R$ {Number(rental.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </HoverCardContent>
                  )}
                </HoverCard>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Legenda</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-muted-foreground">Pagamento Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-orange-500" />
                <span className="text-xs text-muted-foreground">Aguard. Pagamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-xs text-muted-foreground">Aprovado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-xs text-muted-foreground">Em Andamento</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-muted-foreground">Recolher Material</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-muted-foreground">Contrato Expirado</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-xs text-muted-foreground">Cancelado</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Selected Day / Upcoming */}
        <div className="space-y-4">
          {/* Selected Day Details */}
          {selectedDay && selectedDayRentals.length > 0 && (
            <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-primary" />
                {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <div className="space-y-3">
                {selectedDayRentals.map((rental) => (
                  <div key={rental.id} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getRentalStatusColor(rental.status)}`} />
                          <p className="text-sm font-medium text-foreground truncate">
                            {rental.customer?.name}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(rental.start_date), "dd/MM")} - {format(parseISO(rental.end_date), "dd/MM/yyyy")}
                        </p>
                        <p className="text-xs font-semibold text-foreground mt-1">
                          R$ {Number(rental.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/alugueis/${rental.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-2 ${rental.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      rental.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        rental.status === 'ongoing' ? 'bg-primary/10 text-primary' :
                          rental.status === 'finished' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-red-100 text-red-700'
                      }`}>
                      {getStatusLabel(rental.status)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div className="bg-card rounded-lg md:rounded-xl shadow-sm border border-border p-4 md:p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Próximos Aluguéis
            </h3>
            <div className="space-y-3">
              {rentals
                .filter(r => parseISO(r.start_date) >= new Date() && r.status !== 'cancelled' && r.status !== 'finished')
                .sort((a, b) => parseISO(a.start_date).getTime() - parseISO(b.start_date).getTime())
                .slice(0, 5)
                .map((rental) => (
                  <div
                    key={rental.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/alugueis/${rental.id}`)}
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${getRentalStatusColor(rental.status)}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{rental.customer?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(parseISO(rental.start_date), "dd 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <p className="text-xs font-semibold text-foreground whitespace-nowrap">
                      R$ {Number(rental.total_value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              {rentals.filter(r => parseISO(r.start_date) >= new Date() && r.status !== 'cancelled' && r.status !== 'finished').length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhum aluguel próximo
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
