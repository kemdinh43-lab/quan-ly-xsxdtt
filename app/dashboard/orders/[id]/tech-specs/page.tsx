
"use client";
import { useState, useEffect } from 'react';
import { Box, Typography, Paper, TextField, Button, Grid, Divider, CircularProgress, Alert } from '@mui/material';
import { AutoFixHigh as AutoIcon, Print as PrintIcon, Save as SaveIcon } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function TechSpecsPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { id } = params;
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [aiLoading, setAiLoading] = useState<string | null>(null); // itemId loading

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                setOrder(data);
                setLoading(false);
            })
            .catch(err => setLoading(false));
    }, [id]);

    const handleNoteChange = (index: number, value: string) => {
        const newItems = [...order.items];
        newItems[index].note = value;
        setOrder({ ...order, items: newItems });
    };

    const handleAnalyzeAI = async (index: number) => {
        const item = order.items[index];
        const textToAnalyze = `${item.name} ${item.color || ''} ${item.size || ''}`;

        setAiLoading(item.id);
        try {
            const res = await fetch('/api/ai/parse-requirements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToAnalyze })
            });
            const data = await res.json();

            // Update the note with the AI Technical Note
            handleNoteChange(index, data.technicalNote);
        } catch (e) {
            alert('Lỗi AI: ' + e);
        } finally {
            setAiLoading(null);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Need an API to update Order/Items. Re-using a generic update or specific route?
            // Since we don't have a specific update route for items showcased yet, let's assume /api/orders/[id] PATCH or similar,
            // or we create a specific action. For now, let's create a server action mock or API route.
            // I'll assume we need to Create the API route for updating items details.

            const res = await fetch(`/api/orders/${id}/update-items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: order.items })
            });

            if (res.ok) {
                alert('Đã lưu thông số kỹ thuật!');
            } else {
                alert('Lỗi khi lưu.');
            }
        } catch (e) {
            alert('Lỗi lưu dữ liệu');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box p={3}>Loading...</Box>;
    if (!order) return <Box p={3}>Order not found</Box>;

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">Thiết Lập Thông Số Kỹ Thuật (HSTL)</Typography>
                <Box gap={2} display="flex">
                    <Button variant="outlined" onClick={() => router.push(`/dashboard/orders`)}>Quay lại</Button>
                    <Button
                        variant="contained"
                        color="warning"
                        startIcon={<PrintIcon />}
                        onClick={() => router.push(`/dashboard/orders/${id}/production`)}
                    >
                        Xem Lệnh Sản Xuất
                    </Button>
                </Box>
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                Sử dụng <strong>AI Phân Tích</strong> để tự động viết mô tả kỹ thuật chuyên nghiệp cho từng sản phẩm trước khi in lệnh xuống xưởng.
            </Alert>

            {order.items.map((item: any, index: number) => (
                <Paper key={item.id} sx={{ p: 3, mb: 3, borderLeft: '5px solid #1976d2' }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography variant="h6" fontWeight="bold">{item.name}</Typography>
                            <Typography variant="body2" color="textSecondary">Size: {item.size} | Màu: {item.color}</Typography>
                            <Typography variant="h5" color="primary" mt={1}>{item.quantity} {item.unit || 'Cái'}</Typography>
                        </Grid>

                        <Grid size={{ xs: 12, md: 8 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                <Typography variant="subtitle2">Yêu Cầu Kỹ Thuật / Quy Cách:</Typography>
                                <Button
                                    size="small"
                                    variant="outlined"
                                    startIcon={aiLoading === item.id ? <CircularProgress size={16} /> : <AutoIcon />}
                                    onClick={() => handleAnalyzeAI(index)}
                                    disabled={!!aiLoading}
                                >
                                    AI Viết Mô Tả
                                </Button>
                            </Box>
                            <TextField
                                fullWidth
                                multiline
                                rows={6}
                                value={item.note || ''}
                                onChange={(e) => handleNoteChange(index, e.target.value)}
                                placeholder="Mô tả chi tiết kỹ thuật... (Nhấn nút AI để tự động viết)"
                                sx={{ bgcolor: '#fafafa' }}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            ))}

            <Box display="flex" justifyContent="flex-end" py={2} position="sticky" bottom={0} bgcolor="white" borderTop="1px solid #eee" zIndex={10}>
                <Button
                    variant="contained"
                    size="large"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={saving}
                    sx={{ px: 4 }}
                >
                    {saving ? "Đang lưu..." : "Lưu Thông Số"}
                </Button>
            </Box>
        </Box>
    );
}
