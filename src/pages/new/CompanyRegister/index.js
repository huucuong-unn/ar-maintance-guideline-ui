import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Typography, Grid, Paper, Box, TextField, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import AccountAPI from '~/API/AccountAPI';
import { useNavigate } from 'react-router-dom';

const defaultTheme = createTheme();

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©ARGuideline '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const validationSchema = Yup.object().shape({
    companyName: Yup.string().required('Company Name is required'),
    taxCode: Yup.string().required('Tax Code is required'),
    phone: Yup.string()
        .required('Phone is required')
        .matches(/^[0-9]+$/, 'Phone must be only digits')
        .max(11, 'Phone cannot exceed 11 digits'),
    email: Yup.string().required('Email is required').email('Email is invalid'),
    password: Yup.string()
        .required('Password is required')
        .min(10, 'Password must be at least 10 characters')
        .max(20, 'Password cannot exceed 20 characters'),
    confirmPassword: Yup.string()
        .required('Confirm Password is required')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export default function CompanyRegister() {
    const navigate = useNavigate();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
    });

    const onSubmit = async (data) => {
        const requestBody = {
            email: data.email,
            password: data.password,
            phone: data.phone,
            avatar: 'http://example.com/avatar.jpg',
            company: data.companyName,
            roleName: 'COMPANY',
        };

        try {
            const response = await AccountAPI.createAccount(requestBody);
            console.log('Registration successful:', response.data);
            alert('Registration successful!');
            navigate('/company/waiting');
        } catch (error) {
            if (error.response && error.response.data) {
                const { code, message } = error.response.data;
                if (code === 2711 && message === 'Create Company failed') {
                    alert('Company Name IsExisted !');
                } else {
                    alert('Registration failed! Please try again.');
                }
            } else {
                alert('An error occurred. Please check your network connection.');
            }
            console.error('Registration failed:', error);
        }
    };
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
                            REGISTER
                        </Typography>
                        <Box sx={{ width: '100%', typography: 'body1', mt: 2, padding: '0 10%' }}>
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Controller
                                            name="companyName"
                                            control={control}
                                            defaultValue=""
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    margin="normal"
                                                    required
                                                    fullWidth
                                                    label="Company Name"
                                                    error={!!errors.companyName}
                                                    helperText={errors.companyName?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Controller
                                            name="taxCode"
                                            control={control}
                                            defaultValue=""
                                            render={({ field }) => (
                                                <TextField
                                                    {...field}
                                                    margin="normal"
                                                    required
                                                    fullWidth
                                                    label="Tax Code"
                                                    error={!!errors.taxCode}
                                                    helperText={errors.taxCode?.message}
                                                />
                                            )}
                                        />
                                    </Grid>
                                </Grid>
                                <Controller
                                    name="phone"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Phone"
                                            error={!!errors.phone}
                                            helperText={errors.phone?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="email"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Email"
                                            error={!!errors.email}
                                            helperText={errors.email?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="password"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Password"
                                            type="password"
                                            error={!!errors.password}
                                            helperText={errors.password?.message}
                                        />
                                    )}
                                />
                                <Controller
                                    name="confirmPassword"
                                    control={control}
                                    defaultValue=""
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            margin="normal"
                                            required
                                            fullWidth
                                            label="Confirm Password"
                                            type="password"
                                            error={!!errors.confirmPassword}
                                            helperText={errors.confirmPassword?.message}
                                        />
                                    )}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
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
                                    Register
                                </Button>
                                <Typography variant="body2" align="center" sx={{ mt: 2 }}>
                                    You have an account?{' '}
                                    <Link
                                        to="/login"
                                        style={{ textDecoration: 'none', color: '#051D40', fontWeight: 'bold' }}
                                    >
                                        Login
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
