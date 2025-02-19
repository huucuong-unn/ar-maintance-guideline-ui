import { Card, CardMedia, CardContent, Typography, Button } from '@mui/material';
import { getImage } from '~/Constant';

export default function CardModel({ model }) {
    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
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
                image={getImage(model.image)}
                title={model.name}
                sx={{
                    width: '100%',
                    height: 140,
                    objectFit: 'cover',
                    borderRadius: '8px',
                    padding: '8px',
                }}
            />
            <CardContent sx={{ flex: '1 1 auto' }}>
                <Typography gutterBottom variant="h5" component="div" fontWeight="600" noWrap>
                    {model.name}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                    }}
                >
                    {model.description}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ mt: 1, fontWeight: '700', color: model.status === 'ACTIVE' ? 'green' : 'orange' }}
                >
                    {model.status}
                </Typography>
                <Button variant="contained" size="small" sx={{ mt: 1 }}>
                    View Details
                </Button>
            </CardContent>
        </Card>
    );
}
