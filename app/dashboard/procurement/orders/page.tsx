"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, Chip, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function PurchaseOrderPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/procurement/orders')
            .then(res => res.json())
            .then(setOrders)
            .catch(console.error);
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SENT': return 'info';
            case 'PARTIAL': return 'warning';
            case 'COMPLETED': return 'success';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Quản lý Đơn Mua Hàng (PO)</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/dashboard/procurement/orders/create')}
                >
                    Tạo PO Mới
                </Button>
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã PO</TableCell>
                            <TableCell>Nhà cung cấp</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Tổng tiền</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((po) => (
                            <TableRow key={po.id}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{po.code}</TableCell>
                                <TableCell>{po.supplier?.name}</TableCell>
                                <TableCell>{format(new Date(po.createdAt), 'dd/MM/yyyy')}</TableCell>
                                <TableCell>{po.totalAmount?.toLocaleString()} đ</TableCell>
                                <TableCell>
                                    <Chip
                                        label={po.status}
                                        color={getStatusColor(po.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell align="right">
                                    <IconButton color="primary" onClick={() => window.print()}>
                                        <PrintIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {orders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Chưa có đơn hàng nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}
