import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Box, Typography, Button } from '@mui/material';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export default function QRScanner({ onScanSuccess, onClose }: QRScannerProps) {
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        // Initialize scanner
        scannerRef.current = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scannerRef.current.render(
            (decodedText) => {
                // Success
                onScanSuccess(decodedText);
                if (scannerRef.current) {
                    scannerRef.current.clear().catch(err => console.error("Failed to clear scanner", err));
                }
            },
            (errorMessage) => {
                // Parse error, ignore common read errors
                // console.warn(errorMessage);
            }
        );

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>Quét mã QR Lệnh SX</Typography>
            <div id="reader" style={{ width: '100%' }}></div>
            {error && <Typography color="error">{error}</Typography>}
            <Button onClick={onClose} sx={{ mt: 2 }} variant="outlined">Đóng máy quét</Button>
        </Box>
    );
}
