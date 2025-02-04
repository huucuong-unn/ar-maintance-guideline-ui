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
    FormControl,
    IconButton,
    InputLabel,
    Menu,
    MenuItem,
    Select,
    Tab,
    TextField,
    Typography,
} from '@mui/material';
import { File, FileText, MoreVerticalIcon, Video } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import CourseAPI from '~/API/CourseAPI';
import QuizAPI from '~/API/QuizAPI';

export default function CoursesControlEdit() {
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

    // ==================== useEffect for Initial Data Fetching ====================
    useEffect(() => {
        fetchCourse();
        fetchQuiz();
        fetchSections();
    }, [courseId]);

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
        if (!quiz && course?.status === 'INACTIVE') {
            alert('Please create a quiz before starting the course!');
            return;
        }
        if (questions.length <= 0 && course?.status === 'INACTIVE') {
            alert('Please create a question before starting the course!');
            return;
        }
        if (sections.length <= 0 && course?.status === 'INACTIVE') {
            alert('Please create a section before starting the course!');
            return;
        }
        setOpenCourseStatusDialog(true);
    };

    const handleStartCourse = async () => {
        try {
            setIsLoadingStartCourse(true);
            if (!course) return;
            const data = {
                courseId: courseId,
                companyId: course.companyId,
                title: course.title,
                description: course.description,
                duration: course.duration,
                imageUrl: course.imageUrl,
                isMandatory: course.isMandatory,
                status: course.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE', // Toggle
                type: course.type,
                numberOfLessons: course.numberOfLessons,
                numberOfParticipants: course.numberOfParticipants,
            };
            const updateResponse = await CourseAPI.update(data);
            console.log('Course status updated:', updateResponse);

            if (updateResponse) {
                setCourse(updateResponse?.result);
            }
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

    const handleCloseAddSectionDialog = () => {
        setOpenAddSectionDialog(false);
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
    const handleOpenAddLessonDialog = (sectionId) => {
        setCurrentSectionId(sectionId);
        setSelectedLessonType('');
        setNewLessonData({});
        setOpenAddLessonDialog(true);
    };

    const handleCloseAddLessonDialog = () => {
        setOpenAddLessonDialog(false);
        setCurrentSectionId(null);
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

        if (selectedLessonType === 'VIDEO' && !newLessonData.videoUrl) {
            alert('Please enter the Video URL.');
            return;
        }

        if (!newLessonData.title) {
            alert('Please enter the lesson title.');
            return;
        }

        if (!newLessonData.duration || isNaN(newLessonData.duration) || newLessonData.duration <= 0) {
            alert('Please enter a valid duration.');
            return;
        }

        if (selectedLessonType === 'READING' && !newLessonData.content) {
            alert('Please enter the content for the reading lesson.');
            return;
        }

        // Add more validations based on lesson types as needed

        setIsCreatingLesson(true);
        try {
            const lessonPayload = {
                courseId: courseId,
                lessonId: currentSectionId, // Associate with section
                type: selectedLessonType.toUpperCase(), // Assuming API expects uppercase types
                title: newLessonData.title || `${selectedLessonType} Lesson`,
                description: newLessonData.description || '',
                duration: newLessonData.duration || 0,
                ...(selectedLessonType === 'VIDEO' && { videoUrl: newLessonData.videoUrl }),
                ...(selectedLessonType === 'READING' && { content: newLessonData.content }),
                ...(selectedLessonType === 'DOCUMENT' && {
                    documentUrl: newLessonData.document ? URL.createObjectURL(newLessonData.document) : '',
                }),
            };

            const response = await CourseAPI.createLesson(lessonPayload); // Ensure this method exists

            if (response?.result) {
                alert('Lesson created successfully!');
                // Refresh sections to include the new lesson
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
    const [sectionToDelete, setSectionToDelete] = useState(null);
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

    // Delete section logic
    const handleDeleteSection = async () => {
        try {
            setIsLoadingSections(true);
            // Call API to delete the section
            await CourseAPI.deleteSection(sectionToDelete);
            // Remove the deleted section from the list
            setSections((prevSections) => prevSections.filter((section) => section.id !== sectionToDelete));
            setOpenDeleteSectionDialog(false);
        } catch (error) {
            console.error('Failed to delete section:', error);
            alert('Failed to delete section. Please try again.');
        } finally {
            setIsLoadingSections(false);
        }
    };
    return (
        <Box sx={{ minHeight: '100vh', padding: 4 }}>
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${course?.imageUrl})`,
                    borderRadius: 4,
                    padding: 4,
                }}
            >
                {/* ====== Course Title ====== */}
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
                {/* ====== Start/Stop Course Button ====== */}
                <Button
                    variant="contained"
                    sx={{
                        mb: 2,
                        padding: '12px 20px',
                        backgroundColor: course?.status === 'INACTIVE' ? 'green' : 'red', // Set the background color conditionally
                        ':hover': {
                            opacity: '0.9',
                            backgroundColor: course?.status === 'INACTIVE' ? 'darkgreen' : 'darkred', // Darker hover color
                        },
                    }}
                    onClick={handleClickToggleCourseStatus}
                >
                    {isLoadingStartCourse ? (
                        <CircularProgress size={24} />
                    ) : course?.status === 'INACTIVE' ? (
                        'Start this course'
                    ) : (
                        'Stop this course'
                    )}
                </Button>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        mb: 4,
                        fontStyle: 'italic',
                        textShadow: `
                            -1px -1px 0 #FFFFFF, 
                            1px -1px 0 #FFFFFF, 
                            -1px 1px 0 #FFFFFF, 
                            1px 1px 0 #FFFFFF, 
                            0px -1px 0 #FFFFFF, 
                            0px 1px 0 #FFFFFF, 
                            -1px 0px 0 #FFFFFF, 
                            1px 0px 0 #FFFFFF
                        `,
                    }}
                >
                    You must create a FINAL QUIZ, AT LEAST 1 QUESTION, and AT LEAST 1 SECTION before starting the
                    course!
                </Typography>
            </Box>
            {/* ====== Tab Context ====== */}
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <TabList onChange={handleTabChange} textColor="#051D40">
                        <Tab label="Sections" value="1" />
                        <Tab label="Final Quiz" value="2" />
                    </TabList>
                </Box>

                {/* ================= TabPanel 1: Sections ================= */}
                <TabPanel value="1">
                    <Box>
                        {/* ====== Render Sections ====== */}
                        {isLoadingSections ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : sections.length === 0 ? (
                            <Typography variant="body1">No sections available. Please add a section.</Typography>
                        ) : (
                            sections
                                .sort((a, b) => a.orderInCourse - b.orderInCourse) // Ensure ordered by orderInCourse
                                .map((section, sectionIndex) => (
                                    <Accordion
                                        key={section.id}
                                        expanded={expandedFAQ === `section${section.id}`}
                                        onChange={handleChangeFAQ(`section${section.id}`)}
                                        sx={{
                                            border: '1px solid #dee2e6',
                                            boxShadow: 'none',
                                            mb: 2,
                                            padding: 1,
                                            color: '#051D40',
                                        }}
                                    >
                                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                            <div>
                                                <IconButton
                                                    aria-label="more"
                                                    id="long-button"
                                                    aria-controls={openMenu ? 'long-menu' : undefined}
                                                    aria-expanded={openMenu ? 'true' : undefined}
                                                    aria-haspopup="true"
                                                    onClick={handleClickMenu}
                                                >
                                                    <MoreVerticalIcon />
                                                </IconButton>
                                                <Menu
                                                    id="long-menu"
                                                    MenuListProps={{
                                                        'aria-labelledby': 'long-button',
                                                    }}
                                                    anchorEl={anchorEl}
                                                    open={openMenu}
                                                    onClose={handleCloseMenu}
                                                    slotProps={{
                                                        paper: {
                                                            style: {
                                                                maxHeight: ITEM_HEIGHT * 4.5,
                                                                width: '20ch',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <MenuItem onClick={() => {}}>Update</MenuItem>
                                                    <MenuItem onClick={() => handleClickDeleteSection(section.id)}>
                                                        Delete
                                                    </MenuItem>
                                                </Menu>
                                            </div>
                                            <Typography fontSize={24} fontWeight={700}>
                                                {section.title}
                                            </Typography>
                                        </AccordionSummary>
                                        <Divider />
                                        {/* ====== Render Lessons within Section ====== */}
                                        {section.lessonDetails && section.lessonDetails.length > 0 ? (
                                            section.lessonDetails
                                                .sort((a, b) => a.orderInLesson - b.orderInLesson)
                                                .map((lesson, lessonIndex) => (
                                                    <>
                                                        <AccordionDetails sx={{ py: 3 }}>
                                                            <Box key={lesson.id} sx={{ mb: 1, pl: 2 }}>
                                                                {lesson.type === 'READING' && (
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <File />
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            fontWeight={700}
                                                                        >
                                                                            Reading:
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            sx={{
                                                                                ':hover': {
                                                                                    cursor: 'pointer',
                                                                                    color: 'blue',
                                                                                },
                                                                            }}
                                                                        >
                                                                            {' '}
                                                                            {lesson.title}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {lesson.type === 'VIDEO' && (
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <Video />
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            fontWeight={700}
                                                                        >
                                                                            Video:
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            sx={{
                                                                                ':hover': {
                                                                                    cursor: 'pointer',
                                                                                    color: 'blue',
                                                                                },
                                                                            }}
                                                                        >
                                                                            {lesson.title}
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            sx={{
                                                                                ml: 'auto', // This will push the duration to the right
                                                                                fontStyle: 'italic',
                                                                                color: 'text.secondary',
                                                                            }}
                                                                        >
                                                                            {lesson.duration} min(s)
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                                {lesson.type === 'DOCUMENT' && (
                                                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                                                        <FileText />
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            fontWeight={700}
                                                                        >
                                                                            Document:
                                                                        </Typography>
                                                                        <Typography
                                                                            variant="body2"
                                                                            fontSize={16}
                                                                            sx={{
                                                                                ':hover': {
                                                                                    cursor: 'pointer',
                                                                                    color: 'blue',
                                                                                },
                                                                            }}
                                                                        >
                                                                            {' '}
                                                                            {lesson.title}
                                                                        </Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>
                                                        </AccordionDetails>
                                                        <Divider />
                                                    </>
                                                ))
                                        ) : (
                                            <Typography variant="body2" sx={{ my: 2 }}>
                                                No lesson in this section.
                                            </Typography>
                                        )}

                                        {/* ====== Add Lesson Button ====== */}
                                        <Button
                                            variant="contained"
                                            onClick={() => handleOpenAddLessonDialog(section.id)}
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
                                            + Add a Lesson
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
                            + Add Section
                        </Button>
                    </Box>
                </TabPanel>

                {/* ================= TabPanel 2: Final Quiz ================= */}
                <TabPanel value="2">
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
            {/* ==================== Start/Stop Course Dialog ==================== */}
            <Dialog
                open={openCourseStatusDialog}
                onClose={() => setOpenCourseStatusDialog(false)}
                aria-labelledby="start-stop-dialog-title"
                aria-describedby="start-stop-dialog-description"
            >
                <DialogTitle id="start-stop-dialog-title">
                    {course?.status === 'INACTIVE' ? 'Start Course' : 'Stop Course'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="start-stop-dialog-description">
                        {course?.status === 'INACTIVE'
                            ? 'Are you sure you want to start this course?'
                            : 'Are you sure you want to stop this course?'}
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
                <DialogTitle>Add New Section</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form below to add a new section to the course.
                    </DialogContentText>

                    {/* Section Title */}
                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Section Title"
                        value={newSectionTitle}
                        onChange={(e) => setNewSectionTitle(e.target.value)}
                    />

                    {/* Section Description */}
                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={3}
                        value={newSectionDescription}
                        onChange={(e) => setNewSectionDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddSectionDialog} disabled={isCreatingSection}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateSection} disabled={isCreatingSection}>
                        {isCreatingSection ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
            {/* ==================== Add Lesson Dialog ==================== */}
            <Dialog open={openAddLessonDialog} onClose={handleCloseAddLessonDialog} fullWidth maxWidth="sm">
                <DialogTitle>Add New Lesson</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please select the lesson type and provide the necessary details.
                    </DialogContentText>

                    {/* Lesson Type Selection */}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Lesson Type</InputLabel>
                        <Select label="Lesson Type" value={selectedLessonType} onChange={handleLessonTypeChange}>
                            <MenuItem value="READING">Reading</MenuItem>
                            <MenuItem value="VIDEO">Video</MenuItem>
                            <MenuItem value="DOCUMENT">Document</MenuItem>
                            {/* Add more lesson types as needed */}
                        </Select>
                    </FormControl>

                    {/* Conditional Rendering based on Lesson Type */}
                    {selectedLessonType === 'VIDEO' && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Video Title"
                                value={newLessonData.title || ''}
                                onChange={(e) => handleLessonInputChange('title', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Video Description"
                                value={newLessonData.description || ''}
                                onChange={(e) => handleLessonInputChange('description', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Video Duration(minutes)"
                                value={newLessonData.duration || ''}
                                onChange={(e) => handleLessonInputChange('duration', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Video URL"
                                value={newLessonData.videoUrl || ''}
                                onChange={(e) => handleLessonInputChange('videoUrl', e.target.value)}
                            />
                            {/* If you want to allow video uploads, consider integrating a file upload component */}
                        </>
                    )}

                    {selectedLessonType === 'READING' && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Reading Title"
                                value={newLessonData.title || ''}
                                onChange={(e) => handleLessonInputChange('title', e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Content"
                                multiline
                                minRows={4}
                                value={newLessonData.content || ''}
                                onChange={(e) => handleLessonInputChange('content', e.target.value)}
                            />
                        </>
                    )}

                    {selectedLessonType === 'DOCUMENT' && (
                        <>
                            <TextField
                                fullWidth
                                margin="normal"
                                required
                                label="Document Title"
                                value={newLessonData.title || ''}
                                onChange={(e) => handleLessonInputChange('title', e.target.value)}
                            />
                            {/* Implement file upload if needed */}
                            <Button variant="contained" component="label" sx={{ mt: 2 }}>
                                Upload Document
                                <input
                                    type="file"
                                    hidden
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        setNewLessonData((prev) => ({ ...prev, document: file }));
                                    }}
                                />
                            </Button>
                            {newLessonData.document && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected File: {newLessonData.document.name}
                                </Typography>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddLessonDialog} disabled={isCreatingLesson}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateLesson} disabled={isCreatingLesson}>
                        {isCreatingLesson ? <CircularProgress size={24} /> : 'Create'}
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
                <DialogTitle id="alert-dialog-title">{'Delete Section'}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to delete this section? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteSectionDialog}>Cancel</Button>
                    <Button sx={{ backgroundColor: 'red', color: 'white' }} onClick={handleDeleteSection} autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
