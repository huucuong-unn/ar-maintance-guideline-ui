import { Delete as DeleteIcon } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModelAPI from '~/API/ModelAPI';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import PaymentAPI from '~/API/PaymentAPI';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { getImage } from '~/Constant';

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

    const [rows, setRows] = useState([]);
    const [typeSearch, setTypeSearch] = useState('');
    const [nameSearch, setNameSearch] = useState('');
    const [codeSearch, setCodeSearch] = useState('');
    const [searchParams, setSearchParams] = useState({
        nameSearch: '',
        codeSearch: '',
        typeSearch: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    const [modelTypes, setModelTypes] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState({});
    const [openUpdateModal, setUpdateOpenModal] = useState(false);
    const [updatedModel, setUpdatedModel] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleCheckIsCurrentPlanIsNull = () => {
        if (userInfo?.currentPlan === null) {
            navigate('/company/payment-subscription-management');
        }
    };
    const [disableCreateModel, setDisableCreateModel] = useState(false);

    const checkCurrentStorageIsOverCurrentPlan = async () => {
        try {
            const response = await SubscriptionAPI.getCompanySubscriptionByCompanyId(userInfo?.company?.id);
            const currentPlan = await PaymentAPI.getCurrentPlanByCompanyId(userInfo?.company?.id);
            if (currentPlan === null || response.result.storageUsage > currentPlan.result.maxStorageUsage) {
                setDisableCreateModel(true);
            }
        } catch (error) {
            console.error('Subscription error:', error);
        }
    };

    useEffect(() => {
        handleCheckIsCurrentPlanIsNull();
        checkCurrentStorageIsOverCurrentPlan();
    }, []);

    const handleOpenConfirmDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
    };

    const handleDeleteModel = async () => {
        setConfirmDeleteOpen(false);
        try {
            console.log(selectedModel.id);

            const response = await ModelAPI.deleteById(selectedModel.id);
            if (response?.result) {
                toast.success('Model deleted successfully!', { position: 'top-right' });
                handleCloseModal();
                fetchModels();
            }
        } catch (error) {
            console.error('Failed to delete model:', error);
            toast.error('Failed to delete model. Please try again.', { position: 'top-right' });
        }
    };

    const [openEditor, setOpenEditor] = useState(false);

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setUpdateOpenModal(false);
        setOpenCreateDialog(false);
        fetchModels();
    };

    const columns = [
        { field: 'modelCode', headerName: 'Model Code', width: 200 },
        { field: 'name', headerName: 'Name', width: 350 },
        { field: 'courseName', headerName: 'Guideline Name', width: 350 },
        {
            field: 'isUsed',
            headerName: 'Is Used',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Yes' : 'No'}
                    style={{
                        backgroundColor: params.value ? 'green' : 'yellow',
                        color: params.value ? 'white' : 'black',
                        fontWeight: 'bold',
                    }}
                />
            ),
        },
        { field: 'status', headerName: 'Status', width: 150 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleOpenUpdateModal(params.row.id);
                    }}
                >
                    Action
                </Button>
            ),
        },
    ];

    const handleOpenModal = async (id) => {
        try {
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setSelectedModel(modelData);
            // setOpenModal(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
        }
    };

    const handleOpenUpdateModal = async (id) => {
        try {
            setOpenModal(false);
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setUpdatedModel(modelData);
            setUpdateOpenModal(true);
            setOpenEditor(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
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

    const handleChange = (e) => {
        setUpdatedModel({ ...updatedModel, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleModelFileUpload = (e) => {
        setModelFile(e.target.files[0]);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedModel({});
    };

    const handleChangeModelType = (selectedId) => {
        const selectedModelType = modelTypes.find((type) => type.id === selectedId);
        setUpdatedModel({
            ...updatedModel,
            modelTypeId: selectedId,
            modelTypeName: selectedModelType ? selectedModelType.name : '',
        });
    };

    const handleSave = async () => {
        if (!updatedModel?.id) {
            console.error('Model ID is required for update.');
            return;
        }

        // Trim spaces
        const trimmedName = updatedModel.name.trim();
        const trimmedCode = updatedModel.modelCode.trim();
        const trimmedVersion = updatedModel.version.trim();
        const trimmedScale = updatedModel.scale.trim();

        // Validate required fields
        if (trimmedName.length < 5 || trimmedName.length > 50) {
            return toast.error('Name must be between 5 and 50 characters.');
        }
        if (trimmedCode.length < 5 || trimmedCode.length > 50) {
            return toast.error('Code must be between 5 and 50 characters.');
        }
        if (!updatedModel.modelTypeId.trim()) {
            return toast.error('Please enter model type.');
        }
        if (parseFloat(trimmedVersion) === 0 || isNaN(trimmedVersion)) {
            return toast.error('Version must be greater than 0.');
        }
        if (parseFloat(trimmedScale) === 0 || isNaN(trimmedScale)) {
            return toast.error('Scale must be greater than 0.');
        }

        setIsUpdating(true);
        try {
            const formDataForUpdate = new FormData();
            formDataForUpdate.append('modelCode', updatedModel.modelCode);
            formDataForUpdate.append('name', updatedModel.name);
            formDataForUpdate.append('description', updatedModel.description || '');
            formDataForUpdate.append('version', updatedModel.version || '');
            formDataForUpdate.append('scale', updatedModel.scale || '');
            formDataForUpdate.append('modelTypeId', updatedModel.modelTypeId || '');
            formDataForUpdate.append('status', updatedModel.status || 'ACTIVE');

            if (imageFile != null && modelFile != null) {
                formDataForUpdate.append('imageUrl', imageFile);
                formDataForUpdate.append('file', modelFile);
            }
            if (modelFile != null && imageFile == null) {
                formDataForUpdate.append('file', modelFile);
            }
            if (imageFile != null && modelFile == null) {
                formDataForUpdate.append('imageUrl', imageFile);
            }
            const response = await ModelAPI.updateModel(updatedModel.id, formDataForUpdate);
            if (response?.result) {
                toast.success('Model updated successfully!', { position: 'top-right' });
                setUpdateOpenModal(false);
                fetchModels();
            }
        } catch (error) {
            console.error('Failed to update model:', error);
            toast.error('Failed to update model. Please try again.', { position: 'top-right' });
        } finally {
            setIsUpdating(false);
        }
    };

    useEffect(() => {
        console.log(updatedModel);
    }, [updatedModel]);

    useEffect(() => {
        fetchModels();
    }, [paginationModel, searchParams, isCreating]);

    const fetchModels = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;

            const params = {
                page: pageParam,
                size: sizeParam,
                name: searchParams.nameSearch || undefined,
                code: searchParams.codeSearch || undefined,
                type: searchParams.typeSearch || undefined,
            };
            const response = await ModelAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            console.log(data);

            setRows(data);

            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchModelsType = async () => {
            try {
                const response = await ModelTypeAPI.getAllToSelect();
                const data = response?.result?.objectList || [];
                console.log(data);

                setModelTypes(data);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModelsType();
    }, []);

    // Dialog handlers
    const handleOpenCreateDialog = () => {
        setName('');
        setCode('');
        setDescription('');
        setImage(null);
        setVersion('');
        setScale('');
        setFile3D(null);
        setModelTypeId('');
        setOpenCreateDialog(true);
        setOpenEditor(true);
    };

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

    const handleImageSelect = (e) => {
        if (e.target.files[0]) {
            setImage(e.target.files[0]);
        }
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

    const handleCreateModel = async () => {
        // Trim spaces
        const trimmedName = name.trim();
        const trimmedCode = code.trim();
        const trimmedVersion = version.trim();
        const trimmedScale = scale.trim();

        // Validate required fields
        if (trimmedName.length < 5 || trimmedName.length > 50) {
            return toast.error('Name must be between 5 and 50 characters.');
        }
        if (trimmedCode.length < 5 || trimmedCode.length > 50) {
            return toast.error('Code must be between 5 and 50 characters.');
        }
        // if (!modelTypeId.trim()) {
        //     return toast.error('Please enter model type.');
        // }
        if (!image) {
            return toast.error('Please select an image.');
        }
        if (parseFloat(trimmedVersion) === 0 || isNaN(trimmedVersion)) {
            return toast.error('Version must be greater than 0.');
        }
        if (parseFloat(trimmedScale) === 0 || isNaN(trimmedScale)) {
            return toast.error('Scale must be greater than 0.');
        }
        if (!file3D) {
            return toast.error('Please select a 3D file.');
        }

        setIsCreating(true);

        try {
            const formData = new FormData();
            formData.append('name', trimmedName);
            formData.append('modelCode', trimmedCode);
            formData.append('description', description);
            formData.append('imageUrl', image);
            formData.append('version', trimmedVersion);
            formData.append('scale', trimmedScale);
            formData.append('file', file3D);
            formData.append('modelTypeId', '0e553950-2a32-44cd-bd53-ed680a00f2e5');
            formData.append('companyId', userInfo?.company?.id);

            const response = await ModelAPI.createModel(formData);
            if (response?.result) {
                toast.success('Model created successfully!', { position: 'top-right' });
                setOpenCreateDialog(false);
            }
        } catch (error) {
            console.error('Failed to create model:', error);
            if (error?.response?.data?.code === 1095) {
                toast.error('Model already exists with this name. Please choose a different name.', {
                    position: 'top-right',
                });
            } else {
                toast.error('Failed to create model. Please try again.', { position: 'top-right' });
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleRedirectToModelView = (modelId) => {
        navigate(`/company/model-management/view/${modelId}`);
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
                <Box sx={{ my: 4 }}>
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
                        Models Management
                    </Typography>
                    <Box sx={{ mb: 4 }}>
                        <Button
                            disabled={disableCreateModel}
                            variant="contained"
                            component="label"
                            sx={{
                                bgcolor: '#02F18D',
                                color: '#051D40',
                                '&:hover': {
                                    bgcolor: '#02F18D',
                                    color: '#051D40',
                                },
                                p: 2,
                            }}
                        >
                            Create Model
                            <input type="file" hidden accept=".glb,.gltf" onChange={handle3DFileSelect} />
                        </Button>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', mt: 8, justifyContent: 'right' }}>
                        {/* Search by email */}
                        <TextField
                            variant="outlined"
                            label="Search by Name"
                            sx={{ width: '300px' }}
                            value={nameSearch}
                            onChange={(e) => setNameSearch(e.target.value)}
                        />
                        <TextField
                            variant="outlined"
                            label="Search by Code"
                            sx={{ width: '300px' }}
                            value={codeSearch}
                            onChange={(e) => setCodeSearch(e.target.value)}
                        />
                        {/* Search button */}
                        <Button
                            variant="contained"
                            onClick={() => setSearchParams({ nameSearch, codeSearch, typeSearch })}
                        >
                            Search
                        </Button>
                    </Box>

                    <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                <Paper sx={{ height: 450, width: '100%' }}>
                                    {' '}
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        rowCount={total}
                                        paginationMode="server"
                                        paginationModel={paginationModel}
                                        onPaginationModelChange={(newModel) => {
                                            setPaginationModel((prev) => ({
                                                ...prev,
                                                page: newModel.page,
                                            }));
                                        }}
                                        sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                        getRowId={(row) => row.id}
                                        slots={{ toolbar: GridToolbar }}
                                        onRowClick={(params) => handleOpenModal(params.row.id)}
                                    />
                                </Paper>

                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
            {/* Create Model Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="xl">
                <DialogTitle>Create New Model</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    {/* <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to create a new model.
                    </DialogContentText>

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description (optional)"
                        multiline
                        minRows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    /> */}

                    {/* Upload Image
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select an image (required):
                    </Typography>
                    {image && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Selected Image"
                                style={{
                                    width: '100%',
                                    maxHeight: '300px',
                                    objectFit: 'contain',
                                    borderRadius: 8,
                                    border: '2px solid #ddd',
                                }}
                            />
                        </Box>
                    )} */}
                    {/* <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                    </Button> */}

                    {/* Upload Model File */}
                    {/* <Typography variant="body2" sx={{ mt: 2 }}>
                        Select 3D file (required, e.g. .glb):
                    </Typography>
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Model File
                        <input type="file" hidden accept=".glb,.gltf" onChange={handle3DFileSelect} />
                    </Button> */}
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

            <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90vw', // Tăng chiều rộng lên 90% màn hình
                        maxWidth: '3000px', // Đảm bảo không quá lớn trên màn hình rộng
                        maxHeight: '90vh', // Giữ chiều cao tối đa
                        overflowY: 'auto', // Bật cuộn nếu nội dung quá dài
                        bgcolor: 'background.paper',
                        borderRadius: '10px',
                        boxShadow: 10,
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    {/* <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Model Code"
                                name="modelCode"
                                value={updatedModel?.modelCode || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={updatedModel?.name || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                    <TextField
                        fullWidth
                        label="Description"
                        name="description"
                        value={updatedModel?.description || ''}
                        onChange={handleChange}
                        margin="normal"
                        multiline
                        rows={3}
                    /> */}

                    {/* <FormControl fullWidth margin="normal">
                        <InputLabel>Status</InputLabel>
                        <Select name="status" value={updatedModel?.status || 'ACTIVE'} onChange={handleChange}>
                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                        </Select>
                    </FormControl>
                    {(imageFile || updatedModel?.imageUrl) && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">Current Image</Typography>
                            <img
                                src={imageFile ? URL.createObjectURL(imageFile) : getImage(updatedModel?.imageUrl)}
                                alt="Model Image"
                                style={{
                                    width: '100%', // Đảm bảo ảnh phù hợp với container
                                    maxWidth: '100%', // Giữ ảnh không bị vỡ
                                    maxHeight: '300px', // Tăng chiều cao tối đa
                                    objectFit: 'contain', // Hiển thị toàn bộ ảnh mà không cắt xén
                                    borderRadius: 8,
                                    border: '2px solid #ddd',
                                }}
                            />
                        </Box>
                    )} */}

                    {/* Upload Image */}
                    {/* <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                        {imageFile && <Typography variant="body2">File: {imageFile.name}</Typography>}
                    </Button> */}

                    {/* Upload Model File */}
                    {/* <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Model File
                        <input type="file" hidden accept=".glb,.gltf" onChange={handleModelFileUpload} />
                        {modelFile && <Typography variant="body2">File: {modelFile.name}</Typography>}
                    </Button> */}

                    {openEditor && (
                        <ModelEditor
                            modelId={updatedModel ? updatedModel?.id : updatedModel}
                            action={'UpdateModelManagement'}
                            handleCloseModal={handleCloseEditor}
                        />
                    )}

                    {/* Nút Save */}
                    {/* <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={handleSave}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <CircularProgress size={24} /> : 'Save'}
                    </Button> */}

                    {/* Nút Close */}
                    <Button
                        onClick={handleCloseUpdateModal}
                        variant="contained"
                        color="error"
                        sx={{ mt: 2, float: 'right' }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 550,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 10,
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    {/* Tiêu đề */}
                    <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                        Model Details
                    </Typography>

                    {/* Nội dung thông tin */}
                    <Card elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <CardContent sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle1">
                                <strong>Model Type:</strong> {selectedModel.modelTypeName}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Model Code:</strong> {selectedModel.modelCode}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Status:</strong>{' '}
                                {selectedModel.status === 'ACTIVE' ? (
                                    <CheckCircleIcon color="success" />
                                ) : (
                                    <CancelIcon color="error" />
                                )}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Name:</strong> {selectedModel.name}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Description:</strong> {selectedModel.description}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Scale:</strong> {selectedModel.scale}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Is Used:</strong> {selectedModel.isUsed ? 'Yes' : 'No'}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Course Name:</strong> {selectedModel.courseName || 'N/A'}
                            </Typography>
                            {selectedModel.imageUrl && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <img
                                        src={getImage(selectedModel?.imageUrl)}
                                        alt="Model"
                                        style={{
                                            width: '100%', // Đảm bảo ảnh chiếm hết chiều ngang container
                                            maxWidth: '100%', // Giữ ảnh không bị vỡ
                                            maxHeight: '300px', // Tăng chiều cao tối đa để hiển thị rõ hơn
                                            objectFit: 'contain', // Giữ nguyên tỉ lệ ảnh, tránh bị cắt
                                            borderRadius: 8,
                                            border: '2px solid #ddd',
                                        }}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Divider sx={{ my: 3 }} />

                    {/* Nút download file */}
                    {selectedModel.file && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<CloudDownloadIcon />}
                            sx={{
                                borderRadius: 2,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #3F51B5, #2196F3)',
                                ':hover': {
                                    background: 'linear-gradient(135deg, #303F9F, #1976D2)',
                                },
                            }}
                            onClick={() => window.open(getImage(selectedModel.file), '_blank')}
                        >
                            Download Model File
                        </Button>
                    )}

                    <Button
                        onClick={handleOpenConfirmDelete}
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<DeleteIcon />}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                            ':hover': {
                                background: 'linear-gradient(135deg, #C62828, #880E4F)',
                            },
                        }}
                    >
                        Delete Model
                    </Button>

                    {/* Nút Close */}
                    <Button
                        onClick={handleCloseModal}
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<CloseIcon />}
                        sx={{ mt: 2, borderRadius: 2, fontSize: '16px', fontWeight: 'bold', textTransform: 'none' }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>

            <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this model? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDelete} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteModel} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
