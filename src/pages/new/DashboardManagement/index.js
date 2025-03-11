import { AttachMoney, Description, Layers, People, TrendingUp } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Grid,
    LinearProgress,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Typography,
    useTheme,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { BarChart, LineChart, PieChart } from '@mui/x-charts';
import { useEffect, useState } from 'react';

// Import APIs
import DashboardAPI from '~/API/DashboardAPI'; // This would be your new API for dashboard data
import storageService from '~/components/StorageService/storageService';

// Gradient for charts
const AreaGradient = ({ color, id }) => (
    <defs>
        <linearGradient id={id} x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity={0.5} />
            <stop offset="100%" stopColor={color} stopOpacity={0.1} />
        </linearGradient>
    </defs>
);

// Copyright component
const Copyright = (props) => {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright © Tortee '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
};

// Create theme with primary and secondary colors
const customTheme = createTheme({
    palette: {
        primary: {
            main: '#2563eb',
            light: '#60a5fa',
            dark: '#1e40af',
        },
        secondary: {
            main: '#7c3aed',
            light: '#a78bfa',
            dark: '#5b21b6',
        },
        background: {
            default: '#f1f5f9',
            paper: '#ffffff',
        },
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
        h4: {
            fontWeight: 600,
        },
        h5: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                },
            },
        },
        MuiCardHeader: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 0px 24px',
                },
            },
        },
        MuiCardContent: {
            styleOverrides: {
                root: {
                    padding: '16px 24px 24px 24px',
                    '&:last-child': {
                        paddingBottom: '24px',
                    },
                },
            },
        },
    },
});

