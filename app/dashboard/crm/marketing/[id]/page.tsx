
'use client';

import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Alert,
    CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';

interface EmailLog {
    id: string;
    recipient: string;
    status: string;
    opened: boolean;
    sentAt: string;
}

interface Campaign {
    id: string;
    name: string;
    subject: string;
    content: string;
    status: string;
    sentCount: number;
    logs: EmailLog[];
}

export default function CampaignDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState('');
    const [sendSuccess, setSendSuccess] = useState('');

    useEffect(() => {
        fetchCampaign();
    }, [id]);

    const fetchCampaign = async () => {
        try {
            const res = await fetch(`/api/crm/campaigns/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCampaign(data);
            }
        } catch (error) {
            console.error('Failed to fetch campaign', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!campaign) return;
        if (!confirm(`Bạn có chắc muốn gửi email này đến tất cả khách hàng?`)) return;

        setSending(true);
        setSendError('');
        setSendSuccess('');

        try {
            const res = await fetch(`/api/crm/campaigns/${id}/send`, {
                method: 'POST',
            });

            const data = await res.json();

            if (res.ok) {
                setSendSuccess(`Đã gửi thành công ${data.sentCount} email!`);
                fetchCampaign(); // Refresh data to show logs
            } else {
                setSendError(data.error || 'Gửi thất bại');
            }
        } catch (error) {
            setSendError('Lỗi kết nối');
        } finally {
            setSending(false);
        }
    };

    if (loading) return <Box p={3}><CircularProgress /></Box>;
    if (!campaign) return <Box p={3}>Campaign not found</Box>;

    return (
        <Box p={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/dashboard/crm/marketing')} sx={{ mb: 2 }}>
                Quay lại
            </Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">{campaign.name}</Typography>
                <Chip
                    label={campaign.status}
                    color={campaign.status === 'SENT' ? 'success' : 'default'}
                    sx={{ fontWeight: 'bold' }}
                />
            </Box>

            {sendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{sendSuccess}</Alert>}
            {sendError && <Alert severity="error" sx={{ mb: 2 }}>{sendError}</Alert>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <Card variant="outlined" sx={{ mb: 3 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Nội dung Email</Typography>
                            <Typography variant="subtitle1" fontWeight="bold">Subject: {campaign.subject}</Typography>
                            <Box mt={2} p={2} bgcolor="#f5f5f5" borderRadius={1} minHeight={200} whiteSpace="pre-wrap">
                                {campaign.content}
                            </Box>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Hành động</Typography>
                            <Typography variant="body2" color="textSecondary" paragraph>
                                Gửi email này đến toàn bộ danh sách Khách hàng trong CRM.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                startIcon={<SendIcon />}
                                onClick={handleSend}
                                disabled={campaign.status === 'SENT' || sending}
                            >
                                {sending ? 'Đang gửi...' : (campaign.status === 'SENT' ? 'Đã Gửi' : 'Gửi Ngay')}
                            </Button>
                        </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ mt: 2 }}>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Thống kê</Typography>
                            <Typography variant="body1">Đã gửi: <b>{campaign.sentCount}</b></Typography>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Box mt={4}>
                <Typography variant="h6" gutterBottom>Lịch sử Gửi (Logs)</Typography>
                <TableContainer component={Paper}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Người nhận</TableCell>
                                <TableCell>Trạng thái</TableCell>
                                <TableCell>Đã mở</TableCell>
                                <TableCell>Thời gian</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {campaign.logs.map((log) => (
                                <TableRow key={log.id}>
                                    <TableCell>{log.recipient}</TableCell>
                                    <TableCell>
                                        <Chip label={log.status} color="success" size="small" variant="outlined" />
                                    </TableCell>
                                    <TableCell>
                                        {log.opened ? (
                                            <Chip label="Đã xem" color="primary" size="small" />
                                        ) : (
                                            <Chip label="Chưa xem" size="small" variant="outlined" />
                                        )}
                                    </TableCell>
                                    <TableCell>{new Date(log.sentAt).toLocaleString('vi-VN')}</TableCell>
                                </TableRow>
                            ))}
                            {campaign.logs.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Chưa có lịch sử gửi</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Box>
    );
}
