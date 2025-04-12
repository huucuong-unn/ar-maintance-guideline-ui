import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    Typography,
    Autocomplete,
    TextField,
    Chip,
    InputAdornment,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PointRequestAPI from '~/API/PointRequestAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import storageService from '~/components/StorageService/storageService';
import { useWallet } from '~/WalletContext';

// Icons import
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingIcon from '@mui/icons-material/Pending';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessIcon from '@mui/icons-material/Business';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import CategoryIcon from '@mui/icons-material/Category';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

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

export default function PointRequestManagement() {
    const { currentPoints, fetchWallet } = useWallet();
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [isLoading, setIsLoading] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Helper functions for status styling
    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE':
                return 'green';
            case 'INACTIVE':
                return 'orange';
            case 'APPROVED':
                return 'green';
            case 'REJECT':
                return 'red';
            case 'PROCESSING':
                return '#ff9800';
            default:
                return 'black';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'APPROVED':
                return <CheckCircleIcon />;
            case 'REJECT':
                return <CancelIcon />;
            case 'PROCESSING':
                return <PendingIcon />;
            default:
                return <InfoIcon />;
        }
    };

    const getStatusChipStyles = (status) => {
        const color = getStatusColor(status);
        let bgColor = 'rgba(255, 152, 0, 0.1)';
        let borderColor = 'rgba(255, 152, 0, 0.2)';

        if (color === 'green') {
            bgColor = 'rgba(76, 175, 80, 0.1)';
            borderColor = 'rgba(76, 175, 80, 0.2)';
        } else if (color === 'red') {
            bgColor = 'rgba(211, 47, 47, 0.1)';
            borderColor = 'rgba(211, 47, 47, 0.2)';
        } else if (color === 'orange') {
            bgColor = 'rgba(255, 152, 0, 0.1)';
            borderColor = 'rgba(255, 152, 0, 0.2)';
        }

        return {
            bgcolor: bgColor,
            color: color,
            fontWeight: 'medium',
            borderRadius: '16px',
            border: `1px solid ${borderColor}`,
        };
    };

    // Detail dialog handlers
    const handleOpenDetailDialog = (request) => {
        setSelectedRequest(request);
        setOpenDetailDialog(true);
    };

    const handleCloseDetailDialog = () => {
        setOpenDetailDialog(false);
        setSelectedRequest(null);
    };

    // Table columns with enhanced styling - Simplified for overview
    const columns = [
        {
            field: 'requestNumber',
            headerName: 'Request Number',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <ReceiptIcon sx={{ color: 'action.active', mr: 1, fontSize: '1rem', opacity: 0.7 }} />
                    <Typography sx={{ fontWeight: 'medium' }} variant="body2">
                        {params.value}
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
                let chipProps = {
                    icon: <PendingIcon />,
                    label: formatStatus(params.value) || '-',
                    size: 'small',
                    sx: {
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                        color: '#ff9800',
                        fontWeight: 'medium',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                    },
                };

                if (params.value === 'ACTIVE') {
                    chipProps = {
                        ...chipProps,
                        icon: <PendingIcon />,
                        sx: {
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: 'green',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                        },
                    };
                } else if (params.value === 'INACTIVE') {
                    chipProps = {
                        ...chipProps,
                        icon: <CancelIcon />,
                        sx: {
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            color: 'orange',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                        },
                    };
                } else if (params.value === 'APPROVED') {
                    chipProps = {
                        ...chipProps,
                        icon: <CheckCircleIcon />,
                        sx: {
                            bgcolor: 'rgba(76, 175, 80, 0.1)',
                            color: 'green',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(76, 175, 80, 0.2)',
                        },
                    };
                } else if (params.value === 'REJECT') {
                    chipProps = {
                        ...chipProps,
                        icon: <CancelIcon />,
                        sx: {
                            bgcolor: 'rgba(211, 47, 47, 0.1)',
                            color: 'red',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                        },
                    };
                } else if (params.value === 'PROCESSING') {
                    chipProps = {
                        ...chipProps,
                        icon: <PendingIcon />,
                        sx: {
                            bgcolor: 'rgba(255, 152, 0, 0.1)',
                            color: '#ff9800',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(255, 152, 0, 0.2)',
                        },
                    };
                }

                return <Chip {...chipProps} />;
            },
        },
        {
            field: 'amount',
            headerName: 'Point Amount',
            flex: 0.8,
            minWidth: 130,
            renderCell: (params) => (
                <Chip
                    icon={<MonetizationOnIcon />}
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
            field: 'employee',
            headerName: 'Employee',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                    <EmailIcon sx={{ color: 'action.active', mr: 1, fontSize: '1rem', opacity: 0.7 }} />
                    <Typography sx={{ fontWeight: 'medium' }} variant="body2">
                        {params.row.employee?.email || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'action',
            headerName: 'Action',
            flex: 0.7,
            minWidth: 100,
            renderCell: (params) => (
                <Button
                    variant="outlined"
                    startIcon={<InfoIcon />}
                    sx={{
                        textTransform: 'none',
                        borderRadius: '8px',
                    }}
                    onClick={() => handleOpenDetailDialog(params.row)}
                >
                    View
                </Button>
            ),
        },
    ];

    const [rows, setRows] = useState([]);
    const [searchParams, setSearchParams] = useState({
        requestNumber: '',
        status: '',
        employeeEmail: '',
        createDate: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);
    const [pendingRequests, setPendingRequests] = useState(0);
    const [approvedRequests, setApprovedRequests] = useState(0);
    const [rejectedRequests, setRejectedRequests] = useState(0);

    // Fetch existing requests
    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                requestNumber: searchParams.requestNumber || undefined,
                status: searchParams.status || undefined,
                employeeEmail: searchParams.employeeEmail || undefined,
                createDate: searchParams.createDate || undefined,
            };
            setIsLoading(true);
            const response = await PointRequestAPI.getAllPointRequestsByCompanyId(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
            fetchWallet();

            // Count requests by status
            fetchRequestCounts();
        } catch (error) {
            console.error('Failed to fetch request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch counts for different request statuses
    const fetchRequestCounts = async () => {
        try {
            // This is a placeholder. You might need to implement the actual API endpoints
            // or use filtering on the existing data to get these counts

            // Count pending requests (PROCESSING)
            const processingParams = { status: 'PROCESSING' };
            const processingResponse = await PointRequestAPI.getAllPointRequestsByCompanyId(userInfo?.company?.id, {
                ...processingParams,
                page: 1,
                size: 1,
            });
            setPendingRequests(processingResponse?.result?.totalItems || 0);

            // Count approved requests
            const approvedParams = { status: 'APPROVED' };
            const approvedResponse = await PointRequestAPI.getAllPointRequestsByCompanyId(userInfo?.company?.id, {
                ...approvedParams,
                page: 1,
                size: 1,
            });
            setApprovedRequests(approvedResponse?.result?.totalItems || 0);

            // Count rejected requests
            const rejectedParams = { status: 'REJECT' };
            const rejectedResponse = await PointRequestAPI.getAllPointRequestsByCompanyId(userInfo?.company?.id, {
                ...rejectedParams,
                page: 1,
                size: 1,
            });
            setRejectedRequests(rejectedResponse?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch request counts:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setSearchParams((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleStatusChange = (event, newValue) => {
        setSearchParams((prev) => ({
            ...prev,
            status: newValue || '',
        }));
    };

    const handleSearch = () => {
        fetchData();
    };

    const resetFilters = () => {
        setSearchParams({
            requestNumber: '',
            status: '',
            employeeEmail: '',
            createDate: '',
        });
        setPaginationModel({
            page: 0,
            pageSize: 5,
        });
        // Delay the fetch to ensure state is updated
        setTimeout(fetchData, 0);
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    };

    const handleApprove = async () => {
        try {
            setIsLoading(true);
            const payload = {
                status: 'APPROVED',
            };
            const response = await PointRequestAPI.updateRequestStatus(requestId, payload);
            if (response?.result) {
                toast.success('Request approved successfully!');
            }
        } catch (error) {
            console.error('Failed to approve request:', error);
            toast.error('Failed to approve request. ' + error?.response?.data?.message);
        } finally {
            handleCloseApproveConfirm();
            setIsLoading(false);
            fetchData();
        }
    };

    const [openApproveConfirmDialog, setOpenApproveConfirmDialog] = useState(false);
    const handleOpenApproveConfirm = (requestId) => {
        setOpenApproveConfirmDialog(true);
        setRequestId(requestId);
    };
    const handleCloseApproveConfirm = () => {
        setOpenApproveConfirmDialog(false);
        setRequestId(null);
    };

    const [openCancelConfirmDialog, setOpenCancelConfirmDialog] = useState(false);
    const handleOpenCancelConfirm = (requestId) => {
        setOpenCancelConfirmDialog(true);
        setRequestId(requestId);
    };
    const handleCloseCancelConfirm = () => {
        setOpenCancelConfirmDialog(false);
        setRequestId(null);
    };
    const handleConfirmCancel = async () => {
        try {
            setIsLoading(true);
            const payload = { status: 'REJECT' };
            const response = await PointRequestAPI.updateRequestStatus(requestId, payload);
            if (response?.result) {
                toast.success('Request rejected successfully!');
            }
        } catch (error) {
            console.error('Failed to reject request:', error);
            toast.error('Failed to reject request. Please try again.');
        } finally {
            handleCloseCancelConfirm();
            setIsLoading(false);
            fetchData();
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
                                    }}
                                >
                                    Point Requests Management
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
                                            Total Requests
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <AssignmentIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                All Point Requests
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
                                            Pending Requests
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {pendingRequests || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PendingIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Awaiting Response
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
                                            Approved Requests
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {approvedRequests || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CheckCircleIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Successfully Processed
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
                                            Rejected Requests
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#C62828" sx={{ mt: 1 }}>
                                            {rejectedRequests || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CancelIcon
                                                sx={{ color: '#C62828', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Declined Points
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
                                    label="Request Number"
                                    variant="outlined"
                                    name="requestNumber"
                                    value={searchParams.requestNumber}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ReceiptIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by request number"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <TextField
                                    fullWidth
                                    label="Employee Email"
                                    variant="outlined"
                                    name="employeeEmail"
                                    value={searchParams.employeeEmail}
                                    onChange={handleInputChange}
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
                                    options={['REJECT', 'PROCESSING', 'APPROVED']}
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
                                                        <CategoryIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <TextField
                                    fullWidth
                                    label="Create Date"
                                    variant="outlined"
                                    name="createDate"
                                    type="date"
                                    value={searchParams.createDate}
                                    onChange={handleInputChange}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <CalendarTodayIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    InputLabelProps={{
                                        shrink: true,
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Box sx={{ display: 'flex', gap: 1, height: '100%' }}>
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
                                        Filter
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

                {/* Approve Confirmation Dialog */}
                <Dialog open={openApproveConfirmDialog} onClose={handleCloseApproveConfirm} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CheckCircleIcon sx={{ color: 'green', mr: 1 }} />
                            Confirm Approval
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to approve this point request? This action will use your points and
                            cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 2,
                            }}
                            onClick={handleCloseApproveConfirm}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 3,
                            }}
                            onClick={handleApprove}
                            variant="contained"
                            color="success"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CheckCircleIcon />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Yes, Approve'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reject Confirmation Dialog */}
                <Dialog open={openCancelConfirmDialog} onClose={handleCloseCancelConfirm} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <CancelIcon sx={{ color: 'error.main', mr: 1 }} />
                            Confirm Rejection
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to reject this point request? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 2,
                            }}
                            onClick={handleCloseCancelConfirm}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 3,
                            }}
                            onClick={handleConfirmCancel}
                            variant="contained"
                            color="error"
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
                            disabled={isLoading}
                        >
                            {isLoading ? 'Processing...' : 'Yes, Reject'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Detail Dialog */}
                <Dialog open={openDetailDialog} onClose={handleCloseDetailDialog} fullWidth maxWidth="md">
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ReceiptIcon sx={{ color: '#1976d2', mr: 1 }} />
                                Point Request Details
                            </Box>
                            <Chip
                                icon={getStatusIcon(selectedRequest?.status)}
                                label={selectedRequest?.status ? formatStatus(selectedRequest.status) : '-'}
                                size="small"
                                sx={getStatusChipStyles(selectedRequest?.status)}
                            />
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        {selectedRequest && (
                            <Grid container spacing={3} sx={{ mt: 0.5 }}>
                                {/* Request Information */}
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color="#1976d2"
                                            sx={{ mb: 2 }}
                                        >
                                            Request Information
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '40%' }}
                                                    >
                                                        Request Number:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {selectedRequest.requestNumber}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '40%' }}
                                                    >
                                                        Point Amount:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {selectedRequest.amount}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '40%' }}
                                                    >
                                                        Created Date:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {formatDateTime(selectedRequest.createdAt)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '40%' }}
                                                    >
                                                        Employee:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {selectedRequest.employee?.email || '-'}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', mb: 1.5 }}>
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ width: '40%' }}
                                                    >
                                                        Status:
                                                    </Typography>
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight="medium"
                                                        sx={{ color: getStatusColor(selectedRequest.status) }}
                                                    >
                                                        {formatStatus(selectedRequest.status)}
                                                    </Typography>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Reason */}
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                        <Typography
                                            variant="subtitle1"
                                            fontWeight="bold"
                                            color="#1976d2"
                                            sx={{ mb: 2 }}
                                        >
                                            Request Reason
                                        </Typography>
                                        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                            {selectedRequest.reason || 'No reason provided'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                px: 2,
                            }}
                            onClick={handleCloseDetailDialog}
                        >
                            Close
                        </Button>

                        {selectedRequest && selectedRequest.status === 'PROCESSING' && (
                            <>
                                <Button
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        px: 3,
                                    }}
                                    onClick={() => {
                                        handleCloseDetailDialog();
                                        handleOpenApproveConfirm(selectedRequest.id);
                                    }}
                                    variant="contained"
                                    color="success"
                                    startIcon={<CheckCircleIcon />}
                                >
                                    Approve
                                </Button>
                                <Button
                                    sx={{
                                        textTransform: 'none',
                                        borderRadius: '8px',
                                        px: 3,
                                    }}
                                    onClick={() => {
                                        handleCloseDetailDialog();
                                        handleOpenCancelConfirm(selectedRequest.id);
                                    }}
                                    variant="contained"
                                    color="error"
                                    startIcon={<CancelIcon />}
                                >
                                    Reject
                                </Button>
                            </>
                        )}
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
