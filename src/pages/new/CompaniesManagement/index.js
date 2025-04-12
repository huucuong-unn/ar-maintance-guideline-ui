import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { TextField, Button, Chip, InputAdornment, Autocomplete, CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import CompanyAPI from '~/API/CompanyAPI';

// Icons import
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import DomainAddIcon from '@mui/icons-material/DomainAdd';
import AssessmentIcon from '@mui/icons-material/Assessment';
import StorageIcon from '@mui/icons-material/Storage';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);
    const [searchCompanyName, setSearchCompanyName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Stats for dashboard
    const [totalCompanies, setTotalCompanies] = useState(0);
    const [totalAccounts, setTotalAccounts] = useState(0);
    const [totalGuidelines, setTotalGuidelines] = useState(0);
    const [recentCompanies, setRecentCompanies] = useState(0);

    const handleSearch = () => {
        fetchCompanies();
    };

    const resetFilters = () => {
        setSearchCompanyName('');
        setPaginationModel({
            ...paginationModel,
            page: 0,
        });
        setTimeout(() => fetchCompanies(), 0);
    };

    const fetchStats = async () => {
        try {
            // In a real scenario, this would be a separate API call to get summary statistics
            // For now, we'll simulate it by calculating from existing data

            const response = await CompanyAPI.getAll({ page: 1, size: 5 });
            const companies = response?.result?.objectList || [];

            // Calculate total
            setTotalCompanies(response?.result?.totalItems || 0);

            // Calculate total accounts and guidelines
            let accounts = 0;
            let guidelines = 0;

            companies.forEach((company) => {
                accounts += company.numberOfAccount || 0;
                guidelines += company.numberOfGuideline || 0;
            });

            setTotalAccounts(accounts);
            setTotalGuidelines(guidelines);

            // Count companies created in the last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const recentCount = companies.filter((company) => {
                if (!company.createdDate) return false;
                const createdDate = new Date(company.createdDate);
                return createdDate >= thirtyDaysAgo;
            }).length;

            setRecentCompanies(recentCount);
        } catch (error) {
            console.error('Failed to fetch statistics: ', error);
        }
    };

    const fetchCompanies = async () => {
        try {
            setIsLoading(true);
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                companyName: searchCompanyName || undefined,
            };
            const response = await CompanyAPI.getAll(params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);

            // Update stats whenever companies data is fetched
            fetchStats();
        } catch (error) {
            console.error('Failed to fetch companies: ', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCompanies();
    }, [paginationModel]);

    const columns = [
        {
            field: 'companyName',
            headerName: 'Company Name',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <BusinessIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2" fontWeight="medium">
                        {params.value}
                    </Typography>
                </Box>
            ),
        },
        {
            field: 'numberOfAccount',
            headerName: 'Accounts',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    icon={<PeopleAltIcon />}
                    label={params.value || 0}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        color: '#1976d2',
                        fontWeight: 'medium',
                        borderRadius: '16px',
                        border: '1px solid rgba(25, 118, 210, 0.2)',
                    }}
                />
            ),
        },
        {
            field: 'numberOfGuideline',
            headerName: 'Guidelines',
            flex: 1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip
                    icon={<MenuBookIcon />}
                    label={params.value || 0}
                    size="small"
                    sx={{
                        bgcolor: 'rgba(255, 193, 7, 0.1)',
                        color: '#FF8F00',
                        fontWeight: 'medium',
                        borderRadius: '16px',
                        border: '1px solid rgba(255, 193, 7, 0.2)',
                    }}
                />
            ),
        },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            flex: 1,
            minWidth: 150,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
                    <EventIcon sx={{ color: 'action.active', fontSize: '1.1rem', opacity: 0.7 }} />
                    <Typography variant="body2">{formatDate(params.value)}</Typography>
                </Box>
            ),
        },
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
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 3 }}>
                    {/* Header with Dashboard Stats */}
                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    mb: 1,
                                }}
                            >
                                <Typography
                                    component="h1"
                                    variant="h4"
                                    sx={{
                                        fontWeight: '800',
                                        fontSize: { xs: '28px', md: '36px', lg: '42px' },
                                        color: '#051D40',
                                        display: 'flex',
                                        alignItems: 'center', // để icon và chữ cùng hàng
                                    }}
                                >
                                    <DomainAddIcon
                                        sx={{
                                            fontSize: 'inherit',
                                            marginRight: 1,
                                        }}
                                    />
                                    Companies Management
                                </Typography>
                                {/* 
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<DomainAddIcon />}
                                        sx={{
                                            bgcolor: '#051D40',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#02F18D',
                                                color: '#051D40',
                                            },
                                            px: 3,
                                            py: 1.2,
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgba(5, 29, 64, 0.15)',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Add New Company
                                    </Button>
                                </Box> */}
                            </Box>

                            {/* Stats Cards */}
                            <Grid container spacing={2} sx={{ mt: 1, mb: 3 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
                                            border: '1px solid #90CAF9',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Total Companies
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {totalCompanies}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <BusinessIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Registered Organizations
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                {/* <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)',
                                            border: '1px solid #A5D6A7',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Total Accounts
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {totalAccounts}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <PeopleAltIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                User Accounts
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid> */}

                                {/* <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)',
                                            border: '1px solid #FFCC80',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            Total Guidelines
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#E65100" sx={{ mt: 1 }}>
                                            {totalGuidelines}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <MenuBookIcon
                                                sx={{ color: '#E65100', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Documentation Materials
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid> */}

                                <Grid item xs={12} sm={6} md={3}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 2,
                                            borderRadius: '12px',
                                            background: 'linear-gradient(135deg, #E8EAF6 0%, #C5CAE9 100%)',
                                            border: '1px solid #9FA8DA',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                        }}
                                    >
                                        <Typography variant="body2" color="text.secondary">
                                            New Companies (30 days)
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#303F9F" sx={{ mt: 1 }}>
                                            {recentCompanies}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CalendarTodayIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Recent Additions
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>

                    {/* Search and Filters */}
                    <Paper
                        elevation={1}
                        sx={{
                            p: 3,
                            mb: 3,
                            borderRadius: '12px',
                            backgroundColor: 'white',
                        }}
                    >
                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2, color: '#051D40' }}>
                            Search & Filters
                        </Typography>

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                                <TextField
                                    fullWidth
                                    label="Company Name"
                                    variant="outlined"
                                    value={searchCompanyName}
                                    onChange={(e) => setSearchCompanyName(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <BusinessIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Search by company name"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2, height: '100%' }}>
                                    <Button
                                        fullWidth
                                        variant="contained"
                                        startIcon={<FilterListIcon />}
                                        onClick={handleSearch}
                                        sx={{
                                            bgcolor: '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#115293',
                                            },
                                            py: 1.5,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Apply Filter
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={resetFilters}
                                        sx={{
                                            borderColor: '#1976d2',
                                            color: '#1976d2',
                                            py: 1.5,
                                            borderRadius: '8px',
                                            textTransform: 'none',
                                            fontWeight: 'medium',
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* DataGrid with enhanced styling */}
                    <Paper
                        elevation={2}
                        sx={{
                            width: '100%',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            mb: 4,
                            flex: 1,
                            '& .MuiDataGrid-root': {
                                border: 'none',
                            },
                            '& .MuiDataGrid-cell': {
                                borderColor: 'rgba(224, 224, 224, 1)',
                            },
                            '& .MuiDataGrid-columnHeaders': {
                                backgroundColor: '#F5F7FA',
                                borderBottom: 'none',
                            },
                            '& .MuiDataGrid-columnHeaderTitle': {
                                fontWeight: 'bold',
                            },
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                            disableRowSelectionOnClick
                            autoHeight
                            getRowId={(row) => row.id}
                            loading={isLoading}
                            sx={{
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                },
                            }}
                        />
                    </Paper>

                    <Box sx={{ mt: 'auto' }}>
                        <Copyright />
                    </Box>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
