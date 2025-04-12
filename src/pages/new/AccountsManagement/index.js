import { yupResolver } from '@hookform/resolvers/yup';
import {
    Box,
    Button,
    CircularProgress,
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
    Chip,
    InputAdornment,
    Autocomplete,
    Avatar,
    Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as yup from 'yup';
import AccountAPI from '~/API/AccountAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ResetPasswordDialog from '~/components/ResetPassword';
import storageService from '~/components/StorageService/storageService';
import { useWallet } from '~/WalletContext';

// Icons import
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import EmailIcon from '@mui/icons-material/Email';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PhoneIcon from '@mui/icons-material/Phone';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EngineeringIcon from '@mui/icons-material/Engineering';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockResetIcon from '@mui/icons-material/LockReset';
import ApartmentIcon from '@mui/icons-material/Apartment';
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

const validationSchema = yup.object().shape({
    role: yup.string().required('Role is required'),
    companyName: yup.string().when('role', {
        is: 'COMPANY',
        then: () => yup.string().required('Company Name is required'),
        otherwise: () => yup.string(),
    }),
    phone: yup.string().required('Phone is required'),
    email: yup.string().email('Invalid email').required('Email is required'),
    password: yup.string().required('Password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm Password is required'),
});

function CreateAccountDialog({ open, onClose, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: {
            role: 'COMPANY', // Default role is Company
        },
    });

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            reset({
                role: 'COMPANY',
                companyName: '',
                phone: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
        }
    }, [open, reset]);

    // Watch the role field to conditionally render company name
    const role = watch('role');

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        console.log('Form data:', data);
        const requestBody = {
            email: data.email,
            password: data.password,
            phone: data.phone,
            avatar: 'http://example.com/avatar.jpg', // replace with actual image URL or file upload logic
            company: data.role === 'COMPANY' ? data.companyName : null,
            roleName: data.role,
        };

        try {
            let response = null;
            if (requestBody.roleName === 'COMPANY') {
                response = await AccountAPI.createAccount(requestBody);
            } else {
                response = await AccountAPI.createStaff(requestBody);
            }
            console.log('Registration successful:', response.data);
            toast.success('Account created successfully!');
            onSuccess && onSuccess();
            onClose();
            // Optionally, navigate to another page here.
        } catch (error) {
            if (error.response && error.response.data) {
                const { code, message } = error.response.data;
                if (code === 2711 && message === 'Create Company failed') {
                    toast.error('Company Name is already taken!');
                } else {
                    toast.error(error.response.data.message);
                }
            } else {
                toast.error('An error occurred. Please check your network connection.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                <PersonAddIcon color="primary" />
                Create New Account
            </DialogTitle>
            <Divider />
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                    {/* Role Dropdown */}
                    <Controller
                        name="role"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                select
                                margin="normal"
                                required
                                fullWidth
                                label="Role"
                                error={!!errors.role}
                                helperText={errors.role?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AdminPanelSettingsIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            >
                                <MenuItem value="COMPANY">Company</MenuItem>
                                <MenuItem value="DESIGNER">Designer</MenuItem>
                            </TextField>
                        )}
                    />

                    {/* Company Name - Only show when role is COMPANY */}
                    {role === 'COMPANY' && (
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
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BusinessIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            )}
                        />
                    )}

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
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PhoneIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
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
                                type="email"
                                label="Email"
                                error={!!errors.email}
                                helperText={errors.email?.message}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
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
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 3 }}>
                <Button
                    onClick={onClose}
                    disabled={isSubmitting}
                    sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                    }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit(onSubmit)}
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                        bgcolor: '#051D40',
                        borderRadius: '8px',
                        textTransform: 'none',
                        px: 3,
                    }}
                    startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <PersonAddIcon />}
                >
                    {isSubmitting ? 'Creating...' : 'Create Account'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default function AccountsManagement() {
    const { currentPoints, fetchWallet } = useWallet();
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
    const [isLoading, setIsLoading] = useState(false);

    // Stats for dashboard
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [activeAccounts, setActiveAccounts] = useState(0);
    const [pendingAccounts, setPendingAccounts] = useState(0);
    const [companyAccounts, setCompanyAccounts] = useState(0);

    // State for the Create Account dialog
    const [openCreateAccountDialog, setOpenCreateAccountDialog] = useState(false);

    // State for Reset Password dialog
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState(null);

    // State for view user details dialog
    const [openUserDetailDialog, setOpenUserDetailDialog] = useState(false);
    const [viewUserDetail, setViewUserDetail] = useState(null);

    const fetchStats = () => {
        // Calculate statistics from the current data
        // In a real application, you might want to fetch this from a dedicated API endpoint
        try {
            const active = rows.filter((account) => account.status === 'ACTIVE').length;
            const pending = rows.filter((account) => account.status === 'PENDING').length;
            const companies = rows.filter((account) => account.roleName === 'COMPANY').length;

            setActiveAccounts(active);
            setPendingAccounts(pending);
            setCompanyAccounts(companies);
            setTotalAccounts(total);
        } catch (error) {
            console.error('Failed to calculate stats:', error);
        }
    };

    const fetchData = async () => {
        try {
            setIsLoading(true);
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
            fetchWallet();
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
            toast.error('Failed to load accounts data');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel, searchParams]);

    useEffect(() => {
        fetchStats();
    }, [rows, total]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    };

    const handleChangeStatus = async (id) => {
        try {
            setIsLoading(true);
            const response = await AccountAPI.changeStatusStaff(id);
            if (response?.result) {
                toast.success('Status updated successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status. ' + error?.response?.data?.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle opening user detail dialog
    const handleOpenUserDetail = (user) => {
        setViewUserDetail(user);
        setOpenUserDetailDialog(true);
    };

    // Xử lý mở dialog reset password
    const handleOpenResetPasswordDialog = (user) => {
        setResetPasswordUser(user);
        setOpenResetPasswordDialog(true);
    };

    const resetFilters = () => {
        setEmail('');
        setStatus('');
        setSearchParams({
            email: '',
            status: '',
        });
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
    };

    // Helper function to get role icon and color
    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN':
                return <SupervisorAccountIcon sx={{ color: '#9c27b0' }} />;
            case 'COMPANY':
                return <BusinessIcon sx={{ color: '#2196f3' }} />;
            case 'DESIGNER':
                return <EngineeringIcon sx={{ color: '#ff9800' }} />;
            default:
                return <PersonAddIcon sx={{ color: '#757575' }} />;
        }
    };

    const getStatusChipProps = (status) => {
        let props = {
            icon: <PendingIcon />,
            label: status,
            size: 'small',
            sx: {
                bgcolor: 'rgba(255, 152, 0, 0.1)',
                color: '#ff9800',
                fontWeight: 'medium',
                borderRadius: '16px',
                border: '1px solid rgba(255, 152, 0, 0.2)',
            },
        };

        switch (status) {
            case 'ACTIVE':
                props.icon = <CheckCircleIcon />;
                props.sx = {
                    bgcolor: 'rgba(46, 125, 50, 0.1)',
                    color: 'green',
                    fontWeight: 'medium',
                    borderRadius: '16px',
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                };
                break;
            case 'INACTIVE':
                props.icon = <CancelIcon />;
                props.sx = {
                    bgcolor: 'rgba(158, 158, 158, 0.1)',
                    color: 'grey',
                    fontWeight: 'medium',
                    borderRadius: '16px',
                    border: '1px solid rgba(158, 158, 158, 0.2)',
                };
                break;
            case 'PENDING':
                props.icon = <PendingIcon />;
                props.sx = {
                    bgcolor: 'rgba(255, 152, 0, 0.1)',
                    color: 'orange',
                    fontWeight: 'medium',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 152, 0, 0.2)',
                };
                break;
            case 'REJECT':
                props.icon = <CancelIcon />;
                props.sx = {
                    bgcolor: 'rgba(211, 47, 47, 0.1)',
                    color: 'red',
                    fontWeight: 'medium',
                    borderRadius: '16px',
                    border: '1px solid rgba(211, 47, 47, 0.2)',
                };
                break;
        }

        return props;
    };

    const columns = [
        {
            field: 'email',
            headerName: 'Email',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <EmailIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'phone',
            headerName: 'Phone',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <PhoneIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: 'roleName',
            headerName: 'Role',
            flex: 0.8,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    icon={getRoleIcon(params.value)}
                    label={params.value || 'N/A'}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        color: '#1976d2',
                        fontWeight: 'medium',
                        borderRadius: '16px',
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                    }}
                />
            ),
        },
        {
            field: 'company',
            headerName: 'Company',
            flex: 1,
            minWidth: 160,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <BusinessIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{params.row.company?.companyName || 'N/A'}</Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 0.8,
            minWidth: 130,
            renderCell: (params) => {
                const chipProps = getStatusChipProps(params.value);
                return <Chip {...chipProps} />;
            },
        },
        {
            field: 'action',
            headerName: 'Actions',
            flex: 1.2,
            minWidth: 280,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleOpenUserDetail(params.row)}
                            sx={{
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            View
                        </Button>

                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<BlockIcon />}
                                onClick={() => handleChangeStatus(params.row.id)}
                                sx={{
                                    bgcolor: 'orange',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'darkorange',
                                    },
                                }}
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<LockOpenIcon />}
                                onClick={() => handleChangeStatus(params.row.id)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Activate
                            </Button>
                        )}
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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 3 }}>
                    {/* Header with Dashboard Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 1,
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
                                        alignItems: 'center', // để icon và chữ cùng hàng
                                    }}
                                >
                                    <SupervisorAccountIcon
                                        sx={{
                                            fontSize: 'inherit',
                                            marginRight: 1,
                                        }}
                                    />
                                    Account Management
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<PersonAddIcon />}
                                        sx={{
                                            bgcolor: '#051D40',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#02F18D',
                                                color: '#051D40',
                                            },
                                            px: 3,
                                            py: 1.2,
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(5, 29, 64, 0.15)',
                                            fontWeight: 'medium',
                                        }}
                                        onClick={() => setOpenCreateAccountDialog(true)}
                                    >
                                        Create Account
                                    </Button>
                                </Box>
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
                                            Total Accounts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {totalAccounts}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PersonAddIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Registered Users
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* <Grid item xs={12} sm={6} md={3}>
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
                                            Active Accounts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {activeAccounts}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CheckCircleIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Enabled Users
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
                                            Pending Accounts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {pendingAccounts}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PendingIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Awaiting Approval
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
                                            background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                                            border: '1px solid #9FA8DA',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Company Accounts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#303F9F" sx={{ mt: 1 }}>
                                            {companyAccounts}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <BusinessIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Organization Users
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid> */}
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
                            <Grid item xs={12} md={5}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <EmailIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by email address"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        label="Status"
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        startAdornment={
                                            <InputAdornment position="start" sx={{ ml: -0.5, mr: -0.8 }}>
                                                <CheckCircleIcon color="action" fontSize="small" />
                                            </InputAdornment>
                                        }
                                    >
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="PENDING">Pending</MenuItem>
                                        <MenuItem value="ACTIVE">Active</MenuItem>
                                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                                        <MenuItem value="REJECT">Reject</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<FilterListIcon />}
                                        onClick={() => setSearchParams({ email, status })}
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
                                        onClick={resetFilters}
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
                            flex: 1,
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
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                            disableRowSelectionOnClick
                            autoHeight
                            getRowId={(row) => row.id}
                            loading={isLoading}
                            sx={{
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        />
                    </Paper>

                    <Box sx={{ mt: 'auto' }}>
                        <Copyright />
                    </Box>
                </Box>
            </Grid>

            {/* Create Account Dialog */}
            <CreateAccountDialog
                open={openCreateAccountDialog}
                onClose={() => setOpenCreateAccountDialog(false)}
                onSuccess={fetchData}
            />

            {/* Reset Password Dialog */}
            {resetPasswordUser && (
                <ResetPasswordDialog
                    open={openResetPasswordDialog}
                    onClose={() => {
                        setOpenResetPasswordDialog(false);
                        setResetPasswordUser(null);
                    }}
                    userId={resetPasswordUser.id}
                    userEmail={resetPasswordUser.email}
                />
            )}

            {/* User Detail Dialog */}
            <Dialog open={openUserDetailDialog} onClose={() => setOpenUserDetailDialog(false)} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                    <PersonAddIcon color="primary" />
                    User Account Details
                    {viewUserDetail && (
                        <Chip
                            icon={viewUserDetail.status === 'ACTIVE' ? <CheckCircleIcon /> : <CancelIcon />}
                            label={viewUserDetail.status}
                            size="small"
                            sx={{
                                ml: 'auto',
                                bgcolor:
                                    viewUserDetail.status === 'ACTIVE'
                                        ? 'rgba(46, 125, 50, 0.1)'
                                        : 'rgba(211, 47, 47, 0.1)',
                                color: viewUserDetail.status === 'ACTIVE' ? '#2E7D32' : '#D32F2F',
                                fontWeight: 'medium',
                                borderRadius: '16px',
                                border:
                                    viewUserDetail.status === 'ACTIVE'
                                        ? '1px solid rgba(46, 125, 50, 0.2)'
                                        : '1px solid rgba(211, 47, 47, 0.2)',
                            }}
                        />
                    )}
                </DialogTitle>
                <Divider />
                <DialogContent>
                    {viewUserDetail && (
                        <Grid container spacing={3}>
                            {/* Basic Information */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                        Basic Information
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Email
                                                    </Typography>
                                                    <Typography variant="body1" fontWeight="medium">
                                                        {viewUserDetail.email}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <PhoneIcon sx={{ color: 'action.active', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Phone
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {viewUserDetail.phone || 'Not provided'}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <AdminPanelSettingsIcon sx={{ color: 'action.active', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Role
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {viewUserDetail.roleName || 'Not assigned'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>

                            {/* Company Information */}
                            <Grid item xs={12} md={6}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                        Company Information
                                    </Typography>
                                    {viewUserDetail.company ? (
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <BusinessIcon sx={{ color: 'action.active', mr: 1 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Company Name
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {viewUserDetail.company.companyName}
                                                        </Typography>
                                                    </Box>
                                                </Box>

                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                    <ApartmentIcon sx={{ color: 'action.active', mr: 1 }} />
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Company ID
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {viewUserDetail.company.id}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Typography variant="body1" sx={{ mt: 1 }}>
                                            No company associated with this account.
                                        </Typography>
                                    )}
                                </Paper>
                            </Grid>

                            {/* Account Status */}
                            <Grid item xs={12}>
                                <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                    <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                        Account Status
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                {viewUserDetail.status === 'ACTIVE' ? (
                                                    <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                                                ) : (
                                                    <CancelIcon sx={{ color: 'red', mr: 1 }} />
                                                )}
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Status
                                                    </Typography>
                                                    <Typography
                                                        variant="body1"
                                                        fontWeight="medium"
                                                        color={
                                                            viewUserDetail.status === 'ACTIVE'
                                                                ? 'green'
                                                                : viewUserDetail.status === 'PENDING'
                                                                ? 'orange'
                                                                : 'error'
                                                        }
                                                    >
                                                        {viewUserDetail.status}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                <EventIcon sx={{ color: 'action.active', mr: 1 }} />
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Created Date
                                                    </Typography>
                                                    <Typography variant="body1">
                                                        {formatDate(viewUserDetail.createdDate) || 'Not available'}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    {viewUserDetail && (
                        <>
                            <Button
                                variant="outlined"
                                startIcon={<LockResetIcon />}
                                onClick={() => {
                                    setOpenUserDetailDialog(false);
                                    handleOpenResetPasswordDialog(viewUserDetail);
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    mr: 'auto',
                                }}
                            >
                                Reset Password
                            </Button>

                            {viewUserDetail.status === 'ACTIVE' ? (
                                <Button
                                    variant="contained"
                                    color="warning"
                                    startIcon={<BlockIcon />}
                                    onClick={() => {
                                        handleChangeStatus(viewUserDetail.id);
                                        setOpenUserDetailDialog(false);
                                    }}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                    }}
                                >
                                    Disable Account
                                </Button>
                            ) : (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<LockOpenIcon />}
                                    onClick={() => {
                                        handleChangeStatus(viewUserDetail.id);
                                        setOpenUserDetailDialog(false);
                                    }}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                    }}
                                >
                                    Activate Account
                                </Button>
                            )}

                            <Button
                                variant="contained"
                                onClick={() => setOpenUserDetailDialog(false)}
                                sx={{
                                    ml: 1,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    bgcolor: '#051D40',
                                }}
                            >
                                Close
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
