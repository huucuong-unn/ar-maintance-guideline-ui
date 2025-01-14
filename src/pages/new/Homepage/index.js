import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';
import homepageBackgroundBlack from '~/assets/images/blog.webp';
import homepageBackgroundWhite from '~/assets/images/findyourplan.webp';
import internshipProgramBackground from '~/assets/images/internshipprogram.webp';
import CardCourse from '~/components/CardCourse';

export default function Homepage() {
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

    return (
        <Grid sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${homepageBackgroundWhite})`,
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
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            textAlign: 'left',
                            fontWeight: '900',
                            fontSize: '54px',
                            color: '#051D40',
                            padding: '0 8%',
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
                        In progress
                    </Typography>
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

            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${homepageBackgroundBlack})`,
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
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            textAlign: 'left',
                            fontWeight: '900',
                            fontSize: '54px',
                            color: 'white',
                            padding: '0 8%',
                        }}
                    >
                        Compulsory courses
                    </Typography>
                    <Box sx={{ position: 'relative', padding: '0 7%', marginTop: 4 }}>
                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                nextEl: '.swiper-button-next-1',
                                prevEl: '.swiper-button-prev-1',
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
                            className="swiper-button-prev-1"
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
                            className="swiper-button-next-1"
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

            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${internshipProgramBackground})`,
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
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            textAlign: 'left',
                            fontWeight: '900',
                            fontSize: '54px',
                            color: 'white',
                            padding: '0 8%',
                        }}
                    >
                        Courses
                    </Typography>
                    <Box sx={{ position: 'relative', padding: '0 7%', marginTop: 4 }}>
                        <Swiper
                            modules={[Navigation]}
                            navigation={{
                                nextEl: '.swiper-button-next-2',
                                prevEl: '.swiper-button-prev-2',
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
                            className="swiper-button-prev-2"
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
                            className="swiper-button-next-2"
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
        </Grid>
    );
}
