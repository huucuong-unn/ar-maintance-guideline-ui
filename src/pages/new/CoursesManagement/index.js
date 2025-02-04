import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import CourseAPI from '~/API/CourseAPI';

import adminLoginBackground from '~/assets/images/adminlogin.webp';

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

export default function CoursesManagement() {
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);

    // DataGrid pagination model
    const [paginationModel, setPaginationModel] = useState({
        page: 0, // zero-based for DataGrid
        pageSize: 5, // items per page
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Convert zero-based to one-based if your API requires it
                const pageParam = paginationModel.page + 1;
                const sizeParam = paginationModel.pageSize;

                const params = {
                    page: pageParam,
                    size: sizeParam,
                    // ...additional parameters
                };

                const response = await CourseAPI.getAll(params);
                const data = response?.result?.object || [];
                setRows(data);

                // If your API returns total item count, set it for the DataGrid
                setTotal(response?.result?.totalItems || 0);
            } catch (error) {
                console.error('Failed to fetch courses:', error);
            }
        };
        fetchData();
    }, [paginationModel]);
    const columns = [
        { field: 'id', headerName: 'Id', width: 10 },
        { field: 'title', headerName: 'Title', width: 200 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'imageUrl', headerName: 'PictureUrl', width: 200 },
        { field: 'description', headerName: 'Description', width: 200 },
        { field: 'duration', headerName: 'Duration', width: 100 },
        { field: 'isMandatory', headerName: 'Is Mandatory', width: 100 },
        { field: 'numberOfLessons', headerName: 'Lesson', width: 100 },
        { field: 'numberOfParticipants', headerName: 'Participant', width: 100 },
        { field: 'status', headerName: 'Status', width: 100 },
    ];

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
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: '900',
                        fontSize: '46px',
                        color: '#051D40',
                        // zIndex: 1,
                        position: 'absolute',
                        top: '3%',
                        left: '20%',
                    }}
                >
                    Courses
                </Typography>
                <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '90%' }}>
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
                                    pageSizeOptions={[5, 10, 25]}
                                    paginationMode="server"
                                    rowCount={total}
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={setPaginationModel}
                                    sx={{
                                        '& .MuiDataGrid-scrollbar': {
                                            left: 0,
                                        },
                                    }}
                                    slots={{ toolbar: GridToolbar }}
                                />
                            </Paper>

                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
}