// Dashboard component with role-based UI
export default function DashboardManagement() {
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const role = userInfo?.roleName;
    const companyId = userInfo?.company?.id;
    const theme = useTheme();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);

    // Helper function to format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Fetch dashboard data based on role
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                if (role === 'ADMIN') {
                    const response = await DashboardAPI.getDashboardAdmin();
                    setDashboardData(response.result);
                } else if (role === 'COMPANY' && companyId) {
                    const response = await DashboardAPI.getDashboardCompany(companyId);
                    setDashboardData(response.result);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [role, companyId]);

    // Mock data for the months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // // Switch role for demonstration purposes
    // const toggleRole = () => {
    //     setRole(role === 'admin' ? 'company' : 'admin');
    //     // Set dummy companyId for company role
    //     setCompanyId(role === 'admin' ? 1 : null);
    // };

    return (
        <ThemeProvider theme={customTheme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    backgroundColor: theme.palette.background.default,
                    padding: { xs: 2, sm: 3, md: 4 },
                }}
            >
                {/* Header with role toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                        }}
                    >
                        Dashboard {role === 'ADMIN' ? 'Admin' : 'Company'}
                    </Typography>
                    {/* <Chip
                        label={`Switch to ${role === 'admin' ? 'Company' : 'Admin'} View`}
                        color="primary"
                        onClick={toggleRole}
                        variant="outlined"
                    /> */}
                </Box>

                {loading ? (
                    <Box sx={{ width: '100%', mt: 4 }}>
                        <LinearProgress />
                    </Box>
                ) : (
                    <>
                        {/* Top Cards Section */}
                        <Grid container spacing={3} sx={{ mb: 4 }}>
                            {/* Total Accounts */}
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.light, mr: 2 }}>
                                                <People />
                                            </Avatar>
                                            <Typography variant="h6">Accounts</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {dashboardData?.numberOfAccount || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Chip
                                                size="small"
                                                label={`Active: ${dashboardData?.numberOfActiveAccount || 0}`}
                                                color="success"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                size="small"
                                                label={`Inactive: ${dashboardData?.numberOfInactiveAccount || 0}`}
                                                color="error"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Guidelines */}
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ bgcolor: theme.palette.secondary.light, mr: 2 }}>
                                                <Description />
                                            </Avatar>
                                            <Typography variant="h6">Guidelines</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {(dashboardData?.numberOfActiveGuidelines || 0) +
                                                (dashboardData?.numberOfInactiveGuidelines || 0)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Chip
                                                size="small"
                                                label={`Active: ${dashboardData?.numberOfActiveGuidelines || 0}`}
                                                color="success"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                size="small"
                                                label={`Inactive: ${dashboardData?.numberOfInactiveGuidelines || 0}`}
                                                color="error"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Models */}
                            <Grid item xs={12} sm={6} md={4} lg={3}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar sx={{ bgcolor: theme.palette.primary.dark, mr: 2 }}>
                                                <Layers />
                                            </Avatar>
                                            <Typography variant="h6">Models</Typography>
                                        </Box>
                                        <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                            {(dashboardData?.numberOfActiveModels || 0) +
                                                (dashboardData?.numberOfInactiveModels || 0)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                            <Chip
                                                size="small"
                                                label={`Active: ${dashboardData?.numberOfActiveModels || 0}`}
                                                color="success"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                size="small"
                                                label={`Inactive: ${dashboardData?.numberOfInactiveModels || 0}`}
                                                color="error"
                                            />
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Revenue (Admin only) */}
                            {role === 'ADMIN' && (
                                <Grid item xs={12} sm={6} md={4} lg={3}>
                                    <Card>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <Avatar sx={{ bgcolor: theme.palette.secondary.dark, mr: 2 }}>
                                                    <AttachMoney />
                                                </Avatar>
                                                <Typography variant="h6">Revenue</Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 700 }}>
                                                {formatCurrency(dashboardData?.totalRevenue || 0)}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                                <TrendingUp color="success" sx={{ mr: 1 }} />
                                                <Typography variant="body2" color="text.secondary">
                                                    Total Revenue
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            )}
                        </Grid>

                        {/* Charts Section */}
                        <Grid container spacing={3}>
                            {/* Admin-specific charts */}
                            {role === 'ADMIN' && (
                                <>
                                    {/* Monthly Revenue Chart */}
                                    <Grid item xs={12} md={8}>
                                        <Card>
                                            <CardHeader
                                                title="Monthly Revenue"
                                                subheader="Performance overview throughout the year"
                                            />
                                            <CardContent>
                                                <Box sx={{ height: 320 }}>
                                                    <LineChart
                                                        series={[
                                                            {
                                                                data:
                                                                    dashboardData?.monthRevenueList?.map(
                                                                        (item) => item.revenue,
                                                                    ) || Array(12).fill(0),
                                                                area: true,
                                                                showMark: false,
                                                                label: 'Revenue',
                                                                color: theme.palette.primary.main,
                                                            },
                                                        ]}
                                                        xAxis={[
                                                            {
                                                                data: months,
                                                                scaleType: 'band',
                                                            },
                                                        ]}
                                                        sx={{
                                                            '.MuiLineElement-root': {
                                                                strokeWidth: 2,
                                                            },
                                                            '.MuiAreaElement-root': {
                                                                fill: `url('#revenueGradient')`,
                                                            },
                                                        }}
                                                        height={300}
                                                    >
                                                        <AreaGradient
                                                            color={theme.palette.primary.main}
                                                            id="revenueGradient"
                                                        />
                                                    </LineChart>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Revenue Distribution */}
                                    <Grid item xs={12} md={4}>
                                        <Card sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Revenue Distribution"
                                                subheader="By company and subscription type"
                                            />
                                            <CardContent>
                                                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                                                    <Tab label="Companies" />
                                                    <Tab label="Subscriptions" />
                                                </Tabs>

                                                <Box sx={{ height: 240, display: activeTab === 0 ? 'block' : 'none' }}>
                                                    {dashboardData?.companyRevenueList &&
                                                    dashboardData.companyRevenueList.length > 0 ? (
                                                        <PieChart
                                                            series={[
                                                                {
                                                                    data: dashboardData.companyRevenueList.map(
                                                                        (item, index) => ({
                                                                            id: index,
                                                                            value: item.revenue,
                                                                            label: item.name,
                                                                        }),
                                                                    ),
                                                                    innerRadius: 30,
                                                                    paddingAngle: 2,
                                                                    cornerRadius: 4,
                                                                },
                                                            ]}
                                                            height={240}
                                                            slotProps={{
                                                                legend: {
                                                                    direction: 'column',
                                                                    position: {
                                                                        vertical: 'middle',
                                                                        horizontal: 'right',
                                                                    },
                                                                    padding: 0,
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                height: '100%',
                                                            }}
                                                        >
                                                            <Typography color="text.secondary">
                                                                No company revenue data available
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>

                                                <Box sx={{ height: 240, display: activeTab === 1 ? 'block' : 'none' }}>
                                                    {dashboardData?.subscriptionRevenueList &&
                                                    dashboardData.subscriptionRevenueList.length > 0 ? (
                                                        <PieChart
                                                            series={[
                                                                {
                                                                    data: dashboardData.subscriptionRevenueList.map(
                                                                        (item, index) => ({
                                                                            id: index,
                                                                            value: item.revenue,
                                                                            label:
                                                                                item.name.charAt(0).toUpperCase() +
                                                                                item.name.slice(1),
                                                                        }),
                                                                    ),
                                                                    innerRadius: 30,
                                                                    paddingAngle: 2,
                                                                    cornerRadius: 4,
                                                                },
                                                            ]}
                                                            height={240}
                                                            slotProps={{
                                                                legend: {
                                                                    direction: 'column',
                                                                    position: {
                                                                        vertical: 'middle',
                                                                        horizontal: 'right',
                                                                    },
                                                                    padding: 0,
                                                                },
                                                            }}
                                                        />
                                                    ) : (
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                height: '100%',
                                                            }}
                                                        >
                                                            <Typography color="text.secondary">
                                                                No subscription revenue data available
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </>
                            )}

                            {/* Company-specific charts */}
                            {role === 'COMPANY' && (
                                <>
                                    {/* Top Guidelines */}
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ mb: 4 }}>
                                            <CardHeader
                                                title="Current Subscription"
                                                subheader={`Plan expires on ${new Date(
                                                    dashboardData.companySubscriptionResponse.subscriptionExpireDate,
                                                ).toLocaleDateString()}`}
                                            />
                                            <CardContent>
                                                <Grid container spacing={3}>
                                                    {/* Plan Details */}
                                                    <Grid item xs={12} md={4}>
                                                        <Box>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                gutterBottom
                                                            >
                                                                Current Plan
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                <Chip
                                                                    label={dashboardData.companySubscriptionResponse.subscriptionResponse.subscriptionCode.toUpperCase()}
                                                                    color="primary"
                                                                    sx={{
                                                                        textTransform: 'capitalize',
                                                                        fontWeight: 'bold',
                                                                        fontSize: '1rem',
                                                                        height: 32,
                                                                    }}
                                                                />
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    sx={{ ml: 2 }}
                                                                >
                                                                    {dashboardData.companySubscriptionResponse
                                                                        .status === 'ACTIVE'
                                                                        ? 'Active'
                                                                        : 'Inactive'}
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="h5" sx={{ mt: 1, fontWeight: 600 }}>
                                                                {formatCurrency(
                                                                    dashboardData.companySubscriptionResponse
                                                                        .monthlyFee,
                                                                )}
                                                                <Typography
                                                                    component="span"
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                >
                                                                    /month
                                                                </Typography>
                                                            </Typography>
                                                        </Box>
                                                    </Grid>

                                                    {/* Storage Usage */}
                                                    <Grid item xs={12} md={4}>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            Storage Usage
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                {dashboardData.companySubscriptionResponse.storageUsage.toFixed(
                                                                    2,
                                                                )}
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mx: 1 }}
                                                            >
                                                                /
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {
                                                                    dashboardData.companySubscriptionResponse
                                                                        .subscriptionResponse.maxStorageUsage
                                                                }{' '}
                                                                {
                                                                    dashboardData.companySubscriptionResponse
                                                                        .subscriptionResponse.storageUnit
                                                                }
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(
                                                                (dashboardData.companySubscriptionResponse
                                                                    .storageUsage /
                                                                    dashboardData.companySubscriptionResponse
                                                                        .subscriptionResponse.maxStorageUsage) *
                                                                    100,
                                                                100,
                                                            )}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                        />
                                                    </Grid>

                                                    {/* Users */}
                                                    <Grid item xs={12} md={4}>
                                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                                            Users
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                                            <Typography variant="h5" sx={{ fontWeight: 600 }}>
                                                                {
                                                                    dashboardData.companySubscriptionResponse
                                                                        .numberOfUsers
                                                                }
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ mx: 1 }}
                                                            >
                                                                /
                                                            </Typography>
                                                            <Typography variant="body1">
                                                                {
                                                                    dashboardData.companySubscriptionResponse
                                                                        .subscriptionResponse.maxNumberOfUsers
                                                                }
                                                            </Typography>
                                                        </Box>
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={Math.min(
                                                                (dashboardData.companySubscriptionResponse
                                                                    .numberOfUsers /
                                                                    dashboardData.companySubscriptionResponse
                                                                        .subscriptionResponse.maxNumberOfUsers) *
                                                                    100,
                                                                100,
                                                            )}
                                                            sx={{ height: 8, borderRadius: 4 }}
                                                            color={
                                                                dashboardData.companySubscriptionResponse
                                                                    .numberOfUsers >=
                                                                dashboardData.companySubscriptionResponse
                                                                    .subscriptionResponse.maxNumberOfUsers
                                                                    ? 'error'
                                                                    : 'primary'
                                                            }
                                                        />
                                                    </Grid>

                                                    {/* Subscription Period */}
                                                    <Grid item xs={12}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                mt: 2,
                                                                justifyContent: 'space-between',
                                                            }}
                                                        >
                                                            <Box>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    Start Date
                                                                </Typography>
                                                                <Typography>
                                                                    {new Date(
                                                                        dashboardData.companySubscriptionResponse.subscriptionStartDate,
                                                                    ).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>
                                                            <Box>
                                                                <Typography
                                                                    variant="body2"
                                                                    color="text.secondary"
                                                                    align="right"
                                                                >
                                                                    Expiry Date
                                                                </Typography>
                                                                <Typography align="right">
                                                                    {new Date(
                                                                        dashboardData.companySubscriptionResponse.subscriptionExpireDate,
                                                                    ).toLocaleDateString()}
                                                                </Typography>
                                                            </Box>
                                                        </Box>
                                                    </Grid>
                                                </Grid>
                                            </CardContent>
                                        </Card>
                                        <Card sx={{ mb: 4 }}>
                                            <CardHeader title="Top Guidelines" subheader="Most used guidelines" />
                                            <CardContent>
                                                {dashboardData?.top3Guidelines &&
                                                dashboardData.top3Guidelines.length > 0 ? (
                                                    <TableContainer>
                                                        <Table>
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell>Guideline Name</TableCell>
                                                                    <TableCell align="right">Scan Times</TableCell>
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {dashboardData.top3Guidelines.map(
                                                                    (guideline, index) => (
                                                                        <TableRow key={index}>
                                                                            <TableCell component="th" scope="row">
                                                                                {guideline.name}
                                                                            </TableCell>
                                                                            <TableCell align="right">
                                                                                {guideline.scanTimes !== null
                                                                                    ? guideline.scanTimes
                                                                                    : 'N/A'}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ),
                                                                )}
                                                            </TableBody>
                                                        </Table>
                                                    </TableContainer>
                                                ) : (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            height: 200,
                                                        }}
                                                    >
                                                        <Typography color="text.secondary">
                                                            No guideline data available
                                                        </Typography>
                                                    </Box>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Guidelines Status */}
                                    <Grid item xs={12} md={6}>
                                        <Card sx={{ height: '100%' }}>
                                            <CardHeader
                                                title="Guidelines Status"
                                                subheader="Active vs Inactive Guidelines"
                                            />
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        height: 280,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'center',
                                                    }}
                                                >
                                                    <PieChart
                                                        series={[
                                                            {
                                                                data: [
                                                                    {
                                                                        id: 0,
                                                                        value:
                                                                            dashboardData?.numberOfActiveGuidelines ||
                                                                            0,
                                                                        label: 'Active',
                                                                    },
                                                                    {
                                                                        id: 1,
                                                                        value:
                                                                            dashboardData?.numberOfInactiveGuidelines ||
                                                                            0,
                                                                        label: 'Inactive',
                                                                    },
                                                                ],
                                                                innerRadius: 60,
                                                                paddingAngle: 2,
                                                                cornerRadius: 4,
                                                                cx: 150,
                                                                cy: 140,
                                                            },
                                                        ]}
                                                        height={280}
                                                        slotProps={{
                                                            legend: {
                                                                direction: 'row',
                                                                position: { vertical: 'bottom', horizontal: 'middle' },
                                                                padding: 0,
                                                            },
                                                        }}
                                                    />
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                </>
                            )}

                            {/* Common charts for both roles */}
                            <Grid item xs={12}>
                                <Card>
                                    <CardHeader
                                        title="Accounts & Models Status"
                                        subheader="Overview of active vs inactive status"
                                    />
                                    <CardContent>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="h6" gutterBottom>
                                                    Accounts
                                                </Typography>
                                                <BarChart
                                                    series={[
                                                        {
                                                            data: [dashboardData?.numberOfActiveAccount || 0],
                                                            label: 'Active',
                                                            color: theme.palette.success.main,
                                                        },
                                                        {
                                                            data: [dashboardData?.numberOfInactiveAccount || 0],
                                                            label: 'Inactive',
                                                            color: theme.palette.error.main,
                                                        },
                                                    ]}
                                                    xAxis={[{ scaleType: 'linear' }]}
                                                    // The y-axis will now contain the category labels.
                                                    yAxis={[{ scaleType: 'band', data: ['Active', 'Inactive'] }]}
                                                    height={300}
                                                    layout="horizontal"
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="h6" gutterBottom>
                                                    Models
                                                </Typography>
                                                <BarChart
                                                    series={[
                                                        {
                                                            data: [dashboardData?.numberOfActiveModels || 0],
                                                            label: 'Active',
                                                            color: theme.palette.success.main,
                                                        },
                                                        {
                                                            data: [dashboardData?.numberOfInactiveModels || 0],
                                                            label: 'Inactive',
                                                            color: theme.palette.error.main,
                                                        },
                                                    ]}
                                                    xAxis={[{ scaleType: 'linear' }]}
                                                    // The y-axis will now contain the category labels.
                                                    yAxis={[{ scaleType: 'band', data: ['Active', 'Inactive'] }]}
                                                    height={300}
                                                    layout="horizontal"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </>
                )}

                <Copyright sx={{ mt: 4 }} />
            </Box>
        </ThemeProvider>
    );
}
