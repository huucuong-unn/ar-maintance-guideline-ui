import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CompanyRequestAPI from '~/API/CompanyRequestAPI'; // Your API
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { host } from '~/Constant';

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

export default function CompanyRequestForAdmin() {
    const navigate = useNavigate(); // Declare navigate

    const userInfo = storageService.getItem('userInfo')?.user || null;

    const formatStatus = (status) => status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    // Table columns
    const columns = [
        {
            field: 'requestNumber',
            headerName: 'Request Number',
            width: 150,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 150,
            renderCell: (params) => {
                let color = 'black';
                if (params.value === 'ACTIVE') color = 'green';
                else if (params.value === 'INACTIVE') color = 'orange';
                else if (params.value === 'DRAFTED') color = '#9c27b0';
                else if (params.value === 'PROCESSING') color = 'blue';
                else if (params.value === 'PENDING') color = 'orange';
                else if (params.value === 'APPROVED') color = 'green';
                else if (params.value === 'CANCEL') color = 'red';
                return <Box sx={{ color, fontWeight: 'bold' }}>{formatStatus(params.value) || '-'}</Box>;
            },
        },
        { field: 'requestSubject', headerName: 'Subject', width: 200 },
        { field: 'requestDescription', headerName: 'Description', width: 300 },
        {
            field: 'designer',
            headerName: 'Designer',
            width: 200,
            renderCell: (params) => params.row.designer?.email || '-',
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 200,
            renderCell: (params) => params.row.company.companyName || '-',
        },
        {
            field: 'machineType',
            headerName: 'Machine Type',
            width: 200,
            renderCell: (params) => params.row.machineType?.machineTypeName || '-',
        },
        {
            field: 'cancelReason',
            headerName: 'Cancel Reason',
            width: 200,
            renderCell: (params) => params.row?.cancelReason || '-',
        },
        {
            field: 'cancelledBy',
            headerName: 'Cancelled By',
            width: 200,
            renderCell: (params) => params.row?.cancelledBy?.email || '-',
        },
        {
            field: 'createdAt',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDateTime(params.value),
        },
    ];

    const [isLoading, setIsLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    const statusOptions = ['APPROVED', 'PENDING', 'DRAFTED', 'CANCEL', 'PROCESSING'];

    const [searchCompanyName, setSearchCompanyName] = useState(null);
    const [searchDesignerEmail, setSearchDesignerEmail] = useState(null);
    const [searchStatus, setSearchStatus] = useState(null);

    // Xử lý tìm kiếm
    const handleSearch = () => {
        fetchData();
    };

    // Fetch existing requests
    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                status: searchStatus,
                companyName: searchCompanyName || undefined,
                designerEmail: searchDesignerEmail || undefined,
            };
            setIsLoading(true);
            const response = await CompanyRequestAPI.getAllCompanyRequestsForAdmin(params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch request:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel]);

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    };

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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 4 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            mb: 4,
                        }}
                    >
                        Company Requests Management
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'right', gap: 2, mb: 2 }}>
                        <TextField
                            label="Search Designer Email"
                            variant="outlined"
                            value={searchDesignerEmail}
                            onChange={(e) => setSearchDesignerEmail(e.target.value)}
                            sx={{ width: 250 }}
                        />
                        {/* TextField để nhập tên công ty */}
                        <TextField
                            label="Search Company Name"
                            variant="outlined"
                            value={searchCompanyName}
                            onChange={(e) => setSearchCompanyName(e.target.value)}
                            sx={{ width: 250 }}
                        />

                        {/* Autocomplete để chọn status */}
                        <Autocomplete
                            options={statusOptions}
                            value={searchStatus}
                            onChange={(event, newValue) => setSearchStatus(newValue)}
                            renderInput={(params) => <TextField {...params} label="Search Status" variant="outlined" />}
                            sx={{ width: 200 }}
                        />

                        {/* Nút Search */}
                        <Button
                            variant="contained"
                            size="large"
                            sx={{
                                bgcolor: '#1976d2',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#115293',
                                    color: 'white',
                                },
                                p: 2,
                                textTransform: 'none',
                            }}
                            onClick={handleSearch}
                        >
                            Filter
                        </Button>
                    </Box>

                    <Paper
                        sx={{
                            height: 500,
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 2,
                            overflow: 'hidden',
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) =>
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }))
                            }
                            sx={{ border: 'none' }}
                            getRowId={(row) => row.requestId}
                            loading={isLoading}
                        />
                    </Paper>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
