"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    Grid, MenuItem
} from '@mui/material';
import { Add as AddIcon, Print as PrintIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';
import { MaterialLabel } from '@/components/materials/MaterialLabel'; // We will create this

interface Material {
    id: string;
    code: string;
    name: string;
    type: string;
    color?: string;
    quantity: number;
    unit: string;
}

const MATERIAL_TYPES = ['Vải chính', 'Vải lót', 'Cúc/Nút', 'Chỉ may', 'Khóa kéo', 'Bao bì', 'Khác'];
const UNITS = ['METER', 'KG', 'ROLL', 'PCS'];

export default function MaterialsPage() {
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [newMaterial, setNewMaterial] = useState<Partial<Material>>({
        type: 'Vải chính',
        unit: 'METER'
    });

    // Printing state
    const [printData, setPrintData] = useState<{ material: any, qr: string } | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // @ts-ignore
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        onAfterPrint: () => setPrintData(null),
    });

    // Need to trigger print when printData is ready
    useEffect(() => {
        if (printData && printRef.current) {
            handlePrint();
        }
    }, [printData, handlePrint]);

    const fetchMaterials = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/materials');
            const data = await res.json();
            setMaterials(data);
        } catch (error) {
            console.error("Failed to fetch materials", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMaterials();
    }, []);

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/materials', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMaterial)
            });

            if (res.ok) {
                const created = await res.json();
                setMaterials([created, ...materials]);
                setOpenDialog(false);
                setNewMaterial({ type: 'Vải chính', unit: 'METER' });

                // Trigger print immediately after create as requested
                const qrUrl = await QRCode.toDataURL(created.code);
                setPrintData({ material: created, qr: qrUrl });
            }
        } catch (error) {
            alert("Lỗi khi tạo mới");
        }
    };

    const handlePrintExisting = async (material: Material) => {
        const qrUrl = await QRCode.toDataURL(material.code);
        setPrintData({ material, qr: qrUrl });
    }

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Kho Vải & Nguyên Phụ Liệu</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenDialog(true)}
                    sx={{ bgcolor: 'accent.main', '&:hover': { bgcolor: 'accent.dark' } }}
                >
                    Nhập mới & In Tem
                </Button>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'background.default' }}>
                        <TableRow>
                            <TableCell>Mã</TableCell>
                            <TableCell>Tên vật tư</TableCell>
                            <TableCell>Loại</TableCell>
                            <TableCell>Màu sắc</TableCell>
                            <TableCell align="right">Tổng tồn</TableCell>
                            <TableCell>Đơn vị</TableCell>
                            <TableCell align="center">Thao tác</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {materials.map((row) => (
                            <TableRow key={row.id} hover>
                                <TableCell sx={{ fontWeight: 600 }}>{row.code}</TableCell>
                                <TableCell>{row.name}</TableCell>
                                <TableCell>
                                    <Chip label={row.type} size="small" color="primary" variant="outlined" />
                                </TableCell>
                                <TableCell>{row.color || '-'}</TableCell>
                                <TableCell align="right" sx={{ color: row.quantity > 0 ? 'success.main' : 'error.main', fontWeight: 600 }}>
                                    {row.quantity}
                                </TableCell>
                                <TableCell>{row.unit}</TableCell>
                                <TableCell align="center">
                                    <IconButton size="small" color="primary" onClick={() => handlePrintExisting(row)}>
                                        <PrintIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {materials.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                    Chưa có dữ liệu. Hãy nhập vật tư mới.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <MaterialLabel
                        ref={printRef}
                        material={printData.material}
                        qrDataUrl={printData.qr}
                    />
                )}
            </div>

            {/* Create Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Nhập thông tin vật tư mới</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Mã vật tư (Tự động hoặc nhập tay)"
                            fullWidth
                            value={newMaterial.code || ''}
                            onChange={(e) => setNewMaterial({ ...newMaterial, code: e.target.value })}
                            placeholder="VD: VAI-KAKI-01"
                        />
                        <TextField
                            label="Tên vật tư"
                            fullWidth
                            required
                            value={newMaterial.name || ''}
                            onChange={(e) => setNewMaterial({ ...newMaterial, name: e.target.value })}
                        />
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    select
                                    label="Loại"
                                    fullWidth
                                    value={newMaterial.type}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, type: e.target.value })}
                                >
                                    {MATERIAL_TYPES.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                                </TextField>
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    select
                                    label="Đơn vị tính"
                                    fullWidth
                                    value={newMaterial.unit}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                                >
                                    {UNITS.map(u => <MenuItem key={u} value={u}>{u}</MenuItem>)}
                                </TextField>
                            </Grid>
                        </Grid>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 6 }}>
                                <TextField
                                    label="Màu sắc"
                                    fullWidth
                                    value={newMaterial.color || ''}
                                    onChange={(e) => setNewMaterial({ ...newMaterial, color: e.target.value })}
                                />
                            </Grid>
                            <Grid size={{ xs: 6 }}>
                                {/* More fields can be added: GSM, Width, etc. */}
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreate} variant="contained" disabled={!newMaterial.name || !newMaterial.code}>
                        Lưu & In Tem
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
