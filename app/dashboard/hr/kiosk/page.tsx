"use client";

import { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, Alert, TextField, Button, CircularProgress } from '@mui/material';
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";

export default function KioskPage() {
    const [scanResult, setScanResult] = useState<any>(null);
    const [lastScan, setLastScan] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [manualCode, setManualCode] = useState("");
    const [loading, setLoading] = useState(false);

    // Timer to clear result after 5 seconds
    useEffect(() => {
        if (scanResult) {
            const timer = setTimeout(() => {
                setScanResult(null);
                setLastScan(null); // Allow re-scan same code
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [scanResult]);

    useEffect(() => {
        // Initialize Scanner
        // Use a div id "reader"
        const scannerId = "reader";

        const onScanSuccess = async (decodedText: string, decodedResult: any) => {
            if (decodedText === lastScan) return; // Prevent spamming
            setLastScan(decodedText);

            handleSubmit(decodedText);
        };

        const onScanFailure = (error: any) => {
            // handle scan failure, usually better to ignore and keep scanning.
            // console.warn(`Code scan error = ${error}`);
        };

        const html5QrcodeScanner = new Html5QrcodeScanner(
            scannerId,
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        html5QrcodeScanner.render(onScanSuccess, onScanFailure);

        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);

    const handleSubmit = async (code: string) => {
        setLoading(true);
        setError(null);
        try {
            // Play Beep Sound
            const audio = new Audio('/beep.mp3'); // Need to add beep.mp3 or use standard
            audio.play().catch(e => console.log("Audio play failed", e));

            const res = await fetch('/api/hr/timekeeping/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code })
            });
            const data = await res.json();

            if (data.status === 'SUCCESS') {
                setScanResult(data);
            } else {
                setError(data.message || "Lỗi không xác định");
                setTimeout(() => setError(null), 3000);
            }
        } catch (err) {
            setError("Lỗi kết nối máy chủ");
        } finally {
            setLoading(false);
            setManualCode("");
        }
    };

    return (
        <Box sx={{
            height: '100vh',
            bgcolor: '#1a1a1a',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2
        }}>
            <Typography variant="h3" fontWeight="bold" sx={{ mb: 4, letterSpacing: 2 }}>
                MÁY CHẤM CÔNG
            </Typography>

            <Box display="flex" gap={4} width="100%" maxWidth="1000px" sx={{ flexDirection: { xs: 'column', md: 'row' }, height: '100%' }}>
                {/* Camera Section */}
                <Paper sx={{ flex: 1, p: 2, bgcolor: 'black', borderRadius: 4, overflow: 'hidden', minHeight: '300px' }}>
                    <div id="reader" style={{ width: '100%', height: '100%' }}></div>
                </Paper>

                {/* Result Section */}
                <Box flex={1} display="flex" flexDirection="column" gap={2} justifyContent="center">
                    {loading && <CircularProgress color="secondary" />}

                    {error && (
                        <Alert severity="error" variant="filled" sx={{ fontSize: '1.2rem' }}>
                            {error}
                        </Alert>
                    )}

                    {scanResult && (
                        <Paper sx={{
                            p: 4,
                            borderRadius: 4,
                            bgcolor: scanResult.type === 'IN' ? '#e8f5e9' : '#fff3e0',
                            textAlign: 'center'
                        }}>
                            <Typography variant="h2" color={scanResult.type === 'IN' ? 'green' : 'orange'}>
                                {scanResult.type === 'IN' ? '✅ CHECK IN' : '👋 CHECK OUT'}
                            </Typography>
                            <Typography variant="h4" fontWeight="bold" sx={{ my: 2, color: 'black' }}>
                                {scanResult.user.name}
                            </Typography>
                            <Typography variant="h3" color="text.secondary">
                                {scanResult.time}
                            </Typography>
                            <Typography variant="body1" sx={{ mt: 2, color: 'gray' }}>
                                {scanResult.message}
                            </Typography>
                        </Paper>
                    )}

                    {!scanResult && !error && (
                        <Box sx={{ textAlign: 'center', opacity: 0.5 }}>
                            <Typography variant="h5">Sẵn sàng quét...</Typography>
                            <Typography variant="body2">Đưa mã QR trước Camera</Typography>
                        </Box>
                    )}

                    {/* Manual Input Fallback */}
                    <Box mt={4} display="flex" gap={1}>
                        <TextField
                            variant="filled"
                            label="Nhập mã thủ công"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            sx={{ bgcolor: 'white', borderRadius: 1 }}
                            fullWidth
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSubmit(manualCode);
                            }}
                        />
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => handleSubmit(manualCode)}
                        >
                            Gửi
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
