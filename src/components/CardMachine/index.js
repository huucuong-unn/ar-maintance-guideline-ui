import { Card, CardContent, CardMedia, Typography } from '@mui/material';
import { Settings } from 'lucide-react';

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
            <CardContent sx={{ flex: '1 1 auto' }}>
                <Typography gutterBottom variant="h5" component="div" fontWeight="600" noWrap>
                    {machine?.machineTypeName} <Settings />
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
                    {machine?.description}
                </Typography>{' '}
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
                    {machine?.numOfAttribute} attribute(s)
                </Typography>
            </CardContent>
        </Card>
    );
}
