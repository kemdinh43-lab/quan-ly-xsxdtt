"use client";
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid, Avatar, CircularProgress, Alert
} from '@mui/material';
import { Save as SaveIcon, CloudUpload as UploadIcon } from '@mui/icons-material';

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Setting Keys: COMPANY_NAME, COMPANY_ADDRESS, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_LOGO
    const [settings, setSettings] = useState({
        COMPANY_NAME: "",
        COMPANY_ADDRESS: "",
        COMPANY_PHONE: "",
        COMPANY_EMAIL: "",
        COMPANY_LOGO: ""
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);
        try {
            const res = await fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            if (res.ok) {
                setMessage({ type: 'success', text: 'Đã lưu cài đặt thành công!' });
            } else {
                setMessage({ type: 'error', text: 'Lỗi khi lưu cài đặt.' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Có lỗi xảy ra.' });
        } finally {
            setSaving(false);
        }
    };

    const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, COMPANY_LOGO: data.url }));
            } else {
                alert("Upload failed!");
            }
        } catch (error) {
            console.error("Upload error", error);
        }
    };

    if (loading) return <Box p={3}><CircularProgress /></Box>;

    return (
        <Box p={3} maxWidth={800} mx="auto">
            <Typography variant="h4" fontWeight="bold" gutterBottom>Cài đặt Công Ty</Typography>

            {message && <Alert severity={message.type} sx={{ mb: 2 }}>{message.text}</Alert>}

            <Paper sx={{ p: 3 }}>
                <Grid container spacing={3}>
                    {/* Logo Section */}
                    <Grid size={{ xs: 12, md: 4 }} sx={{ textAlign: 'center' }}>
                        <Typography variant="subtitle1" gutterBottom fontWeight="bold">Logo công ty</Typography>
                        <Box
                            sx={{
                                border: '1px dashed #ccc',
                                borderRadius: 2,
                                p: 2,
                                mb: 2,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: 160,
                                position: 'relative'
                            }}
                        >
                            {settings.COMPANY_LOGO ? (
                                <img
                                    src={settings.COMPANY_LOGO}
                                    alt="Logo"
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                />
                            ) : (
                                <Typography color="text.secondary">Chưa có Logo</Typography>
                            )}
                        </Box>
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={<UploadIcon />}
                            size="small"
                        >
                            Tải Ảnh Lên
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleUploadLogo}
                            />
                        </Button>
                    </Grid>

                    {/* Info Section */}
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Tên Công Ty"
                                    value={settings.COMPANY_NAME}
                                    onChange={(e) => setSettings({ ...settings, COMPANY_NAME: e.target.value })}
                                    placeholder="CÔNG TY TNHH ABC..."
                                />
                            </Grid>
                            <Grid size={{ xs: 12 }}>
                                <TextField
                                    fullWidth label="Địa chỉ"
                                    value={settings.COMPANY_ADDRESS}
                                    onChange={(e) => setSettings({ ...settings, COMPANY_ADDRESS: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth label="Hotline / SĐT"
                                    value={settings.COMPANY_PHONE}
                                    onChange={(e) => setSettings({ ...settings, COMPANY_PHONE: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    fullWidth label="Email"
                                    value={settings.COMPANY_EMAIL}
                                    onChange={(e) => setSettings({ ...settings, COMPANY_EMAIL: e.target.value })}
                                />
                            </Grid>
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                        <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >
                            {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
