import { CalendarIcon, FileSignature, Plus, Settings, TrendingUp, Users, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import QuickActionsDemo from "@/components/demos/QuickActionsDemo";
import SettingsDemo from "@/components/demos/SettingsDemo";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { Card } from "@/components/ui/card";
import { CalendarWidget } from "@/components/dashboard/CalendarWidget";

const contracts = [
    {
        name: "CTR-2024-001",
        body: "Locação Tenda 10x10 - Metalúrgica ABC",
    },
    {
        name: "CTR-2024-002",
        body: "Evento Corporativo - Empresa XYZ",
    },
    {
        name: "CTR-2024-003",
        body: "Casamento - Fazenda São José",
    },
    {
        name: "CTR-2024-004",
        body: "Feira Gastronômica - Prefeitura",
    },
    {
        name: "CTR-2024-005",
        body: "Show de Verão - Produtora 123",
    },
];

const features = [
    {
        Icon: Plus,
        name: "Ações Rápidas",
        description: "Inicie um novo aluguel ou cadastre um cliente em segundos.",
        href: "/alugueis/novo",
        cta: "Novo Aluguel",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
                <QuickActionsDemo className="absolute inset-0 w-full h-full border-none opacity-50 transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-100" />
            </div>
        ),
    },
    {
        Icon: FileSignature,
        name: "Contratos Recentes",
        description: "Acompanhe os últimos contratos gerados e assinados.",
        href: "/contratos",
        cta: "Ver contratos",
        className: "col-span-3 lg:col-span-1",
        background: (
            <Marquee
                pauseOnHover
                className="absolute top-5 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
            >
                {contracts.map((f, idx) => (
                    <figure
                        key={idx}
                        className={cn(
                            "relative w-32 cursor-pointer overflow-hidden rounded-xl border p-4",
                            "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
                            "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]",
                            "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none"
                        )}
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div className="flex flex-col">
                                <figcaption className="text-sm font-medium dark:text-white">
                                    {f.name}
                                </figcaption>
                            </div>
                        </div>
                        <blockquote className="mt-2 text-xs">{f.body}</blockquote>
                    </figure>
                ))}
            </Marquee>
        ),
    },
    {
        Icon: Settings,
        name: "Configurações",
        description: "Gerencie preferências, usuários e permissões.",
        href: "/configuracoes",
        cta: "Acessar",
        className: "col-span-3 lg:col-span-1",
        background: (
            <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
                <SettingsDemo className="absolute inset-0 w-full h-full border-none opacity-60 transition-all duration-300 ease-out group-hover:scale-[1.02] group-hover:opacity-100" />
            </div>
        ),
    },
    {
        Icon: CalendarIcon,
        name: "Calendário",
        description: "Calendário",
        href: "/calendario",
        cta: "Abrir",
        // Hide the default BentoCard text overlay for this specific card to let the widget take full control
        className: "col-span-3 lg:col-span-3 lg:row-span-2 min-h-[500px] [&>div:nth-child(2)]:hidden [&>div:nth-child(3)]:hidden",
        background: (
            <div className="absolute inset-0 z-10 pointer-events-auto">
                <CalendarWidget />
            </div>
        ),
    },
];

export default function Dashboard() {
    return (
        <div className="space-y-8 p-2 md:p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Visão geral do seu negócio de locação.
                    </p>
                </div>
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 text-sm font-medium">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Sistema Online
                    </div>
                </div>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 flex items-center gap-4 hover:bg-accent/5 transition-colors cursor-pointer border-primary/20">
                    <div className="p-3 rounded-full bg-primary/10 text-primary">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Faturamento Mensal</p>
                        <h3 className="text-2xl font-bold">R$ 45.230,00</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4 hover:bg-accent/5 transition-colors cursor-pointer border-primary/20">
                    <div className="p-3 rounded-full bg-blue-500/10 text-blue-500">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Novos Clientes</p>
                        <h3 className="text-2xl font-bold">+12</h3>
                    </div>
                </Card>
                <Card className="p-6 flex items-center gap-4 hover:bg-accent/5 transition-colors cursor-pointer border-primary/20">
                    <div className="p-3 rounded-full bg-orange-500/10 text-orange-500">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Pendências</p>
                        <h3 className="text-2xl font-bold">3</h3>
                    </div>
                </Card>
            </div>

            {/* Main Bento Grid */}
            <BentoGrid>
                {features.map((feature, idx) => (
                    <BentoCard key={idx} {...feature} />
                ))}
            </BentoGrid>
        </div>
    );
}
