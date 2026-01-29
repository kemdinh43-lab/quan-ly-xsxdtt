"use client";

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete as DeleteIcon, Save as SaveIcon } from '@mui/icons-material';

export default function PricingSettingsPage() {
    const [threshold, setThreshold] = useState("50000000");
    const [prices, setPrices] = useState<any[]>([]);
    const [newPrice, setNewPrice] = useState({ name: '', marketPrice: '', supplier: '', code: '' });
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetch('/api/settings/approval-threshold').then(res => res.json()).then(data => setThreshold(data.value));
        fetchPrices();
    }, []);

    const fetchPrices = () => {
        fetch('/api/procurement/fabric-prices').then(res => res.json()).then(setPrices);
    };

    const handleSaveThreshold = async () => {
        await fetch('/api/settings/approval-threshold', {
            method: 'POST', body: JSON.stringify({ value: threshold })
        });
        alert("Đã lưu hạn mức duyệt!");
    };

    const handleCreatePrice = async () => {
        await fetch('/api/procurement/fabric-prices', {
            method: 'POST', body: JSON.stringify(newPrice)
        });
        setOpenDialog(false);
        setNewPrice({ name: '', marketPrice: '', supplier: '', code: '' });
        fetchPrices();
    };

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>Cấu hình Giá & Duyệt</Typography>

            {/* Threshold Section */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Hạn mức Duyệt Báo Giá</Typography>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        label="Hạn mức (VND)"
                        type="number"
                        value={threshold}
                        onChange={(e) => setThreshold(e.target.value)}
                        helperText="Báo giá vượt quá số tiền này sẽ cần Manager duyệt"
                    />
                    <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveThreshold}>Lưu</Button>
                </Box>
            </Paper>

            {/* Fabric Prices Section */}
            <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">Bảng Giá Vải Thị Trường</Typography>
                    <Button variant="outlined" onClick={() => setOpenDialog(true)}>Thêm mới</Button>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Vải</TableCell>
                            <TableCell>Giá (VND)</TableCell>
                            <TableCell>Nhà Cung Cấp</TableCell>
                            <TableCell>Cập nhật</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {prices.map(p => (
                            <TableRow key={p.id}>
                                <TableCell>{p.name}</TableCell>
                                <TableCell>{new Intl.NumberFormat('vi-VN').format(p.marketPrice)}</TableCell>
                                <TableCell>{p.supplier}</TableCell>
                                <TableCell>{new Date(p.updatedAt).toLocaleDateString('vi-VN')}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>

            {/* Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Thêm Giá Vải Mới</DialogTitle>
                <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 400 }}>
                    <TextField label="Tên Vải" fullWidth value={newPrice.name} onChange={(e) => setNewPrice({ ...newPrice, name: e.target.value })} />
                    <TextField label="Giá Thị Trường" type="number" fullWidth value={newPrice.marketPrice} onChange={(e) => setNewPrice({ ...newPrice, marketPrice: e.target.value })} />
                    <TextField label="Nhà Cung Cấp" fullWidth value={newPrice.supplier} onChange={(e) => setNewPrice({ ...newPrice, supplier: e.target.value })} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreatePrice}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
