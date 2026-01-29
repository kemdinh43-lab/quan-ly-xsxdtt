"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
    Grid, Tooltip
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    QrCode as QrCodeIcon,
    Print as PrintIcon
} from '@mui/icons-material';
import QRCode from 'qrcode';

const ROLES = [
    { value: 'ADMIN', label: 'Quản trị viên (Admin)' },
    { value: 'MANAGER', label: 'Quản lý (Manager)' },
    { value: 'WAREHOUSE', label: 'Kho (Warehouse)' },
    { value: 'SALES', label: 'Kinh doanh (Sales)' },
    { value: 'QC', label: 'KCS (Quality Control)' },
];

export default function UsersPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [editUser, setEditUser] = useState<any>(null); // If null -> Create Mode
    const [qrDialog, setQrDialog] = useState<any>(null); // For QR Print
    const [qrImage, setQrImage] = useState("");

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        employeeCode: '',
        password: '',
        role: 'WAREHOUSE',
        dailyRate: 0,
        allowance: 0,
        otRate: 1.5
    });

    const fetchData = async () => {
        const res = await fetch('/api/users');
        const data = await res.json();
        setUsers(data);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenCreate = () => {
        setEditUser(null);
        setFormData({ name: '', email: '', employeeCode: '', password: '123devpassword', role: 'WAREHOUSE', dailyRate: 0, allowance: 0, otRate: 1.5 });
        setOpenDialog(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditUser(user);
        setFormData({
            name: user.name,
            email: user.email,
            employeeCode: user.employeeCode || '',
            password: '',
            role: user.role,
            dailyRate: user.dailyRate || 0,
            allowance: user.allowance || 0,
            otRate: user.otRate || 1.5
        });
        setOpenDialog(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) return;
        await fetch(`/api/users/${id}`, { method: 'DELETE' });
        fetchData();
    };

    const generateCodeFromName = (name: string) => {
        // Simple logic: Initials + Random 3 digits. Ex: "Nguyen Van A" -> "NVA683"
        const initials = name.match(/\b\w/g)?.join('').toUpperCase() || "NV";
        const random = Math.floor(100 + Math.random() * 900);
        return `${initials}${random}`;
    };

    const handleSubmit = async () => {
        let finalCode = formData.employeeCode;
        if (!finalCode && formData.name) {
            finalCode = generateCodeFromName(formData.name);
        }

        const payload = {
            name: formData.name,
            role: formData.role,
            employeeCode: finalCode,
            dailyRate: Number(formData.dailyRate),
            allowance: Number(formData.allowance),
            otRate: Number(formData.otRate)
            // Only send password if needed?
            // Simplified for now
        };

        if (formData.password) Object.assign(payload, { password: formData.password });
        if (!editUser) Object.assign(payload, { email: formData.email });

        let savedUser;

        if (editUser) {
            const res = await fetch(`/api/users/${editUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            savedUser = await res.json();
            // Preserve ID if needed, although response has it
        } else {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            savedUser = await res.json();
        }

        setOpenDialog(false);
        await fetchData();

        // Auto-show QR if created/updated successfully
        if (savedUser && savedUser.employeeCode) {
            handleShowQR(savedUser);
        }
    };

    const handleShowQR = async (user: any) => {
        let code = user.employeeCode;
        let updatedUser = user;

        // Auto-generate if missing
        if (!code) {
            const newCode = generateCodeFromName(user.name);
            try {
                const res = await fetch(`/api/users/${user.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: user.name,
                        role: user.role,
                        employeeCode: newCode
                    })
                });
                if (res.ok) {
                    updatedUser = await res.json();
                    code = updatedUser.employeeCode;

                    // Update local list
                    setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                }
            } catch (e) {
                console.error("Auto-gen code failed", e);
                alert("Không thể tự động tạo mã. Vui lòng thử lại.");
                return;
            }
        }

        if (!code) {
            alert("Vẫn chưa có Mã số để tạo QR.");
            return;
        }

        try {
            const url = await QRCode.toDataURL(code);
            setQrImage(url);
            setQrDialog(updatedUser);
        } catch (err) {
            console.error(err);
        }
    };

    const handlePrint = () => {
        const printContent = document.getElementById('printable-card');
        if (!printContent) return;

        const win = window.open('', '', 'height=600,width=800');
        win?.document.write('<html><head><title>Print Card</title>');
        win?.document.write('</head><body >');
        win?.document.write(printContent.innerHTML);
        win?.document.write('</body></html>');
        win?.document.close();
        win?.print();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Quản lý Nhân sự</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
                    Thêm Nhân viên
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.light', '& th': { color: 'primary.contrastText' } }}>
                        <TableRow>
                            <TableCell>Mã NV</TableCell>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Email / Tài khoản</TableCell>
                            <TableCell>Vai trò</TableCell>
                            <TableCell align="right">Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell>
                                    <Chip label={user.employeeCode || "N/A"} size="small" color={user.employeeCode ? "success" : "default"} />
                                </TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>{user.name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Chip label={user.role} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="In Thẻ QR">
                                        <IconButton size="small" color="secondary" onClick={() => handleShowQR(user)}>
                                            <QrCodeIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <IconButton size="small" onClick={() => handleOpenEdit(user)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(user.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{editUser ? "Cập nhật Nhân viên" : "Thêm Nhân viên Mới"}</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Mã Nhân Viên (Dùng cho QR)" fullWidth
                            value={formData.employeeCode}
                            onChange={(e) => setFormData({ ...formData, employeeCode: e.target.value.toUpperCase() })}
                            placeholder="VD: NV001"
                        />
                        <TextField
                            label="Họ tên" fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />

                        <Typography variant="subtitle2" color="primary" sx={{ mt: 1 }}>Cấu hình Lương (Salary Settings)</Typography>
                        <Box display="flex" gap={2}>
                            <TextField
                                label="Lương ngày (VNĐ)" fullWidth type="number"
                                value={formData.dailyRate}
                                onChange={(e) => setFormData({ ...formData, dailyRate: Number(e.target.value) })}
                            />
                            <TextField
                                label="Phụ cấp (VNĐ)" fullWidth type="number"
                                value={formData.allowance}
                                onChange={(e) => setFormData({ ...formData, allowance: Number(e.target.value) })}
                            />
                            <TextField
                                label="Hệ số OT" sx={{ width: 120 }} type="number" inputProps={{ step: 0.1 }}
                                value={formData.otRate}
                                onChange={(e) => setFormData({ ...formData, otRate: Number(e.target.value) })}
                            />
                        </Box>

                        <TextField
                            label="Email (Tên đăng nhập)" fullWidth
                            disabled={!!editUser}
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        {!editUser && <TextField
                            label="Mật khẩu" fullWidth type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />}
                        <TextField
                            select label="Vai trò" fullWidth
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            {ROLES.map(role => (
                                <MenuItem key={role.value} value={role.value}>{role.label}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained">Lưu</Button>
                </DialogActions>
            </Dialog>

            {/* QR Card Dialog */}
            <Dialog open={!!qrDialog} onClose={() => setQrDialog(null)}>
                <DialogContent sx={{ p: 4, textAlign: 'center' }}>
                    <div id="printable-card" style={{
                        border: '1px solid #ddd', padding: '20px', borderRadius: '10px',
                        width: '300px', margin: '0 auto', textAlign: 'center', fontFamily: 'Arial'
                    }}>
                        <h2 style={{ margin: '0 0 10px 0', color: '#1565C0' }}>DƯƠNG THÀNH TÍN</h2>
                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>NHÂN VIÊN CHÍNH THỨC</p>
                        <hr style={{ margin: '15px 0', border: 'none', borderTop: '1px dashed #ccc' }} />
                        <img src={qrImage} alt="QR Code" style={{ width: '150px', height: '150px' }} />
                        <h1 style={{ margin: '10px 0', fontSize: '24px' }}>{qrDialog?.employeeCode}</h1>
                        <h3 style={{ margin: 5 }}>{qrDialog?.name}</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#888' }}>{qrDialog?.role}</p>
                    </div>
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
                    <Button variant="outlined" onClick={() => setQrDialog(null)}>Đóng</Button>
                    <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint}>In Thẻ</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
