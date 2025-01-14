import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default function CardMyLearning({ title, description, image, viewers, lessons, duration }) {
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
                opacity: 0.8,
                display: 'flex',
                flexDirection: 'column',
                width: '70%',
                marginBottom: '40px',
                border: '1px solid #02F18D',
            }}
        >
            <CardContent>
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        marginBottom: '8px',
                    }}
                >
                    Course {/* Dynamic description */}
                </Typography>
                <Typography gutterBottom variant="h3" component="div" fontWeight="600" sx={{ color: '#051D40' }}>
                    {title} {/* Dynamic title */}
                </Typography>
                <Typography variant="body2">
                    ✅ Nicely done! You've successfully fulfilled all the requirements and completed the course.
                </Typography>
            </CardContent>
        </Card>
    );
}
