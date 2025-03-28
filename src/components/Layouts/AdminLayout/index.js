import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Divider, IconButton, List, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import { createTheme, styled, ThemeProvider, useTheme } from '@mui/material/styles';
import { AlignJustify } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '~/WalletContext'; // Import the WalletContext
import { MainListItems, SecondaryListItems } from '~/components/listItems';
import storageService from '~/components/StorageService/storageService';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
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

const defaultTheme = createTheme();

export function NavbarAdmin() {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [open, setOpen] = useState(true);
    const [anchorElUser, setAnchorElUser] = useState(null);
    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <AppBar position="absolute" open={open}>
            <Toolbar
                sx={{
                    pr: '24px',
                }}
            >
                <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer}
                    sx={{
                        marginRight: '36px',
                        ...(open && { display: 'none' }),
                    }}
                >
                    <MenuIcon />
                </IconButton>

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
                >
                    <MenuItem onClick={handleCloseUserMenu}>
                        <Box>
                            <Typography></Typography>
                        </Box>
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
}

export function Sidebar() {
    const navigate = useNavigate();
    const user = storageService.getItem('userInfo')?.user || null;
    const { currentPoints } = useWallet(); // Use WalletContext to get currentPoints

    const handleLogout = () => {
        // Remove user information from localStorage
        localStorage.removeItem('userInfo');

        // Redirect to the sign-up page
        navigate('/login');
    };

    const handleBuyPoints = () => {
        // Navigate to buy points page
        navigate('/wallet/purchase');
    };

    const [open, setOpen] = useState(true);
    const toggleDrawer = () => {
        setOpen(!open);
    };

    return (
        <Drawer variant="permanent" open={open}>
            <Toolbar
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    px: [1],
                }}
            >
                <Box sx={{ flexGrow: 1 }}></Box>
                <IconButton onClick={toggleDrawer} sx={{ mr: '14px' }}>
                    <AlignJustify />
                </IconButton>
            </Toolbar>
            <Divider />
            <List component="nav">
                <MainListItems />
                <Divider sx={{ my: 1 }} />
            </List>
            <List component="nav">
                <SecondaryListItems />
                <Divider sx={{ my: 1 }} />
            </List>
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 40,
                    left: 0,
                    right: 0,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    p: 2,
                }}
            >
                {user?.roleName === 'COMPANY' && (
                    <Box sx={{ mb: 1 }}>
                        <Typography variant="body1">{user?.company.companyName || 'Admin'}</Typography>
                        <Typography variant="contained" color="primary">
                            Current Points: {currentPoints}
                        </Typography>
                    </Box>
                )}
                <Box sx={{ display: 'flex', gap: 1 }}>
                    {user?.roleName === 'COMPANY' && (
                        <Button variant="contained" color="primary" size="small" fullWidth onClick={handleBuyPoints}>
                            Buy Points
                        </Button>
                    )}
                    <Button variant="outlined" color="secondary" size="small" fullWidth onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>
        </Drawer>
    );
}

export default function AdminLayout({ children }) {
    const theme = useTheme();

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box sx={{ display: 'flex' }}>
                <Sidebar />

                <Box
                    component="main"
                    sx={{
                        backgroundColor:
                            theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                        flexGrow: 1,
                        height: '100vh',
                        overflow: 'auto',
                    }}
                >
                    {children}
                </Box>
            </Box>
        </ThemeProvider>
    );
}
