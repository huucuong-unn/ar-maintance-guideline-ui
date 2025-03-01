import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Typography, Grid, Paper, Box, TextField, Button, Alert, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AccountAPI from '~/API/AccountAPI';
import storageService from '~/components/StorageService/storageService';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©Tortee '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();
export default function CompanyLogin() {
    const adminRole = 'ADMIN';
    const companyRole = 'COMPANY';
    const [showAlertError, setShowAlertError] = useState(false);
    const [loginLoading, setLoginLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoginLoading(true); // Start the loading spinner
        try {
            const data = new FormData(event.currentTarget);
            // Make the API call
            const userInfo = await AccountAPI.login(data);

            // If status is 200, login successful
            if (userInfo) {
                setLoginLoading(false);

                storageService.setItem('userInfo', userInfo?.result); // Store user info

                if (userInfo?.result?.user?.role?.roleName === adminRole) {
                    navigate('/admin/account-management'); // Navigate
                }

                if (userInfo?.result?.user?.role?.roleName === companyRole) {
                    navigate('/company/course'); // Navigate
                }
            } else {
                // If login fails (non-200 status)
                setLoginLoading(false);
                setShowAlertError(true); // Show error alert
                setTimeout(() => setShowAlertError(false), 5000); // Hide alert after 5s
            }
        } catch (error) {
            // Handle API errors (network issues, server errors, etc.)
            console.error('Login error:', error);
            setLoginLoading(false);
            setShowAlertError(true); // Show error alert
            setTimeout(() => setShowAlertError(false), 5000); // Hide alert after 5s
        }
    };
    return (
        <ThemeProvider theme={defaultTheme}>
            {showAlertError && (
                <Alert width="50%" variant="filled" severity="error">
                    Incorrect username or password or please check login correct role !
                </Alert>
            )}
            {loginLoading ? (
                <Grid sx={{ width: '100%', height: '100vh', opacity: 0.8, backgroundColor: 'white' }}>
                    <Box
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex', // Enable flexbox
                            justifyContent: 'center', // Center horizontally
                            alignItems: 'center', // Center vertically
                        }}
                    >
                        <CircularProgress />
                    </Box>
                </Grid>
            ) : (
                <Grid
                    container
                    component="main"
                    item
                    sx={{
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: `url(${adminLoginBackground})`,
                        height: '100vh',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <Grid
                        item
                        xs={12}
                        sm={8}
                        md={5}
                        component={Paper}
                        elevation={6}
                        square
                        sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                    >
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                component="h1"
                                variant="h4"
                                sx={{ fontWeight: '900', fontSize: '46px', color: '#051D40' }}
                            >
                                LOGIN
                            </Typography>
                            <Box sx={{ width: '100%', typography: 'body1', mt: 2, padding: '0 10%' }}>
                                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="3"
                                        label="Email"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                    />
                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        // sx={{ mt: 3, mb: 2 }}
                                        sx={{
                                            mt: 3,
                                            mb: 2,
                                            bgcolor: '#051D40',
                                            borderRadius: '24px',
                                            padding: '12px 0',
                                            fontSize: '16px',
                                            ':hover': {
                                                bgcolor: '#051D40',
                                                opacity: '0.8',
                                            },
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                        Don't have an account?{' '}
                                        <Link
                                            to="/company/register"
                                            style={{ textDecoration: 'none', color: '#051D40', fontWeight: 'bold' }}
                                        >
                                            Register
                                        </Link>
                                    </Typography>
                                    <Copyright sx={{ mt: 5 }} />
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            )}
        </ThemeProvider>
    );
}
