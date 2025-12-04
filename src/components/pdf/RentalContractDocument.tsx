import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Rental, RentalItem, RentalProductItem } from '@/types/database';
import { format, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Register fonts if needed (using default Helvetica for now which is built-in)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
        fontSize: 10,
        lineHeight: 1.5,
    },
    header: {
        flexDirection: 'row',
        marginBottom: 20,
        justifyContent: 'space-between',
    },
    logoSection: {
        width: '50%',
    },
    logo: {
        width: 100,
        height: 50,
        objectFit: 'contain',
        marginBottom: 5,
    },
    companyName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },
    companyInfo: {
        fontSize: 8,
        color: '#333',
    },
    contractInfo: {
        width: '40%',
        alignItems: 'flex-end',
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'right',
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: 2,
    },
    label: {
        fontWeight: 'bold',
        marginRight: 5,
    },
    section: {
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        marginBottom: 5,
        backgroundColor: '#f0f0f0',
        padding: 3,
    },
    text: {
        marginBottom: 5,
        textAlign: 'justify',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
        marginBottom: 10,
    },
    tableRow: {
        margin: 'auto',
        flexDirection: 'row',
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableColWide: {
        width: '40%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableCell: {
        margin: 5,
        fontSize: 8,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        fontWeight: 'bold',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 5,
        marginBottom: 10,
    },
    totalText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    signatures: {
        marginTop: 50,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    signatureBlock: {
        width: '45%',
        alignItems: 'center',
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '100%',
        marginBottom: 5,
    },
    witnessBlock: {
        marginTop: 30,
        alignItems: 'center',
        width: '100%',
    },
    witnessLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '40%',
        marginBottom: 5,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        textAlign: 'center',
        fontSize: 8,
        color: '#666',
    },
});

interface RentalContractDocumentProps {
    rental: Rental;
    items: (RentalItem | RentalProductItem)[];
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const RentalContractDocument: React.FC<RentalContractDocumentProps> = ({ rental, items }) => {
    const days = Math.max(1, differenceInDays(new Date(rental.end_date), new Date(rental.start_date)) + 1);

    // Prepare table data
    const tableData = items.map(item => {
        const name = (item as any).product?.name || (item as any).tent?.name || 'Item';
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unit_price);
        const total = quantity * unitPrice * days;
        return { name, quantity, days, unitPrice, total };
    });

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {/* <Image src="/logo.png" style={styles.logo} /> */}
                        <Text style={styles.companyName}>CARLÚCIO HERMANE VICTOR - ME</Text>
                        <Text style={styles.companyInfo}>Rua José Izídio dos Santos, 250 - Centro</Text>
                        <Text style={styles.companyInfo}>Porteirinha - MG - 39.520-000</Text>
                        <Text style={styles.companyInfo}>(38) 3831-1345</Text>
                    </View>
                    <View style={styles.contractInfo}>
                        <Text style={styles.title}>CONTRATO DE LOCAÇÃO</Text>
                        <Text style={styles.companyInfo}>Nº: {rental.id ? rental.id.slice(0, 8).toUpperCase() : 'N/A'}</Text>
                        <Text style={styles.companyInfo}>Início: {rental.start_date ? format(new Date(rental.start_date), 'dd/MM/yyyy') : 'N/A'}</Text>
                        <Text style={styles.companyInfo}>Fim: {rental.end_date ? format(new Date(rental.end_date), 'dd/MM/yyyy') : 'N/A'}</Text>
                    </View>
                </View>

                {/* Customer Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>LOCATÁRIO(A)</Text>
                    <Text style={styles.text}>{rental.customer?.name}</Text>
                    {rental.customer?.document && <Text style={styles.text}>CPF/CNPJ: {rental.customer.document}</Text>}
                    {rental.customer?.address && <Text style={styles.text}>Endereço: {rental.customer.address}</Text>}
                </View>

                {/* Items Table */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>ITENS LOCADOS</Text>
                    <View style={styles.table}>
                        <View style={[styles.tableRow, styles.tableHeader]}>
                            <View style={styles.tableColWide}><Text style={styles.tableCell}>Item</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Qtd</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Diárias</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>Total</Text></View>
                        </View>
                        {tableData.map((row, i) => (
                            <View key={i} style={styles.tableRow}>
                                <View style={styles.tableColWide}><Text style={styles.tableCell}>{row.name}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{row.quantity}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{row.days}</Text></View>
                                <View style={styles.tableCol}><Text style={styles.tableCell}>{formatCurrency(row.total)}</Text></View>
                            </View>
                        ))}
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalText}>Total: {formatCurrency(rental.total_value)}</Text>
                    </View>
                </View>

                {/* Clauses */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>CONDIÇÕES GERAIS</Text>
                    <Text style={styles.text}>
                        1. O equipamento locado é entregue em perfeito estado de conservação e uso, valendo a assinatura pelo(a) Locatário(a) como reconhecimento pleno de fato.
                    </Text>
                    <Text style={styles.text}>
                        2. O(A) LOCATÁRIO(A) assume total responsabilidade pela guarda e conservação dos equipamentos durante o período de locação.
                    </Text>
                    <Text style={styles.text}>
                        3. Em caso de danos, perda ou roubo, o(a) LOCATÁRIO(A) deverá ressarcir a LOCADORA pelo valor de mercado dos equipamentos.
                    </Text>
                    <Text style={styles.text}>
                        4. A devolução fora do prazo acarretará cobrança de diárias adicionais.
                    </Text>
                    <Text style={styles.text}>
                        5. Fica eleito o Foro da Comarca de Porteirinha-MG para dirimir quaisquer dúvidas oriundas deste contrato.
                    </Text>
                </View>

                {/* Signatures */}
                <View style={styles.signatures}>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={{ fontWeight: 'bold' }}>CARLÚCIO HERMANE VICTOR - ME</Text>
                        <Text>Locadora</Text>
                    </View>
                    <View style={styles.signatureBlock}>
                        <View style={styles.signatureLine} />
                        <Text style={{ fontWeight: 'bold' }}>{rental.customer?.name}</Text>
                        <Text>Locatário(a)</Text>
                    </View>
                </View>

                <View style={styles.witnessBlock}>
                    <View style={styles.witnessLine} />
                    <Text>Testemunha</Text>
                </View>

                {/* Footer */}
                <Text style={styles.footer}>
                    Porteirinha - MG, {format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Text>
            </Page>
        </Document>
    );
};
