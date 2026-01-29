import { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, MenuItem, Box, Typography
} from '@mui/material';

interface UpdateStageDialogProps {
    open: boolean;
    stage: any;
    onClose: () => void;
    onUpdate: () => void;
}

export default function UpdateStageDialog({ open, stage, onClose, onUpdate }: UpdateStageDialogProps) {
    const [formData, setFormData] = useState({
        quantityProduced: 0,
        quantityError: 0,
        status: 'PENDING'
    });

    useEffect(() => {
        if (stage) {
            setFormData({
                quantityProduced: stage.quantityProduced || 0,
                quantityError: stage.quantityError || 0,
                status: stage.status || 'PENDING'
            });
        }
    }, [stage]);

    const handleSubmit = async () => {
        try {
            const res = await fetch('/api/production/stage', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stageId: stage.id,
                    ...formData
                })
            });
            if (res.ok) {
                onUpdate();
                onClose();
            }
        } catch (error) {
            alert("Lỗi cập nhật tiến độ");
        }
    };

    if (!stage) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>Cập nhật: {stage.name}</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="body2" gutterBottom>
                        Mục tiêu: <strong>{stage.quantityTarget}</strong>
                    </Typography>
                    <TextField
                        label="Số lượng hoàn thành"
                        type="number"
                        fullWidth
                        value={formData.quantityProduced}
                        onChange={(e) => setFormData({ ...formData, quantityProduced: parseInt(e.target.value) })}
                    />
                    <TextField
                        label="Số lượng lỗi (Hỏng/Sửa)"
                        type="number"
                        fullWidth
                        color="error"
                        value={formData.quantityError}
                        onChange={(e) => setFormData({ ...formData, quantityError: parseInt(e.target.value) })}
                    />
                    <TextField
                        select
                        label="Trạng thái"
                        fullWidth
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                        <MenuItem value="PENDING">Chờ xử lý</MenuItem>
                        <MenuItem value="IN_PROGRESS">Đang thực hiện</MenuItem>
                        <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                    </TextField>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button onClick={handleSubmit} variant="contained" color="primary">
                    Lưu cập nhật
                </Button>
            </DialogActions>
        </Dialog>
    );
}
