import {
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
    Skeleton,
    TextField,
    Autocomplete,
    Paper,
    Container,
    Divider,
    IconButton,
    Chip,
    Stack,
} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider, alpha } from '@mui/material/styles';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import DescriptionIcon from '@mui/icons-material/Description';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CourseAPI from '~/API/CourseAPI';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import MachineTypeAPI from '~/API/MachineTypeAPI';
import ModelAPI from '~/API/ModelAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import CardCourse from '~/components/CardCourse';
import storageService from '~/components/StorageService/storageService';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useWallet } from '~/WalletContext'; // Import the WalletContext

// Create a custom theme with better colors
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
            light: '#4791db',
            dark: '#115293',
        },
        secondary: {
            main: '#f50057',
        },
        background: {
            default: '#f5f7fa',
        },
    },
    typography: {
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        h3: {
            fontWeight: 700,
        },
        h4: {
            fontWeight: 600,
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 8,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#1976d2',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    boxShadow: '0 3px 10px rgba(0, 0, 0, 0.08)',
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    borderRadius: 16,
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 8,
                    },
                },
            },
        },
    },
});

export default function CoursesControl() {
    const navigate = useNavigate();

    // Original states
    const [courses, setCourses] = useState([]);
    const [unusedModel, setUnusedModel] = useState([]);

    // States for filtering
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // 1) States for creating a course dialog
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false); // loading spinner state

    // 2) Form fields for new course
    const [newTitle, setNewTitle] = useState('');
    const [newDescription, setNewDescription] = useState('');
    const [newStatus, setNewStatus] = useState('ACTIVE'); // default or 'INACTIVE', etc.
    const [imageUrl, setImageUrl] = useState('');
    const [duration, setDuration] = useState(0);
    const [isMandatory, setIsMandatory] = useState(false);
    const [type, setType] = useState('Training');
    const [model, setModel] = useState('');
    // Image Upload
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const defaultModel = '3206416a-6cee-4fb9-8742-b3a97b8e0027';
    const [paramsToSearch, setParamsToSearch] = useState({
        title: '',
        status: '',
        machineTypeId: '',
    });
    const { currentPoints, fetchWallet } = useWallet(); // Use WalletContext to get currentPoints

    // Show filter section
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const fetchModelUnused = async () => {
            try {
                const response = await ModelAPI.getUnusedModelByCompany(userInfo?.company?.id);
                const data = response?.result || [];
                setUnusedModel(data);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        fetchModelUnused();
        fetchWallet();
    }, []);

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

    const fetchCourses = async (pageParam, paramsToSearch) => {
        const currentPage = pageParam ?? 1;
        const response = await CourseAPI.getByCompanyId(userInfo?.company?.id, currentPage, 8, paramsToSearch);
        return {
            data: response?.result?.objectList || [],
            nextPage: response?.result?.objectList.length > 0 ? pageParam + 1 : null,
        };
    };

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, refetch } = useInfiniteQuery({
        queryKey: ['courses', paramsToSearch],
        queryFn: ({ pageParam = 1 }) => fetchCourses(pageParam, paramsToSearch),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => lastPage.nextPage,
    });

    const loadMoreRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 1 },
        );

        const currentRef = loadMoreRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [hasNextPage, fetchNextPage]);

    // Navigate to Course Edit
    const handleRedirectToCourseEdit = (courseId) => {
        navigate(`/company/guideline/create/${courseId}`);
    };

    // ===========================
    // Filter the courses locally
    // ===========================
    const filteredCourses = courses.filter((course) => {
        // Filter by title
        const matchesTitle = course.title.toLowerCase().includes(searchTerm.toLowerCase());

        // Filter by status
        const matchesStatus = statusFilter ? course.status === statusFilter : true;

        return matchesTitle && matchesStatus;
    });

    // ===========================
    // Create Course Dialog Logic
    // ===========================
    const [machineTypeByCompanyId, setMachineTypeByCompanyId] = useState([]);
    const [machineTypeIdToCreate, setMachineTypeIdToCreate] = useState('');
    const [selectedMachineTypeToCreate, setSelectedMachineTypeToCreate] = useState(null);
    const [modelsByMachineType, setModelsByMachineType] = useState([]);

    const handleSelectMachineType = async (event, value) => {
        if (!value) {
            setSelectedMachineTypeToCreate(null);
            setModelsByMachineType([]);
            setModel('');
            return;
        }

        setSelectedMachineTypeToCreate(value);
        setModel('');

        try {
            const response = await ModelAPI.getByMachineTypeIdAndCompanyId(value.machineTypeId, userInfo?.company?.id);
            const data = response?.result || [];
            setModelsByMachineType(data);
        } catch (error) {
            console.error('Failed to fetch models by machine type:', error);
        }
    };

    useEffect(() => {
        const fetchMachineTypeByCompanyId = async () => {
            try {
                const params = {
                    page: 1,
                    size: 1000,
                };
                const response = await MachineTypeAPI.getByCompany(userInfo?.company?.id, params);
                const data = response?.result?.objectList || [];
                setMachineTypeByCompanyId(data);
            } catch (error) {
                console.error('Failed to fetch machine type:', error);
            }
        };
        fetchMachineTypeByCompanyId();
    }, []);

    const handleOpenCreateDialog = () => {
        setNewTitle('');
        setNewDescription('');
        setNewStatus('ACTIVE');
        setSelectedImage(null);
        setImagePreview('');
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setNewTitle('');
        setNewDescription('');
        setNewStatus('ACTIVE');
        setSelectedImage(null);
        setImagePreview('');
        setModel('');
        setOpenCreateDialog(false);
        setSelectedMachineTypeToCreate(null);
    };

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleCreateCourse = async () => {
        if (newTitle.trim().length < 5 || newTitle.trim().length > 50) {
            toast.error('Title must be between 5 and 50 characters.', { position: 'top-right' });
            return;
        }

        if (newDescription.trim().length < 10 || newDescription.trim().length > 200) {
            toast.error('Description must be between 10 and 200 characters.', { position: 'top-right' });
            return;
        }

        if (!selectedImage) {
            toast.error('Please select an image.', { position: 'top-right' });
            return;
        }

        if (!model) {
            toast.error('Please select a model.', { position: 'top-right' });
            return;
        }
        const formData = new FormData();
        formData.append('title', newTitle.trim());
        formData.append('description', newDescription.trim());
        formData.append('status', newStatus);
        formData.append('type', type);
        formData.append('isMandatory', isMandatory);
        formData.append('companyId', userInfo?.company?.id);
        formData.append('imageUrl', selectedImage);
        formData.append('modelId', model);

        try {
            setIsCreating(true);
            const response = await CourseAPI.create(formData);

            if (response?.result) {
                toast.success('Guideline created successfully!', { position: 'top-right' });
                await refetch();
                handleCloseCreateDialog();
            }
        } catch (error) {
            console.error('Failed to create guideline course:', error);
            toast.error('Failed to create guideline. Please try again.', { position: 'top-right' });
        } finally {
            setIsCreating(false);
        }
    };

    // Function to apply filters
    const applyFilters = () => {
        setParamsToSearch({
            title: searchTerm,
            status: statusFilter === 'ALL' ? '' : statusFilter,
            machineTypeId: selectedMachineType ? selectedMachineType.id : '',
        });
    };

    // Function to reset filters
    const resetFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setSelectedMachineType(null);
        setParamsToSearch({
            title: '',
            status: '',
            machineTypeId: '',
        });
    };

    const hasActiveFilters = searchTerm || statusFilter || selectedMachineType;
    const hasData = data?.pages && data.pages.some((page) => page.data.length > 0);

    return (
        <ThemeProvider theme={theme}>
            <Box
                component="main"
                sx={{
                    backgroundImage: `linear-gradient(rgba(245, 247, 250, 0.8), rgba(245, 247, 250, 0.8)), url(${adminLoginBackground})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '100vh',
                    width: '100%',
                    py: 4,
                }}
            >
                <Container maxWidth="xl">
                    {/* Header Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #051D40 0%, #1976d2 100%)',
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', md: 'center' },
                        }}
                    >
                        <Box>
                            <Typography component="h1" variant="h3" sx={{ color: 'white', mb: 1 }}>
                                My Guidelines
                            </Typography>
                            <Typography sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                Manage and create machine operation guidelines for your team
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{
                                mt: { xs: 2, md: 0 },
                                bgcolor: 'white',
                                color: '#051D40',
                                '&:hover': {
                                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                                },
                            }}
                            onClick={() => {
                                navigate('/company/guideline/create');
                            }}
                        >
                            Create New Guideline
                        </Button>
                    </Paper>

                    {/* Search & Filter Section */}
                    <Paper elevation={0} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, justifyContent: 'space-between' }}>
                            <Typography variant="h6" sx={{}}>
                                <ManageSearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                Search & Filter
                            </Typography>
                            <Button
                                variant="text"
                                color="primary"
                                startIcon={<FilterAltIcon />}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                {showFilters ? 'Hide Filters' : 'Show Filters'}
                            </Button>
                        </Box>

                        {/* Basic Search */}
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Search guidelines by title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            InputProps={{
                                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                            }}
                            sx={{ mb: 2 }}
                        />

                        {/* Advanced Filters */}
                        {showFilters && (
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Autocomplete
                                            options={machineTypes}
                                            getOptionLabel={(option) => option.name}
                                            value={selectedMachineType}
                                            onChange={(event, newValue) => {
                                                setSelectedMachineType(newValue);
                                            }}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Machine Type" fullWidth />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <FormControl fullWidth>
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                label="Status"
                                                value={statusFilter}
                                                onChange={(e) => setStatusFilter(e.target.value)}
                                            >
                                                <MenuItem value="">All</MenuItem>
                                                <MenuItem value="ACTIVE">Active</MenuItem>
                                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                                                <MenuItem value="DRAFTED">Drafted</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>
                            </Box>
                        )}

                        {/* Filter Actions */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                            {hasActiveFilters && (
                                <Button variant="outlined" color="inherit" onClick={resetFilters}>
                                    Clear Filters
                                </Button>
                            )}
                            <Button variant="contained" color="primary" onClick={applyFilters}>
                                Apply Filters
                            </Button>
                        </Box>
                    </Paper>

                    {/* Content Section */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            backgroundColor: 'white',
                            minHeight: '60vh',
                            position: 'relative',
                        }}
                    >
                        {/* Current filters display */}
                        {hasActiveFilters && (
                            <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="body2" sx={{ mr: 1, color: 'text.secondary' }}>
                                    Active filters:
                                </Typography>
                                {searchTerm && (
                                    <Chip
                                        label={`Title: ${searchTerm}`}
                                        size="small"
                                        onDelete={() => setSearchTerm('')}
                                    />
                                )}
                                {statusFilter && (
                                    <Chip
                                        label={`Status: ${statusFilter}`}
                                        size="small"
                                        onDelete={() => setStatusFilter('')}
                                    />
                                )}
                                {selectedMachineType && (
                                    <Chip
                                        label={`Machine: ${selectedMachineType.name}`}
                                        size="small"
                                        onDelete={() => setSelectedMachineType(null)}
                                    />
                                )}
                            </Box>
                        )}

                        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                            Guideline Library
                        </Typography>

                        {isLoading ? (
                            <Grid container spacing={3}>
                                {Array.from(new Array(8)).map((_, idx) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
                                        <Skeleton
                                            variant="rectangular"
                                            sx={{
                                                width: '100%',
                                                aspectRatio: '16/9',
                                                borderRadius: 2,
                                                mb: 1,
                                            }}
                                        />
                                        <Skeleton variant="text" height={30} width="80%" sx={{ mb: 1 }} />
                                        <Skeleton variant="text" height={20} width="60%" />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : !hasData ? (
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    py: 8,
                                    textAlign: 'center',
                                    color: 'text.secondary',
                                }}
                            >
                                <FolderOpenIcon sx={{ fontSize: 80, mb: 2, color: alpha('#1976d2', 0.3) }} />
                                <Typography variant="h5" sx={{ mb: 1, color: 'text.primary' }}>
                                    No Guidelines Found
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 3, maxWidth: 500 }}>
                                    {hasActiveFilters
                                        ? 'No guidelines match your current filters. Try adjusting your search criteria.'
                                        : "You haven't created any guidelines yet. Create your first guideline to get started."}
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={() => navigate('/company/guideline/create')}
                                >
                                    Create Your First Guideline
                                </Button>
                            </Box>
                        ) : (
                            <Grid container spacing={3}>
                                {data?.pages
                                    .flatMap((page) => page.data)
                                    .map((course, index) => (
                                        <Grid
                                            item
                                            xs={12}
                                            sm={6}
                                            md={4}
                                            lg={3}
                                            key={index}
                                            sx={{ cursor: 'pointer' }}
                                            onClick={() => handleRedirectToCourseEdit(course.id)}
                                        >
                                            <CardCourse
                                                title={course.title}
                                                description={course.description}
                                                image={course.imageUrl}
                                                status={course.status}
                                                machineType={course.machineType}
                                                modelName={course.modelName}
                                            />
                                        </Grid>
                                    ))}

                                <div
                                    ref={loadMoreRef}
                                    style={{ height: 20, width: '100%', background: 'transparent' }}
                                ></div>
                                {isFetchingNextPage && (
                                    <Grid item xs={12} textAlign="center">
                                        <CircularProgress size={30} />
                                    </Grid>
                                )}
                            </Grid>
                        )}
                    </Paper>
                </Container>

                {/* ===================== CREATE Guideline DIALOG ===================== */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                    <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
                        <Typography variant="h5">Create New Guideline</Typography>
                    </DialogTitle>
                    <DialogContent sx={{ pt: 3 }}>
                        <DialogContentText sx={{ mb: 3 }}>
                            Fill out the details below to create a new machine operation guideline.
                        </DialogContentText>

                        {/* Title Field */}
                        <TextField
                            margin="normal"
                            label="Guideline Title"
                            fullWidth
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                            placeholder="Enter a descriptive title (5-50 characters)"
                            helperText={`${newTitle.length}/50 characters`}
                        />

                        <Autocomplete
                            options={machineTypeByCompanyId}
                            getOptionLabel={(option) => option.machineTypeName || ''}
                            value={selectedMachineTypeToCreate}
                            onChange={handleSelectMachineType}
                            renderInput={(params) => (
                                <TextField {...params} label="Machine Type" margin="normal" required />
                            )}
                        />

                        {selectedMachineTypeToCreate && (
                            <Autocomplete
                                options={modelsByMachineType}
                                getOptionLabel={(option) => option.name || ''}
                                value={modelsByMachineType.find((m) => m.id === model) || null}
                                onChange={(e, value) => setModel(value?.id || '')}
                                renderInput={(params) => (
                                    <TextField {...params} label="Model" margin="normal" required />
                                )}
                            />
                        )}

                        {/* Image Upload Field */}
                        <Box sx={{ mt: 3, mb: 2 }}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Cover Image
                            </Typography>
                            <input
                                type="file"
                                accept="image/*"
                                style={{ display: 'none' }}
                                id="image-upload"
                                onChange={handleImageUpload}
                                multiple={false}
                            />
                            <label htmlFor="image-upload">
                                <Button
                                    fullWidth
                                    variant="outlined"
                                    component="span"
                                    sx={{
                                        border: '2px dashed #1976d2',
                                        padding: 3,
                                        backgroundColor: alpha('#1976d2', 0.04),
                                        boxShadow: 'none',
                                        color: '#1976d2',
                                        height: imagePreview ? 'auto' : 120,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        '&:hover': {
                                            backgroundColor: alpha('#1976d2', 0.08),
                                            border: '2px dashed #1976d2',
                                        },
                                    }}
                                >
                                    {!imagePreview && (
                                        <>
                                            <DescriptionIcon sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography>Click to upload a cover image</Typography>
                                            <Typography variant="caption">Recommended size: 1280 x 720px</Typography>
                                        </>
                                    )}
                                    {imagePreview && (
                                        <Box sx={{ position: 'relative', width: '100%' }}>
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                style={{ width: '100%', borderRadius: 8 }}
                                            />
                                            <Button
                                                variant="contained"
                                                size="small"
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: 8,
                                                    right: 8,
                                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                                    '&:hover': {
                                                        backgroundColor: 'rgba(0,0,0,0.8)',
                                                    },
                                                }}
                                            >
                                                Change
                                            </Button>
                                        </Box>
                                    )}
                                </Button>
                            </label>
                        </Box>

                        {/* Description Field */}
                        <TextField
                            margin="normal"
                            label="Description"
                            fullWidth
                            required
                            multiline
                            minRows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            placeholder="Enter a brief description of this guideline (10-200 characters)"
                            helperText={`${newDescription.length}/200 characters`}
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #eee' }}>
                        <Button onClick={handleCloseCreateDialog} disabled={isCreating} variant="outlined">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleCreateCourse}
                            disabled={isCreating}
                            variant="contained"
                            startIcon={isCreating ? <CircularProgress size={20} /> : <AddCircleOutlineIcon />}
                        >
                            {isCreating ? 'Creating...' : 'Create Guideline'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
