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
import storageService from '~/components/StorageService/storageService';
import AccountAPI from '~/API/AccountAPI';

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

export default function EmployeesManagement() {
    const [rows, setRows] = useState([]);
    const [searchParams, setSearchParams] = useState({
        username: '',
        email: '',
        status: '',
    });
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const [total, setTotal] = useState(0);

    const columns = [
        { field: 'username', headerName: 'Username', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        { field: 'status', headerName: 'Status Account', width: 200 },
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pageParam = paginationModel.page + 1;
                const sizeParam = paginationModel.pageSize;

                const params = {
                    page: pageParam,
                    size: sizeParam,
                    username: searchParams.username || undefined,
                    email: searchParams.email || undefined,
                    status: searchParams.status || undefined,
                };

                console.log(params);

                const response = await AccountAPI.getStaffByCompanyId(userInfo?.company?.id, params, params);
                console.log(response);

                const data = response?.result?.objectList || [];
                console.log(data);

                setRows(data);

                setTotal(response?.result?.totalItems || 0);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        fetchData();
    }, [paginationModel, searchParams]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        // Get the UTC date parts
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0'); // Months are 0-based
        const year = date.getUTCFullYear();

        return `${day}/${month}/${year}`; // Format to dd/mm/yyyy
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
                    alignItems: 'center',
                    flexDirection: 'column',
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
                    Employees
                </Typography>
                {/* ===================== CREATE + SEARCH & FILTER ROW ===================== */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', mt: 3 }}>
                    {/* Search by email */}
                    <TextField
                        variant="outlined"
                        label="Search by Username"
                        sx={{ width: '300px' }}
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <TextField
                        variant="outlined"
                        label="Search by Email"
                        sx={{ width: '300px' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Filter by status */}
                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Create Course button */}
                    <Button
                        variant="contained"
                        sx={{ ml: 'auto' }}
                        onClick={() => setSearchParams({ username, email, status })}
                    >
                        Search
                    </Button>
                </Box>
                {/* ===================== END CREATE + SEARCH & FILTER ROW ===================== */}
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
