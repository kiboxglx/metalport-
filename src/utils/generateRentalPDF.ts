import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Rental } from '@/types/database';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface RentalPDFData {
  rental: Rental;
  items?: Array<{
    tentName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}

// Company info - can be configured
const COMPANY_INFO = {
  name: 'CARLÚCIO HERMANE VICTOR - ME',
  tradeName: 'METALPORT',
  address: 'Rua José Izídio dos Santos, 250 - Centro',
  cityState: 'Porteirinha - MG - 39.520-000',
  phone: '(38) 3831-1345',
  city: 'Porteirinha',
  state: 'MG',
};

/**
 * Generate a PDF contract/summary for a rental
 */
export const generateRentalPDF = async ({ rental, items }: RentalPDFData): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);

  // Colors
  const black: [number, number, number] = [0, 0, 0];

  let yPos = margin;

  // Try to load and add logo
  try {
    const logoImg = await loadImage('/images/metalport-logo.jpg');
    doc.addImage(logoImg, 'JPEG', margin, yPos, 50, 20);
  } catch (error) {
    // If logo fails to load, just add company name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.setTextColor(34, 139, 34); // Green color for METALPORT
    doc.text('METALPORT', margin, yPos + 10);
  }

  // Company info under logo
  doc.setTextColor(...black);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text(COMPANY_INFO.name, margin, yPos + 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(COMPANY_INFO.address, margin, yPos + 33);
  doc.text(COMPANY_INFO.cityState, margin, yPos + 38);
  doc.text(COMPANY_INFO.phone, margin, yPos + 43);

  // Title on the right side
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CONTRATO DE LOCAÇÃO DE EQUIPAMENTO', pageWidth - margin, yPos + 15, { align: 'right' });

  // Contract info on right side
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Número do Contrato:  ${rental.id.slice(0, 8).toUpperCase()}`, pageWidth - margin, yPos + 28, { align: 'right' });
  doc.text(`Data Início:  ${format(new Date(rental.start_date), 'dd/MM/yyyy')}`, pageWidth - margin, yPos + 35, { align: 'right' });
  doc.text(`Data Fim:  ${format(new Date(rental.end_date), 'dd/MM/yyyy')}`, pageWidth - margin, yPos + 42, { align: 'right' });

  yPos = 65;

  // Horizontal line
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  yPos += 10;

  // Locatário section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Locatário', margin, yPos);

  yPos += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(rental.customer?.name || 'N/A', margin, yPos);

  // Customer details
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);

  let customerDetails = '';
  if (rental.customer?.document) {
    customerDetails += `Portador do CPF: ${rental.customer.document}`;
  }

  if (customerDetails) {
    const splitDetails = doc.splitTextToSize(customerDetails, contentWidth);
    doc.text(splitDetails, margin, yPos);
    yPos += splitDetails.length * 4;
  }

  if (rental.customer?.phone) {
    yPos += 1;
    doc.text(`Telefone de contato: ${rental.customer.phone}`, margin, yPos);
  }

  if (rental.customer?.email) {
    yPos += 4;
    doc.text(`E-mail: ${rental.customer.email}`, margin, yPos);
  }

  yPos += 10;

  // Clause 1 - Equipment rental terms
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('1º', margin, yPos);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const clause1Text = 'A LOCADORA proprietária dos equipamentos abaixo descritos, aluga ao(a) LOCATÁRIO(A). Nas condições e prazos estabelecidos:';
  doc.text(clause1Text, margin + 10, yPos);

  yPos += 10;

  // Build items from rental data if not provided
  const days = Math.max(1, differenceInDays(new Date(rental.end_date), new Date(rental.start_date)) + 1);
  const tableItems = items || [];

  // If no items provided, create a placeholder row
  if (tableItems.length === 0) {
    tableItems.push({
      tentName: 'Equipamentos diversos',
      quantity: 1,
      unitPrice: rental.total_value / days,
      total: rental.total_value,
    });
  }

  const tableData = tableItems.map(item => [
    item.tentName,
    item.quantity.toString(),
    days.toString(),
    formatCurrency(item.unitPrice),
    formatCurrency(item.total),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['Item', 'Quantidade', 'Diárias', 'Valor Uni.', 'Valor Total']],
    body: tableData,
    theme: 'plain',
    headStyles: {
      fillColor: [255, 255, 255],
      textColor: black,
      fontStyle: 'bold',
      fontSize: 9,
      lineWidth: 0,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      textColor: black,
      lineWidth: 0,
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
    },
    margin: { left: margin, right: margin },
    didDrawPage: () => {
      doc.setDrawColor(0, 0, 0);
      doc.line(margin, yPos - 1, pageWidth - margin, yPos - 1);
    },
  });

  // Draw line under table
  const tableEndY = (doc as any).lastAutoTable.finalY;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, tableEndY, pageWidth - margin, tableEndY);

  // Total row
  yPos = tableEndY + 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total', pageWidth - margin - 45, yPos, { align: 'right' });
  doc.text(formatCurrency(rental.total_value), pageWidth - margin, yPos, { align: 'right' });

  yPos += 10;

  // Equipment condition statement
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  const equipmentText = 'O equipamento locado é entregue em perfeito estado de conservação e uso, valendo a assinatura pelo(a) Locatário(a) ou seu preposto, como reconhecimento pleno de fato.';
  const splitEquipment = doc.splitTextToSize(equipmentText, contentWidth);
  doc.text(splitEquipment, margin, yPos);
  yPos += splitEquipment.length * 4 + 4;

  // Period
  doc.text(`Período de Locação: ${format(new Date(rental.start_date), 'dd/MM/yyyy')} a ${format(new Date(rental.end_date), 'dd/MM/yyyy')}`, margin, yPos);

  yPos += 6;

  // Value in words
  doc.setFont('helvetica', 'normal');
  doc.text('Valor da Locação: ', margin, yPos);
  doc.setFont('helvetica', 'bold');
  doc.text(`R$ ${formatNumber(rental.total_value)} (${numberToWords(rental.total_value)}).`, margin + 30, yPos);

  yPos += 8;

  // Condições de Pagamento
  doc.setFont('helvetica', 'normal');
  doc.text('Condições de Pagamento', margin, yPos);

  yPos += 8;

  // Calculate equipment value (estimate as 10x the rental value)
  const equipmentValue = rental.total_value * 10;

  // Remaining clauses
  const clauses = [
    {
      number: '2º',
      text: 'Por conta do(a) LOCATÁRIO(A), correrão todas e quaisquer despesas necessárias a manutenção e operação do equipamento assim como as despesas de frete relativas a entrega na obra e posterior devolução ao depósito da LOCADORA. E também assumirá toda responsabilidade pelos danos que o uso indevido ou a manutenção inadequada venha causar ao referido equipamento.',
      paragraph: 'PARÁGRAFO ÚNICO: Se o equipamento for devolvido apresentando avarias, quebrado, com defeito ou faltando peças, componentes, o valor das peças danificadas que forem recusadas pela LOCADORA no ato da devolução, ou faltantes, será pago pelo(a) LOCATÁRIO(A), ao preço de mercado na data da devolução do equipamento.'
    },
    {
      number: '3º',
      text: 'O(A) LOCATÁRIO(A) executará os serviços de montagem dos equipamentos com pessoal próprio e despesas por sua conta. Poderá solicitar orientação e assistência técnica do pessoal especializado da LOCADORA que atenderá sem nada a cobrar desde que seja no perímetro urbano desta cidade.'
    },
    {
      number: '4º',
      text: 'Os equipamentos locados por quinzena, quando devolvido após o período contratado, os dia excedentes serão cobrados proporcionalmente. Em se tratando de locação diária ou mensal, não há proporcionalidade, e serão cobrados ao preço de locação diária ou mensal integral.'
    },
    {
      number: '5º',
      text: 'Quaisquer acidentes ocorridos com os equipamentos locados ou por ele causados a terceiro, quer a pessoa, quer os materiais, desde sua retirada até a devolução e seu efetivo reconhecimento, serão de exclusiva responsabilidade do(a) LOCATÁRIO(A), excluindo a LOCADORA de quaisquer responsabilidades cíveis ou trabalhistas e do pagamento quaisquer de indenizações, seja a de que título.'
    },
    {
      number: '6º',
      text: `O valor de mercado dos equipamentos ora locados é de: R$ ${formatNumber(equipmentValue)} (${numberToWords(equipmentValue)})`
    },
    {
      number: '7º',
      text: `Fica eleito o Foro da Comarca de ${COMPANY_INFO.city}-${COMPANY_INFO.state} exclusivamente, como competente para conhecer e dirimir quaisquer dúvidas oriundas deste contrato, assim juntos e contratados assinam o presente em 2(duas) vias de igual teor para um só efeito.`
    }
  ];

  for (const clause of clauses) {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(clause.number, margin, yPos);

    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(clause.text, contentWidth - 8);
    doc.text(splitText, margin + 8, yPos);
    yPos += splitText.length * 4 + 2;

    if (clause.paragraph) {
      doc.setFont('helvetica', 'italic');
      const splitParagraph = doc.splitTextToSize(clause.paragraph, contentWidth - 8);
      doc.text(splitParagraph, margin + 8, yPos);
      yPos += splitParagraph.length * 4 + 2;
    }

    yPos += 3;
  }

  // Notes section
  if (rental.notes) {
    if (yPos > pageHeight - 50) {
      doc.addPage();
      yPos = margin;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Observações:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const splitNotes = doc.splitTextToSize(rental.notes, contentWidth);
    doc.text(splitNotes, margin, yPos);
    yPos += splitNotes.length * 4 + 5;
  }

  // Check if we need a new page for signatures
  if (yPos > pageHeight - 80) {
    doc.addPage();
    yPos = margin;
  }

  // Date and location - centered
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  const dateText = `${COMPANY_INFO.city} - ${COMPANY_INFO.state}, ${format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}`;
  doc.text(dateText, pageWidth / 2, yPos, { align: 'center' });

  // Signature lines - right aligned
  yPos += 25;
  const signatureWidth = 70;
  const signatureX = pageWidth - margin - signatureWidth;

  // LOCADORA
  doc.setDrawColor(...black);
  doc.line(signatureX, yPos, signatureX + signatureWidth, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('LOCADORA', signatureX + signatureWidth, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  yPos += 4;
  doc.text(COMPANY_INFO.name, signatureX + signatureWidth, yPos, { align: 'right' });

  // LOCATÁRIO(A)
  yPos += 20;
  doc.line(signatureX, yPos, signatureX + signatureWidth, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('LOCATÁRIO(A)', signatureX + signatureWidth, yPos, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  yPos += 4;
  doc.text(rental.customer?.name || 'N/A', signatureX + signatureWidth, yPos, { align: 'right' });

  // TESTEMUNHA
  yPos += 25;
  doc.line(signatureX, yPos, signatureX + signatureWidth, yPos);
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.text('TESTEMUNHA', signatureX + signatureWidth, yPos, { align: 'right' });

  // Save the PDF via Blob
  const fileName = `Contrato_${rental.id.slice(0, 8).toUpperCase()}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  savePdfBlob(doc, fileName);
};

