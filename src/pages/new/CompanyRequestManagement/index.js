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
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import CardMachine from '~/components/CardMachine';
import storageService from '~/components/StorageService/storageService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { host, getImage } from '~/Constant';

// Icons
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import ChatIcon from '@mui/icons-material/Chat';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneIcon from '@mui/icons-material/Done';
import CancelIcon from '@mui/icons-material/Cancel';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import SubjectIcon from '@mui/icons-material/Subject';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DashboardIcon from '@mui/icons-material/Dashboard';
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

export default function CompanyRequestManagement() {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const navigate = useNavigate();
    const stompClientRef = useRef(null);
    const fileInputRef = useRef(null);

    // State variables
    const [isLoading, setIsLoading] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openMachineDialog, setOpenMachineDialog] = useState(false);
    const [openCancelConfirmDialog, setOpenCancelConfirmDialog] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);

    const [machines, setMachines] = useState([]);
    const [selectedMachine, setSelectedMachine] = useState(null);
    const [requestSubject, setRequestSubject] = useState('');
    const [requestDescription, setRequestDescription] = useState('');
    const [revisionFiles, setRevisionFiles] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [requestFiles, setRequestFiles] = useState([]);
    const [openModelId, setOpenModelId] = useState(null);
    const [requestId, setRequestId] = useState(null);
    const [disableApprove, setDisableApprove] = useState(true);

    const [rows, setRows] = useState([]);
    const [statusToSort, setStatusToSort] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [total, setTotal] = useState(0);

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

    // Open Request Details Dialog and fetch additional data if needed
    const handleOpenViewDialog = async (request) => {
        setSelectedRequest(request);
        setOpenViewDialog(true);

        // If we need to fetch additional details about the request
        try {
            // Optionally fetch more details if needed
            const detailsResponse = await CompanyRequestAPI.getById(request.requestId);
            if (detailsResponse?.result) {
                setSelectedRequest(detailsResponse.result);

                // If we need to fetch files separately
                if (detailsResponse.result.requestRevision?.revisionId) {
                    const filesResponse = await CompanyRequestAPI.getRevisionFiles(
                        detailsResponse.result.requestRevision.revisionId,
                    );
                    if (filesResponse?.result) {
                        setRequestFiles(filesResponse.result);
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch request details:', error);
        }
    };

    // Close Request Details Dialog
    const handleCloseViewDialog = () => {
        setOpenViewDialog(false);
        setSelectedRequest(null);
        setRequestFiles([]);
    };

    // Handle file download
    const handleDownloadFile = (file) => {
        if (!file.fileUrl) {
            toast.error('File URL not available', { position: 'top-right' });
            return;
        }

        // Create a download link
        const fileUrl = getImage(file.fileUrl);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = file.fileName || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Define streamlined DataGrid columns
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
                } else if (status === 'CANCELLED' || status === 'COMPANY_CANCELLED') {
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
                }

                return <Chip {...chipProps} />;
            },
        },
        {
            field: 'requestSubject',
            headerName: 'Subject',
            width: 300,
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
            field: 'cancelReason',
            headerName: 'Cancel Reason',
            width: 200,
            renderCell: (params) => params.row?.cancelReason || '-',
        },
        {
            field: 'cancelledBy',
            headerName: 'Cancelled By',
            width: 200,
            renderCell: (params) => params.row?.cancelledBy?.email || '-',
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

                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleOpenViewDialog(params.row);
                            }}
                            sx={{
                                borderColor: '#1976d2',
                                color: '#1976d2',
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            View
                        </Button>

                        {currentStatus !== 'PENDING' && (
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<ChatIcon />}
                                onClick={() => navigate(`/company-request-section/${params.row.requestId}`)}
                                sx={{
                                    borderColor: '#4caf50',
                                    color: '#4caf50',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Chat
                            </Button>
                        )}
                        {/* 
                        {(currentStatus === 'PENDING' || currentStatus === 'PROCESSING') && (
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

    // Handle file upload

    const handleFileChange = (event) => {
        const allowedExtensions = ['mp4', 'webm', 'ogg', 'jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'];

        const files = Array.from(event.target.files);

        const validFiles = [];
        const invalidFiles = [];

        files.forEach((file) => {
            const ext = file.name.split('.').pop().toLowerCase();
            if (allowedExtensions.includes(ext)) {
                validFiles.push(file);
            } else {
                invalidFiles.push(file.name);
            }
        });

        if (invalidFiles.length > 0) {
            toast.warn(`Some files were not allowed: ${invalidFiles.join(', ')}`, {
                position: 'top-right',
                autoClose: 3000,
            });
        }

        setRevisionFiles([...revisionFiles, ...validFiles]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setRevisionFiles(revisionFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleClickUpload = () => {
        fileInputRef.current.click();
    };

    // Handle tracking of revision files for detailed view
    const getRevisionFilesDetails = async (revisionId) => {
        if (!revisionId) return [];

        try {
            const response = await CompanyRequestAPI.getRevisionFiles(revisionId);
            return response?.result || [];
        } catch (error) {
            console.error('Failed to fetch revision files:', error);
            return [];
        }
    };

    // Fetch request data and statistics
    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                subject: searchSubject || undefined,
            };
            setIsLoading(true);
            const response = await CompanyRequestAPI.getAllCompanyRequestsByCompanyId(
                userInfo?.company?.id,
                statusToSort || '',
                params,
            );
            const data = response?.result?.objectList || [];

            // Optionally enhance each request with additional data if needed
            /*
            const enhancedData = await Promise.all(
                data.map(async (request) => {
                    if (request.requestRevision?.revisionId) {
                        const files = await getRevisionFilesDetails(request.requestRevision.revisionId);
                        return { ...request, detailedFiles: files };
                    }
                    return request;
                })
            );
            setRows(enhancedData);
            */

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
            // Get all requests to calculate stats
            const params = { page: 1, size: 1000 }; // Large size to get all
            const response = await CompanyRequestAPI.getAllCompanyRequestsByCompanyId(
                userInfo?.company?.id,
                '',
                params,
            );

            const allRequests = response?.result?.objectList || [];

            // Count requests by status
            const pendingCount = allRequests.filter((req) => req.status === 'PENDING').length;
            const approvedCount = allRequests.filter((req) => req.status === 'APPROVED').length;
            const processingCount = allRequests.filter((req) => req.status === 'PROCESSING').length;
            const cancelledCount = allRequests.filter(
                (req) => req.status === 'CANCELLED' || req.status === 'COMPANY_CANCELLED',
            ).length;

            setPendingRequestCount(pendingCount);
            setApprovedRequestCount(approvedCount);
            setProcessingRequestCount(processingCount);
            setCancelledRequestCount(cancelledCount);
        } catch (error) {
            console.error('Failed to fetch request statistics:', error);
        }
    };

    const handleSearchCompanyRequest = () => {
        // Reset to first page when searching
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
        fetchData();
    };

    const resetFilters = () => {
        setStatusToSort('');
        setSearchSubject('');
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
        fetchData();
    };

    // Open create request dialog
    const handleOpenCreateDialog = async () => {
        try {
            setIsLoading(true);
            setOpenCreateDialog(true);

            // Fetch machine list
            const params = {
                page: 1,
                size: 1000000,
                companyId: userInfo?.company?.id,
            };
            const response = await CompanyRequestAPI.getModelTypeByCompanyId(params);
            setMachines(response?.result?.objectList || []);
        } catch (error) {
            console.error('Failed to fetch machines:', error);
            toast.error('Failed to load machine types', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle machine selection
    const handleSelectMachine = (machine) => {
        setSelectedMachine(machine);
        setOpenCreateDialog(false);
        setRequestSubject('');
        setRequestDescription('');
        setRevisionFiles([]);
        setOpenMachineDialog(true);
    };

    // Close dialogs
    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleCloseMachineDialog = () => {
        setOpenMachineDialog(false);
        setSelectedMachine(null);
        setRevisionFiles([]);
    };

    const handleCloseEditor = () => {
        setOpenEditor(false);
    };

    // Create request
    const handleCreateRequest = async () => {
        if (!selectedMachine) return;
        if (!requestSubject || !requestDescription) {
            toast.error('Please enter both request subject and description.', { position: 'top-right' });
            return;
        }
        if (revisionFiles.length === 0) {
            toast.error('Please upload at least one revision file.', { position: 'top-right' });
            return;
        }

        try {
            setIsLoading(true);

            // Create FormData for file uploads
            const formData = new FormData();

            formData.append('companyId', userInfo?.company?.id);
            formData.append('machineTypeId', selectedMachine?.machineTypeId);
            formData.append('requestSubject', requestSubject);
            formData.append('requestDescription', requestDescription);
            formData.append('requesterId', userInfo?.id);

            revisionFiles.forEach((file) => {
                formData.append('requestRevision.revisionFiles', file);
            });

            const response = await CompanyRequestAPI.createRequest(formData);

            if (response?.result) {
                toast.success('Request created successfully!', { position: 'top-right' });
                fetchData();
                setRevisionFiles([]);
            }
        } catch (error) {
            console.error('Failed to create request:', error);
            toast.error('Failed to create request. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoading(false);
            handleCloseMachineDialog();
        }
    };

    // Cancel request
    const handleOpenCancelConfirm = (reqId) => {
        setOpenCancelConfirmDialog(true);
        setRequestId(reqId);
    };

    const handleCloseCancelConfirm = () => {
        setOpenCancelConfirmDialog(false);
        setRequestId(null);
    };

    const handleConfirmCancel = async () => {
        try {
            setIsLoading(true);
            const payload = { status: 'COMPANY_CANCELLED' };
            const response = await CompanyRequestAPI.updateRequestStatus(requestId, payload);

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

    // WebSocket connection
    useEffect(() => {
        const socket = new Client({
            webSocketFactory: () => new SockJS(`http://localhost:8086/ws`),
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
    }, [paginationModel, statusToSort]);

    // Effect to check when user authorization changes
    useEffect(() => {
        if (!userInfo || !userInfo.company) {
            // Redirect to login or show message if user is not authorized
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
                                    Company Requests Management
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleOpenCreateDialog}
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
                                    >
                                        Create New Request
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
                                                Support Tickets
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
                                                Terminated Requests
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
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Request Subject"
                                    variant="outlined"
                                    value={searchSubject}
                                    onChange={(e) => setSearchSubject(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SubjectIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by request subject"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    options={['PENDING', 'APPROVED', 'CANCELLED', 'PROCESSING', 'COMPANY_CANCELLED']}
                                    value={statusToSort}
                                    onChange={(event, newValue) => {
                                        setStatusToSort(newValue);
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
                                        onClick={handleSearchCompanyRequest}
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

                {/* ---------- FIRST DIALOG: SELECT MACHINE ---------- */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="lg">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CategoryIcon color="primary" />
                        Select a Machine Type
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 3 }}>
                            Please select a machine type for your request. This will help our team provide the most
                            relevant assistance.
                        </DialogContentText>

                        <Box
                            sx={{
                                borderRadius: '12px',
                                backgroundColor: '#f5f7fa',
                                py: 4,
                                px: 2,
                                minHeight: '50vh',
                            }}
                        >
                            {isLoading ? (
                                <Grid container spacing={3}>
                                    {Array.from(new Array(8)).map((_, idx) => (
                                        <Grid item xs={12} sm={6} md={3} key={idx}>
                                            <Paper
                                                elevation={2}
                                                sx={{
                                                    p: 2,
                                                    height: '200px',
                                                    borderRadius: '12px',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <CircularProgress />
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Grid container spacing={3}>
                                    {machines.map((machine, index) => (
                                        <Grid item xs={12} sm={12} md={6} lg={3} key={index}>
                                            <Box
                                                onClick={() => handleSelectMachine(machine)}
                                                sx={{
                                                    cursor: 'pointer',
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.02)',
                                                    },
                                                }}
                                            >
                                                <CardMachine machine={machine} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseCreateDialog}
                        >
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ---------- SECOND DIALOG: REQUEST SUBJECT & DESCRIPTION ---------- */}
                <Dialog open={openMachineDialog} onClose={handleCloseMachineDialog} fullWidth maxWidth="md">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIcon color="primary" />
                        Create New Request
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 3, mt: 1, p: 2, bgcolor: '#f5f7fa', borderRadius: '8px' }}>
                            <Typography variant="subtitle2" color="text.secondary">
                                Selected Machine Type:
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="#051D40">
                                {selectedMachine?.machineTypeName}
                            </Typography>
                        </Box>

                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    required
                                    label="Request Subject"
                                    fullWidth
                                    value={requestSubject}
                                    onChange={(e) => setRequestSubject(e.target.value)}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SubjectIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter a concise subject for your request"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    required
                                    label="Request Description"
                                    fullWidth
                                    multiline
                                    rows={4}
                                    value={requestDescription}
                                    onChange={(e) => setRequestDescription(e.target.value)}
                                    variant="outlined"
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                                                <DescriptionIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Provide detailed information about your request, including specific issues or requirements"
                                />
                            </Grid>
                        </Grid>

                        {/* File Upload Section */}
                        <Box sx={{ mt: 4 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                Revision Files
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Please upload any relevant files that will help us understand your request better (e.g.,
                                pictures sketches, diagrams, specifications).
                            </Typography>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Only allow .mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx files.
                            </Typography>

                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                accept=".mp4,.webm,.ogg,.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx"
                                onChange={handleFileChange}
                            />

                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleClickUpload}
                                sx={{
                                    mb: 2,
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    bgcolor: 'rgba(25, 118, 210, 0.05)',
                                }}
                            >
                                Upload Files
                            </Button>

                            {/* Display selected files */}
                            {revisionFiles.length > 0 && (
                                <Paper elevation={0} sx={{ mt: 2, bgcolor: '#f5f7fa', borderRadius: '8px', p: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                                        Selected Files:
                                    </Typography>
                                    <List sx={{ maxHeight: '200px', overflow: 'auto' }}>
                                        {revisionFiles.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                                        <DeleteIcon color="error" />
                                                    </IconButton>
                                                }
                                                sx={{
                                                    py: 0.5,
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
                                                    primary={file.name}
                                                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                                    primaryTypographyProps={{ fontWeight: 'medium' }}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Paper>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseMachineDialog}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: '#051D40',
                                '&:hover': {
                                    bgcolor: '#02F18D',
                                    color: '#051D40',
                                },
                            }}
                            onClick={handleCreateRequest}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        >
                            {isLoading ? 'Creating...' : 'Create Request'}
                        </Button>
                    </DialogActions>
                </Dialog>

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
                                      selectedRequest.status === 'COMPANY_CANCELLED' ? (
                                        <CancelIcon />
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
                                              selectedRequest.status === 'COMPANY_CANCELLED'
                                            ? 'rgba(211, 47, 47, 0.1)'
                                            : selectedRequest.status === 'PROCESSING'
                                            ? 'rgba(25, 118, 210, 0.1)'
                                            : 'rgba(255, 152, 0, 0.1)',
                                    color:
                                        selectedRequest.status === 'APPROVED'
                                            ? '#2E7D32'
                                            : selectedRequest.status === 'CANCELLED' ||
                                              selectedRequest.status === 'COMPANY_CANCELLED'
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
                                              selectedRequest.status === 'COMPANY_CANCELLED'
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
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                color="#1976d2"
                                                gutterBottom
                                            >
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
                                                            <Box
                                                                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                                                            >
                                                                {selectedRequest.status === 'APPROVED' ? (
                                                                    <DoneIcon fontSize="small" color="success" />
                                                                ) : selectedRequest.status === 'CANCELLED' ||
                                                                  selectedRequest.status === 'COMPANY_CANCELLED' ? (
                                                                    <CancelIcon fontSize="small" color="error" />
                                                                ) : (
                                                                    <PendingActionsIcon
                                                                        fontSize="small"
                                                                        color="warning"
                                                                    />
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
                                                                Designer
                                                            </Typography>
                                                            <Typography variant="body1">
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

                                                        {selectedRequest.cancelledBy && (
                                                            <Box>
                                                                <Typography variant="caption" color="text.secondary">
                                                                    Cancelled By
                                                                </Typography>
                                                                <Typography variant="body1">
                                                                    {selectedRequest.cancelledBy.email}
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
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                color="#1976d2"
                                                gutterBottom
                                            >
                                                Description
                                            </Typography>
                                            <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                                {selectedRequest.requestDescription || 'No description provided'}
                                            </Typography>
                                        </Paper>
                                    </Grid>

                                    {/* Files Section */}
                                    <Grid item xs={12}>
                                        <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                color="#1976d2"
                                                gutterBottom
                                            >
                                                Revision Files
                                            </Typography>

                                            {requestFiles.length > 0 ||
                                            (selectedRequest.requestRevision &&
                                                selectedRequest.requestRevision.revisionFiles &&
                                                selectedRequest.requestRevision.revisionFiles.length > 0) ? (
                                                <List>
                                                    {(requestFiles.length > 0
                                                        ? requestFiles
                                                        : selectedRequest.requestRevision.revisionFiles
                                                    ).map((file, index) => (
                                                        <ListItem
                                                            key={index}
                                                            secondaryAction={
                                                                <Button
                                                                    variant="outlined"
                                                                    size="small"
                                                                    startIcon={<FileDownloadIcon />}
                                                                    sx={{
                                                                        borderRadius: '8px',
                                                                        textTransform: 'none',
                                                                    }}
                                                                    onClick={() => handleDownloadFile(file)}
                                                                >
                                                                    Download
                                                                </Button>
                                                            }
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
                                                    ))}
                                                </List>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">
                                                    Please follow the chat section to review this
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Grid>
                                </Grid>
                            )
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        {selectedRequest?.status !== 'PENDING' && (
                            <Button
                                variant="outlined"
                                startIcon={<ChatIcon />}
                                onClick={() => {
                                    handleCloseViewDialog();
                                    navigate(`/company-request-section/${selectedRequest?.requestId}`);
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    mr: 'auto',
                                    borderColor: '#4caf50',
                                    color: '#4caf50',
                                }}
                            >
                                Go to Chat
                            </Button>
                        )}

                        {/* {selectedRequest &&
                            (selectedRequest.status === 'PENDING' || selectedRequest.status === 'PROCESSING') && (
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
                                    Cancel Request
                                </Button>
                            )} */}

                        <Button
                            variant="contained"
                            startIcon={<CloseIcon />}
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

                {/* Confirm Cancel Dialog */}
                <Dialog open={openCancelConfirmDialog} onClose={handleCloseCancelConfirm} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CancelIcon color="error" />
                        Confirm Cancellation
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this request? This action cannot be undone and will
                            terminate the current support process.
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
                            No, Keep Request
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
                            {isLoading ? 'Cancelling...' : 'Yes, Cancel Request'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
