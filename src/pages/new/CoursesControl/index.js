import {
    Skeleton,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import adminLoginBackground from '~/assets/images/adminlogin.webp';
import CourseAPI from '~/API/CourseAPI';
import CardCourse from '~/components/CardCourse';
import storageService from '~/components/StorageService/storageService';

const defaultTheme = createTheme();

export default function CoursesControl() {
    const navigate = useNavigate();

    // Original states
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

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
    // Image Upload
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);

    // Fetch data on mount
    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            setIsLoading(true);
            const response = await CourseAPI.getByCompanyId(userInfo?.company?.id);
            const data = response?.result || [];
            setCourses(data);
        } catch (error) {
            console.error('Failed to fetch courses:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Navigate to Course Edit
    const handleRedirectToCourseEdit = (courseId) => {
        navigate(`/company/course/view/${courseId}`);
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
    const handleOpenCreateDialog = () => {
        setNewTitle('');
        setNewDescription('');
        setNewStatus('ACTIVE');
        setSelectedImage(null);
        setImagePreview('');
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
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
        if (!newTitle.trim()) {
            alert('Please enter a title');
            return;
        }

        if (!selectedImage) {
            alert('Please select an image');
            return;
        }

        const formData = new FormData();
        formData.append('title', newTitle);
        formData.append('description', newDescription);
        formData.append('status', newStatus);
        formData.append('type', type);
        formData.append('isMandatory', isMandatory);
        formData.append('companyId', userInfo?.company?.id);
        formData.append('imageUrl', selectedImage); // Attach the selected image

        try {
            setIsCreating(true);
            const response = await CourseAPI.create(formData);

            if (response?.result) {
                await fetchCourses();
                handleCloseCreateDialog();
            }
        } catch (error) {
            console.error('Failed to create course:', error);
            alert('Failed to create course. Please try again.');
        } finally {
            setIsCreating(false);
        }
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
                    My Courses
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

                    {/* Filter by status */}
                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Create Course button */}
                    <Button variant="contained" sx={{ ml: 'auto' }} onClick={handleOpenCreateDialog}>
                        Create Course
                    </Button>
                </Box>
                {/* ===================== END CREATE + SEARCH & FILTER ROW ===================== */}

                <Box
                    sx={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        py: 4,
                        px: 2,
                        margin: 'auto autto',
                        minHeight: '50vh',
                        companyId: 'f608be70-fa3a-47cd-bb7a-751c16452f87',
                    }}
                >
                    {isLoading ? (
                        /* While loading, show skeleton placeholders */
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
                        /* Map filteredCourses instead of courses */
                        <Grid container spacing={3}>
                            {filteredCourses.map((data, index) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={12}
                                    md={6}
                                    lg={3}
                                    key={index}
                                    sx={{ cursor: 'pointer' }}
                                    onClick={() => handleRedirectToCourseEdit(data.id)}
                                >
                                    <CardCourse
                                        title={data.title}
                                        description={data.description}
                                        image={data.imageUrl}
                                        viewers={data.numberOfParticipants}
                                        lessons={data.lessons.length}
                                        duration={data.duration}
                                        status={data.status}
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Box>

                {/* ===================== CREATE COURSE DIALOG ===================== */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                    <DialogTitle>Create New Course</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Please fill out the form to create a new course.
                        </DialogContentText>

                        {/* Title Field */}
                        <TextField
                            margin="normal"
                            label="Course Title"
                            fullWidth
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            required
                        />
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
                            <Button variant="contained" component="span">
                                {selectedImage ? 'Change Image' : 'Upload Image'}
                            </Button>
                        </label>
                        {imagePreview && (
                            <img src={imagePreview} alt="Preview" style={{ width: '100%', marginTop: 10 }} />
                        )}

                        {/* Description Field */}
                        <TextField
                            margin="normal"
                            label="Description"
                            fullWidth
                            multiline
                            minRows={3}
                            value={newDescription}
                            onChange={(e) => setNewDescription(e.target.value)}
                        />

                        {/* Status Field */}
                        {/* <FormControl fullWidth margin="normal">
                            <InputLabel>Status</InputLabel>
                            <Select value={newStatus} label="Status" onChange={(e) => setNewStatus(e.target.value)}>
                                <MenuItem value="ACTIVE">Active</MenuItem>
                                <MenuItem value="INACTIVE">Inactive</MenuItem>
                            </Select>
                        </FormControl> */}

                        <Typography sx={{ mt: 1 }}>Type: {type}</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateCourse} disabled={isCreating}>
                            {isCreating ? <CircularProgress size={24} /> : 'Create'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </ThemeProvider>
    );
}
