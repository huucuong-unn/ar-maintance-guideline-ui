import MenuIcon from '@mui/icons-material/Menu';
import {
    Box,
    Button,
    Divider,
    IconButton,
    List,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
    Avatar,
    Badge,
    Chip,
    useMediaQuery,
    ListItemIcon,
    ListItemText,
    Paper,
    Tooltip,
    ListItemButton,
    DialogTitle,
    Dialog,
    DialogContent,
} from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import { createTheme, styled, ThemeProvider, useTheme } from '@mui/material/styles';
import { AlignJustify, AppWindowMac } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWallet } from '~/WalletContext'; // Import the WalletContext
import { MainListItems, SecondaryListItems } from '~/components/listItems';
import storageService from '~/components/StorageService/storageService';

// Icons
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import HelpIcon from '@mui/icons-material/Help';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import InputBase from '@mui/material/InputBase';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const drawerWidth = 260;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' })(({ theme, open }) => ({
    '& .MuiDrawer-paper': {
        position: 'relative',
        whiteSpace: 'nowrap',
        width: drawerWidth,
        backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.background.default,
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: open ? '4px 0 10px rgba(0,0,0,0.05)' : 'none',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
        boxSizing: 'border-box',
        ...(!open && {
            overflowX: 'hidden',
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            width: theme.spacing(7),
            [theme.breakpoints.up('sm')]: {
                width: theme.spacing(9),
            },
        }),
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('md')]: {
            width: '20ch',
        },
    },
}));

// Custom styled list item button for sidebar
const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
    margin: '4px 8px',
    borderRadius: '8px',
    ...(active && {
        backgroundColor: theme.palette.primary.light,
        color: theme.palette.primary.main,
        '& .MuiListItemIcon-root': {
            color: theme.palette.primary.main,
        },
    }),
}));

