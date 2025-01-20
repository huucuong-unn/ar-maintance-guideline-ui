import { Button, Grid, Paper } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import 'swiper/css';
import 'swiper/css/navigation';
import aiCoverletterSide from '~/assets/images/aiCoverletterSide.webp';
import blogBackground from '~/assets/images/blog.webp';
import homepageBackgroundWhite from '~/assets/images/findyourplan.webp';
import FAQ from '~/components/FAQ';

export default function Course() {
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
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${homepageBackgroundWhite})`,
                    minHeight: '40vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    padding: '0 8%',
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontWeight: '900',
                        fontSize: '64px',
                        color: '#051D40',
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
                    {cardData?.title}
                </Typography>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontSize: '24px',
                        color: '#051D40',
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
                    {cardData?.description}
                </Typography>
                <Button
                    type="submit"
                    variant="contained"
                    sx={{
                        backgroundColor: '#051D40',
                        color: '#fff',
                        fontSize: '16px',
                        padding: '15px 30px',
                        borderRadius: '30px',
                        ':hover': {
                            bgcolor: '#02F18D',
                            color: '#051D40',
                        },
                        mt: 4,
                        border: '3px solid #02F18D',
                        width: 'fit-content',
                    }}
                >
                    Enroll now
                </Button>
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        textAlign: 'left',
                        fontSize: '16px',
                        color: 'white',
                        mt: 2,
                    }}
                >
                    This course now has {cardData?.viewers} viewers
                </Typography>
            </Box>

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

            <Grid
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderRadius: 'none',
                    marginTop: '-116px',
                }}
            >
                <Grid
                    item
                    xs={12}
                    sm={12}
                    md={12}
                    component={Paper}
                    elevation={6}
                    square
                    sx={{
                        borderRadius: '20px',
                        backgroundColor: 'rgba(255, 255, 255, 0.0)',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'space-evenly',
                    }}
                >
                    <Box
                        sx={{
                            my: 8,
                            mx: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            width: '45%',
                            backgroundRepeat: 'no-repeat',
                            backgroundColor: (t) =>
                                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundImage: `url(${aiCoverletterSide})`,
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '90vh',
                        }}
                    ></Box>
                    <Box
                        sx={{
                            my: 6,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            // alignItems: 'center',
                            width: '45%',
                        }}
                    >
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                textAlign: 'left',
                                fontWeight: '900',
                                fontSize: '32px',
                                color: '#051D40',
                                padding: '2% 0',
                                marginLeft: '5%',
                                borderBottom: '3px solid #02F18D',
                                mb: '30px',

                                mt: '10%',
                            }}
                        >
                            WHAT YOU WILL LEARN
                        </Typography>
                        <Typography
                            sx={{
                                textAlign: 'left',
                                fontSize: '24px',
                                width: '100%',
                                padding: '0 5%',
                                color: '#051D40',
                                fontWeight: '500',
                            }}
                        >
                            Dựa trên thông tin từ công việc bạn ứng tuyển và hồ sơ cá nhân, TORTEE sẽ hỗ trợ bạn viết
                            thư xin việc thật chuyên nghiệp, giúp bạn thể hiện tốt nhất bản thân trước nhà tuyển dụng
                        </Typography>

                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{
                                textAlign: 'left',
                                fontWeight: '900',
                                fontSize: '32px',
                                color: '#051D40',
                                padding: '2% 0',
                                marginLeft: '5%',
                                borderBottom: '3px solid #02F18D',
                                mb: '30px',
                                mt: '10%',
                            }}
                        >
                            DESCRIPTION
                        </Typography>
                        <Typography
                            sx={{
                                textAlign: 'left',
                                fontSize: '24px',
                                width: '100%',
                                padding: '0 5%',
                                color: '#051D40',
                                fontWeight: '500',
                            }}
                        >
                            Dựa trên thông tin từ công việc bạn ứng tuyển và hồ sơ cá nhân, TORTEE sẽ hỗ trợ bạn viết
                            thư xin việc thật chuyên nghiệp, giúp bạn thể hiện tốt nhất bản thân trước nhà tuyển dụng
                        </Typography>
                    </Box>
                </Grid>
            </Grid>

            <Grid
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${blogBackground})`,
                    height: '100%',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <FAQ />
            </Grid>
        </Grid>
    );
}
