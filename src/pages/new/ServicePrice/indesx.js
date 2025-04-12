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
    Chip,
    InputAdornment,
    Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ServicePriceAPI from '~/API/ServicePriceAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import storageService from '~/components/StorageService/storageService';

// Icons import
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SellIcon from '@mui/icons-material/Sell';
import EventIcon from '@mui/icons-material/Event';
import UpdateIcon from '@mui/icons-material/Update';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import CategoryIcon from '@mui/icons-material/Category';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

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
    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [total, setTotal] = useState(0);

    // Stats for dashboard
    const [totalServices, setTotalServices] = useState(0);
    const [averagePrice, setAveragePrice] = useState(0);
    const [highestPrice, setHighestPrice] = useState(0);
    const [newestServices, setNewestServices] = useState(0);

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
                toast.success('Service price created successfully');
            }
            handleCloseCreateDialog();
            fetchData();
            fetchAllData(); // Refresh stats
        } catch (error) {
            console.error('Failed to create service price:', error);
            toast.error(`Failed to create service price. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateServicePrice(false);
        }
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Service Name',
            flex: 2,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <SellIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'price',
            headerName: 'Points',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    icon={<MonetizationOnIcon />}
                    label={params.value}
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
            field: 'createdDate',
            headerName: 'Created Date',
            flex: 1.5,
            minWidth: 160,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <EventIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{formatDate(params.value)}</Typography>
                </Box>
            ),
        },
        {
            field: 'updatedDate',
            headerName: 'Updated Date',
            flex: 1.5,
            minWidth: 160,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <UpdateIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{formatDate(params.value)}</Typography>
                </Box>
            ),
        },
        {
            field: 'action',
            headerName: 'Actions',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => {
                return (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                        <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenEditDialog(params.row)}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            Edit
                        </Button>
                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDeleteConfirm(params.row.id)}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
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
            setIsLoading(true);
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
            toast.error('Failed to load service prices');
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch all data for statistics
    const fetchAllData = async () => {
        try {
            // Fetch all services to calculate stats
            const response = await ServicePriceAPI.getAllServicePrices({
                page: 1,
                size: 1000, // Large number to get all services
            });

            const allServices = response?.result || [];

            // Update total services count
            setTotalServices(allServices.length);

            // Calculate average price
            if (allServices.length > 0) {
                const totalPrice = allServices.reduce((sum, service) => sum + Number(service.price), 0);
                setAveragePrice(Math.round(totalPrice / allServices.length));

                // Find highest price
                const maxPrice = Math.max(...allServices.map((service) => Number(service.price)));
                setHighestPrice(maxPrice);
            }

            // Count services created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentServices = allServices.filter((service) => {
                if (!service.createdDate) return false;
                const createdDate = new Date(service.createdDate);
                return createdDate >= thirtyDaysAgo;
            }).length;

            setNewestServices(recentServices);
        } catch (error) {
            console.error('Failed to fetch all service prices for stats:', error);
        }
    };

    useEffect(() => {
        fetchData();
        fetchAllData(); // Get stats from all data
    }, [paginationModel]);

    const formatDate = (dateString) => {
        if (!dateString) return '-';
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
            setIsLoading(true);
            const response = await ServicePriceAPI.updateServicePrice(editServicePrice.id, editServicePrice);
            if (response?.result) {
                toast.success('Service price updated successfully');
            }
            handleCloseEditDialog();
            fetchData();
            fetchAllData(); // Refresh stats
        } catch (error) {
            console.error('Failed to update service price:', error);
            toast.error(`Failed to update service price. ${error?.response?.data?.message}`);
        } finally {
            setIsLoading(false);
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
            setIsLoading(true);
            const response = await ServicePriceAPI.deleteServicePriceById(id);
            if (response?.result) {
                toast.success('Service price deleted successfully');
            }
            fetchData();
            fetchAllData(); // Refresh stats
        } catch (error) {
            console.error('Failed to delete service price:', error);
            toast.error('Service price is currently in use and cannot be deleted');
        } finally {
            setIsLoading(false);
            setOpenDeleteConfirmDialog(false);
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
                                    Service Price Management
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
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
                                    >
                                        Create Service Price
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
                                            Total Services
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {totalServices}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CategoryIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Available Pricing Plans
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
                                            Average Price
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {averagePrice}{' '}
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                fontWeight="bold"
                                                color="#2E7D32"
                                            >
                                                points
                                            </Typography>
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <EqualizerIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Average Cost
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
                                            Highest Price
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {highestPrice}{' '}
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                fontWeight="bold"
                                                color="#E65100"
                                            >
                                                points
                                            </Typography>
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <TrendingUpIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Premium Service
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
                                            New (30 days)
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#303F9F" sx={{ mt: 1 }}>
                                            {newestServices}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <DonutLargeIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Recently Added
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

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

                {/* Create Service Price Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <PriceChangeIcon color="primary" />
                        Create New Service Price
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Service Name"
                                name="name"
                                value={newServicePrice.name}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SellIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter service name"
                            />

                            <TextField
                                required
                                fullWidth
                                label="Price (Points)"
                                name="price"
                                type="number"
                                value={newServicePrice.price}
                                onChange={handleInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MonetizationOnIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter point price"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseCreateDialog}
                            disabled={isLoadingCreateServicePrice}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateServicePrice}
                            variant="contained"
                            color="primary"
                            disabled={!newServicePrice.name || !newServicePrice.price || isLoadingCreateServicePrice}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: '#051D40',
                            }}
                            startIcon={
                                isLoadingCreateServicePrice ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : (
                                    <AddIcon />
                                )
                            }
                        >
                            {isLoadingCreateServicePrice ? 'Creating...' : 'Create Service'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Service Price Dialog */}
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <EditIcon color="primary" />
                        Edit Service Price
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Service Name"
                                name="name"
                                value={editServicePrice.name}
                                onChange={handleEditInputChange}
                                disabled
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SellIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Price (Points)"
                                name="price"
                                type="number"
                                value={editServicePrice.price}
                                onChange={handleEditInputChange}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <MonetizationOnIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseEditDialog}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateServicePrice}
                            variant="contained"
                            color="primary"
                            disabled={!editServicePrice.name || !editServicePrice.price || isLoading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: '#051D40',
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <UpdateIcon />}
                        >
                            {isLoading ? 'Updating...' : 'Update Service'}
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
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <DeleteIcon color="error" />
                        Confirm Delete
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this service price? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={() => setOpenDeleteConfirmDialog(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={() => handleDelete(selectedServicePriceId)}
                            color="error"
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        >
                            {isLoading ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
