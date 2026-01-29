"use client";

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Avatar,
    Menu,
    MenuItem,
    useTheme,
    useMediaQuery,
    ListSubheader,
    Chip // Added Chip
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    Category as CategoryIcon,
    LocalShipping as ShippingIcon,
    Factory as FactoryIcon,
    People as PeopleIcon,
    QrCode as QrCodeIcon,
    Settings as SettingsIcon,
    Logout as LogoutIcon,
    ChevronLeft as ChevronLeftIcon,
    Email as EmailIcon,
    Fingerprint as FingerprintIcon,
    DateRange as DateRangeIcon,
    AttachMoney as AttachMoneyIcon,
    Description as DescriptionIcon,
    RequestQuote as RequestQuoteIcon,
    Add as AddIcon,
    ShoppingCart as ShoppingCartIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import '../print.css'; // Import global print styles

const drawerWidth = 280;

const menuGroups = [
    {
        title: "KINH DOANH (SALES)",
        items: [
            { text: 'Tổng quan', icon: <DashboardIcon />, path: '/dashboard' },
            { text: 'Khách hàng (CRM)', icon: <PeopleIcon />, path: '/dashboard/crm' },
            { text: 'Báo giá', icon: <RequestQuoteIcon />, path: '/dashboard/crm/quotes' },
            { text: 'Đơn hàng B2B', icon: <ShippingIcon />, path: '/dashboard/orders' },
            { text: 'Chiến dịch MKT', icon: <EmailIcon />, path: '/dashboard/crm/marketing' },
            { text: 'Quản lý Leads', icon: <PeopleIcon />, path: '/dashboard/crm/leads' },
        ]
    },
    {
        title: "VẬN HÀNH (OPERATION)",
        items: [
            { text: 'Mua hàng (PO)', icon: <ShoppingCartIcon />, path: '/dashboard/procurement/orders' },
            { text: 'Nhập kho Vải', icon: <CategoryIcon />, path: '/dashboard/warehouse/receipts' },
            { text: 'Quản lý Sản xuất', icon: <FactoryIcon />, path: '/dashboard/production' },
            { text: 'Kho thành phẩm', icon: <InventoryIcon />, path: '/dashboard/products' },
            // { text: 'Giao hàng', icon: <ShippingIcon />, path: '/dashboard/delivery' }, // Pending
            { text: 'QR Code Tracking', icon: <QrCodeIcon />, path: '/dashboard/qrcode' },
        ]
    },
    {
        title: "QUẢN TRỊ (ADMIN)",
        items: [
            { text: 'Nhân sự & Chấm công', icon: <PeopleIcon />, path: '/dashboard/users' },
            { text: 'Máy Chấm công (Kiosk)', icon: <FingerprintIcon />, path: '/dashboard/hr/kiosk' },
            { text: 'Duyệt Đơn từ', icon: <DescriptionIcon />, path: '/dashboard/hr/requests' },
            { text: 'Bảng công', icon: <DateRangeIcon />, path: '/dashboard/hr/timesheet' },
            { text: 'Bảng lương', icon: <AttachMoneyIcon />, path: '/dashboard/hr/payroll', role: 'ADMIN' },
            { text: 'Cài đặt hệ thống', icon: <SettingsIcon />, path: '/dashboard/settings' },
        ]
    }
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = usePathname();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [open, setOpen] = useState(!isMobile);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [pendingPRCount, setPendingPRCount] = useState(0);

    useEffect(() => {
        const fetchBadge = async () => {
            try {
                const res = await fetch('/api/procurement/count');
                const data = await res.json();
                if (data.count) setPendingPRCount(data.count);
            } catch (error) {
                console.error("Failed to fetch badges", error);
            }
        };
        fetchBadge();
        // Optional: Poll every minute
        const interval = setInterval(fetchBadge, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleDrawerToggle = () => {
        setOpen(!open);
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        signOut({ callbackUrl: '/login' });
        handleClose();
    };

    if (status === "loading") return null;

    // Redirect logic should be handled by middleware, but fallback here
    if (!session) {
        // This component renders server-side safe content or redirects, 
        // but for client-side simply returning null creates a flash.
        // Let middleware handle it ideally.
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: 'white',
                    color: 'text.primary',
                    boxShadow: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    width: isMobile ? '100%' : `calc(100% - ${open ? drawerWidth : 72}px)`,
                    ml: isMobile ? 0 : `${open ? drawerWidth : 72}px`,
                    transition: theme.transitions.create(['width', 'margin'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <IconButton
                        color="inherit"
                        aria-label="toggle drawer"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { xs: 'none', md: 'flex' } }}
                    >
                        {open ? <ChevronLeftIcon /> : <MenuIcon />}
                    </IconButton>

                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '10px' }} />
                        <Typography variant="h6" noWrap component="div" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                            Dương Thành Tín Manager
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, fontWeight: 500 }}>
                            {session?.user?.name}
                        </Typography>
                        <Avatar
                            sx={{ bgcolor: 'secondary.main', cursor: 'pointer' }}
                            onClick={handleMenu}
                        >
                            {session?.user?.name?.[0] || 'U'}
                        </Avatar>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorEl}
                            anchorOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            keepMounted
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}
                            open={Boolean(anchorEl)}
                            onClose={handleClose}
                        >
                            <MenuItem onClick={handleClose}>Hồ sơ cá nhân</MenuItem>
                            <Divider />
                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" color="error" />
                                </ListItemIcon>
                                Đăng xuất
                            </MenuItem>
                        </Menu>
                    </Box>
                </Toolbar>
            </AppBar>

            <Drawer
                variant={isMobile ? "temporary" : "permanent"}
                open={open}
                onClose={handleDrawerToggle}
                sx={{
                    width: open ? drawerWidth : 72,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: {
                        width: open ? drawerWidth : 72,
                        boxSizing: 'border-box',
                        bgcolor: '#0D47A1', // Dark Blue Sidebar
                        color: 'white',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        overflowX: 'hidden',
                    },
                }}
            >
                <Toolbar />
                <Box sx={{ overflow: 'auto', mt: 2 }}>
                    <List>
                        {menuGroups.map((group, groupIndex) => (
                            <Box key={group.title}>
                                {open && groupIndex > 0 && <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', my: 1 }} />}
                                {open && (
                                    <ListSubheader sx={{ bgcolor: 'transparent', color: '#90caf9', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', lineHeight: '30px' }}>
                                        {group.title}
                                    </ListSubheader>
                                )}
                                {group.items.map((item) => {
                                    // Basic Role Check
                                    const userRole = (session?.user as any)?.role;
                                    if (item.role && userRole !== item.role) return null;

                                    const isActive = router === item.path;
                                    const showBadge = item.text === 'Mua hàng & Kho Vải' && pendingPRCount > 0;

                                    return (
                                        <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                                            <Link href={item.path} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <ListItemButton
                                                    sx={{
                                                        minHeight: 48,
                                                        justifyContent: open ? 'initial' : 'center',
                                                        px: 2.5,
                                                        bgcolor: isActive ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                        borderRight: isActive ? `4px solid #F57C00` : 'none', // Orange accent
                                                        '&:hover': {
                                                            bgcolor: 'rgba(255, 255, 255, 0.05)',
                                                        }
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            minWidth: 0,
                                                            mr: open ? 2 : 'auto',
                                                            justifyContent: 'center',
                                                            color: isActive ? '#F57C00' : 'rgba(255,255,255,0.7)',
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.text}
                                                        sx={{
                                                            opacity: open ? 1 : 0,
                                                            color: isActive ? 'white' : 'rgba(255,255,255,0.8)',
                                                            '& .MuiTypography-root': { fontWeight: isActive ? 600 : 400 }
                                                        }}
                                                    />
                                                    {showBadge && open && (
                                                        <Chip
                                                            label={pendingPRCount}
                                                            size="small"
                                                            color="error"
                                                            sx={{ height: 20, minWidth: 20, fontSize: '0.75rem', fontWeight: 'bold' }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </Link>
                                        </ListItem>
                                    );
                                })}
                            </Box>
                        ))}
                    </List>
                </Box>

                {/* Footer / Version if needed */}
                {open && (
                    <Box sx={{ position: 'absolute', bottom: 16, left: 0, width: '100%', textAlign: 'center', opacity: 0.5 }}>
                        <Typography variant="caption" color="inherit">
                            v1.0.0
                        </Typography>
                    </Box>
                )}
            </Drawer>

            <Box component="main" sx={{ flexGrow: 1, p: 3, width: '100%', bgcolor: '#f8fafc', minHeight: '100vh' }}>
                <Toolbar /> {/* Spacer for AppBar */}
                {children}
            </Box>
        </Box>
    );
}
