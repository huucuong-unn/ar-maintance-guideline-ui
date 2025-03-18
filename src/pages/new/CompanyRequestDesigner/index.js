import {
    Box,
    Button,
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
import CompanyRequestAPI from '~/API/CompanyRequestAPI'; // Your API
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
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

export default function CompanyRequestDesigner() {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);

    // New state for Approve confirmation dialog
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditor(false);
    };
    const [isCreating, setIsCreating] = useState(false);

    // Table columns
    const columns = [
        { field: 'requestSubject', headerName: 'Subject', width: 200 },
        { field: 'requestDescription', headerName: 'Description', width: 300 },
        {
            field: 'designer',
            headerName: 'Designer',
            width: 200,
            renderCell: (params) => params.row.designer?.email || '-',
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 200,
            renderCell: (params) => params.row.company.companyName || '-',
        },
        {
            field: 'machine',
            headerName: 'Machine',
            width: 200,
            renderCell: (params) => params.row.machine?.machineName || '-',
        },
        {
            field: 'createdAt',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDateTime(params.value),
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
            width: 400,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        {currentStatus === 'PENDING' && (
                            <Button
                                variant="contained"
                                size="small"
                                color="success"
                                sx={{ width: '100px' }}
                                onClick={() => handleOpenApproveDialog(params.row.requestId)}
                            >
                                Approve
                            </Button>
                        )}

                        {currentStatus === 'PROCESSING' && (
                            <>
                                <Button
                                    variant="contained"
                                    component="label"
                                    sx={{ width: '100px', bgcolor: 'orange' }}
                                >
                                    Upload
                                    <input type="file" hidden accept=".glb,.gltf" onChange={handle3DFileSelect} />
                                </Button>
                                <Button variant="contained" component="label" sx={{ width: '100px', bgcolor: 'red' }}>
                                    Cancel
                                </Button>
                            </>
                        )}
                    </Box>
                );
            },
        },
    ];

    // Fetch existing requests
    const fetchData = async () => {
        try {
            setIsLoading(true);
            const response = await CompanyRequestAPI.getAllCompanyRequests();
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

    const handleOpenApproveDialog = (requestId) => {
        setSelectedRequestId(requestId);
        setOpenApproveDialog(true);
    };

    const handleCloseApproveDialog = () => {
        setOpenApproveDialog(false);
        setSelectedRequestId(null);
    };

    const handleConfirmApprove = async () => {
        try {
            const payload = { status: 'PROCESSING', designerId: userInfo.id };
            const response = await CompanyRequestAPI.updateRequestStatus(selectedRequestId, payload);
            if (response?.result) {
                toast.success('Request approved successfully!');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to update request status:', error);
            toast.error('Failed to approve request. Please try again.');
        } finally {
            handleCloseApproveDialog();
        }
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
    const [file3D, setFile3D] = useState(null);

    const handle3DFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
            setOpenCreateDialog(true);
            setOpenEditor(true);
        }
    };
    const handleCloseEditor = () => {
        setOpenEditor(false);
        setOpenCreateDialog(false);
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
                        Company Requests Management
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
                            getRowId={(row) => row.requestId}
                            slots={{ toolbar: GridToolbar }}
                            loading={isLoading}
                        />
                    </Paper>
                </Box>

                {/* Approve Confirmation Dialog */}
                <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} fullWidth maxWidth="xs">
                    <DialogTitle>Confirm Approval</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure you want to approve this request?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseApproveDialog}>Cancel</Button>
                        <Button onClick={handleConfirmApprove} variant="contained" color="success">
                            Approve
                        </Button>
                    </DialogActions>
                </Dialog>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>
            </Grid>

            {/* Create Model Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="xl">
                <DialogTitle>Create New Model</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    {file3D && (
                        <>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                File: {file3D.name}
                            </Typography>
                            {openEditor && (
                                <ModelEditor
                                    action={'CreateModel'}
                                    modelFile3D={URL.createObjectURL(file3D)}
                                    modelFile3DToCreate={file3D}
                                    handleCloseModal={handleCloseEditor}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
                        Cancel
                    </Button>
                    {/* <Button onClick={handleCreateModel} disabled={isCreating}>
                                    {isCreating ? <CircularProgress size={24} /> : 'Create'}
                                </Button> */}
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
