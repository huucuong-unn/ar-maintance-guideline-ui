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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PointRequestAPI from '~/API/PointRequestAPI';
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

export default function PointRequestManagement() {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [requestId, setRequestId] = useState(null);

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
                if (params.value === 'ACTIVE') color = 'green';
                else if (params.value === 'INACTIVE') color = 'orange';
                return <Box sx={{ color, fontWeight: 'bold', textTransform: 'uppercase' }}>{params.value || '-'}</Box>;
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
                                    sx={{ width: '100px' }}
                                    onClick={() => handleOpenApproveConfirm(params.row.id)}
                                >
                                    APPROVE
                                </Button>
                            </>
                        )}
                        {currentStatus === 'PROCESSING' && (
                            <Button
                                variant="contained"
                                color="error"
                                sx={{ width: '100px', bgcolor: 'orange' }}
                                onClick={() => handleOpenCancelConfirm(params.row.id)}
                            >
                                REJECT
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

    // Fetch existing requests
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await PointRequestAPI.getAllPointRequestsByCompanyId(userInfo?.company?.id);
            const data = response?.result || [];
            setRows(data);
        } catch (error) {
            console.error('Failed to fetch request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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
                            sx={{ border: 'none' }}
                            getRowId={(row) => row.id}
                            slots={{ toolbar: GridToolbar }}
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
                        <Button onClick={handleCloseCancelConfirm}>No</Button>
                        <Button onClick={handleConfirmCancel} variant="contained" color="error">
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
                        <Button onClick={handleCloseApproveConfirm}>No</Button>
                        <Button onClick={handleApprove} variant="contained" color="success">
                            {isLoading ? <CircularProgress /> : 'Yes, Approve'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
