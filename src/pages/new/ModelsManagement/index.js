import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography,
    Grid,
    Paper,
    Skeleton,
    Modal,
    Chip,
    Divider,
    Card,
    CardContent,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { getImage } from '~/Constant';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import ModelAPI from '~/API/ModelAPI';
import { useNavigate } from 'react-router-dom';
import storageService from '~/components/StorageService/storageService';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©Tortee '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function ModelsManagement() {
    const navigate = useNavigate();
    // Data states
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    const columns = [
        { field: 'modelCode', headerName: 'Model Code', width: 200 },
        { field: 'name', headerName: 'Name', width: 150 },
        { field: 'modelTypeName', headerName: 'Type', width: 180 },
        { field: 'courseName', headerName: 'Course Name', width: 200 },
        {
            field: 'isUsed',
            headerName: 'Is Used',
            width: 80,
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
                    Update
                </Button>
            ),
        },
    ];

    const handleOpenModal = async (id) => {
        try {
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setSelectedModel(modelData);
            setOpenModal(true);
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

        if (!updatedModel.name.trim()) return toast.error('Please enter a name.');
        if (!updatedModel.modelCode.trim()) return toast.error('Please enter a code.');
        if (!updatedModel.modelTypeId.trim()) return toast.error('Please enter model type.');
        if (!updatedModel.version.trim()) return toast.error('Please enter a version.');
        if (!updatedModel.scale.trim()) return toast.error('Please enter a scale.');

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
    };

    const handleCreateModel = async () => {
        // Validate required fields
        if (!name.trim()) return toast.error('Please enter a name.');
        if (!code.trim()) return toast.error('Please enter a code.');
        if (!modelTypeId.trim()) return toast.error('Please enter model type.');
        if (!image) return toast.error('Please select an image.');
        if (!version.trim()) return toast.error('Please enter a version.');
        if (!scale.trim()) return toast.error('Please enter a scale.');
        if (!file3D) return toast.error('Please select a 3D file.');

        setIsCreating(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('modelCode', code);
            formData.append('description', description);
            formData.append('imageUrl', image);
            formData.append('version', version);
            formData.append('scale', scale);
            formData.append('file', file3D);
            formData.append('modelTypeId', modelTypeId);
            formData.append('companyId', userInfo?.company?.id);

            const response = await ModelAPI.createModel(formData);
            if (response?.result) {
                toast.success('Model created successfully!', { position: 'top-right' });
                setOpenCreateDialog(false);
            }
        } catch (error) {
            console.error('Failed to create model:', error);
            toast.error('Failed to create model. Please try again.', { position: 'top-right' });
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
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: '900',
                        fontSize: '46px',
                        color: '#051D40',
                        // zIndex: 1,
                        position: 'absolute',
                        top: '3%',
                        left: '20%',
                    }}
                >
                    Models
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', mt: 8 }}>
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
                    <TextField
                        variant="outlined"
                        label="Search by Type"
                        sx={{ width: '300px' }}
                        value={typeSearch}
                        onChange={(e) => setTypeSearch(e.target.value)}
                    />

                    {/* Search button */}
                    <Button
                        variant="contained"
                        sx={{ ml: 'auto' }}
                        onClick={() => setSearchParams({ nameSearch, codeSearch, typeSearch })}
                    >
                        Search
                    </Button>
                    <Button variant="contained" sx={{ ml: 'auto' }} onClick={handleOpenCreateDialog}>
                        Create
                    </Button>
                </Box>

                <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '90%' }}>
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
            </Grid>
            {/* Create Model Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                <DialogTitle>Create New Model</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
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
                    />

                    <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
                        <InputLabel>Type</InputLabel>
                        <Select fullWidth value={modelTypeId} onChange={(e) => setModelTypeId(e.target.value)}>
                            {modelTypes.map((data) => (
                                <MenuItem key={data.id} value={data.id}>
                                    {data.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Upload Image */}
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
                    )}
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleImageSelect} />
                    </Button>

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Scale"
                        value={scale}
                        onChange={(e) => setScale(e.target.value)}
                    />

                    {/* Upload Model File */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
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
                    </Button>
                    {file3D && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            File: {file3D.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateModel} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 500,
                        maxHeight: '80vh', // Giới hạn chiều cao tối đa
                        overflowY: 'auto', // Bật cuộn dọc nếu nội dung quá dài
                        bgcolor: 'background.paper',
                        borderRadius: '10px',
                        boxShadow: 10,
                        p: 4,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" color="primary" gutterBottom>
                        ✏️ Update Model
                    </Typography>

                    <Grid container spacing={2}>
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
                    />
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Model Type</InputLabel>
                        <Select
                            value={updatedModel?.modelTypeId || ''}
                            onChange={(e) => handleChangeModelType(e.target.value)}
                        >
                            {modelTypes.map((data) => (
                                <MenuItem key={data.id} value={data.id}>
                                    {data.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Version"
                                name="version"
                                value={updatedModel?.version || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <TextField
                                fullWidth
                                label="Scale"
                                name="scale"
                                value={updatedModel?.scale || ''}
                                onChange={handleChange}
                                margin="normal"
                            />
                        </Grid>
                    </Grid>
                    <FormControl fullWidth margin="normal">
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
                    )}

                    {/* Upload Image */}
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                        {imageFile && <Typography variant="body2">File: {imageFile.name}</Typography>}
                    </Button>

                    {/* Upload Model File */}
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Model File
                        <input type="file" hidden accept=".glb,.gltf" onChange={handleModelFileUpload} />
                        {modelFile && <Typography variant="body2">File: {modelFile.name}</Typography>}
                    </Button>

                    {/* Nút Save */}
                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        sx={{ mt: 3 }}
                        onClick={handleSave}
                        disabled={isUpdating}
                    >
                        {isUpdating ? <CircularProgress size={24} /> : 'Save'}
                    </Button>

                    {/* Nút Close */}
                    <Button onClick={handleCloseUpdateModal} variant="contained" color="error" fullWidth sx={{ mt: 2 }}>
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
                                <strong>Version:</strong> {selectedModel.version}
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

                            {/* Hiển thị ảnh */}
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
        </ThemeProvider>
    );
}
