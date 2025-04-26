import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography,
    Autocomplete,
    InputAdornment,
    Chip,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountAPI from '~/API/AccountAPI';
import PaymentAPI from '~/API/PaymentAPI';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import WalletAPI from '~/API/WalletAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import storageService from '~/components/StorageService/storageService';
import { useWallet } from '~/WalletContext';
import BusinessIcon from '@mui/icons-material/Business';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import CancelIcon from '@mui/icons-material/Cancel';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import GroupIcon from '@mui/icons-material/Group';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import StarsIcon from '@mui/icons-material/Stars';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import WorkIcon from '@mui/icons-material/Work';
import EventIcon from '@mui/icons-material/Event';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LockResetIcon from '@mui/icons-material/LockReset';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';

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

export default function EmployeesManagement() {
    const { currentPoints, fetchWallet } = useWallet();

    const navigate = useNavigate();
    const [isLoadingCreateEmployee, setIsLoadingCreateEmployee] = useState(false);
    const [isLoadingAllocationPoint, setIsLoadingAllocationPoint] = useState(false);

    const [rows, setRows] = useState([]);
    const [searchParams, setSearchParams] = useState({
        phoneNumber: '',
        email: '',
        status: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [total, setTotal] = useState(0);

    // Dialog state for creating employee
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openAllocationPointDialog, setOpenAllocationPointDialog] = useState(false);
    const [limitPoint, setLimitPoint] = useState(1);
    const handleChangeLimitPoint = (e) => {
        const { value } = e.target;
        const parsedValue = Math.max(1, Math.min(30, Number(value)));
        setLimitPoint(parsedValue);
    };
    const [newEmployee, setNewEmployee] = useState({
        fullName: '', // New field
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        avatar: '',
        company: userInfo?.company?.companyName || '',
        status: 'ACTIVE',
        expirationDate: '',
        isPayAdmin: false,
        roleName: 'STAFF',
        points: 1,
    });
    const [passwordError, setPasswordError] = useState('');
    const [pssError, setPssError] = useState('');

    // --- State for confirm status change dialog ---
    const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    // --- State for Reset Password dialog ---
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
    const [resetEmployeeId, setResetEmployeeId] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleOpenAllocationPointDialog = () => {
        setOpenAllocationPointDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setNewEmployee({
            fullName: '', // Reset fullName
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            avatar: '',
            company: userInfo?.company?.companyName || '',
            status: 'ACTIVE',
            roleName: 'STAFF',
            expirationDate: '',
            isPayAdmin: false,
            points: 1,
        });
        setPasswordError('');
        setFullNameError(''); // Reset full name error
        setPssError('');
    };
    const handleCloseAllocationPointDialog = () => {
        setOpenAllocationPointDialog(false);
        setLimitPoint(0);
    };

    const [fullNameError, setFullNameError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validate full name if applicable
        if (name === 'fullName') {
            // Validate full name length
            if (value.length < 2) {
                setFullNameError('Full name must be at least 2 characters');
            } else if (value.length > 50) {
                setFullNameError('Full name must be at most 50 characters');
            } else {
                setFullNameError('');
            }
        }

        setNewEmployee({
            ...newEmployee,
            [name]: value,
        });
        // Password validation
        if (name === 'confirmPassword' || name === 'password') {
            if (name === 'confirmPassword' && value !== newEmployee.password) {
                setPasswordError('Passwords do not match');
            } else if (name === 'password' && newEmployee.confirmPassword && value !== newEmployee.confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }

        if (name === 'password' && value.length < 8) {
            setPasswordError('Password must be at least 8 characters');
        }
    };

    const handleInputChangeForPoint = (e) => {
        const { name, value } = e.target;
        const parsedValue = Math.max(1, Math.min(30, Number(value)));
        setNewEmployee({
            ...newEmployee,
            [name]: parsedValue,
        });
    };

    // Modify handleCreateEmployee to validate full name
    const handleCreateEmployee = async () => {
        // Check if full name meets validation
        if (newEmployee.fullName.length < 2 || newEmployee.fullName.length > 50) {
            setFullNameError('Full name must be between 2 and 50 characters');
            return;
        }

        if (!newEmployee.email || !newEmployee.password || !newEmployee.confirmPassword || !newEmployee.phone) {
            return;
        }
        if (passwordError || fullNameError || pssError) {
            return;
        }
        try {
            setIsLoadingCreateEmployee(true);
            const response = await AccountAPI.createStaff(newEmployee);
            if (response?.result?.user) {
                toast.success('Create employee successfully');
            }
            handleCloseCreateDialog();
            fetchData();
        } catch (error) {
            if (error?.response?.data?.code === 9999) {
                toast.success('Create employee successfully');
                handleCloseCreateDialog();
                fetchData();
                return;
            }
            console.error('Failed to create employee:', error);
            toast.error(`Create employee failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateEmployee(false);
        }
    };

    const handleAllocatePoint = async () => {
        if (limitPoint <= 0) {
            toast.error('Limit point must be greater than 0');
            return;
        }
        if (limitPoint >= 30) {
            toast.error('Limit point must be less than 30');
            return;
        }
        if (limitPoint > userInfo?.company?.wallet?.balance) {
            toast.error('Insufficient balance');
            return;
        }
        try {
            setIsLoadingAllocationPoint(true);
            const response = await WalletAPI.allocationPoint(userInfo?.company?.id, limitPoint);
            if (response?.result) {
                toast.success('Points allocated successfully');
            }
            handleCloseAllocationPointDialog();
            fetchData();
        } catch (error) {
            console.error('Failed to allocate points:', error);
            toast.error(`Failed to allocate points. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingAllocationPoint(false);
        }
    };

    // Open confirm dialog for status change
    const handleOpenStatusConfirm = (id) => {
        setSelectedEmployeeId(id);
        setOpenStatusConfirmDialog(true);
    };

    const handleChangeStatus = async (id) => {
        try {
            const response = await AccountAPI.changeStatusStaff(id);
            if (response?.result) {
                toast.success('Update status successfully');
            }
            fetchData();
            fetchCountEmployeeActive();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status. ' + error?.response?.data?.message);
        }
    };

    // Open Reset Password dialog
    const handleOpenResetPassword = (id) => {
        setResetEmployeeId(id);
        setNewPassword('');
        setOpenResetPasswordDialog(true);
    };

    const handleResetPassword = async () => {
        try {
            const response = await AccountAPI.resetPasswordStaff(resetEmployeeId, { password: newPassword });
            if (response?.result) {
                toast.success('Reset password successfully');
            }
            fetchData();
            setOpenResetPasswordDialog(false);
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error('Failed to reset password. ' + error?.response?.data?.message);
        }
    };

    // --- State for Delete Confirm dialog ---
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const handleOpenDeleteConfirm = (id) => {
        setSelectedEmployeeId(id);
        setOpenDeleteConfirmDialog(true);
    };

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const columns = [
        { field: 'email', headerName: 'Email', width: 300 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        { field: 'points', headerName: 'Points', width: 200 },
        { field: 'roleName', headerName: 'Role', width: 200 },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDate(params.value),
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
                        color = 'orange';
                        break;
                    default:
                        color = 'black';
                }
                return <Box sx={{ color, fontWeight: 'bold' }}>{formatStatus(params.value)}</Box>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 400,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handleOpenStatusConfirm(params.row.id)}
                                sx={{ width: '100px', backgroundColor: 'orange', textTransform: 'none' }}
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleOpenStatusConfirm(params.row.id)}
                                sx={{ width: '100px', textTransform: 'none' }}
                            >
                                Active
                            </Button>
                        )}
                        <Button
                            sx={{ textTransform: 'none' }}
                            variant="outlined"
                            size="small"
                            onClick={() => handleOpenResetPassword(params.row.id)}
                        >
                            Reset Password
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const handleDelete = async (id) => {
        try {
            const response = await AccountAPI.deleteStaff(id);
            if (response?.result) {
                toast.success('Delete employee successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Failed to delete employee:', error);
            toast.error('Failed to delete employee. ' + error?.response?.data?.message);
        }
    };

    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                phoneNumber: searchParams.phoneNumber || undefined,
                email: searchParams.email || undefined,
                status: searchParams.status || undefined,
            };
            const response = await AccountAPI.getStaffByCompanyId(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    const [countEmployeeActive, setcountEmployeeActive] = useState(0);

    const fetchCountEmployeeActive = async () => {
        try {
            const response = await AccountAPI.getCountEmployeeActive(userInfo?.company?.id);
            const data = response?.result || 0;
            setcountEmployeeActive(data);
        } catch (error) {
            console.error('Failed to fetch count:', error);
        }
    };

    useEffect(() => {
        fetchCountEmployeeActive();
    }, []);

    const handleSearch = () => {
        setSearchParams((prev) => ({ ...prev }));
        fetchData();
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
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
                                    Employees Management
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
                                        onClick={handleOpenCreateDialog}
                                        disabled={isLoadingCreateEmployee}
                                    >
                                        {isLoadingCreateEmployee ? (
                                            <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                                        ) : (
                                            'Create Employee'
                                        )}
                                    </Button>

                                    <Button
                                        variant="contained"
                                        startIcon={<CardGiftcardIcon />}
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
                                        onClick={handleOpenAllocationPointDialog}
                                        disabled={isLoadingAllocationPoint}
                                    >
                                        {isLoadingAllocationPoint ? (
                                            <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                                        ) : (
                                            'Allocate Points'
                                        )}
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
                                            Total Employees
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <GroupIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Registered Personnel
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
                                            Active Employees
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {countEmployeeActive}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PeopleAltIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Currently Working
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
                                            background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                                            border: '1px solid #FFCC80',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Total Points
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {rows.reduce((sum, employee) => sum + (employee.points || 0), 0)}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <StarsIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Allocated Rewards
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid> */}

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
                                            Company
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="#303F9F"
                                            sx={{
                                                mt: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {userInfo?.company?.companyName || 'Your Company'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <BusinessIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Company Infor
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
                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    variant="outlined"
                                    value={searchParams.phoneNumber}
                                    onChange={(e) =>
                                        setSearchParams((prev) => ({ ...prev, phoneNumber: e.target.value }))
                                    }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <PhoneIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by phone number"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    variant="outlined"
                                    value={searchParams.email}
                                    onChange={(e) => setSearchParams((prev) => ({ ...prev, email: e.target.value }))}
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

                            <Grid item xs={12} md={2}>
                                <Autocomplete
                                    fullWidth
                                    options={['ACTIVE', 'INACTIVE']}
                                    value={searchParams.status || null}
                                    onChange={(event, newValue) =>
                                        setSearchParams((prev) => ({ ...prev, status: newValue || '' }))
                                    }
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Status"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <ManageAccountsIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
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
                                            setSearchParams({ phoneNumber: '', email: '', status: '' });
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
                            columns={[
                                {
                                    field: 'email',
                                    headerName: 'Email',
                                    flex: 1.5,
                                    minWidth: 220,
                                    renderCell: (params) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center', // Try 'start' instead
                                                height: '100%', // Ensure full height
                                            }}
                                        >
                                            <EmailIcon
                                                sx={{
                                                    color: 'action.active',
                                                    mr: 1,
                                                    fontSize: '1rem',
                                                    opacity: 0.7,
                                                    alignSelf: 'center', // Center the icon vertically
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontWeight: 'medium',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                                variant="body2"
                                            >
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
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center', // Try 'start' instead
                                                height: '100%', // Ensure full height
                                            }}
                                        >
                                            <PhoneIcon
                                                sx={{
                                                    color: 'action.active',
                                                    mr: 1,
                                                    fontSize: '1rem',
                                                    opacity: 0.7,
                                                    alignSelf: 'center', // Center the icon vertically
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontWeight: 'medium',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                                variant="body2"
                                            >
                                                {params.value}
                                            </Typography>
                                        </Box>
                                    ),
                                },
                                {
                                    field: 'points',
                                    headerName: 'Points',
                                    flex: 0.8,
                                    minWidth: 100,
                                    renderCell: (params) => (
                                        <Chip
                                            icon={<StarsIcon />}
                                            label={params.value || 0}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(255, 193, 7, 0.1)',
                                                color: '#FF8F00',
                                                fontWeight: 'bold',
                                                borderRadius: '16px',
                                                border: '1px solid rgba(255, 193, 7, 0.2)',
                                            }}
                                        />
                                    ),
                                },
                                {
                                    field: 'roleName',
                                    headerName: 'Role',
                                    flex: 0.8,
                                    minWidth: 120,
                                    renderCell: (params) => (
                                        <Chip
                                            icon={<WorkIcon />}
                                            label={params.value || 'Employee'}
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
                                    field: 'createdDate',
                                    headerName: 'Created Date',
                                    flex: 1,
                                    minWidth: 150,
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
                                                    color: 'action.active',
                                                    mr: 1,
                                                    fontSize: '1rem',
                                                    opacity: 0.7,
                                                    alignSelf: 'center', // Center the icon vertically
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontWeight: 'medium',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                                variant="body2"
                                            >
                                                {formatDate(params.value)}
                                            </Typography>
                                        </Box>
                                    ),
                                },
                                {
                                    field: 'status',
                                    headerName: 'Status',
                                    flex: 0.8,
                                    minWidth: 120,
                                    renderCell: (params) => {
                                        const isActive = params.value === 'ACTIVE';
                                        return (
                                            <Chip
                                                icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={formatStatus(params.value)}
                                                size="small"
                                                sx={{
                                                    bgcolor: isActive
                                                        ? 'rgba(46, 125, 50, 0.1)'
                                                        : 'rgba(211, 47, 47, 0.1)',
                                                    color: isActive ? '#2E7D32' : '#D32F2F',
                                                    fontWeight: 'medium',
                                                    borderRadius: '16px',
                                                    border: isActive
                                                        ? '1px solid rgba(46, 125, 50, 0.2)'
                                                        : '1px solid rgba(211, 47, 47, 0.2)',
                                                }}
                                            />
                                        );
                                    },
                                },
                                {
                                    field: 'action',
                                    headerName: 'Actions',
                                    flex: 1.2,
                                    minWidth: 270,
                                    renderCell: (params) => {
                                        const currentStatus = params.row.status;
                                        return (
                                            <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                                                {currentStatus === 'ACTIVE' ? (
                                                    <Button
                                                        variant="contained"
                                                        size="small"
                                                        startIcon={<BlockIcon />}
                                                        onClick={() => handleOpenStatusConfirm(params.row.id)}
                                                        sx={{
                                                            backgroundColor: 'orange',
                                                            textTransform: 'none',
                                                            '&:hover': {
                                                                backgroundColor: 'darkorange',
                                                            },
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                                        }}
                                                    >
                                                        Disable
                                                    </Button>
                                                ) : (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<CheckCircleOutlineIcon />}
                                                        onClick={() => handleOpenStatusConfirm(params.row.id)}
                                                        sx={{
                                                            textTransform: 'none',
                                                            borderRadius: '8px',
                                                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                                                        }}
                                                    >
                                                        Activate
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="outlined"
                                                    size="small"
                                                    startIcon={<LockResetIcon />}
                                                    onClick={() => handleOpenResetPassword(params.row.id)}
                                                    sx={{
                                                        textTransform: 'none',
                                                        borderRadius: '8px',
                                                        borderColor: '#1976d2',
                                                        color: '#1976d2',
                                                        '&:hover': {
                                                            borderColor: '#0d47a1',
                                                            backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                                        },
                                                    }}
                                                >
                                                    Reset Password
                                                </Button>
                                            </Box>
                                        );
                                    },
                                },
                            ]}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                            disableRowSelectionOnClick
                            autoHeight
                            getRowId={(row) => row.id}
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

                {/* Create Employee Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Full Name"
                                name="fullName"
                                value={newEmployee.fullName}
                                onChange={handleInputChange}
                                error={!!fullNameError}
                                helperText={fullNameError}
                                inputProps={{
                                    minLength: 2,
                                    maxLength: 50,
                                }}
                            />
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleInputChange}
                                type="email"
                            />

                            <TextField
                                required
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={newEmployee.password}
                                onChange={handleInputChange}
                                error={!!passwordError}
                                helperText={passwordError}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={newEmployee.confirmPassword}
                                onChange={handleInputChange}
                                error={!!passwordError}
                                helperText={passwordError}
                            />

                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={newEmployee.phone}
                                onChange={handleInputChange}
                                type="number"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Points"
                                name="points"
                                value={newEmployee.points}
                                onChange={handleInputChangeForPoint}
                                inputProps={{ min: 0, max: 30 }}
                                type="number"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseCreateDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateEmployee}
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            disabled={
                                !newEmployee.email ||
                                !newEmployee.password ||
                                !newEmployee.confirmPassword ||
                                !!passwordError ||
                                !!fullNameError ||
                                !newEmployee.phone
                            }
                        >
                            {isLoadingCreateEmployee ? <CircularProgress /> : ' Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Allocation Point Dialog */}
                <Dialog
                    open={openAllocationPointDialog}
                    onClose={handleCloseAllocationPointDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Allocate Point</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Limit Point"
                                name="limitPoint"
                                value={limitPoint}
                                onChange={handleChangeLimitPoint} // Pass the event directly
                                inputProps={{ min: 1, max: 30 }} // min should be 1 to match Math.max(1, value)
                                type="number"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseAllocationPointDialog}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAllocatePoint}
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            disabled={
                                !limitPoint ||
                                limitPoint <= 0 ||
                                limitPoint > userInfo?.company?.wallet?.balance ||
                                isLoadingAllocationPoint
                            }
                        >
                            {isLoadingAllocationPoint ? <CircularProgress /> : ' Allocate'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Status Change Dialog */}
                <Dialog
                    open={openStatusConfirmDialog}
                    onClose={() => setOpenStatusConfirmDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure to change status of this employee?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={() => setOpenStatusConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                handleChangeStatus(selectedEmployeeId);
                                setOpenStatusConfirmDialog(false);
                            }}
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reset Password Dialog */}
                <Dialog
                    open={openResetPasswordDialog}
                    onClose={() => setOpenResetPasswordDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Enter the new password for this employee.</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="New Password"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={() => setOpenResetPasswordDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                handleResetPassword();
                                setOpenResetPasswordDialog(false);
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Confirm Delete Dialog */}
                <Dialog
                    open={openDeleteConfirmDialog}
                    onClose={() => setOpenDeleteConfirmDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this employee? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={() => setOpenDeleteConfirmDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={() => {
                                handleDelete(selectedEmployeeId);
                                setOpenDeleteConfirmDialog(false);
                            }}
                            color="error"
                            variant="contained"
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
}
