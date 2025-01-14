import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Grid, Tab } from '@mui/material';
import Box from '@mui/material/Box';
import React from 'react';
import 'swiper/css';
import 'swiper/css/navigation';
import homepageBackgroundWhite from '~/assets/images/findyourplan.webp';
import CardMyLearning from '~/components/CardMyLearning';

export default function MyLearning() {
    const cardData = [
        {
            title: 'Introduction to User Experience Principles and Processes',
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
    ];
    const [value, setValue] = React.useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Grid sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${homepageBackgroundWhite})`,
                    minHeight: '1000px',
                    width: '100%',
                }}
            >
                <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                        <TabList
                            onChange={handleChange}
                            textColor="#051D40"
                            aria-label="lab API tabs example"
                            sx={{ margin: '0 8%' }}
                        >
                            <Tab label="In Progress" value="1" />
                            <Tab label="Completed" value="2" />
                        </TabList>
                    </Box>
                    <Box>
                        <TabPanel value="1">
                            {/* In progress tab */}
                            <Box
                                sx={{
                                    borderRadius: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ position: 'relative', padding: '0 7%', marginTop: 4 }}>
                                    {cardData.map((data, index) => (
                                        <CardMyLearning
                                            key={index}
                                            title={data.title}
                                            description={data.description}
                                            image={data.image}
                                            viewers={data.viewers}
                                            lessons={data.lessons}
                                            duration={data.duration}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </TabPanel>
                        <TabPanel value="2">
                            {/* Completed tab */}
                            <Box
                                sx={{
                                    borderRadius: '20px',
                                    backgroundColor: 'rgba(255, 255, 255, 0.0)',
                                    height: '100%',
                                    width: '100%',
                                }}
                            >
                                <Box sx={{ position: 'relative', padding: '0 7%', marginTop: 4 }}>
                                    {cardData.map((data, index) => (
                                        <CardMyLearning
                                            key={index}
                                            title={data.title}
                                            description={data.description}
                                            image={data.image}
                                            viewers={data.viewers}
                                            lessons={data.lessons}
                                            duration={data.duration}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </TabPanel>
                    </Box>
                </TabContext>
            </Box>
        </Grid>
    );
}
