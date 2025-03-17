import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { getImage } from '~/Constant';

export default function CardMachine({ machine }) {
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
                image={getImage(machine?.image)}
                title={machine.name}
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
                    {machine?.machineName}
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
                    {machine?.machineType}
                </Typography>
            </CardContent>
        </Card>
    );
}
