import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { getImage } from '~/Constant';

export default function CardCourse({ title, description, image, viewers, lessons, duration, status }) {
    function equalsIgnoreCase(a, b) {
        return a?.toLowerCase() === b?.toLowerCase();
    }

    return (
        <Card
            sx={{
                // Make the card fill 100% of the grid item
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'left',
                borderRadius: '16px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                },
                opacity: 0.9,
                border: '1px solid #02F18D',
            }}
        >
            <CardMedia
                component="img"
                image={getImage(image)} // Construct API URL
                title={title}
                sx={{
                    // No margin here
                    width: '100%', // fill the card’s width
                    height: 140, // fixed height
                    objectFit: 'cover',
                    borderRadius: '8px', // round corners
                    padding: '8px',
                }}
            />

            {/* Flex the content so it can fill remaining vertical space if needed */}
            <CardContent sx={{ flex: '1 1 auto' }}>
                <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    fontWeight="600"
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {description}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" sx={{ marginRight: '4px' }} /> {viewers}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <PlayCircleIcon fontSize="small" sx={{ marginRight: '4px' }} /> {lessons}
                    </Typography>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ marginRight: '4px' }} /> {duration}
                    </Typography>
                </Box>

                <Typography
                    variant="body2"
                    sx={
                        equalsIgnoreCase(status, 'Active')
                            ? {
                                  mt: 1,
                                  fontWeight: '700',
                                  color: 'green',
                              }
                            : {
                                  mt: 1,
                                  fontWeight: '700',
                                  color: 'orange',
                              }
                    }
                >
                    {status}
                </Typography>
            </CardContent>
        </Card>
    );
}
