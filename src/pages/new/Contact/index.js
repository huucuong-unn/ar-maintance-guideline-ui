import React from 'react';
import {
    Grid,
    Box,
    Container,
    Paper,
    Typography,
    IconButton,
    Divider,
    Card,
    CardContent,
    Button,
    Avatar,
} from '@mui/material';
import {
    Email as EmailIcon,
    Phone as PhoneIcon,
    Facebook as FacebookIcon,
    Instagram as InstagramIcon,
    Business as BusinessIcon,
    ChevronRight as ChevronRightIcon,
    LocationOn as LocationIcon,
} from '@mui/icons-material';
import LoginIcon from '@mui/icons-material/Login';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { useNavigate, Link } from 'react-router-dom';

const customTheme = createTheme({
    palette: {
        primary: {
            main: '#3f51b5',
            light: '#757de8',
            dark: '#002984',
        },
        secondary: {
            main: '#f50057',
            light: '#ff4081',
            dark: '#c51162',
        },
        background: {
            default: '#f5f5f5',
        },
    },
    typography: {
        fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
        h4: {
            fontWeight: 600,
        },
        h6: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    borderRadius: 8,
                    padding: '10px 20px',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                },
            },
        },
    },
});

export default function Contact() {
    const navigate = useNavigate();
    return (
        <ThemeProvider theme={customTheme}>
            <Grid
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `linear-gradient(rgba(63, 81, 181, 0.7), rgba(63, 81, 181, 0.4)), url(${adminLoginBackground})`,
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                {/* Nút quay lại trang Login - thêm vào góc trên bên phải */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        zIndex: 10,
                    }}
                >
                    <Button
                        component={Link}
                        to="/login"
                        variant="contained"
                        startIcon={<LoginIcon />}
                        sx={{
                            bgcolor: 'white',
                            color: '#3f51b5',
                            borderRadius: '8px',
                            px: 3,
                            py: 1,
                            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                            fontWeight: 600,
                            '&:hover': {
                                bgcolor: 'rgba(255,255,255,0.9)',
                            },
                        }}
                    >
                        Login
                    </Button>
                </Box>

                <Container maxWidth="md">
                    <Paper
                        elevation={4}
                        sx={{
                            p: { xs: 3, md: 5 },
                            borderRadius: 3,
                            backgroundColor: 'white',
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        {/* Header với gradient */}
                        <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '8px',
                                background: 'linear-gradient(90deg, #3f51b5 0%, #f50057 100%)',
                            }}
                        />

                        <Typography
                            variant="h4"
                            component="h1"
                            gutterBottom
                            sx={{
                                textAlign: 'center',
                                color: '#3f51b5',
                                mb: 4,
                                mt: 1,
                                fontWeight: 700,
                            }}
                        >
                            Contact Flatform Admin
                        </Typography>

                        <Grid container spacing={4}>
                            {/* Contact Information Section */}
                            <Grid item xs={12} md={6}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 3,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <BusinessIcon fontSize="small" /> Contact Information
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: 'primary.light', mr: 2, width: 36, height: 36 }}>
                                                    <EmailIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1">
                                                        <Link
                                                            href="mailto:nguyenthanh311003@gmail.com"
                                                            sx={{
                                                                textDecoration: 'none',
                                                                color: 'primary.main',
                                                                '&:hover': {
                                                                    textDecoration: 'underline',
                                                                },
                                                            }}
                                                        >
                                                            nguyenthanh311003@gmail.com
                                                        </Link>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar
                                                    sx={{ bgcolor: 'secondary.light', mr: 2, width: 36, height: 36 }}
                                                >
                                                    <PhoneIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1">0967709009</Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: '#3b5998', mr: 2, width: 36, height: 36 }}>
                                                    <FacebookIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1">
                                                        <Link
                                                            href="https://facebook.com/flatform"
                                                            target="_blank"
                                                            sx={{
                                                                textDecoration: 'none',
                                                                color: '#3b5998',
                                                                '&:hover': {
                                                                    textDecoration: 'underline',
                                                                },
                                                            }}
                                                        >
                                                            Flatform Facebook Page
                                                        </Link>
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <Avatar sx={{ bgcolor: '#e1306c', mr: 2, width: 36, height: 36 }}>
                                                    <InstagramIcon fontSize="small" />
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body1">
                                                        <Link
                                                            href="https://instagram.com/flatform"
                                                            target="_blank"
                                                            sx={{
                                                                textDecoration: 'none',
                                                                color: '#e1306c',
                                                                '&:hover': {
                                                                    textDecoration: 'underline',
                                                                },
                                                            }}
                                                        >
                                                            Flatform Instagram
                                                        </Link>
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>

                            {/* Account Creation Guide Section */}
                            <Grid item xs={12} md={6}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        height: '100%',
                                        border: '1px solid rgba(0, 0, 0, 0.08)',
                                        borderRadius: 2,
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                        },
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                mb: 2,
                                                color: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1,
                                            }}
                                        >
                                            <BusinessIcon fontSize="small" /> How to Create a Company Account
                                        </Typography>

                                        <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                                            To create a company account on Flatform, please follow these steps:
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    1
                                                </Avatar>
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    Contact our admin via email or phone to initiate the account
                                                    creation process.
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    2
                                                </Avatar>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                                        Prepare your company's essential information, including:
                                                    </Typography>
                                                    <Box
                                                        sx={{
                                                            ml: 2,
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            gap: 0.5,
                                                        }}
                                                    >
                                                        {[
                                                            'Company name',
                                                            'Business registration number',
                                                            'Primary contact person',
                                                            'Company address',
                                                            'Brief company description',
                                                        ].map((item, index) => (
                                                            <Box
                                                                key={index}
                                                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                                            >
                                                                <ChevronRightIcon fontSize="small" color="primary" />
                                                                <Typography variant="body2">{item}</Typography>
                                                            </Box>
                                                        ))}
                                                    </Box>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    3
                                                </Avatar>
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    Our admin will review your information and guide you through the
                                                    verification process.
                                                </Typography>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 2 }}>
                                                <Avatar
                                                    sx={{
                                                        bgcolor: 'primary.main',
                                                        width: 28,
                                                        height: 28,
                                                        fontSize: 14,
                                                    }}
                                                >
                                                    4
                                                </Avatar>
                                                <Typography variant="body2" sx={{ flex: 1 }}>
                                                    Once verified, you'll receive your company account credentials.
                                                </Typography>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                startIcon={<EmailIcon />}
                                                sx={{
                                                    borderRadius: 4,
                                                    px: 3,
                                                    py: 1,
                                                    fontWeight: 500,
                                                }}
                                                href="mailto:nguyenthanh311003@gmail.com"
                                            >
                                                Contact Admin Now
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Divider sx={{ my: 4 }} />

                        {/* Login Option */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Typography variant="body1" sx={{ mb: 2 }}>
                                Already have an account?
                            </Typography>
                            <Button
                                component={Link}
                                to="/login"
                                variant="outlined"
                                color="primary"
                                startIcon={<LoginIcon />}
                                sx={{
                                    borderRadius: 4,
                                    px: 4,
                                    py: 1,
                                    fontWeight: 500,
                                }}
                            >
                                Login to your account
                            </Button>
                        </Box>

                        {/* Social Media Links */}
                        {/* <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: 1,
                            }}
                        >
                            <Typography variant="body2" sx={{ mr: 2, color: 'text.secondary' }}>
                                Follow us:
                            </Typography>
                            <IconButton
                                href="https://facebook.com/flatform"
                                target="_blank"
                                sx={{
                                    color: '#3b5998',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        bgcolor: 'rgba(59, 89, 152, 0.1)',
                                    },
                                }}
                            >
                                <FacebookIcon />
                            </IconButton>
                            <IconButton
                                href="https://instagram.com/flatform"
                                target="_blank"
                                sx={{
                                    color: '#e1306c',
                                    transition: 'transform 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.1)',
                                        bgcolor: 'rgba(225, 48, 108, 0.1)',
                                    },
                                }}
                            >
                                <InstagramIcon />
                            </IconButton>
                        </Box> */}

                        {/* <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2, color: 'text.secondary', fontSize: '0.75rem' }}
                        >
                            © {new Date().getFullYear()} Flatform. All rights reserved.
                        </Typography> */}
                    </Paper>
                </Container>
            </Grid>
        </ThemeProvider>
    );
}
