import { createTheme, ThemeProvider } from '@mui/material/styles';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import {
    Box,
    Typography,
    Skeleton,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Modal,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import PaymentAPI from '~/API/PaymentAPI';
import storageService from '~/components/StorageService/storageService';
import { format } from 'date-fns';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©Tortee '}
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

    const columns = [
        { field: 'itemCode', headerName: 'Item Code', width: 200 },
        { field: 'orderCode', headerName: 'Order Code', width: 200 },
        { field: 'createdDate', headerName: 'Create At', width: 200 },
        { field: 'updatedDate', headerName: 'Update At', width: 200 },
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pageParam = paginationModel.page + 1;
                const sizeParam = paginationModel.pageSize;

                const params = {
                    page: pageParam,
                    size: sizeParam,
                };

                const response = await PaymentAPI.getPaymentsByCompanyId(userInfo?.company?.id, params);

                const data = response?.result?.objectList || [];
                console.log(data);

                const formattedData = data.map((item) => ({
                    ...item,
                    createdDate: item.createdDate ? format(new Date(item.createdDate), 'MM/dd/yyyy HH:mm:ss') : '',
                    updatedDate: item.updatedDate ? format(new Date(item.updatedDate), 'MM/dd/yyyy HH:mm:ss') : '',
                }));

                setRows(formattedData);
                setTotal(response?.result?.totalItems || 0);
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            }
        };
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
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: '900',
                        fontSize: '46px',
                        color: '#051D40',
                        // zIndex: 1,
                        position: 'absolute',
                        top: '3%',
                        left: '20%',
                    }}
                >
                    Payment History
                </Typography>
                <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '90%' }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
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
                                    sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                    getRowId={(row) => row.id}
                                    slots={{ toolbar: GridToolbar }}
                                />
                            </Paper>

                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
