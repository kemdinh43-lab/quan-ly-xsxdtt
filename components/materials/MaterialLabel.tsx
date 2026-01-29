import React from 'react';
import QRCode from 'qrcode';
import { Box, Typography } from '@mui/material';

interface MaterialLabelProps {
    material: {
        name: string;
        code: string;
        color?: string | null;
        type: string;
    };
    qrDataUrl: string; // Pre-generated QR data URL
}

// Simple functional component that can be used for printing
export const MaterialLabel = React.forwardRef<HTMLDivElement, MaterialLabelProps>(({ material, qrDataUrl }, ref) => {
    return (
        <Box
            ref={ref}
            sx={{
                width: '300px', // Standard sticker size approx
                height: '200px',
                border: '1px solid black',
                p: 2,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: 2,
                bgcolor: 'white',
                pageBreakAfter: 'always',
                '@media print': {
                    border: 'none', // Printers usually handle margins
                }
            }}
        >
            <Box>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={qrDataUrl} alt="QR Code" style={{ width: '100px', height: '100px' }} />
            </Box>
            <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>{material.name}</Typography>
                <Typography variant="body2">Mã: <strong>{material.code}</strong></Typography>
                <Typography variant="body2">Loại: {material.type}</Typography>
                {material.color && <Typography variant="body2">Màu: {material.color}</Typography>}
            </Box>
        </Box>
    );
});

MaterialLabel.displayName = "MaterialLabel";
