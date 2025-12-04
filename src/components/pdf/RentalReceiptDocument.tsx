import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Rental } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 12,
        lineHeight: 1.5,
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    content: {
        marginBottom: 40,
        textAlign: 'justify',
    },
    date: {
        textAlign: 'center',
        marginBottom: 40,
    },
    signatureSection: {
        alignItems: 'center',
        marginTop: 20,
    },
    signatureLine: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: 200,
        marginBottom: 10,
    },
    companyName: {
        fontWeight: 'bold',
        fontSize: 12,
    },
    cnpj: {
        fontSize: 10,
        color: '#666',
    },
});

interface RentalReceiptDocumentProps {
    rental: Rental;
    paymentAmount: number;
    paymentMethod: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

export const RentalReceiptDocument: React.FC<RentalReceiptDocumentProps> = ({ rental, paymentAmount, paymentMethod }) => {
    const customerName = rental.customer?.name || 'Cliente';
    const amountFormatted = formatCurrency(paymentAmount);
    const today = new Date();
    const dateStr = format(today, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
    const contractNumber = rental.id.slice(0, 8).toUpperCase();

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <View style={styles.header}>
                    <Text style={styles.title}>RECIBO DE PAGAMENTO</Text>
                </View>

                <View style={styles.content}>
                    <Text>
                        Recebemos de {customerName} a importância de {amountFormatted}, referente ao pagamento parcial/total do aluguel nº {contractNumber}, realizado através de {paymentMethod}.
                    </Text>
                </View>

                <Text style={styles.date}>
                    Porteirinha - MG, {dateStr}
                </Text>

                <View style={styles.signatureSection}>
                    <View style={styles.signatureLine} />
                    <Text style={styles.companyName}>CARLÚCIO HERMANE VICTOR - ME</Text>
                    <Text style={styles.cnpj}>CNPJ: 24.093.000/0001-00</Text>
                </View>
            </Page>
        </Document>
    );
};
