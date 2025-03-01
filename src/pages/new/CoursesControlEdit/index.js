// CoursesControlEdit.jsx

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    FormControl,
    IconButton,
    InputLabel,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Menu,
    MenuItem,
    Pagination,
    Select,
    Tab,
    TextField,
    Typography,
    Modal,
} from '@mui/material';
import { File, FileText, MoreVerticalIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AccountAPI from '~/API/AccountAPI';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DOMPurify from 'dompurify';
import CourseAPI from '~/API/CourseAPI';
import EnrollmentAPI from '~/API/EnrollmentAPI';
import InstructionAPI from '~/API/InstructionAPI';
import InstructionDetailAPI from '~/API/InstructionDetailAPI';
import ModelAPI from '~/API/ModelAPI';
import QuizAPI from '~/API/QuizAPI';
import MyEditor from '~/components/MyEditor';
import storageService from '~/components/StorageService/storageService';
import { getImage } from '~/Constant';
import ModelViewer from '~/components/ModelViewer';
import modelTest from '~/assets/models/mouseclean.glb';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CoursesControlEdit() {
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    const navigate = useNavigate();

    // ==================== Tab State ====================
    const [tabValue, setTabValue] = useState('1');
    const handleTabChange = (e, newValue) => setTabValue(newValue);

    // ==================== FAQ Accordion State ====================
    const [expandedFAQ, setExpandedFAQ] = useState(false);
    const handleChangeFAQ = (panel) => (e, isExpanded) => {
        setExpandedFAQ(isExpanded ? panel : false);
    };

    // ==================== Quiz & Questions State ====================
    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [questionErrors, setQuestionErrors] = useState([]);

    // == For Quiz Editing ==
    const [quizTitle, setQuizTitle] = useState('');
    const [quizDescription, setQuizDescription] = useState('');
    const [isLoadingQuiz, setIsLoadingQuiz] = useState(true);
    const [openEditQuiz, setOpenEditQuiz] = useState(false);
    const [isLoadingEditQuiz, setIsLoadingEditQuiz] = useState(false);

    // == For Displaying Question Accordions ==
    const [expandedQuestion, setExpandedQuestion] = useState(false);

    // == Extract Course ID from URL ==
    const { id: courseId } = useParams();

    // == Initialize Question Errors ==
    const initQuestionErrors = (qs) =>
        qs.map(() => ({
            questionError: '',
            answerErrors: ['', '', '', ''],
        }));

    // ==================== Sections State ====================
    const [sections, setSections] = useState([]);
    const [isLoadingSections, setIsLoadingSections] = useState(true);

    // == Add Section Dialog State ==
    const [openAddSectionDialog, setOpenAddSectionDialog] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionDescription, setNewSectionDescription] = useState('');
    const [newSectionDuration, setNewSectionDuration] = useState('');
    const [isCreatingSection, setIsCreatingSection] = useState(false);

    // == Add Lesson Dialog State ==
    const [openAddLessonDialog, setOpenAddLessonDialog] = useState(false);
    const [selectedLessonType, setSelectedLessonType] = useState('');
    const [newLessonData, setNewLessonData] = useState({});
    const [isCreatingLesson, setIsCreatingLesson] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState(null);

    // == Course Data State ==
    const [course, setCourse] = useState();
    const [isLoadingCourse, setIsLoadingCourse] = useState(true);

    // == Start/Stop Course State ==
    const [isLoadingStartCourse, setIsLoadingStartCourse] = useState(false);
    const [openCourseStatusDialog, setOpenCourseStatusDialog] = useState(false);

    // ==================== Menu ====================
    const options = ['Edit', 'Delete'];

    const ITEM_HEIGHT = 48;
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);

    const handleClickMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleCloseMenu = () => {
        setAnchorEl(null);
    };
    // ==================== Fetch Quiz & Questions ====================
    const fetchQuestions = async (quizId) => {
        if (!quizId) return;
        try {
            const res = await QuizAPI.getQuestionByQuizId(quizId);
            const loadedQs =
                res?.result.map((q) => ({
                    id: q.id, // store question's ID
                    isSaved: true,
                    question: q.question,
                    answers: q.optionResponses.map((o) => ({
                        id: o.id, // store answer's ID
                        option: o.option,
                        isRight: o.isRight,
                    })),
                })) || [];

            setQuestions(loadedQs);
            setQuestionErrors(initQuestionErrors(loadedQs));
        } catch (err) {
            console.error('Failed to fetch questions:', err);
        }
    };

    // ==================== Fetch Quiz ====================
    const fetchQuiz = async () => {
        try {
            const res = await QuizAPI.getByCourseId(courseId);
            const loadedQuiz = res?.result || {};
            setQuiz(loadedQuiz);
            if (loadedQuiz.id) {
                await fetchQuestions(loadedQuiz.id);
            }
        } catch (error) {
            console.error('Failed to fetch quiz:', error);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    // ==================== Fetch Sections ====================
    const fetchSections = async () => {
        try {
            setIsLoadingSections(true);
            const response = await CourseAPI.getSections(courseId); // Ensure this method exists
            setSections(response?.result || []);
        } catch (error) {
            console.error('Failed to fetch sections:', error);
        } finally {
            setIsLoadingSections(false);
        }
    };

    // ==================== Fetch Course Data ====================
    const fetchCourse = async () => {
        try {
            setIsLoadingCourse(true);
            const response = await CourseAPI.getById(courseId);
            setCourse(response?.result);
        } catch (error) {
            console.error('Failed to fetch course:', error);
        } finally {
            setIsLoadingCourse(false);
        }
    };
    const [model, setModel] = useState();
    const [isLoadingModel, setIsLoadingModel] = useState(true);
    const fetchModel = async () => {
        try {
            setIsLoadingModel(true);
            const response = await ModelAPI.getById(course?.modelId);
            setModel(response?.result);
        } catch (error) {
            console.error('Failed to fetch model:', error);
        } finally {
            setIsLoadingModel(false);
        }
    };

    // ==================== useEffect for Initial Data Fetching ====================
    useEffect(() => {
        fetchCourse();
        fetchQuiz();
        fetchSections();
    }, [courseId]);

    useEffect(() => {
        fetchModel();
    }, [course]);

    // ==================== Edit Quiz Dialog Handlers ====================
    const handleClickOpenEditQuiz = () => {
        setQuizTitle(quiz?.title || '');
        setQuizDescription(quiz?.description || '');
        setOpenEditQuiz(true);
    };
    const handleCloseEditQuiz = () => {
        setOpenEditQuiz(false);
    };
    const validateQuiz = () => {
        if (!quizTitle.trim()) {
            alert('Please enter the quiz title');
            return false;
        }
        return true;
    };
    const handleUpdateQuiz = async () => {
        setIsLoadingEditQuiz(true);
        try {
            if (!validateQuiz()) {
                setIsLoadingEditQuiz(false);
                return;
            }
            await QuizAPI.updateQuiz({
                quizId: quiz?.id,
                courseId: quiz?.courseId,
                title: quizTitle,
                description: quizDescription,
            });
            setQuiz((prev) => {
                if (!prev) return null;
                return { ...prev, title: quizTitle, description: quizDescription };
            });
            setOpenEditQuiz(false);
        } catch (err) {
            alert('Failed to update quiz. Please try again.');
            console.error(err);
        } finally {
            setIsLoadingEditQuiz(false);
        }
    };

    const handleCreateQuiz = async () => {
        if (!quizTitle.trim()) {
            alert('Please enter the quiz title');
            return;
        }
        setIsLoadingQuiz(true);
        try {
            const res = await QuizAPI.create({
                courseId,
                title: quizTitle,
                description: quizDescription,
            });
            setQuiz(res?.result);
        } catch (err) {
            alert('Failed to create quiz. Please try again.');
            console.error(err);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    // ==================== Video Upload Handlers ====================
    const handleVideoUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!file.type.startsWith('video/')) {
                alert('Please select a valid video file.');
                return;
            }

            handleLessonInputChange('videoFile', file); // Store file in state

            // Read video duration using a hidden video element
            const videoElement = document.getElementById('video-preview');
            const objectURL = URL.createObjectURL(file);
            videoElement.src = objectURL;

            videoElement.onloadedmetadata = () => {
                const durationInMinutes = Math.ceil(videoElement.duration / 60); // Convert seconds to minutes
                handleLessonInputChange('duration', durationInMinutes);
                URL.revokeObjectURL(objectURL); // Free memory
            };
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];

        if (file) {
            // Ensure only allowed non-video file types are selected
            if (file.type.startsWith('video/')) {
                alert('Please select a document or non-video file.');
                return;
            }

            handleLessonInputChange('attachFileUrl', file);
        }
    };

    const [openVideoDialog, setOpenVideoDialog] = useState(false);
    const [lessonDetails, setLessonDetails] = useState(null);
    const [videoSrc, setVideoSrc] = useState('');
    const [videoType, setVideoType] = useState('');
    const [loadingVideo, setLoadingVideo] = useState(false); // Loading state
    const handleOpenVideoDialog = async (lesson) => {
        try {
            setLessonDetails(lesson); // Store lesson details (title, description, etc.)

            setOpenVideoDialog(true);
            setLoadingVideo(true);
            const response = await CourseAPI.readVideo(lesson?.videoUrl); // Ensure this method exists
            // Convert Blob to Object URL
            const videoObjectUrl = URL.createObjectURL(response);
            setVideoSrc(videoObjectUrl);
            setVideoType(videoType); // Store detected video type
            setLoadingVideo(false);
        } catch (error) {
            console.error('Error fetching video:', error);
            alert(`Failed to load video. Error: ${error.message}`);
        }
    };

    const handleCloseVideoDialog = () => {
        setOpenVideoDialog(false);
        setVideoSrc('');
    };

    const handleDownloadFile = async (fileUrl, fileName = 'attachment') => {
        try {
            const response = await CourseAPI.readVideo(fileUrl);

            // Create a Blob URL
            const fileObjectUrl = URL.createObjectURL(response);

            // Create a temporary <a> element to trigger the download
            const link = document.createElement('a');
            link.href = fileObjectUrl;
            link.download = fileName || 'downloaded-file'; // Set the file name
            document.body.appendChild(link);
            link.click();

            // Clean up after download
            document.body.removeChild(link);
            URL.revokeObjectURL(fileObjectUrl);
        } catch (error) {
            console.error('Error downloading file:', error);
            alert(`Failed to download file. Error: ${error.message}`);
        }
    };

    // ==================== Add & Create Question Handlers ====================
    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                isSaved: false,
                question: '',
                answers: [
                    { option: '', isRight: true },
                    { option: '', isRight: false },
                    { option: '', isRight: false },
                    { option: '', isRight: false },
                ],
            },
        ]);
        setQuestionErrors((prev) => [
            ...prev,
            {
                questionError: '',
                answerErrors: ['', '', '', ''],
            },
        ]);
        const newIndex = questions.length;
        setExpandedQuestion(`panel${newIndex}`);
    };

    const createQuestion = async (qIndex) => {
        setIsLoadingQuiz(true);
        const currentQ = questions[qIndex];
        const newErr = {
            questionError: '',
            answerErrors: new Array(currentQ.answers.length).fill(''),
        };

        // Validation
        if (!currentQ.question.trim()) {
            newErr.questionError = 'Please enter the question text';
        }
        currentQ.answers.forEach((ans, i) => {
            if (!ans.option.trim()) {
                newErr.answerErrors[i] = `Answer ${String.fromCharCode(65 + i)} is required`;
            }
        });
        if (!currentQ.answers.some((ans) => ans.isRight)) {
            newErr.questionError = 'Please select a correct answer';
        }

        const hasError = newErr.questionError || newErr.answerErrors.some((e) => e !== '');
        setQuestionErrors((prev) => {
            const updated = [...prev];
            updated[qIndex] = newErr;
            return updated;
        });

        if (hasError) {
            setIsLoadingQuiz(false);
            return;
        }

        try {
            await QuizAPI.createQuestionByQuizId({
                quizId: quiz?.id,
                question: currentQ.question,
                optionCreationRequests: currentQ.answers,
            });
            setQuestions((prev) => {
                const updated = [...prev];
                updated[qIndex].isSaved = true;
                return updated;
            });
            await fetchQuestions(quiz?.id);
        } catch (err) {
            alert('Failed to create question. Please try again.');
            console.error(err);
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    const handleQuestionChange = (qIndex, text) => {
        const updated = [...questions];
        updated[qIndex].question = text;
        setQuestions(updated);
    };
    const handleAnswerChange = (qIndex, aIndex, text) => {
        const updated = [...questions];
        updated[qIndex].answers[aIndex].option = text;
        setQuestions(updated);
    };
    const handleCorrectAnswerChange = (qIndex, correctIndex) => {
        const updated = [...questions];
        updated[qIndex].answers.forEach((ans, i) => {
            ans.isRight = i.toString() === correctIndex;
        });
        setQuestions(updated);
    };

    // ==================== Edit Question Dialog Handlers ====================
    const [openEditQuestion, setOpenEditQuestion] = useState(false);
    const [isLoadingEditQuestion, setIsLoadingEditQuestion] = useState(false);

    const [editQuestion, setEditQuestion] = useState(null);
    const [editQuestionErrors, setEditQuestionErrors] = useState({
        questionError: '',
        answerErrors: ['', '', '', ''],
    });

    const handleClickOpenEditQuestion = (qIndex) => {
        setEditQuestion(questions[qIndex]);
        setEditQuestionErrors({
            questionError: '',
            answerErrors: ['', '', '', ''],
        });
        setOpenEditQuestion(true);
    };
    const handleCloseEditQuestion = () => {
        setOpenEditQuestion(false);
        setEditQuestion(null);
        setEditQuestionErrors({
            questionError: '',
            answerErrors: ['', '', '', ''],
        });
    };

    const handleChangeEditQuestion = (value) => {
        setEditQuestion((prev) => ({ ...prev, question: value }));
    };
    const handleAnswerChangeEditQuestion = (index, value) => {
        setEditQuestion((prev) => {
            const updatedAnswers = [...prev.answers];
            updatedAnswers[index].option = value;
            return { ...prev, answers: updatedAnswers };
        });
    };
    const handleCorrectAnswerChangeEditQuestion = (index) => {
        setEditQuestion((prev) => {
            const updatedAnswers = prev.answers.map((ans, idx) => ({
                ...ans,
                isRight: idx === index,
            }));
            return { ...prev, answers: updatedAnswers };
        });
    };

    const validateEditQuestion = () => {
        let questionError = '';
        const answerErrors = ['', '', '', ''];

        if (!editQuestion.question.trim()) {
            questionError = 'Please enter the question text';
        }
        editQuestion.answers.forEach((ans, i) => {
            if (!ans.option.trim()) {
                answerErrors[i] = `Answer ${String.fromCharCode(65 + i)} is required`;
            }
        });
        if (!editQuestion.answers.some((ans) => ans.isRight)) {
            questionError = questionError || 'Please select a correct answer';
        }

        setEditQuestionErrors({
            questionError,
            answerErrors,
        });

        return !questionError && answerErrors.every((e) => !e);
    };

    const handleUpdateQuestion = async () => {
        if (!validateEditQuestion()) return;

        setIsLoadingEditQuestion(true);
        try {
            await QuizAPI.updateQuestion({
                questionId: editQuestion.id,
                question: editQuestion.question,
                optionCreationRequests: editQuestion.answers.map((ans) => ({
                    id: ans.id,
                    option: ans.option,
                    isRight: ans.isRight,
                })),
            });
            await fetchQuestions(quiz?.id);
            setOpenEditQuestion(false);
            setEditQuestion(null);
        } catch (err) {
            console.error(err);
            alert('Failed to update question. Please try again.');
        } finally {
            setIsLoadingEditQuestion(false);
        }
    };

    // ==================== Delete Question Dialog Handlers ====================
    const [openDeleteQuestion, setOpenDeleteQuestion] = useState(false);
    const [deleteQuestionId, setDeleteQuestionId] = useState(null);

    const handleClickOpenDeleteQuestion = (qIndex) => {
        setDeleteQuestionId(questions[qIndex].id);
        setOpenDeleteQuestion(true);
    };
    const handleCloseDeleteQuestion = () => {
        setOpenDeleteQuestion(false);
        setDeleteQuestionId(null);
    };

    const handleDeleteQuestion = async () => {
        try {
            setOpenDeleteQuestion(false);
            setIsLoadingQuiz(true);
            if (deleteQuestionId) {
                await QuizAPI.deleteQuestion(deleteQuestionId);
            }
            await fetchQuestions(quiz?.id);
        } catch (err) {
            console.error(err);
            alert('Failed to delete question. Please try again.');
        } finally {
            setIsLoadingQuiz(false);
        }
    };

    // ==================== Start/Stop Course Handlers ====================
    const handleClickToggleCourseStatus = () => {
        // If there's no quiz but user attempts "start"
        if (instructions.length <= 0 && instructions?.status === 'INACTIVE') {
            toast.alert('Please create a instruction before starting the guideline!');
            return;
        }
        setOpenCourseStatusDialog(true);
    };

    const handleStartCourse = async () => {
        try {
            setIsLoadingStartCourse(true);
            if (!course) return;
            const updateResponse = await CourseAPI.changeStatus(courseId);
            fetchCourse();
        } catch (error) {
            console.error('Failed to update course status:', error);
        } finally {
            setIsLoadingStartCourse(false);
            setOpenCourseStatusDialog(false); // Close dialog
        }
    };

    // ==================== Add Section Handlers ====================
    const handleOpenAddSectionDialog = () => {
        setNewSectionTitle('');
        setNewSectionDescription('');
        setNewSectionDuration('');
        setOpenAddSectionDialog(true);
    };

    const handleCreateSection = async () => {
        // Basic Validation
        if (!newSectionTitle.trim()) {
            alert('Please enter the section title.');
            return;
        }

        setIsCreatingSection(true);
        try {
            const newSectionPayload = {
                courseId: courseId,
                title: newSectionTitle,
                description: newSectionDescription,
            };

            const response = await CourseAPI.createSection(newSectionPayload); // Ensure this method exists

            if (response?.result) {
                setSections((prev) => [...prev, response.result]);
                handleCloseAddSectionDialog();
            }
        } catch (error) {
            console.error('Failed to create section:', error);
            alert('Failed to create section. Please try again.');
        } finally {
            setIsCreatingSection(false);
        }
    };

    // ==================== Add Lesson Handlers ====================
    const handleOpenAddLessonDialog = (instructionId) => {
        setCurrentSectionId(instructionId);
        setNewLessonData({});
        setOpenAddLessonDialog(true);
    };

    const handleLessonTypeChange = (e) => {
        setSelectedLessonType(e.target.value);
        setNewLessonData({});
    };

    const handleLessonInputChange = (field, value) => {
        setNewLessonData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateLesson = async () => {
        // Basic validation
        if (!selectedLessonType) {
            alert('Please select a lesson type.');
            return;
        }

        if (!newLessonData.title) {
            alert('Please enter the lesson title.');
            return;
        }

        if (selectedLessonType === 'READING' && (!newLessonData.content || newLessonData.content.length <= 0)) {
            alert('Please enter the content for the reading lesson.');
            return;
        }

        if (selectedLessonType === 'VIDEO' && !newLessonData.videoFile) {
            alert('Please select a video file.');
            return;
        }

        setIsCreatingLesson(true);
        try {
            const formData = new FormData();
            formData.append('lessonId', currentSectionId); // Associate with section
            formData.append('type', selectedLessonType.toUpperCase());
            formData.append('duration', newLessonData.duration || 0);
            formData.append('title', newLessonData.title);

            if (selectedLessonType === 'VIDEO' && newLessonData.videoFile) {
                formData.append('description', newLessonData.description || '');
                formData.append('videoUrl', newLessonData.videoFile); // Video file
            }

            if (selectedLessonType === 'READING') {
                formData.append('content', newLessonData.content);
                console.log(newLessonData.content);
            }

            if (newLessonData.attachFileUrl) {
                formData.append('attachFileUrl', newLessonData.attachFileUrl); // Additional file
            }

            const response = await CourseAPI.createLesson(formData);

            if (response?.result) {
                alert('Lesson created successfully!');
                fetchSections();
                handleCloseAddLessonDialog();
            }
        } catch (error) {
            console.error('Failed to create lesson:', error);
            alert('Failed to create lesson. Please try again.');
        } finally {
            setIsCreatingLesson(false);
        }
    };

    const [openDeleteSectionDialog, setOpenDeleteSectionDialog] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState('');
    // Open the delete confirmation dialog
    const handleClickDeleteSection = (sectionId) => {
        setSectionToDelete(sectionId);
        setOpenDeleteSectionDialog(true);
    };

    // Close the delete confirmation dialog
    const handleCloseDeleteSectionDialog = () => {
        setOpenDeleteSectionDialog(false);
        setSectionToDelete(null);
    };

    const [openDeleteInstructionDialog, setOpenDeleteInstructionDialog] = useState(false);
    const [instructionToDelete, setInstructionToDelete] = useState('');

    const handleClickDeleteInstruction = (sectionId) => {
        setInstructionToDelete(sectionId);
        setOpenDeleteInstructionDialog(true);
    };

    const handleCloseDeleteInstructionDialog = () => {
        setOpenDeleteInstructionDialog(false);
        setInstructionToDelete(null);
    };

    const handleDeleteInstruction = async (event) => {
        try {
            setIsLoadingSections(true);
            await InstructionAPI.deleteById(instructionToDelete);
            fetchInstructionByCourseId();
            setOpenDeleteInstructionDialog(false);
            toast.success('Instruction deleted successfully!');
        } catch (error) {
            console.error('Failed to delete instruction:', error);
            toast.error('Failed to delete instruction. Please try again.');
        } finally {
            setIsLoadingSections(false);
        }
    };
    //Open handleSwapOrderInstructionDetail
    const [instructionIdCurrent, setInstructionIdCurrent] = useState('');
    const [instructionDetailIdCurrent, setInstructionDetailIdCurrent] = useState('');
    const [instructionDetailIdToSwap, setInstructionDetailIdToSwap] = useState('');
    const [openSwapOrderDialog, setOpenSwapOrderDialog] = useState(false);
    const [instructionDetailList, setInstructionDetailList] = useState([]);
    const [instructionDetailCurrent, setInstructionDetailCurrent] = useState({});
    const handleClickSwapOrderIntructionDetail = (instructionDetailId, instructionId) => {
        setInstructionDetailIdCurrent(instructionDetailId);
        console.log(instructionId);
        fetchInstructionDetailById(instructionDetailId);
        setInstructionIdCurrent(instructionId);
        setOpenSwapOrderDialog(true);
    };

    useEffect(() => {
        console.log(instructionDetailIdToSwap);
    }, [instructionDetailIdToSwap]);

    const handleClickSaveSwapOrder = async () => {
        try {
            const response = await InstructionDetailAPI.swapOrder(
                instructionDetailIdCurrent,
                instructionDetailIdToSwap,
            );

            if (response?.result) {
                toast.success('Instruction Detail swapped successfully!');
                fetchInstructionByCourseId();
                handleCloseSwapOrderIntructionDetail();
            }
        } catch (error) {
            console.error('Failed to swap Instruction Detail:', error);
            toast.error('An error occurred while swapping Instruction Detail.');
        }
    };

    const handleCloseSwapOrderIntructionDetail = () => {
        setInstructionDetailIdCurrent('');
        setInstructionDetailIdToSwap('');
        setInstructionDetailIdCurrent('');
        setInstructionIdCurrent('');
        setInstructionDetailList([]);
        setOpenSwapOrderDialog(false);
    };

    const fetchInstructionDetailByInstructionId = async () => {
        try {
            const response = await InstructionDetailAPI.getByInstructionId(instructionIdCurrent);
            const data = response?.result || [];
            console.log(data);
            setInstructionDetailList(data);
        } catch (error) {
            console.error('Failed to fetch instruction detail:', error);
        }
    };

    const fetchInstructionDetailById = async (id) => {
        try {
            const response = await InstructionDetailAPI.getById(id);
            const data = response?.result || [];
            console.log(data);
            setInstructionDetailCurrent(data);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    };

    useEffect(() => {
        fetchInstructionDetailByInstructionId();
    }, [instructionIdCurrent]);
    //Close handleSwapOrderInstructionDetail

    //Open handleSwapOrderInstruction
    const [instructionIdCurrentForFindById, setInstructionIdCurrentForFindById] = useState({});
    const [instructionIdCurrentForSwap, setInstructionIdCurrentForSwap] = useState('');
    const [instructionIdToSwap, setInstructionIdToSwap] = useState('');
    const [openSwapOrderDialogForInstruction, setOpenSwapOrderDialogForInstruction] = useState(false);
    const [instructionList, setInstructionList] = useState([]);
    const handleClickSwapOrderIntruction = (instructionId) => {
        setInstructionIdCurrentForSwap(instructionId);
        fetchInstructionById(instructionId);
        fetchInstructionByCourseIdToSwap();
        setOpenSwapOrderDialogForInstruction(true);
    };

    const handleCloseSwapOrderIntruction = () => {
        setInstructionIdCurrentForFindById({});
        setInstructionIdCurrentForSwap('');
        setInstructionIdToSwap('');
        setInstructionList([]);
        setOpenSwapOrderDialogForInstruction(false);
    };

    const fetchInstructionById = async (instructionId) => {
        try {
            const response = await InstructionAPI.getById(instructionId);
            const data = response?.result || {};
            setInstructionIdCurrentForFindById(data);
        } catch (error) {
            console.error('Failed to fetch Instruction:', error);
        }
    };

    const fetchInstructionByCourseIdToSwap = async () => {
        try {
            const response = await InstructionAPI.getByCourseToSwap(courseId);
            const data = response?.result || {};
            setInstructionList(data);
        } catch (error) {
            console.error('Failed to fetch Instructions:', error);
        }
    };

    const handleClickSaveSwapOrderForInstruction = async () => {
        try {
            const response = await InstructionAPI.swapOrder(instructionIdCurrentForSwap, instructionIdToSwap);

            if (response?.result) {
                toast.success('Instruction swapped successfully!');
                fetchInstructionByCourseId();
                handleCloseSwapOrderIntruction();
            }
        } catch (error) {
            console.error('Failed to swap Instruction:', error);
            toast.error('An error occurred while swapping Instruction.');
        }
    };

    // Delete section logic
    const handleDeleteSection = async () => {
        try {
            setIsLoadingSections(true);
            // Call API to delete the section
            await InstructionDetailAPI.deleteByIddeleteById(sectionToDelete);
            // Remove the deleted section from the list
            setSections((prevSections) => prevSections.filter((section) => section.id !== sectionToDelete));
            fetchInstructionByCourseId();
            setOpenDeleteSectionDialog(false);
            toast.success('Instruction detail deleted successfully!');
        } catch (error) {
            console.error('Failed to delete instruction detail:', error);
            toast.error('Failed to delete instruction detail. Please try again.');
        } finally {
            setIsLoadingSections(false);
        }
    };

    const [openLessonDialog, setOpenLessonDialog] = useState(false);
    const handleOpenLessonDialog = (lesson) => {
        setLessonDetails(lesson);
        setOpenLessonDialog(true);
    };

    const handleCloseLessonDialog = () => {
        setOpenLessonDialog(false);
        setLessonDetails(null);
    };

    // ==================== Assign Employee ====================
    const EmployeeList = () => {
        const [employeeList, setEmployeeList] = useState([]);
        const [searchQuery, setSearchQuery] = useState('');
        const [searchTerm, setSearchTerm] = useState('');
        const [sortAssigned, setSortAssigned] = useState(false);
        const [editMode, setEditMode] = useState(false);
        const [employeeListToCreate, setEmployeeListToCreate] = useState([]);
        const [page, setPage] = useState(1);
        const [totalPages, setTotalPages] = useState(1);
        const [selectedUsers, setSelectedUsers] = useState(new Set());
        const { id: courseId } = useParams();
        const [isLoadingCreate, setIsLoadingCreate] = useState(false);
        const [isLoadingEmployee, setIsLoadingEmployee] = useState(true);
        const [openConfirmDialog, setOpenConfirmDialog] = useState(false); // 🔹 Dialog State

        const handleToggle = (id) => {
            setSelectedUsers((prevSelected) => {
                const newSelected = new Set(prevSelected);
                if (newSelected.has(id)) {
                    newSelected.delete(id);
                } else {
                    newSelected.add(id);
                }
                return newSelected;
            });

            setEmployeeListToCreate((prevList) => {
                const updatedList = [...prevList];
                const index = updatedList.findIndex((emp) => emp.userId === id);

                if (index === -1) {
                    updatedList.push({ courseId: courseId, userId: id });
                } else {
                    updatedList.splice(index, 1);
                }
                return updatedList;
            });
        };

        const fetchUser = async (page = 1, keyword = '') => {
            try {
                const res = await AccountAPI.getUserToAssign(
                    `${userInfo?.company?.id}/course/${courseId}?page=${page}&size=10&keyword=${keyword}`,
                );
                const loadedUser =
                    res?.result?.objectList?.map((user) => ({
                        id: user.userResponse.id,
                        email: user.userResponse.email,
                        avatar: user.userResponse.avatar,
                        username: user.userResponse.username,
                        isAssigned: user.isAssigned,
                        isEnrolled: user.isEnrolled,
                    })) || [];

                setEmployeeList(loadedUser);
                setTotalPages(res?.result?.totalPages || 1);
                setIsLoadingEmployee(false);
            } catch (error) {
                console.error('Failed to fetch user:', error);
            }
        };

        useEffect(() => {
            fetchUser(page, searchTerm);
        }, [page, searchTerm]);

        const handleSearchInputChange = (event) => {
            setSearchQuery(event.target.value);
        };

        const handleSearchButtonClick = () => {
            setSearchTerm(searchQuery);
            setPage(1);
        };

        const handlePageChange = (event, value) => {
            setPage(value);
        };

        const handleConfirmSave = async () => {
            setIsLoadingCreate(true);
            try {
                const res = await EnrollmentAPI.createEnrollment(employeeListToCreate);
                setEmployeeListToCreate([]);
                console.log('Save response:', res.data);
                fetchUser(page, searchTerm);
            } catch (error) {
                console.error('Failed to save assigned users:', error);
            } finally {
                setIsLoadingCreate(false);
                setOpenConfirmDialog(false); // 🔹 Close dialog after saving
            }
        };

        return (
            <div>
                {isLoadingEmployee ? (
                    <CircularProgress />
                ) : (
                    <>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <TextField
                                label="Search"
                                variant="outlined"
                                fullWidth
                                margin="normal"
                                value={searchQuery}
                                onChange={handleSearchInputChange}
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSearchButtonClick}
                                sx={{ padding: '12px' }}
                            >
                                Search
                            </Button>
                        </div>

                        <List>
                            {/* Header Row */}
                            <ListItem sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>
                                {/* <ListItemText primary="Employee Gmail" sx={{ fontWeight: 'bold', flex: 3 }} /> */}
                                <Typography sx={{ flex: 3, fontWeight: 'bold' }}>Employee Gmail</Typography>
                                <Typography sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                                    Is Enrolled
                                </Typography>
                                <Typography sx={{ flex: 1, fontWeight: 'bold', textAlign: 'center' }}>
                                    Is Assigned
                                </Typography>
                            </ListItem>

                            {/* Employee List */}
                            {employeeList.map((employee) => (
                                <ListItem key={employee.id} sx={{ display: 'flex', alignItems: 'center' }}>
                                    {/* Employee Gmail */}
                                    <Box sx={{ flex: 3, display: 'flex', alignItems: 'center' }}>
                                        <ListItemAvatar>
                                            <Avatar src={employee.avatar} />
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={employee.username}
                                            secondary={
                                                <Typography component="span" variant="body2" color="textPrimary">
                                                    {employee.email}
                                                </Typography>
                                            }
                                        />
                                    </Box>

                                    {/* Is Enrolled */}
                                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                                        <Checkbox edge="end" checked={employee?.isEnrolled} disabled />
                                    </Box>

                                    {/* Is Assigned */}
                                    <Box sx={{ flex: 1, textAlign: 'center' }}>
                                        <Checkbox
                                            edge="end"
                                            checked={selectedUsers.has(employee.id) || employee.isAssigned}
                                            disabled={employee.isAssigned || employee?.isEnrolled}
                                            onChange={() => handleToggle(employee.id)}
                                        />
                                    </Box>
                                </ListItem>
                            ))}

                            {/* Pagination */}
                            <Box fullWidth sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                <Pagination count={totalPages} page={page} onChange={handlePageChange} />
                            </Box>
                        </List>

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setOpenConfirmDialog(true)} // 🔹 Open confirmation dialog
                            disabled={employeeListToCreate.length === 0} // 🔹 Disable if no new selections
                        >
                            Save
                        </Button>
                    </>
                )}

                {/* 🔹 Confirmation Dialog */}
                <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
                    <DialogTitle>Confirm Save</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Are you sure you want to assign these users to the course?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmDialog(false)} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleConfirmSave} color="primary" disabled={isLoadingCreate}>
                            {isLoadingCreate ? <CircularProgress size={24} /> : 'Confirm'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        );
    };

    const [translation, setTranslation] = useState({ x: '', y: '', z: '' });
    const [rotation, setRotation] = useState({ pitch: '', yaw: '', roll: '' });
    const [instructionName, setInstructionName] = useState('');
    const [instructionDescription, setInstructionDescription] = useState('');
    const [image, setImage] = useState(null);
    const [file3D, setFile3D] = useState(null);
    const [guideViewPosition, setGuideViewPosition] = useState({
        translation: [0, 0, 0],
        rotation: [0, 0, 0],
    });
    const [instructionDetailRequest, setInstructionDetailRequest] = useState({
        description: '',
        file: null,
        imageFile: null,
        name: '',
    });
    const [isCreating, setIsCreating] = useState(false);

    const handleCloseAddSectionDialog = () => {
        setOpenAddSectionDialog(false);
        setInstructionName('');
        setInstructionDescription('');
        setTranslation({ x: '', y: '', z: '' });
        setRotation({ pitch: '', yaw: '', roll: '' });
        setGuideViewPosition({ translation: [0, 0, 0], rotation: [0, 0, 0] });
        setInstructionDetailRequest({
            description: '',
            file: null,
            imageFile: null,
            name: '',
        });
        setFile3D(null);
        setImage(null);
    };

    const handleTranslationChange = (axis, value) => {
        const newTranslation = { ...translation, [axis]: value };
        setTranslation(newTranslation);
        setGuideViewPosition((prev) => ({
            ...prev,
            translation: [
                parseFloat(newTranslation.x) || 0,
                parseFloat(newTranslation.y) || 0,
                parseFloat(newTranslation.z) || 0,
            ],
        }));
    };

    const handleRotationChange = (axis, value) => {
        const newRotation = { ...rotation, [axis]: value };
        setRotation(newRotation);
        setGuideViewPosition((prev) => ({
            ...prev,
            rotation: [
                parseFloat(newRotation.pitch) || 0,
                parseFloat(newRotation.yaw) || 0,
                parseFloat(newRotation.roll) || 0,
            ],
        }));
    };

    const handleInstructionDetailNameChange = (e) => {
        setInstructionDetailRequest((prev) => ({
            ...prev,
            name: e.target.value,
        }));
    };

    // Hàm xử lý nhập mô tả instruction detail
    const handleInstructionDetailDescriptionChange = (e) => {
        setInstructionDetailRequest((prev) => ({
            ...prev,
            description: e.target.value,
        }));
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

    const handleCreateInstruction = async () => {
        // Validate instructionName
        if (instructionName.trim().length < 5 || instructionName.trim().length > 50) {
            return toast.error('Instruction name must be between 5 and 50 characters.', { position: 'top-right' });
        }

        // Validate instructionDescription
        if (instructionDescription.trim().length < 10 || instructionDescription.trim().length > 200) {
            return toast.error('Instruction description must be between 10 and 200 characters.', {
                position: 'top-right',
            });
        }

        // Validate instructionDetailRequest.name
        if (instructionDetailRequest.name.trim().length < 5 || instructionDetailRequest.name.trim().length > 50) {
            return toast.error('Detail name must be between 5 and 50 characters.', { position: 'top-right' });
        }

        // Validate instructionDetailRequest.description
        if (
            instructionDetailRequest.description.trim().length < 10 ||
            instructionDetailRequest.description.trim().length > 200
        ) {
            return toast.error('Detail description must be between 10 and 200 characters.', { position: 'top-right' });
        }

        // Validate file3D
        if (!file3D) {
            return toast.error('Please select a 3D file.', { position: 'top-right' });
        }

        // Validate image
        if (!image) {
            return toast.error('Please select an image.', { position: 'top-right' });
        }

        // Validate guideViewPosition.translation (Tất cả phải khác 0 và không được để trống)
        if (guideViewPosition.translation.some((value) => !value || Number(value) === 0)) {
            return toast.error('Translation values (X, Y, Z) must all be non-zero and non-empty.', {
                position: 'top-right',
            });
        }

        // Validate guideViewPosition.rotation (Tất cả phải khác 0 và không được để trống)
        if (guideViewPosition.rotation.some((value) => !value || Number(value) === 0)) {
            return toast.error('Rotation values (Pitch, Yaw, Roll) must all be non-zero and non-empty.', {
                position: 'top-right',
            });
        }

        setIsCreating(true);

        try {
            const formDataForInstruction = new FormData();
            formDataForInstruction.append('courseId', courseId);
            formDataForInstruction.append('name', instructionName);
            formDataForInstruction.append('description', instructionDescription);

            // Thêm guideViewPosition.translation và guideViewPosition.rotation
            formDataForInstruction.append('guideViewPosition.translation', guideViewPosition.translation.join(','));
            formDataForInstruction.append('guideViewPosition.rotation', guideViewPosition.rotation.join(','));

            // Thêm dữ liệu instructionDetailRequest
            formDataForInstruction.append('instructionDetailRequest.name', instructionDetailRequest.name);
            formDataForInstruction.append('instructionDetailRequest.description', instructionDetailRequest.description);
            formDataForInstruction.append('instructionDetailRequest.file', file3D);
            formDataForInstruction.append('instructionDetailRequest.imageFile', image);

            console.log([...formDataForInstruction]); // Kiểm tra dữ liệu trước khi gửi

            const response = await InstructionAPI.create(formDataForInstruction);
            if (response?.result) {
                toast.success('Instruction created successfully!', { position: 'top-right' });
                setOpenAddSectionDialog(false);
                handleCloseAddSectionDialog();
                fetchInstructionByCourseId();
            }
        } catch (error) {
            console.error('Failed to create instruction:', error);
            toast.error('Failed to create instruction. Please try again.', { position: 'top-right' });
        } finally {
            setIsCreating(false);
        }
    };

    //Get Instruction By Course Id
    const [instructions, setInstructions] = useState([]);
    const [imageForInstructionDetail, setImageForInstructionDetail] = useState(null);
    const [file3DForInstructionDetail, setFile3DForInstructionDetail] = useState(null);
    const [nameForInstructionDetail, setNameForInstructionDetail] = useState('');
    const [descriptionForInstructionDetail, setDescriptionForInstructionDetail] = useState('');
    const [isCreatingForInstructionDetail, setIsCreatingForInstructionDetail] = useState(false);
    const [isUpdatingForInstructionDetail, setIsUpdatingForInstructionDetail] = useState(false);
    const [openUpdateLessonDialog, setOpenUpdateLessonDialog] = useState(false);
    const [currentInstructionDetailId, setcurrentInstructionDetailId] = useState('');
    // Update Instruction Detail
    const [isEditingLesson, setIsEditingLesson] = useState(false);
    const [editingLessonId, setEditingLessonId] = useState(null);
    const [anchorElMap, setAnchorElMap] = useState({});

    const handleClickMenuss = (event, id) => {
        setAnchorElMap((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleClickMenuInstruction = (event, id) => {
        event.stopPropagation();
        setAnchorElMap((prev) => ({ ...prev, [id]: event.currentTarget }));
    };

    const handleCloseMenuss = (id) => {
        setAnchorElMap((prev) => ({ ...prev, [id]: null }));
    };

    const handleCloseMenuInstruction = (id) => {
        setAnchorElMap((prev) => ({ ...prev, [id]: null }));
    };

    const handleCloseAddLessonDialog = () => {
        setOpenAddLessonDialog(false);
        setOpenUpdateLessonDialog(false);
        setCurrentSectionId(null);
        setImageForInstructionDetail(null);
        setFile3DForInstructionDetail(null);
        setNameForInstructionDetail('');
        setDescriptionForInstructionDetail('');
        setImageOfInstructionDetail(null);
        setImagePreview('');
    };

    const [imageOfInstructionDetail, setImageOfInstructionDetail] = useState(null);
    const [fileOfInstructionDetail, setFileOfInstructionDetail] = useState(null);
    const handleEditLesson = async (instructionDetailId) => {
        console.log(instructionDetailId);
        const response = await InstructionDetailAPI.getById(instructionDetailId);
        const data = response?.result || {};

        setIsEditingLesson(true);
        setcurrentInstructionDetailId(data.id);
        setNameForInstructionDetail(data.name);
        setDescriptionForInstructionDetail(data.description);
        setImageOfInstructionDetail(data.imgString);
        setFileOfInstructionDetail(data.fileString);
        setOpenUpdateLessonDialog(true);
    };

    //Instruction
    const [nameForInstruction, setNameForInstruction] = useState('');
    const [descriptionForInstruction, setDescriptionForInstruction] = useState('');
    const [translationForInstruction, setTranslationForInstruction] = useState([]);
    const [rotationForInstruction, setRotationForInstruction] = useState([]);
    const [currentInstrutionIdForUpdate, setCurrentInstrutionIdForUpdate] = useState([]);
    const [openUpdateInstructionDialog, setOpenUpdateInstructionDialog] = useState(false);
    const [isUpdatingForInstruction, setIsUpdatingForInstruction] = useState(false);
    const handleEditInstruction = async (instructionId) => {
        const response = await InstructionAPI.getById(instructionId);
        const data = response?.result || {};

        setCurrentInstrutionIdForUpdate(data.id);
        setNameForInstruction(data.name);
        setDescriptionForInstruction(data.description);
        setTranslationForInstruction(data.position?.split(', ').map(Number) || [0, 0, 0]);
        setRotationForInstruction(data.rotation?.split(', ').map(Number) || [0, 0, 0]);
        setOpenUpdateInstructionDialog(true);
    };

    const handleCloseUpdateInstructionDialog = () => {
        setOpenUpdateInstructionDialog(false);
        setCurrentInstrutionIdForUpdate([]);
        setNameForInstruction('');
        setDescriptionForInstruction(null);
        setTranslationForInstruction([]);
        setRotationForInstruction([]);
    };

    const handleUpdateInstruction = async () => {
        // Kiểm tra nameForInstruction (5 - 50 ký tự)
        if (nameForInstruction.trim().length < 5 || nameForInstruction.trim().length > 50) {
            toast.error('Instruction name must be between 5 and 50 characters.');
            return;
        }

        // Kiểm tra descriptionForInstruction (10 - 200 ký tự)
        if (descriptionForInstruction.trim().length < 10 || descriptionForInstruction.trim().length > 200) {
            toast.error('Instruction description must be between 10 and 200 characters.');
            return;
        }

        // Kiểm tra giá trị của translationForInstruction (x, y, z phải khác 0)
        if (translationForInstruction.some((val) => val === 0 || isNaN(val))) {
            toast.error('Translation values (X, Y, Z) must be non-zero numbers.');
            return;
        }

        // Kiểm tra giá trị của rotationForInstruction (pitch, yaw, roll phải khác 0)
        if (rotationForInstruction.some((val) => val === 0 || isNaN(val))) {
            toast.error('Rotation values (Pitch, Yaw, Roll) must be non-zero numbers.');
            return;
        }

        setIsUpdatingForInstruction(true);

        try {
            const formDataForUpdateInstruction = new FormData();
            formDataForUpdateInstruction.append('name', nameForInstruction);
            formDataForUpdateInstruction.append('description', descriptionForInstruction);
            formDataForUpdateInstruction.append('guideViewPosition.translation', translationForInstruction);
            formDataForUpdateInstruction.append('guideViewPosition.rotation', rotationForInstruction);

            console.log([...formDataForUpdateInstruction]);

            const response = await InstructionAPI.update(currentInstrutionIdForUpdate, formDataForUpdateInstruction);
            if (response?.result) {
                toast.success('Instruction updated successfully!');
                setOpenUpdateInstructionDialog(false);
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

    useEffect(() => {
        console.log(translationForInstruction);
    }, [translationForInstruction]);

    const [imagePreview, setImagePreview] = useState(null);

    const handleImageSelectForInstructionDetail = (event) => {
        setImageForInstructionDetail(event.target.files[0]);
        setImagePreview(URL.createObjectURL(event.target.files[0]));
    };

    const handle3DFileSelectForInstructionDetail = (e) => {
        if (e.target.files[0]) {
            setFile3DForInstructionDetail(e.target.files[0]);
        }
    };

    useEffect(() => {
        fetchInstructionByCourseId();
    }, []);

    const fetchInstructionByCourseId = async () => {
        try {
            const response = await InstructionAPI.getByCourse(courseId);
            const data = response?.result?.objectList || [];
            console.log(data);

            setInstructions(data);
            setIsLoadingSections(false);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        }
    };

    const handleCreateInstructionDetail = async () => {
        // Kiểm tra nameForInstructionDetail (5 - 50 ký tự)
        if (nameForInstructionDetail.trim().length < 5 || nameForInstructionDetail.trim().length > 50) {
            toast.error('Instruction detail name must be between 5 and 50 characters.');
            return;
        }

        // Kiểm tra descriptionForInstructionDetail (10 - 200 ký tự)
        if (descriptionForInstructionDetail.trim().length < 10 || descriptionForInstructionDetail.trim().length > 200) {
            toast.error('Instruction detail description must be between 10 and 200 characters.');
            return;
        }

        if (!imageForInstructionDetail) {
            toast.error('Please select an image for the instruction detail.');
            return;
        }

        // Kiểm tra xem file 3D đã chọn chưa
        if (!file3DForInstructionDetail) {
            toast.error('Please select a 3D file (.glb or .gltf).');
            return;
        }

        setIsCreatingForInstructionDetail(true);

        try {
            const formDataForInstructionDetail = new FormData();
            formDataForInstructionDetail.append('instructionId', currentSectionId);
            formDataForInstructionDetail.append('name', nameForInstructionDetail);
            formDataForInstructionDetail.append('description', descriptionForInstructionDetail);
            formDataForInstructionDetail.append('file', file3DForInstructionDetail);
            formDataForInstructionDetail.append('imageFile', imageForInstructionDetail);

            const response = await InstructionDetailAPI.create(formDataForInstructionDetail);
            if (response?.result) {
                toast.success('Instruction detail created successfully!');
                setOpenAddSectionDialog(false);
                handleCloseAddLessonDialog();
                fetchInstructionByCourseId();
            }
        } catch (error) {
            console.error('Failed to create instruction detail:', error);
            toast.error('Failed to create instruction detail. Please try again.');
        } finally {
            setIsCreatingForInstructionDetail(false);
        }
    };

    const handleUpdateInstructionDetail = async () => {
        // Validate required fields
        if (
            !nameForInstructionDetail.trim() ||
            nameForInstructionDetail.length < 5 ||
            nameForInstructionDetail.length > 50
        ) {
            return toast.error('Name must be between 5 and 50 characters.');
        }
        if (
            !descriptionForInstructionDetail.trim() ||
            descriptionForInstructionDetail.length < 10 ||
            descriptionForInstructionDetail.length > 200
        ) {
            return toast.error('Description must be between 10 and 200 characters.');
        }

        setIsUpdatingForInstructionDetail(true);

        try {
            const formDataForUpdateInstructionDetail = new FormData();
            formDataForUpdateInstructionDetail.append('name', nameForInstructionDetail);
            formDataForUpdateInstructionDetail.append('description', descriptionForInstructionDetail);

            if (imageForInstructionDetail != null && file3DForInstructionDetail == null) {
                formDataForUpdateInstructionDetail.append('imageFile', imageForInstructionDetail);
            }

            if (imageForInstructionDetail == null && file3DForInstructionDetail != null) {
                formDataForUpdateInstructionDetail.append('file', file3DForInstructionDetail);
            }

            if (imageForInstructionDetail != null && file3DForInstructionDetail != null) {
                formDataForUpdateInstructionDetail.append('imageFile', imageForInstructionDetail);
                formDataForUpdateInstructionDetail.append('file', file3DForInstructionDetail);
            }

            console.log([...formDataForUpdateInstructionDetail]);

            const response = await InstructionDetailAPI.update(
                currentInstructionDetailId,
                formDataForUpdateInstructionDetail,
            );

            if (response?.result) {
                toast.success('Instruction updated successfully!');
                setOpenUpdateLessonDialog(false);
                handleCloseAddLessonDialog();
                fetchInstructionByCourseId();
            }
        } catch (error) {
            console.error('Failed to update instruction detail:', error);
            toast.error('Failed to update instruction detail. Please try again.');
        } finally {
            setIsUpdatingForInstructionDetail(false);
        }
    };

    useEffect(() => {
        console.log(file3DForInstructionDetail);
    }, [file3DForInstructionDetail]);

    async function handleDownloadQrCode(qrCodeUrl, fileName) {
        if (!qrCodeUrl) return;

        try {
            // Fetch image as Blob
            const response = await axios.get(getImage(qrCodeUrl), { responseType: 'blob' });
            // Create a Blob URL
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = URL.createObjectURL(blob);

            // Create a temporary link
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
    }

    const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);

    const handleOpenDeleteConfirm = () => {
        setOpenDeleteConfirm(true);
    };

    const handleCloseDeleteConfirm = () => {
        setOpenDeleteConfirm(false);
    };

    const handleDeleteGuideline = async () => {
        try {
            await CourseAPI.delete(course.id);
            toast.success('Guideline deleted successfully!', { position: 'top-right' });
            setOpenDeleteConfirm(false);
            navigate('/company/course');
        } catch (error) {
            console.error('Failed to delete guideline:', error);
            toast.error('Failed to delete guideline. Please try again.', { position: 'top-right' });
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', padding: 4 }}>
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
                {/* ====== Course Title ====== */}
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

                    {/* ====== Action Buttons ====== */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {/* Start/Stop Course Button */}
                        <Button
                            variant="contained"
                            sx={{
                                padding: '12px 20px',
                                backgroundColor: course?.status === 'INACTIVE' ? 'green' : 'red',
                                ':hover': {
                                    opacity: '0.9',
                                    backgroundColor: course?.status === 'INACTIVE' ? 'darkgreen' : 'darkred',
                                },
                            }}
                            onClick={handleClickToggleCourseStatus}
                        >
                            {isLoadingStartCourse ? (
                                <CircularProgress size={24} />
                            ) : course?.status === 'INACTIVE' ? (
                                'Start this guideline'
                            ) : (
                                'Stop this guideline'
                            )}
                        </Button>

                        {/* Delete Course Button */}
                        <Button
                            variant="contained"
                            color="error"
                            sx={{ padding: '12px 20px' }}
                            onClick={handleOpenDeleteConfirm}
                        >
                            Delete this guideline
                        </Button>
                    </Box>

                    {/* ====== Instruction Note ====== */}
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

            {/* ====== Delete Confirmation Modal ====== */}
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

                    {/* Action Buttons */}
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
            {/* ====== Tab Context ====== */}
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <TabList onChange={handleTabChange} textColor="#051D40">
                        <Tab label="Model" value="1" />
                        <Tab label="Instruction" value="2" />
                        {/* <Tab label="Assign Employee" value="4" /> */}
                    </TabList>
                </Box>
                {/* ================= TabPanel 0: Model ================= */}
                <TabPanel value="1">
                    {isLoadingModel ? (
                        <CircularProgress />
                    ) : (
                        <Box>
                            <Box sx={{ display: 'flex', gap: 4, justifyContent: 'space-between' }}>
                                {/* LEFT COLUMN: QR Code & Download Button */}
                                <Box
                                    sx={{
                                        width: '30%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: 2,
                                    }}
                                >
                                    {/* QR Code Image */}
                                    <img
                                        src={getImage(course?.qrCode)}
                                        alt="QR Code"
                                        style={{
                                            maxWidth: '100%',
                                            borderRadius: '8px',
                                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />

                                    {/* Download Button */}
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            handleDownloadQrCode(course?.qrCode, model?.name + '_QRCode.png')
                                        }
                                        sx={{ alignSelf: 'center' }}
                                    >
                                        Download QR Code
                                    </Button>
                                </Box>

                                {/* RIGHT COLUMN: Model Info */}
                                <Box
                                    sx={{
                                        width: '60%',
                                        backgroundColor: 'rgba(255,255,255,0.8)',
                                        p: 3,
                                        borderRadius: 2,
                                        boxShadow: 3,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        textAlign: 'left',
                                    }}
                                >
                                    {/* Model Image */}
                                    <img
                                        src={getImage(model?.imageUrl)}
                                        alt="Model Preview"
                                        style={{
                                            width: '200px',
                                            borderRadius: '8px',
                                            marginBottom: '16px',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                                            margin: 'auto auto',
                                        }}
                                    />

                                    {/* Model Details */}
                                    <Box sx={{ display: 'flex', mb: 1, textAlign: 'left' }}>
                                        <Typography variant="body1" sx={{ width: '40%', fontWeight: 'bold' }}>
                                            Model Name
                                        </Typography>
                                        <Typography variant="body1">{model?.name || 'N/A'}</Typography>
                                    </Box>
                                    <Divider />
                                    {/* Aligned details */}
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
                            <Box sx={{ mt: 4 }}>
                                <ModelViewer model={model ? getImage(model?.file) : modelTest} />
                            </Box>
                        </Box>
                    )}
                </TabPanel>

                {/* ================= TabPanel 1: Sections ================= */}
                <TabPanel value="2">
                    <Box>
                        {/* ====== Render Sections ====== */}
                        {isLoadingSections ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : instructions.length === 0 ? (
                            <Typography variant="body1">No Instruction available. Please add a Instruction.</Typography>
                        ) : (
                            instructions.map((instruction, instructionIndex) => (
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
                                            {/* IconButton và Menu cho Instruction */}
                                            <div>
                                                <IconButton
                                                    aria-label="more"
                                                    aria-controls={openMenu ? 'instruction-menu' : undefined}
                                                    aria-expanded={openMenu ? 'true' : undefined}
                                                    aria-haspopup="true"
                                                    onClick={(event) =>
                                                        handleClickMenuInstruction(event, instruction.id)
                                                    }
                                                >
                                                    <MoreVerticalIcon />
                                                </IconButton>
                                                <Menu
                                                    id="instruction-menu"
                                                    MenuListProps={{
                                                        'aria-labelledby': 'instruction-menu-button',
                                                    }}
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
                                    {/* ====== Render Lessons within Section ====== */}
                                    {instruction.instructionDetailResponse &&
                                    instruction.instructionDetailResponse.length > 0 ? (
                                        instruction.instructionDetailResponse.map((instructionDetail) => (
                                            <>
                                                <AccordionDetails sx={{ py: 3 }}>
                                                    <Box key={instructionDetail.id} sx={{ mb: 1, pl: 2 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                gap: 1,
                                                                alignItems: 'center',
                                                            }}
                                                        >
                                                            <div>
                                                                <IconButton
                                                                    aria-label="more"
                                                                    id="long-button"
                                                                    aria-controls={openMenu ? 'long-menu' : undefined}
                                                                    aria-expanded={openMenu ? 'true' : undefined}
                                                                    aria-haspopup="true"
                                                                    onClick={(event) =>
                                                                        handleClickMenuss(event, instructionDetail.id)
                                                                    }
                                                                >
                                                                    <MoreVerticalIcon />
                                                                </IconButton>
                                                                <Menu
                                                                    id="long-menu"
                                                                    MenuListProps={{
                                                                        'aria-labelledby': 'long-button',
                                                                    }}
                                                                    anchorEl={anchorElMap[instructionDetail.id]}
                                                                    open={Boolean(anchorElMap[instructionDetail.id])}
                                                                    onClose={() =>
                                                                        handleCloseMenuss(instructionDetail.id)
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
                                                                        onClick={() =>
                                                                            handleEditLesson(instructionDetail.id)
                                                                        }
                                                                    >
                                                                        Update
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() =>
                                                                            handleClickDeleteSection(
                                                                                instructionDetail.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Delete
                                                                    </MenuItem>
                                                                    <MenuItem
                                                                        onClick={() =>
                                                                            handleClickSwapOrderIntructionDetail(
                                                                                instructionDetail.id,
                                                                                instruction.id,
                                                                            )
                                                                        }
                                                                    >
                                                                        Swap Order
                                                                    </MenuItem>
                                                                </Menu>
                                                            </div>
                                                            <File />
                                                            <Typography
                                                                variant="body2"
                                                                fontSize={16}
                                                                sx={{
                                                                    ':hover': {
                                                                        cursor: 'pointer',
                                                                        color: 'blue',
                                                                    },
                                                                }}
                                                                onClick={() =>
                                                                    handleOpenLessonDialog(instructionDetail)
                                                                }
                                                            >
                                                                {instructionDetail.name}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </AccordionDetails>
                                                <Divider />
                                            </>
                                        ))
                                    ) : (
                                        <Typography variant="body2" sx={{ my: 2 }}>
                                            No instruction detail in this section.
                                        </Typography>
                                    )}

                                    {/* ====== Add Lesson Button ====== */}
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
                                        + Add a Instruction Detail
                                    </Button>
                                </Accordion>
                            ))
                        )}
                        {/* ====== Add Section Button ====== */}
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

                {/* ================= TabPanel 2: Final Quiz ================= */}
                <TabPanel value="3">
                    {isLoadingQuiz ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <Box
                            sx={{
                                width: {
                                    xs: '100%', // 100% for extra small screens (xs)
                                    lg: '80%', // 70% for medium screens (md) and up
                                },
                                px: '5%',
                                m: 'auto',
                            }}
                        >
                            <Box mb={3}>
                                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: 24, color: '#051D40' }}>
                                    Final Quiz
                                </Typography>
                                {quiz ? (
                                    <Box sx={{ backgroundColor: 'white', p: 3, borderRadius: '8px', mt: 2 }}>
                                        {/* Quiz Details */}
                                        <Box sx={{ textAlign: 'left', mb: 3 }}>
                                            <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                                                Quiz Title*
                                            </Typography>
                                            <Typography>{quiz?.title}</Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'left' }}>
                                            <Typography sx={{ fontSize: '20px', fontWeight: 700 }}>
                                                Description
                                            </Typography>
                                            <Typography>{quiz?.description}</Typography>
                                        </Box>
                                        {/* Edit Quiz Button */}
                                        <Button
                                            variant="contained"
                                            sx={{
                                                mt: 2,
                                                backgroundColor: '#051D40',
                                                display: 'block',
                                            }}
                                            onClick={handleClickOpenEditQuiz}
                                        >
                                            Edit
                                        </Button>
                                    </Box>
                                ) : (
                                    <Box
                                        sx={{
                                            backgroundColor: 'white',
                                            p: 4,
                                            borderRadius: '8px',
                                            mt: 2,
                                        }}
                                    >
                                        {/* Create Quiz Form */}
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            required
                                            label="Quiz Title"
                                            value={quizTitle}
                                            onChange={(e) => setQuizTitle(e.target.value)}
                                        />
                                        <TextField
                                            fullWidth
                                            margin="normal"
                                            label="Description"
                                            multiline
                                            minRows={3}
                                            value={quizDescription}
                                            onChange={(e) => setQuizDescription(e.target.value)}
                                            sx={{ borderRadius: '20px' }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            fullWidth
                                            sx={{
                                                mt: 3,
                                                mb: 2,
                                                bgcolor: '#051D40',
                                                padding: '12px 0',
                                                fontSize: '16px',
                                                ':hover': {
                                                    bgcolor: '#051D40',
                                                    opacity: '0.8',
                                                },
                                            }}
                                            onClick={handleCreateQuiz}
                                        >
                                            Create Quiz
                                        </Button>
                                    </Box>
                                )}

                                {/* ====== Edit Quiz Dialog ====== */}
                                <Dialog open={openEditQuiz} onClose={handleCloseEditQuiz}>
                                    <DialogTitle>Edit Quiz</DialogTitle>
                                    <DialogContent sx={{ minWidth: '524px' }}>
                                        {isLoadingEditQuiz ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            <>
                                                <DialogContentText>
                                                    Update your quiz title and description.
                                                </DialogContentText>
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    required
                                                    label="Quiz Title"
                                                    value={quizTitle}
                                                    onChange={(e) => setQuizTitle(e.target.value)}
                                                />
                                                <TextField
                                                    fullWidth
                                                    margin="normal"
                                                    label="Description"
                                                    multiline
                                                    minRows={3}
                                                    value={quizDescription}
                                                    onChange={(e) => setQuizDescription(e.target.value)}
                                                />
                                            </>
                                        )}
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={handleCloseEditQuiz} disabled={isLoadingEditQuiz}>
                                            Cancel
                                        </Button>
                                        <Button onClick={handleUpdateQuiz} disabled={isLoadingEditQuiz}>
                                            Update
                                        </Button>
                                    </DialogActions>
                                </Dialog>
                            </Box>

                            <Divider />

                            {/* ====== Questions List ====== */}
                            <Box sx={{ mt: 3 }}>
                                {questions.map((q, qIndex) => (
                                    <Accordion
                                        key={qIndex}
                                        expanded={expandedQuestion === `panel${qIndex}`}
                                        onChange={() =>
                                            setExpandedQuestion(
                                                expandedQuestion === `panel${qIndex}` ? false : `panel${qIndex}`,
                                            )
                                        }
                                        sx={{
                                            border: '1px solid #dee2e6',
                                            boxShadow: 'none',
                                            mb: 2,
                                            color: '#051D40',
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <Typography fontSize="24px" fontWeight={700}>
                                                {`Question ${qIndex + 1}`}
                                            </Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            {q.isSaved ? (
                                                <Box sx={{ textAlign: 'left', width: '100%' }}>
                                                    <Typography>{q.question}</Typography>
                                                    {q.answers.map((answer, aIndex) => (
                                                        <Box key={aIndex}>
                                                            <Typography
                                                                sx={answer.isRight ? { fontWeight: 'bold' } : {}}
                                                            >
                                                                {String.fromCharCode(65 + aIndex)}. {answer.option}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                    {/* Edit & Delete Buttons */}
                                                    <Box sx={{ display: 'flex', gap: '10px', mt: 2 }}>
                                                        <Button
                                                            variant="contained"
                                                            sx={{ backgroundColor: '#051D40' }}
                                                            onClick={() => handleClickOpenEditQuestion(qIndex)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            sx={{ backgroundColor: '#051D40' }}
                                                            onClick={() => handleClickOpenDeleteQuestion(qIndex)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            ) : (
                                                <Box>
                                                    <TextField
                                                        fullWidth
                                                        margin="normal"
                                                        required
                                                        label={`Question ${qIndex + 1}`}
                                                        value={q.question}
                                                        onChange={(e) => handleQuestionChange(qIndex, e.target.value)}
                                                        error={Boolean(questionErrors[qIndex]?.questionError)}
                                                        helperText={questionErrors[qIndex]?.questionError}
                                                    />

                                                    {q.answers.map((ans, aIndex) => (
                                                        <TextField
                                                            key={aIndex}
                                                            fullWidth
                                                            margin="normal"
                                                            label={`${String.fromCharCode(65 + aIndex)} - Answer ${
                                                                aIndex + 1
                                                            }`}
                                                            value={ans.option}
                                                            onChange={(e) =>
                                                                handleAnswerChange(qIndex, aIndex, e.target.value)
                                                            }
                                                            error={Boolean(
                                                                questionErrors[qIndex]?.answerErrors[aIndex],
                                                            )}
                                                            helperText={questionErrors[qIndex]?.answerErrors[aIndex]}
                                                        />
                                                    ))}

                                                    {/* Correct Answer Selection */}
                                                    <FormControl sx={{ width: '50%', mt: 2 }}>
                                                        <InputLabel>Correct</InputLabel>
                                                        <Select
                                                            label="Correct"
                                                            value={(() => {
                                                                const idx = q.answers.findIndex((a) => a.isRight);
                                                                return idx === -1 ? '0' : idx.toString();
                                                            })()}
                                                            onChange={(e) =>
                                                                handleCorrectAnswerChange(qIndex, e.target.value)
                                                            }
                                                        >
                                                            {q.answers.map((_, idx) => (
                                                                <MenuItem key={idx} value={idx.toString()}>
                                                                    {String.fromCharCode(65 + idx)}
                                                                </MenuItem>
                                                            ))}
                                                        </Select>
                                                    </FormControl>

                                                    {/* Save Button */}
                                                    <Button
                                                        variant="contained"
                                                        sx={{ mt: 2, float: 'right', bgcolor: '#051D40' }}
                                                        onClick={() => createQuestion(qIndex)}
                                                    >
                                                        Save
                                                    </Button>
                                                </Box>
                                            )}
                                        </AccordionDetails>
                                    </Accordion>
                                ))}

                                {/* Add Question Button */}
                                {quiz && (
                                    <Button
                                        fullWidth
                                        variant="contained"
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
                                        onClick={addQuestion}
                                    >
                                        + Add Question
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    )}
                </TabPanel>
                <TabPanel value="4">
                    <EmployeeList />
                </TabPanel>
            </TabContext>
            {/* ==================== Edit Question Dialog ==================== */}
            <Dialog open={openEditQuestion} onClose={handleCloseEditQuestion}>
                <DialogTitle>Edit Question</DialogTitle>
                <DialogContent sx={{ minWidth: '524px' }}>
                    {isLoadingEditQuestion ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : editQuestion ? (
                        <>
                            <DialogContentText>Update your question</DialogContentText>

                            <TextField
                                fullWidth
                                margin="normal"
                                label="Question"
                                value={editQuestion.question}
                                onChange={(e) => handleChangeEditQuestion(e.target.value)}
                                error={Boolean(editQuestionErrors.questionError)}
                                helperText={editQuestionErrors.questionError}
                            />

                            {editQuestion.answers.map((ans, idx) => (
                                <TextField
                                    key={idx}
                                    fullWidth
                                    margin="normal"
                                    label={`${String.fromCharCode(65 + idx)} - Answer`}
                                    value={ans.option}
                                    onChange={(e) => handleAnswerChangeEditQuestion(idx, e.target.value)}
                                    error={Boolean(editQuestionErrors.answerErrors[idx])}
                                    helperText={editQuestionErrors.answerErrors[idx]}
                                />
                            ))}

                            <FormControl sx={{ width: '50%', mt: 2 }}>
                                <InputLabel>Correct</InputLabel>
                                <Select
                                    label="Correct"
                                    value={editQuestion.answers.findIndex((a) => a.isRight)}
                                    onChange={(e) => handleCorrectAnswerChangeEditQuestion(parseInt(e.target.value))}
                                >
                                    {editQuestion.answers.map((_, idx) => (
                                        <MenuItem key={idx} value={idx}>
                                            {String.fromCharCode(65 + idx)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditQuestion} disabled={isLoadingEditQuestion}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateQuestion} disabled={isLoadingEditQuestion}>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== Delete Question Dialog ==================== */}
            <Dialog
                open={openDeleteQuestion}
                onClose={handleCloseDeleteQuestion}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Delete Question Confirm'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this question?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteQuestion}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteQuestion} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== Swap Order Dialog For Instruction Detail ==================== */}
            <Dialog
                open={openSwapOrderDialog}
                onClose={handleCloseSwapOrderIntructionDetail}
                aria-labelledby="swap-dialog-title"
            >
                <DialogTitle id="swap-dialog-title">Swap Order Number</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Current Order Number"
                        value={instructionDetailCurrent.orderNumber}
                        fullWidth
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        InputLabelProps={{ shrink: true }}
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
                            .filter((item) => item.id !== instructionDetailIdCurrent) // Loại bỏ ID hiện tại khỏi danh sách
                            .map((instructionDetail) => (
                                <MenuItem key={instructionDetail.id} value={instructionDetail.id}>
                                    {instructionDetail.name} - {instructionDetail.orderNumber}
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
            {/* ==================== Swap Order Dialog For Instruction ==================== */}
            <Dialog
                open={openSwapOrderDialogForInstruction}
                onClose={handleCloseSwapOrderIntruction}
                aria-labelledby="swap-dialog-title"
            >
                <DialogTitle id="swap-dialog-title">Swap Order Number</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Current Order Number"
                        value={instructionIdCurrentForFindById.orderNumber}
                        fullWidth
                        variant="outlined"
                        InputProps={{ readOnly: true }}
                        InputLabelProps={{ shrink: true }}
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
                            .filter((item) => item.id !== instructionIdCurrentForSwap) // Loại bỏ ID hiện tại khỏi danh sách
                            .map((instruction) => (
                                <MenuItem key={instruction.id} value={instruction.id}>
                                    {instruction.name} - {instruction.orderNumber}
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
            {/* ==================== Start/Stop Course Dialog ==================== */}
            <Dialog
                open={openCourseStatusDialog}
                onClose={() => setOpenCourseStatusDialog(false)}
                aria-labelledby="start-stop-dialog-title"
                aria-describedby="start-stop-dialog-description"
            >
                <DialogTitle id="start-stop-dialog-title">
                    {course?.status === 'INACTIVE' ? 'Start guideline' : 'Stop guideline'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="start-stop-dialog-description">
                        {course?.status === 'INACTIVE'
                            ? 'Are you sure you want to start this guideline?'
                            : 'Are you sure you want to stop this guideline?'}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCourseStatusDialog(false)}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleStartCourse} autoFocus>
                        {course?.status === 'INACTIVE' ? 'Start' : 'Stop'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== Add Section Dialog ==================== */}
            <Dialog open={openAddSectionDialog} onClose={handleCloseAddSectionDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Instruction</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to add a new instruction to the guideline.
                    </DialogContentText>

                    {/* Section Title */}
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Instruction Title"
                        value={instructionName}
                        onChange={(e) => setInstructionName(e.target.value)}
                    />

                    {/* Section Description */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Instruction Description"
                        multiline
                        minRows={3}
                        value={instructionDescription}
                        onChange={(e) => setInstructionDescription(e.target.value)}
                    />

                    <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                        Translation (X, Y, Z)
                    </Typography>
                    <Box display="flex" gap={2}>
                        {['x', 'y', 'z'].map((axis) => (
                            <TextField
                                key={axis}
                                label={axis.toUpperCase()}
                                type="number"
                                value={translation[axis]}
                                onChange={(e) => handleTranslationChange(axis, e.target.value)}
                                fullWidth
                            />
                        ))}
                    </Box>

                    <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                        Rotation (Pitch, Yaw, Roll)
                    </Typography>
                    <Box display="flex" gap={2}>
                        {['pitch', 'yaw', 'roll'].map((axis) => (
                            <TextField
                                key={axis}
                                label={axis.charAt(0).toUpperCase() + axis.slice(1)}
                                type="number"
                                value={rotation[axis]}
                                onChange={(e) => handleRotationChange(axis, e.target.value)}
                                fullWidth
                            />
                        ))}
                    </Box>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Instruction Detail Name"
                        value={instructionDetailRequest.name}
                        onChange={handleInstructionDetailNameChange}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Instruction Detail Description"
                        multiline
                        minRows={3}
                        value={instructionDetailRequest.description}
                        onChange={handleInstructionDetailDescriptionChange}
                    />

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select an image for instruction detail (required):
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                            Upload Image
                            <input type="file" accept="image/*" onChange={handleImageSelect} hidden />
                        </Button>
                        {image && <Typography variant="body2">{image.name}</Typography>}
                    </Box>
                    {image && (
                        <Box sx={{ mt: 2 }}>
                            <img
                                src={URL.createObjectURL(image)}
                                alt="Preview"
                                style={{ width: '100%', maxHeight: 200, objectFit: 'contain', borderRadius: 8 }}
                            />
                        </Box>
                    )}

                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select 3D file (required, e.g. .glb):
                    </Typography>
                    <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1 }}>
                        <Button variant="contained" component="label" startIcon={<CloudUploadIcon />}>
                            Upload 3D File
                            <input type="file" accept=".glb,.gltf" onChange={handle3DFileSelect} hidden />
                        </Button>
                        {file3D && <Typography variant="body2">{file3D.name}</Typography>}
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddSectionDialog} disabled={isCreatingSection}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateInstruction} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

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
                        label="Name"
                        value={nameForInstruction}
                        onChange={(e) => setNameForInstruction(e.target.value)}
                        margin="dense"
                    />
                    <TextField
                        fullWidth
                        label="Description"
                        value={descriptionForInstruction}
                        onChange={(e) => setDescriptionForInstruction(e.target.value)}
                        margin="dense"
                    />

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {['X', 'Y', 'Z'].map((axis, index) => (
                            <TextField
                                key={axis}
                                label={`Position ${axis}`}
                                type="number"
                                value={translationForInstruction[index] || ''}
                                onChange={(e) => {
                                    const newTranslation = [...translationForInstruction];
                                    newTranslation[index] = e.target.value ? parseFloat(e.target.value) : 0;
                                    setTranslationForInstruction(newTranslation);
                                }}
                                margin="dense"
                            />
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        {['Pitch', 'Yaw', 'Roll'].map((angle, index) => (
                            <TextField
                                key={angle}
                                label={`Rotation ${angle}`}
                                type="number"
                                value={rotationForInstruction[index] || ''}
                                onChange={(e) => {
                                    const newRotation = [...rotationForInstruction];
                                    newRotation[index] = e.target.value ? parseFloat(e.target.value) : 0;
                                    setRotationForInstruction(newRotation);
                                }}
                                margin="dense"
                            />
                        ))}
                    </div>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="secondary"
                        onClick={handleCloseUpdateInstructionDialog}
                        disabled={isUpdatingForInstruction}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={handleUpdateInstruction}
                        disabled={isUpdatingForInstruction}
                    >
                        {isUpdatingForInstruction ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== Add Lesson Dialog ==================== */}
            <Dialog open={openAddLessonDialog} onClose={handleCloseAddLessonDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Instruction Detail</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to create a new instruction detail.
                    </DialogContentText>

                    {/* Name Input */}
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Name"
                        value={nameForInstructionDetail}
                        onChange={(e) => setNameForInstructionDetail(e.target.value)}
                    />
                    {/* Description Input */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={descriptionForInstructionDetail}
                        onChange={(e) => setDescriptionForInstructionDetail(e.target.value)}
                    />

                    {/* Upload Image */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select an image (required):
                    </Typography>
                    <input
                        type="file"
                        accept="image/*"
                        hidden
                        id="upload-image"
                        onChange={handleImageSelectForInstructionDetail}
                    />
                    <label htmlFor="upload-image">
                        <Button variant="contained" component="span" fullWidth color="primary" sx={{ mt: 1, mb: 1 }}>
                            {imageForInstructionDetail ? 'Change Image' : 'Upload Image'}
                        </Button>
                    </label>

                    {/* Hiển thị ảnh preview nếu có */}
                    {imagePreview && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ width: '100%', maxHeight: 250, objectFit: 'contain', borderRadius: '8px' }}
                            />
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {imageForInstructionDetail?.name}
                            </Typography>
                        </Box>
                    )}

                    {/* Upload 3D File */}
                    <Typography variant="body2" sx={{ mt: 2 }}>
                        Select 3D file (required, e.g. .glb):
                    </Typography>
                    <input
                        type="file"
                        accept=".glb,.gltf"
                        hidden
                        id="upload-3d-file"
                        onChange={handle3DFileSelectForInstructionDetail}
                    />
                    <label htmlFor="upload-3d-file">
                        <Button variant="contained" component="span" fullWidth color="primary" sx={{ mt: 1, mb: 1 }}>
                            {file3DForInstructionDetail ? 'Change 3D Model' : 'Upload 3D Model'}
                        </Button>
                    </label>

                    {/* Hiển thị tên file 3D nếu có */}
                    {file3DForInstructionDetail && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            File: {file3DForInstructionDetail.name}
                        </Typography>
                    )}
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseAddLessonDialog} disabled={isCreatingLesson}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreateInstructionDetail}
                        disabled={isCreatingForInstructionDetail}
                        variant="contained"
                        color="primary"
                    >
                        {isCreatingForInstructionDetail ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openUpdateLessonDialog} onClose={handleCloseAddLessonDialog} fullWidth maxWidth="sm">
                <DialogTitle>Update Instruction Detail</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to update a new instruction detail.
                    </DialogContentText>

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Name"
                        value={nameForInstructionDetail}
                        onChange={(e) => setNameForInstructionDetail(e.target.value)}
                    />
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={descriptionForInstructionDetail}
                        onChange={(e) => setDescriptionForInstructionDetail(e.target.value)}
                    />

                    {(imageForInstructionDetail || imageOfInstructionDetail) && (
                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Typography variant="subtitle1">Current Image</Typography>
                            <img
                                src={
                                    imageForInstructionDetail
                                        ? URL.createObjectURL(imageForInstructionDetail)
                                        : getImage(imageOfInstructionDetail)
                                }
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
                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload Image
                        <input type="file" accept="image/*" hidden onChange={handleImageSelectForInstructionDetail} />
                        {imageForInstructionDetail && (
                            <Typography variant="body2"> File: {imageForInstructionDetail.name}</Typography>
                        )}
                    </Button>

                    <Button
                        variant="contained"
                        component="label"
                        fullWidth
                        startIcon={<CloudUploadIcon />}
                        sx={{ mt: 2 }}
                    >
                        Upload 3D Model
                        <input
                            type="file"
                            accept=".glb,.gltf"
                            hidden
                            onChange={handle3DFileSelectForInstructionDetail}
                        />
                        {(file3DForInstructionDetail || fileOfInstructionDetail) && (
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                File:{' '}
                                {file3DForInstructionDetail ? file3DForInstructionDetail.name : fileOfInstructionDetail}
                            </Typography>
                        )}
                    </Button>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddLessonDialog} disabled={isUpdatingForInstructionDetail}>
                        Cancel
                    </Button>
                    <Button onClick={handleUpdateInstructionDetail} disabled={isUpdatingForInstructionDetail}>
                        {isUpdatingForInstructionDetail ? <CircularProgress size={24} /> : 'Update'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation dialog */}
            <Dialog
                open={openDeleteSectionDialog}
                onClose={handleCloseDeleteSectionDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Delete Instruction Detail'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this instruction detail? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteSectionDialog}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteSection} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
            {/* Delete confirmation dialog for instruction */}
            <Dialog
                open={openDeleteInstructionDialog}
                onClose={handleCloseDeleteInstructionDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{'Delete Instruction'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this instrction? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteInstructionDialog}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteInstruction} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Diaglog Show Video */}
            <Dialog open={openVideoDialog} onClose={handleCloseVideoDialog} maxWidth="md" fullWidth>
                <DialogTitle>{lessonDetails?.title || 'Lesson Video'}</DialogTitle>
                <DialogContent>
                    {/* Display lesson details */}
                    <Typography variant="body1" sx={{ mb: 1 }}>
                        {lessonDetails?.description || ''}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Duration: {lessonDetails?.duration || 0} min(s)
                    </Typography>
                    <Divider />

                    {/* Video Player */}
                    {loadingVideo ? (
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '300px',
                                my: 2,
                            }}
                        >
                            <CircularProgress size={50} />
                        </Box>
                    ) : videoSrc ? (
                        <video controls style={{ width: '100%' }}>
                            <source src={videoSrc} type={videoType || 'video/mp4'} />
                            Your browser does not support this video format.
                        </video>
                    ) : (
                        <Typography>Error loading video.</Typography>
                    )}

                    <Divider />
                    {/* Attached File */}
                    {lessonDetails?.attachFileUrl && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<FileText />}
                                onClick={() => handleDownloadFile(lessonDetails.attachFileUrl, lessonDetails.title)}
                                fontSize="12px"
                            >
                                Download Attached File
                            </Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseVideoDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Show Readinng */}
            <Dialog open={openLessonDialog} onClose={handleCloseLessonDialog} maxWidth="md" fullWidth>
                <DialogTitle>{lessonDetails?.name || 'Lesson Details'}</DialogTitle>

                <DialogContent>
                    <Divider />
                    <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ my: 2 }}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                                '<strong>Step ' + (lessonDetails?.orderNumber || 'No content available.') + '</strong>',
                            ),
                        }}
                    />
                    <img src={getImage(lessonDetails?.imgString)} alt="img" />
                    {/* Show Lesson Content for READING type */}
                    <Typography
                        variant="body2"
                        color="text.primary"
                        sx={{ my: 2 }}
                        dangerouslySetInnerHTML={{
                            __html: DOMPurify.sanitize(
                                'Description: ' + lessonDetails?.description || 'No content available.',
                            ),
                        }}
                    />

                    <Box>
                        <ModelViewer model={getImage(lessonDetails?.fileString)} />
                    </Box>

                    <Divider />

                    {/* Attached File Download */}
                    {lessonDetails?.fileString && (
                        <Box sx={{ mt: 2 }}>
                            <Button
                                variant="contained"
                                startIcon={<FileText />}
                                onClick={() => handleDownloadQrCode(lessonDetails.fileString, lessonDetails.name)}
                            >
                                Download Model File
                            </Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseLessonDialog} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
