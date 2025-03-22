import { Box, Button, Grid, Paper, Typography } from '@mui/material';
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

    const columns = [
        { field: 'orderCode', headerName: 'Order Code', width: 200 },
        { field: 'optionName', headerName: 'Option Name', width: 200 },
        { field: 'amount', headerName: 'Amount', width: 200 },
        { field: 'point', headerName: 'Point', width: 200 },
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
                            textTransform: 'uppercase',
                        }}
                    >
                        {params.value}
                    </Box>
                );
            },
        },
    ];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;

            const params = {
                page: pageParam,
                size: sizeParam,
            };

            var response;
            var data;
            if (userInfo?.roleName === 'ADMIN') {
                response = await PaymentAPI.getPayments(params);
                data = response?.result?.objectList || [];
            } else if (userInfo?.roleName === 'COMPANY') {
                response = await PaymentAPI.getPaymentsByCompanyId(userInfo?.company?.id, params);
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

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%' }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            my: 5,
                        }}
                    >
                        Payment History
                    </Typography>
                    <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '100%' }}>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                <Paper sx={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        rowCount={total}
                                        paginationMode="server"
                                        paginationModel={paginationModel}
                                        onPaginationModelChange={(newModel) => {
                                            setPaginationModel((prev) => ({
                                                ...prev,
                                                page: newModel.page,
                                            }));
                                        }}
                                        sx={{
                                            border: 'none',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                        }}
                                        getRowId={(row) => row.id}
                                    />
                                </Paper>

                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
