"use client";

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Paper, Table, TableBody, TableCell, TableHead, TableRow, FormControl, InputLabel, Select, MenuItem, Checkbox, TextField } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function CreatePOPage() {
    const [requests, setRequests] = useState<any[]>([]);
    const [suppliers, setSuppliers] = useState<any[]>([]);

    const [selectedSupplier, setSelectedSupplier] = useState("");
    const [selectedRequests, setSelectedRequests] = useState<string[]>([]);
    const [note, setNote] = useState("");

    const router = useRouter();

    useEffect(() => {
        // Fetch Pending Requests
        fetch('/api/procurement')
            .then(res => res.json())
            .then(data => {
                // Filter only PENDING
                setRequests(data.filter((r: any) => r.status === 'PENDING'));
            });

        // Fetch Suppliers (Mock for now or API)
        fetch('/api/data/suppliers') // Might need to create this or use existing
            .then(res => res.json())
            .catch(() => setSuppliers([
                { id: 'S1', name: 'Đại lý Vải Cô Lan' },
                { id: 'S2', name: 'Kho Phụ Liệu Chợ Lớn' }
            ]));
    }, []);

    const handleToggleReq = (id: string) => {
        if (selectedRequests.includes(id)) {
            setSelectedRequests(selectedRequests.filter(r => r !== id));
        } else {
            setSelectedRequests([...selectedRequests, id]);
        }
    };

    const handleSubmit = async () => {
        if (!selectedSupplier || selectedRequests.length === 0) return;

        const res = await fetch('/api/procurement/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                supplierId: selectedSupplier,
                requestIds: selectedRequests,
                note
            })
        });

        if (res.ok) {
            router.push('/dashboard/procurement/orders');
        } else {
            alert("Lỗi tạo PO");
        }
    };

    // Filter requests by supplier if one is selected (optional feature)
    // For now list all

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={3}>Tạo Đơn Mua Hàng Mới</Typography>

            <Box display="flex" gap={3}>
                <Paper sx={{ p: 3, flex: 1 }}>
                    <Typography variant="h6" mb={2}>1. Chọn Nhà Cung Cấp</Typography>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Nhà cung cấp</InputLabel>
                        <Select
                            value={selectedSupplier}
                            label="Nhà cung cấp"
                            onChange={(e) => setSelectedSupplier(e.target.value)}
                        >
                            {suppliers.map(s => (
                                <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        label="Ghi chú đơn hàng"
                        fullWidth
                        multiline
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Paper>

                <Paper sx={{ p: 3, flex: 2 }}>
                    <Typography variant="h6" mb={2}>2. Chọn Yêu Cầu Cần Mua</Typography>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell padding="checkbox"></TableCell>
                                <TableCell>Vật tư</TableCell>
                                <TableCell>Số lượng</TableCell>
                                <TableCell>Đơn hàng nguồn</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {requests.map(req => (
                                <TableRow key={req.id} hover onClick={() => handleToggleReq(req.id)}>
                                    <TableCell padding="checkbox">
                                        <Checkbox checked={selectedRequests.includes(req.id)} />
                                    </TableCell>
                                    <TableCell>{req.materialName}</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold' }}>
                                        {req.quantity} {req.unit}
                                    </TableCell>
                                    <TableCell>{req.order?.code}</TableCell>
                                </TableRow>
                            ))}
                            {requests.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">Không có yêu cầu nào đang chờ.</TableCell>
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
                    disabled={!selectedSupplier || selectedRequests.length === 0}
                    onClick={handleSubmit}
                >
                    Tạo Đơn Hàng ({selectedRequests.length})
                </Button>
            </Box>
        </Box>
    );
}
