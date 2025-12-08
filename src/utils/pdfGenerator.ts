import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Rental, RentalItem, RentalProductItem } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Define the extended interface for jsPDF to include autoTable
interface jsPDFWithAutoTable extends jsPDF {
    lastAutoTable: {
        finalY: number;
    };
}

// Helper function to force download via Blob with fallback
// Helper function to force download via Blob with fallback
const savePdfBlob = (doc: jsPDF, filename: string) => {
    try {
        console.log('Tentando salvar PDF via doc.save() com nome:', filename);
        // 1. Tenta o método nativo do jspdf (Geralmente o mais robusto para nomes de arquivo)
        doc.save(filename);
        console.log('Download iniciado via doc.save()');
    } catch (error) {
        console.warn('Erro ao salvar via doc.save(), tentando fallback manual:', error);

        try {
            // 2. Fallback Manual: Blob + Link
            const blob = new Blob([doc.output('blob')], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();

            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            console.log('Download iniciado via Link Blob (Fallback)');
        } catch (fallbackError) {
            console.error('Erro fatal ao salvar PDF:', fallbackError);
            alert('Não foi possível baixar o PDF. Por favor, verifique as permissões do navegador.');
        }
    }
};

export const generateContractPDF = async (rental: Rental, items: (RentalItem | RentalProductItem)[]) => {
    console.log('Iniciando geração do contrato para aluguel:', rental.id);

    try {
        // Ensure jsPDF is instantiated correctly
        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
        }) as jsPDFWithAutoTable;

        // --- Configurações Iniciais ---
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        const contentWidth = pageWidth - (margin * 2);

        // --- Helper para carregar imagem ---
        const loadImage = (src: string): Promise<HTMLImageElement> => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve(img);
                img.onerror = reject;
            });
        };

        // --- Logo ---
        // Tenta carregar o logo, se falhar segue sem ele
        try {
            const logo = await loadImage('/logo.png');
            // Ajusta tamanho do logo mantendo proporção (max width 50, max height 25)
            const logoWidth = 50;
            const logoHeight = (logo.height * logoWidth) / logo.width;
            doc.addImage(logo, 'PNG', margin, 15, logoWidth, logoHeight);
        } catch (e) {
            console.warn('Logo não encontrado, gerando sem logo');
        }

        // --- Cabeçalho Direito ---
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('CONTRATO DE LOCAÇÃO DE EQUIPAMENTO', pageWidth - margin, 25, { align: 'right' });

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Número do Contrato: ${rental.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, 32, { align: 'right' });
        doc.text(`Data Início: ${format(new Date(rental.start_date), 'dd/MM/yyyy')}`, pageWidth - margin, 37, { align: 'right' });
        doc.text(`Data Fim: ${format(new Date(rental.end_date), 'dd/MM/yyyy')}`, pageWidth - margin, 42, { align: 'right' });

        // --- Dados da Locadora (Esquerda, abaixo do logo) ---
        let yPos = 55;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('CARLÚCIO HERMANE VICTOR - ME', margin, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.text('Rua José Izídio dos Santos, 250 - Centro', margin, yPos);
        yPos += 5;
        doc.text('Porteirinha - MG - 39.520-000', margin, yPos);
        yPos += 5;
        doc.text('(38) 3831-1345', margin, yPos);

        // --- Dados do Locatário ---
        yPos += 15;
        doc.setFont('helvetica', 'bold');
        doc.text('Locatário', margin, yPos);
        yPos += 7;
        doc.setFont('helvetica', 'normal');
        // Verifica se temos os dados do cliente expandidos
        const customerName = rental.customer?.name || 'Cliente não identificado';
        const customerDoc = rental.customer?.document || rental.customer?.cpf || '';
        const customerAddress = rental.customer?.address || '';

        doc.text(`${customerName}`, margin, yPos);
        if (customerDoc) {
            yPos += 5;
            doc.text(`CPF/CNPJ: ${customerDoc}`, margin, yPos);
        }
        if (customerAddress) {
            yPos += 5;
            doc.text(`${customerAddress}`, margin, yPos);
        }

        // --- Cláusula 1 e Tabela de Itens ---
        yPos += 15;
        doc.setFontSize(9);
        const clause1 = "1º A LOCADORA proprietária dos equipamentos abaixo descritos, aluga ao(a) LOCATÁRIO(A). Nas condições e prazos estabelecidos:";
        const splitClause1 = doc.splitTextToSize(clause1, contentWidth);
        doc.text(splitClause1, margin, yPos);

        yPos += (splitClause1.length * 4) + 2;

        // Preparar dados da tabela
        const tableData = items.map(item => {
            // Tenta identificar se é produto ou tenda
            const name = (item as any).product?.name || (item as any).tent?.name || 'Item';
            const quantity = Number(item.quantity);
            // Calcula dias
            const start = new Date(rental.start_date);
            const end = new Date(rental.end_date);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

            const unitPrice = Number(item.unit_price);
            const total = quantity * unitPrice * diffDays; // Assumindo preço diário * dias * qtd

            return [
                name,
                quantity.toString(),
                diffDays.toString(),
                `R$ ${unitPrice.toFixed(2)}`,
                `R$ ${total.toFixed(2)}`
            ];
        });

        autoTable(doc, {
            startY: yPos,
            head: [['Item', 'Quantidade', 'Diárias', 'Valor Uni.', 'Valor Total']],
            body: tableData,
            theme: 'plain',
            headStyles: { fontStyle: 'bold', fillColor: [240, 240, 240] },
            styles: { fontSize: 9, cellPadding: 2 },
            columnStyles: {
                0: { cellWidth: 'auto' },
                4: { halign: 'right' }
            },
            foot: [['', '', '', 'Total', `R$ ${Number(rental.total_value).toFixed(2)}`]],
            footStyles: { fontStyle: 'bold', halign: 'right' }
        });

        // Atualiza Y após tabela
        yPos = doc.lastAutoTable.finalY + 10;

        // --- Texto do Contrato (Cláusulas) ---
        doc.setFontSize(8);

        const clauses = [
            "O equipamento locado é entregue em perfeito estado de conservação e uso, valendo a assinatura pelo(a) Locatário(a) ou seu preposto, como reconhecimento pleno de fato.",
            `Período de Locação: ${format(new Date(rental.start_date), 'dd/MM/yyyy')} a ${format(new Date(rental.end_date), 'dd/MM/yyyy')}`,
            `Valor da Locação: R$ ${Number(rental.total_value).toFixed(2)}.`,
            "",
            "Condições de Pagamento",
            "2º Por conta do(a) LOCATÁRIO(A), correrão todas e quaisquer despesas necessárias a manutenção e operação do equipamento assim como as despesas de frete relativas a entrega na obra e posterior devolução ao depósito da LOCADORA. E também assumirá toda responsabilidade pelos danos que o uso indevido ou a manutenção inadequada venha causar ao referido equipamento.",
            "PARÁGRAFO ÚNICO: Se o equipamento for devolvido apresentando avarias, quebrado, com defeito ou faltando peças, componentes, o valor das peças danificadas que forem recusadas pela LOCADORA no ato da devolução, ou faltantes, será pago pelo(a) LOCATÁRIO(A), ao preço de mercado na data da devolução do equipamento.",
            "3º O(A) LOCATÁRIO(A) executará os serviços de montagem dos equipamentos com pessoal próprio e despesas por sua conta. Poderá solicitar orientação e assistência técnica do pessoal especializado da LOCADORA que atenderá sem nada a cobrar desde que seja no perímetro urbano desta cidade.",
            "4º Os equipamentos locados por quinzena, quando devolvido após o período contratado, os dia excedentes serão cobrados proporcionalmente. Em se tratando de locação diária ou mensal, não há proporcionalidade, e serão cobrados ao preço de locação diária ou mensal integral.",
            "5º Quaisquer acidentes ocorridos com os equipamentos locados ou por ele causados a terceiro, quer a pessoa, quer os materiais, desde sua retirada até a devolução e seu efetivo reconhecimento, serão de exclusiva responsabilidade do(a) LOCATÁRIO(A), excluindo a LOCADORA de quaisquer responsabilidades cíveis ou trabalhistas e do pagamento quaisquer de indenizações, seja a de que título.",
            `6º O valor de mercado dos equipamentos ora locados é de: R$ ${Number(rental.total_value * 10).toFixed(2)} (estimado)`, // Valor de mercado estimado
            "7º Fica eleito o Foro da Comarca de Porteirinha-MG exclusivamente, como competente para conhecer e dirimir quaisquer dúvidas oriundas deste contrato, assim juntos e contratados assinam o presente em 2(duas) vias de igual teor para um só efeito."
        ];

        clauses.forEach(clause => {
            // Verifica se precisa de nova página
            if (yPos > pageHeight - 40) {
                doc.addPage();
                yPos = 20;
            }

            if (clause === "") {
                yPos += 5;
                return;
            }

            const splitText = doc.splitTextToSize(clause, contentWidth);
            doc.text(splitText, margin, yPos);
            yPos += (splitText.length * 3.5) + 3;
        });

        // --- Data e Assinaturas ---
        yPos += 10;
        if (yPos > pageHeight - 60) {
            doc.addPage();
            yPos = 30;
        }

        const today = new Date();
        const dateStr = `Porteirinha - MG, ${format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
        doc.text(dateStr, pageWidth / 2, yPos, { align: 'center' });

        yPos += 30;

        // Assinaturas Lado a Lado
        const signatureY = yPos;
        const col1X = margin + 20;
        const col2X = pageWidth - margin - 20;

        // Linha Locadora
        doc.line(margin, signatureY, pageWidth / 2 - 10, signatureY);
        doc.text('LOCADORA', margin + 10, signatureY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text('CARLÚCIO HERMANE VICTOR - ME', margin + 10, signatureY + 10);

        // Linha Locatário
        doc.setFont('helvetica', 'normal');
        doc.line(pageWidth / 2 + 10, signatureY, pageWidth - margin, signatureY);
        doc.text('LOCATÁRIO(A)', pageWidth / 2 + 20, signatureY + 5);
        doc.setFont('helvetica', 'bold');
        doc.text(customerName.slice(0, 30), pageWidth / 2 + 20, signatureY + 10);



        // Salvar PDF via Blob
        const safeId = (rental.id && rental.id.length > 0)
            ? rental.id.slice(0, 8).replace(/[^a-z0-9]/gi, '_')
            : `novo_${new Date().getTime()}`;

        console.log('ID seguro gerado:', safeId);
        savePdfBlob(doc, `Contrato_${safeId}.pdf`);

    } catch (error: any) {
        console.error('Erro ao gerar PDF:', error);
        throw error;
    }
};

export const generateReceiptPDF = async (rental: Rental, paymentAmount: number, paymentMethod: string) => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;

    try {
        // --- Cabeçalho ---
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, 30, { align: 'center' });

        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');

        // --- Corpo do Recibo ---
        let yPos = 60;
        const customerName = rental.customer?.name || 'Cliente';
        const amountFormatted = `R$ ${paymentAmount.toFixed(2)}`;
        const today = new Date();
        const dateStr = format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR });

        const text = `Recebemos de ${customerName} a importância de ${amountFormatted}, referente ao pagamento parcial/total do aluguel nº ${rental.id.slice(0, 8).toUpperCase()}, realizado através de ${paymentMethod}.`;

        const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
        doc.text(splitText, margin, yPos);

        yPos += 40;
        doc.text(`Porteirinha - MG, ${dateStr}`, pageWidth / 2, yPos, { align: 'center' });

        // --- Assinatura ---
        yPos += 40;
        doc.line(pageWidth / 2 - 40, yPos, pageWidth / 2 + 40, yPos);
        doc.setFont('helvetica', 'bold');
        doc.text('CARLÚCIO HERMANE VICTOR - ME', pageWidth / 2, yPos + 10, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.text('CNPJ: 24.093.000/0001-00', pageWidth / 2, yPos + 15, { align: 'center' });

        // Salvar PDF via Blob
        const safeId = (rental.id && rental.id.length > 0)
            ? rental.id.slice(0, 8).replace(/[^a-z0-9]/gi, '_')
            : `novo_${new Date().getTime()}`;

        console.log('ID seguro gerado (Recibo):', safeId);
        savePdfBlob(doc, `Recibo_${safeId}.pdf`);
    } catch (error) {
        console.error('Erro ao gerar Recibo:', error);
        throw error;
    }
};

export const generateSimplePDF = async () => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    try {
        doc.setFontSize(20);
        doc.text('Teste de PDF Simplificado', 20, 20);

        doc.setFontSize(12);
        doc.text('Este é um arquivo de teste gerado sem imagens.', 20, 40);
        doc.text(`Data de geração: ${new Date().toLocaleString()}`, 20, 50);

        // Salvar diretamente
        console.log('Salvando PDF de teste...');
        doc.save('Teste_PDF_Simplificado.pdf');
    } catch (error) {
        console.error('Erro ao gerar PDF simples:', error);
        throw error;
    }
};
