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
    Skeleton,
    TextField,
    Typography,
    Autocomplete,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompanyRequestAPI from '~/API/CompanyRequestAPI'; // Your API
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import CardMachine from '~/components/CardMachine'; // The updated CardMachine
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
// Add these imports at the top of your file

// Add these imports at the top of your file
import { useRef } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';

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
    const navigate = useNavigate(); // Declare navigate

    // --------------------- FIRST DIALOG (Select Machine) ---------------------
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [machines, setMachines] = useState([]);

    const [revisionFiles, setRevisionFiles] = useState([]);
    const fileInputRef = useRef(null);

    // Add these functions to handle file uploads
    const handleFileChange = (event) => {
        const newFiles = Array.from(event.target.files);
        setRevisionFiles([...revisionFiles, ...newFiles]);
    };

    const handleRemoveFile = (indexToRemove) => {
        setRevisionFiles(revisionFiles.filter((_, index) => index !== indexToRemove));
    };

    const handleClickUpload = () => {
        fileInputRef.current.click();
    };

    // 2) When a user selects a machine card
    const [selectedMachine, setSelectedMachine] = useState(null);

    // --------------------- SECOND DIALOG (Enter Request Subject/Desc) ---------------------
    const [openMachineDialog, setOpenMachineDialog] = useState(false);
    const [requestSubject, setRequestSubject] = useState('');
    const [requestDescription, setRequestDescription] = useState('');
    const [openEditor, setOpenEditor] = useState(false);
    const [openModelId, setOpenModelId] = useState(null);
    const [requestId, setRequestId] = useState(null);

    const [disableApprove, setDisableApprove] = useState(true);

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
                if (params.value === 'ACTIVE') color = 'green';
                else if (params.value === 'INACTIVE') color = 'gray';
                else if (params.value === 'DRAFTED') color = '#9c27b0';
                else if (params.value === 'PROCESSING') color = 'blue';
                else if (params.value === 'PENDING') color = 'orange';
                else if (params.value === 'APPROVED') color = 'green';
                else if (params.value === 'CANCEL') color = 'red';
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
                            <Button
                                variant="contained"
                                component="label"
                                sx={{ width: '100px', bgcolor: 'orange', textTransform: 'none' }}
                                onClick={() => navigate(`/company-request-section/${params.row.requestId}`)}
                            >
                                Chat
                            </Button>
                        )}
                        {currentStatus === 'DRAFTED' && (
                            <>
                                <Button
                                    variant="contained"
                                    component="label"
                                    sx={{ width: '100px', bgcolor: 'orange', textTransform: 'none' }}
                                    onClick={() => handleOpenEditor(params.row.assetModel?.id, params.row.requestId)}
                                >
                                    Review
                                </Button>
                                <Button
                                    variant="contained"
                                    component="label"
                                    color="error"
                                    sx={{ width: '100px', textTransform: 'none' }}
                                    onClick={() => handleOpenCancelConfirm(params.row.requestId)}
                                >
                                    Cancel
                                </Button>
                            </>
                        )}
                        {currentStatus === 'APPROVED' && (
                            <>
                                <Button
                                    variant="contained"
                                    component="label"
                                    disabled
                                    sx={{ width: '100px', bgcolor: 'orange', textTransform: 'none' }}
                                >
                                    Done
                                </Button>
                                <Typography variant="body2" sx={{ color: 'green', fontWeight: 'bold' }}>
                                    {formatDateTime(params.row.completedAt)}
                                </Typography>
                            </>
                        )}
                    </Box>
                );
            },
        },
        { field: 'requestSubject', headerName: 'Subject', width: 200 },
        { field: 'requestDescription', headerName: 'Description', width: 250 },
        {
            field: 'designer',
            headerName: 'Designer',
            width: 200,
            renderCell: (params) => params.row.designer?.email || '-',
        },
        {
            field: 'modelName',
            headerName: 'Model Name',
            width: 200,
            renderCell: (params) => params.row.assetModel?.name || '-',
        },
        {
            field: 'machineType',
            headerName: 'Machine Type',
            width: 200,
            renderCell: (params) => params.row.machineType?.machineTypeName || '-',
        },
        {
            field: 'createdAt',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDateTime(params.value) || '-',
        },
        {
            field: 'cancelledAt',
            headerName: 'Cancelled Date',
            width: 200,
            renderCell: (params) => formatDateTime(params.value) || '-',
        },
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [statusToSort, setStatusToSort] = useState('');
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    // const [revisionFiles, setRevisionFiles] = useState([]);

    // // Then add this function to handle file uploads
    // const handleFileChange = (event) => {
    //     const files = Array.from(event.target.files);
    //     setRevisionFiles((prevFiles) => [...prevFiles, ...files]);
    // };

    // // Add this function to remove a file from the list
    // const handleRemoveFile = (fileToRemove) => {
    //     setRevisionFiles((prevFiles) => prevFiles.filter((file) => file !== fileToRemove));
    // };

    // Fetch existing requests
    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
            };
            setIsLoading(true);
            const response = await CompanyRequestAPI.getAllCompanyRequestsByCompanyId(
                userInfo?.company?.id,
                statusToSort ? statusToSort : '',
                params,
            );
            const data = response?.result?.objectList || [];
            console.log('Fetched data:', data);
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchCompanyRequest = async () => {
        fetchData();
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    useEffect(() => {
        console.log(paginationModel);
    }, [paginationModel]);

    // Open the "Select Machine" dialog
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
        } finally {
            setIsLoading(false);
        }
    };

    // Close the "Select Machine" dialog
    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    // Step 1: When a machine card is clicked
    const handleSelectMachine = (machine) => {
        setSelectedMachine(machine); // store the machine
        setOpenCreateDialog(false); // close first dialog
        // Then open the second dialog
        setRequestSubject('');
        setRequestDescription('');
        setOpenMachineDialog(true);
    };

    // Cancel the second dialog
    const handleCloseMachineDialog = () => {
        setOpenMachineDialog(false);
        setSelectedMachine(null);
    };

    // 2) Confirm create request with subject/desc
    const handleCreateRequest = async () => {
        if (!selectedMachine) return; // Safety check
        if (!requestSubject || !requestDescription) {
            toast.error('Please enter both request subject and description.');
            return;
        }

        try {
            setIsLoading(true);

            // Create FormData for file uploads
            const formData = new FormData();

            // Flattened fields
            formData.append('companyId', userInfo?.company?.id);
            formData.append('machineTypeId', selectedMachine?.machineTypeId);
            formData.append('requestSubject', requestSubject);
            formData.append('requestDescription', requestDescription);
            formData.append('requesterId', userInfo?.id);

            // This part is key!
            revisionFiles.forEach((file) => {
                formData.append('requestRevision.revisionFiles', file); // Note the nested path
            });

            // Call your API - you might need to adjust your API call to handle FormData
            const response = await CompanyRequestAPI.createRequest(formData);

            if (response?.result) {
                toast.success('Request created successfully!');
                fetchData(); // refresh the table
                setRevisionFiles([]); // Reset files after successful submission
            }
        } catch (error) {
            console.error('Failed to create request:', error);
            toast.error('Failed to create request. Please try again.');
        } finally {
            setIsLoading(false);
            handleCloseMachineDialog();
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

    const handleCloseEditor = () => {
        setOpenEditor(false);
    };

    const handleOpenEditor = (modelId, requestId) => {
        setOpenModelId(modelId);
        setRequestId(requestId);
        setOpenEditor(true);
    };

    const handleApprove = async () => {
        try {
            setIsLoading(true);
            const payload = {
                status: 'APPROVED',
            };
            const response = await CompanyRequestAPI.updateRequestStatus(requestId, payload);
            if (response?.result) {
                toast.success('Request approved successfully!');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to approve request:', error);
        } finally {
            setIsLoading(false);
            handleCloseEditor();
        }
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
            const payload = { status: 'COMPANY_CANCELLED' };
            const response = await CompanyRequestAPI.updateRequestStatus(requestId, payload);
            console.log('response', response);
            if (response?.result) {
                toast.success('Request cancelled successfully!');
                fetchData();
            }
        } catch (error) {
            console.error('Failed to cancel request:', error);
            toast.error('Failed to cancel request. Please try again.');
        } finally {
            handleCloseCancelConfirm();
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log(statusToSort);
    }, [statusToSort]);

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

                    {/* Create Request Button */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
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
                                textTransform: 'none',
                            }}
                            onClick={handleOpenCreateDialog}
                        >
                            Create Request
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Autocomplete
                                disablePortal
                                options={['PENDING', 'APPROVED', 'CANCEL', 'PROCESSING']}
                                sx={{ width: 200, mr: 2 }}
                                renderInput={(params) => <TextField {...params} label="Status" />}
                                onChange={(event, newValue) => {
                                    setStatusToSort(newValue);
                                }}
                            />

                            <Button
                                variant="contained"
                                size="large"
                                sx={{
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    '&:hover': {
                                        bgcolor: '#115293',
                                        color: 'white',
                                    },
                                    p: 2,
                                    textTransform: 'none',
                                }}
                                onClick={handleSearchCompanyRequest}
                            >
                                Filter
                            </Button>
                        </Box>
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
                            getRowId={(row) => row.requestId}
                            loading={isLoading}
                        />
                    </Paper>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>

                {/* ---------- FIRST DIALOG: SELECT MACHINE ---------- */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="lg">
                    <DialogTitle>Select a Machine Type</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Please select a machine type for the request.
                        </DialogContentText>

                        <Box
                            sx={{
                                borderRadius: '20px',
                                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                py: 4,
                                px: 2,
                                minHeight: '50vh',
                            }}
                        >
                            {isLoading ? (
                                <Grid container spacing={3}>
                                    {Array.from(new Array(8)).map((_, idx) => (
                                        <Grid item xs={12} sm={6} md={3} key={idx}>
                                            <Skeleton
                                                variant="rectangular"
                                                sx={{
                                                    width: '100%',
                                                    aspectRatio: '16/9',
                                                    borderRadius: 2,
                                                    mb: 1,
                                                }}
                                            />
                                            <Skeleton variant="text" height={30} width="80%" sx={{ mb: 1 }} />
                                            <Skeleton variant="text" height={20} width="60%" />
                                        </Grid>
                                    ))}
                                </Grid>
                            ) : (
                                <Grid container spacing={3}>
                                    {machines.map((machine, index) => (
                                        <Grid item xs={12} sm={12} md={6} lg={3} key={index}>
                                            <Box onClick={() => handleSelectMachine(machine)}>
                                                <CardMachine machine={machine} />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseCreateDialog}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* ---------- SECOND DIALOG: REQUEST SUBJECT & DESCRIPTION ---------- */}
                <Dialog open={openMachineDialog} onClose={handleCloseMachineDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Request Details</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Enter the request subject and description for machine:
                            <strong> {selectedMachine?.machineName}</strong>
                        </DialogContentText>

                        <TextField
                            required
                            margin="normal"
                            label="Request Subject"
                            fullWidth
                            value={requestSubject}
                            onChange={(e) => setRequestSubject(e.target.value)}
                        />

                        <TextField
                            required
                            margin="normal"
                            label="Request Description"
                            fullWidth
                            multiline
                            rows={3}
                            value={requestDescription}
                            onChange={(e) => setRequestDescription(e.target.value)}
                        />

                        <TextField
                            disabled
                            margin="normal"
                            label="Machine Type"
                            fullWidth
                            value={selectedMachine?.machineTypeName}
                        />

                        {/* File Upload Section */}
                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Revision Files (Optional)
                            </Typography>

                            <input
                                type="file"
                                multiple
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />

                            <Button
                                variant="outlined"
                                startIcon={<CloudUploadIcon />}
                                onClick={handleClickUpload}
                                sx={{ mb: 2 }}
                            >
                                Upload Files
                            </Button>

                            {/* Display selected files */}
                            {revisionFiles.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Selected Files:
                                    </Typography>
                                    <List>
                                        {revisionFiles.map((file, index) => (
                                            <ListItem
                                                key={index}
                                                secondaryAction={
                                                    <IconButton edge="end" onClick={() => handleRemoveFile(index)}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                }
                                                sx={{ py: 0.5 }}
                                            >
                                                <ListItemIcon>
                                                    <AttachFileIcon />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={file.name}
                                                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseMachineDialog}>
                            Cancel
                        </Button>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={handleCreateRequest}
                            disabled={isLoading}
                            variant="contained"
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

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
            </Grid>
        </ThemeProvider>
    );
}
