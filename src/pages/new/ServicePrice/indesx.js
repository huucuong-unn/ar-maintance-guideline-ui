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
    Grid,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServicePriceAPI from '~/API/ServicePriceAPI';
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

export default function ServicePriceManagement() {
    const navigate = useNavigate();
    const [isLoadingCreateServicePrice, setIsLoadingCreateServicePrice] = useState(false);
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [total, setTotal] = useState(0);

    // Dialog state for creating service price
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newServicePrice, setNewServicePrice] = useState({
        name: '',
        price: '',
    });

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setNewServicePrice({
            name: '',
            price: '',
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewServicePrice({
            ...newServicePrice,
            [name]: value,
        });
    };

    const handleCreateServicePrice = async () => {
        if (!newServicePrice.name || !newServicePrice.price) {
            return;
        }
        try {
            setIsLoadingCreateServicePrice(true);
            const response = await ServicePriceAPI.createServicePrice(newServicePrice);
            if (response?.result) {
                toast.success('Create service price successfully');
            }
            handleCloseCreateDialog();
            fetchData();
        } catch (error) {
            console.error('Failed to create service price:', error);
            toast.error(`Create service price failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateServicePrice(false);
        }
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 300 },
        { field: 'price', headerName: 'Point', width: 200 },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDate(params.value),
        },
        {
            field: 'updatedDate',
            headerName: 'Updated Date',
            width: 200,
            renderCell: (params) => formatDate(params.value),
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 400,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenEditDialog(params.row)}
                            sx={{ width: '100px' }}
                        >
                            Edit
                        </Button>
                        <Button
                            color="error"
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenDeleteConfirm(params.row.id)}
                        >
                            Delete
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
            };
            const response = await ServicePriceAPI.getAllServicePrices(params);
            const data = response?.result || [];
            setRows(data);
            setTotal(response?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch service prices:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    };

    // --- State for Edit Dialog ---
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [editServicePrice, setEditServicePrice] = useState({
        id: '',
        name: '',
        price: '',
    });

    const handleOpenEditDialog = (servicePrice) => {
        setEditServicePrice(servicePrice);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setEditServicePrice({
            id: '',
            name: '',
            price: '',
        });
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditServicePrice({
            ...editServicePrice,
            [name]: value,
        });
    };

    const handleUpdateServicePrice = async () => {
        if (!editServicePrice.name || !editServicePrice.price) {
            return;
        }
        try {
            const response = await ServicePriceAPI.updateServicePrice(editServicePrice.id, editServicePrice);
            if (response?.result) {
                toast.success('Update service price successfully');
            }
            handleCloseEditDialog();
            fetchData();
        } catch (error) {
            console.error('Failed to update service price:', error);
            toast.error(`Update service price failed. ${error?.response?.data?.message}`);
        }
    };

    // --- State for Delete Confirm dialog ---
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [selectedServicePriceId, setSelectedServicePriceId] = useState(null);

    const handleOpenDeleteConfirm = (id) => {
        setSelectedServicePriceId(id);
        setOpenDeleteConfirmDialog(true);
    };

    const handleDelete = async (id) => {
        try {
            const response = await ServicePriceAPI.deleteServicePriceById(id);
            if (response?.result) {
                toast.success('Delete service price successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Failed to delete service price:', error);
            toast.error('Service Price currently in use');
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
                        Service Price Management
                    </Typography>

                    {/* Create Service Price Button */}
                    <Box sx={{ mb: 4, display: 'flex', justify: 'left' }}>
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
                            onClick={handleOpenCreateDialog}
                        >
                            {isLoadingCreateServicePrice ? <CircularProgress /> : ' Create Service Price'}
                        </Button>
                    </Box>

                    {/* Data Grid */}
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
                        />
                    </Paper>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>

                {/* Create Service Price Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Service Price</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Name"
                                name="name"
                                value={newServicePrice.name}
                                onChange={handleInputChange}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={newServicePrice.price}
                                onChange={handleInputChange}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateDialog}>Cancel</Button>
                        <Button
                            onClick={handleCreateServicePrice}
                            variant="contained"
                            color="primary"
                            disabled={!newServicePrice.name || !newServicePrice.price}
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Service Price Dialog */}
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Service Price</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Name"
                                name="name"
                                value={editServicePrice.name}
                                onChange={handleEditInputChange}
                                disabled
                            />

                            <TextField
                                required
                                fullWidth
                                label="Price"
                                name="price"
                                type="number"
                                value={editServicePrice.price}
                                onChange={handleEditInputChange}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditDialog}>Cancel</Button>
                        <Button
                            onClick={handleUpdateServicePrice}
                            variant="contained"
                            color="primary"
                            disabled={!editServicePrice.name || !editServicePrice.price}
                        >
                            Update
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
                            Are you sure you want to delete this service price? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDeleteConfirmDialog(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                handleDelete(selectedServicePriceId);
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
