"use client";
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid, Alert
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';

export default function SalarySettingsPage() {
    const [config, setConfig] = useState({
        LATE_PENALTY: "50000",
        OT_MULTIPLIER: "1.5",
        SHIFT_START: "08:00",
        SHIFT_END: "17:00"
    });
    const [status, setStatus] = useState("");

    useEffect(() => {
        fetch('/api/hr/settings')
            .then(res => res.json())
            .then(data => {
                if (Object.keys(data).length > 0) setConfig(prev => ({ ...prev, ...data }));
            });
    }, []);

    const handleSave = async () => {
        setStatus("Saving...");
        const res = await fetch('/api/hr/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        });
        if (res.ok) setStatus("Cập nhật thành công!");
        else setStatus("Lỗi khi lưu.");
    };

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">
                Cấu hình Lương & Phạt
            </Typography>
            <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>Quy định Phạt</Typography>
                        <TextField
                            fullWidth label="Phạt đi muộn (VND / lần)"
                            type="number"
                            value={config.LATE_PENALTY}
                            onChange={(e) => setConfig({ ...config, LATE_PENALTY: e.target.value })}
                            helperText="Trừ lương nếu check-in sau 08:15"
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <Typography variant="h6" gutterBottom>Quy định Tăng ca (OT)</Typography>
                        <TextField
                            fullWidth label="Hệ số lương OT"
                            type="number" inputProps={{ step: 0.1 }}
                            value={config.OT_MULTIPLIER}
                            onChange={(e) => setConfig({ ...config, OT_MULTIPLIER: e.target.value })}
                            helperText="Ví dụ: 1.5 (150% lương), 2.0 (200% lương)"
                        />
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth label="Giờ vào ca"
                            type="time"
                            value={config.SHIFT_START}
                            onChange={(e) => setConfig({ ...config, SHIFT_START: e.target.value })}
                        />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                        <TextField
                            fullWidth label="Giờ tan ca"
                            type="time"
                            value={config.SHIFT_END}
                            onChange={(e) => setConfig({ ...config, SHIFT_END: e.target.value })}
                        />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        {status && (
                            <Alert severity={status.includes("thành công") ? "success" : "info"} sx={{ mb: 2 }}>
                                {status}
                            </Alert>
                        )}
                        <Button
                            variant="contained" size="large" fullWidth
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                        >
                            Lưu Cấu Hình
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
}
