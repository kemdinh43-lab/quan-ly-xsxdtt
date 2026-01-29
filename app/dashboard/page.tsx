"use client";

import { useEffect, useState } from 'react';
import {
    Box, Grid, Paper, Typography, Card, CardContent,
    List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
    Divider, CircularProgress
} from '@mui/material';
import {
    Inventory as InventoryIcon,
    ShoppingCart as OrderIcon,
    Factory as FactoryIcon,
    Warning as WarningIcon,
    History as HistoryIcon,
    AttachMoney as AttachMoneyIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

function StatCard({ title, value, icon, color }: any) {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                        <Typography color="textSecondary" gutterBottom variant="overline">
                            {title}
                        </Typography>
                        <Typography variant="h4" component="div" fontWeight="bold">
                            {value}
                        </Typography>
                    </Box>
                    <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main`, width: 56, height: 56 }}>
                        {icon}
                    </Avatar>
                </Box>
            </CardContent>
        </Card>
    );
}

export default function DashboardPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                setStats(data);
            } catch (error) {
                console.error("Failed to load stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
    }

    if (!stats) return <Typography>Không thể tải dữ liệu.</Typography>;

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ mb: 3 }} color="primary">
                Tổng quan Xưởng
            </Typography>

            {/* KPI Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Doanh thu Tháng này"
                        value={`${(stats.kpi.revenue || 0).toLocaleString()} đ`}
                        icon={<AttachMoneyIcon />}
                        color="success" // Money is Green
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Đơn hàng Đang chạy"
                        value={stats.kpi.activeOrders}
                        icon={<OrderIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Yêu cầu Mua (Pending)"
                        value={stats.kpi.pendingPR || 0}
                        icon={<ShoppingCartIcon />}
                        color="warning" // Warning for Pending Actions
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title="Kho Vải (Cảnh báo)"
                        value={stats.kpi.lowStock}
                        icon={<WarningIcon />}
                        color="error"
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3}>
                {/* Production Progress Chart (Bar) */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Paper sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Tiến độ Sản xuất</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <BarChart data={stats.productionChart} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <RechartsTooltip />
                                <Legend />
                                <Bar dataKey="completed" name="Đã xong" fill="#4caf50" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="target" name="Mục tiêu" fill="#e0e0e0" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Material Distribution Chart (Pie) */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 3, height: '400px' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Cơ cấu Vật tư</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <PieChart>
                                <Pie
                                    data={stats.materialDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.materialDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>

                {/* Recent Activity Feed - Adjusted Width */}
                <Grid size={{ xs: 12, md: 3 }}>
                    <Paper sx={{ p: 3, height: '400px', overflow: 'auto' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <HistoryIcon sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="h6" fontWeight="bold">Hoạt động</Typography>
                        </Box>
                        <List>
                            {stats.activities.map((act: any, idx: number) => (
                                <div key={idx}>
                                    <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                        <ListItemAvatar sx={{ minWidth: 40 }}>
                                            <Avatar sx={{ width: 32, height: 32, bgcolor: act.type === 'ORDER' ? 'primary.light' : 'secondary.light' }}>
                                                {act.type === 'ORDER' ? <OrderIcon fontSize="inherit" /> : <InventoryIcon fontSize="inherit" />}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="caption" fontWeight="bold">
                                                    {act.type === 'ORDER' ? 'Đơn hàng' : 'Kho'}
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography component="span" variant="caption" color="text.primary" display="block" sx={{ lineHeight: 1.2 }}>
                                                        {act.message}
                                                    </Typography>
                                                    <Typography component="span" variant="caption" color="text.secondary">
                                                        {formatDistanceToNow(new Date(act.time), { addSuffix: true, locale: vi })}
                                                    </Typography>
                                                </>
                                            }
                                        />
                                    </ListItem>
                                    {idx < stats.activities.length - 1 && <Divider component="li" />}
                                </div>
                            ))}
                            {stats.activities.length === 0 && <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 5 }}>Chưa có hoạt động</Typography>}
                        </List>
                    </Paper>
                </Grid>

                {/* Order Trend Chart (Line) - Full Width Below */}
                <Grid size={{ xs: 12 }}>
                    <Paper sx={{ p: 3, height: '350px' }}>
                        <Typography variant="h6" gutterBottom fontWeight="bold">Xu hướng Đơn hàng (7 ngày qua)</Typography>
                        <ResponsiveContainer width="100%" height="90%">
                            <LineChart
                                data={stats.orderTrend}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis allowDecimals={false} />
                                <RechartsTooltip />
                                <Legend />
                                <Line type="monotone" dataKey="count" name="Số lượng Đơn" stroke="#8884d8" activeDot={{ r: 8 }} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
