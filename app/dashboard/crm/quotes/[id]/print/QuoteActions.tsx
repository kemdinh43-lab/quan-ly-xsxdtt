"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function QuoteActions({ quoteId, customerEmail, status }: { quoteId: string, customerEmail?: string, status: string }) {
    const router = useRouter();
    const [downloading, setDownloading] = useState(false);
    const [showEmailDialog, setShowEmailDialog] = useState(false);
    const [sending, setSending] = useState(false);
    const [emailData, setEmailData] = useState({ to: customerEmail || '', subject: 'Báo giá từ Dương Thành Tín', body: 'Kính gửi Quý khách hàng,<br><br>Công ty Dương Thành Tín xin gửi Quý khách bảng báo giá đính kèm.<br>Rất mong nhận được phản hồi từ Quý khách.<br><br>Trân trọng!' });

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        setDownloading(true);
        try {
            // Dynamic import to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('quote-content');

            if (!element) {
                alert("Could not find quote content");
                return;
            }

            const filename = `Bao_Gia_${quoteId.substring(0, 8)}.pdf`;
            const opt = {
                margin: 5, // mm
                filename: filename,
                // @ts-ignore
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                // @ts-ignore
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
            };

            // Force save with filename to be sure
            await html2pdf().set(opt).from(element).save(filename);
        } catch (error) {
            console.error("PDF Download Error", error);
            alert("Lỗi khi tải PDF. Vui lòng thử lại.");
        } finally {
            setDownloading(false);
        }
    };

    const handleOpenEmail = () => {
        // Try to fetch customer email if available in DOM or passed props? 
        // For now just open dialog
        setShowEmailDialog(true);
    };

    const [approvalStatus, setApprovalStatus] = useState(status);
    const [approving, setApproving] = useState(false);

    const handleApprove = async () => {
        if (!confirm('Bạn có chắc chắn DUYỆT báo giá này?')) return;
        setApproving(true);
        try {
            const res = await fetch(`/api/crm/quotes/${quoteId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'APPROVE', notes: 'Approved by Manager' })
            });
            if (res.ok) {
                alert("Đã duyệt thành công!");
                setApprovalStatus('APPROVED');
            } else {
                alert("Lỗi khi duyệt.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setApproving(false);
        }
    };

    const handleSendEmail = async () => {
        setSending(true);
        try {
            // Dynamic import to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default;

            // 1. Generate PDF
            const element = document.getElementById('quote-content');
            if (!element) throw new Error('Quote content not found');

            // @ts-ignore
            const worker = html2pdf().set({
                margin: 0,
                filename: `Bao_Gia_${quoteId}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            }).from(element).toPdf().get('pdf');

            const pdfBlob = await worker.then((pdf: any) => {
                return pdf.output('blob');
            });

            // 2. Prepare FormData
            const formData = new FormData();
            formData.append('to', emailData.to);
            formData.append('subject', emailData.subject);
            formData.append('htmlBody', emailData.body);
            formData.append('file', new File([pdfBlob], `Bao_Gia_${quoteId}.pdf`, { type: 'application/pdf' }));

            // 3. Send API
            const res = await fetch('/api/email/send', {
                method: 'POST',
                body: formData
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.error || 'Failed to send');

            alert(result.message || 'Email sent successfully!');
            setShowEmailDialog(false);

        } catch (error: any) {
            console.error(error);
            alert('Lỗi gửi email: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            {approvalStatus === 'PENDING_APPROVAL' && (
                <div style={{ width: '100%', padding: '10px', background: '#fff3cd', color: '#856404', textAlign: 'center', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ffeeba' }}>
                    ⚠️ Báo giá này vượt mức quy định và đang chờ Quản lý duyệt.
                </div>
            )}

            <div className="no-print" style={{
                width: '210mm',
                maxWidth: '100%',
                margin: '0 auto 20px auto', // Center and add bottom margin
                display: 'flex',
                justifyContent: 'flex-end', // Align buttons to right
                gap: '10px',
                padding: '10px',
                backgroundColor: '#f5f5f5', // Light gray background area
                borderRadius: '8px',
                flexWrap: 'wrap' // Allow wrapping on small screens
            }}>
                {approvalStatus === 'PENDING_APPROVAL' ? (
                    <button
                        onClick={handleApprove}
                        disabled={approving}
                        style={{
                            padding: '10px 20px',
                            background: '#fb8c00', // Orange for Approval
                            color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        {approving ? 'Đang xử lý...' : '✅ DUYỆT BÁO GIÁ (MANAGER)'}
                    </button>
                ) : (
                    <>
                        <button
                            onClick={handlePrint}
                            style={{
                                padding: '10px 20px',
                                background: '#1976d2',
                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            In Báo Giá
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            style={{
                                padding: '10px 20px',
                                background: '#2e7d32',
                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            {downloading ? 'Đang tải...' : 'Tải PDF'}
                        </button>
                        <button
                            onClick={handleOpenEmail}
                            style={{
                                padding: '10px 20px',
                                background: '#9c27b0', // Purple for Email
                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            Gửi Email
                        </button>
                        <button
                            onClick={() => router.push(`/dashboard/crm/quotes/${quoteId}/contract`)}
                            style={{
                                padding: '10px 20px',
                                background: '#ed6c02', // Orange for Action
                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            Soạn Hợp đồng
                        </button>
                        <button
                            onClick={async () => {
                                if (!confirm('Bạn có chắc chắn muốn Chốt Đơn này và chuyển sang Sản xuất?')) return;
                                try {
                                    const res = await fetch(`/api/crm/quotes/${quoteId}/convert`, { method: 'POST' });
                                    if (res.ok) {
                                        const data = await res.json();
                                        router.push(`/dashboard/orders/${data.orderId}/tech-specs`);
                                    } else {
                                        const err = await res.text();
                                        alert('Lỗi: ' + err);
                                    }
                                } catch (e) {
                                    alert('Có lỗi xảy ra');
                                }
                            }}
                            style={{
                                padding: '10px 20px',
                                background: '#d32f2f', // Red/Dark for Final Action
                                color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold', borderRadius: '4px',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            Chốt Đơn & In Lệnh SX
                        </button>
                    </>
                )}
            </div>

            {/* Email Dialog Simple Implementation using HTML Dialog or fixed div if MUI not fully robust here, 
                but let's try a simple fixed overlay for speed and guaranteed styling */}
            {showEmailDialog && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', padding: '20px', borderRadius: '8px',
                        width: '500px', maxWidth: '90%', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                    }}>
                        <h3 style={{ marginTop: 0 }}>Gửi Báo Giá qua Email</h3>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Người nhận:</label>
                            <input
                                type="email"
                                value={emailData.to}
                                onChange={e => setEmailData({ ...emailData, to: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                                placeholder="customer@example.com"
                            />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Tiêu đề:</label>
                            <input
                                type="text"
                                value={emailData.subject}
                                onChange={e => setEmailData({ ...emailData, subject: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '5px' }}>Nội dung:</label>
                            <textarea
                                value={emailData.body}
                                onChange={e => setEmailData({ ...emailData, body: e.target.value })}
                                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', minHeight: '100px' }}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                                onClick={() => setShowEmailDialog(false)}
                                style={{ padding: '8px 16px', background: '#ccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleSendEmail}
                                disabled={sending}
                                style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                                {sending ? 'Đang gửi...' : 'Gửi ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
