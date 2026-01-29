"use client";

import { useEffect, useState } from 'react';
import {
    Box, Typography, Paper, Button, Tabs, Tab, Table, TableBody, TableCell, TableHead, TableRow,
    Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    FormControl, InputLabel, Select, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Refresh as RefreshIcon, Search as SearchIcon } from '@mui/icons-material';

export default function ProcurementPage() {
    const [tab, setTab] = useState(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dialog State
    const [openDialog, setOpenDialog] = useState(false);
    const [newPR, setNewPR] = useState({
        materialName: '', quantity: '', unit: 'm', supplierId: '', orderId: ''
    });

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/procurement/requests');
            const data = await res.json();
            setRequests(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleCreatePR = async () => {
        if (!newPR.materialName || !newPR.quantity) return alert("Vui lòng nhập tên và số lượng!");

        try {
            const res = await fetch('/api/procurement/requests', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPR)
            });

            if (res.ok) {
                fetchRequests();
                setOpenDialog(false);
                setNewPR({ materialName: '', quantity: '', unit: 'm', supplierId: '', orderId: '' });
            } else {
                alert("Lỗi khi tạo yêu cầu");
            }
        } catch (e) {
            console.error(e);
            alert("Có lỗi xảy ra");
        }
    };

    // Filter Logic
    const pendingRequests = requests.filter(r => r.status === 'PENDING');
    const orderedRequests = requests.filter(r => r.status !== 'PENDING');

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">Mua hàng & Vật tư</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Tạo Yêu cầu Mua
                </Button>
            </Box>

            <Paper sx={{ mb: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tab label={`Nhu cầu vật tư (${pendingRequests.length})`} />
                    <Tab label="Lịch sử Mua hàng / PO" />
                </Tabs>

                <Box p={3}>
                    {tab === 0 && (
                        <>
                            <Box display="flex" gap={2} mb={2}>
                                <Button startIcon={<RefreshIcon />} onClick={fetchRequests}>Làm mới</Button>
                            </Box>

                            {loading ? <CircularProgress /> : (
                                <Table>
                                    <TableHead component={Paper} sx={{ bgcolor: '#f5f5f5' }}>
                                        <TableRow>
                                            <TableCell>Tên Vật tư / Vải</TableCell>
                                            <TableCell width="120">Số lượng</TableCell>
                                            <TableCell width="200">Đơn hàng liên quan</TableCell>
                                            <TableCell width="150">Nhà cung cấp</TableCell>
                                            <TableCell width="120">Trạng thái</TableCell>
                                            <TableCell width="150">Hành động</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {pendingRequests.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">Không có yêu cầu nào mới.</TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingRequests.map((r) => (
                                                <TableRow key={r.id} hover>
                                                    <TableCell component="th" scope="row">
                                                        <Typography fontWeight="bold" variant="body2">{r.materialName}</Typography>
                                                        <Typography variant="caption" color="text.secondary">{r.sku || "N/A"}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography fontWeight="bold" color="error">
                                                            {new Intl.NumberFormat('vi-VN').format(r.quantity)} {r.unit}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.order ? (
                                                            <>
                                                                <Chip
                                                                    label={r.order.id.slice(0, 8)}
                                                                    size="small"
                                                                    color="primary"
                                                                    variant="outlined"
                                                                    component="a"
                                                                    href={`/dashboard/orders/${r.order.id}`}
                                                                    clickable
                                                                />
                                                                <Typography variant="caption" display="block" noWrap>
                                                                    {r.order.customerName}
                                                                </Typography>
                                                            </>
                                                        ) : (
                                                            <Chip label="Bổ sung kho" size="small" variant="outlined" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        {r.supplier?.name || "--"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip label="Chờ mua" color="warning" size="small" />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small" variant="contained" color="success">Tạo PO</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            )}
                        </>
                    )}

                    {tab === 1 && (
                        <Typography color="text.secondary" align="center" py={5}>
                            Chức năng quản lý Đơn Mua Hàng (PO) đang được phát triển.
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Create Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Tạo Yêu cầu Mua vật tư</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            label="Tên Vật tư / Vải"
                            fullWidth
                            value={newPR.materialName}
                            onChange={(e) => setNewPR({ ...newPR, materialName: e.target.value })}
                        />
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Số lượng"
                                type="number"
                                fullWidth
                                value={newPR.quantity}
                                onChange={(e) => setNewPR({ ...newPR, quantity: e.target.value })}
                            />
                            <TextField
                                label="Đơn vị"
                                value={newPR.unit}
                                onChange={(e) => setNewPR({ ...newPR, unit: e.target.value })}
                                sx={{ width: 100 }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreatePR}>Tạo Yêu cầu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
