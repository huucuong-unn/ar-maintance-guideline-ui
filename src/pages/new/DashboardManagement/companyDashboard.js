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
} from '@mui/material';
import { BarChart, PieChart, ChartsTooltip, axisClasses, LineChart } from '@mui/x-charts';
import DashboardAPI from '../../../API/DashboardAPI'; // Adjust the import path as needed
import storageService from '~/components/StorageService/storageService';

const CompanyDashboard = () => {
    const theme = useTheme();

    // State for dashboard data
    const [dashboardData, setDashboardData] = useState({
        numberOfActiveGuidelines: 0,
        numberOfInactiveGuidelines: 0,
        numberOfActiveAccount: 0,
        numberOfInactiveAccount: 0,
        numberOfActiveModels: 0,
        numberOfInactiveModels: 0,
        numberOfMachines: 0,
        numberOfMachineTypes: 0,
        top3Guidelines: [],
        top3Employees: [],
        monthScanList: [],
        monthlyPointPurchases: [],
        monthlyPointUsage: [],
    });

    // State for loading and error handling
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);

    // Fetch dashboard data on component mount
    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setIsLoading(true);

                const response = await DashboardAPI.getDashboardCompany(userInfo?.company?.id);

                // Assuming the API returns the data directly in response.result
                if (response.code === 1000 && response.result) {
                    // If your API doesn't yet return the new fields, you could add mock data for testing:
                    const result = {
                        ...response.result,
                        // Add mock data if not provided by API:
                        // numberOfMachines: response.result.numberOfMachines || 24,
                        // numberOfMachineTypes: response.result.numberOfMachineTypes || 8,
                        // monthlyPointPurchases: response.result.monthlyPointPurchases || [
                        //     { month: 'Jan 2025', amount: 1500 },
                        //     { month: 'Feb 2025', amount: 2000 },
                        //     { month: 'Mar 2025', amount: 1800 },
                        //     { month: 'Apr 2025', amount: 2500 },
                        // ],
                        // monthlyPointUsage: response.result.monthlyPointUsage || [
                        //     { month: 'Jan 2025', points: 800 },
                        //     { month: 'Feb 2025', points: 1200 },
                        //     { month: 'Mar 2025', points: 1500 },
                        //     { month: 'Apr 2025', points: 1800 },
                        // ],
                    };

                    setDashboardData(result);
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

    // Colors for charts
    const COLORS = [
        theme.palette.primary.main,
        theme.palette.warning.main,
        theme.palette.success.main,
        theme.palette.secondary.main,
    ];

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

    // Format monthly scan data for MUI charts
    const formatChartData = (dataArray, valueKey) => {
        if (!dataArray || dataArray.length === 0) {
            return {
                data: [],
                xLabels: [],
            };
        }

        const sortedData = [...dataArray].sort((a, b) => {
            // Assuming month is in format "MMM YYYY" or similar
            return new Date(a.month) - new Date(b.month);
        });

        return {
            data: sortedData.map((item) => item[valueKey]),
            xLabels: sortedData.map((item) => item.month),
        };
    };

    // Format data for different charts
    const monthlyChartData = formatChartData(dashboardData.monthScanList, 'revenue');
    const pointPurchasesChartData = formatChartData(dashboardData.monthlyPointPurchases, 'amount');
    const pointUsageChartData = formatChartData(dashboardData.monthlyPointUsage, 'points');

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
                Company Dashboard
            </Typography>

            {/* First Row - Key Metrics */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={8}>
                    <Card elevation={3}>
                        <CardHeader title="Key Metrics" />
                        <CardContent>
                            <Grid container spacing={3}>
                                {/* First row of metrics */}
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography variant="h3" color="primary">
                                            {dashboardData.numberOfActiveGuidelines +
                                                dashboardData.numberOfInactiveGuidelines}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Guidelines
                                        </Typography>
                                        <Typography variant="body2" color="success.main">
                                            Active: {dashboardData.numberOfActiveGuidelines}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography variant="h3" color="primary">
                                            {dashboardData.numberOfActiveAccount +
                                                dashboardData.numberOfInactiveAccount}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Employee Accounts
                                        </Typography>
                                        <Typography variant="body2" color="success.main">
                                            Active: {dashboardData.numberOfActiveAccount}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography variant="h3" color="primary">
                                            {dashboardData.numberOfActiveModels + dashboardData.numberOfInactiveModels}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Models
                                        </Typography>
                                        <Typography variant="body2" color="success.main">
                                            Active: {dashboardData.numberOfActiveModels}
                                        </Typography>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Box sx={{ textAlign: 'center', p: 1 }}>
                                        <Typography variant="h3" color="primary">
                                            {dashboardData.numberOfMachines}
                                        </Typography>
                                        <Typography variant="subtitle1" color="text.secondary">
                                            Machines
                                        </Typography>
                                        <Typography variant="body2" color="info.main">
                                            Types: {dashboardData.numberOfMachinesType}
                                        </Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                        <CardHeader title="Machine Statistics" />
                        <CardContent
                            sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Box sx={{ textAlign: 'center', p: 1, flex: 1 }}>
                                    <Typography variant="h3" color="primary">
                                        {dashboardData.numberOfMachines}
                                    </Typography>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Total Machines
                                    </Typography>
                                </Box>
                                <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
                                <Box sx={{ textAlign: 'center', p: 1, flex: 1 }}>
                                    <Typography variant="h3" color="secondary">
                                        {dashboardData.numberOfMachinesType}
                                    </Typography>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        Machine Types
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Detailed Stats */}
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
                                            '& .MuiChartsLegend-label': {
                                                fill: 'black',
                                            },
                                            '& .MuiChartsLegend-mark': {
                                                rx: 10,
                                                ry: 10,
                                            },
                                            // Thay đổi màu cho nhãn trong pie chart thành đen
                                            '& .MuiPieArcLabel-root': {
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
                        <CardHeader title="Employee Accounts" />
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
                                            '& .MuiChartsLegend-label': {
                                                fill: 'black',
                                            },
                                            '& .MuiChartsLegend-mark': {
                                                rx: 10,
                                                ry: 10,
                                            },
                                            // Thay đổi màu cho nhãn trong pie chart thành đen
                                            '& .MuiPieArcLabel-root': {
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
                                            '& .MuiChartsLegend-label': {
                                                fill: 'black',
                                            },
                                            '& .MuiChartsLegend-mark': {
                                                rx: 10,
                                                ry: 10,
                                            },
                                            // Thay đổi màu cho nhãn trong pie chart thành đen
                                            '& .MuiPieArcLabel-root': {
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

            {/* Monthly Scans Chart */}
            <Grid container spacing={3} mb={3}>
                <Grid item xs={12}>
                    <Card elevation={3}>
                        <CardHeader title="Monthly Scans" />
                        <CardContent>
                            <Box sx={{ height: 300, width: '100%' }}>
                                {monthlyChartData.data.length > 0 ? (
                                    <BarChart
                                        xAxis={[
                                            {
                                                data: monthlyChartData.xLabels,
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
                                                data: monthlyChartData.data,
                                                label: 'Revenue',
                                                color: theme.palette.primary.main,
                                                highlightScope: {
                                                    highlighted: 'item',
                                                    faded: 'global',
                                                },
                                            },
                                        ]}
                                        height={300}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            bottom: 70, // Extra space for rotated labels
                                            left: 40,
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
                                            No monthly scan data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Point Statistics */}
            <Typography variant="h5" component="h2" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 4 }}>
                Point Statistics
            </Typography>

            <Grid container spacing={3} mb={3}>
                {/* Monthly Point Purchases Chart */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Monthly Point Purchases" />
                        <CardContent>
                            <Box sx={{ height: 300, width: '100%' }}>
                                {pointPurchasesChartData.data.length > 0 ? (
                                    <BarChart
                                        xAxis={[
                                            {
                                                data: pointPurchasesChartData.xLabels,
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
                                                data: pointPurchasesChartData.data,
                                                label: 'Points Purchased',
                                                color: theme.palette.secondary.main,
                                                highlightScope: {
                                                    highlighted: 'item',
                                                    faded: 'global',
                                                },
                                            },
                                        ]}
                                        height={300}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            bottom: 70,
                                            left: 40,
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
                                            No point purchase data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Monthly Point Usage Chart */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Monthly Point Usage" />
                        <CardContent>
                            <Box sx={{ height: 300, width: '100%' }}>
                                {pointUsageChartData.data.length > 0 ? (
                                    <LineChart
                                        xAxis={[
                                            {
                                                data: pointUsageChartData.xLabels,
                                                scaleType: 'point',
                                                tickLabelStyle: {
                                                    angle: 45,
                                                    textAnchor: 'start',
                                                    fontSize: 12,
                                                },
                                            },
                                        ]}
                                        series={[
                                            {
                                                data: pointUsageChartData.data,
                                                label: 'Points Used',
                                                color: theme.palette.info.main,
                                                curve: 'monotoneX',
                                                area: true,
                                                showMark: true,
                                            },
                                        ]}
                                        height={300}
                                        margin={{
                                            top: 20,
                                            right: 30,
                                            bottom: 70,
                                            left: 40,
                                        }}
                                    >
                                        <ChartsTooltip />
                                    </LineChart>
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
                                            No point usage data available
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Top Employees and Guidelines */}
            <Typography variant="h5" component="h2" fontWeight="bold" color="primary" gutterBottom sx={{ mt: 4 }}>
                Top Performers
            </Typography>

            <Grid container spacing={3} mb={3}>
                {/* Top Employees */}
                <Grid item xs={12} md={6}>
                    <Card elevation={3}>
                        <CardHeader title="Top Employees" />
                        <CardContent>
                            <TableContainer component={Paper} variant="outlined">
                                <Table>
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: 'action.hover' }}>
                                            <TableCell>
                                                <Typography variant="subtitle2">Employee Name</Typography>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Typography variant="subtitle2">Scan Times</Typography>
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {dashboardData.top3Employees && dashboardData.top3Employees.length > 0 ? (
                                            dashboardData.top3Employees.map((employee, index) => (
                                                <TableRow
                                                    key={index}
                                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                                >
                                                    <TableCell component="th" scope="row">
                                                        {employee.name}
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Chip
                                                            label={employee.scanTimes}
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

export default CompanyDashboard;
