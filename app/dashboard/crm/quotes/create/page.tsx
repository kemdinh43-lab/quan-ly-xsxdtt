"use client";
import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, TextField, Button, Grid, Table, TableBody, TableCell, TableHead, TableRow, IconButton
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Save as SaveIcon, History as HistoryIcon, AttachMoney as AttachMoneyIcon } from '@mui/icons-material';
import { useRouter, useSearchParams } from 'next/navigation';
import { Popover, List, ListItem, ListItemButton, ListItemText, Chip } from '@mui/material';

export default function CreateQuotePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const customerId = searchParams.get('customerId');

    const [loading, setLoading] = useState(false);

    // History State
    const [historyAnchor, setHistoryAnchor] = useState<null | HTMLElement>(null);
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [activeHistoryIndex, setActiveHistoryIndex] = useState<number>(-1);

    const [formData, setFormData] = useState({
        customerName: "",
        customerAddress: "",
        introText: "Trước tiên, chúng tôi xin cảm ơn sự hợp tác của Quý công ty đối với công ty chúng tôi trong thời gian qua.\nCông ty chúng tôi xin gửi đến bảng báo giá đồng phục cung cấp cho Quý công ty như sau:",
        footerText: "***Giá trên chưa bao gồm thuế VAT. Giao hàng tại kho bên mua."
    });

    // Auto-fill from Customer ID
    useEffect(() => {
        if (customerId) {
            fetch(`/api/crm/customers/${customerId}`)
                .then(res => res.json())
                .then(data => {
                    if (data) {
                        setFormData(prev => ({
                            ...prev,
                            // Prioritize Company Name as requested (No contact name appended)
                            customerName: data.companyName || data.name,
                            customerAddress: data.address || ""
                        }));
                    }
                })
                .catch(err => console.error(err));
        }
    }, [customerId]);

    const [items, setItems] = useState([
        { productName: "Áo lưới màu vàng in chữ Foster", unit: "Cái", quantity: "50-100", price: 130000, consumption: 1.2, imageUrl: "" }
    ]);

    // ... handlers ...
    const handleAddItem = () => {
        setItems([...items, { productName: "", unit: "Cái", quantity: "", price: 0, consumption: 1.2, imageUrl: "" }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const handleShowHistory = async (index: number, event: React.MouseEvent<HTMLElement>) => {
        setHistoryAnchor(event.currentTarget);
        setActiveHistoryIndex(index);
        setHistoryData([]); // Reset

        const currentItem = items[index];
        if (!formData.customerName || !currentItem.productName) {
            alert("Vui lòng nhập Tên Khách và Tên Sản Phẩm để tra cứu!");
            return;
        }

        try {
            const res = await fetch(`/api/crm/pricing/history?customerName=${encodeURIComponent(formData.customerName)}&productName=${encodeURIComponent(currentItem.productName)}`);
            const data = await res.json();
            setHistoryData(data);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSelectHistory = (price: number) => {
        if (activeHistoryIndex !== -1) {
            handleItemChange(activeHistoryIndex, 'price', price);
            setHistoryAnchor(null);
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        const res = await fetch('/api/crm/quotes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, items })
        });
        const data = await res.json();
        if (data.success) {
            router.push(`/dashboard/crm/quotes/${data.id}/print`);
        } else {
            alert("Lỗi khi tạo báo giá!");
            setLoading(false);
        }
    };

    // Fabric Pricing Helper
    const [fabricPrices, setFabricPrices] = useState<any[]>([]);
    const [priceAnchor, setPriceAnchor] = useState<null | HTMLElement>(null);
    const [activePriceIndex, setActivePriceIndex] = useState<number>(-1);

    useEffect(() => {
        fetch('/api/procurement/fabric-prices').then(res => res.json()).then(setFabricPrices);
    }, []);

    const handleShowPricing = (index: number, event: React.MouseEvent<HTMLElement>) => {
        setPriceAnchor(event.currentTarget);
        setActivePriceIndex(index);
    };

    const handleSelectFabric = (fabricPrice: number) => {
        if (activePriceIndex !== -1) {
            const item = items[activePriceIndex];
            const consumption = item.consumption || 1.2;
            const laborCost = 35000; // Hardcoded labor cost/item for MVP
            const estimatedCost = (fabricPrice * consumption) + laborCost;

            // Suggest Price with 30% margin, rounded to nearest 1000
            const suggestedPrice = Math.ceil((estimatedCost * 1.3) / 1000) * 1000;

            handleItemChange(activePriceIndex, 'price', suggestedPrice);
            setPriceAnchor(null);

            // Optional: Show alert or toast about the calculation
            // alert(`Đã tính giá dựa trên: Giá vải ${fabricPrice.toLocaleString()} * ${consumption}m + Công ${laborCost.toLocaleString()} + 30% Lợi nhuận`);
        }
    };

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto', p: 3 }}>
            {/* ... Existing UI ... */}
            <Typography variant="h4" fontWeight="bold" gutterBottom color="primary">Tạo Báo Giá Mới</Typography>

            {/* ... Paper ... */}
            <Paper sx={{ p: 3, mb: 3 }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth label="Tên Khách Hàng (Kính gửi)"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            placeholder="CÔNG TY TNHH ĐIỆN TỬ FOSTER QUẢNG NGÃI"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth label="Địa chỉ Khách Hàng"
                            value={formData.customerAddress}
                            onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                            placeholder="Số 10, Đường ABC, KCN VSIP, Quảng Ngãi"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            fullWidth multiline rows={3} label="Lời mở đầu"
                            value={formData.introText}
                            onChange={(e) => setFormData({ ...formData, introText: e.target.value })}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* QUOTE TABLE (Clean) */}
            <Typography variant="h6" gutterBottom>Chi tiết Báo Giá</Typography>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Sản phẩm</TableCell>
                            <TableCell width="100">ĐVT</TableCell>
                            <TableCell width="120">Số lượng</TableCell>
                            <TableCell width="100">Định mức</TableCell>
                            <TableCell width="180">Đơn giá</TableCell>
                            <TableCell width="200">Link Ảnh (URL)</TableCell>
                            <TableCell width="50"></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item, index) => (
                            <TableRow key={index}>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" value={item.productName}
                                        onChange={(e) => handleItemChange(index, 'productName', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" value={item.unit}
                                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                        placeholder="50-100"
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" type="number" value={item.consumption}
                                        onChange={(e) => handleItemChange(index, 'consumption', e.target.value)}
                                        InputProps={{ endAdornment: <Typography variant="caption">m</Typography> }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" type="number" value={item.price}
                                        onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                                        InputProps={{
                                            endAdornment: (
                                                <Box display="flex">
                                                    <IconButton size="small" onClick={(e) => handleShowHistory(index, e)} title="Lịch sử giá">
                                                        <HistoryIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" onClick={(e) => handleShowPricing(index, e)} title="Tính giá vốn" color="primary">
                                                        <AttachMoneyIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            )
                                        }}
                                    />
                                </TableCell>
                                <TableCell>
                                    <TextField
                                        fullWidth size="small" value={item.imageUrl}
                                        onChange={(e) => handleItemChange(index, 'imageUrl', e.target.value)}
                                        placeholder="URL..."
                                    />
                                </TableCell>
                                <TableCell>
                                    <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button startIcon={<AddIcon />} onClick={handleAddItem} sx={{ mt: 2 }}>Thêm dòng</Button>
            </Paper>

            <Paper sx={{ p: 3, mb: 3 }}>
                <TextField
                    fullWidth multiline rows={2} label="Ghi chú (Footer)"
                    value={formData.footerText}
                    onChange={(e) => setFormData({ ...formData, footerText: e.target.value })}
                />
            </Paper>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button variant="outlined" onClick={() => router.back()}>Hủy</Button>
                <Button
                    variant="contained" size="large"
                    startIcon={<SaveIcon />}
                    disabled={loading}
                    onClick={handleSubmit}
                >
                    {loading ? "Đang tạo..." : "Tạo & Xem Báo Giá"}
                </Button>
            </Box>

            {/* History Popover */}
            <Popover
                open={Boolean(historyAnchor)}
                anchorEl={historyAnchor}
                onClose={() => setHistoryAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ width: 300, p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Lịch sử giá ({historyData.length})</Typography>
                    {historyData.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">Không tìm thấy lịch sử.</Typography>
                    ) : (
                        <List dense>
                            {historyData.map((h, i) => (
                                <ListItem key={i} disablePadding>
                                    <ListItemButton onClick={() => handleSelectHistory(h.price)}>
                                        <ListItemText
                                            primary={`${new Intl.NumberFormat('vi-VN').format(h.price)} đ`}
                                            secondary={`${new Date(h.date).toLocaleDateString('vi-VN')} - SL: ${h.quantity}`}
                                        />
                                        <Chip label={h.status} size="small" color={h.status === 'ACCEPTED' ? 'success' : 'default'} />
                                    </ListItemButton>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Popover>

            {/* Pricing Popover */}
            <Popover
                open={Boolean(priceAnchor)}
                anchorEl={priceAnchor}
                onClose={() => setPriceAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Box sx={{ width: 320, p: 2 }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>Tính giá vốn (Smart Pricing)</Typography>
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 1 }}>
                        Công thức: (Giá Vải * Định mức) + 35k Công + 30% Lãi
                    </Typography>
                    <List dense>
                        {fabricPrices.map((p) => (
                            <ListItem key={p.id} disablePadding>
                                <ListItemButton onClick={() => handleSelectFabric(p.marketPrice)}>
                                    <ListItemText
                                        primary={p.name}
                                        secondary={`${new Intl.NumberFormat('vi-VN').format(p.marketPrice)} đ / ${p.unit || 'm'} (${p.supplier || 'P.Thu mua'})`}
                                    />
                                </ListItemButton>
                            </ListItem>
                        ))}
                    </List>
                    <Button fullWidth size="small" href="/dashboard/settings/pricing" target="_blank">
                        Quản lý giá vải
                    </Button>
                </Box>
            </Popover>
        </Box>
    );
}
