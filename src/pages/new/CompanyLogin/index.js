import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Typography, Grid, Paper, Box, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';

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
    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                component="main"
                item
                sx={{
                    // backgroundImage: 'url(https://source.unsplash.com/random?wallpapers)',
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
                            <Box component="form" sx={{ mt: 1 }}>
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
        </ThemeProvider>
    );
}
