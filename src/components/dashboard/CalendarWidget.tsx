import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUpRight, ArrowDownLeft, Clock } from 'lucide-react';

// Mock data for demonstration
const upcomingEvents = [
    {
        id: 1,
        title: 'Entrega: Tenda 10x10',
        client: 'Metalúrgica ABC',
        date: new Date(), // Today
        type: 'delivery',
        time: '09:00',
    },
    {
        id: 2,
        title: 'Retirada: Palco Principal',
        client: 'Prefeitura Municipal',
        date: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        type: 'pickup',
        time: '14:30',
    },
    {
        id: 3,
        title: 'Entrega: 50 Cadeiras',
        client: 'Buffet Sonho Meu',
        date: new Date(new Date().setDate(new Date().getDate() + 2)),
        type: 'delivery',
        time: '10:00',
    },
    {
        id: 4,
        title: 'Retirada: Estrutura Som',
        client: 'Show Bar',
        date: new Date(new Date().setDate(new Date().getDate() + 3)),
        type: 'pickup',
        time: '16:00',
    },
];

export function CalendarWidget() {
    const [date, setDate] = React.useState<Date | undefined>(new Date());

    return (
        <div className="flex flex-col md:flex-row gap-4 h-full w-full p-4">
            {/* Calendar Section */}
            <div className="flex-1 flex justify-center items-start overflow-visible">
                <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border shadow-sm bg-card transform scale-125 origin-top mt-8"
                />
            </div>

            {/* Events List Section */}
            <div className="flex-1 min-w-[250px]">
                <div className="h-full flex flex-col">
                    <h4 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Próximos Eventos
                    </h4>

                    <ScrollArea className="flex-1 pr-4 -mr-4 h-[300px]">
                        <div className="space-y-3">
                            {upcomingEvents.map((event) => (
                                <div
                                    key={event.id}
                                    className="flex items-start gap-3 p-3 rounded-lg border bg-card/50 hover:bg-accent/50 transition-colors"
                                >
                                    <div className={`p-2 rounded-full ${event.type === 'delivery'
                                        ? 'bg-green-500/10 text-green-500'
                                        : 'bg-orange-500/10 text-orange-500'
                                        }`}>
                                        {event.type === 'delivery' ? (
                                            <ArrowUpRight className="w-4 h-4" />
                                        ) : (
                                            <ArrowDownLeft className="w-4 h-4" />
                                        )}
                                    </div>

                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {event.title}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {event.client}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                {event.date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                                            </Badge>
                                            <span className="text-[10px] text-muted-foreground">
                                                {event.time}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
}
