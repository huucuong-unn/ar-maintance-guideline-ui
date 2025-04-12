import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Grid,
    TextField,
    Typography,
    CircularProgress,
    Chip,
    InputAdornment,
    Divider,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PointOptionsAPI from '~/API/PointOptionsAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';

// Icons
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CategoryIcon from '@mui/icons-material/Category';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import UpdateIcon from '@mui/icons-material/Update';
import BlockIcon from '@mui/icons-material/Block';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import VisibilityIcon from '@mui/icons-material/Visibility';
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

export default function PointOptionManagement() {
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Stats for dashboard
    const [totalOptions, setTotalOptions] = useState(0);
    const [activeOptions, setActiveOptions] = useState(0);
    const [highestPoints, setHighestPoints] = useState(0);
    const [averagePointsPerMoney, setAveragePointsPerMoney] = useState(0);

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [selectedPointOption, setSelectedPointOption] = useState(null);
    const [selectedPointOptionId, setSelectedPointOptionId] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [point, setPoint] = useState('');
    const [currency, setCurrency] = useState('VND');

    // Loading states for buttons
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPointOptions = async () => {
        try {
            setIsLoading(true);
            const response = await PointOptionsAPI.getAllPointOptionsAdmin();
            const data = response?.result || [];
            setRows(data);
            setTotal(data.length);

            // Calculate stats
            calculateStats(data);
        } catch (error) {
            console.error('Failed to fetch point options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const calculateStats = (data) => {
        // Calculate total options
        setTotalOptions(data.length);

        // Calculate active options
        const active = data.filter((option) => option.status === 'ACTIVE').length;
        setActiveOptions(active);

        // Find highest points option
        if (data.length > 0) {
            const highest = Math.max(...data.map((option) => Number(option.point)));
            setHighestPoints(highest);

            // Calculate average points per money unit
            let totalRatio = 0;
            data.forEach((option) => {
                if (Number(option.amount) > 0) {
                    totalRatio += Number(option.point) / Number(option.amount);
                }
            });
            const avgRatio = data.length > 0 ? (totalRatio / data.length).toFixed(2) : 0;
            setAveragePointsPerMoney(avgRatio);
        }
    };

    useEffect(() => {
        fetchPointOptions();
    }, []);

    const handleCreatePointOption = async () => {
        try {
            setIsCreating(true);
            const newPointOption = { name, amount, point, currency };
            const response = await PointOptionsAPI.createPointOptions(newPointOption);
            if (response?.result) {
                toast.success('Point option created successfully!');
                fetchPointOptions();
                handleCloseCreateDialog();
            }
        } catch (error) {
            console.error('Failed to create point option:', error);
            toast.error('Failed to create point option. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdatePointOption = async () => {
        try {
            setIsUpdating(true);
            const updatedPointOption = { name, amount, point, currency };
            const response = await PointOptionsAPI.updatePointOptions(selectedPointOption.id, updatedPointOption);
            if (response?.result) {
                toast.success('Point option updated successfully!');
                fetchPointOptions();
                handleCloseEditDialog();
            }
        } catch (error) {
            console.error('Failed to update point option:', error);
            toast.error('Failed to update point option. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangeStatus = async (id) => {
        try {
            setIsChangingStatus(true);
            setSelectedPointOptionId(id);
            const response = await PointOptionsAPI.changeStatus(id);
            toast.success('Point option status changed successfully!');
            fetchPointOptions();
        } catch (error) {
            console.error('Failed to change status:', error);
            toast.error('Failed to change status. Please try again.');
        } finally {
            setIsChangingStatus(false);
            setSelectedPointOptionId(null);
        }
    };

    const handleDeletePointOption = async () => {
        try {
            setIsDeleting(true);
            const response = await PointOptionsAPI.deletePointOptions(selectedPointOptionId);
            toast.success('Point option deleted successfully!');
            fetchPointOptions();
            handleCloseDeleteConfirmDialog();
        } catch (error) {
            console.error('Failed to delete point option:', error);
            toast.error('Point Option is currently in use');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenDeleteConfirmDialog = (id) => {
        setSelectedPointOptionId(id);
        setOpenDeleteConfirmDialog(true);
    };

    const handleCloseDeleteConfirmDialog = () => {
        setOpenDeleteConfirmDialog(false);
        setSelectedPointOptionId(null);
    };

    const handleOpenCreateDialog = () => {
        setName('');
        setAmount('');
        setPoint('');
        setCurrency('VND');
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleOpenEditDialog = (pointOption) => {
        setSelectedPointOption(pointOption);
        setName(pointOption.name);
        setAmount(pointOption.amount);
        setPoint(pointOption.point);
        setCurrency(pointOption.currency);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedPointOption(null);
    };

    const formatCurrency = (value, currency) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: currency || 'VND',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const columns = [
        {
            field: 'name',
            headerName: 'Option Name',
            flex: 1.5,
            minWidth: 180,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <ShoppingCartIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'amount',
            headerName: 'Amount',
            flex: 1,
            minWidth: 140,
            renderCell: (params) => (
                <Chip
                    label={formatCurrency(params.value, params.row.currency)}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        color: '#2E7D32',
                        fontWeight: 'bold',
                        borderRadius: '16px',
                        border: '1px solid rgba(76, 175, 80, 0.2)',
                    }}
                />
            ),
        },
        {
            field: 'point',
            headerName: 'Points',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
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
            field: 'currency',
            headerName: 'Currency',
            flex: 0.8,
            minWidth: 100,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <CurrencyExchangeIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{params.value}</Typography>
                </Box>
            ),
        },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => {
                const isActive = params.value === 'ACTIVE';
                return (
                    <Chip
                        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                        label={params.value}
                        size="small"
                        sx={{
                            bgcolor: isActive ? 'rgba(46, 125, 50, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                            color: isActive ? '#2E7D32' : '#D32F2F',
                            fontWeight: 'medium',
                            borderRadius: '16px',
                            border: isActive ? '1px solid rgba(46, 125, 50, 0.2)' : '1px solid rgba(211, 47, 47, 0.2)',
                        }}
                    />
                );
            },
        },
        {
            field: 'action',
            headerName: 'Actions',
            flex: 1.3,
            minWidth: 220,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                const isProcessing = isChangingStatus && selectedPointOptionId === params.row.id;

                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={(event) => {
                                event.stopPropagation();
                                handleOpenEditDialog(params.row);
                            }}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            Edit
                        </Button>

                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={
                                    isProcessing ? <CircularProgress size={20} color="inherit" /> : <BlockIcon />
                                }
                                color="warning"
                                onClick={() => handleChangeStatus(params.row.id)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Disable'}
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={
                                    isProcessing ? <CircularProgress size={20} color="inherit" /> : <LockOpenIcon />
                                }
                                color="success"
                                onClick={() => handleChangeStatus(params.row.id)}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : 'Activate'}
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDeleteConfirmDialog(params.row.id)}
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
                                    Point Option Management
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
                                        Create Point Option
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
                                            Total Options
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {totalOptions}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CategoryIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Purchase Plans
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
                                            Active Options
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {activeOptions}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CheckCircleIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Available for Purchase
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
                                            Highest Points
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {highestPoints}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <TrendingUpIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Maximum Value Option
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
                                            background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                                            border: '1px solid #9FA8DA',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Points per {currency}
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#303F9F" sx={{ mt: 1 }}>
                                            {averagePointsPerMoney}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <MonetizationOnIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Average Conversion Rate
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid> */}
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

                {/* Create Point Option Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <AddIcon color="primary" />
                        Create New Point Option
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                required
                                label="Option Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ShoppingCartIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter package name"
                            />
                            <TextField
                                fullWidth
                                required
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoneyIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter amount in VND"
                            />
                            <TextField
                                fullWidth
                                required
                                label="Points"
                                type="number"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalAtmIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                                placeholder="Enter points value"
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
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreatePointOption}
                            variant="contained"
                            color="primary"
                            disabled={!name || !amount || !point || isCreating}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: '#051D40',
                            }}
                            startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                        >
                            {isCreating ? 'Creating...' : 'Create Option'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Point Option Dialog */}
                <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <EditIcon color="primary" />
                        Edit Point Option
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                required
                                label="Option Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <ShoppingCartIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                required
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <AttachMoneyIcon color="action" />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                fullWidth
                                required
                                label="Points"
                                type="number"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LocalAtmIcon color="action" />
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
                            disabled={isUpdating}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdatePointOption}
                            variant="contained"
                            color="primary"
                            disabled={!name || !amount || !point || isUpdating}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                                bgcolor: '#051D40',
                            }}
                            startIcon={isUpdating ? <CircularProgress size={20} color="inherit" /> : <UpdateIcon />}
                        >
                            {isUpdating ? 'Updating...' : 'Update Option'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1, pb: 1 }}>
                        <DeleteIcon color="error" />
                        Confirm Deletion
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete this point option? This action cannot be undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseDeleteConfirmDialog}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeletePointOption}
                            variant="contained"
                            color="error"
                            disabled={isDeleting}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            startIcon={isDeleting ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
