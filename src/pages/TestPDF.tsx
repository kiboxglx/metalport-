import React from 'react';
import { Button } from "@/components/ui/button";
import { FileText, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { generateSimplePDF } from "@/utils/pdfGenerator";

const TestPDF = () => {
    const navigate = useNavigate();

    const handleGeneratePDF = async () => {
        const toastId = toast.loading('Gerando PDF de teste...');
        try {
            await generateSimplePDF();
            toast.dismiss(toastId);
            toast.success('PDF de teste gerado com sucesso!');
        } catch (error: any) {
            toast.dismiss(toastId);
            console.error('Erro ao gerar PDF:', error);
            toast.error(`Erro ao gerar PDF: ${error.message}`);
        }
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="mb-6"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
            </Button>

            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md border">
                <h1 className="text-2xl font-bold mb-6 text-center">Teste de Geração de PDF</h1>

                <p className="text-gray-600 mb-8 text-center">
                    Esta página isola a funcionalidade de geração de PDF para identificar problemas de download.
                    O PDF gerado será simples, sem imagens ou logotipos.
                </p>

                <div className="flex justify-center">
                    <Button
                        onClick={handleGeneratePDF}
                        className="w-full max-w-xs gap-2"
                        size="lg"
                    >
                        <FileText className="h-5 w-5" />
                        Gerar PDF Simplificado
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TestPDF;
