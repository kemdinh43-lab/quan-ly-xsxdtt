"use client";
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableHead, TableRow, Button, IconButton, Chip, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Print as PrintIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function QuoteListPage() {
    const router = useRouter();
    const [quotes, setQuotes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQuotes();
    }, []);

    const fetchQuotes = async () => {
        try {
            const res = await fetch('/api/crm/quotes');
            if (res.ok) {
                const data = await res.json();
                setQuotes(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Quản lý Báo Giá</Typography>
                <Link href="/dashboard/crm/quotes/create" passHref>
                    <Button variant="contained" startIcon={<AddIcon />}>
                        Tạo Báo Giá Mới
                    </Button>
                </Link>
            </Box>

            <Paper sx={{ p: 2 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={3}><CircularProgress /></Box>
                ) : (
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Mã BG</TableCell>
                                <TableCell>Khách Hàng</TableCell>
                                <TableCell>Ngày Tạo</TableCell>
                                <TableCell>Tổng Tiền (Ước tính)</TableCell>
                                <TableCell>Trạng Thái</TableCell>
                                <TableCell>Hành Động</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {quotes.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">Chưa có báo giá nào</TableCell>
                                </TableRow>
                            ) : quotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell sx={{ fontWeight: 'bold' }}>{quote.code}</TableCell>
                                    <TableCell>{quote.customerName}</TableCell>
                                    <TableCell>{new Date(quote.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                    <TableCell>
                                        {quote.totalAmount > 0
                                            ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(quote.totalAmount)
                                            : 'Liên hệ'}
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={quote.status}
                                            color={quote.status === 'ACCEPTED' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Link href={`/dashboard/crm/quotes/${quote.id}/print`} passHref>
                                            <IconButton color="primary" title="Xem / In">
                                                <PrintIcon />
                                            </IconButton>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </Paper>
        </Box>
    );
}
