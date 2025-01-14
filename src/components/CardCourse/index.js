import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import { Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';

export default function CardCourse({ title, description, image, viewers, lessons, duration }) {
    return (
        <Card
            sx={{
                textAlign: 'left',
                borderRadius: '16px',
                transition: 'transform 0.3s, box-shadow 0.3s',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                    cursor: 'pointer',
                },
                opacity: 0.9,
                display: 'flex',
                flexDirection: 'column',
                height: '320px',
                border: '1px solid #02F18D',
            }}
        >
            <CardMedia
                sx={{ height: 140, margin: '8px', borderRadius: '8px' }}
                image={image} // Use the passed image URL
                title={title}
            />
            <CardContent>
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
                    {title} {/* Dynamic title */}
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
                    {description} {/* Dynamic description */}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px' }}>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <PeopleIcon fontSize="small" sx={{ marginRight: '4px' }} /> <span>{viewers}</span>
                    </Typography>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <PlayCircleIcon fontSize="small" sx={{ marginRight: '4px' }} /> <span>{lessons}</span>
                    </Typography>
                    <Typography sx={{ fontSize: '12px', display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon fontSize="small" sx={{ marginRight: '4px' }} /> <span>{duration}</span>
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
}
