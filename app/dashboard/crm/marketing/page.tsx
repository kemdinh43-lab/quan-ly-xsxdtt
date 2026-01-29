
'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useRouter } from 'next/navigation';

interface Campaign {
    id: string;
    name: string;
    subject: string;
    status: string;
    sentCount: number;
    createdAt: string;
    updatedAt: string;
    _count?: {
        logs: number;
    };
}

export default function MarketingPage() {
    const router = useRouter();
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newCampaign, setNewCampaign] = useState({ name: '', subject: '', content: '', targetAudience: 'ALL' });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const fetchCampaigns = async () => {
        try {
            const res = await fetch('/api/crm/campaigns');
            if (res.ok) {
                const data = await res.json();
                setCampaigns(data);
            }
        } catch (error) {
            console.error('Failed to fetch campaigns', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await fetch('/api/crm/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCampaign),
            });

            if (res.ok) {
                setOpenDialog(false);
                setNewCampaign({ name: '', subject: '', content: '', targetAudience: 'ALL' });
                fetchCampaigns();
            }
        } catch (error) {
            console.error('Failed to create campaign', error);
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;
        try {
            await fetch(`/api/crm/campaigns/${id}`, { method: 'DELETE' });
            fetchCampaigns();
        } catch (error) {
            console.error('Failed to delete campaign', error);
        }
    };

    if (loading) return <Box p={3}><CircularProgress /></Box>;

    return (
        <Box p={3}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5">Email Marketing Automation</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                >
                    Tạo Chiến dịch Mới
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Tên Chiến dịch</TableCell>
                            <TableCell>Tiêu đề Email</TableCell>
                            <TableCell>Trạng thái</TableCell>
                            <TableCell>Đã gửi</TableCell>
                            <TableCell>Ngày tạo</TableCell>
                            <TableCell>Hành động</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {campaigns.map((camp) => (
                            <TableRow key={camp.id} hover>
                                <TableCell>{camp.name}</TableCell>
                                <TableCell>{camp.subject}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={camp.status}
                                        color={camp.status === 'SENT' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{camp.sentCount}</TableCell>
                                <TableCell>{new Date(camp.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                                <TableCell>
                                    <IconButton size="small" onClick={() => router.push(`/dashboard/crm/marketing/${camp.id}`)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleDelete(camp.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {campaigns.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} align="center">Chưa có chiến dịch nào</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Tạo Chiến dịch Mới</DialogTitle>
                <DialogContent>
                    <Box mt={1} display="flex" flexDirection="column" gap={2}>

                        {/* Template Selection */}
                        <FormControl fullWidth size="small">
                            <InputLabel>Chọn Mẫu Email (Template)</InputLabel>
                            <Select
                                label="Chọn Mẫu Email (Template)"
                                onChange={(e) => {
                                    const tpl = e.target.value;
                                    if (tpl === 'NEW_COLLECTION') {
                                        setNewCampaign({
                                            ...newCampaign,
                                            subject: '🔥 Bộ sưu tập Bảo hộ lao động Mới nhất 2024',
                                            content: 'Kính gửi Quý khách,\n\nDương Thành Tín vừa ra mắt bộ sưu tập mới với chất liệu vải thoáng mát, bền bỉ hơn.\n\nMời Quý khách xem chi tiết tại...'
                                        });
                                    } else if (tpl === 'BIRTHDAY') {
                                        setNewCampaign({
                                            ...newCampaign,
                                            subject: '🎂 Chúc mừng Sinh nhật Quý Khách!',
                                            content: 'Kính gửi Quý khách,\n\nNhân dịp sinh nhật, chúng tôi xin gửi tặng voucher giảm giá 10% cho đơn hàng tiếp theo.\n\nMã giảm giá: HPBD2024'
                                        });
                                    } else if (tpl === 'THANKS') {
                                        setNewCampaign({
                                            ...newCampaign,
                                            subject: '❤️ Cảm ơn Quý khách đã đặt hàng',
                                            content: 'Cảm ơn Quý khách đã tin tưởng. Đơn hàng đang được xử lý và sẽ sớm đến tay Quý khách.'
                                        });
                                    }
                                }}
                            >
                                <MenuItem value="">-- Tự soạn --</MenuItem>
                                <MenuItem value="NEW_COLLECTION">Chào hàng Bộ Sưu Tập Mới</MenuItem>
                                <MenuItem value="BIRTHDAY">Chúc mừng Sinh nhật</MenuItem>
                                <MenuItem value="THANKS">Cảm ơn Đặt hàng</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tên chiến dịch"
                            fullWidth
                            value={newCampaign.name}
                            onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                        />

                        {/* Target Audience */}
                        <FormControl fullWidth>
                            <InputLabel>Nhóm Khách hàng nhận tin</InputLabel>
                            <Select
                                label="Nhóm Khách hàng nhận tin"
                                value={newCampaign.targetAudience || 'ALL'}
                                onChange={(e) => setNewCampaign({ ...newCampaign, targetAudience: e.target.value })}
                            >
                                <MenuItem value="ALL">Tất cả Khách hàng</MenuItem>
                                <MenuItem value="WHOLESALE">Khách Sỉ (Wholesale)</MenuItem>
                                <MenuItem value="PROCESSING">Khách Gia Công (Processing)</MenuItem>
                                <MenuItem value="LEAD">Khách Tiềm năng (Leads)</MenuItem>
                            </Select>
                        </FormControl>

                        <TextField
                            label="Tiêu đề Email"
                            fullWidth
                            value={newCampaign.subject}
                            onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                        />
                        <TextField
                            label="Nội dung Email"
                            fullWidth
                            multiline
                            rows={4}
                            value={newCampaign.content}
                            onChange={(e) => setNewCampaign({ ...newCampaign, content: e.target.value })}
                            helperText="Nội dung text đơn giản (Sau này sẽ nâng cấp lên HTML Editor)"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button
                        onClick={handleCreate}
                        variant="contained"
                        disabled={creating || !newCampaign.name || !newCampaign.subject}
                    >
                        {creating ? 'Đang tạo...' : 'Tạo'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
