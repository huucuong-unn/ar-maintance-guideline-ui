import React, { useState, useEffect } from 'react';
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
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    Autocomplete,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import InfoIcon from '@mui/icons-material/Info';

// Import your API services
import CourseAPI from '~/API/CourseAPI';
import MachineTypeAPI from '~/API/MachineTypeAPI';
import ModelAPI from '~/API/ModelAPI';
import storageService from '~/components/StorageService/storageService';
import CoursesControlEdit from '../CoursesControlEdit';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { getImage } from '~/Constant';
import ServicePriceAPI from '~/API/ServicePriceAPI';
import { set } from 'date-fns';

const defaultTheme = createTheme();

// Create a TabPanel component for the tabs
function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`guideline-tabpanel-${index}`}
            aria-labelledby={`guideline-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function GuidelineCreation() {
    const navigate = useNavigate();
    const { id: guidelineId } = useParams();
    console.log(guidelineId);

    const isEditing = !!guidelineId;

    // Tab state
    const [tabValue, setTabValue] = useState(0);
    const [isTab2Enabled, setIsTab2Enabled] = useState(isEditing); // Enable tab 2 if editing

    // Track if this is the first time tab 2 is being accessed
    const [isFirstTimeTab2, setIsFirstTimeTab2] = useState(true);

    // User information
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);

    // Form states
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [type, setType] = useState('Training');
    const [isMandatory, setIsMandatory] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Machine type and model states
    const [machineTypes, setMachineTypes] = useState([]);
    const [selectedMachineType, setSelectedMachineType] = useState(null);
    const [models, setModels] = useState([]);
    const [selectedModel, setSelectedModel] = useState('');

    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMachineTypes, setIsLoadingMachineTypes] = useState(true);
    const [isLoadingModels, setIsLoadingModels] = useState(false);
    const [isLoadingGuideline, setIsLoadingGuideline] = useState(isEditing);
    const [pointConsume, setPointConsume] = useState(0); // Points consumption for creating instructions

    // Help dialog
    const [showHelpDialog, setShowHelpDialog] = useState(false);

    // Points system dialog
    const [showPointsInfo, setShowPointsInfo] = useState(false);

    // Snackbar
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'info',
    });

    //Load machine types on component mount
    useEffect(() => {
        fetchMachineTypes();
        if (isEditing) {
            fetchGuidelineData();
        }
    }, []);
    const getConsumePoints = async () => {
        const reponse = await ServicePriceAPI.getServicePriceById('4c7346ab-e985-4933-9d96-35936935b4a6');

        setPointConsume(reponse?.result?.price);
    };

    useEffect(() => {
        getConsumePoints();
    }, []);

    // Effect to show help dialog when switching to tab 2 for the first time
    useEffect(() => {
        if (tabValue === 1 && isFirstTimeTab2) {
            setShowHelpDialog(true);
            setIsFirstTimeTab2(false);
        }
    }, [tabValue, isFirstTimeTab2]);

    // Fetch guideline data when editing
    const fetchGuidelineData = async () => {
        try {
            setIsLoadingGuideline(true);
            const response = await CourseAPI.getById(guidelineId);
            if (response?.result) {
                const guideline = response.result;
                setTitle(guideline.title || '');
                setDescription(guideline.description || '');
                setStatus(guideline.status || 'ACTIVE');
                setType(guideline.type || 'Training');
                setIsMandatory(guideline.isMandatory || false);

                if (guideline.imageUrl) {
                    setImagePreview(guideline.imageUrl);
                }

                // Handle machine type and model
                if (guideline.machineTypeId) {
                    const machineTypeResponse = await MachineTypeAPI.getById(guideline.machineTypeId);
                    if (machineTypeResponse?.result) {
                        setSelectedMachineType(machineTypeResponse.result);
                        await fetchModelsByMachineType(machineTypeResponse.result.machineTypeId);
                    }
                }

                if (guideline.modelId) {
                    setSelectedModel(guideline.modelId);
                }
            }
        } catch (error) {
            console.error('Failed to fetch guideline:', error);
            showToast('Failed to load guideline data', 'error');
        } finally {
            setIsLoadingGuideline(false);
        }
    };

    // Fetch machine types
    const fetchMachineTypes = async () => {
        try {
            setIsLoadingMachineTypes(true);
            const response = await MachineTypeAPI.getByCompany(userInfo?.company?.id);
            const data = response?.result?.objectList || [];
            setMachineTypes(data);
        } catch (error) {
            console.error('Failed to fetch machine types:', error);
            showToast('Failed to load machine types', 'error');
        } finally {
            setIsLoadingMachineTypes(false);
        }
    };

    // Fetch models when machine type is selected
    const fetchModelsByMachineType = async (machineTypeId) => {
        if (!machineTypeId) return;

        try {
            setIsLoadingModels(true);
            const response = await ModelAPI.getByMachineTypeIdAndCompanyId(machineTypeId, userInfo?.company?.id);
            const data = response?.result || [];
            setModels(data);
        } catch (error) {
            console.error('Failed to fetch models:', error);
            showToast('Failed to load models', 'error');
        } finally {
            setIsLoadingModels(false);
        }
    };

    // Handle machine type selection
    const handleSelectMachineType = async (event, value) => {
        setSelectedMachineType(value);
        setSelectedModel('');
        setModels([]);

        if (value) {
            await fetchModelsByMachineType(value.machineTypeId);
        }
    };

    // Handle image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showToast('Please select a valid image file', 'error');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    // Handle tab change
    const handleTabChange = (event, newValue) => {
        if (newValue === 1 && !isTab2Enabled) {
            showToast('Please save the guideline information first', 'info');
            return;
        }
        setTabValue(newValue);
    };

    // Show toast/snackbar message
    const showToast = (message, severity = 'info') => {
        setSnackbar({
            open: true,
            message,
            severity,
        });
    };

    // Validate form - simplified to match CourseControl logic
    const validateForm = () => {
        if (title.trim().length < 5 || title.trim().length > 50) {
            showToast('Title must be between 5 and 50 characters', 'error');
            return false;
        }

        if (description.trim().length < 10 || description.trim().length > 200) {
            showToast('Description must be between 10 and 200 characters', 'error');
            return false;
        }

        if (!selectedMachineType) {
            showToast('Please select a machine type', 'error');
            return false;
        }

        if (!selectedModel) {
            showToast('Please select a model', 'error');
            return false;
        }

        if (!isEditing && !selectedImage) {
            showToast('Please select an image', 'error');
            return false;
        }

        return true;
    };

    // Create or update guideline
    const handleSaveGuideline = async () => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('title', title.trim());
            formData.append('description', description.trim());
            formData.append('status', status);
            formData.append('type', type);
            formData.append('isMandatory', isMandatory);
            formData.append('companyId', userInfo?.company?.id);

            if (selectedImage) {
                formData.append('imageUrl', selectedImage);
            }

            formData.append('modelId', selectedModel);

            let response;

            if (isEditing) {
                // Update existing guideline
                console.log(guidelineId);

                response = await CourseAPI.update(guidelineId, formData);
                if (response?.result) {
                    showToast('Guideline updated successfully', 'success');
                }
            } else {
                // Create new guideline
                response = await CourseAPI.create(formData);
                if (response?.result) {
                    showToast('Guideline created successfully', 'success');
                    // Enable tab 2 and navigate to edit mode
                    setIsTab2Enabled(true);
                    setTabValue(1);
                    // Update URL to edit mode (without page refresh)
                    navigate(`/company/guideline/create/${response.result.id}`, { replace: true });
                }
            }
        } catch (error) {
            console.error('Failed to save guideline:', error);
            showToast('Failed to save guideline. Please try again.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    // Close snackbar
    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Go back to guidelines list
    const handleCancel = () => {
        navigate('/company/guideline');
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Box
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    width: '100%',
                    padding: '3%',
                    backgroundImage: `url(${adminLoginBackground})`,
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '32px',
                            color: '#051D40',
                            textAlign: 'left',
                            flexGrow: 1,
                        }}
                    >
                        {isEditing ? 'Edit Guideline' : 'Create New Guideline'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {/* Information about points usage */}
                        <Button
                            variant="outlined"
                            onClick={() => setShowPointsInfo(true)}
                            startIcon={<InfoIcon />}
                            sx={{
                                mr: 2,
                                textTransform: 'none',
                                borderRadius: 1.5,
                            }}
                        >
                            Points Info
                        </Button>
                        <Tooltip title="View guideline creation help">
                            <IconButton color="primary" onClick={() => setShowHelpDialog(true)} sx={{ ml: 1 }}>
                                <HelpOutlineIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                <Paper
                    sx={{
                        width: '100%',
                        mb: 2,
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        overflow: 'hidden',
                    }}
                >
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <Tabs
                            value={tabValue}
                            onChange={handleTabChange}
                            aria-label="guideline creation tabs"
                            sx={{
                                '& .MuiTab-root': {
                                    textTransform: 'none',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    py: 2,
                                },
                                '& .Mui-selected': {
                                    color: '#0f6cbf',
                                },
                                '& .MuiTabs-indicator': {
                                    backgroundColor: '#0f6cbf',
                                },
                            }}
                        >
                            <Tab
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                        <Typography>Guideline Information</Typography>
                                        {!isTab2Enabled && (
                                            <Tooltip title="Complete this step first">
                                                <InfoIcon color="error" sx={{ ml: 1, fontSize: 16 }} />
                                            </Tooltip>
                                        )}
                                    </Box>
                                }
                            />
                            <Tab label="Guideline Instruction" disabled={!isTab2Enabled} />
                        </Tabs>
                    </Box>

                    {/* Tab 1: Guideline Information */}
                    <TabPanel value={tabValue} index={0}>
                        {isLoadingGuideline ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <Box component="form" noValidate sx={{ mt: 1, p: { xs: 2, md: 4 } }}>
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="title"
                                            label="Guideline Title"
                                            name="title"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            helperText="Title must be between 5-50 characters"
                                            InputProps={{
                                                sx: { borderRadius: 1.5 },
                                            }}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Autocomplete
                                            id="machine-type"
                                            options={machineTypes}
                                            getOptionLabel={(option) => option.machineTypeName || ''}
                                            value={selectedMachineType}
                                            onChange={handleSelectMachineType}
                                            loading={isLoadingMachineTypes}
                                            disabled={Boolean(guidelineId)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    required
                                                    label="Machine Type"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        sx: { borderRadius: 1.5 },
                                                        endAdornment: (
                                                            <>
                                                                {isLoadingMachineTypes ? (
                                                                    <CircularProgress color="inherit" size={20} />
                                                                ) : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        ),
                                                    }}
                                                />
                                            )}
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <FormControl fullWidth required>
                                            <InputLabel id="model-label">Model</InputLabel>
                                            <Select
                                                labelId="model-label"
                                                id="model"
                                                value={selectedModel}
                                                label="Model"
                                                onChange={(e) => setSelectedModel(e.target.value)}
                                                // disabled={isLoadingModels || models.length === 0}
                                                disabled={Boolean(guidelineId)}
                                                sx={{ borderRadius: 1.5 }}
                                            >
                                                {models.map((model) => (
                                                    <MenuItem key={model.id} value={model.id}>
                                                        {model.name}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>

                                    <Grid item xs={12}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            style={{ display: 'none' }}
                                            id="image-upload"
                                            onChange={handleImageUpload}
                                        />
                                        <label htmlFor="image-upload">
                                            <Button
                                                variant="outlined"
                                                component="span"
                                                fullWidth
                                                sx={{
                                                    p: 2,
                                                    border: '2px dashed #ccc',
                                                    textTransform: 'none',
                                                    mb: 2,
                                                    borderRadius: 1.5,
                                                    height: '100px',
                                                    color: '#0f6cbf',
                                                    ':hover': {
                                                        border: '2px dashed #0f6cbf',
                                                    },
                                                }}
                                            >
                                                {imagePreview ? 'Change Image' : 'Upload Image'}
                                            </Button>
                                        </label>

                                        {imagePreview && (
                                            <Box
                                                sx={{
                                                    mt: 2,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    alignItems: 'center',
                                                    border: '1px solid #eee',
                                                    borderRadius: 1.5,
                                                    overflow: 'hidden',
                                                    height: '200px',
                                                }}
                                            >
                                                <img
                                                    src={
                                                        imagePreview.startsWith('blob:')
                                                            ? imagePreview
                                                            : getImage(imagePreview)
                                                    }
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: '100%',
                                                        maxHeight: '200px',
                                                        objectFit: 'contain',
                                                    }}
                                                />
                                            </Box>
                                        )}
                                    </Grid>

                                    <Grid item xs={12}>
                                        <TextField
                                            required
                                            fullWidth
                                            id="description"
                                            label="Short Description"
                                            name="description"
                                            multiline
                                            rows={4}
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            helperText="Description must be between 10-200 characters"
                                            InputProps={{
                                                sx: { borderRadius: 1.5 },
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4, gap: 2 }}>
                                    <Button
                                        variant="outlined"
                                        onClick={handleCancel}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 1.5,
                                            px: 3,
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={handleSaveGuideline}
                                        disabled={isLoading}
                                        sx={{
                                            textTransform: 'none',
                                            borderRadius: 1.5,
                                            px: 3,
                                            backgroundColor: '#0f6cbf',
                                            '&:hover': {
                                                backgroundColor: '#0a5ca8',
                                            },
                                        }}
                                    >
                                        {isLoading ? (
                                            <CircularProgress size={24} />
                                        ) : isEditing ? (
                                            'Update Guideline'
                                        ) : (
                                            'Create Guideline'
                                        )}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </TabPanel>

                    {/* Tab 2: CoursesControlEdit component */}
                    <TabPanel value={tabValue} index={1}>
                        {isTab2Enabled && guidelineId && <CoursesControlEdit />}
                    </TabPanel>
                </Paper>

                {/* Help Dialog */}
                <Dialog
                    open={showHelpDialog}
                    onClose={() => setShowHelpDialog(false)}
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
                        Guideline Creation Guide
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Step 1: Create Basic Information
                            </Typography>
                            <Typography paragraph>
                                Fill in all the required fields to set up your guideline. This includes the title,
                                machine type, model, status, and a short description that summarizes what this guideline
                                is for.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Step 2: Create Instruction Detail
                            </Typography>
                            <Typography paragraph>
                                After saving the basic information, you'll be able to access the Instruction tab where
                                you can add detailed steps based on the 3D model. Each instruction detail should provide
                                clear guidance for a specific action.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Step 3: Publish Your Guideline
                            </Typography>
                            <Typography paragraph>
                                Once you've completed all necessary instructions, you can set the status to "Active" to
                                publish your guideline and make it available to employees. Remember that each
                                instruction detail will consume {pointConsume} points from your account balance.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                Important Information:
                            </Typography>
                            <Typography component="div">
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                                            Machine & Model Selection:
                                        </Typography>
                                        <Typography paragraph>
                                            Select the appropriate machine type and model to ensure your guideline is
                                            correctly associated with the right equipment.
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Image Upload:</Typography>
                                        <Typography paragraph>
                                            The image you upload will be displayed on the guideline card in the main
                                            dashboard, helping users identify the guideline visually.
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Points System:</Typography>
                                        <Typography paragraph>
                                            Creating detailed instructions uses points from your company account. Make
                                            sure you have sufficient points before starting a complex guideline.
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, pt: 1 }}>
                        <Button
                            onClick={() => setShowHelpDialog(false)}
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

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{
                            width: '100%',
                            borderRadius: 1.5,
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* Points Information Dialog */}
                <Dialog
                    open={showPointsInfo}
                    onClose={() => setShowPointsInfo(false)}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2,
                        },
                    }}
                >
                    <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#051D40', pb: 1 }}>
                        Points System Information
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body1" paragraph>
                                Each guideline instruction you create will consume{' '}
                                <strong>{pointConsume} points</strong> from your company account.
                            </Typography>

                            <Typography variant="body1" paragraph>
                                Points are used as follows:
                            </Typography>

                            <Box sx={{ bgcolor: '#f5f9ff', p: 2, borderRadius: 1.5, mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Basic Guideline: 0 points
                                </Typography>
                                <Typography variant="body2">
                                    Creating the guideline with basic information does not consume points.
                                </Typography>
                            </Box>

                            <Box sx={{ bgcolor: '#f5f9ff', p: 2, borderRadius: 1.5, mb: 2 }}>
                                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                                    Each Instruction Step: {pointConsume} points
                                </Typography>
                                <Typography variant="body2">
                                    Every individual instruction step you add to your guideline will consume{' '}
                                    {pointConsume} points.
                                </Typography>
                            </Box>

                            <Typography variant="body1" sx={{ mt: 3, fontWeight: 600 }}>
                                Need more points?
                            </Typography>
                            <Typography variant="body2">
                                You can purchase additional points from the Payment section in the sidebar.
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', pb: 2, pt: 1, px: 3 }}>
                        <Button
                            onClick={() => setShowPointsInfo(false)}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                px: 3,
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
            </Box>
        </ThemeProvider>
    );
}
