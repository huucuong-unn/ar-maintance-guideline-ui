import { createTheme, styled, ThemeProvider, useTheme } from '@mui/material/styles';

import { Alert, Box, Divider, IconButton, List, Menu, MenuItem, Toolbar, Typography } from '@mui/material';

import Logout from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import MuiAppBar from '@mui/material/AppBar';
import MuiDrawer from '@mui/material/Drawer';
import ListItemIcon from '@mui/material/ListItemIcon';
import { useNavigate } from 'react-router-dom';
import { AlignJustify } from 'lucide-react';

import { MainListItems, SecondaryListItems } from '~/components/listItems';

import { useEffect, useState } from 'react';
import storageService from '~/components/StorageService/storageService';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import PaymentAPI from '~/API/PaymentAPI';

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
    const [open, setOpen] = useState(true);
    const [anchorElUser, setAnchorElUser] = useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const toggleDrawer = () => {
        setOpen(!open);
    };

    function notificationsLabel(count) {
        if (count === 0) {
            return 'no notifications';
        }
        if (count > 99) {
            return 'more than 99 notifications';
        }
        return `${count} notifications`;
    }

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

                {/*<IconButton color="inherit" aria-label={notificationsLabel(100)} onClick={handleOpenUserMenu}>*/}
                {/*    <Badge badgeContent={100} color="secondary">*/}
                {/*        <NotificationsIcon />*/}
                {/*    </Badge>*/}
                {/*</IconButton>*/}
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

    const handleLogout = () => {
        // Remove user information from localStorage
        localStorage.removeItem('userInfo');

        // Redirect to the sign-up page
        navigate('/login');
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
            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <Logout fontSize="small" style={{ marginRight: '36px' }} />
                </ListItemIcon>
                Logout
            </MenuItem>{' '}
        </Drawer>
    );
}

export default function AdminLayout({ children }) {
    const theme = useTheme();
    const user = storageService.getItem('userInfo')?.user || null;

    const [showAlertError, setShowAlertError] = useState(false);
    const [showAlertErrorStorage, setShowAlertErrorStorage] = useState(false);
    const [showAlertErrorUsers, setShowAlertErrorUsers] = useState(false);

    const [currentStorageAndAccount, setCurrentStorageAndAccount] = useState(null);

    const checkSubscription = async () => {
        try {
            if (user?.currentPlan === null) {
                setShowAlertError(true);
            }
        } catch (error) {
            console.error('Subscription error:', error);
            setShowAlertError(true);
        }
    };

    const checkCurrentStorageIsOverCurrentPlan = async () => {
        try {
            if (user?.roleName === 'ADMIN') return;
            const response = await SubscriptionAPI.getCompanySubscriptionByCompanyId(user?.company?.id);
            setCurrentStorageAndAccount(response.result);
            const currentPlan = await PaymentAPI.getCurrentPlanByCompanyId(user?.company?.id);
            if (currentPlan === null || response.result.storageUsage > currentPlan.result.maxStorageUsage) {
                setShowAlertErrorStorage(true);
            }
            if (currentPlan === null || response.result.numberOfUsers > currentPlan.result.maxNumberOfUsers) {
                setShowAlertErrorUsers(true);
            }
            console.log(
                'response.result.storageUsage > currentPlan.result.maxStorageUsage',
                response.result.storageUsage > currentPlan.result.maxStorageUsage,
            );
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    useEffect(() => {
        checkSubscription();
        checkCurrentStorageIsOverCurrentPlan();
    }, []);

    return (
        <ThemeProvider theme={defaultTheme}>
            {showAlertError && (
                <Alert width="50%" variant="filled" severity="error">
                    Your subscription has expired or you do not subscribe any. Please view subscription packages and
                    subscribe one
                </Alert>
            )}
            {(showAlertErrorStorage || showAlertErrorStorage) && (
                <Alert width="50%" variant="filled" severity="error">
                    {showAlertErrorStorage
                        ? '- Over storage of model, please go to action to remove some models or upgrade your subscription'
                        : ''}{' '}
                    {showAlertErrorUsers
                        ? '- Over number of user, please disable some users or upgrade your subscription'
                        : ''}
                </Alert>
            )}

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
