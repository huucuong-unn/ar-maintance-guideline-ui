import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    Typography,
    Autocomplete,
    Avatar,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { host } from '~/Constant';

// Icons
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SubjectIcon from '@mui/icons-material/Subject';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import VisibilityIcon from '@mui/icons-material/Visibility';
import BuildIcon from '@mui/icons-material/Build';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import AttachFileIcon from '@mui/icons-material/AttachFile';

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

export default function CompanyRequestDesigner() {
    const navigate = useNavigate();
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const stompClientRef = useRef(null);

    // State variables
    const [isLoading, setIsLoading] = useState(false);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [openCancelConfirmDialog, setOpenCancelConfirmDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [total, setTotal] = useState(0);
    const [file3D, setFile3D] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [machineTypeId, setMachineTypeId] = useState(null);
    const [companyId, setCompanyId] = useState(null);

    // Search filters
    const [searchCompanyName, setSearchCompanyName] = useState('');
    const [searchStatus, setSearchStatus] = useState('');
    const statusOptions = ['APPROVED', 'PENDING', 'PROCESSING', 'CANCELLED', 'DRAFTED'];

    // Dashboard statistics
    const [pendingRequestCount, setPendingRequestCount] = useState(0);
    const [approvedRequestCount, setApprovedRequestCount] = useState(0);
    const [processingRequestCount, setProcessingRequestCount] = useState(0);
    const [cancelledRequestCount, setCancelledRequestCount] = useState(0);

    // Format status for display
    const formatStatus = (status) => {
        if (!status) return '';
        return status
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    };

    // Format date time for display
    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${minutes}`;
    };

    // Table columns definition with enhanced styling
    const columns = [
        {
            field: 'requestNumber',
            headerName: 'Request #',
            width: 130,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <AssignmentIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                const status = params.value;
                let chipProps = {
                    icon: <PendingActionsIcon />,
                    label: formatStatus(status),
                    size: 'small',
                    sx: {
                        bgcolor: 'rgba(255, 152, 0, 0.1)',
                        color: '#FF9800',
                        fontWeight: 'medium',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 152, 0, 0.2)',
                    },
                };

                if (status === 'APPROVED') {
                    chipProps = {
                        ...chipProps,
                        icon: <DoneIcon />,
                        sx: {
                            bgcolor: 'rgba(46, 125, 50, 0.1)',
                            color: '#2E7D32',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(46, 125, 50, 0.2)',
                        },
                    };
                } else if (status === 'CANCELLED' || status === 'DESIGNER_CANCELLED') {
                    chipProps = {
                        ...chipProps,
                        icon: <CancelIcon />,
                        sx: {
                            bgcolor: 'rgba(211, 47, 47, 0.1)',
                            color: '#D32F2F',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(211, 47, 47, 0.2)',
                        },
                    };
                } else if (status === 'PROCESSING') {
                    chipProps = {
                        ...chipProps,
                        icon: <PendingActionsIcon />,
                        sx: {
                            bgcolor: 'rgba(25, 118, 210, 0.1)',
                            color: '#1976d2',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(25, 118, 210, 0.2)',
                        },
                    };
                } else if (status === 'DRAFTED') {
                    chipProps = {
                        ...chipProps,
                        icon: <BuildIcon />,
                        sx: {
                            bgcolor: 'rgba(156, 39, 176, 0.1)',
                            color: '#9c27b0',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: '1px solid rgba(156, 39, 176, 0.2)',
                        },
                    };
                }

                return <Chip {...chipProps} />;
            },
        },
        {
            field: 'requestSubject',
            headerName: 'Subject',
            width: 250,
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <SubjectIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" noWrap>
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <BusinessIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" noWrap>
                        {params.row.company?.companyName || '-'}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'machineType',
            headerName: 'Machine Type',
            width: 180,
            renderCell: (params) => (
                <Chip
                    icon={<CategoryIcon />}
                    label={params.row.machineType?.machineTypeName || '-'}
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
            field: 'createdAt',
            headerName: 'Created Date',
            width: 170,
            renderCell: (params) => formatDateTime(params.value) || '-',
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 280,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                const currentUserEmail = userInfo?.email;
                const designerEmail = params.row.designer?.email;
                const isDesigner = currentUserEmail === designerEmail;
                const hasDesigner = designerEmail !== undefined && designerEmail !== null;

                // If request is assigned to another designer
                if (hasDesigner && !isDesigner) {
                    return (
                        <Typography variant="body2" color="text.secondary">
                            Already assigned to another designer
                        </Typography>
                    );
                }

                // If status is PENDING (not joined yet)
                if (currentStatus === 'PENDING') {
                    return (
                        <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<PublishedWithChangesIcon />}
                                onClick={() => handleOpenApproveDialog(params.row.requestId)}
                                sx={{
                                    bgcolor: '#4caf50',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Join
                            </Button>

                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<VisibilityIcon />}
                                onClick={() => handleViewRequestDetails(params.row)}
                                sx={{
                                    borderColor: '#9c27b0',
                                    color: '#9c27b0',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                View
                            </Button>
                        </Box>
                    );
                }

                // If already joined or assigned (PROCESSING, DRAFTED, APPROVED, etc.)
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        {isDesigner && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ChatIcon />}
                                onClick={() => navigate(`/company-request-section/${params.row.requestId}`)}
                                sx={{
                                    borderColor: '#1976d2',
                                    color: '#1976d2',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Chat
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => handleViewRequestDetails(params.row)}
                            sx={{
                                borderColor: '#9c27b0',
                                color: '#9c27b0',
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            View
                        </Button>

                        {/* {(currentStatus === 'PROCESSING' || currentStatus === 'DRAFTED') && isDesigner && (
                            <Button
                                variant="contained"
                                size="small"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => handleOpenCancelConfirm(params.row.requestId)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Cancel
                            </Button>
                        )} */}
                    </Box>
                );
            },
        },
    ];

    // State for request details dialog
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Function to handle viewing request details
    const handleViewRequestDetails = (request) => {
        setSelectedRequest(request);
        setOpenViewDialog(true);
    };

    // Function to close request details dialog
    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setSelectedRequest(null);
    };

    // Fetch request data and statistics
    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                status: searchStatus || undefined,
                companyName: searchCompanyName || undefined,
                designerEmail: userInfo?.email,
            };
            setIsLoading(true);
            const response = await CompanyRequestAPI.getAllCompanyRequests(params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);

            // Fetch statistics
            fetchRequestStatistics();
        } catch (error) {
            console.error('Failed to fetch requests:', error);
            toast.error('Failed to load requests data', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch request statistics
    const fetchRequestStatistics = async () => {
        try {
            // For simplicity, count statistics from the current data
            // In a real app, you might want a dedicated API endpoint for this
            const allRequests = rows;

            const pendingCount = allRequests.filter((req) => req.status === 'PENDING').length;
            const approvedCount = allRequests.filter((req) => req.status === 'APPROVED').length;
            const processingCount = allRequests.filter((req) => req.status === 'PROCESSING').length;
            const cancelledCount = allRequests.filter(
                (req) => req.status === 'CANCELLED' || req.status === 'DESIGNER_CANCELLED',
            ).length;

            setPendingRequestCount(pendingCount);
            setApprovedRequestCount(approvedCount);
            setProcessingRequestCount(processingCount);
            setCancelledRequestCount(cancelledCount);
        } catch (error) {
            console.error('Failed to calculate request statistics:', error);
        }
    };

    // Handle search/filtering
    const handleSearch = () => {
        // Reset to first page when searching
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
        fetchData();
    };

    // Reset filters
    const resetFilters = () => {
        setSearchCompanyName('');
        setSearchStatus('');
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
        fetchData();
    };

    // Handle approval dialog
    const handleOpenApproveDialog = (reqId) => {
        setSelectedRequestId(reqId);
        setOpenApproveDialog(true);
    };

    const handleCloseApproveDialog = () => {
        setOpenApproveDialog(false);
        setSelectedRequestId(null);
    };

    const handleConfirmApprove = async () => {
        try {
            setIsLoading(true);
            const payload = { status: 'PROCESSING', designerId: userInfo.id };
            const response = await CompanyRequestAPI.updateRequestStatus(selectedRequestId, payload);

            if (response?.result) {
                toast.success('Request joined successfully!', { position: 'top-right' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update request status:', error);
            toast.error(error.response?.data?.message || 'Failed to update request status. Please try again.', {
                position: 'top-right',
            });
        } finally {
            handleCloseApproveDialog();
            setIsLoading(false);
        }
    };

    // Handle cancel dialog
    const handleOpenCancelConfirm = (reqId) => {
        setOpenCancelConfirmDialog(true);
        setSelectedRequestId(reqId);
    };

    const handleCloseCancelConfirm = () => {
        setOpenCancelConfirmDialog(false);
        setSelectedRequestId(null);
    };

    const handleConfirmCancel = async () => {
        try {
            setIsLoading(true);
            const payload = { status: 'DESIGNER_CANCELLED' };
            const response = await CompanyRequestAPI.updateRequestStatus(selectedRequestId, payload);

            if (response?.result) {
                toast.success('Request cancelled successfully!', { position: 'top-right' });
                fetchData();
            }
        } catch (error) {
            console.error('Failed to cancel request:', error);
            toast.error('Failed to cancel request. Please try again.', { position: 'top-right' });
        } finally {
            handleCloseCancelConfirm();
            setIsLoading(false);
        }
    };

    // Handle 3D model editor
    const handle3DFileSelect = (e, requestId, idMachineType, idCompany) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
            setRequestId(requestId);
            setMachineTypeId(idMachineType);
            setCompanyId(idCompany);
            setOpenCreateDialog(true);
            setOpenEditor(true);
        }
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditor(false);
    };

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setOpenCreateDialog(false);
        setFile3D(null);
        setRequestId(null);
        setMachineTypeId(null);
        setCompanyId(null);
        fetchData();
    };

    // WebSocket connection
    useEffect(() => {
        const socket = new Client({
            webSocketFactory: () => new SockJS(`${host}/ws`),
            onConnect: () => {
                console.log('WebSocket Connected');

                const subscription = socket.subscribe(`/topic/request/100`, (message) => {
                    fetchData();
                });

                stompClientRef.current = socket;

                return () => {
                    subscription.unsubscribe();
                };
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        socket.activate();

        return () => {
            if (socket) {
                socket.deactivate();
            }
        };
    }, [userInfo]);

    // Initial data load
    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    // Check for user authorization
    useEffect(() => {
        if (!userInfo) {
            toast.error('User not authorized. Please log in.', { position: 'top-right' });
            navigate('/login');
        }
    }, [userInfo, navigate]);

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
                                        alignItems: 'center',
                                    }}
                                >
                                    <DashboardIcon
                                        sx={{
                                            fontSize: 'inherit',
                                            marginRight: 1,
                                        }}
                                    />
                                    Designer Requests
                                </Typography>
                            </Box>

                            {/* Stats Cards */}
                            {/* <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
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
                                            Total Assigned Requests
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <AssignmentIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Design Projects
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
                                            Pending
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {pendingRequestCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PendingActionsIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Awaiting Designer
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
                                            Approved
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {approvedRequestCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <DoneIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Successfully Completed
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
                                            Cancelled
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#C62828" sx={{ mt: 1 }}>
                                            {cancelledRequestCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CancelIcon
                                                sx={{ color: '#C62828', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Terminated Projects
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid> */}
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
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    variant="outlined"
                                    value={searchCompanyName}
                                    onChange={(e) => setSearchCompanyName(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BusinessIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by company name"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    options={statusOptions}
                                    value={searchStatus}
                                    onChange={(event, newValue) => {
                                        setSearchStatus(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Status"
                                            variant="outlined"
                                            InputProps={{
                                                ...params.InputProps,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <FilterListIcon color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
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
                            getRowId={(row) => row.requestId}
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
                <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PublishedWithChangesIcon color="success" />
                        Confirm Assignment
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to join this request? You will be assigned as the designer responsible
                            for this project.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseApproveDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="success"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleConfirmApprove}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DoneIcon />}
                        >
                            {isLoading ? 'Processing...' : 'Yes, Join Project'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Cancel Dialog */}
                <Dialog open={openCancelConfirmDialog} onClose={handleCloseCancelConfirm} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon color="error" />
                        Confirm Cancellation
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this request? This action cannot be undone and will
                            terminate the current design process.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseCancelConfirm}
                        >
                            No, Keep Project
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleConfirmCancel}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <CancelIcon />}
                        >
                            {isLoading ? 'Cancelling...' : 'Yes, Cancel Project'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Create Model Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="xl">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="primary" />
                        Create New Model
                    </DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh', p: 3 }}>
                        {file3D && (
                            <Box>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        mb: 3,
                                        borderRadius: '8px',
                                        bgcolor: '#f5f7fa',
                                        border: '1px solid #e0e0e0',
                                    }}
                                >
                                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                        Selected File:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {file3D.name} ({(file3D.size / 1024).toFixed(2)} KB)
                                    </Typography>
                                </Paper>

                                {openEditor && (
                                    <Box sx={{ height: 'calc(80vh - 120px)', borderRadius: '8px', overflow: 'hidden' }}>
                                        <ModelEditor
                                            action={'CreateModel'}
                                            modelFile3D={URL.createObjectURL(file3D)}
                                            modelFile3DToCreate={file3D}
                                            handleCloseModal={handleCloseEditor}
                                            requestId={requestId}
                                            machineTypeId={machineTypeId}
                                            companyId={companyId}
                                            isDisable={true}
                                        />
                                    </Box>
                                )}
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            variant="outlined"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseCreateDialog}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>

            {/* Request Details Dialog */}
            <Dialog open={openViewDialog} onClose={handleCloseViewDialog} fullWidth maxWidth="md">
                <DialogTitle
                    sx={{
                        fontWeight: 'bold',
                        borderBottom: '1px solid #eee',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 1,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" />
                        <Typography variant="h6">Request Details</Typography>
                    </Box>
                    {selectedRequest && (
                        <Chip
                            icon={
                                selectedRequest.status === 'APPROVED' ? (
                                    <DoneIcon />
                                ) : selectedRequest.status === 'CANCELLED' ||
                                  selectedRequest.status === 'DESIGNER_CANCELLED' ? (
                                    <CancelIcon />
                                ) : selectedRequest.status === 'PROCESSING' ? (
                                    <PendingActionsIcon />
                                ) : (
                                    <PendingActionsIcon />
                                )
                            }
                            label={selectedRequest.status ? formatStatus(selectedRequest.status) : ''}
                            size="small"
                            sx={{
                                bgcolor:
                                    selectedRequest.status === 'APPROVED'
                                        ? 'rgba(46, 125, 50, 0.1)'
                                        : selectedRequest.status === 'CANCELLED' ||
                                          selectedRequest.status === 'DESIGNER_CANCELLED'
                                        ? 'rgba(211, 47, 47, 0.1)'
                                        : selectedRequest.status === 'PROCESSING'
                                        ? 'rgba(25, 118, 210, 0.1)'
                                        : 'rgba(255, 152, 0, 0.1)',
                                color:
                                    selectedRequest.status === 'APPROVED'
                                        ? '#2E7D32'
                                        : selectedRequest.status === 'CANCELLED' ||
                                          selectedRequest.status === 'DESIGNER_CANCELLED'
                                        ? '#D32F2F'
                                        : selectedRequest.status === 'PROCESSING'
                                        ? '#1976d2'
                                        : '#FF9800',
                                fontWeight: 'medium',
                                borderRadius: '16px',
                                border:
                                    selectedRequest.status === 'APPROVED'
                                        ? '1px solid rgba(46, 125, 50, 0.2)'
                                        : selectedRequest.status === 'CANCELLED' ||
                                          selectedRequest.status === 'DESIGNER_CANCELLED'
                                        ? '1px solid rgba(211, 47, 47, 0.2)'
                                        : selectedRequest.status === 'PROCESSING'
                                        ? '1px solid rgba(25, 118, 210, 0.2)'
                                        : '1px solid rgba(255, 152, 0, 0.2)',
                            }}
                        />
                    )}
                </DialogTitle>
                <DialogContent>
                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        selectedRequest && (
                            <Grid container spacing={3} sx={{ mt: 0 }}>
                                {/* Basic Info */}
                                <Grid item xs={12} md={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px', height: '100%' }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                            Request Information
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Request Number
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {selectedRequest.requestNumber}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Subject
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedRequest.requestSubject}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Status
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {selectedRequest.status === 'APPROVED' ? (
                                                                <DoneIcon fontSize="small" color="success" />
                                                            ) : selectedRequest.status === 'CANCELLED' ||
                                                              selectedRequest.status === 'DESIGNER_CANCELLED' ? (
                                                                <CancelIcon fontSize="small" color="error" />
                                                            ) : (
                                                                <PendingActionsIcon fontSize="small" color="warning" />
                                                            )}
                                                            <Typography variant="body1">
                                                                {formatStatus(selectedRequest.status)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Created Date
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {formatDateTime(selectedRequest.createdAt)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Machine Type
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedRequest.machineType?.machineTypeName || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Company
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                        >
                                                            <BusinessIcon fontSize="small" color="action" />
                                                            {selectedRequest.company?.companyName || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Designer
                                                        </Typography>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                        >
                                                            <PersonIcon fontSize="small" color="action" />
                                                            {selectedRequest.designer?.email || 'Not assigned yet'}
                                                        </Typography>
                                                    </Box>

                                                    {selectedRequest.cancelReason && (
                                                        <Box>
                                                            <Typography variant="caption" color="text.secondary">
                                                                Cancel Reason
                                                            </Typography>
                                                            <Typography variant="body1" color="error">
                                                                {selectedRequest.cancelReason}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Description */}
                                <Grid item xs={12} md={6}>
                                    <Paper
                                        elevation={0}
                                        sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px', height: '100%' }}
                                    >
                                        <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {selectedRequest.requestDescription || 'No description provided'}
                                        </Typography>
                                    </Paper>
                                </Grid>

                                {/* Files Section */}
                                {/* <Grid item xs={12}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                            Revision Files
                                        </Typography>

                                        {selectedRequest?.requestRevision &&
                                        selectedRequest.requestRevision.revisionFiles &&
                                        selectedRequest.requestRevision.revisionFiles.length > 0 ? (
                                            <List>
                                                {(selectedRequest.requestRevision?.revisionFiles || []).map(
                                                    (file, index) => (
                                                        <ListItem
                                                            key={index}
                                                            sx={{
                                                                py: 1,
                                                                bgcolor: 'white',
                                                                borderRadius: '8px',
                                                                mb: 1,
                                                                border: '1px solid #e0e0e0',
                                                            }}
                                                        >
                                                            <ListItemIcon>
                                                                <AttachFileIcon color="primary" />
                                                            </ListItemIcon>
                                                            <ListItemText
                                                                primary={file.fileName || `File ${index + 1}`}
                                                                secondary={`Added on ${formatDateTime(
                                                                    file.createdAt || selectedRequest.createdAt,
                                                                )}`}
                                                            />
                                                        </ListItem>
                                                    ),
                                                )}
                                            </List>
                                        ) : (
                                            <Typography variant="body2" color="text.secondary">
                                                No revision files available
                                            </Typography>
                                        )}
                                    </Paper>
                                </Grid> */}
                            </Grid>
                        )
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    {selectedRequest && selectedRequest.status === 'PENDING' && (
                        <Button
                            variant="contained"
                            color="success"
                            startIcon={<PublishedWithChangesIcon />}
                            onClick={() => {
                                handleCloseViewDialog();
                                handleOpenApproveDialog(selectedRequest.requestId);
                            }}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                                mr: 'auto',
                            }}
                        >
                            Join Project
                        </Button>
                    )}

                    {selectedRequest &&
                        selectedRequest.status !== 'PENDING' &&
                        selectedRequest.designer?.email === userInfo?.email && (
                            <Button
                                variant="outlined"
                                startIcon={<ChatIcon />}
                                onClick={() => {
                                    handleCloseViewDialog();
                                    navigate(`/company-request-section/${selectedRequest.requestId}`);
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    mr: 'auto',
                                    borderColor: '#1976d2',
                                    color: '#1976d2',
                                }}
                            >
                                Go to Chat
                            </Button>
                        )}

                    {selectedRequest &&
                        (selectedRequest.status === 'PROCESSING' || selectedRequest.status === 'DRAFTED') &&
                        selectedRequest.designer?.email === userInfo?.email && (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<CancelIcon />}
                                onClick={() => {
                                    handleCloseViewDialog();
                                    handleOpenCancelConfirm(selectedRequest.requestId);
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Cancel Project
                            </Button>
                        )}

                    <Button
                        variant="contained"
                        onClick={handleCloseViewDialog}
                        sx={{
                            borderRadius: '8px',
                            textTransform: 'none',
                            bgcolor: '#051D40',
                        }}
                    >
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