export function NavbarAdmin({ open, toggleDrawer }) {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [anchorElUser, setAnchorElUser] = useState(null);
    const [anchorElNotifications, setAnchorElNotifications] = useState(null);
    const { currentPoints } = useWallet();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const location = useLocation();
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    // Get page title based on current route
    const getPageTitle = () => {
        const path = location.pathname;
        if (path.includes('/dashboard')) return 'Dashboard';
        if (path.includes('/guideline')) return 'Guidelines';
        if (path.includes('/machines-management')) return 'Machines';
        if (path.includes('/machines-type-management')) return 'Machine Types';
        if (path.includes('/company-request-management')) return 'Company Requests';
        if (path.includes('/model-management')) return 'Models';
        if (path.includes('/point-request-management')) return 'Point Requests';
        if (path.includes('/payment/history')) return 'Payment';
        if (path.includes('/wallet')) return 'Wallet';
        if (path.includes('/profile')) return 'Profile';
        // Add more page titles based on your routes
        return 'Dashboard'; // Default title
    };

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleOpenNotifications = (event) => {
        setAnchorElNotifications(event.currentTarget);
    };

    const handleCloseNotifications = () => {
        setAnchorElNotifications(null);
    };

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
        handleCloseUserMenu();
    };

    const handleProfile = () => {
        navigate('/profile');
        handleCloseUserMenu();
    };

    const handleGoToWallet = () => {
        navigate('/wallet');
        handleCloseUserMenu();
    };

    const handleSettings = () => {
        navigate('/settings');
        handleCloseUserMenu();
    };

    const handleHelp = () => {
        navigate('/help');
        handleCloseUserMenu();
    };

    return (
        <AppBar position="fixed" open={open} color="default">
            <Toolbar
                sx={{
                    pr: '24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <IconButton
                        edge="start"
                        color="inherit"
                        aria-label="open drawer"
                        onClick={toggleDrawer}
                        sx={{
                            marginRight: '16px',
                            ...(open && { display: 'none' }),
                        }}
                    >
                        <MenuIcon />
                    </IconButton>

                    <Typography
                        component="h1"
                        variant="h6"
                        color="inherit"
                        sx={{
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {!isMobile && (
                            <DashboardIcon
                                sx={{
                                    mr: 1,
                                    color: theme.palette.primary.main,
                                }}
                            />
                        )}
                        {getPageTitle()}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title="View guideline creation help">
                        <IconButton color="primary" onClick={() => setShowHelpDialog(true)} sx={{ ml: 1 }}>
                            <HelpOutlineIcon />
                        </IconButton>
                    </Tooltip>
                    {/* Help Dialog */}
                    <Dialog
                        open={showHelpDialog}
                        onClose={() => setShowHelpDialog(false)}
                        maxWidth="md"
                        fullWidth
                        PaperProps={{
                            sx: {
                                borderRadius: 2,
                                p: 2,
                            },
                        }}
                    >
                        <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#051D40', pb: 1 }}>
                            Guideline Creation Guide
                        </DialogTitle>
                        <DialogContent>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                    Step 1: Create Basic Information
                                </Typography>
                                <Typography paragraph>
                                    Fill in all the required fields to set up your guideline. This includes the title,
                                    machine type, model, status, and a short description that summarizes what this
                                    guideline is for.
                                </Typography>

                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                    Step 2: Create Instruction Detail
                                </Typography>
                                <Typography paragraph>
                                    After saving the basic information, you'll be able to access the Instruction tab
                                    where you can add detailed steps based on the 3D model. Each instruction detail
                                    should provide clear guidance for a specific action.
                                </Typography>

                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                    Step 3: Publish Your Guideline
                                </Typography>
                                <Typography paragraph>
                                    Once you've completed all necessary instructions, you can set the status to "Active"
                                    to publish your guideline and make it available to employees. Remember that each
                                    instruction detail will consume 3 points from your account balance.
                                </Typography>

                                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                    Important Information:
                                </Typography>
                                <Typography component="div">
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                        <li>
                                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                                                Machine & Model Selection:
                                            </Typography>
                                            <Typography paragraph>
                                                Select the appropriate machine type and model to ensure your guideline
                                                is correctly associated with the right equipment.
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Image Upload:</Typography>
                                            <Typography paragraph>
                                                The image you upload will be displayed on the guideline card in the main
                                                dashboard, helping users identify the guideline visually.
                                            </Typography>
                                        </li>
                                        <li>
                                            <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Points System:</Typography>
                                            <Typography paragraph>
                                                Creating detailed instructions uses points from your company account.
                                                Make sure you have sufficient points before starting a complex
                                                guideline.
                                            </Typography>
                                        </li>
                                    </ul>
                                </Typography>
                            </Box>
                        </DialogContent>
                        <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, pt: 1 }}>
                            <Button
                                onClick={() => setShowHelpDialog(false)}
                                variant="contained"
                                sx={{
                                    textTransform: 'none',
                                    borderRadius: 1.5,
                                    px: 4,
                                    backgroundColor: '#0f6cbf',
                                    '&:hover': {
                                        backgroundColor: '#0a5ca8',
                                    },
                                }}
                            >
                                Got It
                            </Button>
                        </Box>
                    </Dialog>
                    {userInfo?.roleName === 'COMPANY' && (
                        <Tooltip title="Current available points">
                            <Chip
                                icon={<AccountBalanceWalletIcon />}
                                label={`${currentPoints} Points`}
                                color="primary"
                                variant="outlined"
                                sx={{
                                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                                    fontWeight: 'bold',
                                    borderColor: 'primary.light',
                                    '&:hover': {
                                        bgcolor: 'rgba(25, 118, 210, 0.12)',
                                    },
                                    display: { xs: 'none', sm: 'flex' },
                                }}
                                onClick={() => navigate('/wallet')}
                            />
                        </Tooltip>
                    )}

                    <Tooltip title="Notifications">
                        <IconButton
                            color="inherit"
                            onClick={handleOpenNotifications}
                            sx={{
                                backgroundColor: Boolean(anchorElNotifications) ? 'rgba(0,0,0,0.04)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                            }}
                        >
                            <Badge badgeContent={2} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={userInfo?.company?.companyName || userInfo?.email || 'User'}>
                        <IconButton
                            onClick={handleOpenUserMenu}
                            color="inherit"
                            sx={{
                                ml: 1,
                                backgroundColor: Boolean(anchorElUser) ? 'rgba(0,0,0,0.04)' : 'transparent',
                                '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                            }}
                        >
                            {userInfo?.company?.companyName ? (
                                <Avatar
                                    alt={userInfo.company.companyName}
                                    src="/static/company-logo.png" // Replace with actual logo path
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        bgcolor: 'primary.main',
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {userInfo.company.companyName.charAt(0)}
                                </Avatar>
                            ) : (
                                <AccountCircleIcon />
                            )}
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Notifications Menu */}
                <Menu
                    sx={{ mt: '45px' }}
                    id="menu-notifications"
                    anchorEl={anchorElNotifications}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElNotifications)}
                    onClose={handleCloseNotifications}
                    PaperProps={{
                        elevation: 2,
                        sx: {
                            minWidth: '320px',
                            maxWidth: '400px',
                            mt: 0.5,
                            borderRadius: '8px',
                            maxHeight: '70vh',
                            overflowY: 'auto',
                        },
                    }}
                >
                    <Box
                        sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <Typography variant="subtitle1" fontWeight="bold">
                            Notifications
                        </Typography>
                        <Button size="small" color="primary">
                            Mark all as read
                        </Button>
                    </Box>
                    <Divider />

                    {/* Notification items */}
                    <MenuItem onClick={handleCloseNotifications} sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 38, height: 38 }}>
                                <NotificationsIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    New payment received
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Payment of $150 has been processed successfully
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    2 hours ago
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>

                    <MenuItem onClick={handleCloseNotifications} sx={{ py: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                            <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 38, height: 38 }}>
                                <PersonIcon fontSize="small" />
                            </Avatar>
                            <Box>
                                <Typography variant="body2" fontWeight="medium">
                                    New employee account created
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    John Doe has joined your company
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    1 day ago
                                </Typography>
                            </Box>
                        </Box>
                    </MenuItem>

                    <Divider />
                    <Box sx={{ p: 1 }}>
                        <Button fullWidth size="small">
                            View all notifications
                        </Button>
                    </Box>
                </Menu>

                {/* User Menu */}
                <Menu
                    sx={{ mt: '45px' }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                    PaperProps={{
                        elevation: 2,
                        sx: {
                            minWidth: '220px',
                            mt: 0.5,
                            borderRadius: '8px',
                            '& .MuiMenuItem-root': {
                                py: 1,
                            },
                        },
                    }}
                >
                    <Box sx={{ px: 2, py: 1, mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            {userInfo?.company?.companyName || userInfo?.email || 'User'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {userInfo?.roleName || 'User'}
                        </Typography>
                    </Box>

                    <Divider />

                    <MenuItem onClick={handleProfile}>
                        <ListItemIcon>
                            <PersonIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Profile</ListItemText>
                    </MenuItem>

                    {userInfo?.roleName === 'COMPANY' && (
                        <MenuItem onClick={handleGoToWallet}>
                            <ListItemIcon>
                                <AccountBalanceWalletIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Wallet</ListItemText>
                        </MenuItem>
                    )}

                    <MenuItem onClick={handleSettings}>
                        <ListItemIcon>
                            <SettingsIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Settings</ListItemText>
                    </MenuItem>

                    <MenuItem onClick={handleHelp}>
                        <ListItemIcon>
                            <HelpIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>Help & Support</ListItemText>
                    </MenuItem>

                    <Divider />

                    <MenuItem onClick={handleLogout}>
                        <ListItemIcon>
                            <ExitToAppIcon fontSize="small" color="error" />
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ color: 'error' }}>Logout</ListItemText>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const user = storageService.getItem('userInfo')?.user || null;
    const { currentPoints, fetchWallet } = useWallet();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handleLogout = () => {
        localStorage.removeItem('userInfo');
        navigate('/login');
    };

    const handleBuyPoints = () => {
        navigate('/wallet/purchase');
    };

    useEffect(() => {
        fetchWallet();
    }, [user]);

    const [open, setOpen] = useState(!isMobile);

    const toggleDrawer = () => {
        setOpen(!open);
    };

    // Check if the route is active
    const isRouteActive = (route) => {
        return location.pathname === route || location.pathname.startsWith(route + '/');
    };

    // Adjust drawer state based on screen size
    useEffect(() => {
        setOpen(!isMobile);
    }, [isMobile]);

    return (
        <>
            <NavbarAdmin open={open} toggleDrawer={toggleDrawer} />
            <Drawer
                variant="permanent"
                open={open}
                sx={{
                    height: '100%',
                    '& .MuiDrawer-paper': {
                        position: 'relative',
                        whiteSpace: 'nowrap',
                        width: open ? drawerWidth : theme.spacing(7),
                        [theme.breakpoints.up('sm')]: {
                            width: open ? drawerWidth : theme.spacing(9),
                        },
                        backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.background.default,
                        borderRight: `1px solid ${theme.palette.divider}`,
                        boxShadow: open ? '4px 0 10px rgba(0,0,0,0.05)' : 'none',
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                        boxSizing: 'border-box',
                        overflowX: 'hidden',
                        // Đảm bảo drawer có chiều cao đầy đủ
                        height: '100vh',
                        display: 'flex',
                        flexDirection: 'column',
                    },
                }}
            >
                {/* Phần header giữ nguyên */}
                <Toolbar
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        px: [1],
                        height: '64px',
                        flexShrink: 0, // Không cho phép phần này co lại
                    }}
                >
                    <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                        {open ? (
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="primary"
                                sx={{ ml: 2, display: 'flex', alignItems: 'center' }}
                            >
                                ARGM
                            </Typography>
                        ) : (
                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                                <img src="/logo-icon.png" alt="AR" style={{ height: '28px' }} />
                            </Box>
                        )}
                    </Box>
                    <IconButton
                        onClick={toggleDrawer}
                        sx={{
                            borderRadius: '8px',
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            '&:hover': { backgroundColor: 'rgba(0,0,0,0.08)' },
                        }}
                    >
                        {open ? <CloseIcon /> : <AlignJustify />}
                    </IconButton>
                </Toolbar>
                <Divider />

                {/* Phần welcome card (nếu drawer mở) */}
                {open && (
                    <Box sx={{ px: 3, py: 2, flexShrink: 0 }}>
                        {' '}
                        {/* Không cho phép phần này co lại */}
                        <Paper
                            elevation={0}
                            sx={{
                                p: 2,
                                borderRadius: '10px',
                                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                color: 'white',
                            }}
                        >
                            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                                Welcome back,
                            </Typography>
                            <Typography variant="body1" fontWeight="bold" gutterBottom noWrap>
                                {user?.company?.companyName || user?.email || 'User'}
                            </Typography>
                            {user?.roleName === 'COMPANY' && (
                                <Chip
                                    icon={<AccountBalanceWalletIcon fontSize="small" />}
                                    label={`${currentPoints} Points`}
                                    size="small"
                                    sx={{
                                        mt: 1,
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        color: 'white',
                                        fontWeight: 'medium',
                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
                                    }}
                                />
                            )}
                        </Paper>
                    </Box>
                )}

                {/* ĐÂY LÀ PHẦN THAY ĐỔI CHÍNH */}
                {/* Phần menu sẽ tự động co giãn và có scroll riêng */}
                <Box
                    sx={{
                        flexGrow: 1, // Sẽ chiếm hết không gian còn lại
                        px: open ? 2 : 0,
                        overflow: 'hidden', // Ẩn overflow tổng thể
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    {/* MAIN MENU */}
                    <Box sx={{ flexShrink: 0 }}>
                        {' '}
                        {/* Phần tiêu đề không co giãn */}
                        {open && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ px: 3, py: 1, fontWeight: 'medium' }}
                            >
                                MAIN MENU
                            </Typography>
                        )}
                        <Divider sx={{ my: 1 }} />
                    </Box>

                    {/* MainListItems không cuộn riêng */}
                    <List component="nav" sx={{ flexShrink: 0 }}>
                        <MainListItems />
                    </List>

                    {/* MANAGEMENT */}
                    <Box sx={{ flexShrink: 0 }}>
                        {' '}
                        {/* Phần tiêu đề không co giãn */}
                        {open && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ px: 3, py: 1, mt: 2, fontWeight: 'medium' }}
                            >
                                MANAGEMENT
                            </Typography>
                        )}
                        <Divider sx={{ my: 1 }} />
                    </Box>

                    {/* SecondaryListItems với scroll riêng */}
                    <Box
                        sx={{
                            flexGrow: 1, // Chiếm hết phần còn lại
                            overflow: 'auto', // Chỉ phần này có scroll
                            '&::-webkit-scrollbar': {
                                width: '6px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(0,0,0,0.2)',
                                borderRadius: '3px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(0,0,0,0.05)',
                            },
                        }}
                    >
                        <List component="nav">
                            <SecondaryListItems />
                        </List>
                    </Box>
                </Box>

                {/* Phần footer */}
                <Box
                    sx={{
                        borderTop: '1px solid',
                        borderColor: 'divider',
                        p: open ? 2 : 1,
                        flexShrink: 0, // Không cho phép phần này co lại
                    }}
                >
                    {user?.roleName === 'COMPANY' && (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                size="medium"
                                startIcon={open ? <ShoppingCartIcon /> : null}
                                sx={{
                                    mb: 1,
                                    textTransform: 'none',
                                    borderRadius: '8px',
                                    boxShadow: 'none',
                                    '&:hover': { boxShadow: '0 2px 8px rgba(0,0,0,0.15)' },
                                }}
                                onClick={handleBuyPoints}
                            >
                                {open ? 'Buy Points' : <ShoppingCartIcon />}
                            </Button>
                            <br />
                        </>
                    )}

                    <Button
                        variant="outlined"
                        color="inherit"
                        fullWidth
                        size="medium"
                        startIcon={open ? <ExitToAppIcon /> : null}
                        sx={{
                            textTransform: 'none',
                            borderRadius: '8px',
                            borderColor: 'rgba(0,0,0,0.12)',
                        }}
                        onClick={handleLogout}
                    >
                        {open ? 'Logout' : <ExitToAppIcon />}
                    </Button>
                </Box>
            </Drawer>
        </>
    );
}

