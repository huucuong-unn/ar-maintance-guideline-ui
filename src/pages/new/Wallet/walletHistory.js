import { Autocomplete, TextField, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import WalletAPI from '~/API/WalletAPI';
import storageService from '~/components/StorageService/storageService';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { formatDateTime } from '~/Constant';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Chip,
    Stack,
    Card,
    CardContent,
    Divider,
    InputAdornment,
    IconButton,
} from '@mui/material';
import {
    AccountBalanceWallet as WalletIcon,
    Search as SearchIcon,
    Refresh as RefreshIcon,
    FilterList as FilterListIcon,
    CallMade as CallMadeIcon,
    CallReceived as CallReceivedIcon,
    AttachMoney as AttachMoneyIcon,
    Event as EventIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    ArrowUpward as ArrowUpwardIcon,
    ArrowDownward as ArrowDownwardIcon,
    Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { type } from '@testing-library/user-event/dist/type';

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

    const enhanceColumns = (columns) => {
        return columns.map((column) => {
            // Cải thiện cột Type
            if (column.field === 'type') {
                return {
                    ...column,
                    renderCell: (params) => {
                        const isCredit = params.value === 'CREDIT';
                        return (
                            <Chip
                                icon={isCredit ? <CallReceivedIcon /> : <CallMadeIcon />}
                                label={params.value}
                                size="small"
                                color={isCredit ? 'success' : 'error'}
                                variant="outlined"
                                sx={{
                                    borderRadius: '16px',
                                    fontWeight: 'medium',
                                }}
                            />
                        );
                    },
                };
            }

            // Cải thiện cột Amount
            if (column.field === 'amount') {
                return {
                    ...column,
                    renderCell: (params) => {
                        const isCredit = params.row.type === 'CREDIT';
                        const value = typeof params.value === 'number' ? params.value : 0;
                        const formattedValue = `${isCredit ? '+' : '-'}${value.toLocaleString('en-US')}`;

                        return (
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    height: '100%',
                                }}
                            >
                                <Typography className={isCredit ? 'transaction-credit' : 'transaction-debit'}>
                                    {formattedValue}
                                </Typography>
                            </Box>
                        );
                    },
                };
            }

            // Cải thiện cột Date
            if (column.field === 'date') {
                return {
                    ...column,
                    renderCell: (params) => (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <EventIcon sx={{ color: 'text.secondary', mr: 0.5, fontSize: '1rem' }} />
                            <Typography variant="body2">{params.value}</Typography>
                        </Box>
                    ),
                };
            }

            // Cải thiện cột Service Name
            if (column.field === 'serviceName') {
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
                            <CategoryIcon
                                // sx={{ color: 'primary.main', mr: 0.5, fontSize: '1rem' }}
                                sx={{
                                    color: 'primary.main',
                                    mr: 0.5,
                                    fontSize: '1rem',
                                    alignSelf: 'center', // Center the icon vertically
                                }}
                            />
                            <Typography fontWeight="medium">{params.value}</Typography>
                        </Box>
                    ),
                };
            }

            // Cải thiện cột Receiver Name
            if (column.field === 'receiverName') {
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
                            <PersonIcon
                                // sx={{ color: 'text.secondary', mr: 0.5, fontSize: '1rem' }}
                                sx={{
                                    color: 'text.secondary',
                                    mr: 0.5,
                                    fontSize: '1rem',
                                    alignSelf: 'center', // Center the icon vertically
                                }}
                            />
                            <Typography variant="body2">{params.value}</Typography>
                        </Box>
                    ),
                };
            }

            return column;
        });
    };

    const columns: GridColDef[] = [
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
        { field: 'senderName', headerName: 'Sender Name', width: 200 },
        { field: 'modelRequestId', headerName: 'Model Request Code', width: 200 },
        { field: 'revisionType', headerName: 'Revision Type', width: 200 },
        {
            field: 'amount',
            headerName: 'Amount',
            width: 150,
            // renderCell: (params) => {
            //     const { row } = params;
            //     const isDebit = row.type === 'DEBIT';
            //     const formattedAmount = isDebit ? `-${row.amount}` : `+${row.amount}`;
            //     console.log('formattedAmount: ', formattedAmount);
            //     return (
            //         <Box
            //             sx={{
            //                 display: 'flex',
            //                 justifyContent: 'center',
            //                 alignItems: 'center',
            //                 height: '100%',
            //                 width: '100%',
            //             }}
            //         >
            //             <Typography
            //                 sx={{
            //                     color: isDebit ? 'red' : 'green',
            //                     fontWeight: 'bold',
            //                     textAlign: 'center',
            //                 }}
            //             >
            //                 {formattedAmount}
            //             </Typography>
            //         </Box>
            //     );
            // },
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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 3 }}>
                    {/* Header với thông tin Wallet */}
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
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <WalletIcon sx={{ mr: 2, fontSize: 'inherit', color: '#051D40' }} />
                                    Wallet History
                                </Typography>
                            </Box>
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
                            <Grid item xs={12} sm={6} md={3}>
                                <Autocomplete
                                    options={['DEBIT', 'CREDIT']}
                                    value={searchParams.type}
                                    onChange={handleTypeChange}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Transaction Type"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ReceiptIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                    renderOption={(props, option) => (
                                        <li {...props}>
                                            {option === 'CREDIT' ? (
                                                <CallReceivedIcon
                                                    fontSize="small"
                                                    sx={{ color: 'success.main', mr: 1 }}
                                                />
                                            ) : (
                                                <CallMadeIcon fontSize="small" sx={{ color: 'error.main', mr: 1 }} />
                                            )}
                                            {option}
                                        </li>
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Service Name"
                                    variant="outlined"
                                    name="serviceName"
                                    value={searchParams.serviceName}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CategoryIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter service name"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
                                <TextField
                                    fullWidth
                                    label="Receiver Name"
                                    variant="outlined"
                                    name="receiverName"
                                    value={searchParams.receiverName}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PersonIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter receiver name"
                                />
                            </Grid>

                            <Grid item xs={12} sm={6} md={3}>
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
                                            // Reset search parameters
                                            setSearchParams({
                                                type: null,
                                                serviceName: '',
                                                receiverName: '',
                                            });
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
                            columns={enhanceColumns(columns)}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) =>
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }))
                            }
                            sx={{
                                border: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                                // Custom styling for transaction types
                                '& .transaction-debit': {
                                    color: '#C62828',
                                    fontWeight: 'bold',
                                },
                                '& .transaction-credit': {
                                    color: '#2E7D32',
                                    fontWeight: 'bold',
                                },
                            }}
                            getRowId={(row) => row.id}
                        />
                    </Paper>

                    <Copyright sx={{ mt: 3 }} />
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
