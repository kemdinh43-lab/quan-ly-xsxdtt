"use client";

import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    IconButton
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Phone as PhoneIcon } from '@mui/icons-material';

interface Lead {
    id: string;
    name: string;
    companyName?: string;
    phone: string;
    status: string;
    estimatedValue: number;
    source?: string;
}

const STATUS_COLUMNS = [
    { id: 'NEW', label: 'Khách Mới', color: '#e3f2fd' },
    { id: 'CONTACTED', label: 'Đang Liên Hệ', color: '#fff3e0' },
    { id: 'QUALIFIED', label: 'Tiềm Năng', color: '#e8f5e9' },
    { id: 'NEGOTIATING', label: 'Thương Lượng', color: '#f3e5f5' },
    { id: 'WON', label: 'Chốt Đơn', color: '#c8e6c9' },
    { id: 'LOST', label: 'Thất Bại', color: '#ffcdd2' },
];

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [open, setOpen] = useState(false);
    const [newLead, setNewLead] = useState({ name: '', phone: '', companyName: '', estimatedValue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/crm/leads');
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error("Failed to fetch leads", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        const res = await fetch('/api/crm/leads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newLead)
        });
        if (res.ok) {
            setOpen(false);
            fetchLeads();
            setNewLead({ name: '', phone: '', companyName: '', estimatedValue: 0 });
        }
    };

    // Simple status update for now (Click to move)
    const moveStatus = async (id: string, currentStatus: string) => {
        const currentIndex = STATUS_COLUMNS.findIndex(c => c.id === currentStatus);
        const nextStatus = STATUS_COLUMNS[currentIndex + 1]?.id || currentStatus;

        if (nextStatus !== currentStatus) {
            const res = await fetch('/api/crm/leads', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status: nextStatus })
            });
            if (res.ok) fetchLeads();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
                    Quản Lý Leads (Cơ hội bán hàng)
                </Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    Thêm Lead Mới
                </Button>
            </Box>

            <Grid container spacing={2} sx={{ overflowX: 'auto', flexWrap: 'nowrap', pb: 2 }}>
                {STATUS_COLUMNS.map((col) => (
                    <Grid key={col.id} sx={{ minWidth: 280, maxWidth: 320 }}>
                        <Paper
                            sx={{
                                p: 2,
                                bgcolor: col.color,
                                minHeight: '70vh',
                                borderRadius: 2
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                                {col.label}
                                <Chip size="small" label={leads.filter(l => l.status === col.id).length} />
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {leads.filter(l => l.status === col.id).map((lead) => (
                                    <Card key={lead.id} sx={{ cursor: 'pointer', '&:hover': { boxShadow: 3 } }}>
                                        <CardContent>
                                            <Typography variant="h6" fontSize={16} fontWeight="bold">
                                                {lead.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" gutterBottom>
                                                {lead.companyName}
                                            </Typography>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PhoneIcon fontSize="small" color="action" /> {lead.phone}
                                            </Typography>
                                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" fontWeight="bold" color="primary">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(lead.estimatedValue)}
                                                </Typography>
                                                {col.id !== 'WON' && col.id !== 'LOST' && (
                                                    <Button size="small" onClick={() => moveStatus(lead.id, lead.status)}>
                                                        Next &rarr;
                                                    </Button>
                                                )}
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Thêm Cơ hội mới</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Tên người liên hệ"
                        fullWidth
                        value={newLead.name}
                        onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Công ty / Cửa hàng"
                        fullWidth
                        value={newLead.companyName}
                        onChange={(e) => setNewLead({ ...newLead, companyName: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Số điện thoại"
                        fullWidth
                        value={newLead.phone}
                        onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    />
                    <TextField
                        margin="dense"
                        label="Giá trị dự kiến (VNĐ)"
                        fullWidth
                        type="number"
                        value={newLead.estimatedValue}
                        onChange={(e) => setNewLead({ ...newLead, estimatedValue: Number(e.target.value) })}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Hủy</Button>
                    <Button onClick={handleCreate} variant="contained">Tạo mới</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
