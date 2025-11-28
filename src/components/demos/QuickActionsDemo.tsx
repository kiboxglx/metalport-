import React from "react";
import { Plus, UserPlus, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export default function QuickActionsDemo({ className }: { className?: string }) {
    const navigate = useNavigate();

    return (
        <div className={cn("flex flex-col gap-4 p-6 h-full justify-center", className)}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-lg mx-auto">
                <button
                    onClick={() => navigate('/alugueis/novo')}
                    className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-brand-green/30 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-brand-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-brand-green/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Plus className="h-6 w-6 text-brand-green" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-brand-green transition-colors">Novo Aluguel</span>
                </button>

                <button
                    onClick={() => navigate('/clientes')}
                    className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-500/30 transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <UserPlus className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="font-semibold text-gray-700 group-hover:text-blue-500 transition-colors">Novo Cliente</span>
                </button>
            </div>

            <div className="flex justify-center mt-2">
                <button
                    onClick={() => navigate('/alugueis')}
                    className="flex items-center gap-2 text-sm text-gray-500 hover:text-brand-green transition-colors group"
                >
                    Ver todos os aluguéis
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
