import React from 'react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ContractGenerator from './ContractGenerator';

export default async function ContractPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch quote AND company settings (user info)
    // Note: In a real app we'd fetch company settings from a specific table. 
    // Here we hardcode our company info (Party B) for now, but use Quote for Party A.
    const quote = await prisma.quote.findUnique({
        where: { id },
        include: { items: true }
    });

    if (!quote) return notFound();

    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    const contractNumber = `01.${today.getFullYear()}/HĐMB/DTT-${quote.customerName.substring(0, 2).toUpperCase()}`;

    const initialData = {
        contractNumber: contractNumber,
        date: formattedDate,

        // Party A (Buyer) - From Quote
        partyAName: quote.customerName,
        partyAAddress: quote.customerAddress || '',
        partyATax: '...', // Need to add taxCode to Quote Model or allow edit
        partyARep: '...',
        partyAPosition: 'Giám Đốc',

        // Party B (Seller) - From System
        partyBName: 'CÔNG TY TNHH DƯƠNG THÀNH TÍN',
        partyBAddress: '123 Nguyễn Văn Linh, Q. Hải Châu, TP. Đà Nẵng',
        partyBPhone: '0905.123.456',
        partyBEmail: 'contact@duongthanhtin.com',
        partyBTax: '0401234567',
        partyBRep: 'Ông DƯƠNG THÀNH TÍN',
        partyBPosition: 'Giám đốc',
        partyBAccount: '007123456789',
        partyBBank: 'Vietcombank - CN Đà Nẵng',

        // Terms
        deliveryLocation: quote.customerAddress || '', // Default to customer address
        deliveryDays: '15-20',
        depositPercent: 30,
        vatRate: 8
    };

    return <ContractGenerator quote={quote} initialData={initialData} />;
}
