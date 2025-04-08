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
} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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

const defaultTheme = createTheme();

export default function CoursesControl() {
    const navigate = useNavigate();

    // Original states
    const [courses, setCourses] = useState([]);
    const [unusedModel, setUnusedModel] = useState([]);
    // const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        const fetchModelUnused = async () => {
            try {
                const response = await ModelAPI.getUnusedModelByCompany(userInfo?.company?.id);
                console.log(response);

                const data = response?.result || [];
                setUnusedModel(data);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        fetchModelUnused();
        fetchWallet();
    }, []);

    // const fetchCourses = async () => {
    //     try {
    //         const response = await CourseAPI.getByCompanyId(userInfo?.company?.id);
    //         const data = response?.result || [];
    //         setCourses(data);
    //     } catch (error) {
    //         console.error('Failed to fetch courses:', error);
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

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
        navigate(`/company/guideline/view/${courseId}`);
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

    useEffect(() => {
        console.log(machineTypeByCompanyId);
    }, [machineTypeByCompanyId]);

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
            console.log('first file', file);
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

    useEffect(() => {
        console.log(model);
    }, [model]);

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
                    padding: '5%',
                    backgroundImage: `url(${adminLoginBackground})`,
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: '900',
                        fontSize: '46px',
                        color: '#051D40',
                        textAlign: 'left',
                        marginBottom: '3%',
                    }}
                >
                    My Guidelines
                </Typography>

                {/* ===================== CREATE + SEARCH & FILTER ROW ===================== */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {/* Search by title */}
                    <TextField
                        variant="outlined"
                        label="Search by Title"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        sx={{ width: '300px' }}
                    />

                    <Autocomplete
                        options={machineTypes}
                        getOptionLabel={(option) => option.name}
                        sx={{ width: 300 }}
                        renderInput={(params) => <TextField {...params} label="Machine Types" />}
                        onChange={(event, newValue) => {
                            setSelectedMachineType(newValue);
                        }}
                    />

                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="ALL">All</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="DRAFTED">Drafted</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        sx={{ textTransform: 'none' }}
                        onClick={() => {
                            setParamsToSearch({
                                title: searchTerm,
                                status: statusFilter === 'ALL' ? '' : statusFilter,
                                machineTypeId: selectedMachineType ? selectedMachineType.id : '',
                            });
                        }}
                    >
                        Filter
                    </Button>

                    {/* Create Course button */}
                    <Button
                        variant="contained"
                        sx={{ ml: 'auto', textTransform: 'none' }}
                        onClick={handleOpenCreateDialog}
                    >
                        Create Guideline
                    </Button>
                </Box>
                {/* ===================== END CREATE + SEARCH & FILTER ROW ===================== */}
                <Box
                    sx={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        py: 4,
                        px: 2,
                        margin: 'auto auto',
                        minHeight: '50vh',
                    }}
                >
                    {isLoading ? (
                        <Grid container spacing={3}>
                            {Array.from(new Array(8)).map((_, idx) => (
                                <Grid item xs={12} sm={6} md={3} key={idx}>
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
                    ) : (
                        <Grid container spacing={3}>
                            {data?.pages
                                .flatMap((page) => page.data)
                                .map((course, index) => (
                                    <Grid
                                        item
                                        xs={12}
                                        sm={12}
                                        md={6}
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

                            <div ref={loadMoreRef} style={{ height: 20, background: 'transparent' }}></div>
                            {isFetchingNextPage && (
                                <Grid item xs={12} textAlign="center">
                                    <CircularProgress size={30} />
                                </Grid>
                            )}
                        </Grid>
                    )}
                </Box>

                {/* ===================== CREATE Guideline DIALOG ===================== */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Create New Guideline</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Please fill out the form to create a new course.
                        </DialogContentText>

                        {/* Title Field */}
                        <TextField
                            margin="normal"
                            label="Guideline Title"
                            fullWidth
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
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

                        {/* Model Field */}
                        {/* <FormControl fullWidth margin="normal" sx={{ mb: 2 }}>
                            <InputLabel>Model*</InputLabel>
                            <Select value={model} label="Model" onChange={(e) => setModel(e.target.value)}>
                                {unusedModel.map((data, index) => (
                                    <MenuItem value={data.id}>{data.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl> */}

                        {/* Image Upload Field */}
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
                                variant="contained"
                                component="span"
                                sx={{
                                    border: '2px dashed darkgrey',
                                    padding: 2,
                                    backgroundColor: '#f5f5f5',
                                    boxShadow: 'none',
                                    color: '#0f6cbf',
                                    textTransform: 'none',
                                    ':hover': {
                                        backgroundColor: '#f5f5f5',
                                        border: '2px solid #0f6cbf',
                                        boxShadow: 'none',
                                    },
                                }}
                            >
                                {selectedImage ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </label>
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', marginTop: 10 }} />
                        )}

                        {/* Description Field */}
                        <TextField
                            margin="normal"
                            label="Short Content"
                            fullWidth
                            required
                            multiline
                            minRows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                            sx={{ mt: 3 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCloseCreateDialog} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button sx={{ textTransform: 'none' }} onClick={handleCreateCourse} disabled={isCreating}>
                            {isCreating ? <CircularProgress size={24} /> : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
