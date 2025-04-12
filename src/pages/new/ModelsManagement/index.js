import { Delete as DeleteIcon } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CategoryIcon from '@mui/icons-material/Category';
import InfoIcon from '@mui/icons-material/Info';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import DescriptionIcon from '@mui/icons-material/Description';
import CodeIcon from '@mui/icons-material/Code';
import AddIcon from '@mui/icons-material/Add';
import ScaleIcon from '@mui/icons-material/Scale';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import BlockIcon from '@mui/icons-material/Block';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Modal,
    Paper,
    TextField,
    Typography,
    Autocomplete,
    InputAdornment,
    Avatar,
    CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModelAPI from '~/API/ModelAPI';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { getImage } from '~/Constant';
import AdbIcon from '@mui/icons-material/Adb';

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

export default function ModelsManagement() {
    const navigate = useNavigate();
    // Data states
    const [isLoading, setIsLoading] = useState(true);

    // Create Model Dialog state
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form fields for creating a model
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [version, setVersion] = useState('');
    const [scale, setScale] = useState('');
    const [file3D, setFile3D] = useState(null);
    const [modelTypeId, setModelTypeId] = useState('');
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);

    // Add these state variables at the top of the component
    const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
    const [selectedModelId, setSelectedModelId] = useState(null);
    const [statusAction, setStatusAction] = useState('');

    const [rows, setRows] = useState([]);
    const [typeSearch, setTypeSearch] = useState('');
    const [nameSearch, setNameSearch] = useState('');
    const [codeSearch, setCodeSearch] = useState('');
    const [searchParams, setSearchParams] = useState({
        nameSearch: '',
        codeSearch: '',
        machineTypeId: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 10,
    });
    const [total, setTotal] = useState(0);

    const [modelTypes, setModelTypes] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState({});
    const [openUpdateModal, setUpdateOpenModal] = useState(false);
    const [updatedModel, setUpdatedModel] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const [activeModelCount, setActiveModelCount] = useState(0);
    const [inactiveModelCount, setInactiveModelCount] = useState(0);
    const [modelTypeCount, setModelTypeCount] = useState(0);

    const fetchModelCounts = async () => {
        try {
            // In a real app, these would be separate API calls to get counts
            // For this example, we'll calculate from the existing data
            const allModelsResponse = await ModelAPI.getByCompany(userInfo?.company?.id, {
                page: 1,
                size: 1000, // Get all for counting - in a real app, use an API endpoint for counts
            });

            const allModels = allModelsResponse?.result?.objectList || [];
            const activeCount = allModels.filter((model) => model.status === 'ACTIVE').length;
            const inactiveCount = allModels.filter((model) => model.status === 'INACTIVE').length;

            setActiveModelCount(activeCount);
            setInactiveModelCount(inactiveCount);

            // Get machine type count
            const machineTypesResponse = await ModelTypeAPI.getByCompanyId(userInfo?.company?.id);
            setModelTypeCount(machineTypesResponse?.result?.length || 0);
        } catch (error) {
            console.error('Failed to fetch model counts:', error);
        }
    };

    const handleChangeStatus = async () => {
        if (!selectedModelId) return;

        try {
            setIsLoading(true);
            const response = await ModelAPI.changeStatus(selectedModelId);

            if (response?.result) {
                toast.success('Model status changed successfully!', { position: 'top-right' });
                fetchModels();
                fetchModelCounts();
            }
        } catch (error) {
            console.error('Failed to change model status:', error);
            toast.error('Failed to change model status. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoading(false);
            setOpenStatusConfirmDialog(false);
            setSelectedModelId(null);
        }
    };

    const handleOpenConfirmDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
    };

    const handleDeleteModel = async () => {
        setConfirmDeleteOpen(false);
        try {
            setIsLoading(true);

            const response = await ModelAPI.deleteById(selectedModel.id);
            if (response?.result) {
                toast.success('Model deleted successfully!', { position: 'top-right' });
                handleCloseModal();
                fetchModels();
                fetchModelCounts();
            }
        } catch (error) {
            console.error('Failed to delete model:', error);
            toast.error('Failed to delete model. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenStatusConfirm = (modelId, status) => {
        setSelectedModelId(modelId);
        setStatusAction(status);
        setOpenStatusConfirmDialog(true);
    };

    const [openEditor, setOpenEditor] = useState(false);

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setUpdateOpenModal(false);
        setOpenCreateDialog(false);
        fetchModels();
        fetchModelCounts();
    };

    const formatStatus = (status) => {
        if (!status) return ''; // Hoặc giá trị mặc định khác như 'Unknown'
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };
    const columns = [
        {
            field: 'name',
            headerName: 'Model Name',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <DescriptionIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'courseName',
            headerName: 'Guideline',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <InfoIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{params.value || '-'}</Typography>
                </Box>
            ),
        },
        {
            field: 'modelTypeName',
            headerName: 'Machine Type',
            flex: 1,
            minWidth: 180,
            renderCell: (params) => (
                <Chip
                    icon={<CategoryIcon />}
                    label={params.value || '-'}
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
            field: 'status',
            headerName: 'Status',
            width: 130,
            renderCell: (params) => {
                const isActive = params.value === 'ACTIVE';
                return (
                    <Chip
                        icon={isActive ? <CheckCircleIcon /> : <CancelIcon />}
                        label={formatStatus(params.value)}
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
            width: 220,
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
                                handleOpenModal(params.row.id);
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

                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<BlockIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStatusConfirm(params.row.id, 'disable');
                                }}
                                sx={{
                                    bgcolor: 'orange',
                                    color: 'white',
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    '&:hover': {
                                        bgcolor: 'darkorange',
                                    },
                                }}
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<LockOpenIcon />}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenStatusConfirm(params.row.id, 'activate');
                                }}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                }}
                            >
                                Activate
                            </Button>
                        )}
                    </Box>
                );
            },
        },
    ];

    const handleOpenModal = async (id) => {
        try {
            setIsLoading(true);
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setSelectedModel(modelData);
            setOpenModal(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
            toast.error('Failed to load model details', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenUpdateModal = async (id) => {
        try {
            setIsLoading(true);
            setOpenModal(false);
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setUpdatedModel(modelData);
            setUpdateOpenModal(true);
            setOpenEditor(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
            toast.error('Failed to load model for update', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseUpdateModal = () => {
        setUpdateOpenModal(false);
        setSelectedModel({});
        setUpdatedModel({});
        setImageFile(null);
        setModelFile(null);
        fetchModels();
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedModel({});
    };

    const [machineTypes, setMachineTypes] = useState([]);
    const [selectedMachineType, setSelectedMachineType] = useState(null);

    useEffect(() => {
        fetchMachineTypes();
    }, []);

    const fetchMachineTypes = async () => {
        try {
            const response = await ModelTypeAPI.getByCompanyId(userInfo?.company?.id);
            const data = response?.result || [];
            setMachineTypes(data);
        } catch (error) {
            console.log('Failed to fetch machines: ', error);
        }
    };

    const resetFilters = () => {
        setNameSearch('');
        setCodeSearch('');
        setSelectedMachineType(null);
        setSearchParams({
            nameSearch: '',
            codeSearch: '',
            machineTypeId: '',
        });
        // Reset pagination to first page
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
    };

    useEffect(() => {
        fetchModels();
        fetchModelCounts();
    }, [paginationModel, searchParams, isCreating]);

    const fetchModels = async () => {
        try {
            setIsLoading(true);
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;

            const params = {
                page: pageParam,
                size: sizeParam,
                name: searchParams.nameSearch || undefined,
                code: searchParams.codeSearch || undefined,
                type: searchParams.typeSearch || undefined,
                machineTypeId: searchParams.machineTypeId || undefined,
            };
            const response = await ModelAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];

            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch models:', error);
            toast.error('Failed to load models data', { position: 'top-right' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchModelsType = async () => {
            try {
                const response = await ModelTypeAPI.getAllToSelect();
                const data = response?.result?.objectList || [];
                setModelTypes(data);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModelsType();
    }, []);

    const handleCloseCreateDialog = () => {
        setName('');
        setDescription('');
        setCode('');
        setImage(null);
        setVersion('');
        setScale('');
        setFile3D(null);
        setModelTypeId('');
        setOpenCreateDialog(false);
        setOpenEditor(false);
    };

    const handle3DFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
        }
        setName('');
        setCode('');
        setDescription('');
        setImage(null);
        setVersion('');
        setScale('');
        setModelTypeId('');
        setOpenCreateDialog(true);
        setOpenEditor(true);
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
                                        display: 'flex',
                                        alignItems: 'center', // để icon và chữ cùng hàng
                                    }}
                                >
                                    <AdbIcon
                                        sx={{
                                            fontSize: 'inherit',
                                            marginRight: 1,
                                        }}
                                    />
                                    Models Management
                                </Typography>

                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        component="label"
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
                                    >
                                        Create New Model
                                        <input type="file" hidden accept=".glb,.gltf" onChange={handle3DFileSelect} />
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
                                            Total Models
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PrecisionManufacturingIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                3D Model Assets
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
                                            Active Models
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {activeModelCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CheckCircleIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Currently Available
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
                                            Inactive Models
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {inactiveModelCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CancelIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Disabled Content
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
                                            Machine Types
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#303F9F" sx={{ mt: 1 }}>
                                            {modelTypeCount}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CategoryIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Model Categories
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
                                    label="Model Name"
                                    variant="outlined"
                                    value={nameSearch}
                                    onChange={(e) => setNameSearch(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <DescriptionIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by model name"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    options={machineTypes}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedMachineType}
                                    onChange={(event, newValue) => {
                                        setSelectedMachineType(newValue);
                                    }}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Machine Type"
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

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<FilterListIcon />}
                                        onClick={() =>
                                            setSearchParams({
                                                nameSearch,
                                                codeSearch,
                                                typeSearch,
                                                machineTypeId: selectedMachineType ? selectedMachineType.id : '',
                                            })
                                        }
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

                {/* Create Model Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="xl">
                    <DialogTitle sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AddIcon color="primary" />
                        Create New Model
                    </DialogTitle>
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
                    </DialogActions>
                </Dialog>

                {/* Update Model Modal */}
                <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '90vw',
                            maxWidth: '3000px',
                            maxHeight: '90vh',
                            overflowY: 'auto',
                            bgcolor: 'background.paper',
                            borderRadius: '10px',
                            boxShadow: 10,
                            p: 3,
                            textAlign: 'center',
                        }}
                    >
                        {openEditor && (
                            <ModelEditor
                                modelId={updatedModel ? updatedModel?.id : updatedModel}
                                action={'UpdateModelManagement'}
                                handleCloseModal={handleCloseEditor}
                            />
                        )}

                        <Button
                            onClick={handleCloseUpdateModal}
                            variant="contained"
                            color="error"
                            startIcon={<CloseIcon />}
                            sx={{
                                mt: 2,
                                float: 'right',
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                        >
                            Close
                        </Button>
                    </Box>
                </Modal>

                {/* View Model Modal */}
                <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md">
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
                            <PrecisionManufacturingIcon color="primary" />
                            <Typography variant="h6">Model Details</Typography>
                        </Box>
                        <Chip
                            icon={selectedModel.status === 'ACTIVE' ? <CheckCircleIcon /> : <CancelIcon />}
                            label={selectedModel.status ? formatStatus(selectedModel.status) : ''}
                            size="small"
                            sx={{
                                bgcolor:
                                    selectedModel.status === 'ACTIVE'
                                        ? 'rgba(46, 125, 50, 0.1)'
                                        : 'rgba(211, 47, 47, 0.1)',
                                color: selectedModel.status === 'ACTIVE' ? '#2E7D32' : '#D32F2F',
                                fontWeight: 'medium',
                                borderRadius: '16px',
                                border:
                                    selectedModel.status === 'ACTIVE'
                                        ? '1px solid rgba(46, 125, 50, 0.2)'
                                        : '1px solid rgba(211, 47, 47, 0.2)',
                            }}
                        />
                    </DialogTitle>
                    <DialogContent>
                        {isLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Grid container spacing={3} sx={{ mt: 0 }}>
                                {/* Image */}
                                {selectedModel.imageUrl && (
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
                                                Model Image
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    height: '250px',
                                                    border: '1px solid #e0e0e0',
                                                    borderRadius: '8px',
                                                    overflow: 'hidden',
                                                    backgroundColor: '#fff',
                                                }}
                                            >
                                                <img
                                                    src={getImage(selectedModel?.imageUrl)}
                                                    alt={selectedModel.name}
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '100%',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            </Box>
                                        </Paper>
                                    </Grid>
                                )}

                                {/* Model Information */}
                                <Grid item xs={12} md={selectedModel.imageUrl ? 6 : 12}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                            Model Information
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12} sm={6}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Model Name
                                                        </Typography>
                                                        <Typography variant="body1" fontWeight="medium">
                                                            {selectedModel.name}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Model Code
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedModel.modelCode || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Status
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {selectedModel.status === 'ACTIVE' ? (
                                                                <CheckCircleIcon fontSize="small" color="success" />
                                                            ) : (
                                                                <CancelIcon fontSize="small" color="error" />
                                                            )}
                                                            <Typography variant="body1">
                                                                {formatStatus(selectedModel.status)}
                                                            </Typography>
                                                        </Box>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Scale
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedModel.scale || 'N/A'}
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
                                                            {selectedModel.modelTypeName || 'N/A'}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Guideline
                                                        </Typography>
                                                        <Typography variant="body1">
                                                            {selectedModel.courseName || 'Not assigned'}
                                                        </Typography>
                                                    </Box>

                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary">
                                                            Used in Production
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            {selectedModel.isUsed ? (
                                                                <CheckCircleIcon fontSize="small" color="success" />
                                                            ) : (
                                                                <CancelIcon fontSize="small" color="error" />
                                                            )}
                                                            <Typography variant="body1">
                                                                {selectedModel.isUsed ? 'Yes' : 'No'}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>

                                {/* Description */}
                                <Grid item xs={12}>
                                    <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8f9fa', borderRadius: '10px' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" color="#1976d2" gutterBottom>
                                            Description
                                        </Typography>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                                            {selectedModel.description || 'No description provided'}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        {selectedModel.file && (
                            <Button
                                variant="outlined"
                                startIcon={<CloudDownloadIcon />}
                                onClick={() => window.open(getImage(selectedModel.file), '_blank')}
                                sx={{
                                    borderRadius: '8px',
                                    textTransform: 'none',
                                    mr: 'auto',
                                }}
                            >
                                Download Model File
                            </Button>
                        )}

                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => {
                                handleCloseModal();
                                handleOpenUpdateModal(selectedModel.id);
                            }}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            Edit
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={handleOpenConfirmDelete}
                            sx={{
                                borderRadius: '8px',
                                textTransform: 'none',
                            }}
                        >
                            Delete
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<CloseIcon />}
                            onClick={handleCloseModal}
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

                {/* Confirm Status Change Dialog */}
                <Dialog
                    open={openStatusConfirmDialog}
                    onClose={() => setOpenStatusConfirmDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {statusAction === 'disable' ? (
                                <BlockIcon sx={{ color: 'orange', mr: 1 }} />
                            ) : (
                                <LockOpenIcon sx={{ color: 'green', mr: 1 }} />
                            )}
                            {statusAction === 'disable' ? 'Confirm Disable' : 'Confirm Activation'}
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to {statusAction === 'disable' ? 'disable' : 'activate'} this model?
                            {statusAction === 'disable'
                                ? ' This will make the model unavailable for use.'
                                : ' This will make the model available for use.'}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={() => setOpenStatusConfirmDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color={statusAction === 'disable' ? 'warning' : 'success'}
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleChangeStatus}
                            disabled={isLoading}
                            startIcon={
                                isLoading ? (
                                    <CircularProgress size={20} color="inherit" />
                                ) : statusAction === 'disable' ? (
                                    <BlockIcon />
                                ) : (
                                    <LockOpenIcon />
                                )
                            }
                        >
                            {isLoading
                                ? 'Processing...'
                                : statusAction === 'disable'
                                ? 'Yes, Disable'
                                : 'Yes, Activate'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Delete Dialog */}
                <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete} fullWidth maxWidth="xs">
                    <DialogTitle sx={{ fontWeight: 'bold', pb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DeleteIcon sx={{ color: 'error.main', mr: 1 }} />
                            Confirm Deletion
                        </Box>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to delete the model "{selectedModel.name}"? This action cannot be
                            undone.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 3 }}>
                        <Button
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleCloseConfirmDelete}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{
                                textTransform: 'none',
                                borderRadius: '8px',
                            }}
                            onClick={handleDeleteModel}
                            disabled={isLoading}
                            startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                        >
                            {isLoading ? 'Deleting...' : 'Yes, Delete'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
