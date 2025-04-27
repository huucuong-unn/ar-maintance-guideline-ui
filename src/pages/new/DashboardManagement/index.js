import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Paper,
    Card,
    CardContent,
    CardHeader,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Button,
    useTheme,
    Divider,
    Stack,
} from '@mui/material';
import { BarChart, PieChart, ChartsTooltip, axisClasses, pieArcLabelClasses } from '@mui/x-charts';
import DashboardAPI from '../../../API/DashboardAPI'; // Adjust the import path as needed

const AdminDashboard = () => {
    const theme = useTheme();

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        numberOfActiveGuidelines: 0,
        numberOfInactiveGuidelines: 0,
        numberOfActiveAccount: 0,
        numberOfInactiveAccount: 0,
        numberOfActiveModels: 0,
        numberOfInactiveModels: 0,
        totalRevenue: 0,
        top3Company: [],
        monthRevenueList: [],
        pointOptionRevenueList: [],
        top3Guidelines: [],
    });

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);
                const response = await DashboardAPI.getDashboardAdmin();

                // Assuming the API returns the data directly in response.data
                if (response.code === 1000 && response.result) {
                    setDashboardData(response.result);
                } else {
                    throw new Error('Failed to fetch dashboard data');
                }
            } catch (err) {
                setError(err.message);
                console.error('Error fetching dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Format monthly revenue data for MUI charts
    const formatMonthlyRevenueData = () => {
        if (!dashboardData.monthRevenueList || dashboardData.monthRevenueList.length === 0) {
            return {
                data: [],
                xLabels: [],
            };
        }

        const sortedData = [...dashboardData.monthRevenueList].sort((a, b) => {
            // Assuming month is in format "MMM YYYY" or similar
            return new Date(a.month) - new Date(b.month);
        });

        return {
            data: sortedData.map((item) => item.revenue),
            xLabels: sortedData.map((item) => item.month),
        };
    };

    // Format point option revenue data for MUI pie chart
    const formatPointOptionData = () => {
        if (!dashboardData.pointOptionRevenueList || dashboardData.pointOptionRevenueList.length === 0) {
            return [];
        }

        return dashboardData.pointOptionRevenueList.map((item, index) => {
            const revenue = parseFloat(item.revenue) || 0; // Đảm bảo giá trị là số
            return {
                id: index,
                value: revenue,
                label: item.name || `Option ${index + 1}`,
                color: getChartColor(index),
            };
        });
    };

    const getChartColor = (index) => {
        const colors = [
            theme.palette.primary.main,
            theme.palette.secondary.main,
            theme.palette.success.main,
            theme.palette.warning.main,
            theme.palette.info.main,
        ];
        return colors[index % colors.length];
    };

    const monthlyRevenueData = formatMonthlyRevenueData();
    const pointOptionData = formatPointOptionData();

    useEffect(() => {
        console.log(pointOptionData);
    }, [pointOptionData]);

    useEffect(() => {
        console.log(dashboardData.pointOptionRevenueList);
    }, [dashboardData]);

    // Create data for pie charts
    const createPieData = (active, inactive) => {
        return [
            { id: 0, value: active, label: 'Active', color: theme.palette.success.main },
            { id: 1, value: inactive, label: 'Inactive', color: theme.palette.warning.main },
        ];
    };

    // Guidelines pie data
    const guidelinesPieData = createPieData(
        dashboardData.numberOfActiveGuidelines,
        dashboardData.numberOfInactiveGuidelines,
    );

    // Accounts pie data
    const accountsPieData = createPieData(dashboardData.numberOfActiveAccount, dashboardData.numberOfInactiveAccount);

    // Models pie data
    const modelsPieData = createPieData(dashboardData.numberOfActiveModels, dashboardData.numberOfInactiveModels);

    // Format currency
    const formatCurrency = (value) => {
        // Đảm bảo value là số
        const numValue = Number(value);
        if (isNaN(numValue)) {
            return '0 VND';
        }

        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(numValue);
    };

    // Loading state component
    if (isLoading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                }}
            >
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading dashboard data...
                </Typography>
            </Box>
        );
    }

    // Error state component
    if (error) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '80vh',
                    bgcolor: 'error.light',
                    p: 3,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h5" color="error" gutterBottom>
                    Error: {error}
                </Typography>
                <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
                    Retry
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
            <Typography variant="h4" component="h1" fontWeight="bold" color="primary" gutterBottom>
                Admin Dashboard
            </Typography>

            {/* Total Revenue Card */}
            <Card elevation={3} sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Typography variant="h6" color="text.secondary">
                            Total Revenue:
                        </Typography>
                        <Typography variant="h4" color="primary" fontWeight="bold">
                            {formatCurrency(dashboardData.totalRevenue)}
                        </Typography>
                    </Stack>
                </CardContent>
            </Card>

            {/* Overview Stats */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader title="Guidelines" />
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Chip
                                    label={`Active: ${dashboardData.numberOfActiveGuidelines}`}
                                    color="success"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Inactive: ${dashboardData.numberOfInactiveGuidelines}`}
                                    color="warning"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ height: 200, width: '100%' }}>
                                {guidelinesPieData[0].value > 0 || guidelinesPieData[1].value > 0 ? (
                                    <PieChart
                                        series={[
                                            {
                                                data: guidelinesPieData,
                                                arcLabel: (item) => `${item.label}: ${item.value}`,
                                                arcLabelMinAngle: 45,
                                                innerRadius: 60,
                                                outerRadius: 80,
                                                paddingAngle: 5,
                                                cornerRadius: 5,
                                            },
                                        ]}
                                        height={200}
                                        margin={{ right: 5 }}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: 'black',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </PieChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Thêm biểu đồ Company Request */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader title="Company Requests" />
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', mb: 2 }}>
                                <Chip
                                    label={`Done: ${dashboardData.numberOfDoneRequests || 0}`}
                                    color="success"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                                <Chip
                                    label={`Processing: ${dashboardData.numberOfProcessingRequests || 0}`}
                                    color="info"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                                <Chip
                                    label={`Pending: ${dashboardData.numberOfPendingRequests || 0}`}
                                    color="warning"
                                    variant="outlined"
                                    sx={{ mb: 1 }}
                                />
                            </Box>
                            <Box sx={{ height: 200, width: '100%' }}>
                                {/* Kiểm tra xem có dữ liệu không */}
                                {dashboardData.numberOfDoneRequests > 0 ||
                                dashboardData.numberOfProcessingRequests > 0 ||
                                dashboardData.numberOfPendingRequests > 0 ? (
                                    <PieChart
                                        series={[
                                            {
                                                data: [
                                                    {
                                                        id: 0,
                                                        value: dashboardData.numberOfDoneRequests || 0,
                                                        label: 'Done',
                                                        color: theme.palette.success.main,
                                                    },
                                                    {
                                                        id: 1,
                                                        value: dashboardData.numberOfProcessingRequests || 0,
                                                        label: 'Processing',
                                                        color: theme.palette.info.main,
                                                    },
                                                    {
                                                        id: 2,
                                                        value: dashboardData.numberOfPendingRequests || 0,
                                                        label: 'Pending',
                                                        color: theme.palette.warning.main,
                                                    },
                                                ],
                                                arcLabel: (item) => `${item.label}: ${item.value}`,
                                                arcLabelMinAngle: 45,
                                                innerRadius: 60,
                                                outerRadius: 80,
                                                paddingAngle: 5,
                                                cornerRadius: 5,
                                            },
                                        ]}
                                        height={200}
                                        margin={{ right: 5 }}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: 'black',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </PieChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader title="Accounts" />
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Chip
                                    label={`Active: ${dashboardData.numberOfActiveAccount}`}
                                    color="success"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Inactive: ${dashboardData.numberOfInactiveAccount}`}
                                    color="warning"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ height: 200, width: '100%' }}>
                                {accountsPieData[0].value > 0 || accountsPieData[1].value > 0 ? (
                                    <PieChart
                                        series={[
                                            {
                                                data: accountsPieData,
                                                arcLabel: (item) => `${item.label}: ${item.value}`,
                                                arcLabelMinAngle: 45,
                                                innerRadius: 60,
                                                outerRadius: 80,
                                                paddingAngle: 5,
                                                cornerRadius: 5,
                                            },
                                        ]}
                                        height={200}
                                        margin={{ right: 5 }}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: 'black',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </PieChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader title="Models" />
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Chip
                                    label={`Active: ${dashboardData.numberOfActiveModels}`}
                                    color="success"
                                    variant="outlined"
                                />
                                <Chip
                                    label={`Inactive: ${dashboardData.numberOfInactiveModels}`}
                                    color="warning"
                                    variant="outlined"
                                />
                            </Box>
                            <Box sx={{ height: 200, width: '100%' }}>
                                {modelsPieData[0].value > 0 || modelsPieData[1].value > 0 ? (
                                    <PieChart
                                        series={[
                                            {
                                                data: modelsPieData,
                                                arcLabel: (item) => `${item.label}: ${item.value}`,
                                                arcLabelMinAngle: 45,
                                                innerRadius: 60,
                                                outerRadius: 80,
                                                paddingAngle: 5,
                                                cornerRadius: 5,
                                            },
                                        ]}
                                        height={200}
                                        margin={{ right: 5 }}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: 'black',
                                                fontWeight: 'bold',
                                                fontSize: '0.75rem',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </PieChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Revenue Charts */}
            <Grid container spacing={3} mb={3}>
                {/* Monthly Revenue */}
                <Grid item xs={12} md={8}>
                    <Card elevation={3}>
                        <CardHeader title="Monthly Revenue" />
                        <CardContent>
                            <Box sx={{ height: 400, width: '100%' }}>
                                {monthlyRevenueData.data.length > 0 ? (
                                    <BarChart
                                        xAxis={[
                                            {
                                                data: monthlyRevenueData.xLabels,
                                                scaleType: 'band',
                                                tickLabelStyle: {
                                                    angle: 45,
                                                    textAnchor: 'start',
                                                    fontSize: 12,
                                                },
                                            },
                                        ]}
                                        series={[
                                            {
                                                data: monthlyRevenueData.data,
                                                label: 'Revenue',
                                                color: theme.palette.primary.main,
                                                highlightScope: {
                                                    highlighted: 'item',
                                                    faded: 'global',
                                                },
                                                valueFormatter: (value) => formatCurrency(value),
                                            },
                                        ]}
                                        height={400}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            bottom: 70, // Extra space for rotated labels
                                            left: 60,
                                        }}
                                        sx={{
                                            [`.${axisClasses.left} .${axisClasses.label}`]: {
                                                transform: 'translateX(-20px)',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </BarChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No monthly revenue data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Point Option Revenue */}
                <Grid item xs={12} md={4}>
                    <Card elevation={3}>
                        <CardHeader title="Revenue by Point Option" />
                        <CardContent>
                            <Box sx={{ height: 400, width: '100%' }}>
                                {pointOptionData.length > 0 ? (
                                    <PieChart
                                        series={[
                                            {
                                                data: pointOptionData,
                                                arcLabel: (item) => `${item.label}`,
                                                arcLabelMinAngle: 45,
                                                // Chỉnh sửa valueFormatter để xử lý trường hợp nhận vào đối tượng
                                                valueFormatter: (value) => {
                                                    // Kiểm tra nếu value là object
                                                    if (typeof value === 'object' && value !== null) {
                                                        return formatCurrency(value.value || 0);
                                                    }
                                                    return formatCurrency(value || 0);
                                                },
                                                paddingAngle: 3,
                                                cornerRadius: 4,
                                            },
                                        ]}
                                        height={400}
                                        margin={{ right: 85, left: 10, top: 10, bottom: 10 }}
                                        slotProps={{
                                            legend: {
                                                direction: 'column',
                                                position: { vertical: 'middle', horizontal: 'right' },
                                                itemMarkWidth: 20,
                                                itemMarkHeight: 20,
                                            },
                                        }}
                                        sx={{
                                            [`& .${pieArcLabelClasses.root}`]: {
                                                fill: 'white',
                                                fontWeight: 'bold',
                                                fontSize: '0.85rem',
                                                textShadow: '0px 0px 3px rgba(0,0,0,0.7)',
                                            },
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </PieChart>
                                ) : (
                                    <Box
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            No point option data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Tables */}
            <Grid container spacing={3}>
                {/* Top 3 Companies */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Top 3 Companies" />
                        <CardContent>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell>
                                                <Typography variant="subtitle2">Company Name</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2">Revenue</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dashboardData.top3Company && dashboardData.top3Company.length > 0 ? (
                                            dashboardData.top3Company.map((company, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {company.name}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={formatCurrency(company.revenue)}
                                                            size="small"
                                                            color={
                                                                index === 0
                                                                    ? 'primary'
                                                                    : index === 1
                                                                    ? 'secondary'
                                                                    : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    No data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Top Guidelines */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Top Guidelines" />
                        <CardContent>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell>
                                                <Typography variant="subtitle2">Guideline Name</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2">Scan Times</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dashboardData.top3Guidelines && dashboardData.top3Guidelines.length > 0 ? (
                                            dashboardData.top3Guidelines.map((guideline, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {guideline.name}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={guideline.scanTimes}
                                                            size="small"
                                                            color={
                                                                index === 0
                                                                    ? 'primary'
                                                                    : index === 1
                                                                    ? 'secondary'
                                                                    : 'default'
                                                            }
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={2} align="center">
                                                    No data available
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdminDashboard;
