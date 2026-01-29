"use client";
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Tabs, Tab, Button, Table, TableBody, TableCell, TableHead, TableRow, Chip,
    Dialog, DialogTitle, DialogContent, TextField, DialogActions, Select, MenuItem, InputLabel, FormControl
} from '@mui/material';
import { Add as AddIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import { useSession } from 'next-auth/react';

export default function RequestPage() {
    const { data: session } = useSession();
    const [tab, setTab] = useState(0);
    const [requests, setRequests] = useState<any[]>([]);
    const [open, setOpen] = useState(false);

    // Form
    const [formData, setFormData] = useState({
        type: 'LEAVE',
        reason: '',
        date: new Date().toISOString().split('T')[0],
        isPaid: true
    });

    const fetchRequests = () => {
        fetch('/api/hr/requests')
            .then(res => res.json())
            .then(data => setRequests(data));
    };

    useEffect(() => { fetchRequests(); }, []);

    const handleSubmit = async () => {
        await fetch('/api/hr/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        setOpen(false);
        fetchRequests();
    };

    const handleApprove = async (id: string, status: string) => {
        await fetch('/api/hr/requests', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status })
        });
        fetchRequests();
    };

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'MANAGER';

    // Filter
    const myRequests = requests.filter((r: any) => r.userId === session?.user?.id);
    const pendingRequests = requests.filter((r: any) => r.status === 'PENDING');

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">Quản lý Đơn từ (Quy trình Duyệt)</Typography>

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label="Đơn của tôi" />
                {isAdmin && <Tab label={`Cần duyệt (${pendingRequests.length})`} />}
            </Tabs>

            {/* MY REQUESTS */}
            {tab === 0 && (
                <Box>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ mb: 2 }}>
                        Tạo Đơn Mới
                    </Button>
                    <RequestTable data={myRequests} />
                </Box>
            )}

            {/* APPROVALS */}
            {tab === 1 && isAdmin && (
                <Box>
                    <RequestTable data={pendingRequests} isAdmin={true} onApprove={handleApprove} />
                </Box>
            )}

            {/* CREATE DIALOG */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>Tạo Đơn Mới</DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2, mt: 1 }}>
                        <InputLabel>Loại đơn</InputLabel>
                        <Select
                            value={formData.type} label="Loại đơn"
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <MenuItem value="LEAVE">Xin nghỉ phép (Ốm/Việc riêng)</MenuItem>
                            <MenuItem value="OT">Đăng ký Tăng ca</MenuItem>
                            <MenuItem value="EXPLANATION">Giải trình chấm công</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        fullWidth type="date" label="Ngày" InputLabelProps={{ shrink: true }} sx={{ mb: 2 }}
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                    <TextField
                        fullWidth label="Lý do" multiline rows={3} sx={{ mb: 2 }}
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleSubmit}>Gửi Đơn</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

function RequestTable({ data, isAdmin, onApprove }: { data: any[], isAdmin?: boolean, onApprove?: (id: string, s: string) => void }) {
    if (data.length === 0) return <Typography>Không có dữ liệu.</Typography>;

    return (
        <Paper>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Ngày tạo</TableCell>
                        <TableCell>Người gửi</TableCell>
                        <TableCell>Loại</TableCell>
                        <TableCell>Lý do</TableCell>
                        <TableCell>Ngày xin nghỉ/OT</TableCell>
                        <TableCell>Trạng thái</TableCell>
                        {isAdmin && <TableCell>Hành động</TableCell>}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell>{new Date(r.createdAt).toLocaleDateString()}</TableCell>
                            <TableCell>{r.user.name}</TableCell>
                            <TableCell>
                                <Chip size="small" label={r.type === 'LEAVE' ? 'Nghỉ phép' : r.type} color={r.type === 'LEAVE' ? 'warning' : 'info'} />
                            </TableCell>
                            <TableCell>{r.reason}</TableCell>
                            <TableCell>{new Date(r.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                                <Chip
                                    size="small"
                                    label={r.status === 'APPROVED' ? 'Đã duyệt' : (r.status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt')}
                                    color={r.status === 'APPROVED' ? 'success' : (r.status === 'REJECTED' ? 'error' : 'default')}
                                />
                            </TableCell>
                            {isAdmin && r.status === 'PENDING' && onApprove && (
                                <TableCell>
                                    <Button size="small" color="success" onClick={() => onApprove(r.id, 'APPROVED')}><CheckIcon /></Button>
                                    <Button size="small" color="error" onClick={() => onApprove(r.id, 'REJECTED')}><CloseIcon /></Button>
                                </TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Paper>
    );
}
