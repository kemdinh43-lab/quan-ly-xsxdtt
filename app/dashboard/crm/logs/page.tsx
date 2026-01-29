"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Grid, TextField, Button,
    Card, CardContent, Divider, Alert
} from '@mui/material';
import { Send as SendIcon, History as HistoryIcon, ArrowBack } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function CRMLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState("Loading logs...");
    const [formData, setFormData] = useState({ to: '', subject: '', message: '' });
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    const fetchLogs = async () => {
        const res = await fetch('/api/crm/logs');
        const data = await res.json();
        setLogs(data.logs);
    };

    useEffect(() => {
        fetchLogs();
        const interval = setInterval(fetchLogs, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSend = async () => {
        setStatus(null);
        try {
            const res = await fetch('/api/crm/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus({ type: 'success', msg: 'Email đã được gửi thành công!' });
                setFormData({ to: '', subject: '', message: '' });
                fetchLogs();
            } else {
                setStatus({ type: 'error', msg: 'Gửi thất bại.' });
            }
        } catch (err) {
            setStatus({ type: 'error', msg: 'Lỗi kết nối.' });
        }
    };

    return (
        <Box>
            <Button startIcon={<ArrowBack />} onClick={() => router.back()} sx={{ mb: 2 }}>
                Quay lại Dashboard CRM
            </Button>
            <Typography variant="h4" fontWeight="bold" color="primary" sx={{ mb: 3 }}>
                Lịch sử & Gửi Email Thủ công
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
                {/* Left: Logs */}
                <Box sx={{ flex: 7, height: '100%' }}>
                    <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <HistoryIcon color="action" sx={{ mr: 1 }} />
                                <Typography variant="h6">Nhật ký Realtime</Typography>
                            </Box>
                            <Button
                                color="error"
                                size="small"
                                onClick={async () => {
                                    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử?')) {
                                        await fetch('/api/crm/logs', { method: 'DELETE' });
                                        fetchLogs();
                                    }
                                }}
                            >
                                Xóa lịch sử
                            </Button>
                        </Box>
                        <Divider sx={{ mb: 2 }} />
                        <Box sx={{ bgcolor: '#1e1e1e', color: '#00ff00', p: 2, borderRadius: 1, fontFamily: 'monospace', height: '400px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                            {logs}
                        </Box>
                    </Paper>
                </Box>

                {/* Right: Manual Send */}
                <Box sx={{ flex: 5 }}>
                    <Card elevation={3}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <SendIcon color="primary" sx={{ mr: 1 }} />
                                <Typography variant="h6">Gửi Email Thủ công</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField label="Người nhận (Email)" fullWidth value={formData.to} onChange={(e) => setFormData({ ...formData, to: e.target.value })} />
                                <TextField label="Tiêu đề" fullWidth value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} />
                                <TextField label="Nội dung" multiline rows={4} fullWidth value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                                {status && <Alert severity={status.type}>{status.msg}</Alert>}
                                <Button variant="contained" size="large" startIcon={<SendIcon />} onClick={handleSend} disabled={!formData.to}>Gửi ngay</Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
