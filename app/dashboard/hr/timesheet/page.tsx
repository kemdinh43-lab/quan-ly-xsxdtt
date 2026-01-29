"use client";

import { useState, useEffect } from 'react';
import {
    Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip,
    Button, IconButton, Grid
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today } from '@mui/icons-material';
import { format, startOfWeek, endOfWeek, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function TimesheetPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        fetch('/api/hr/timesheet')
            .then(res => res.json())
            .then(data => setUsers(data));
    }, []);

    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

    const getAttendanceForDay = (user: any, date: Date) => {
        return user.attendances?.find((att: any) => isSameDay(new Date(att.date), date));
    };

    const handlePrevWeek = () => setCurrentDate(subDays(currentDate, 7));
    const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));
    const handleToday = () => setCurrentDate(new Date());

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary">
                    Bảng Chấm Công Tuần
                </Typography>

                <Box display="flex" alignItems="center" bgcolor="white" p={1} borderRadius={2} boxShadow={1}>
                    <IconButton onClick={handlePrevWeek}><ChevronLeft /></IconButton>
                    <Typography sx={{ mx: 2, fontWeight: 'bold', minWidth: 200, textAlign: 'center' }}>
                        {format(startDate, 'dd/MM/yyyy')} - {format(endOfWeek(currentDate, { weekStartsOn: 1 }), 'dd/MM/yyyy')}
                    </Typography>
                    <IconButton onClick={handleNextWeek}><ChevronRight /></IconButton>
                    <Button startIcon={<Today />} onClick={handleToday} sx={{ ml: 1 }}>Hôm nay</Button>
                </Box>
            </Box>

            <TableContainer component={Paper} elevation={3}>
                <Table sx={{ minWidth: 650 }} size="small">
                    <TableHead sx={{ bgcolor: '#1976D2' }}>
                        <TableRow>
                            <TableCell sx={{ color: 'white', fontWeight: 'bold', width: 250 }}>Nhân viên</TableCell>
                            {weekDays.map(day => (
                                <TableCell key={day.toISOString()} align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    {format(day, 'EEEE', { locale: vi })}<br />
                                    <span style={{ fontSize: '0.8em', opacity: 0.8 }}>{format(day, 'dd/MM')}</span>
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} hover>
                                <TableCell component="th" scope="row" sx={{ borderRight: '1px solid #eee' }}>
                                    <Box>
                                        <Typography fontWeight="bold" variant="body2">{user.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">{user.employeeCode || "N/A"}</Typography>
                                        <br />
                                        <Chip label={user.role} size="small" variant="outlined" sx={{ mt: 0.5, fontSize: '0.65rem', height: 20 }} />
                                    </Box>
                                </TableCell>
                                {weekDays.map(day => {
                                    const att = getAttendanceForDay(user, day);
                                    const isToday = isSameDay(day, new Date());

                                    return (
                                        <TableCell
                                            key={day.toISOString()}
                                            align="center"
                                            sx={{
                                                bgcolor: isToday ? '#e3f2fd' : 'inherit',
                                                borderRight: '1px solid #eee',
                                                height: 80,
                                                verticalAlign: 'middle'
                                            }}
                                        >
                                            {att ? (
                                                <Box>
                                                    <Chip
                                                        label={format(new Date(att.checkInTime), 'HH:mm')}
                                                        color="success"
                                                        size="small"
                                                        sx={{ mb: 0.5, fontWeight: 'bold' }}
                                                    />
                                                    {att.checkOutTime ? (
                                                        <Chip
                                                            label={format(new Date(att.checkOutTime), 'HH:mm')}
                                                            color="warning"
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                    ) : (
                                                        <Typography variant="caption" display="block" color="text.secondary">--:--</Typography>
                                                    )}
                                                </Box>
                                            ) : (
                                                <Typography variant="caption" color="text.disabled">-</Typography>
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}
