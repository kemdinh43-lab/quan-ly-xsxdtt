"use client";

import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { ArrowBack } from "@mui/icons-material";

export default function ProductionTicketPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [id]);

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div style={{
            fontFamily: '"Times New Roman", Times, serif',
            backgroundColor: '#525659',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '20px'
        }}>
            {/* Toolbar */}
            <div className="no-print" style={{
                width: '210mm',
                maxWidth: '100%',
                margin: '0 auto 20px auto',
                display: 'flex',
                justifyContent: 'space-between',
                gap: '10px',
                padding: '10px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        padding: '10px 20px',
                        background: '#f5f5f5',
                        color: '#333',
                        border: '1px solid #ddd',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <ArrowBack fontSize="small" /> Quay lại
                </button>
                <button
                    onClick={() => window.print()}
                    style={{
                        padding: '10px 20px',
                        background: '#1976d2',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        borderRadius: '4px'
                    }}
                >
                    In Lệnh Sản Xuất
                </button>
            </div>

            <div id="production-ticket" style={{
                width: '210mm',
                minHeight: '297mm',
                padding: '20mm',
                backgroundColor: 'white',
                color: 'black',
                boxShadow: '0 0 10px rgba(0,0,0,0.3)',
                boxSizing: 'border-box'
            }}>
                <style>{`
                    @media print {
                        body { background: white; -webkit-print-color-adjust: exact; }
                        .no-print { display: none !important; }
                        @page { size: A4; margin: 20mm; }
                    }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid black; padding: 10px; text-align: left; }
                    th { text-align: center; background-color: #eee; }
                `}</style>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0 }}>XƯỞNG MAY DƯƠNG THÀNH TÍN</h2>
                    <p style={{ margin: '5px 0' }}>Đc: Khu Gia Đình Quân Nhân, Bộ Chỉ Huy Quân Sự, TP Đà Nẵng</p>
                    <h1 style={{ marginTop: '20px', fontSize: '24pt', textTransform: 'uppercase' }}>LỆNH SẢN XUẤT</h1>
                    <p><strong>Mã Đơn: {order.code}</strong></p>
                </div>

                <div style={{ marginBottom: '20px', fontSize: '13pt' }}>
                    <p><strong>Khách hàng:</strong> {order.customerName}</p>
                    <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                    <p><strong>Ngày giao (Deadline):</strong> {order.deadline ? new Date(order.deadline).toLocaleDateString('vi-VN') : '...'}</p>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>STT</th>
                            <th style={{ width: '25%' }}>Tên Sản Phẩm</th>
                            <th style={{ width: '40%' }}>YÊU CẦU KỸ THUẬT<br /><span style={{ fontSize: '10pt', fontWeight: 'normal' }}>(Chất liệu, Cổ áo, May đo)</span></th>
                            <th style={{ width: '60px' }}>ĐVT</th>
                            <th style={{ width: '60px' }}>Số Lượng</th>
                            <th>Ghi chú thêm</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map((item: any, index: number) => (
                            <tr key={item.id}>
                                <td style={{ textAlign: 'center' }}>{index + 1}</td>
                                <td>
                                    <div style={{ fontWeight: 'bold', fontSize: '14pt' }}>{item.name}</div>
                                    <div style={{ marginTop: '5px' }}>Size: <strong>{item.size}</strong></div>
                                    {item.color && <div>Màu: <strong>{item.color}</strong></div>}
                                </td>
                                <td style={{ verticalAlign: 'top' }}>
                                    {/* TECHNICAL SPECS */}
                                    {item.note ? (
                                        <div style={{ whiteSpace: 'pre-line', fontSize: '13pt', lineHeight: '1.4' }}>
                                            {item.note}
                                        </div>
                                    ) : (
                                        <div style={{ color: '#aaa', fontStyle: 'italic' }}>
                                            (Chưa có thông tin kỹ thuật)
                                            <br />
                                            ..................................................
                                            <br />
                                            ..................................................
                                        </div>
                                    )}
                                </td>
                                <td style={{ textAlign: 'center' }}>Cái</td>
                                <td style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '16pt' }}>{item.quantity}</td>
                                <td></td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ marginTop: '40px', display: 'flex' }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>NGƯỜI LẬP PHIẾU</p>
                        <br /><br /><br />
                    </div>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                        <p style={{ fontWeight: 'bold' }}>TỔ TRƯỞNG SẢN XUẤT</p>
                        <br /><br /><br />
                    </div>
                </div>
            </div>
        </div>
    );
}
