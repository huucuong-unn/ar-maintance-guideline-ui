import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import CardCourse from '~/components/CardCourse';
import homepageBackgroundWhite from '~/assets/images/findyourplan.webp';
import homepageBackgroundBlack from '~/assets/images/blog.webp';

import { Grid } from '@mui/material';

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
                    <Box sx={{ padding: '0 7%', marginTop: 4 }}>
                        <Swiper
                            modules={[Navigation]}
                            navigation
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
                    <Box sx={{ padding: '0 7%', marginTop: 4 }}>
                        <Swiper
                            modules={[Navigation]}
                            navigation
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
                    </Box>
                </Box>
            </Box>
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
                            color: 'white',
                            padding: '0 8%',
                        }}
                    >
                        Courses
                    </Typography>
                    <Box sx={{ padding: '0 7%', marginTop: 4 }}>
                        <Swiper
                            modules={[Navigation]}
                            navigation
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
                    </Box>
                </Box>
            </Box>
        </Grid>
    );
}
