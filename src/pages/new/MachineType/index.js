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
    Autocomplete,
    InputAdornment,
    Chip,
    Tooltip,
} from '@mui/material';
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import MachineAPI from '~/API/MachineAPI';
import storageService from '~/components/StorageService/storageService';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import MachineTypeAttributeAPI from '~/API/MachineTypeAttributeAPI';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CategoryIcon from '@mui/icons-material/Category';
import DevicesIcon from '@mui/icons-material/Devices';
import TuneIcon from '@mui/icons-material/Tune';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import MachineTypeAPI from '~/API/MachineTypeAPI';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

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

export default function MachineTypeManagement() {
    //user info
    const userInfo = storageService.getItem('userInfo')?.user || null;

    //Fetch Machines Type
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        { field: 'machineTypeName', headerName: 'Name', width: 300 },
        { field: 'numOfAttribute', headerName: 'Number of Attribute', width: 300 },
        { field: 'numOfMachine', headerName: 'Number of Machine', width: 300 },
        {
            field: 'action',
            headerName: 'Action',
            width: 250,
            renderCell: (params) => (
                <EditIcon
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleOpenUpdateMachineTypeModal(params.row.machineTypeId);
                    }}
                    sx={{ cursor: 'pointer' }}
                ></EditIcon>
            ),
        },
    ];

    useEffect(() => {
        fetchMachineTypes();
    }, [paginationModel]);

    const fetchMachineTypes = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                name: searchTerm,
            };
            const response = await MachineTypeAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('Failed to fetch machines type: ', error);
        }
    };

    const handleSearch = () => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        fetchMachineTypes();
    };

    //Create Machine Type
    const [isLoadingCreateMachineType, setIsLoadingCreateMachineType] = useState(false);
    const [openCreateMachineTypeDialog, setOpenCreateMachineTypeDialog] = useState(false);
    const [createMachineTypeRequest, setCreateMachineTypeRequest] = useState({
        companyId: userInfo?.company?.id,
        machineTypeName: '',
        machineTypeAttributeCreationRequestList: [],
    });

    const handleOpenCreateMachineTypeDialog = () => {
        setOpenCreateMachineTypeDialog(true);
    };

    const handleCloseCreateMachineTypeDialog = () => {
        setOpenCreateMachineTypeDialog(false);
        setCreateMachineTypeRequest({
            companyId: userInfo?.company?.id,
            machineTypeName: '',
            machineTypeAttributeCreationRequestList: [],
        });
    };

    const handleAddAttribute = () => {
        setCreateMachineTypeRequest((prev) => ({
            ...prev,
            machineTypeAttributeCreationRequestList: [
                ...prev.machineTypeAttributeCreationRequestList,
                { attributeName: '', attributeValue: '' },
            ],
        }));
    };

    // Xóa attribute theo index
    const handleRemoveAttribute = (index) => {
        setCreateMachineTypeRequest((prev) => ({
            ...prev,
            machineTypeAttributeCreationRequestList: prev.machineTypeAttributeCreationRequestList.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    // Cập nhật giá trị nhập vào attribute
    const handleChangeAttribute = (index, field, value) => {
        setCreateMachineTypeRequest((prev) => {
            const updatedAttributes = [...prev.machineTypeAttributeCreationRequestList];
            updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
            return { ...prev, machineTypeAttributeCreationRequestList: updatedAttributes };
        });
    };

    const handleCreateMachineType = async () => {
        try {
            // Validate Machine Type Name
            if (
                !createMachineTypeRequest.machineTypeName ||
                createMachineTypeRequest.machineTypeName.length < 2 ||
                createMachineTypeRequest.machineTypeName.length > 100
            ) {
                toast.error('Machine Type Name must be between 2 and 100 characters.');
                return;
            }

            // Validate Machine Attributes
            const attrList = createMachineTypeRequest.machineTypeAttributeCreationRequestList;

            if (attrList.length === 0) {
                toast.error('At least one attribute is required.');
                return;
            }

            // Validate each attribute name length
            for (const attr of attrList) {
                if (!attr.attributeName || attr.attributeName.length < 2 || attr.attributeName.length > 100) {
                    toast.error('Each attribute name must be between 2 and 100 characters.');
                    return;
                }
            }

            // ✅ Validate duplicate attribute names
            const nameSet = new Set();
            for (const attr of attrList) {
                const name = attr.attributeName.trim().toLowerCase();
                if (nameSet.has(name)) {
                    toast.error('Attribute names must be unique.');
                    return;
                }
                nameSet.add(name);
            }

            setIsLoadingCreateMachineType(true);

            const response = await MachineTypeAPI.create(createMachineTypeRequest);
            if (response?.result) {
                toast.success('Create machine type successfully');
            }
            fetchMachineTypes();
            handleCloseCreateMachineTypeDialog();
        } catch (error) {
            console.error('Failed to create machine type:', error);
            toast.error(`Create machine type failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateMachineType(false);
        }
    };

    //Update Machine Type
    const [openUpdateMachineTypeDialog, setOpenUpdateMachineTypeDialog] = useState(false);
    const [machineTypeById, setMachineTypeById] = useState({});
    const [updateMachineTypeRequest, setUpdateMachineTypeRequest] = useState({
        machineTypeName: '',
        machineTypeAttributeCreationRequestList: [
            {
                machineTypeAttributeId: '',
                attributeName: '',
                attributeValue: '',
            },
        ],
    });
    const [currentMachineTypeAttributeIdToDelete, setCurrentMachineTypeAttributeIdToDelete] = useState('');
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
    const [isLoadingUpdateMachineType, setIsLoadingUpdateMachineType] = useState(false);

    const handleOpenUpdateMachineTypeModal = async (id) => {
        try {
            const response = await MachineTypeAPI.getById(id);
            const data = response?.result;

            if (data) {
                setMachineTypeById(data);

                setUpdateMachineTypeRequest({
                    machineTypeName: data.machineTypeName || '',
                    machineTypeAttributeCreationRequestList: data.machineTypeAttributeResponses.map((attr) => ({
                        machineTypeAttributeId: attr.id,
                        attributeName: attr.attributeName,
                        attributeValue: attr.valueAttribute,
                    })),
                });
            }

            setOpenUpdateMachineTypeDialog(true);
        } catch (error) {
            console.error('Failed to fetch machine type details:', error);
        }
    };

    const handleCloseUpdateMachineTypeDialog = () => {
        setOpenUpdateMachineTypeDialog(false);
        setMachineTypeById({});
        setUpdateMachineTypeRequest({
            machineTypeName: '',
            machineTypeAttributeCreationRequestList: [
                {
                    machineTypeAttributeId: '',
                    attributeName: '',
                },
            ],
        });
    };

    const handleUpdateMachineType = async () => {
        if (
            !updateMachineTypeRequest.machineTypeName ||
            updateMachineTypeRequest.machineTypeName.length < 2 ||
            updateMachineTypeRequest.machineTypeName.length > 100
        ) {
            toast.error('Machine Type Name must be between 2 and 100 characters.');
            return;
        }

        // Validate Machine Attributes
        const nameSet = new Set();
        for (const attr of updateMachineTypeRequest.machineTypeAttributeCreationRequestList) {
            if (!attr.attributeName || attr.attributeName.length < 2 || attr.attributeName.length > 100) {
                toast.error('Each attribute name must be between 2 and 100 characters.');
                return;
            }

            const trimmedName = attr.attributeName.trim().toLowerCase(); // loại bỏ khoảng trắng và phân biệt hoa thường
            if (nameSet.has(trimmedName)) {
                toast.error('Attribute names must be unique.');
                return;
            }
            nameSet.add(trimmedName);
        }

        if (updateMachineTypeRequest.machineTypeAttributeCreationRequestList.length === 0) {
            toast.error('At least 1 Machine Type Attribute is required to save changes.');
            return;
        }

        setIsLoadingUpdateMachineType(true);

        try {
            const response = await MachineTypeAPI.update(machineTypeById.machineTypeId, updateMachineTypeRequest);
            if (response?.result) {
                toast.success('Update machine type successfully');
            }
            fetchMachineTypes();
            handleCloseUpdateMachineTypeDialog();
        } catch (error) {
            console.error('Failed to Update machine type:', error);
            toast.error(`Update machine type failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingUpdateMachineType(false);
        }
    };

    const handleOpenConfirmDeleteDialog = (attributeId) => {
        setCurrentMachineTypeAttributeIdToDelete(attributeId);
        setOpenConfirmDeleteDialog(true);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false);
        setCurrentMachineTypeAttributeIdToDelete('');
    };

    const handleDeleteAttribute = async () => {
        if (updateMachineTypeRequest.machineTypeAttributeCreationRequestList.length === 1) {
            toast.error('This is the last Machine Type Attribute and cannot be deleted.');
            return;
        }

        try {
            // Nếu attribute cần xóa đã có id (đã được lưu trong database)
            if (currentMachineTypeAttributeIdToDelete) {
                await MachineTypeAttributeAPI.delete(currentMachineTypeAttributeIdToDelete);
                toast.success('Attribute deleted successfully');
            }

            setUpdateMachineTypeRequest((prev) => ({
                ...prev,
                machineTypeAttributeCreationRequestList: prev.machineTypeAttributeCreationRequestList.filter(
                    (attr) => attr.machineTypeAttributeId !== currentMachineTypeAttributeIdToDelete,
                ),
            }));
            handleCloseConfirmDeleteDialog();
        } catch (error) {
            console.error('Failed to delete attribute:', error);
            toast.error(`Delete attribute failed. ${error?.response?.data?.message}`);
        }
    };

    const [openConfirmDeleteMachineTypeDialog, setOpenConfirmDeleteMachineTypeDialog] = useState(false);

    const handleDeleteMachineType = async () => {
        try {
            await MachineTypeAPI.delete(machineTypeById.machineTypeId);
            toast.success('Machine Type deleted successfully');
            setOpenConfirmDeleteMachineTypeDialog(false);
            setOpenUpdateMachineTypeDialog(false);
            fetchMachineTypes();
        } catch (error) {
            console.error('Failed to delete Machine Type:', error);
            toast.error(`Delete Machine Type failed. ${error?.response?.data?.message}`);
        }
    };

    //Show Create Machine Type Help

    const [showMachineTypeCreationHelpDialog, setShowMachineTypeCreationHelpDialog] = useState(false);

    useEffect(() => {
        setShowMachineTypeCreationHelpDialog(true);
    }, []);

    useEffect(() => {
        console.log(searchTerm);
    }, [searchTerm]);

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
                                    Machine Types Management
                                </Typography>

                                <Box>
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
                                        onClick={handleOpenCreateMachineTypeDialog}
                                    >
                                        Create Machine Type
                                    </Button>
                                    <Tooltip title="Machine Type Creation Help">
                                        <IconButton
                                            onClick={() => setShowMachineTypeCreationHelpDialog(true)}
                                            sx={{
                                                ml: 1,
                                                color: '#051D40',
                                            }}
                                        >
                                            <HelpOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
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
                                            Total Machine Types
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CategoryIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Available Types
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
                                            Total Machine
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {rows[0]?.numOfMachineUsing || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <DevicesIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Machines Using Types
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
                                            Company
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="#303F9F"
                                            sx={{
                                                mt: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {userInfo?.company?.companyName || 'N/A'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <BusinessIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Company Infor
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
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Search Machine Type"
                                    variant="outlined"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter machine type name"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
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
                                        Apply Filter
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => {
                                            setSearchTerm('');
                                            setPaginationModel({ page: 0, pageSize: 5 });
                                            // Call the search function with empty search term
                                            handleSearch();
                                        }}
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
                            columns={[
                                {
                                    field: 'machineTypeName',
                                    headerName: 'Machine Type',
                                    flex: 1.5,
                                    minWidth: 200,
                                    renderCell: (params) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center', // Try 'start' instead
                                                height: '100%', // Ensure full height
                                            }}
                                        >
                                            <CategoryIcon
                                                sx={{
                                                    color: '#051D40',
                                                    mr: 1.5,
                                                    opacity: 0.7,
                                                    alignSelf: 'center', // Center the icon vertically
                                                }}
                                            />
                                            <Typography
                                                sx={{
                                                    fontWeight: 'medium',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                }}
                                            >
                                                {params.value}
                                            </Typography>
                                        </Box>
                                    ),
                                },
                                {
                                    field: 'numOfAttribute',
                                    headerName: 'Attributes',
                                    flex: 0.8,
                                    minWidth: 120,
                                    renderCell: (params) => (
                                        <Chip
                                            label={params.row.numOfAttribute || 0}
                                            size="small"
                                            sx={{
                                                bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                color: '#1976d2',
                                                fontWeight: 'medium',
                                                borderRadius: '4px',
                                            }}
                                        />
                                    ),
                                },
                                {
                                    field: 'numOfMachine',
                                    headerName: 'Machines',
                                    flex: 0.8,
                                    minWidth: 120,
                                    renderCell: (params) => {
                                        const count = params.row.numOfMachine || 0;
                                        return (
                                            <Chip
                                                icon={<DevicesIcon />}
                                                label={count}
                                                size="small"
                                                sx={{
                                                    bgcolor:
                                                        count > 0
                                                            ? 'rgba(46, 125, 50, 0.08)'
                                                            : 'rgba(211, 47, 47, 0.08)',
                                                    color: count > 0 ? '#2E7D32' : '#D32F2F',
                                                    fontWeight: 'medium',
                                                }}
                                            />
                                        );
                                    },
                                },
                                // {
                                //     field: 'createdDate',
                                //     headerName: 'Created Date',
                                //     flex: 1,
                                //     minWidth: 180,
                                //     valueFormatter: (params) => {
                                //         if (!params.value) return 'N/A';
                                //         return new Date(params.value).toLocaleDateString('en-US', {
                                //             year: 'numeric',
                                //             month: 'short',
                                //             day: 'numeric',
                                //         });
                                //     },
                                // },
                                {
                                    field: 'action',
                                    headerName: 'Actions',
                                    flex: 1,
                                    minWidth: 160,
                                    renderCell: (params) => (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                height: '100%',
                                                justifyContent: 'flex-start',
                                                gap: 1,
                                            }}
                                        >
                                            <Tooltip title="Edit Machine Type">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleOpenUpdateMachineTypeModal(params.row.machineTypeId);
                                                    }}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                        '&:hover': {
                                                            bgcolor: 'rgba(25, 118, 210, 0.15)',
                                                        },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    ),
                                },
                            ]}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) =>
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }))
                            }
                            disableRowSelectionOnClick
                            autoHeight
                            getRowId={(row) => row.machineTypeId}
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

                {/* Create Machine Type Dialog */}
                <Dialog
                    open={openCreateMachineTypeDialog}
                    onClose={handleCloseCreateMachineTypeDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Create New Machine Type</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {/* Machine Type Name */}
                            <TextField
                                label="Machine Type Name"
                                fullWidth
                                variant="outlined"
                                value={createMachineTypeRequest.machineTypeName}
                                onChange={(e) =>
                                    setCreateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeName: e.target.value,
                                    }))
                                }
                            />
                            {/* Attributes List */}
                            {createMachineTypeRequest.machineTypeAttributeCreationRequestList.map((attr, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    {/* Attribute Name */}
                                    <TextField
                                        label={`Attribute ${index + 1}`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeName}
                                        onChange={(e) => handleChangeAttribute(index, 'attributeName', e.target.value)}
                                    />
                                    :{/* Attribute Value */}
                                    <TextField
                                        label={`Value ${index + 1}`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeValue}
                                        onChange={(e) => handleChangeAttribute(index, 'attributeValue', e.target.value)}
                                    />
                                    {/* Delete Button */}
                                    <IconButton color="error" onClick={() => handleRemoveAttribute(index)}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}

                            {/* Add Attribute Button */}
                            <Button
                                sx={{ textTransform: 'none' }}
                                variant="contained"
                                onClick={handleAddAttribute}
                                fullWidth
                            >
                                Add Attribute
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseCreateMachineTypeDialog}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            onClick={handleCreateMachineType}
                            disabled={isLoadingCreateMachineType}
                        >
                            {isLoadingCreateMachineType ? <CircularProgress /> : ' Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Update Machine Type Dialog */}
                <Dialog
                    open={openUpdateMachineTypeDialog}
                    onClose={handleCloseUpdateMachineTypeDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Machine Type Detail</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {/* Machine Type Name */}
                            <TextField
                                label="Machine Type Name"
                                fullWidth
                                variant="outlined"
                                value={updateMachineTypeRequest.machineTypeName}
                                onChange={(e) =>
                                    setUpdateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeName: e.target.value,
                                    }))
                                }
                            />

                            {/* Machine Type Attributes */}
                            {updateMachineTypeRequest.machineTypeAttributeCreationRequestList.map((attr, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    {/* Attribute Name */}
                                    <TextField
                                        label={`Attribute ${index + 1} Name`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeName}
                                        onChange={(e) => {
                                            const newAttributes = [
                                                ...updateMachineTypeRequest.machineTypeAttributeCreationRequestList,
                                            ];
                                            newAttributes[index] = {
                                                ...newAttributes[index],
                                                attributeName: e.target.value,
                                            };
                                            setUpdateMachineTypeRequest((prev) => ({
                                                ...prev,
                                                machineTypeAttributeCreationRequestList: newAttributes,
                                            }));
                                        }}
                                    />

                                    {/* Attribute Value */}
                                    <TextField
                                        label={`Attribute ${index + 1} Value`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeValue}
                                        onChange={(e) => {
                                            const newAttributes = [
                                                ...updateMachineTypeRequest.machineTypeAttributeCreationRequestList,
                                            ];
                                            newAttributes[index] = {
                                                ...newAttributes[index],
                                                attributeValue: e.target.value,
                                            };
                                            setUpdateMachineTypeRequest((prev) => ({
                                                ...prev,
                                                machineTypeAttributeCreationRequestList: newAttributes,
                                            }));
                                        }}
                                    />

                                    {/* Delete / Remove Button */}
                                    {attr.machineTypeAttributeId !== '' ? (
                                        <IconButton
                                            color="error"
                                            onClick={() => handleOpenConfirmDeleteDialog(attr.machineTypeAttributeId)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    ) : (
                                        <IconButton
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                setUpdateMachineTypeRequest((prev) => ({
                                                    ...prev,
                                                    machineTypeAttributeCreationRequestList:
                                                        prev.machineTypeAttributeCreationRequestList.filter(
                                                            (_, i) => i !== index,
                                                        ),
                                                }));
                                            }}
                                        >
                                            <Delete />
                                        </IconButton>
                                    )}
                                </Box>
                            ))}

                            {/* Nút Add Attribute */}
                            <Button
                                variant="contained"
                                color="primary"
                                sx={{ textTransform: 'none' }}
                                onClick={() => {
                                    setUpdateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeAttributeCreationRequestList: [
                                            ...prev.machineTypeAttributeCreationRequestList,
                                            { machineTypeAttributeId: '', attributeName: '' },
                                        ],
                                    }));
                                }}
                            >
                                Add Attribute
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseUpdateMachineTypeDialog}>
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            sx={{ textTransform: 'none' }}
                            onClick={handleUpdateMachineType}
                            disabled={isLoadingUpdateMachineType}
                        >
                            {isLoadingUpdateMachineType ? <CircularProgress /> : 'Save Changes'}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ textTransform: 'none' }}
                            onClick={() => setOpenConfirmDeleteMachineTypeDialog(true)}
                        >
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Confirm Delete Attribute */}
                <Dialog open={openConfirmDeleteDialog} onClose={handleCloseConfirmDeleteDialog}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this attribute?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDeleteDialog}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteAttribute}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Confirm Delete Machine Type */}
                <Dialog
                    open={openConfirmDeleteMachineTypeDialog}
                    onClose={() => setOpenConfirmDeleteMachineTypeDialog(false)}
                >
                    <DialogTitle>Confirm Delete Machine Type</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this Machine Type? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmDeleteMachineTypeDialog(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteMachineType}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Machine Type Creation Help Dialog */}
                <Dialog
                    open={showMachineTypeCreationHelpDialog}
                    onClose={() => setShowMachineTypeCreationHelpDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2,
                        },
                    }}
                >
                    <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#051D40', pb: 1 }}>
                        Machine Type Creation Guide
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Step 1: Name Your Machine Type
                            </Typography>
                            <Typography paragraph>
                                Create a unique and descriptive name for the machine type that clearly represents the
                                category of machines you are defining.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Step 2: Add Attributes for Machine Type
                            </Typography>
                            <Typography paragraph>
                                Define the specific attributes that characterize this machine type. These attributes
                                will help in distinguishing and categorizing machines more precisely.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                Important Note:
                            </Typography>
                            <Typography component="div">
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Unique Machine Type Name:
                                        </Typography>
                                        <Typography paragraph>
                                            The name of the Machine Type must be unique and cannot duplicate any
                                            existing Machine Type in the system. Ensure you choose a distinctive name to
                                            avoid conflicts.
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, pt: 1 }}>
                        <Button
                            onClick={() => setShowMachineTypeCreationHelpDialog(false)}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                px: 4,
                                backgroundColor: '#0f6cbf',
                                '&:hover': {
                                    backgroundColor: '#0a5ca8',
                                },
                            }}
                        >
                            Got It
                        </Button>
                    </Box>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
