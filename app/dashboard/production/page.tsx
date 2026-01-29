"use client";

import { useState, useEffect, useRef } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Chip, IconButton,
    LinearProgress, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, TextField
} from '@mui/material';
import {
    Add as AddIcon,
    Print as PrintIcon,
    QrCodeScanner as QrCodeScannerIcon
} from '@mui/icons-material';
import UpdateStageDialog from '@/components/production/UpdateStageDialog';
import { JobTicket } from '@/components/production/JobTicket';
import QRScanner from '@/components/common/QRScanner';
import { format } from 'date-fns';
import { useReactToPrint } from 'react-to-print';
import QRCode from 'qrcode';

export default function ProductionPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [openPlanDialog, setOpenPlanDialog] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState('');

    // Stage Update State
    const [editingStage, setEditingStage] = useState<any>(null);

    // Printing State
    const [printData, setPrintData] = useState<{ plan: any, qr: string } | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    // Scanner State
    const [openScanner, setOpenScanner] = useState(false);

    // @ts-ignore
    const handlePrint = useReactToPrint({
        contentRef: printRef,
        onAfterPrint: () => setPrintData(null),
    });

    useEffect(() => {
        if (printData && printRef.current) {
            handlePrint();
        }
    }, [printData, handlePrint]);

    const fetchData = async () => {
        const resPlans = await fetch('/api/production');
        const dataPlans = await resPlans.json();
        setPlans(dataPlans);
        const resOrders = await fetch('/api/orders');
        const dataOrders = await resOrders.json();
        setOrders(dataOrders.filter((o: any) => o.status === 'CONFIRMED' || o.status === 'QUOTE'));
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreatePlan = async () => {
        if (!selectedOrder) return;
        try {
            const res = await fetch('/api/production', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: selectedOrder })
            });
            if (res.ok) {
                setOpenPlanDialog(false);
                setSelectedOrder('');
                fetchData();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handlePrintTicket = async (plan: any) => {
        // QR Content: JSON string to identify the plan
        const qrContent = JSON.stringify({ type: 'PLAN', id: plan.id });
        const qrUrl = await QRCode.toDataURL(qrContent);
        setPrintData({ plan, qr: qrUrl });
    };

    const handleScanSuccess = (decodedText: string) => {
        try {
            const data = JSON.parse(decodedText);
            if (data.type === 'PLAN' && data.id) {
                const plan = plans.find(p => p.id === data.id);
                if (plan) {
                    setOpenScanner(false);
                    alert(`Đã tìm thấy Lệnh SX: ${plan.id.slice(-8)}. Chọn công đoạn để cập nhật.`);
                    // Highlight or filter logic here if needed
                } else {
                    alert("Không tìm thấy kế hoạch");
                }
            } else {
                alert("Mã QR không hợp lệ");
            }
        } catch (e) {
            alert("Lỗi đọc mã QR");
        }
    };

    const getStage = (plan: any, namePart: string) => {
        return plan.stages.find((s: any) => s.name.includes(namePart));
    };

    const renderStageCell = (plan: any, stageName: string) => {
        const stage = getStage(plan, stageName);
        if (!stage) return <TableCell>-</TableCell>;

        const percent = Math.min(100, Math.round((stage.quantityProduced / stage.quantityTarget) * 100));
        const color = percent === 100 ? 'success' : stage.status === 'IN_PROGRESS' ? 'primary' : 'inherit';

        return (
            <TableCell
                sx={{
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                    borderLeft: '1px solid #eee'
                }}
                onClick={() => setEditingStage(stage)}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="caption" fontWeight="bold">{stage.quantityProduced}/{stage.quantityTarget}</Typography>
                    {stage.quantityError > 0 && (
                        <Typography variant="caption" color="error">Err: {stage.quantityError}</Typography>
                    )}
                </Box>
                <LinearProgress variant="determinate" value={percent} color={color as any} sx={{ height: 6, borderRadius: 1 }} />
                <Typography variant="caption" sx={{ fontSize: '0.7rem', color: 'text.secondary' }}>
                    {stage.status}
                </Typography>
            </TableCell>
        );
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color="primary">Quản lý Sản xuất & QR</Typography>
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<QrCodeScannerIcon />}
                        onClick={() => setOpenScanner(true)}
                        sx={{ mr: 2 }}
                    >
                        Quét QR Check-in
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenPlanDialog(true)}
                        sx={{ bgcolor: 'warning.main', '&:hover': { bgcolor: 'warning.dark' } }}
                    >
                        Lập Kế hoạch Mới
                    </Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={2}>
                <Table>
                    <TableHead sx={{ bgcolor: 'primary.light', '& th': { color: 'primary.contrastText', fontWeight: 'bold' } }}>
                        <TableRow>
                            <TableCell>Đơn hàng / Tem</TableCell>
                            <TableCell align="center">1. Cắt</TableCell>
                            <TableCell align="center">2. May</TableCell>
                            <TableCell align="center">3. KCS (QC)</TableCell>
                            <TableCell align="center">4. Đóng gói</TableCell>
                            <TableCell align="center">Trạng thái chung</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {plans.map((plan) => (
                            <TableRow key={plan.id} hover>
                                <TableCell sx={{ width: '20%' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight="bold">{plan.order.code}</Typography>
                                            <Typography variant="body2">{plan.order.customerName}</Typography>
                                        </Box>
                                        <IconButton size="small" onClick={() => handlePrintTicket(plan)}>
                                            <PrintIcon />
                                        </IconButton>
                                    </Box>
                                </TableCell>
                                {renderStageCell(plan, 'CUTTING')}
                                {renderStageCell(plan, 'SEWING')}
                                {renderStageCell(plan, 'QC')}
                                {renderStageCell(plan, 'PACKING')}
                                <TableCell align="center">
                                    <Chip label={plan.status} size="small" color={plan.status === 'COMPLETED' ? 'success' : 'default'} />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Hidden Print Component */}
            <div style={{ display: 'none' }}>
                {printData && (
                    <JobTicket
                        ref={printRef}
                        plan={printData.plan}
                        qrDataUrl={printData.qr}
                    />
                )}
            </div>

            {/* Editing Dialog */}
            <UpdateStageDialog
                open={!!editingStage}
                stage={editingStage}
                onClose={() => setEditingStage(null)}
                onUpdate={fetchData}
            />

            {/* Create Plan Dialog */}
            <Dialog open={openPlanDialog} onClose={() => setOpenPlanDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Lập Kế hoạch Sản xuất</DialogTitle>
                <DialogContent>
                    <TextField
                        select
                        label="Chọn Đơn hàng"
                        fullWidth
                        sx={{ mt: 2 }}
                        value={selectedOrder}
                        onChange={(e) => setSelectedOrder(e.target.value)}
                    >
                        {orders.map((order) => (
                            <MenuItem key={order.id} value={order.id}>
                                {order.code} - {order.customerName}
                            </MenuItem>
                        ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPlanDialog(false)}>Hủy</Button>
                    <Button onClick={handleCreatePlan} variant="contained">Bắt đầu</Button>
                </DialogActions>
            </Dialog>

            {/* Scanner Dialog */}
            <Dialog open={openScanner} onClose={() => setOpenScanner(false)} maxWidth="sm" fullWidth>
                <DialogContent>
                    <QRScanner onScanSuccess={handleScanSuccess} onClose={() => setOpenScanner(false)} />
                </DialogContent>
            </Dialog>
        </Box>
    );
}
