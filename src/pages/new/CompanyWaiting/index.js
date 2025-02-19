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

export default function CompanyWaiting() {
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
                <Typography component="h1" variant="h4" sx={{ fontWeight: '900', fontSize: '46px', color: '#051D40' }}>
                    Registration Successful! Awaiting Admin Approval.
                </Typography>
            </Grid>
        </ThemeProvider>
    );
}
