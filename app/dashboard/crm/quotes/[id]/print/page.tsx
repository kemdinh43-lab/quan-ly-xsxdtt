import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import QuoteActions from "./QuoteActions";

// Force dynamic to ensure data is fresh
export const dynamic = 'force-dynamic';

export default async function PrintQuotePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    // Fetch Quote and Settings in parallel
    const [quote, settingsList] = await Promise.all([
        prisma.quote.findUnique({
            where: { id },
            include: { items: true }
        }),
        prisma.systemSetting.findMany()
    ]);

    if (!quote) notFound();

    // Convert settings to map
    const settings = settingsList.reduce((acc, curr) => {
        acc[curr.key] = curr.value;
        return acc;
    }, {} as Record<string, string>);

    // Default Fallbacks
    const companyName = settings.COMPANY_NAME || "CÔNG TY TNHH TM DV IN QUẢNG CÁO DƯƠNG THÀNH TÍN";
    const companyAddress = settings.COMPANY_ADDRESS || "Đc: Khu Gia Đình Quân Nhân, Bộ Chỉ Huy Quân Sự, TP Đà Nẵng";
    const companyPhone = settings.COMPANY_PHONE || "0914 001 636 – 0905 171 416";
    const companyEmail = settings.COMPANY_EMAIL || "xuongmaytindn@gmail.com";
    const companyLogo = settings.COMPANY_LOGO;

    // Best-effort attempt to find Customer Email based on name match
    const customer = await prisma.customer.findFirst({
        where: {
            OR: [
                { companyName: quote.customerName },
                { name: quote.customerName }
            ]
        }
    });

    // ... (imports)

    // ... inside function
    return (
        <div className="print-container" style={{
            fontFamily: '"Times New Roman", Times, serif',
            backgroundColor: '#525659', // Dark background for "viewer" feel
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px'
        }}>

            <QuoteActions quoteId={id} customerEmail={customer?.email || ""} status={quote.status} />

            <div
                id="quote-content"
                style={{
                    width: '210mm',
                    minHeight: '297mm', // A4 height
                    padding: '20mm',
                    backgroundColor: 'white',
                    color: 'black',
                    boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                    position: 'relative',
                    boxSizing: 'border-box'
                }}
            >
                {/* Print Styles */}
                <style>{`
                    @media print {
                        body { 
                            background: white; 
                            -webkit-print-color-adjust: exact; 
                        }
                        .no-print { display: none !important; }
                        
                        /* Override wrapper styles for print to remove gray background */
                        .print-container {
                            background-color: white !important;
                            padding: 0 !important;
                            height: auto !important;
                            display: block !important;
                        }

                        #quote-content {
                            width: 100% !important;
                            height: auto !important;
                            box-shadow: none !important;
                            margin: 0 !important;
                            padding: 0 !important; /* Optional: keep padding or remove if user wants full bleed */
                            min-height: auto !important;
                        }
                        @page { 
                            size: A4; 
                            margin: 20mm; 
                        }
                        /* STRICT TYPOGRAPHY */
                        * { font-family: "Times New Roman", Times, serif !important; }
                        p, div, span, td, th {
                            font-size: 13pt !important;
                        }
                    }
                    /* Table Styles */
                    .quote-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                        font-size: 13pt;
                    }
                    .quote-table th, .quote-table td {
                        border: 1px solid #000;
                        padding: 8px 12px;
                    }
                    .quote-table th {
                        background-color: #f0f0f0;
                        font-weight: bold;
                        text-align: center;
                    }
                `}</style>

                {/* HEADER */}
                <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '2px solid #000', paddingBottom: '10px' }}>
                    <div style={{ width: '150px', marginRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {companyLogo ? (
                            <img
                                src={companyLogo}
                                alt="Logo"
                                style={{ maxWidth: '100%', maxHeight: '100px', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{
                                width: '80px', height: '80px',
                                border: '2px solid #0D47A1',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                color: '#0D47A1', fontWeight: 'bold', fontSize: '24px'
                            }}>
                                P
                            </div>
                        )}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <h2 style={{ margin: '0 0 5px 0', fontSize: '18pt', fontWeight: 'bold', textTransform: 'uppercase', color: '#B71C1C' }}>{companyName}</h2>
                        <p style={{ margin: '3px 0', fontSize: '11pt', fontWeight: 'bold' }}>{companyAddress}</p>
                        <p style={{ margin: '3px 0', fontSize: '11pt' }}>Hotline: {companyPhone}</p>
                        <p style={{ margin: '3px 0', fontSize: '11pt', fontStyle: 'italic', textDecoration: 'underline' }}>Email: {companyEmail}</p>
                    </div>
                </div>

                {/* TITLE */}
                <div style={{ textAlign: 'center', marginBottom: '30px', marginTop: '30px' }}>
                    <h1 style={{
                        fontSize: '24pt',
                        fontWeight: 'bold',
                        color: '#000',
                        textTransform: 'uppercase',
                        letterSpacing: '2px'
                    }}>
                        BẢNG BÁO GIÁ
                    </h1>
                </div>

                {/* INFO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '12pt' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ marginBottom: '8px' }}><strong>Kính gửi:</strong> {quote.customerName}</p>
                        {quote.customerAddress && <p style={{ marginBottom: '8px' }}><strong>Địa chỉ:</strong> {quote.customerAddress}</p>}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ marginBottom: '8px' }}><strong>Ngày:</strong> {new Date(quote.date).toLocaleDateString('vi-VN')}</p>
                        <p style={{ marginBottom: '8px' }}><strong>Số Báo Giá:</strong> #{quote.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                </div>

                {/* INTRO */}
                {quote.introText && (
                    <div style={{ marginBottom: '20px', fontSize: '12pt', lineHeight: '1.6', whiteSpace: 'pre-line', textAlign: 'justify' }}>
                        {quote.introText}
                    </div>
                )}

                {/* TABLE */}
                <table className="quote-table">
                    <thead>
                        <tr>
                            <th style={{ width: '50px' }}>STT</th>
                            <th>Tên Hàng Hóa / Quy Cách</th>
                            <th style={{ width: '60px' }}>ĐVT</th>
                            <th style={{ width: '80px' }}>SL</th>
                            <th style={{ width: '120px' }}>Đơn giá</th>
                            <th style={{ width: '120px' }}>Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quote.items.map((item) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{item.stt}</td>
                                <td>
                                    <div style={{ fontWeight: 'bold' }}>{item.productName}</div>
                                    {item.note && <div style={{ fontSize: '10pt', fontStyle: 'italic', marginTop: '4px' }}>{item.note}</div>}
                                    {item.imageUrl && (
                                        <div style={{ marginTop: '5px' }}>
                                            <img
                                                src={item.imageUrl}
                                                alt="Prod"
                                                style={{ maxWidth: '100px', height: 'auto', border: '1px solid #ddd', padding: '2px' }}
                                            />
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center' }}>{item.unit}</td>
                                <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                                <td style={{ textAlign: 'right' }}>
                                    {new Intl.NumberFormat('vi-VN').format(item.price)}
                                </td>
                                <td style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                    {/* Approximation if quantity is simple number */}
                                    {(!isNaN(Number(item.quantity))) ?
                                        new Intl.NumberFormat('vi-VN').format(item.price * Number(item.quantity)) : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* FOOTER TEXT */}
                {quote.footerText && (
                    <div style={{ marginBottom: '30px', fontSize: '12pt', fontStyle: 'italic' }}>
                        {quote.footerText}
                    </div>
                )}

                {/* SIGNATURE */}
                <div style={{ display: 'flex', marginTop: '50px' }}>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 'bold', textAlign: 'center' }}>ĐẠI DIỆN KHÁCH HÀNG</p>
                        <p style={{ fontStyle: 'italic', textAlign: 'center' }}>(Ký, ghi rõ họ tên)</p>
                    </div>
                    <div style={{ flex: 1 }}>
                        <p style={{ fontStyle: 'italic', textAlign: 'center', marginBottom: '5px' }}>
                            Đà Nẵng, ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
                        </p>
                        <p style={{ fontWeight: 'bold', textAlign: 'center', textTransform: 'uppercase', fontFamily: '"Times New Roman", Times, serif' }}>ĐẠI DIỆN {companyName}</p>
                        {/* Digital Signature */}
                        <div style={{ textAlign: 'center', marginTop: '10px' }}>
                            <img
                                src="/signature.png"
                                alt="Signature"
                                style={{
                                    width: '180px',
                                    height: 'auto',
                                    display: 'inline-block'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
