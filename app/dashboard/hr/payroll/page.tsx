"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Button, TextField, Card, CardContent, Grid
} from '@mui/material';
import { Download as DownloadIcon, Print as PrintIcon } from '@mui/icons-material';
import { format } from 'date-fns';

export default function PayrollPage() {
    const [month, setMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [payroll, setPayroll] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPayroll();
    }, [month]);

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/hr/payroll?month=${month}`);
            const data = await res.json();
            setPayroll(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Bảng Lương (Payroll)
                </Typography>
                <TextField
                    type="month"
                    label="Tháng"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    sx={{ bgcolor: 'white' }}
                />
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: '#e3f2fd' }}>
                        <CardContent>
                            <Typography color="text.secondary">Tổng quỹ lương tháng</Typography>
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {formatCurrency(payroll.reduce((sum, p) => sum + p.totalSalary, 0))}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {loading ? (
                <Typography>Đang tính toán...</Typography>
            ) : (
                <TableContainer component={Paper} elevation={3}>
                    <Table>
                        <TableHead sx={{ bgcolor: '#1976D2' }}>
                            <TableRow>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Nhân viên</TableCell>
                                <TableCell sx={{ color: 'white' }}>Lương ngày</TableCell>
                                <TableCell sx={{ color: 'white' }} align="center">Ngày công</TableCell>
                                <TableCell sx={{ color: 'white' }} align="center">Phụ cấp</TableCell>
                                <TableCell sx={{ color: 'white' }} align="center">Đi muộn (phút)</TableCell>
                                <TableCell sx={{ color: 'white' }} align="center">OT (giờ)</TableCell>
                                <TableCell sx={{ color: 'white' }} align="center">Lương OT</TableCell>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem' }} align="right">THỰC LÃNH</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {payroll.map((p) => (
                                <TableRow key={p.id} hover>
                                    <TableCell>
                                        <Typography fontWeight="bold">{p.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{p.role}</Typography>
                                    </TableCell>
                                    <TableCell>{formatCurrency(p.dailyRate)}</TableCell>
                                    <TableCell align="center">
                                        <Chip label={`${p.workDays} ngày`} color="primary" variant="outlined" size="small" />
                                    </TableCell>
                                    <TableCell align="center">{formatCurrency(p.allowance)}</TableCell>
                                    <TableCell align="center" sx={{ color: p.lateMinutes > 0 ? 'error.main' : 'inherit' }}>
                                        {p.lateMinutes > 0 ? `${p.lateMinutes}'` : '-'}
                                    </TableCell>
                                    <TableCell align="center">
                                        {p.otHours > 0 ? (
                                            <Chip label={`${p.otHours}h`} color="warning" size="small" />
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell align="center" sx={{ color: 'warning.dark', fontWeight: 500 }}>
                                        {p.otPay > 0 ? formatCurrency(p.otPay) : '-'}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Typography fontWeight="bold" color="success.main" variant="h6">
                                            {formatCurrency(p.totalSalary)}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {payroll.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">Chưa có dữ liệu chấm công tháng này</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Box>
    );
}
