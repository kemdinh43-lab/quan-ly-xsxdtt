"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function ReceiptListPage() {
    const [receipts, setReceipts] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        fetch('/api/warehouse/receipts')
            .then(res => res.json())
            .then(setReceipts)
            .catch(console.error);
    }, []);

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Phiếu Nhập Kho</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => router.push('/dashboard/warehouse/receipts/new')}
                >
                    Nhập Kho Mới
                </Button>
            </Box>

            <Paper>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Mã Phiếu</TableCell>
                            <TableCell>Từ PO</TableCell>
                            <TableCell>Ngày nhập</TableCell>
                            <TableCell>Người nhập</TableCell>
                            <TableCell>Số mặt hàng</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {receipts.map((r) => (
                            <TableRow key={r.id}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{r.code}</TableCell>
                                <TableCell>{r.purchaseOrder?.code || 'Trực tiếp'}</TableCell>
                                <TableCell>{format(new Date(r.date), 'dd/MM/yyyy HH:mm')}</TableCell>
                                <TableCell>{r.performer}</TableCell>
                                <TableCell>{r.items?.length || 0}</TableCell>
                            </TableRow>
                        ))}
                        {receipts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Chưa có phiếu nhập kho nào.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
}
