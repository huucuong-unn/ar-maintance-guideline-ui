import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import CompanyAPI from '~/API/CompanyAPI';

import adminLoginBackground from '~/assets/images/adminlogin.webp';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©ARGuideline '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();
const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = date.getFullYear();

    return `${month}/${day}/${year}`;
};
export default function CompaniesManagement() {
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const response = await CompanyAPI.getAll();
                const data = response?.result || [];

                setRows(data);
            } catch (error) {
                console.log('Failed to fetch blogs: ', error);
            }
        };
        fetchBlogs();
    }, []);
    const columns = [
        { field: 'companyName', headerName: 'Company Name', width: 300 },
        { field: 'numberOfAccount', headerName: 'Number of Account', width: 250 },
        { field: 'numberOfGuideline', headerName: 'Number of Guideline', width: 250 },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            width: 250,
            renderCell: (params) => formatDate(params.value),
        },
    ];

    const [rows, setRows] = useState([]);

    return (
        <ThemeProvider theme={defaultTheme}>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%' }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            my: 5,
                        }}
                    >
                        Companies
                    </Typography>
                    <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '100%' }}>
                        <Box
                            sx={{
                                my: 8,
                                mx: 4,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                            }}
                        >
                            <Box sx={{ width: '100%', typography: 'body1' }}>
                                <Paper sx={{ height: 400, width: '100%' }}>
                                    <DataGrid
                                        rows={rows}
                                        columns={columns}
                                        sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                                    />
                                </Paper>

                                <Copyright sx={{ mt: 5 }} />
                            </Box>
                        </Box>
                    </Grid>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
