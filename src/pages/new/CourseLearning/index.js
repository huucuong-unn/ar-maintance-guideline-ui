import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'swiper/css';
import 'swiper/css/navigation';

export default function CourseLearning() {
    const cardData = {
        title: 'Lizard',
        description: 'Lizards are a widespread group of squamate reptiles, with over 6,000 species.',
        image: 'https://ichef.bbci.co.uk/ace/standard/819/cpsprodpb/0a8d/live/3fa00bd0-864a-11ef-ac05-1b95256399e8.jpg',
        viewers: '1000',
        lessons: '32',
        duration: '2h',
    };
    return (
        <Grid sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
            <Grid
                sx={{
                    display: 'flex',
                    border: '2px #02F18D solid',
                    borderRadius: '12px',
                    margin: '0 8%',
                    justifyContent: 'space-evenly',
                    padding: '20px',
                    position: 'relative',
                    top: '-30px',

                    backgroundColor: 'white',
                    color: '#051D40',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                }}
            >
                <Box>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '26px' }}>Lessons</Typography>
                    <Typography sx={{ fontSize: '22px' }}>50</Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '26px' }}>Duration</Typography>
                    <Typography sx={{ fontSize: '22px' }}>50</Typography>
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 'bold', fontSize: '26px' }}>Enroll</Typography>
                    <Typography sx={{ fontSize: '22px' }}>50</Typography>
                </Box>
            </Grid>
        </Grid>
    );
}