// Helper function to force download via Blob
const savePdfBlob = (doc: jsPDF, filename: string) => {
  try {
    console.log('Tentando salvar PDF via Blob com nome:', filename);
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('Download iniciado via Blob');
  } catch (error) {
    console.error('Erro ao salvar Blob:', error);
    // Fallback to default save if blob fails
    doc.save(filename);
  }
};

// Load image helper
const loadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg'));
      } else {
        reject(new Error('Could not get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = src;
  });
};

// Helper function to format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

// Format number without currency symbol
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

// Convert number to words in Portuguese
const numberToWords = (value: number): string => {
  const units = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
  const teens = ['dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
  const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
  const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

  const intValue = Math.floor(value);
  const cents = Math.round((value - intValue) * 100);

  if (intValue === 0) return 'zero reais';
  if (intValue === 100) return 'cem reais';

  let result = '';

  // Thousands
  if (intValue >= 1000) {
    const thousands = Math.floor(intValue / 1000);
    if (thousands === 1) {
      result += 'mil';
    } else if (thousands < 10) {
      result += units[thousands] + ' mil';
    } else if (thousands < 20) {
      result += teens[thousands - 10] + ' mil';
    } else {
      const t = Math.floor(thousands / 10);
      const u = thousands % 10;
      result += tens[t] + (u > 0 ? ' e ' + units[u] : '') + ' mil';
    }
  }

  // Hundreds
  const remainder = intValue % 1000;
  if (remainder >= 100) {
    if (result) result += ' ';
    if (remainder === 100) {
      result += 'cem';
    } else {
      result += hundreds[Math.floor(remainder / 100)];
    }
  }

  // Tens and units
  const tensUnits = remainder % 100;
  if (tensUnits > 0) {
    if (result) result += ' e ';
    if (tensUnits < 10) {
      result += units[tensUnits];
    } else if (tensUnits < 20) {
      result += teens[tensUnits - 10];
    } else {
      const t = Math.floor(tensUnits / 10);
      const u = tensUnits % 10;
      result += tens[t] + (u > 0 ? ' e ' + units[u] : '');
    }
  }

  result += intValue === 1 ? ' real' : ' reais';

  if (cents > 0) {
    result += ' e ';
    if (cents < 10) {
      result += units[cents];
    } else if (cents < 20) {
      result += teens[cents - 10];
    } else {
      const t = Math.floor(cents / 10);
      const u = cents % 10;
      result += tens[t] + (u > 0 ? ' e ' + units[u] : '');
    }
    result += cents === 1 ? ' centavo' : ' centavos';
  }

  return result;
};
