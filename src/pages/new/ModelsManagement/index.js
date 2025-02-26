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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { getImage } from '~/Constant';
import CardModel from '~/components/CardModel';
import ModelAPI from '~/API/ModelAPI';
import { useNavigate } from 'react-router-dom';
import storageService from '~/components/StorageService/storageService';
import ModelTypeAPI from '~/API/ModelTypeAPI';

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

    const columns = [
        { field: 'modelCode', headerName: 'Model Code', width: 200 },
        { field: 'imageUrl', headerName: 'Image', width: 200 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'modelTypeName', headerName: 'Type', width: 200 },
        { field: 'scale', headerName: 'Scale', width: 200 },
    ];

    // Fetch models on mount
    useEffect(() => {
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
        fetchModels();
    }, [paginationModel, searchParams, isCreating]);

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
        // Reset all form fields
        setName('');
        setDescription('');
        setImage(null);
        setVersion('');
        setScale('');
        setFile3D(null);
        setModelTypeId('');
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
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
        if (!name.trim()) return alert('Please enter a name.');
        if (!code.trim()) return alert('Please enter a code.');
        if (!image) return alert('Please select an image.');
        if (!version.trim()) return alert('Please enter a version.');
        if (!scale.trim()) return alert('Please enter a scale.');
        if (!file3D) return alert('Please select a 3D file.');
        if (!modelTypeId.trim()) return alert('Please enter model type id.');

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
                alert('Model created successfully!');
                setOpenCreateDialog(false);
                // Optionally, refresh the model list here
            }
        } catch (error) {
            console.error('Failed to create model:', error);
            alert('Failed to create model. Please try again.');
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

                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', mt: 3 }}>
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
                            <Paper sx={{ height: 400, width: '100%' }}>
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
                        <Select
                            fullWidth
                            margin="normal"
                            label="Status"
                            value={modelTypeId}
                            onChange={(e) => setModelTypeId(e.target.value)}
                        >
                            {modelTypes.map((data) => (
                                <MenuItem value={data.id}>{data.name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select an image (required):
                    </Typography>
                    <input type="file" accept="image/*" onChange={handleImageSelect} style={{ marginBottom: '8px' }} />
                    {image && <Typography variant="body2">File: {image.name}</Typography>}

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

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select 3D file (required, e.g. .glb):
                    </Typography>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        onChange={handle3DFileSelect}
                        style={{ marginBottom: '8px' }}
                    />
                    {file3D && <Typography variant="body2">File: {file3D.name}</Typography>}

                    {/* <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Model Type ID"
                        value={modelTypeId}
                        onChange={(e) => setModelTypeId(e.target.value)}
                    /> */}
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
        </ThemeProvider>
    );
}
