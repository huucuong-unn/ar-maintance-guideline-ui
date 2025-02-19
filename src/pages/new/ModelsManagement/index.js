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
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { getImage } from '~/Constant';
import CardModel from '~/components/CardModel';
import ModelAPI from '~/API/ModelAPI';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

export default function ModelsManagement() {
    const navigate = useNavigate();

    const mockModels = [
        {
            id: 1,
            name: 'Mechanical Gear Model',
            description:
                'A high-detail 3D model of an industrial gear, ideal for automotive and machinery simulations.',
            image: 'mechanic-gear.jpg',
            version: 'v1.0',
            scale: '1:10',
            modelTypeId: 'gear-model',
            status: 'ACTIVE',
        },
        {
            id: 2,
            name: 'Engine Assembly Model',
            description: 'A complete 3D engine assembly model that includes all the main components and parts.',
            image: 'engine-assembly.jpg',
            version: 'v2.1',
            scale: '1:5',
            modelTypeId: 'engine-model',
            status: 'ACTIVE',
        },
        {
            id: 3,
            name: 'Suspension System Model',
            description:
                "Detailed 3D representation of a vehicle's suspension system with realistic parts and mechanics.",
            image: 'suspension-system.jpg',
            version: 'v1.3',
            scale: '1:8',
            modelTypeId: 'suspension-model',
            status: 'INACTIVE',
        },
        {
            id: 4,
            name: 'Transmission System Model',
            description: 'A comprehensive 3D model of a transmission system designed for heavy vehicles.',
            image: 'transmission-system.jpg',
            version: 'v1.0',
            scale: '1:7',
            modelTypeId: 'transmission-model',
            status: 'ACTIVE',
        },
    ];
    // Data states
    const [models, setModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Create Model Dialog state
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form fields for creating a model
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [version, setVersion] = useState('');
    const [scale, setScale] = useState('');
    const [file3D, setFile3D] = useState(null);
    const [modelTypeId, setModelTypeId] = useState('');
    const [status, setStatus] = useState('ACTIVE');

    // Fetch models on mount
    useEffect(() => {
        const fetchModels = async () => {
            try {
                // const response = await ModelAPI.getModels();
                // // Assuming response is an array and we need to add an 'id' field for mapping:
                // response.forEach((item, index) => (item.id = index + 1));
                // setModels(response);
                setModels(mockModels);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModels();
    }, []);

    // Local search filtering
    const filteredModels = models.filter((model) => model.name.toLowerCase().includes(searchTerm.toLowerCase()));

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
        setStatus('ACTIVE');
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
        if (!image) return alert('Please select an image.');
        if (!version.trim()) return alert('Please enter a version.');
        if (!scale.trim()) return alert('Please enter a scale.');
        if (!file3D) return alert('Please select a 3D file.');
        if (!modelTypeId.trim()) return alert('Please enter model type id.');
        if (!status.trim()) return alert('Please enter status (e.g. ACTIVE).');

        setIsCreating(true);

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('image', image);
            formData.append('version', version);
            formData.append('scale', scale);
            formData.append('file', file3D);
            formData.append('modelTypeId', modelTypeId);
            formData.append('status', status);

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
        navigate(`/company/model-management/view`);
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box
                sx={{
                    backgroundImage: `url(${adminLoginBackground})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    width: '100%',
                    padding: '5%',
                }}
            >
                {/* Page Heading */}
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: '46px', color: '#051D40', mb: 3 }}>
                    Models Management
                </Typography>

                {/* Search & Create Row */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <TextField
                        variant="outlined"
                        label="Search by Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: '300px' }}
                    />
                    <Button variant="contained" sx={{ ml: 'auto' }} onClick={handleOpenCreateDialog}>
                        Create Model
                    </Button>
                </Box>

                {/* Models Cards Grid */}
                <Box sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', py: 4, px: 2 }}>
                    {isLoading ? (
                        <Typography>Loading...</Typography>
                    ) : (
                        <Grid container spacing={3}>
                            {filteredModels.map((model) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    lg={3}
                                    key={model.id}
                                    onClick={() => handleRedirectToModelView(model.id)}
                                >
                                    <CardModel model={model} onClick />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

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
                            label="Description (optional)"
                            multiline
                            minRows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />

                        <Typography variant="body2" sx={{ mt: 2 }}>
                            Select an image (required):
                        </Typography>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ marginBottom: '8px' }}
                        />
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

                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Model Type ID"
                            value={modelTypeId}
                            onChange={(e) => setModelTypeId(e.target.value)}
                        />

                        <TextField
                            fullWidth
                            margin="normal"
                            required
                            label="Status"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                        />
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
            </Box>
        </ThemeProvider>
    );
}
