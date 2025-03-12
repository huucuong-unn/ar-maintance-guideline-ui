import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import AccountAPI from '~/API/AccountAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
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

// Validation schema for the registration form
const validationSchema = Yup.object().shape({
    companyName: Yup.string().required('Company Name is required'),
    phone: Yup.string()
        .required('Phone is required')
        .matches(/^[0-9]+$/, 'Phone must be only digits')
        .max(11, 'Phone cannot exceed 11 digits'),
    email: Yup.string().required('Email is required').email('Email is invalid'),
    password: Yup.string().required('Password is required'),
    confirmPassword: Yup.string()
        .required('Confirm Password is required')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
});

// Registration form rendered inside a Dialog component
function CreateAccountDialog({ open, onClose, onSuccess }) {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        console.log('Form data:', data);
        const requestBody = {
            email: data.email,
            password: data.password,
            phone: data.phone,
            avatar: 'http://example.com/avatar.jpg', // replace with actual image URL or file upload logic
            company: data.companyName,
            roleName: 'COMPANY',
        };

        try {
            const response = await AccountAPI.createAccount(requestBody);
            console.log('Registration successful:', response.data);
            toast.success('Registration successful!');
            onSuccess && onSuccess();
            onClose();
            // Optionally, navigate to another page here.
        } catch (error) {
            if (error.response && error.response.data) {
                const { code, message } = error.response.data;
                if (code === 2711 && message === 'Create Company failed') {
                    alert('Company Name is already taken!');
                } else {
                    alert('Registration failed! Please try again.');
                }
            } else {
                alert('An error occurred. Please check your network connection.');
            }
            console.error('Registration failed:', error);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Create New Company Account</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, px: 2 }}>
                    <Controller
                        name="companyName"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Company Name"
                                error={!!errors.companyName}
                                helperText={errors.companyName?.message}
                            />
                        )}
                    />

                    <Controller
                        name="phone"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Phone"
                                error={!!errors.phone}
                                helperText={errors.phone?.message}
                            />
                        )}
                    />
                    <Controller
                        name="email"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                error={!!errors.password}
                                helperText={errors.password?.message}
                            />
                        )}
                    />
                    <Controller
                        name="confirmPassword"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm Password"
                                type="password"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                            />
                        )}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            mb: 2,
                            bgcolor: '#051D40',
                            borderRadius: '24px',
                            py: 1.5,
                            fontSize: '16px',
                            ':hover': { bgcolor: '#051D40', opacity: 0.8 },
                        }}
                    >
                        Create
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AccountsManagement() {
    const [rows, setRows] = useState([]);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchParams, setSearchParams] = useState({
        email: '',
        status: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);
    const userInfo = storageService.getItem('userInfo')?.user || null;

    // State for the Create Account dialog
    const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);

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
            const response = await AccountAPI.getAllAccount(params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel, searchParams]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    };

    const columns = [
        { field: 'email', headerName: 'Email', width: 300 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        {
            field: 'roleName',
            headerName: 'Role',
            width: 200,
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 200,
            renderCell: (params) => params.row.company?.companyName,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => {
                let color = 'black';
                switch (params.value) {
                    case 'ACTIVE':
                        color = 'green';
                        break;
                    case 'INACTIVE':
                        color = 'grey';
                        break;
                    case 'PENDING':
                        color = 'orange';
                        break;
                    case 'REJECT':
                        color = 'red';
                        break;
                    default:
                        color = 'black';
                }
                return <Box sx={{ color, fontWeight: 'bold', textTransform: 'uppercase' }}>{params.value}</Box>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 400,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => {
                                    // Open your confirm status dialog here
                                }}
                                sx={{ width: '100px' }}
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => {
                                    // Open your confirm status dialog here
                                }}
                                sx={{ width: '100px' }}
                            >
                                Active
                            </Button>
                        )}
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => {
                                // Open reset password dialog here
                            }}
                        >
                            Reset Password
                        </Button>
                    </Box>
                );
            },
        },
    ];

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
                <Box sx={{ my: 4 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '36px',
                            color: '#051D40',
                            mb: 4,
                        }}
                    >
                        Account Management
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 8 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#051D40',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#02F18D',
                                    color: '#051D40',
                                },
                                p: 2,
                            }}
                            onClick={() => setOpenCreateAccountDialog(true)}
                        >
                            Create Account
                        </Button>
                        {/* Search and Filter Section */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: 'right',
                                alignItems: 'center',
                            }}
                        >
                            <TextField
                                variant="outlined"
                                label="Search by Email"
                                sx={{ width: '300px' }}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <FormControl sx={{ width: '200px' }}>
                                <InputLabel>Status</InputLabel>
                                <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="PENDING">Pending</MenuItem>
                                    <MenuItem value="ACTIVE">Active</MenuItem>
                                    <MenuItem value="INACTIVE">Inactive</MenuItem>
                                    <MenuItem value="REJECT">Reject</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="contained" onClick={() => setSearchParams({ email, status })}>
                                Search
                            </Button>
                        </Box>
                    </Box>

                    {/* Data Grid */}
                    <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.9)', width: '100%' }}>
                        <Box sx={{ my: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
                            <Paper sx={{ height: 400, width: '100%' }}>
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
                                    getRowId={(row) => row.id}
                                    slots={{ toolbar: GridToolbar }}
                                    onRowClick={(params) => {
                                        // Optionally open a modal with user details
                                    }}
                                />
                            </Paper>
                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Grid>

                    {/* Create Account Dialog */}
                    <CreateAccountDialog
                        open={openCreateAccountDialog}
                        onClose={() => setOpenCreateAccountDialog(false)}
                        onSuccess={fetchData}
                    />
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
