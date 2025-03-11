import { Accordion, AccordionDetails, AccordionSummary, Container, Divider } from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import CourseAPI from '~/API/CourseAPI';
import CardCourse from '~/components/CardCourse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Divide } from 'lucide-react';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©ARGuideline '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function CoursesControlQuiz() {
    const [expanded, setExpanded] = useState(false);

    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };
    const cardData = [
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        {
            title: 'Snake',
            description: 'Snakes are elongated, legless, carnivorous reptiles of the suborder Serpentes.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '800',
            lessons: '25',
            duration: '1.5h',
        },
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        {
            title: 'Lizard',
            description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
            image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
            viewers: '1000',
            lessons: '32',
            duration: '2h',
        },
        // Add more cards as needed
    ];
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);

    // DataGrid pagination model
    const [paginationModel, setPaginationModel] = useState({
        page: 0, // zero-based for DataGrid
        pageSize: 5, // items per page
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Convert zero-based to one-based if your API requires it
                const pageParam = paginationModel.page + 1;
                const sizeParam = paginationModel.pageSize;

                const params = {
                    page: pageParam,
                    size: sizeParam,
                    // ...additional parameters
                };

                const response = await CourseAPI.getAll(params);
                const data = response?.result?.object || [];
                setRows(data);

                // If your API returns total item count, set it for the DataGrid
                setTotal(response?.result?.totalItems || 0);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };
        fetchData();
    }, [paginationModel]);
    const columns = [
        { field: 'id', headerName: 'Id', width: 10 },
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'imageUrl', headerName: 'PictureUrl', width: 200 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'duration', headerName: 'Duration', width: 100 },
        { field: 'isMandatory', headerName: 'Is Mandatory', width: 100 },
        { field: 'numberOfLessons', headerName: 'Lesson', width: 100 },
        { field: 'numberOfParticipants', headerName: 'Participant', width: 100 },
        { field: 'status', headerName: 'Status', width: 100 },
    ];

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
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                    My Courses
                </Typography>
                {/* <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '90%' }}>
                    <Box
                        sx={{
                            height: '100%',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                borderRadius: '20px',
                                backgroundColor: 'rgba(255, 255, 255, 0.0)',
                                height: '100%',
                                width: '100%',
                                padding: '5% 0',
                            }}
                        >
                            <Box sx={{ position: 'relative', padding: '0 7%', marginTop: 4 }}>
                                <Swiper
                                    modules={[Navigation]}
                                    navigation={{
                                        nextEl: '.swiper-button-next-0',
                                        prevEl: '.swiper-button-prev-0',
                                    }}
                                    spaceBetween={20}
                                    slidesPerView={5}
                                    loop={true}
                                    style={{
                                        padding: '20px 20px',
                                    }}
                                >
                                    {cardData.map((data, index) => (
                                        <SwiperSlide key={index}>
                                            <CardCourse
                                                title={data.title}
                                                description={data.description}
                                                image={data.image}
                                                viewers={data.viewers}
                                                lessons={data.lessons}
                                                duration={data.duration}
                                            />
                                        </SwiperSlide>
                                    ))}
                                </Swiper>
                                <Box
                                    className="swiper-button-prev-0"
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: 0,
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        color: 'white',
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        marginLeft: '2%',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                    }}
                                >
                                    <NavigateNextIcon sx={{ transform: 'rotate(180deg)' }} />
                                </Box>
                                <Box
                                    className="swiper-button-next-0"
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        right: 0,
                                        transform: 'translateY(-50%)',
                                        zIndex: 10,
                                        backgroundColor: 'rgba(0, 0, 0, 0.3)',
                                        color: 'white',
                                        width: '56px',
                                        height: '56px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        marginRight: '2%',
                                        '&:hover': {
                                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                        },
                                    }}
                                >
                                    <NavigateNextIcon />
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                </Grid> */}
                <Container
                    id="faq"
                    sx={{
                        pt: { xs: 4, sm: 12 },
                        pb: { xs: 8, sm: 16 },
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: { xs: 3, sm: 6 },
                        fontFamily: 'Montserrat, sans-serif',
                    }}
                >
                    <Accordion
                        expanded={expanded === 'panel1'}
                        onChange={handleChange('panel1')}
                        sx={{
                            border: '1px solid #dee2e6',
                            boxShadow: 'none',
                            color: '#051D40',
                            padding: '20px',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1d-content"
                            id="panel1d-header"
                        >
                            <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                                What types of courses are offered on this platform?
                            </Typography>
                        </AccordionSummary>
                        <Divider />
                        <AccordionDetails sx={{ padding: '20px' }}>
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                                fontSize="16px"
                            >
                                Our platform offers a wide range of business-related courses, including topics such as
                                leadership, project management, marketing strategies, financial analysis,
                                entrepreneurship, and more. Whether you're a beginner or an experienced professional, we
                                have something for you.
                            </Typography>
                        </AccordionDetails>
                        <Divider />
                        <AccordionDetails>
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                                fontSize="16px"
                            >
                                Our platform offers a wide range of business-related courses, including topics such as
                                leadership, project management, marketing strategies, financial analysis,
                                entrepreneurship, and more. Whether you're a beginner or an experienced professional, we
                                have something for you.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion
                        expanded={expanded === 'panel2'}
                        onChange={handleChange('panel2')}
                        sx={{
                            border: '1px solid #dee2e6',
                            boxShadow: 'none',
                            color: '#051D40',
                            py: '12px',
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel1d-content"
                            id="panel1d-header"
                        >
                            <Typography component="h3" variant="subtitle2" fontSize="24px" fontWeight="700">
                                What types of courses are offered on this platform?
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography
                                variant="body2"
                                gutterBottom
                                sx={{ maxWidth: { sm: '100%', md: '70%', fontSize: '18px' } }}
                                fontSize="16px"
                            >
                                Our platform offers a wide range of business-related courses, including topics such as
                                leadership, project management, marketing strategies, financial analysis,
                                entrepreneurship, and more. Whether you're a beginner or an experienced professional, we
                                have something for you.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Container>
            </Grid>
        </ThemeProvider>
    );
}
