"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Grid
} from '@mui/material';
import {
    Add as AddIcon,
    LocalShipping as ExportIcon,
    Inventory as InventoryIcon
} from '@mui/icons-material';

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]); // For linking import to order

    // Dialog States
    const [openImport, setOpenImport] = useState(false);
    const [openExport, setOpenExport] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    // Form States
    const [importData, setImportData] = useState({
        code: '',
        name: '',
        size: '',
        color: '',
        quantity: 0,
        orderId: ''
    });

    const [exportData, setExportData] = useState({
        quantity: 0,
        note: ''
    });

    const fetchData = async () => {
        const res = await fetch('/api/products');
        const data = await res.json();
        setProducts(data);
        setLoading(false);

        const resOrders = await fetch('/api/orders');
        const dataOrders = await resOrders.json();
        setOrders(dataOrders);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleImport = async () => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(importData)
            });
            if (res.ok) {
                setOpenImport(false);
                setImportData({ code: '', name: '', size: '', color: '', quantity: 0, orderId: '' });
                fetchData();
            } else {
                alert('Lỗi nhập kho');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleExport = async () => {
        if (!selectedProduct) return;
        try {
            const res = await fetch('/api/products/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: exportData.quantity,
                    note: exportData.note
                })
            });
            if (res.ok) {
                setOpenExport(false);
                setExportData({ quantity: 0, note: '' });
                fetchData();
            } else {
                const txt = await res.text();
                alert('Lỗi xuất kho: ' + txt);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openExportDialog = (product: any) => {
        setSelectedProduct(product);
        setOpenExport(true);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Kho Thành Phẩm</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenImport(true)}
                >
                    Nhập Kho
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.light', '& th': { color: 'primary.contrastText' } }}>
                        <TableRow>
                            <TableCell>Mã SP</TableCell>
                            <TableCell>Tên sản phẩm</TableCell>
                            <TableCell>Thuộc Đơn hàng</TableCell>
                            <TableCell>Màu / Size</TableCell>
                            <TableCell align="right">Tồn kho</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {products.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 'bold' }}>{row.code}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>
                                    {row.order ? (
                                        <Chip label={row.order.code} size="small" variant="outlined" />
                                    ) : '-'}
                                </TableCell>
                                <TableCell>{row.color} / {row.size}</TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight="bold" color={row.quantity > 0 ? 'success.main' : 'error.main'}>
                                        {row.quantity}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Button
                                        size="small"
                                        color="warning"
                                        startIcon={<ExportIcon />}
                                        onClick={() => openExportDialog(row)}
                                        disabled={row.quantity <= 0}
                                    >
                                        Xuất
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {products.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                    Kho thành phẩm trống.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Import Dialog */}
            <Dialog open={openImport} onClose={() => setOpenImport(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nhập kho Thành phẩm</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Mã Sản phẩm" fullWidth
                            value={importData.code}
                            onChange={(e) => setImportData({ ...importData, code: e.target.value })}
                        />
                        <TextField
                            label="Tên Sản phẩm" fullWidth
                            value={importData.name}
                            onChange={(e) => setImportData({ ...importData, name: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Màu sắc" fullWidth
                                    value={importData.color}
                                    onChange={(e) => setImportData({ ...importData, color: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Size" fullWidth
                                    value={importData.size}
                                    onChange={(e) => setImportData({ ...importData, size: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                        <TextField
                            label="Số lượng nhập" type="number" fullWidth
                            value={importData.quantity}
                            onChange={(e) => setImportData({ ...importData, quantity: parseInt(e.target.value) })}
                        />
                        <TextField
                            select label="Thuộc Đơn hàng (Tuỳ chọn)" fullWidth
                            value={importData.orderId}
                            onChange={(e) => setImportData({ ...importData, orderId: e.target.value })}
                        >
                            <MenuItem value="">-- Không --</MenuItem>
                            {orders.map(o => (
                                <MenuItem key={o.id} value={o.id}>{o.code} - {o.customerName}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenImport(false)}>Hủy</Button>
                    <Button onClick={handleImport} variant="contained">Nhập kho</Button>
                </DialogActions>
            </Dialog>

            {/* Export Dialog */}
            <Dialog open={openExport} onClose={() => setOpenExport(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Xuất kho Giao hàng</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="body2">
                            Sản phẩm: <strong>{selectedProduct?.name}</strong> <br />
                            Tồn hiện tại: <strong>{selectedProduct?.quantity}</strong>
                        </Typography>
                        <TextField
                            label="Số lượng xuất" type="number" fullWidth
                            autoFocus
                            value={exportData.quantity}
                            onChange={(e) => setExportData({ ...exportData, quantity: parseInt(e.target.value) })}
                        />
                        <TextField
                            label="Ghi chú (Khách hàng/Lý do)" fullWidth
                            value={exportData.note}
                            onChange={(e) => setExportData({ ...exportData, note: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenExport(false)}>Hủy</Button>
                    <Button onClick={handleExport} variant="contained" color="warning">Xuất kho</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
