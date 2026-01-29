"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function NewReceiptPage() {
    const [pos, setPOs] = useState<any[]>([]);
    const [selectedPO, setSelectedPO] = useState("");

    // Receipt Items (Material Name, Quantity, Confirm Qty)
    const [items, setItems] = useState<any[]>([]);
    const [note, setNote] = useState("");

    const router = useRouter();

    useEffect(() => {
        // Fetch Sent/Partial POs
        fetch('/api/procurement/orders')
            .then(res => res.json())
            .then(data => {
                setPOs(data.filter((po: any) => po.status === 'SENT' || po.status === 'PARTIAL'));
            });
    }, []);

    const handleSelectPO = (poId: string) => {
        setSelectedPO(poId);
        const po = pos.find(p => p.id === poId);
        if (po) {
            // Map PO items to Receipt Items input
            setItems(po.items.map((item: any) => ({
                materialName: item.materialName,
                materialId: item.materialId,
                orderedQty: item.quantity,
                receivedQty: item.quantity, // Default to full
                unit: item.unit,
                lotNumber: ""
            })));
        }
    };

    const handleQtyChange = (index: number, val: number) => {
        const newItems = [...items];
        newItems[index].receivedQty = val;
        setItems(newItems);
    };

    const handleLotChange = (index: number, val: string) => {
        const newItems = [...items];
        newItems[index].lotNumber = val;
        setItems(newItems);
    };

    const handleSubmit = async () => {
        if (!selectedPO) return;

        const res = await fetch('/api/warehouse/receipts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                purchaseOrderId: selectedPO,
                note,
                items: items.map(i => ({
                    materialName: i.materialName,
                    materialId: i.materialId,
                    quantity: Number(i.receivedQty),
                    unit: i.unit,
                    lotNumber: i.lotNumber
                }))
            })
        });

        if (res.ok) {
            router.push('/dashboard/warehouse/receipts');
        } else {
            alert("Lỗi nhập kho");
        }
    };

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Tạo Phiếu Nhập Kho</Typography>

            <Box display="flex" gap={3}>
                <Paper sx={{ p: 3, flex: 1 }}>
                    <Typography variant="h6" mb={2}>1. Chọn Đơn Mua Hàng (PO)</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Chọn PO</InputLabel>
                        <Select
                            value={selectedPO}
                            label="Chọn PO"
                            onChange={(e) => handleSelectPO(e.target.value)}
                        >
                            {pos.map(p => (
                                <MenuItem key={p.id} value={p.id}>
                                    {p.code} - {p.supplier?.name} ({p.totalAmount?.toLocaleString()}đ)
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Ghi chú nhập kho"
                        fullWidth
                        multiline
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Paper>

                <Paper sx={{ p: 3, flex: 2 }}>
                    <Typography variant="h6" mb={2}>2. Kiểm kê Hàng Nhập</Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Vật tư</TableCell>
                                <TableCell>Đã đặt</TableCell>
                                <TableCell>Thực nhập</TableCell>
                                <TableCell>Số lô (Lot/Batch)</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {items.map((item, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{item.materialName}</TableCell>
                                    <TableCell>{item.orderedQty} {item.unit}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={item.receivedQty}
                                            onChange={(e) => handleQtyChange(idx, Number(e.target.value))}
                                            InputProps={{ endAdornment: <Typography variant="caption" ml={1}>{item.unit}</Typography> }}
                                            sx={{ width: 120 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            size="small"
                                            placeholder="Lot #"
                                            value={item.lotNumber}
                                            onChange={(e) => handleLotChange(idx, e.target.value)}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                            {items.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Vui lòng chọn PO để hiển thị danh sách hàng.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Paper>
            </Box>

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
                <Button onClick={() => router.back()}>Hủy bỏ</Button>
                <Button
                    variant="contained"
                    size="large"
                    disabled={!selectedPO || items.length === 0}
                    onClick={handleSubmit}
                >
                    Nhập Kho & Hoàn Tất PO
                </Button>
            </Box>
        </Box>
    );
}
