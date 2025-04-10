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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PointRequestAPI from '~/API/PointRequestAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import storageService from '~/components/StorageService/storageService';
import { useWallet } from '~/WalletContext';

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

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Table columns
    const columns = [
        {
            field: 'requestNumber',
            headerName: 'Request Number',
            width: 150,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                let color = 'black';
                if (params.value === 'ACTIVE') {
                    color = 'green';
                } else if (params.value === 'INACTIVE') {
                    color = 'orange';
                } else if (params.value === 'APPROVED') {
                    color = 'green';
                } else if (params.value === 'REJECT') {
                    color = 'red';
                } else if (params.value === 'PROCESSING') {
                    color = '#ff9800';
                }
                return <Box sx={{ color, fontWeight: 'bold' }}>{formatStatus(params.value) || '-'}</Box>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 250,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        {currentStatus === 'PROCESSING' && (
                            <>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="success"
                                    sx={{ width: '100px', textTransform: 'none' }}
                                    onClick={() => handleOpenApproveConfirm(params.row.id)}
                                >
                                    Approve
                                </Button>
                            </>
                        )}
                        {currentStatus === 'PROCESSING' && (
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ width: '100px', bgcolor: 'orange', textTransform: 'none' }}
                                onClick={() => handleOpenCancelConfirm(params.row.id)}
                            >
                                Reject
                            </Button>
                        )}
                    </Box>
                );
            },
        },
        { field: 'reason', headerName: 'Reason', width: 200 },
        { field: 'amount', headerName: 'Point Amount', width: 150 },
        {
            field: 'employee',
            headerName: 'Employee',
            width: 200,
            renderCell: (params) => params.row.employee?.email || '-',
        },
        {
            field: 'createdAt',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDateTime(params.value) || '-',
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
        } catch (error) {
            console.error('Failed to fetch request:', error);
        } finally {
            setIsLoading(false);
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
            console.log('response', response);
            if (response?.result) {
                toast.success('Request cancelled successfully!');
            }
        } catch (error) {
            console.error('Failed to cancel request:', error);
            toast.error('Failed to cancel request. Please try again.');
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
                        Point Requests Management
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', gap: 2, mb: 2 }}>
                        {/* Search Request Number */}
                        <TextField
                            label="Request Number"
                            variant="outlined"
                            name="requestNumber"
                            value={searchParams.requestNumber}
                            onChange={handleInputChange}
                            sx={{ width: 200 }}
                        />

                        {/* Search Employee Email */}
                        <TextField
                            label="Employee Email"
                            variant="outlined"
                            name="employeeEmail"
                            value={searchParams.employeeEmail}
                            onChange={handleInputChange}
                            sx={{ width: 250 }}
                        />

                        {/* Sort Status */}
                        <Autocomplete
                            options={['REJECT', 'PROCESSING', 'APPROVED']}
                            value={searchParams.status}
                            onChange={handleStatusChange}
                            renderInput={(params) => <TextField {...params} label="Status" variant="outlined" />}
                            sx={{ width: 200 }}
                        />

                        <TextField
                            label="Create Date"
                            variant="outlined"
                            name="createDate"
                            type="date"
                            value={searchParams.createDate}
                            onChange={handleInputChange}
                            sx={{ width: 200 }}
                            InputLabelProps={{
                                shrink: true,
                            }}
                        />

                        {/* Search Button */}
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                textTransform: 'none',
                                '&:hover': {
                                    bgcolor: '#115293',
                                    color: 'white',
                                },
                                p: 2,
                            }}
                            onClick={handleSearch}
                        >
                            Filter
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
                            loading={isLoading}
                        />
                    </Paper>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>

                <Dialog open={openCancelConfirmDialog} onClose={handleCloseCancelConfirm} fullWidth maxWidth="xs">
                    <DialogTitle>Confirm Cancellation</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to cancel this request? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseCancelConfirm}>
                            No
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={handleConfirmCancel}
                            variant="contained"
                            color="error"
                        >
                            {isLoading ? <CircularProgress /> : 'Yes, Cancel'}
                        </Button>
                    </DialogActions>
                </Dialog>

                <Dialog open={openApproveConfirmDialog} onClose={handleCloseApproveConfirm} fullWidth maxWidth="xs">
                    <DialogTitle>Confirm Approval</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to approve this request? This action will use your points.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseApproveConfirm}>
                            No
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={handleApprove}
                            variant="contained"
                            color="success"
                        >
                            {isLoading ? <CircularProgress /> : 'Yes, Approve'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
