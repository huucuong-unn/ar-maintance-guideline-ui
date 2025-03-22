// CoursesControlEdit.jsx

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Modal,
    Tab,
    TextField,
    Typography,
} from '@mui/material';
import axios from 'axios';
import { File, MoreVerticalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ====== APIs and Components ======
import CourseAPI from '~/API/CourseAPI';
import InstructionAPI from '~/API/InstructionAPI';
import InstructionDetailAPI from '~/API/InstructionDetailAPI';
import ModelAPI from '~/API/ModelAPI';
import AssignEmployee from '~/components/AssignEmployee';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { getImage } from '~/Constant';

// ====== A sample fallback model if needed ======
// import modelTest from '~/assets/models/mouseclean.glb'; // If you need a local fallback

export default function CoursesControlEdit() {
    const navigate = useNavigate();
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const { id: courseId } = useParams();

    // -------------------- Tab State --------------------
    const [tabValue, setTabValue] = useState('1');
    const handleTabChange = (e, newValue) => setTabValue(newValue);

    // For “expanded” in instructions
    const [expandedFAQ, setExpandedFAQ] = useState(false);
    const handleChangeFAQ = (panel) => (e, isExpanded) => {
        setExpandedFAQ(isExpanded ? panel : false);
    };

    // -------------------- Course Data --------------------
    const [course, setCourse] = useState(null);
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);

    const fetchCourse = async () => {
        try {
            setIsLoadingCourse(true);
            const response = await CourseAPI.getById(courseId);
            if (response?.result) {
                setCourse(response.result);
            }
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setIsLoadingCourse(false);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    // -------------------- Model Data --------------------
    const [model, setModel] = useState(null);
    const [isLoadingModel, setIsLoadingModel] = useState(true);

    const fetchModel = async () => {
        if (!course?.modelId) return;
        try {
            setIsLoadingModel(true);
            const response = await ModelAPI.getById(course.modelId);
            setModel(response?.result || null);
        } catch (error) {
            console.error('Failed to fetch model:', error);
        } finally {
            setIsLoadingModel(false);
        }
    };

    useEffect(() => {
        if (course) fetchModel();
    }, [course]);

    // -------------------- Start/Stop Guideline --------------------
    const [isLoadingStartCourse, setIsLoadingStartCourse] = useState(false);
    const [openCourseStatusDialog, setOpenCourseStatusDialog] = useState(false);

    const handleClickToggleCourseStatus = () => {
        // Example: If you require instructions to exist, you could check instructions here
        setOpenCourseStatusDialog(true);
    };

    const handleStartCourse = async () => {
        try {
            if (course.status !== 'DRAFTED') {
                setIsLoadingStartCourse(true);
                await CourseAPI.changeStatus(courseId);
            } else {
                setIsLoadingStartCourse(true);
                await CourseAPI.publishFirstTime(courseId, userInfo.id);
            }
            // After toggling, refresh or navigate
            window.location.reload();
        } catch (error) {
            if (error?.response?.data?.code === 1096) {
                toast.error('Cannot activate this guideline as its model is inactive.');
            } else if (error?.response?.data?.code === 1098) {
                toast.error('This guideline requires at least one instruction detail to be activated.');
            } else {
                toast.error('Failed to update guideline status:', error.response?.data?.message || 'Unknown error');
            }
        } finally {
            setIsLoadingStartCourse(false);
            setOpenCourseStatusDialog(false);
        }
    };

    // -------------------- Delete Guideline --------------------
    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const handleOpenDeleteConfirm = () => setOpenDeleteConfirm(true);
    const handleCloseDeleteConfirm = () => setOpenDeleteConfirm(false);

    const handleDeleteGuideline = async () => {
        try {
            await CourseAPI.delete(course.id);
            toast.success('Guideline deleted successfully!');
            setOpenDeleteConfirm(false);
            navigate('/company/course');
        } catch (error) {
            console.error('Failed to delete guideline:', error);
            toast.error('Failed to delete guideline. Please try again.');
        }
    };

    // -------------------- Instructions (like “Sections”) --------------------
    const [instructions, setInstructions] = useState([]);
    const [isLoadingSections, setIsLoadingSections] = useState(true);

    const fetchInstructionByCourseId = async () => {
        try {
            setIsLoadingSections(true);
            const response = await InstructionAPI.getByCourse(courseId);
            const data = response?.result?.objectList || [];
            setInstructions(data);
        } catch (error) {
            console.error('Failed to fetch instructions:', error);
        } finally {
            setIsLoadingSections(false);
        }
    };

    useEffect(() => {
        fetchInstructionByCourseId();
    }, [courseId]);

    // Add new Instruction
    const [openAddSectionDialog, setOpenAddSectionDialog] = useState(false);
    const [instructionName, setInstructionName] = useState('');
    const [instructionDescription, setInstructionDescription] = useState('');
    const [guideViewPosition, setGuideViewPosition] = useState({
        translation: [0, 0, 0],
        rotation: [0, 0, 0],
    });
    const [instructionDetailRequest, setInstructionDetailRequest] = useState({
        name: '',
        description: '',
        file: null,
        imageFile: null,
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleOpenAddSectionDialog = () => {
        setInstructionName('');
        setInstructionDescription('');
        setGuideViewPosition({ translation: [0, 0, 0], rotation: [0, 0, 0] });
        setInstructionDetailRequest({ name: '', description: '', file: null, imageFile: null });
        setOpenAddSectionDialog(true);
    };

    const handleCloseAddSectionDialog = () => {
        setOpenAddSectionDialog(false);
        setInstructionName('');
        setInstructionDescription('');
        setGuideViewPosition({ translation: [0, 0, 0], rotation: [0, 0, 0] });
        setInstructionDetailRequest({ name: '', description: '', file: null, imageFile: null });
    };

    const handleCreateInstruction = async () => {
        // Basic validation checks can go here
        if (instructionName.trim().length < 5) {
            toast.error('Instruction name must be at least 5 characters.');
            return;
        }

        setIsCreating(true);
        try {
            const formData = new FormData();
            formData.append('courseId', courseId);
            formData.append('name', instructionName);
            formData.append('description', instructionDescription);
            formData.append('guideViewPosition.translation', guideViewPosition.translation.join(','));
            formData.append('guideViewPosition.rotation', guideViewPosition.rotation.join(','));
            // For the first detail (optional)
            formData.append('instructionDetailRequest.name', instructionDetailRequest.name);
            formData.append('instructionDetailRequest.description', instructionDetailRequest.description);
            if (instructionDetailRequest.file) {
                formData.append('instructionDetailRequest.file', instructionDetailRequest.file);
            }
            if (instructionDetailRequest.imageFile) {
                formData.append('instructionDetailRequest.imageFile', instructionDetailRequest.imageFile);
            }

            const response = await InstructionAPI.create(formData);
            if (response?.result) {
                toast.success('Instruction created successfully!');
                setOpenAddSectionDialog(false);
                fetchInstructionByCourseId();
            }
        } catch (error) {
            console.error('Failed to create instruction:', error);
            toast.error('Failed to create instruction. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    // Delete an entire Instruction
    const [openDeleteInstructionDialog, setOpenDeleteInstructionDialog] = useState(false);
    const [instructionToDelete, setInstructionToDelete] = useState('');

    const handleClickDeleteInstruction = (instructionId) => {
        setInstructionToDelete(instructionId);
        setOpenDeleteInstructionDialog(true);
    };
    const handleCloseDeleteInstructionDialog = () => {
        setOpenDeleteInstructionDialog(false);
        setInstructionToDelete('');
    };
    const handleDeleteInstruction = async () => {
        try {
            await InstructionAPI.deleteById(instructionToDelete);
            toast.success('Instruction deleted successfully!');
            fetchInstructionByCourseId();
        } catch (error) {
            console.error('Failed to delete instruction:', error);
            toast.error('Failed to delete instruction. Please try again.');
        } finally {
            setOpenDeleteInstructionDialog(false);
        }
    };

    // Update an Instruction
    const [openUpdateInstructionDialog, setOpenUpdateInstructionDialog] = useState(false);
    const [currentInstrutionIdForUpdate, setCurrentInstrutionIdForUpdate] = useState('');
    const [nameForInstruction, setNameForInstruction] = useState('');
    const [descriptionForInstruction, setDescriptionForInstruction] = useState('');
    const [translationForInstruction, setTranslationForInstruction] = useState([]);
    const [rotationForInstruction, setRotationForInstruction] = useState([]);
    const [isUpdatingForInstruction, setIsUpdatingForInstruction] = useState(false);

    const handleEditInstruction = async (instructionId) => {
        try {
            const response = await InstructionAPI.getById(instructionId);
            const data = response?.result;
            setCurrentInstrutionIdForUpdate(data.id);
            setNameForInstruction(data.name);
            setDescriptionForInstruction(data.description);
            // If your API returns position/rotation differently, adjust
            setTranslationForInstruction(data.position?.split(',').map(Number) || [0, 0, 0]);
            setRotationForInstruction(data.rotation?.split(',').map(Number) || [0, 0, 0]);
            setOpenUpdateInstructionDialog(true);
        } catch (error) {
            console.error('Failed to fetch instruction:', error);
        }
    };

    const handleCloseUpdateInstructionDialog = () => {
        setOpenUpdateInstructionDialog(false);
        setCurrentInstrutionIdForUpdate('');
        setNameForInstruction('');
        setDescriptionForInstruction('');
        setTranslationForInstruction([]);
        setRotationForInstruction([]);
    };

    const handleUpdateInstruction = async () => {
        setIsUpdatingForInstruction(true);
        try {
            const formData = new FormData();
            formData.append('name', nameForInstruction);
            formData.append('description', descriptionForInstruction);
            formData.append('guideViewPosition.translation', translationForInstruction.join(','));
            formData.append('guideViewPosition.rotation', rotationForInstruction.join(','));

            const response = await InstructionAPI.update(currentInstrutionIdForUpdate, formData);
            if (response?.result) {
                toast.success('Instruction updated successfully!');
                handleCloseUpdateInstructionDialog();
                fetchInstructionByCourseId();
            }
        } catch (error) {
            console.error('Failed to update instruction:', error);
            toast.error('Failed to update instruction. Please try again.');
        } finally {
            setIsUpdatingForInstruction(false);
        }
    };

    // -------------------- Instruction Detail (“Add Lesson” in your old code) --------------------
    const [openAddLessonDialog, setOpenAddLessonDialog] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState(null);
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);

    const [openUpdateLessonDialog, setOpenUpdateLessonDialog] = useState(false);
    const [currentInstructionDetailId, setcurrentInstructionDetailId] = useState('');
    const [isUpdatingForInstructionDetail, setIsUpdatingForInstructionDetail] = useState(false);

    // Open the dialog to create a new instruction detail
    const [openEditor, setOpenEditor] = useState(false);

    const handleOpenAddLessonDialog = (instructionId) => {
        setCurrentSectionId(instructionId);
        setOpenAddLessonDialog(true);
        setOpenEditor(true);
    };
    const handleCloseAddLessonDialog = () => {
        setOpenAddLessonDialog(false);
        setOpenEditor(false);
        setCurrentSectionId(null);
    };

    // Deleting a single instruction detail
    const [openDeleteSectionDialog, setOpenDeleteSectionDialog] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState('');

    const handleClickDeleteSection = (instructionDetailId) => {
        setSectionToDelete(instructionDetailId);
        setOpenDeleteSectionDialog(true);
    };
    const handleCloseDeleteSectionDialog = () => {
        setOpenDeleteSectionDialog(false);
        setSectionToDelete('');
    };
    const handleDeleteSection = async () => {
        try {
            await InstructionDetailAPI.deleteByIddeleteById(sectionToDelete);
            toast.success('Instruction detail deleted successfully!');
            fetchInstructionByCourseId();
        } catch (error) {
            console.error('Failed to delete instruction detail:', error);
            toast.error('Failed to delete instruction detail. Please try again.');
        } finally {
            setOpenDeleteSectionDialog(false);
        }
    };

    // Updating an instruction detail
    const handleEditLesson = async (instructionDetailId) => {
        try {
            const response = await InstructionDetailAPI.getById(instructionDetailId);
            const data = response?.result || {};
            setcurrentInstructionDetailId(data.id);
            // Possibly store name/description if you want to show them in a form
            setOpenUpdateLessonDialog(true);
            setOpenEditor(true);
        } catch (error) {
            console.error('Failed to fetch instruction detail:', error);
        }
    };
    const handleCloseUpdateLessonDialog = () => {
        setOpenUpdateLessonDialog(false);
        setOpenEditor(false);
        setcurrentInstructionDetailId('');
    };

    // -------------- Swapping Order for Instruction Detail --------------
    const [openSwapOrderDialog, setOpenSwapOrderDialog] = useState(false);
    const [instructionDetailIdCurrent, setInstructionDetailIdCurrent] = useState('');
    const [instructionIdCurrent, setInstructionIdCurrent] = useState('');
    const [instructionDetailCurrent, setInstructionDetailCurrent] = useState({});
    const [instructionDetailList, setInstructionDetailList] = useState([]);
    const [instructionDetailIdToSwap, setInstructionDetailIdToSwap] = useState('');

    const handleClickSwapOrderIntructionDetail = (instructionDetailId, instructionId) => {
        setInstructionDetailIdCurrent(instructionDetailId);
        setInstructionIdCurrent(instructionId);
        setOpenSwapOrderDialog(true);
        fetchInstructionDetailById(instructionDetailId);
        fetchInstructionDetailByInstructionId(instructionId);
    };

    const fetchInstructionDetailById = async (id) => {
        try {
            const response = await InstructionDetailAPI.getById(id);
            setInstructionDetailCurrent(response?.result || {});
        } catch (error) {
            console.error('Failed to fetch instruction detail by ID:', error);
        }
    };

    const fetchInstructionDetailByInstructionId = async (instructionId) => {
        try {
            const response = await InstructionDetailAPI.getByInstructionId(instructionId);
            setInstructionDetailList(response?.result || []);
        } catch (error) {
            console.error('Failed to fetch instruction detail list:', error);
        }
    };

    const handleCloseSwapOrderIntructionDetail = () => {
        setOpenSwapOrderDialog(false);
        setInstructionDetailIdCurrent('');
        setInstructionIdCurrent('');
        setInstructionDetailCurrent({});
        setInstructionDetailList([]);
        setInstructionDetailIdToSwap('');
    };

    const handleClickSaveSwapOrder = async () => {
        try {
            await InstructionDetailAPI.swapOrder(instructionDetailIdCurrent, instructionDetailIdToSwap);
            toast.success('Instruction Detail swapped successfully!');
            fetchInstructionByCourseId();
        } catch (error) {
            console.error('Failed to swap instruction detail:', error);
            toast.error('Error swapping instruction detail.');
        } finally {
            handleCloseSwapOrderIntructionDetail();
        }
    };

    // -------------- Swapping Order for Instruction --------------
    const [openSwapOrderDialogForInstruction, setOpenSwapOrderDialogForInstruction] = useState(false);
    const [instructionIdCurrentForSwap, setInstructionIdCurrentForSwap] = useState('');
    const [instructionIdCurrentForFindById, setInstructionIdCurrentForFindById] = useState({});
    const [instructionList, setInstructionList] = useState([]);
    const [instructionIdToSwap, setInstructionIdToSwap] = useState('');

    const handleClickSwapOrderIntruction = (instructionId) => {
        setInstructionIdCurrentForSwap(instructionId);
        setOpenSwapOrderDialogForInstruction(true);
        fetchInstructionById(instructionId);
        fetchInstructionByCourseIdToSwap();
    };

    const fetchInstructionById = async (instructionId) => {
        try {
            const response = await InstructionAPI.getById(instructionId);
            setInstructionIdCurrentForFindById(response?.result || {});
        } catch (error) {
            console.error('Failed to fetch instruction:', error);
        }
    };

    const fetchInstructionByCourseIdToSwap = async () => {
        try {
            const response = await InstructionAPI.getByCourseToSwap(courseId);
            setInstructionList(response?.result || []);
        } catch (error) {
            console.error('Failed to fetch instructions to swap:', error);
        }
    };

    const handleCloseSwapOrderIntruction = () => {
        setOpenSwapOrderDialogForInstruction(false);
        setInstructionIdCurrentForSwap('');
        setInstructionIdCurrentForFindById({});
        setInstructionList([]);
        setInstructionIdToSwap('');
    };

    const handleClickSaveSwapOrderForInstruction = async () => {
        try {
            await InstructionAPI.swapOrder(instructionIdCurrentForSwap, instructionIdToSwap);
            toast.success('Instruction swapped successfully!');
            fetchInstructionByCourseId();
        } catch (error) {
            console.error('Failed to swap instruction:', error);
            toast.error('Error swapping instruction.');
        } finally {
            handleCloseSwapOrderIntruction();
        }
    };

    // -------------- Download QR Code --------------
    async function handleDownloadQrCode(qrCodeUrl, fileName) {
        if (!qrCodeUrl) return;
        try {
            const response = await axios.get(getImage(qrCodeUrl), { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
    }

    // -------------- Menu anchor states for MoreVertical icons --------------
    const [anchorElMap, setAnchorElMap] = useState({});
    const ITEM_HEIGHT = 48;
    const [numberOfInstructionDetails, setNumberOfInstructionDetails] = useState(0);
    const handleClickMenuInstruction = (event, id) => {
        event.stopPropagation();
        setAnchorElMap((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleCloseMenuInstruction = (id) => {
        setAnchorElMap((prev) => ({ ...prev, [id]: null }));
    };

    useEffect(() => {
        let count = 0;
        course?.instructions?.forEach((instruction) => {
            count += instruction?.instructionDetailResponse?.length;
        });
        setNumberOfInstructionDetails(count);
    }, [course, instructions]);
    // ----------------------------------------------------------------------
    return (
        <Box sx={{ minHeight: '100vh', padding: 4 }}>
            {/* -------------------- Guideline Banner (Image + Title) -------------------- */}
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${getImage(course?.imageUrl)})`,
                    borderRadius: 4,
                    padding: 4,
                }}
            >
                <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', borderRadius: 4, padding: 4 }}>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 900,
                            fontSize: 46,
                            color: '#051D40',
                            mb: 4,
                            textShadow: `
                                -2px -2px 0 #FFFFFF, 
                                2px -2px 0 #FFFFFF, 
                                -2px 2px 0 #FFFFFF, 
                                2px 2px 0 #FFFFFF, 
                                0px -2px 0 #FFFFFF, 
                                0px 2px 0 #FFFFFF, 
                                -2px 0px 0 #FFFFFF, 
                                2px 0px 0 #FFFFFF
                            `,
                        }}
                    >
                        {course?.title || 'Course Title'}
                    </Typography>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button
                            variant="contained"
                            sx={{
                                padding: '12px 20px',
                                backgroundColor:
                                    course?.status === 'INACTIVE' || course?.status === 'DRAFTED' ? 'green' : 'red',
                                ':hover': {
                                    opacity: 0.9,
                                    backgroundColor:
                                        course?.status === 'INACTIVE' || course?.status === 'DRAFTED'
                                            ? 'darkgreen'
                                            : 'darkred',
                                },
                            }}
                            onClick={handleClickToggleCourseStatus}
                        >
                            {isLoadingStartCourse ? (
                                <CircularProgress size={24} />
                            ) : course?.status === 'DRAFTED' || course?.status === 'INACTIVE' ? (
                                'Start this guideline'
                            ) : (
                                'Stop this guideline'
                            )}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ padding: '12px 20px' }}
                            onClick={handleOpenDeleteConfirm}
                        >
                            Delete this guideline
                        </Button>
                    </Box>

                    <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            mt: 2,
                            fontStyle: 'italic',
                            fontSize: '16px',
                        }}
                    >
                        You can create an Instruction before starting the guideline.
                    </Typography>
                </Box>
            </Box>

            {/* -------------------- Confirm Delete Guideline Modal -------------------- */}
            <Modal open={openDeleteConfirm} onClose={handleCloseDeleteConfirm}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 10,
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Confirm Deletion
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Are you sure you want to delete this guideline? This action cannot be undone.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button variant="contained" color="error" onClick={handleDeleteGuideline}>
                            Delete
                        </Button>
                        <Button variant="outlined" onClick={handleCloseDeleteConfirm}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* -------------------- Tab Layout -------------------- */}
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <TabList onChange={handleTabChange} textColor="#051D40">
                        <Tab label="Model" value="1" />
                        <Tab label="3D Model Viewer" value="2" />
                        <Tab label="Instruction" value="3" />
                        {/* <Tab label="Assign" value="4" /> */}
                    </TabList>
                </Box>

                {/* ---------- Tab 1: Model Info & QR Code ---------- */}
                <TabPanel value="1">
                    {isLoadingModel ? (
                        <Box sx={{ textAlign: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
                                {/* Left: QR Code */}
                                <Box
                                    sx={{
                                        width: '30%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 400, fontStyle: 'italic', fontSize: '14px' }}
                                    >
                                        QR Code must be placed on the real model in the 3D Model Editor for correct
                                        alignment.
                                    </Typography>

                                    {/* QR Code */}
                                    <img
                                        src={getImage(course?.qrCode)}
                                        alt="QR Code"
                                        style={{
                                            maxWidth: '100%',
                                            borderRadius: 8,
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />

                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            handleDownloadQrCode(course?.qrCode, `${course?.title}_QRCode.png`)
                                        }
                                    >
                                        Download QR Code
                                    </Button>
                                </Box>

                                {/* Right: Model Info */}
                                <Box
                                    sx={{
                                        width: '60%',
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        textAlign: 'left',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                    }}
                                >
                                    {/* Model Image */}
                                    <img
                                        src={getImage(model?.imageUrl)}
                                        alt="Model Preview"
                                        style={{
                                            width: '200px',
                                            borderRadius: 8,
                                            margin: 'auto auto 16px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                        }}
                                    />

                                    {/* Info */}
                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Model Name
                                        </Typography>
                                        <Typography variant="body1">{model?.name || 'N/A'}</Typography>
                                    </Box>
                                    <Divider />

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Type
                                        </Typography>
                                        <Typography variant="body1">{model?.modelTypeName || 'N/A'}</Typography>
                                    </Box>
                                    <Divider />

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Description
                                        </Typography>
                                        <Typography variant="body1">
                                            {model?.description || 'No description'}
                                        </Typography>
                                    </Box>
                                    <Divider />

                                    <Box sx={{ display: 'flex', mb: 1 }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Version
                                        </Typography>
                                        <Typography variant="body1">{model?.version || 'N/A'}</Typography>
                                    </Box>
                                    <Divider />

                                    <Box sx={{ display: 'flex' }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Scale
                                        </Typography>
                                        <Typography variant="body1">{model?.scale || 'N/A'}</Typography>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </TabPanel>

                {/* ---------- Tab 2: 3D Model Viewer / Editor ---------- */}
                <TabPanel value="2">
                    <Box>
                        <Box sx={{ mt: 4 }}>
                            <ModelEditor modelId={model?.id} action="UpdateModelGuideline" />
                        </Box>
                    </Box>
                </TabPanel>

                {/* ---------- Tab 3: Instructions ---------- */}
                <TabPanel value="3">
                    <Box>
                        {isLoadingSections ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : instructions.length === 0 ? (
                            <Typography>No Instruction available. Please add an Instruction.</Typography>
                        ) : (
                            instructions.map((instruction) => (
                                <Accordion
                                    key={instruction.id}
                                    expanded={expandedFAQ === `section${instruction.id}`}
                                    onChange={handleChangeFAQ(`section${instruction.id}`)}
                                    sx={{
                                        border: '1px solid #dee2e6',
                                        boxShadow: 'none',
                                        mb: 2,
                                        padding: 1,
                                        color: '#051D40',
                                    }}
                                >
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                width: '100%',
                                                justifyContent: 'space-between',
                                            }}
                                        >
                                            <Typography fontSize={24} fontWeight={700}>
                                                {instruction.name}
                                            </Typography>
                                            <div>
                                                <IconButton
                                                    aria-label="more"
                                                    onClick={(event) =>
                                                        handleClickMenuInstruction(event, instruction.id)
                                                    }
                                                >
                                                    <MoreVerticalIcon />
                                                </IconButton>
                                                <Menu
                                                    anchorEl={anchorElMap[instruction.id]}
                                                    open={Boolean(anchorElMap[instruction.id])}
                                                    onClose={() => handleCloseMenuInstruction(instruction.id)}
                                                    slotProps={{
                                                        paper: {
                                                            style: {
                                                                maxHeight: ITEM_HEIGHT * 4.5,
                                                                width: '20ch',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={() => handleEditInstruction(instruction.id)}>
                                                        Update
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => handleClickDeleteInstruction(instruction.id)}
                                                    >
                                                        Delete
                                                    </MenuItem>
                                                    <MenuItem
                                                        onClick={() => handleClickSwapOrderIntruction(instruction.id)}
                                                    >
                                                        Swap Order
                                                    </MenuItem>
                                                </Menu>
                                            </div>
                                        </Box>
                                    </AccordionSummary>
                                    <Divider />

                                    {instruction.instructionDetailResponse?.length > 0 ? (
                                        instruction.instructionDetailResponse.map((detail) => (
                                            <Box key={detail.id}>
                                                <AccordionDetails sx={{ py: 3 }}>
                                                    <Box sx={{ mb: 1, pl: 2 }}>
                                                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                            <div>
                                                                <IconButton
                                                                    aria-label="more"
                                                                    onClick={(event) =>
                                                                        handleClickMenuInstruction(event, detail.id)
                                                                    }
                                                                >
                                                                    <MoreVerticalIcon />
                                                                </IconButton>
                                                                <Menu
                                                                    anchorEl={anchorElMap[detail.id]}
                                                                    open={Boolean(anchorElMap[detail.id])}
                                                                    onClose={() =>
                                                                        handleCloseMenuInstruction(detail.id)
                                                                    }
                                                                    slotProps={{
                                                                        paper: {
                                                                            style: {
                                                                                maxHeight: ITEM_HEIGHT * 4.5,
                                                                                width: '20ch',
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    <MenuItem
                                                                        onClick={() => handleEditLesson(detail.id)}
                                                                    >
                                                                        Update
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() =>
                                                                            handleClickDeleteSection(detail.id)
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() =>
                                                                            handleClickSwapOrderIntructionDetail(
                                                                                detail.id,
                                                                                instruction.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Swap Order
                                                                    </MenuItem>
                                                                </Menu>
                                                            </div>
                                                            <File />
                                                            <Typography variant="body2" fontSize={16}>
                                                                {detail.name}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </AccordionDetails>
                                                <Divider />
                                            </Box>
                                        ))
                                    ) : (
                                        <Typography sx={{ my: 2 }}>No instruction detail in this section.</Typography>
                                    )}

                                    <Button
                                        variant="contained"
                                        onClick={() => handleOpenAddLessonDialog(instruction.id)}
                                        sx={{
                                            my: 2,
                                            borderRadius: '24px',
                                            padding: '12px 20px',
                                            backgroundColor: '#48A6A7',
                                            ':hover': {
                                                backgroundColor: '#48A6A7',
                                                opacity: '0.8',
                                            },
                                        }}
                                    >
                                        + Add an Instruction Detail
                                    </Button>
                                </Accordion>
                            ))
                        )}
                        <Button
                            variant="contained"
                            onClick={handleOpenAddSectionDialog}
                            fullWidth
                            sx={{
                                mt: 4,
                                border: '2px dashed darkgrey',
                                padding: 2,
                                backgroundColor: '#f5f5f5',
                                boxShadow: 'none',
                                color: '#0f6cbf',
                                ':hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '2px solid #0f6cbf',
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            + Add Instruction
                        </Button>
                    </Box>
                </TabPanel>

                {/* ---------- Tab 4: Assign Employee ---------- */}
                <TabPanel value="4">
                    <AssignEmployee courseId={courseId} managerId={userInfo?.id} companyId={userInfo?.company?.id} />
                </TabPanel>
            </TabContext>

            {/* -------------------- Dialogs for Start/Stop Course -------------------- */}
            <Dialog
                open={openCourseStatusDialog}
                onClose={() => setOpenCourseStatusDialog(false)}
                aria-labelledby="start-stop-dialog-title"
            >
                <DialogTitle id="start-stop-dialog-title">
                    {course?.status === 'DRAFTED' || course?.status === 'INACTIVE'
                        ? 'Start guideline'
                        : 'Stop guideline'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {course?.status === 'DRAFTED' || course?.status === 'INACTIVE'
                            ? 'Are you sure you want to start this guideline?'
                            : 'Are you sure you want to stop this guideline?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCourseStatusDialog(false)}>Cancel</Button>
                    <Button
                        sx={{ backgroundColor: 'red', color: 'white' }}
                        onClick={handleStartCourse}
                        disabled={isLoadingStartCourse}
                    >
                        {isLoadingStartCourse ? (
                            <CircularProgress size={24} />
                        ) : course?.status === 'INACTIVE' ? (
                            'Start'
                        ) : (
                            'Stop'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Add Instruction Dialog -------------------- */}
            <Dialog open={openAddSectionDialog} onClose={handleCloseAddSectionDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Instruction</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Fill out the form below to add a new instruction to the guideline.
                    </DialogContentText>
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Instruction Title"
                        value={instructionName}
                        onChange={(e) => setInstructionName(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Instruction Description"
                        multiline
                        minRows={3}
                        value={instructionDescription}
                        onChange={(e) => setInstructionDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddSectionDialog} disabled={isCreating}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateInstruction} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Update Instruction Dialog -------------------- */}
            <Dialog
                open={openUpdateInstructionDialog}
                onClose={handleCloseUpdateInstructionDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>Update Instruction</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Name"
                        value={nameForInstruction}
                        onChange={(e) => setNameForInstruction(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={descriptionForInstruction}
                        onChange={(e) => setDescriptionForInstruction(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdateInstructionDialog} disabled={isUpdatingForInstruction}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateInstruction} disabled={isUpdatingForInstruction}>
                        {isUpdatingForInstruction ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Delete Instruction Confirm -------------------- */}
            <Dialog
                open={openDeleteInstructionDialog}
                onClose={handleCloseDeleteInstructionDialog}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">{'Delete Instruction'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this instruction? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteInstructionDialog}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteInstruction}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Add Instruction Detail Dialog -------------------- */}
            <Dialog open={openAddLessonDialog} onClose={handleCloseAddLessonDialog} fullWidth maxWidth="xl">
                <DialogTitle>Add New Instruction Detail</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to create a new instruction detail.
                    </DialogContentText>
                    {/* The ModelEditor can handle the creation of the detail with position data */}
                    {openEditor && (
                        <ModelEditor
                            modelId={model?.id}
                            action="CreateInstructionDetail"
                            currentInstructionId={currentSectionId}
                            handleCloseModal={() => {
                                setOpenEditor(false);
                                setOpenAddLessonDialog(false);
                                fetchInstructionByCourseId();
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddLessonDialog} disabled={isCreatingLesson}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Update Instruction Detail Dialog -------------------- */}
            <Dialog open={openUpdateLessonDialog} onClose={handleCloseUpdateLessonDialog} fullWidth maxWidth="xl">
                <DialogTitle>Update Instruction Detail</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to update this instruction detail.
                    </DialogContentText>
                    {openEditor && (
                        <ModelEditor
                            modelId={model?.id}
                            action="UpdateInstructionDetail"
                            currentInstructionDetailId={currentInstructionDetailId}
                            handleCloseModal={() => {
                                setOpenEditor(false);
                                setOpenUpdateLessonDialog(false);
                                fetchInstructionByCourseId();
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdateLessonDialog} disabled={isUpdatingForInstructionDetail}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Delete Instruction Detail Confirm -------------------- */}
            <Dialog
                open={openDeleteSectionDialog}
                onClose={handleCloseDeleteSectionDialog}
                aria-labelledby="alert-dialog-title"
            >
                <DialogTitle id="alert-dialog-title">{'Delete Instruction Detail'}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this instruction detail? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteSectionDialog}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteSection}>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Swap Instruction Detail Order Dialog -------------------- */}
            <Dialog open={openSwapOrderDialog} onClose={handleCloseSwapOrderIntructionDetail}>
                <DialogTitle>Swap Order Number</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Current Order Number"
                        value={instructionDetailCurrent?.orderNumber || ''}
                        fullWidth
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        margin="dense"
                    />
                    <TextField
                        select
                        label="Order Number to Swap"
                        fullWidth
                        margin="dense"
                        value={instructionDetailIdToSwap}
                        onChange={(e) => setInstructionDetailIdToSwap(e.target.value)}
                    >
                        {instructionDetailList
                            .filter((item) => item.id !== instructionDetailIdCurrent)
                            .map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name} - {item.orderNumber}
                                </MenuItem>
                            ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSwapOrderIntructionDetail}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'blue', color: 'white' }} onClick={handleClickSaveSwapOrder}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Swap Instruction Order Dialog -------------------- */}
            <Dialog open={openSwapOrderDialogForInstruction} onClose={handleCloseSwapOrderIntruction}>
                <DialogTitle>Swap Order Number</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Current Order Number"
                        value={instructionIdCurrentForFindById?.orderNumber || ''}
                        fullWidth
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        margin="dense"
                    />
                    <TextField
                        select
                        label="Order Number to Swap"
                        fullWidth
                        margin="dense"
                        value={instructionIdToSwap}
                        onChange={(e) => setInstructionIdToSwap(e.target.value)}
                    >
                        {instructionList
                            .filter((item) => item.id !== instructionIdCurrentForSwap)
                            .map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.name} - {item.orderNumber}
                                </MenuItem>
                            ))}
                    </TextField>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseSwapOrderIntruction}>Cancel</Button>
                    <Button
                        sx={{ backgroundColor: 'blue', color: 'white' }}
                        onClick={handleClickSaveSwapOrderForInstruction}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* -------------------- Start/Stop Course Dialog -------------------- */}
            <Dialog
                open={openCourseStatusDialog}
                onClose={() => setOpenCourseStatusDialog(false)}
                aria-labelledby="start-stop-dialog-title"
            >
                <DialogTitle id="start-stop-dialog-title">
                    {course?.status === 'DRAFTED' || course?.status === 'INACTIVE'
                        ? 'Start guideline'
                        : 'Stop guideline'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {course?.status === 'DRAFTED'
                            ? `its will cost ${
                                  numberOfInstructionDetails * 3
                              } points, Are you sure you want to start this guideline ? `
                            : course?.status === 'INACTIVE'
                            ? 'Are you sure you want to start this guideline ?'
                            : 'Are you sure you want to stop this guideline?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCourseStatusDialog(false)}>Cancel</Button>
                    <Button
                        sx={{ backgroundColor: 'red', color: 'white' }}
                        onClick={handleStartCourse}
                        disabled={isLoadingStartCourse}
                    >
                        {isLoadingStartCourse ? (
                            <CircularProgress size={24} />
                        ) : course?.status === 'DRAFTED' || course?.status === 'INACTIVE' ? (
                            'Start'
                        ) : (
                            'Stop'
                        )}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
