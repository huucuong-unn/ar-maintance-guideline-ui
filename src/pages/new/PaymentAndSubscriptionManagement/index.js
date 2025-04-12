import { Box, Button, Grid, Paper, Typography, TextField, Autocomplete, InputAdornment, Chip } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanyAPI from '~/API/CompanyAPI';
import PaymentAPI from '~/API/PaymentAPI';
import PayosAPI from '~/API/PayosAPI';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import PackagesDialog from '~/components/PackagesDialog';
import storageService from '~/components/StorageService/storageService';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import ErrorIcon from '@mui/icons-material/Error';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PaymentsIcon from '@mui/icons-material/Payments';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©ARGuideline '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function PaymentAndSubscriptionManagement() {
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const [isLoadingClickPurchase, setIsLoadingClickPurchase] = useState(false);
    const [openPackagesDialog, setOpenPackagesDialog] = useState(false);
    const [subscriptions, setSubScriptions] = useState([]);
    const [currentPlan, setCurrentPlan] = useState(null);
    const [currentCompanyPlanInfo, setCurrentCompanyPlanInfo] = useState(null);
    const fetchCurrentPlan = async () => {
        try {
            const response = await PaymentAPI.getCurrentPlanByCompanyId(userInfo?.company?.id);
            setCurrentPlan(response?.result || null);
        } catch (error) {}
    };
    const fecthCurrentCompanyPlanInfo = async () => {
        try {
            const response = await SubscriptionAPI.getCompanySubscriptionByCompanyId(userInfo?.company?.id);
            setCurrentCompanyPlanInfo(response?.result || null);
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    useEffect(() => {
        fetchCurrentPlan();
        fecthCurrentCompanyPlanInfo();
    }, []);
    const handleOpenPackagesDialog = () => {
        fetchSubscriptions();
        setOpenPackagesDialog(true);
    };
    const handleClosePackagesDialog = () => {
        setOpenPackagesDialog(false);
        fetchSubscriptions();
    };
    const navigate = useNavigate();

    const fetchSubscriptions = async () => {
        try {
            const response = await PayosAPI.getSubscriptions();
            setSubScriptions(response.result || []);
        } catch (error) {
            console.log(error);
        }
    };

    const handleCheckCanPay = (storage, account) => {
        if (currentCompanyPlanInfo?.storageUsage >= storage || currentCompanyPlanInfo?.numberOfUsers >= account) {
            return false;
        }

        return true;
    };

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const handleGoCheckout = async (productName, storage, account, monthlyFee) => {
        try {
            if (userInfo) {
                if (!handleCheckCanPay(storage, account)) {
                    alert(
                        'Can not subscribe the lower plan because your storage or account over the plan limit. Please subscribe to higher plan or remove models | disable accounts \n\nYour Storage: ' +
                            currentCompanyPlanInfo?.storageUsage +
                            ' GB \nYour Account: ' +
                            currentCompanyPlanInfo?.numberOfUsers +
                            ' users',
                    );
                    return;
                }
                setIsLoadingClickPurchase(true);

                if (currentCompanyPlanInfo.monthlyFee > monthlyFee) {
                    alert('You can not subscribe the lower plan now. Please choose the higher plan');
                    return;
                }

                const response = await PayosAPI.goCheckout({
                    productName: productName,
                    userId: userInfo?.id,
                });
                if (response.data.checkoutUrl) {
                    setIsLoadingClickPurchase(false);
                    window.location.href = response.data.checkoutUrl;
                }
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.log(error);
        }
    };

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const columns = [
        { field: 'orderCode', headerName: 'Order Code', width: 200 },
        { field: 'email', headerName: 'User Email', width: 250 },
        { field: 'optionName', headerName: 'Option Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 200 },
        { field: 'point', headerName: 'Point', width: 100 },
        { field: 'createdDate', headerName: 'Create At', width: 200 },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => {
                let color = 'black';

                switch (params.value) {
                    case 'PENDING':
                        color = 'orange';
                        break;
                    case 'PAID':
                        color = 'green';
                        break;
                    case 'UNSUCCESSFUL':
                        color = 'red';
                        break;
                    default:
                        color = 'black';
                }

                return (
                    <Box
                        sx={{
                            color,
                            fontWeight: 'bold',
                        }}
                    >
                        {formatStatus(params.value)}
                    </Box>
                );
            },
        },
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const [searchParams, setSearchParams] = useState({
        status: '',
        orderCode: '',
    });

    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;

            const params = {
                page: pageParam,
                size: sizeParam,
                orderCode: searchParams.orderCode || undefined,
                status: searchParams.status || undefined,
            };

            const paramsForCompanyRole = {
                page: pageParam,
                size: sizeParam,
                orderCode: searchParams.orderCode || undefined,
                status: searchParams.status || undefined,
            };

            var response;
            var data;
            if (userInfo?.roleName === 'ADMIN') {
                response = await PaymentAPI.getPayments(params);
                data = response?.result?.objectList || [];
            } else if (userInfo?.roleName === 'COMPANY') {
                response = await PaymentAPI.getPaymentsByCompanyId(userInfo?.company?.id, paramsForCompanyRole);
                data = response?.result?.objectList || [];
            }
            for (let i = 0; i < data.length; i++) {
                const company = await CompanyAPI.getByUserId(data[i].userId);
                data[i].companyName = company?.result?.companyName || '';
            }

            const formattedData = data.map((item) => ({
                ...item,
                createdDate: item.createdDate ? format(new Date(item.createdDate), 'MM/dd/yyyy HH:mm:ss') : '',
                updatedDate: item.updatedDate ? format(new Date(item.updatedDate), 'MM/dd/yyyy HH:mm:ss') : '',
                amount: formatCurrency(item.amount),
            }));

            setRows(formattedData);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch payments:', error);
        }
    };

    const handleSearch = () => {
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    useEffect(() => {
        console.log(searchParams);
    }, [searchParams]);

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${adminLoginBackground})`,
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 3 }}>
                    {/* Header with Dashboard Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Typography
                                    component="h1"
                                    variant="h4"
                                    sx={{
                                        fontWeight: '800',
                                        fontSize: { xs: '28px', md: '36px', lg: '42px' },
                                        color: '#051D40',
                                    }}
                                >
                                    Payment History
                                </Typography>
                            </Box>

                            {/* Stats Cards */}
                            <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                                            border: '1px solid #90CAF9',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Total Transactions
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <ReceiptIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                All Time
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                                            border: '1px solid #A5D6A7',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Completed Payments
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {rows[0]?.numsOfPaidTransaction || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CheckCircleIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Successful
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                                            border: '1px solid #FFCC80',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Pending Payments
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {rows[0]?.numsOfPendingTransaction || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <HourglassEmptyIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Awaiting Confirmation
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)',
                                            border: '1px solid #EF9A9A',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Failed Transactions
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#C62828" sx={{ mt: 1 }}>
                                            {rows[0]?.numsOfFailedTransaction || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <ErrorIcon
                                                sx={{ color: '#C62828', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Require Attention
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Search and Filters */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: '12px',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#051D40' }}>
                            Search & Filters
                        </Typography>

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Order Code"
                                    variant="outlined"
                                    type="number"
                                    value={searchParams.orderCode}
                                    onChange={(e) =>
                                        setSearchParams((prev) => ({ ...prev, orderCode: e.target.value }))
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ReceiptLongIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter order code"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    options={['PENDING', 'PAID', 'FAILED']}
                                    value={searchParams.status || null}
                                    onChange={(event, newValue) =>
                                        setSearchParams((prev) => ({ ...prev, status: newValue || '' }))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Payment Status"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <PaymentsIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            {option === 'PAID' && (
                                                <CheckCircleIcon
                                                    fontSize="small"
                                                    sx={{ color: 'success.main', mr: 1 }}
                                                />
                                            )}
                                            {option === 'PENDING' && (
                                                <HourglassEmptyIcon
                                                    fontSize="small"
                                                    sx={{ color: 'warning.main', mr: 1 }}
                                                />
                                            )}
                                            {option === 'FAILED' && (
                                                <ErrorIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                                            )}
                                            {option}
                                        </li>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<FilterListIcon />}
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#115293',
                                            },
                                            py: 1.5,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Apply Filters
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => {
                                            setSearchParams({ orderCode: '', status: '' });
                                            setPaginationModel({ page: 0, pageSize: 5 });
                                            handleSearch();
                                        }}
                                        sx={{
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            py: 1.5,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* DataGrid with enhanced styling */}
                    <Paper
                        elevation={2}
                        sx={{
                            width: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            mb: 4,
                            '& .MuiDataGrid-root': {
                                border: 'none',
                            },
                            '& .MuiDataGrid-cell': {
                                borderColor: 'rgba(224, 224, 224, 1)',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#F5F7FA',
                                borderBottom: 'none',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns.map((column) => {
                                // Thêm định dạng tốt hơn cho cột Status
                                if (column.field === 'status') {
                                    return {
                                        ...column,
                                        renderCell: (params) => {
                                            const status = params.value;
                                            let chipProps = {
                                                label: status,
                                                size: 'small',
                                                sx: {
                                                    borderRadius: '16px',
                                                    fontWeight: 'medium',
                                                },
                                            };

                                            switch (status) {
                                                case 'PAID':
                                                    chipProps = {
                                                        ...chipProps,
                                                        icon: <CheckCircleIcon />,
                                                        color: 'success',
                                                        variant: 'outlined',
                                                    };
                                                    break;
                                                case 'PENDING':
                                                    chipProps = {
                                                        ...chipProps,
                                                        icon: <HourglassEmptyIcon />,
                                                        color: 'warning',
                                                        variant: 'outlined',
                                                    };
                                                    break;
                                                case 'FAILED':
                                                    chipProps = {
                                                        ...chipProps,
                                                        icon: <ErrorIcon />,
                                                        color: 'error',
                                                        variant: 'outlined',
                                                    };
                                                    break;
                                                default:
                                                    break;
                                            }

                                            return <Chip {...chipProps} />;
                                        },
                                    };
                                }

                                // Thêm định dạng cho cột số tiền (nếu có)
                                if (column.field === 'amount' || column.field === 'totalAmount') {
                                    return {
                                        ...column,
                                        renderCell: (params) => (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center', // Try 'start' instead
                                                    height: '100%', // Ensure full height
                                                }}
                                            >
                                                <Typography fontWeight="medium">
                                                    {typeof params.value === 'number'
                                                        ? params.value.toLocaleString('en-US', {
                                                              minimumFractionDigits: 0,
                                                              maximumFractionDigits: 2,
                                                          })
                                                        : params.value}
                                                </Typography>
                                            </Box>
                                        ),
                                    };
                                }

                                // Định dạng cho cột ngày (nếu có)
                                if (column.field === 'createdDate' || column.field === 'paymentDate') {
                                    return {
                                        ...column,
                                        renderCell: (params) => (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center', // Try 'start' instead
                                                    height: '100%', // Ensure full height
                                                }}
                                            >
                                                <EventIcon
                                                    sx={{
                                                        color: 'text.secondary',
                                                        opacity: 0.7,
                                                        alignSelf: 'center',
                                                        mr: 0.5,
                                                        fontSize: '1rem',
                                                    }}
                                                />
                                                <Typography variant="body2">{params.value}</Typography>
                                            </Box>
                                        ),
                                    };
                                }

                                // Định dạng cho cột Order Code (nếu có)
                                if (column.field === 'orderCode') {
                                    return {
                                        ...column,
                                        renderCell: (params) => (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center', // Try 'start' instead
                                                    height: '100%', // Ensure full height
                                                }}
                                            >
                                                <ReceiptLongIcon
                                                    sx={{
                                                        color: '#051D40',
                                                        opacity: 0.7,
                                                        alignSelf: 'center',
                                                        mr: 0.5,
                                                        fontSize: '1rem',
                                                    }}
                                                />
                                                <Typography fontWeight="medium">#{params.value}</Typography>
                                            </Box>
                                        ),
                                    };
                                }

                                return column;
                            })}
                            rowCount={total}
                            paginationMode="server"
                            pageSizeOptions={[5, 10, 25, 50]}
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => {
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }));
                            }}
                            disableRowSelectionOnClick
                            autoHeight
                            getRowId={(row) => row.id}
                            sx={{
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        />
                    </Paper>

                    <Copyright sx={{ mt: 3 }} />
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