// Modified listItems.js for the sidebar to support the active state
export const CustomMainListItems = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleNavigate = (path) => {
        navigate(path);
        window.scrollTo(0, 0);
    };

    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const role = userInfo?.role?.roleName;

    // Check if the route is active
    const isRouteActive = (route) => {
        return location.pathname === route || location.pathname.startsWith(route + '/');
    };

    const companyRoutes = [
        {
            route: '/company/guideline',
            icon: <AppWindowMac />,
            title: 'My Guidelines',
        },
    ];

    const adminRoutes = [
        {
            route: '/admin/dashboard',
            icon: <DashboardIcon />,
            title: 'Dashboard',
        },
    ];

    return (
        <>
            {role === 'COMPANY' &&
                companyRoutes.map((route, index) => (
                    <StyledListItemButton
                        key={index}
                        onClick={() => handleNavigate(route.route)}
                        active={isRouteActive(route.route)}
                    >
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </StyledListItemButton>
                ))}

            {role === 'ADMIN' &&
                adminRoutes.map((route, index) => (
                    <StyledListItemButton
                        key={index}
                        onClick={() => handleNavigate(route.route)}
                        active={isRouteActive(route.route)}
                    >
                        <ListItemIcon>{route.icon}</ListItemIcon>
                        <ListItemText primary={route.title} />
                    </StyledListItemButton>
                ))}
        </>
    );
};

export default function AdminLayout({ children }) {
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex' }}>
            <Sidebar />

            <Box
                component="main"
                sx={{
                    backgroundColor: theme.palette.mode === 'light' ? '#f8f9fa' : theme.palette.grey[900],
                    flexGrow: 1,
                    height: '100vh',
                    overflow: 'auto',
                    pt: '64px', // Add padding to account for AppBar height
                }}
            >
                <Box sx={{ p: 3 }}>{children}</Box>
            </Box>
        </Box>
    );
}
