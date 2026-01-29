'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function ContractActions({ quoteId }: { quoteId: string }) {
    const router = useRouter();

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = async () => {
        const element = document.getElementById('quote-content');
        if (!element) return;

        // Dynamically import html2pdf
        const html2pdf = (await import('html2pdf.js')).default;

        const filename = `Hop_Dong_${quoteId.substring(0, 8)}.pdf`;
        const opt = {
            margin: 10,
            filename: filename,
            image: { type: 'jpeg' as const, quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
        };

        await html2pdf().set(opt).from(element).save(filename);
    };

    return (
        <Box sx={{
            display: 'flex',
            gap: 2,
            mb: 2,
            '@media print': { display: 'none' } // Hide in print mode
        }}>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.back()}
                sx={{ color: 'white', borderColor: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
                Quay lại
            </Button>

            <Button
                variant="contained"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ bgcolor: 'white', color: '#333', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
                In Hợp đồng
            </Button>

            <Button
                variant="contained"
                color="secondary"
                startIcon={<DownloadIcon />}
                onClick={handleDownload}
            >
                Tải PDF
            </Button>
        </Box>
    );
}
