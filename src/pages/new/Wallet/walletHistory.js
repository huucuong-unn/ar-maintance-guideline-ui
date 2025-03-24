import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import WalletAPI from '~/API/WalletAPI';
import storageService from '~/components/StorageService/storageService';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { formatDateTime } from '~/Constant';

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

export default function WalletHistory() {
    const paginationModel = { page: 0, pageSize: 5 };
    const userInfo = storageService.getItem('userInfo')?.user || null;

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'No.', width: 70 },
        { field: 'type', headerName: 'Type', width: 150 },
        {
            field: 'serviceName',
            headerName: 'Service Name',
            width: 200,
            renderCell: (params) => params.row.serviceName || 'Employee Request Point',
        },
        { field: 'guidelineName', headerName: 'Guideline Name', width: 200 },
        { field: 'optionName', headerName: 'Option Name', width: 200 },
        { field: 'receiverName', headerName: 'Receiver Name', width: 200 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 150,
            align: 'center',
            headerAlign: 'center',
            renderCell: (params) => {
                const { row } = params;
                const isDebit = row.type === 'DEBIT';
                const formattedAmount = isDebit ? `-${row.amount}` : `+${row.amount}`;

                return (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            width: '100%',
                        }}
                    >
                        <Typography
                            sx={{
                                color: isDebit ? 'red' : 'green',
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                        >
                            {formattedAmount}
                        </Typography>
                    </Box>
                );
            },
        },
        { field: 'balance', headerName: 'Balance', width: 150 },
        { field: 'createdDate', headerName: 'Created At', width: 200 },
    ];

    const [rows, setRows] = useState([]);

    useEffect(() => {
        const fetchWalletHistory = async () => {
            try {
                const response = await WalletAPI.getWalletHistoryByUserId(userInfo.id);
                const data = response.result.map((item, index) => ({
                    ...item,
                    id: index + 1,
                    amount: item.amount,
                    balance: item.balance,
                    createdDate: formatDateTime(item.createdDate),
                }));
                setRows(data);
            } catch (error) {
                console.log('Failed to fetch wallet history: ', error);
            }
        };
        if (userInfo) {
            fetchWalletHistory();
        }
    }, []);

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
                        position: 'absolute',
                        top: '3%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                >
                    Wallet History
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
                                    sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                    initialState={{ pagination: { paginationModel } }}
                                    pageSizeOptions={[5, 10]}
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
