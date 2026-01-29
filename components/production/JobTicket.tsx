import React from 'react';
import { Box, Typography, Divider, Grid } from '@mui/material';

interface JobTicketProps {
    plan: {
        id: string;
        startDate: string;
        order: {
            code: string;
            customerName: string;
            items: any[];
        };
    };
    qrDataUrl: string;
}

export const JobTicket = React.forwardRef<HTMLDivElement, JobTicketProps>(({ plan, qrDataUrl }, ref) => {
    return (
        <Box
            ref={ref}
            sx={{
                width: '100mm', // Standard ticket width
                height: '150mm',
                border: '1px dashed black',
                p: 3,
                bgcolor: 'white',
                fontFamily: 'monospace',
                pageBreakAfter: 'always',
                '@media print': {
                    border: 'none',
                }
            }}
        >
            <Typography variant="h5" align="center" fontWeight="bold" gutterBottom>
                LỆNH SẢN XUẤT
            </Typography>
            <Typography variant="body1" align="center">
                Mã Lệnh: {plan.id.slice(-8).toUpperCase()}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="body2"><strong>Đơn hàng:</strong> {plan.order.code}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="body2"><strong>Khách hàng:</strong> {plan.order.customerName}</Typography>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <Typography variant="body2"><strong>Ngày bắt đầu:</strong> {new Date(plan.startDate).toLocaleDateString()}</Typography>
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code" style={{ width: '120px', height: '120px' }} />
            </Box>
            <Typography variant="caption" align="center" display="block">
                Quét mã để cập nhật tiến độ
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight="bold">Chi tiết sản phẩm:</Typography>
            <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                {plan.order.items.map((item: any, idx: number) => (
                    <li key={idx}>
                        <Typography variant="body2">
                            {item.name} - {item.color} - Size {item.size}: <strong>{item.quantity}</strong>
                        </Typography>
                    </li>
                ))}
            </Box>
        </Box>
    );
});

JobTicket.displayName = "JobTicket";
