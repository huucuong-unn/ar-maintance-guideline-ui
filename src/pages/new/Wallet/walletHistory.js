import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Autocomplete, TextField, Button } from '@mui/material';
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
    const userInfo = storageService.getItem('userInfo')?.user || null;

    const columns: GridColDef[] = [
        { field: 'id', headerName: 'No.', width: 70 },
        { field: 'type', headerName: 'Type', width: 150 },
        {
            field: 'serviceName',
            headerName: 'Service Name',
            width: 200,
            renderCell: (params) => params.row.serviceName,
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
    const [searchParams, setSearchParams] = useState({
        type: '',
        serviceName: '',
        receiverName: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    const fetchWalletHistory = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                type: searchParams.type || undefined,
                serviceName: searchParams.serviceName || undefined,
                receiverName: searchParams.receiverName || undefined,
            };
            const response = await WalletAPI.getWalletHistoryByUserId(userInfo.id, params);
            const data = response?.result?.objectList.map((item, index) => ({
                ...item,
                id: index + 1,
                amount: item.amount,
                balance: item.balance,
                createdDate: formatDateTime(item.createdDate),
            }));
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('Failed to fetch wallet history: ', error);
        }
    };

    useEffect(() => {
        if (userInfo) {
            fetchWalletHistory();
        }
    }, [paginationModel]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTypeChange = (event, newValue) => {
        setSearchParams((prev) => ({
            ...prev,
            type: newValue || '',
        }));
    };

    const handleSearch = () => {
        if (userInfo) {
            fetchWalletHistory();
        }
    };

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
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 4 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            mb: 4,
                        }}
                    >
                        Wallet History
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', gap: 2, mb: 2 }}>
                        {/* Sort Type */}
                        <Autocomplete
                            options={['DEBIT', 'CREDIT']}
                            value={searchParams.type}
                            onChange={handleTypeChange}
                            renderInput={(params) => <TextField {...params} label="Type" variant="outlined" />}
                            sx={{ width: 200 }}
                        />

                        {/* Search Service Name */}
                        <TextField
                            label="Service Name"
                            variant="outlined"
                            name="serviceName"
                            value={searchParams.serviceName}
                            onChange={handleInputChange}
                            sx={{ width: 250 }}
                        />

                        {/* Search Receiver Name */}
                        <TextField
                            label="Receiver Name"
                            variant="outlined"
                            name="receiverName"
                            value={searchParams.receiverName}
                            onChange={handleInputChange}
                            sx={{ width: 250 }}
                        />

                        {/* Search Button */}
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#115293',
                                    color: 'white',
                                },
                                p: 2,
                            }}
                            onClick={handleSearch}
                        >
                            Search
                        </Button>
                    </Box>
                    <Paper
                        sx={{
                            height: 500,
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 2,
                            overflow: 'hidden',
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) =>
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }))
                            }
                            sx={{ border: 'none' }}
                            getRowId={(row) => row.id}
                        />
                    </Paper>

                    <Copyright sx={{ mt: 5 }} />
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
