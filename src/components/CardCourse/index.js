import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Box, Chip, Divider, Grid } from '@mui/material';
import { getImage } from '~/Constant';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import img from '~/assets/images/6eca7d1f76dbc6859fca.jpg';

export default function CardCourse({
    title,
    description,
    image,
    viewers,
    lessons,
    duration,
    status,
    machineType,
    modelName,
}) {
    function equalsIgnoreCase(a, b) {
        return a?.toLowerCase() === b?.toLowerCase();
    }

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    const getStatusColor = (status) => {
        if (equalsIgnoreCase(status, 'Active')) return 'success';
        if (equalsIgnoreCase(status, 'Drafted')) return 'warning';
        if (equalsIgnoreCase(status, 'Inactive')) return 'error';
        return 'default';
    };

    return (
        // <Card
        //     sx={{
        //         // Make the card fill 100% of the grid item
        //         height: '100%',
        //         display: 'flex',
        //         flexDirection: 'column',
        //         textAlign: 'left',
        //         borderRadius: '16px',
        //         transition: 'transform 0.3s, box-shadow 0.3s',
        //         '&:hover': {
        //             transform: 'scale(1.05)',
        //             boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        //             cursor: 'pointer',
        //         },
        //         opacity: 0.9,
        //         border: '1px solid #02F18D',
        //     }}
        // >
        //     <LazyLoadImage
        //         effect="blur"
        //         placeholderSrc={img}
        //         src={getImage(image)}
        //         alt="Card Image"
        //         width={'100%'}
        //         style={{
        //             objectFit: 'cover',
        //             aspectRatio: '16 / 9',
        //             borderRadius: '15px',
        //         }}
        //     />

        //     {/* Flex the content so it can fill remaining vertical space if needed */}
        //     <CardContent sx={{ flex: '1 1 auto' }}>
        //         <Typography
        //             gutterBottom
        //             variant="h5"
        //             component="div"
        //             fontWeight="600"
        //             sx={{
        //                 whiteSpace: 'nowrap',
        //                 overflow: 'hidden',
        //                 textOverflow: 'ellipsis',
        //             }}
        //         >
        //             {title}
        //         </Typography>

        //         <Typography
        //             variant="body2"
        //             sx={{
        //                 color: 'text.secondary',
        //                 display: '-webkit-box',
        //                 WebkitBoxOrient: 'vertical',
        //                 WebkitLineClamp: 3,
        //                 overflow: 'hidden',
        //                 textOverflow: 'ellipsis',
        //             }}
        //         >
        //             {description}
        //         </Typography>

        //         <Box sx={{ mt: 1 }}>
        //             <Typography variant="body2" sx={{ fontWeight: '500' }}>
        //                 Machine Type: {machineType}
        //             </Typography>
        //             <Typography variant="body2" sx={{ fontWeight: '500' }}>
        //                 Model Name: {modelName}
        //             </Typography>
        //         </Box>
        //         <Typography
        //             variant="body2"
        //             sx={
        //                 equalsIgnoreCase(status, 'Active')
        //                     ? {
        //                           mt: 1,
        //                           fontWeight: '700',
        //                           color: 'green',
        //                           textTransform: 'none',
        //                       }
        //                     : {
        //                           mt: 1,
        //                           fontWeight: '700',
        //                           color: 'orange',
        //                           textTransform: 'none',
        //                       }
        //             }
        //         >
        //             {formatStatus(status)}
        //         </Typography>
        //     </CardContent>
        // </Card>

        <Card
            sx={{
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
                overflow: 'hidden',
            }}
        >
            <LazyLoadImage
                effect="blur"
                placeholderSrc={img}
                src={getImage(image)}
                alt={title}
                width={'100%'}
                style={{
                    objectFit: 'cover',
                    aspectRatio: '16 / 9',
                }}
            />

            <CardContent sx={{ flex: '1 1 auto', p: 2.5 }}>
                {/* Status chip positioned at the top */}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                    <Chip
                        label={formatStatus(status)}
                        color={getStatusColor(status)}
                        size="small"
                        sx={{
                            fontWeight: 600,
                            borderRadius: '8px',
                        }}
                    />
                </Box>

                {/* Title with better spacing */}
                <Typography
                    gutterBottom
                    variant="h5"
                    component="div"
                    fontWeight="600"
                    sx={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        mb: 1.5,
                    }}
                >
                    {title}
                </Typography>

                {/* Description with better styling */}
                <Typography
                    variant="body2"
                    sx={{
                        color: 'text.secondary',
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: 1.6,
                        mb: 2,
                    }}
                >
                    {description}
                </Typography>

                <Divider sx={{ my: 1.5 }} />

                {/* Technical details in a more structured grid */}
                <Grid container spacing={1} sx={{ mt: 1 }}>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            MACHINE TYPE
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {machineType}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                            MODEL NAME
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: '500' }}>
                            {modelName}
                        </Typography>
                    </Grid>

                    {/* Optional fields, displayed only if provided */}
                    {lessons && (
                        <Grid item xs={4} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                LESSONS
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                {lessons}
                            </Typography>
                        </Grid>
                    )}
                    {duration && (
                        <Grid item xs={4} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                DURATION
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                {duration}
                            </Typography>
                        </Grid>
                    )}
                    {viewers && (
                        <Grid item xs={4} sx={{ mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                                VIEWERS
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: '500' }}>
                                {viewers}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </CardContent>
        </Card>
    );
}
