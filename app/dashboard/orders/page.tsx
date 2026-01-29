"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Grid, MenuItem, Collapse
} from '@mui/material';
import {
    Add as AddIcon,
    KeyboardArrowDown as KeyboardArrowDownIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';
import { format } from 'date-fns';

// Helper component for Row with Collapse details
function OrderRow({ row }: { row: any }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
                <TableCell>
                    <IconButton
                        aria-label="expand row"
                        size="small"
                        onClick={() => setOpen(!open)}
                    >
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                    {row.code}
                </TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell>
                    <Chip
                        label={row.status}
                        color={row.status === 'QUOTE' ? 'default' : row.status === 'CONFIRMED' ? 'info' : 'success'}
                        size="small"
                    />
                </TableCell>
                <TableCell align="right">{row.items.reduce((acc: number, item: any) => acc + item.quantity, 0)}</TableCell>
                <TableCell align="right">
                    {row.deadline ? format(new Date(row.deadline), 'dd/MM/yyyy') : '-'}
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 1 }}>
                            <Typography variant="h6" gutterBottom component="div" sx={{ fontSize: '0.9rem', fontWeight: 'bold' }}>
                                Chi tiết sản phẩm
                            </Typography>
                            <Table size="small" aria-label="purchases">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Tên sản phẩm</TableCell>
                                        <TableCell>Màu</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell align="right">Số lượng</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {row.items.map((item: any) => (
                                        <TableRow key={item.id}>
                                            <TableCell component="th" scope="row">
                                                {item.name}
                                            </TableCell>
                                            <TableCell>{item.color}</TableCell>
                                            <TableCell>{item.size}</TableCell>
                                            <TableCell align="right">
                                                {item.quantity}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </>
    );
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);

    // New Order State
    const [newOrder, setNewOrder] = useState({
        code: '',
        customerName: '',
        contactInfo: '',
        deadline: '',
        items: [] as any[]
    });

    // Temp Item State for adding to order
    const [tempItem, setTempItem] = useState({
        name: '',
        color: '',
        size: '',
        quantity: 0
    });

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleAddItem = () => {
        if (!tempItem.name || tempItem.quantity <= 0) return;
        setNewOrder({
            ...newOrder,
            items: [...newOrder.items, { ...tempItem }]
        });
        setTempItem({ name: '', color: '', size: '', quantity: 0 });
    };

    const handleCreateOrder = async () => {
        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOrder)
            });
            if (res.ok) {
                fetchOrders();
                setOpenDialog(false);
                setNewOrder({ code: '', customerName: '', contactInfo: '', deadline: '', items: [] });
            }
        } catch (error) {
            alert('Lỗi khi tạo đơn hàng');
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Quản lý Đơn hàng B2B</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ bgcolor: 'secondary.main' }}
                >
                    Tạo Đơn Hàng
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table aria-label="collapsible table">
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell />
                            <TableCell>Mã ĐH</TableCell>
                            <TableCell>Khách hàng</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell align="right">Tổng SL</TableCell>
                            <TableCell align="right">Ngày giao</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orders.map((row) => (
                            <OrderRow key={row.id} row={row} />
                        ))}
                        {orders.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    Chưa có đơn hàng nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>Tạo Đơn Hàng Mới</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Mã Đơn hàng"
                                    fullWidth
                                    value={newOrder.code}
                                    onChange={(e) => setNewOrder({ ...newOrder, code: e.target.value })}
                                    placeholder="DH-2024-001"
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Khách hàng"
                                    fullWidth
                                    value={newOrder.customerName}
                                    onChange={(e) => setNewOrder({ ...newOrder, customerName: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Thông tin liên hệ"
                                    fullWidth
                                    value={newOrder.contactInfo}
                                    onChange={(e) => setNewOrder({ ...newOrder, contactInfo: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Ngày giao hàng"
                                    type="date"
                                    fullWidth
                                    InputLabelProps={{ shrink: true }}
                                    value={newOrder.deadline}
                                    onChange={(e) => setNewOrder({ ...newOrder, deadline: e.target.value })}
                                />
                            </Grid>
                        </Grid>

                        <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold' }}>Thêm sản phẩm vào đơn</Typography>

                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 4 }}>
                                    <TextField
                                        label="Tên sản phẩm" size="small" fullWidth
                                        value={tempItem.name}
                                        onChange={(e) => setTempItem({ ...tempItem, name: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 3 }}>
                                    <TextField
                                        label="Màu" size="small" fullWidth
                                        value={tempItem.color}
                                        onChange={(e) => setTempItem({ ...tempItem, color: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 2 }}>
                                    <TextField
                                        label="Size" size="small" fullWidth
                                        value={tempItem.size}
                                        onChange={(e) => setTempItem({ ...tempItem, size: e.target.value })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 2 }}>
                                    <TextField
                                        label="SL" type="number" size="small" fullWidth
                                        value={tempItem.quantity}
                                        onChange={(e) => setTempItem({ ...tempItem, quantity: parseInt(e.target.value) })}
                                    />
                                </Grid>
                                <Grid size={{ xs: 1 }}>
                                    <IconButton color="primary" onClick={handleAddItem}>
                                        <AddIcon />
                                    </IconButton>
                                </Grid>
                            </Grid>
                        </Paper>

                        {/* List of items added */}
                        {newOrder.items.length > 0 && (
                            <Table size="small">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Sản phẩm</TableCell>
                                        <TableCell>Màu</TableCell>
                                        <TableCell>Size</TableCell>
                                        <TableCell align="right">SL</TableCell>
                                        <TableCell></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {newOrder.items.map((item, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell>{item.color}</TableCell>
                                            <TableCell>{item.size}</TableCell>
                                            <TableCell align="right">{item.quantity}</TableCell>
                                            <TableCell>
                                                <IconButton size="small" color="error" onClick={() => {
                                                    const newItems = [...newOrder.items];
                                                    newItems.splice(index, 1);
                                                    setNewOrder({ ...newOrder, items: newItems });
                                                }}>
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreateOrder} variant="contained" disabled={!newOrder.code || !newOrder.customerName || newOrder.items.length === 0}>
                        Tạo Đơn Hàng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
