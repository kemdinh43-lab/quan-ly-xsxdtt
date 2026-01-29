"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    Card, CardContent, Chip, IconButton, Tooltip,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Select, MenuItem, FormControl, InputLabel, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    FilterList as FilterIcon,
    Phone as PhoneIcon,
    Email as EmailIcon,
    Edit as EditIcon,
    MoreVert as MoreIcon,
    AttachMoney as MoneyIcon,
    TrendingUp as TrendingUpIcon,
    People as PeopleIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function CRMDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState({ totalLeads: 0, activeCustomers: 0, totalRevenue: 0 });
    const [customers, setCustomers] = useState<any[]>([]);
    const [filter, setFilter] = useState({ search: '', type: 'ALL', status: 'ALL' });
    const [openEmailDialog, setOpenEmailDialog] = useState(false); // For manual email feature (retained)

    // Create Mode
    const [openCreate, setOpenCreate] = useState(false);
    const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', companyName: '', type: 'WHOLESALE', source: 'MARKET', email: '', address: '' });

    const fetchData = async () => {
        const query = new URLSearchParams(filter).toString();
        const res = await fetch(`/api/customers?${query}`);
        if (res.ok) {
            const data = await res.json();
            setCustomers(data.customers);
            setStats(data.metrics);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filter]);

    const handleCreate = async () => {
        const res = await fetch('/api/customers', {
            method: 'POST',
            body: JSON.stringify(newCustomer)
        });
        if (res.ok) {
            setOpenCreate(false);
            setNewCustomer({ name: '', phone: '', companyName: '', type: 'WHOLESALE', source: 'MARKET', email: '', address: '' });
            fetchData();
        } else {
            if (res.status === 409) alert("Số điện thoại này đã tồn tại!");
            else alert("Lỗi khi tạo khách hàng");
        }
    }

    // Helper to format currency
    const fmtMoney = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

    // Helper for Status Color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'LEAD': return 'warning';
            case 'CUSTOMER': return 'success';
            case 'BLACKLIST': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            {/* Header Metrics */}
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: '#1A237E' }}>
                Quản lý Quan hệ Khách hàng (CRM)
            </Typography>

            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: '#FFF3E0', borderLeft: '5px solid #FF9800' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2">KHÁCH TIỀM NĂNG (LEADS)</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.totalLeads}</Typography>
                                </Box>
                                <PeopleIcon sx={{ fontSize: 40, color: '#FF9800', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: '#E8F5E9', borderLeft: '5px solid #4CAF50' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2">KHÁCH HÀNG ACTIVE</Typography>
                                    <Typography variant="h4" fontWeight="bold">{stats.activeCustomers}</Typography>
                                </Box>
                                <TrendingUpIcon sx={{ fontSize: 40, color: '#4CAF50', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card sx={{ bgcolor: '#E3F2FD', borderLeft: '5px solid #2196F3' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Box>
                                    <Typography color="text.secondary" variant="subtitle2">TỔNG DOANH THU (LTV)</Typography>
                                    <Typography variant="h4" fontWeight="bold">{fmtMoney(stats.totalRevenue)}</Typography>
                                </Box>
                                <MoneyIcon sx={{ fontSize: 40, color: '#2196F3', opacity: 0.5 }} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Filter & Actions */}
            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            placeholder="Tìm tên, SĐT, Công ty..."
                            value={filter.search}
                            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
                            InputProps={{
                                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Loại Khách</InputLabel>
                            <Select
                                value={filter.type}
                                label="Loại Khách"
                                onChange={(e) => setFilter({ ...filter, type: e.target.value })}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="WHOLESALE">Khách Sỉ</MenuItem>
                                <MenuItem value="PROCESSING">Gia công</MenuItem>
                                <MenuItem value="UNIFORM">Đồng phục</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Trạng thái</InputLabel>
                            <Select
                                value={filter.status}
                                label="Trạng thái"
                                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                            >
                                <MenuItem value="ALL">Tất cả</MenuItem>
                                <MenuItem value="LEAD">Leads (Mới)</MenuItem>
                                <MenuItem value="CUSTOMER">Customer (Đã mua)</MenuItem>
                                <MenuItem value="BLACKLIST">Blacklist</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'right' }}>
                        <Button
                            variant="outlined"
                            startIcon={<MoneyIcon />}
                            sx={{ mr: 1 }}
                            onClick={() => router.push('/dashboard/crm/quotes')}
                        >
                            DS Báo Giá
                        </Button>
                        <Button
                            variant="outlined"
                            startIcon={<EmailIcon />}
                            sx={{ mr: 1 }}
                            onClick={() => router.push('/dashboard/crm/logs')} // We will separate logs to subpage or popup
                        >
                            Email Logs
                        </Button>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)}>
                            Thêm Khách
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Main Data Grid */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ bgcolor: '#F5F5F5' }}>
                        <TableRow>
                            <TableCell>THÔNG TIN KHÁCH HÀNG</TableCell>
                            <TableCell>LIÊN HỆ & ĐỊA CHỈ</TableCell>
                            <TableCell>PHÂN LOẠI</TableCell>
                            <TableCell>TRẠNG THÁI</TableCell>
                            <TableCell>DOANH THU (LTV)</TableCell>
                            <TableCell>TƯƠNG TÁC CUỐI</TableCell>
                            <TableCell align="right">HÀNH ĐỘNG</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {customers.map((c: any) => (
                            <TableRow key={c.id} hover>
                                <TableCell>
                                    <Typography fontWeight="bold" variant="body2">{c.name}</Typography>
                                    <Typography variant="caption" color="text.secondary">{c.companyName}</Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                        <PhoneIcon sx={{ fontSize: 14, mr: 0.5, color: 'action.active' }} />
                                        <Typography variant="caption">{c.phone}</Typography>
                                    </Box>
                                </TableCell>
                                <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                        <EmailIcon sx={{ fontSize: 14, mr: 0.5, color: 'action.active' }} />
                                        <Typography variant="caption">{c.email || "--"}</Typography>
                                    </Box>
                                    <Typography variant="caption" display="block" color="text.secondary">
                                        {c.address || "Chưa có địa chỉ"}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Chip label={c.type} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />
                                    <Chip label={c.source} size="small" color="default" sx={{ bgcolor: '#eee' }} />
                                </TableCell>
                                <TableCell>
                                    <Chip label={c.status} color={getStatusColor(c.status) as any} size="small" />
                                </TableCell>
                                <TableCell>
                                    <Typography fontWeight="bold" color="primary">{fmtMoney(c.totalRevenue)}</Typography>
                                    <Typography variant="caption">{c._count?.orders || 0} đơn hàng</Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2">{new Date(c.lastInteraction).toLocaleDateString('vi-VN')}</Typography>
                                    {(new Date().getTime() - new Date(c.lastInteraction).getTime()) > 30 * 24 * 60 * 60 * 1000 && (
                                        <Typography variant="caption" color="error">⚠ &gt;30 ngày chưa chăm</Typography>
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="Tạo báo giá">
                                        <IconButton size="small" color="primary" onClick={() => router.push(`/dashboard/crm/quotes/create?customerId=${c.id}`)}><AddIcon /></IconButton>
                                    </Tooltip>
                                    <Tooltip title="Gửi Email">
                                        <IconButton size="small"><EmailIcon /></IconButton>
                                    </Tooltip>
                                    <IconButton size="small"><MoreIcon /></IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {customers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                                    <Typography color="text.secondary">Chưa có dữ liệu khách hàng</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create Dialog */}
            <Dialog open={openCreate} onClose={() => setOpenCreate(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Thêm Khách hàng Mới</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        <TextField
                            label="Tên người liên hệ (Bắt buộc)"
                            fullWidth
                            value={newCustomer.name}
                            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        />
                        <TextField
                            label="Số điện thoại (Duy nhất)"
                            fullWidth
                            required
                            value={newCustomer.phone}
                            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                        />
                        <TextField
                            label="Tên Công ty / Shop"
                            fullWidth
                            value={newCustomer.companyName}
                            onChange={(e) => setNewCustomer({ ...newCustomer, companyName: e.target.value })}
                        />
                        <TextField
                            label="Email"
                            fullWidth
                            value={newCustomer.email}
                            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                        />
                        <TextField
                            label="Địa chỉ"
                            fullWidth
                            value={newCustomer.address}
                            onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Loại</InputLabel>
                                    <Select
                                        label="Loại"
                                        value={newCustomer.type}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, type: e.target.value })}
                                    >
                                        <MenuItem value="WHOLESALE">Sỉ</MenuItem>
                                        <MenuItem value="PROCESSING">Gia công</MenuItem>
                                        <MenuItem value="UNIFORM">Đồng phục</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <FormControl fullWidth>
                                    <InputLabel>Nguồn</InputLabel>
                                    <Select
                                        label="Nguồn"
                                        value={newCustomer.source}
                                        onChange={(e) => setNewCustomer({ ...newCustomer, source: e.target.value })}
                                    >
                                        <MenuItem value="MARKET">Đi thị trường</MenuItem>
                                        <MenuItem value="FACEBOOK">Facebook Ads</MenuItem>
                                        <MenuItem value="REFERRAL">Giới thiệu</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Hủy</Button>
                    <Button variant="contained" onClick={handleCreate} disabled={!newCustomer.name || !newCustomer.phone}>Lưu</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
