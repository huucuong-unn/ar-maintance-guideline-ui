import {
    Box,
    Button,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    TextField,
    Typography,
    Autocomplete,
    IconButton,
    Card,
    CardContent,
    Divider,
    Chip,
    Tooltip,
    InputAdornment,
    Tabs,
    Tab,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import MachineAPI from '~/API/MachineAPI';
import storageService from '~/components/StorageService/storageService';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import MachineTypeAttributeAPI from '~/API/MachineTypeAttributeAPI';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DevicesIcon from '@mui/icons-material/Devices';
import CategoryIcon from '@mui/icons-material/Category';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import BusinessIcon from '@mui/icons-material/Business';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import QrCodeIcon from '@mui/icons-material/QrCode';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import TitleIcon from '@mui/icons-material/Title';
import CodeIcon from '@mui/icons-material/Code';
import TuneIcon from '@mui/icons-material/Tune';
import ApiIcon from '@mui/icons-material/Api';
import LinkIcon from '@mui/icons-material/Link';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CancelIcon from '@mui/icons-material/Cancel';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { getImage } from '~/Constant';
import axios from 'axios';

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

export default function MachinesManagement() {
    //user info
    const userInfo = storageService.getItem('userInfo')?.user || null;

    //Fetch Machines
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [selectedMachineType, setSelectedMachineType] = useState(null);

    const NoDataIcon = () => {
        return (
            <Box component="svg" viewBox="0 0 24 24" sx={{ width: 64, height: 64, opacity: 0.5 }}>
                <path
                    fill="currentColor"
                    d="M12,3C7.58,3 4,4.79 4,7C4,9.21 7.58,11 12,11C16.42,11 20,9.21 20,7C20,4.79 16.42,3 12,3M4,9V12C4,14.21 7.58,16 12,16C16.42,16 20,14.21 20,12V9C20,11.21 16.42,13 12,13C7.58,13 4,11.21 4,9M4,14V17C4,19.21 7.58,21 12,21C16.42,21 20,19.21 20,17V14C20,16.21 16.42,18 12,18C7.58,18 4,16.21 4,14Z"
                />
            </Box>
        );
    };

    const downloadQrCode = (url, machineName, qrName) => {
        // Trong thực tế, điều này sẽ tải xuống hình ảnh QR từ URL
        alert(`Downloading QR code for ${machineName}: ${qrName}`);
    };

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [machineToDelete, setMachineToDelete] = useState(null);
    const [openQrDialog, setOpenQrDialog] = useState(false);
    const [selectedMachineForQr, setSelectedMachineForQr] = useState(null);
    const [qrCodes, setQrCodes] = useState('');

    const handleViewQrCodes = async (machineId) => {
        try {
            // Tìm machine từ danh sách hiện tại
            const machine = rows.find((m) => m.id === machineId);
            setSelectedMachineForQr(machine);

            // Gọi API để lấy QR codes (giả định là có API này)
            const response = await MachineAPI.getById(machineId);
            setQrCodes(response?.result?.qrCode || '');

            setOpenQrDialog(true);
        } catch (error) {
            console.error('Failed to fetch QR codes:', error);
            // Hiển thị thông báo lỗi
        }
    };

    const handleCloseQrDialog = () => {
        setOpenQrDialog(false);
        setSelectedMachineForQr(null);
        setQrCodes([]);
    };

    const columns = [
        { field: 'machineCode', headerName: 'Code', width: 250 },
        { field: 'machineType', headerName: 'Machine Type', width: 300 },
        {
            field: 'action',
            headerName: 'Action',
            width: 250,
            renderCell: (params) => (
                <EditIcon
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleOpenUpdateMachineModal(params.row.id);
                    }}
                    sx={{ cursor: 'pointer' }}
                ></EditIcon>
            ),
        },
    ];

    useEffect(() => {
        fetchMachines();
    }, [paginationModel]);

    const fetchMachines = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                keyword: keyword,
                machineTypeName: selectedMachineType ? selectedMachineType.name : undefined,
            };
            const response = await MachineAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('Failed to fetch machines: ', error);
        }
    };

    const handleSearch = () => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        fetchMachines();
    };

    useEffect(() => {
        console.log(paginationModel);
    }, [paginationModel]);

    //Create Machine
    const [isLoadingCreateMachine, setIsLoadingCreateMachine] = useState(false);
    const [machineTypes, setMachineTypes] = useState([]);
    const [openCreateMachineDialog, setOpenCreateMachineDialog] = useState(false);
    const [currentMachineType, setCurrentMachineType] = useState('');
    const [machineTypeAttributes, setMachineTypeAttributes] = useState([]);
    const [createMachineRequest, setCreateMachineRequest] = useState({
        machineName: '',
        modelTypeId: '',
        companyId: userInfo?.company?.id,
        machineTypeValueCreationRequest: [],
        apiUrl: '',
        machineCode: '',
        token: '',
        headerRequests: [],
    });
    const [tempApiUrl, setTempApiUrl] = useState('');
    const [tempHeaders, setTempHeaders] = useState([]);
    const [responseMessage, setResponseMessage] = useState('');

    useEffect(() => {
        fetchMachineTypes();
    }, []);

    const fetchMachineTypes = async () => {
        try {
            const response = await ModelTypeAPI.getByCompanyId(userInfo?.company?.id);
            const data = response?.result || [];
            setMachineTypes(data);
        } catch (error) {
            console.log('Failed to fetch machines: ', error);
        }
    };

    const handleOpenCreateMachineDialog = () => {
        setOpenCreateMachineDialog(true);
    };

    const handleCloseCreateMachineDialog = () => {
        setOpenCreateMachineDialog(false);
        setMachineTypeAttributes([]);
        setCurrentMachineType('');
        setCreateMachineRequest({
            machineName: '',
            modelTypeId: '',
            companyId: userInfo?.company?.id,
            machineTypeValueCreationRequest: [],
            apiUrl: '',
            token: '',
            headerRequests: [],
        });
        setTempApiUrl('');
        setTempHeaders([]);
        setResponseMessage('');
    };

    const fetchMachineTypesAttribute = async () => {
        try {
            if (!currentMachineType) {
                return;
            }

            const response = await MachineTypeAttributeAPI.getByMachineType(currentMachineType);
            const data = response?.result || [];
            setMachineTypeAttributes(data);
        } catch (error) {
            console.log('Failed to fetch machines: ', error);
        }
    };

    useEffect(() => {
        fetchMachineTypesAttribute();
        setCreateMachineRequest((prev) => ({
            ...prev,
            machineTypeValueCreationRequest: [],
        }));
    }, [currentMachineType]);

    const handleCreateMachine = async () => {
        if (!createMachineRequest.modelTypeId) {
            toast.error('Please select a machine type.');
            return;
        }

        // Kiểm tra nếu API URL không hợp lệ
        if (tempApiUrl) {
            try {
                new URL(tempApiUrl); // Kiểm tra URL hợp lệ bằng URL constructor
            } catch (error) {
                toast.error('Invalid API URL format.');
                return;
            }

            // Kiểm tra URL có bắt đầu bằng http:// hoặc https:// không
            const urlPattern = /^(https?:\/\/)/;
            if (!urlPattern.test(tempApiUrl)) {
                toast.error('API URL must start with http:// or https://');
                return;
            }

            // Kiểm tra nếu có API URL nhưng không có header nào
            if (tempHeaders.length === 0) {
                toast.error('At least one header is required when API URL is provided.');
                return;
            }
        }

        setIsLoadingCreateMachine(true);

        try {
            // Cập nhật apiUrl và headerRequests trước khi gửi API
            const updatedRequest = {
                ...createMachineRequest,
                apiUrl: tempApiUrl,
                headerRequests: tempHeaders,
            };

            const response = await MachineAPI.create(updatedRequest);
            if (response?.result) {
                toast.success('Create machine successfully');
            }
            handleCloseCreateMachineDialog();
            fetchMachines();
        } catch (error) {
            console.error('Failed to create machine:', error);
            toast.error(`Create machine failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateMachine(false);
        }
    };

    //Update Machine
    const [openUpdateMachineDialog, setOpenUpdateMachineDialog] = useState(false);
    const [machineById, setMachineById] = useState({});
    const [updateMachineRequest, setUpdateMachineRequest] = useState({
        machineName: '',
        machineCode: '',
        apiUrl: '',
        token: '',
        machineTypeId: '',
        machineTypeValueModifyRequests: [
            {
                machineTypeValueId: '',
                machineTypeAttributeId: '',
                valueAttribute: '',
            },
        ],
        headerRequests: [
            {
                keyHeader: '',
                valueOfKey: '',
            },
        ],
    });
    const [isLoadingUpdateMachine, setIsLoadingUpdateMachine] = useState(false);
    const [showQrCodes, setShowQrCodes] = useState(false);
    const [testResponse, setTestResponse] = useState('');
    const [isTestingApi, setIsTestingApi] = useState(false);

    const handleOpenUpdateMachineModal = async (id) => {
        try {
            const response = await MachineAPI.getById(id);
            const data = response?.result;
            setUpdateMachineRequest({
                machineName: data.machineName,
                machineCode: data.machineCode,
                apiUrl: data.apiUrl,
                token: data.token,
                machineTypeId: data.machineTypeId,
                machineTypeValueModifyRequests: data.machineTypeValueResponses.map((attr) => ({
                    machineTypeValueId: attr.id,
                    machineTypeAttributeId: attr.machineTypeAttributeId,
                    valueAttribute: attr.valueAttribute,
                })),
                headerRequests: data.headerResponses.map((header) => ({
                    keyHeader: header.keyHeader,
                    valueOfKey: header.valueOfKey,
                })),
            });

            setMachineById(data);
            setOpenUpdateMachineDialog(true);
        } catch (error) {
            console.error('Failed to fetch machine details:', error);
        }
    };

    const handleCloseUpdateMachineDialog = () => {
        setOpenUpdateMachineDialog(false);
        setMachineById({});
        setUpdateMachineRequest({
            machineName: '',
            apiUrl: '',
            token: '',
            machineTypeValueModifyRequests: [
                {
                    machineTypeValueId: '',
                    machineTypeAttributeId: '',
                    valueAttribute: '',
                },
            ],
            headerRequests: [
                {
                    keyHeader: '',
                    valueOfKey: '',
                },
            ],
        });
        setShowQrCodes(false);
        setTestResponse('');
    };

    const handleUpdateMachine = async () => {
        // ✅ Validate machineCode
        if (!updateMachineRequest.machineCode || updateMachineRequest.machineCode.trim().length <= 1) {
            toast.error('Machine code must be longer than 1 character.');
            return;
        }

        // ✅ Validate machineTypeId
        if (!updateMachineRequest.machineTypeId) {
            toast.error('Machine type must be selected.');
            return;
        }

        // Kiểm tra nếu có ít nhất một header nhưng API URL trống
        if (updateMachineRequest.headerRequests.length > 0 && !updateMachineRequest.apiUrl.trim()) {
            toast.error('API URL is required when headers are provided.');
            return;
        }

        // Kiểm tra nếu API URL không hợp lệ
        if (updateMachineRequest.apiUrl) {
            try {
                new URL(updateMachineRequest.apiUrl); // Kiểm tra URL hợp lệ bằng URL constructor
            } catch (error) {
                toast.error('Invalid API URL format.');
                return;
            }

            // Kiểm tra URL có bắt đầu bằng http:// hoặc https:// không
            const urlPattern = /^(https?:\/\/)/;
            if (!urlPattern.test(updateMachineRequest.apiUrl)) {
                toast.error('API URL must start with http:// or https://');
                return;
            }

            // Kiểm tra nếu có API URL nhưng không có header nào
            if (updateMachineRequest.headerRequests.length === 0) {
                toast.error('At least one header is required when API URL is provided.');
                return;
            }
        }

        // Kiểm tra từng header key và value phải có ít nhất 1 ký tự
        for (const header of updateMachineRequest.headerRequests) {
            if (!header.keyHeader.trim() || !header.valueOfKey.trim()) {
                toast.error('Header key and value must have at least 1 character.');
                return;
            }
        }

        setIsLoadingUpdateMachine(true);
        try {
            const response = await MachineAPI.update(machineById.id, updateMachineRequest, userInfo?.company?.id);

            if (response?.result) {
                toast.success('Update machine successfully');
                handleCloseUpdateMachineDialog();
                fetchMachines();
            }
        } catch (error) {
            console.error('Failed to update machine:', error);
            toast.error(`Update machine failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingUpdateMachine(false);
        }
    };

    useEffect(() => {
        console.log(userInfo);
    }, [userInfo]);

    async function handleDownloadQrCode(qrCodeUrl, fileName) {
        if (!qrCodeUrl) return;
        try {
            const response = await axios.get(getImage(qrCodeUrl), { responseType: 'blob' });
            const blob = new Blob([response.data], { type: response.headers['content-type'] });
            const downloadUrl = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(downloadUrl);
        } catch (error) {
            console.error('Error downloading QR code:', error);
            alert('Failed to download QR code. Please try again.');
        }
    }

    const handleAddHeader = () => {
        setUpdateMachineRequest((prev) => ({
            ...prev,
            headerRequests: [...prev.headerRequests, { keyHeader: '', valueOfKey: '' }],
        }));
    };

    const handleRemoveHeader = (index) => {
        setUpdateMachineRequest((prev) => ({
            ...prev,
            headerRequests: prev.headerRequests.filter((_, i) => i !== index),
        }));
    };

    const handleChangeHeader = (index, field, value) => {
        const updatedHeaders = [...updateMachineRequest.headerRequests];
        updatedHeaders[index][field] = value;
        setUpdateMachineRequest((prev) => ({
            ...prev,
            headerRequests: updatedHeaders,
        }));
    };

    const handleTestApiUrl = async () => {
        if (!updateMachineRequest.apiUrl) {
            toast.error('API URL is required');
            return;
        }

        setIsTestingApi(true);
        setTestResponse('');
        try {
            const headers = updateMachineRequest.headerRequests.reduce((acc, header) => {
                if (header.keyHeader && header.valueOfKey) {
                    acc[header.keyHeader] = header.valueOfKey;
                }
                return acc;
            }, {});

            const response = await axios.get(updateMachineRequest.apiUrl, { headers });
            setTestResponse(JSON.stringify(response.data, null, 2));
        } catch (error) {
            setTestResponse(`Error: ${error.message}`);
        } finally {
            setIsTestingApi(false);
        }
    };

    const [openConfirmDeleteMachineTypeDialog, setOpenConfirmDeleteMachineTypeDialog] = useState(false);

    const handleDeleteMachine = async () => {
        try {
            await MachineAPI.delete(machineById.id);
            toast.success('Machine deleted successfully');
            setOpenConfirmDeleteMachineTypeDialog(false);
            setOpenUpdateMachineDialog(false);
            fetchMachines();
        } catch (error) {
            console.error('Failed to delete Machine:', error);
            toast.error(`Delete Machine failed. ${error?.response?.data?.message}`);
        }
    };

    //Show Create Machine Help

    const [showMachineCreationHelpDialog, setShowMachineCreationHelpDialog] = useState(false);

    useEffect(() => {
        setShowMachineCreationHelpDialog(true);
    }, []);

    useEffect(() => {
        console.log(machineTypes);
    }, [machineTypes]);

    useEffect(() => {
        console.log(updateMachineRequest);
    }, [updateMachineRequest]);

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
                                    <PrecisionManufacturingIcon
                                        sx={{
                                            fontSize: 'inherit',
                                            marginRight: 1,
                                        }}
                                    />
                                    Machines Management
                                </Typography>

                                <Box>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
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
                                        onClick={handleOpenCreateMachineDialog}
                                        disabled={isLoadingCreateMachine}
                                    >
                                        {isLoadingCreateMachine ? (
                                            <CircularProgress size={24} sx={{ color: 'white', mr: 1 }} />
                                        ) : (
                                            'Create Machine'
                                        )}
                                    </Button>
                                    <Tooltip title="Machine Creation Help">
                                        <IconButton
                                            onClick={() => setShowMachineCreationHelpDialog(true)}
                                            sx={{
                                                ml: 1,
                                                color: '#051D40',
                                            }}
                                        >
                                            <HelpOutlineIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
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
                                            Total Machines
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#1565C0" sx={{ mt: 1 }}>
                                            {total || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <DevicesIcon
                                                sx={{ color: '#1565C0', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Available Machines
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6} md={3}>
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
                                            Machine Types
                                        </Typography>
                                        <Typography variant="h4" fontWeight="bold" color="#2E7D32" sx={{ mt: 1 }}>
                                            {machineTypes?.length || 0}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <CategoryIcon
                                                sx={{ color: '#2E7D32', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Different Types
                                            </Typography>
                                        </Box>
                                    </Paper>
                                </Grid>

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
                                            Company
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            color="#303F9F"
                                            sx={{
                                                mt: 1,
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                            }}
                                        >
                                            {userInfo?.company?.companyName || 'N/A'}
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 'auto', pt: 1 }}>
                                            <BusinessIcon
                                                sx={{ color: '#303F9F', opacity: 0.7, fontSize: '1.2rem', mr: 0.5 }}
                                            />
                                            <Typography variant="body2" color="text.secondary">
                                                Company Infor
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
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search Machines"
                                    variant="outlined"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon color="action" />
                                            </InputAdornment>
                                        ),
                                    }}
                                    placeholder="Enter machine name or code"
                                    size="medium"
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Autocomplete
                                    fullWidth
                                    options={machineTypes || []}
                                    getOptionLabel={(option) => option.name}
                                    value={selectedMachineType}
                                    onChange={(event, newValue) => setSelectedMachineType(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Machine Type"
                                            variant="outlined"
                                            placeholder="Select machine type"
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
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
                                        Apply Filters
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<RefreshIcon />}
                                        onClick={() => {
                                            setKeyword('');
                                            setSelectedMachineType(null);
                                            setPaginationModel({ page: 0, pageSize: 5 });
                                            fetchMachines();
                                        }}
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
                        {rows.length > 0 ? (
                            <DataGrid
                                rows={rows}
                                columns={[
                                    {
                                        field: 'machineCode',
                                        headerName: 'Code',
                                        flex: 1,
                                        minWidth: 150,
                                        renderCell: (params) => (
                                            <Chip
                                                label={params.value}
                                                size="small"
                                                sx={{
                                                    bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                    color: '#1976d2',
                                                    fontWeight: 'medium',
                                                    borderRadius: '4px',
                                                }}
                                            />
                                        ),
                                    },
                                    {
                                        field: 'machineType',
                                        headerName: 'Machine Type',
                                        flex: 1,
                                        minWidth: 180,
                                    },

                                    {
                                        field: 'action',
                                        headerName: 'Actions',
                                        flex: 1,
                                        minWidth: 160,
                                        renderCell: (params) => (
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    height: '100%',
                                                    justifyContent: 'flex-start',
                                                    gap: 1,
                                                }}
                                            >
                                                <Tooltip title="Edit Machine">
                                                    <IconButton
                                                        color="primary"
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleOpenUpdateMachineModal(params.row.id);
                                                        }}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: 'rgba(25, 118, 210, 0.08)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.15)',
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="View QR Codes">
                                                    <IconButton
                                                        color="secondary"
                                                        size="small"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            handleViewQrCodes(params.row.id);
                                                        }}
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            bgcolor: 'rgba(156, 39, 176, 0.08)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(156, 39, 176, 0.15)',
                                                            },
                                                        }}
                                                    >
                                                        <QrCodeIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        ),
                                    },
                                ]}
                                rowCount={total}
                                paginationMode="server"
                                paginationModel={paginationModel}
                                onPaginationModelChange={(newModel) =>
                                    setPaginationModel((prev) => ({
                                        ...prev,
                                        page: newModel.page,
                                    }))
                                }
                                disableRowSelectionOnClick
                                getRowId={(row) => row.id}
                                sx={{
                                    '& .MuiDataGrid-row:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    },
                                }}
                            />
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6 }}>
                                <NoDataIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
                                <Typography variant="h6" color="text.secondary">
                                    No machines found
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                    Try adjusting your search filters or create a new machine
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{ mt: 3 }}
                                    onClick={handleOpenCreateMachineDialog}
                                >
                                    Create Machine
                                </Button>
                            </Box>
                        )}
                    </Paper>

                    <Box sx={{ mt: 'auto' }}>
                        <Copyright />
                    </Box>
                </Box>

                {/* Create Machine Dialog */}
                <Dialog
                    open={openCreateMachineDialog}
                    onClose={handleCloseCreateMachineDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AddIcon sx={{ mr: 1.5 }} />
                            Create New Machine
                        </Box>
                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseCreateMachineDialog}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            <Paper
                                elevation={0}
                                sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px' }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                >
                                    <SettingsIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                    Basic Information
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={12} md={12}>
                                        <TextField
                                            label="Machine Code"
                                            name="machineCode"
                                            fullWidth
                                            variant="outlined"
                                            value={createMachineRequest.machineCode}
                                            onChange={(event) => {
                                                setCreateMachineRequest((prev) => ({
                                                    ...prev,
                                                    machineCode: event.target.value,
                                                }));
                                            }}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <CodeIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            helperText="Unique identifier for this machine"
                                        />
                                    </Grid>

                                    <Grid item xs={12}>
                                        <Autocomplete
                                            disablePortal
                                            options={machineTypes}
                                            getOptionLabel={(option) => option.name}
                                            fullWidth
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Machine Type"
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <CategoryIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    helperText="Select machine type to load its attributes"
                                                />
                                            )}
                                            onChange={(event, newValue) => {
                                                setCurrentMachineType(newValue ? newValue.id : '');
                                                setCreateMachineRequest((prev) => ({
                                                    ...prev,
                                                    modelTypeId: newValue ? newValue.id : '',
                                                }));
                                            }}
                                            onInputChange={(event, value) => {
                                                if (!value) {
                                                    setCurrentMachineType('');
                                                    setMachineTypeAttributes([]);
                                                    setCreateMachineRequest((prev) => ({
                                                        ...prev,
                                                        modelTypeId: '',
                                                        machineTypeValueCreationRequest: [],
                                                    }));
                                                }
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            </Paper>

                            {machineTypeAttributes.length > 0 && (
                                <Paper
                                    elevation={0}
                                    sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px' }}
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                    >
                                        <TuneIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                        Machine Type Attributes
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {machineTypeAttributes.map((attribute) => (
                                            <Grid item xs={12} sm={6} key={attribute.id}>
                                                <TextField
                                                    label={attribute.attributeName}
                                                    fullWidth
                                                    variant="outlined"
                                                    value={attribute.valueAttribute}
                                                    disabled
                                                />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Paper>
                            )}

                            <Paper
                                elevation={0}
                                sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px' }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                >
                                    <ApiIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                    API Configuration (Optional)
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="API URL"
                                            fullWidth
                                            variant="outlined"
                                            value={tempApiUrl}
                                            onChange={(event) => setTempApiUrl(event.target.value)}
                                            InputProps={{
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <LinkIcon fontSize="small" color="action" />
                                                    </InputAdornment>
                                                ),
                                            }}
                                            helperText="Enter API URL (must start with http:// or https://)"
                                        />
                                    </Grid>

                                    {tempApiUrl && (
                                        <Grid item xs={12}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Typography variant="subtitle1" fontWeight="medium">
                                                    Headers
                                                </Typography>
                                                <Button
                                                    variant="outlined"
                                                    color="secondary"
                                                    startIcon={<AddIcon />}
                                                    size="small"
                                                    onClick={() =>
                                                        setTempHeaders([
                                                            ...tempHeaders,
                                                            { keyHeader: '', valueOfKey: '' },
                                                        ])
                                                    }
                                                    sx={{ textTransform: 'none' }}
                                                >
                                                    Add Header
                                                </Button>
                                            </Box>

                                            {tempHeaders.map((header, index) => (
                                                <Box
                                                    key={index}
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 2,
                                                        mb: 2,
                                                        p: 2,
                                                        borderRadius: '8px',
                                                        border: '1px dashed rgba(0, 0, 0, 0.12)',
                                                        bgcolor: 'rgba(0, 0, 0, 0.01)',
                                                    }}
                                                >
                                                    <TextField
                                                        label="Header Key"
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        value={header.keyHeader}
                                                        onChange={(e) => {
                                                            const updatedHeaders = [...tempHeaders];
                                                            updatedHeaders[index].keyHeader = e.target.value;
                                                            setTempHeaders(updatedHeaders);
                                                        }}
                                                    />
                                                    <TextField
                                                        label="Header Value"
                                                        fullWidth
                                                        variant="outlined"
                                                        size="small"
                                                        value={header.valueOfKey}
                                                        onChange={(e) => {
                                                            const updatedHeaders = [...tempHeaders];
                                                            updatedHeaders[index].valueOfKey = e.target.value;
                                                            setTempHeaders(updatedHeaders);
                                                        }}
                                                    />
                                                    <IconButton
                                                        color="error"
                                                        size="small"
                                                        sx={{ mt: 0.5 }}
                                                        onClick={() => {
                                                            setTempHeaders(tempHeaders.filter((_, i) => i !== index));
                                                        }}
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Box>
                                            ))}

                                            <Button
                                                variant="contained"
                                                startIcon={<PlayArrowIcon />}
                                                sx={{ mt: 1, textTransform: 'none' }}
                                                onClick={async () => {
                                                    setIsTestingApi(true);
                                                    setResponseMessage('');
                                                    try {
                                                        const response = await fetch(tempApiUrl, {
                                                            method: 'GET',
                                                            headers: Object.fromEntries(
                                                                tempHeaders.map((h) => [h.keyHeader, h.valueOfKey]),
                                                            ),
                                                        });
                                                        const data = await response.json();
                                                        setResponseMessage(JSON.stringify(data, null, 2));
                                                    } catch (error) {
                                                        setResponseMessage('Failed to fetch API: ' + error.message);
                                                    } finally {
                                                        setIsTestingApi(false);
                                                    }
                                                }}
                                            >
                                                Test API
                                            </Button>
                                        </Grid>
                                    )}
                                </Grid>

                                {/* Response Display */}
                                {isTestingApi ? (
                                    <Box
                                        sx={{
                                            mt: 3,
                                            display: 'flex',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <CircularProgress />
                                    </Box>
                                ) : (
                                    responseMessage && (
                                        <Box
                                            sx={{
                                                mt: 3,
                                                p: 2,
                                                border: '1px solid #ddd',
                                                borderRadius: '8px',
                                                bgcolor: '#f5f5f5',
                                                maxHeight: '200px',
                                                overflow: 'auto',
                                                fontFamily: 'monospace',
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}
                                            >
                                                API Response:
                                            </Typography>
                                            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{responseMessage}</pre>
                                        </Box>
                                    )
                                )}
                            </Paper>
                        </Box>
                    </DialogContent>

                    <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Button
                            sx={{ textTransform: 'none' }}
                            onClick={handleCloseCreateMachineDialog}
                            startIcon={<CancelIcon />}
                        >
                            Cancel
                        </Button>
                        <Button
                            sx={{ textTransform: 'none', px: 3 }}
                            variant="contained"
                            color="primary"
                            onClick={handleCreateMachine}
                            disabled={isLoadingCreateMachine}
                            startIcon={isLoadingCreateMachine ? <CircularProgress size={20} /> : <SaveIcon />}
                        >
                            {isLoadingCreateMachine ? 'Creating...' : 'Create Machine'}
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Update Machine Dialog */}
                <Dialog
                    open={openUpdateMachineDialog}
                    onClose={handleCloseUpdateMachineDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 2,
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <InfoIcon sx={{ mr: 1.5 }} />
                            {machineById?.machineName
                                ? `Machine Details: ${machineById?.machineName} #${machineById?.machineCode}`
                                : 'Machine Details'}
                        </Box>

                        <IconButton
                            edge="end"
                            color="inherit"
                            onClick={handleCloseUpdateMachineDialog}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3 }}>
                        {/* Tabs Navigation - Sửa lỗi offsetHeight bằng cách dùng Box thay vì Tabs */}
                        <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
                            <Box sx={{ display: 'flex' }}>
                                <Box
                                    onClick={() => setShowQrCodes(false)}
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        cursor: 'pointer',
                                        borderBottom: !showQrCodes ? 2 : 0,
                                        borderColor: 'primary.main',
                                        color: !showQrCodes ? 'primary.main' : 'text.secondary',
                                        fontWeight: !showQrCodes ? 'medium' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center',
                                        mr: 2,
                                    }}
                                >
                                    <SettingsIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                                    Machine Settings
                                </Box>
                                <Box
                                    onClick={() => setShowQrCodes(true)}
                                    sx={{
                                        px: 3,
                                        py: 1.5,
                                        cursor: 'pointer',
                                        borderBottom: showQrCodes ? 2 : 0,
                                        borderColor: 'primary.main',
                                        color: showQrCodes ? 'primary.main' : 'text.secondary',
                                        fontWeight: showQrCodes ? 'medium' : 'normal',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    <QrCodeIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                                    QR Codes
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Machine Settings Content */}
                            {!showQrCodes && (
                                <>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 3,
                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                            borderRadius: '8px',
                                            mb: 3,
                                        }}
                                    >
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            sx={{ mb: 2, color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                        >
                                            <DeviceHubIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                            Basic Information
                                        </Typography>

                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    disabled={true}
                                                    label="Machine Code"
                                                    fullWidth
                                                    variant="outlined"
                                                    value={updateMachineRequest.machineCode || ''}
                                                    onChange={(event) =>
                                                        setUpdateMachineRequest((prev) => ({
                                                            ...prev,
                                                            machineCode: event.target.value,
                                                        }))
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <CodeIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    helperText="Enter a name between 5-100 characters"
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6}>
                                                <Autocomplete
                                                    options={machineTypes}
                                                    getOptionLabel={(option) => option.name || ''}
                                                    value={
                                                        machineTypes.find(
                                                            (type) => type.id === updateMachineRequest.machineTypeId,
                                                        ) || null
                                                    }
                                                    onChange={(event, newValue) => {
                                                        setCurrentMachineType(newValue ? newValue.id : '');
                                                        setUpdateMachineRequest((prev) => ({
                                                            ...prev,
                                                            machineTypeId: newValue ? newValue.id : '',
                                                        }));
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            label="Machine Type"
                                                            variant="outlined"
                                                            fullWidth
                                                            InputProps={{
                                                                ...params.InputProps,
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <CategoryIcon fontSize="small" color="action" />
                                                                    </InputAdornment>
                                                                ),
                                                            }}
                                                            helperText="Select a machine type"
                                                        />
                                                    )}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>

                                    {machineTypeAttributes.length > 0 && (
                                        <Paper
                                            elevation={0}
                                            sx={{
                                                p: 3,
                                                border: '1px solid rgba(0, 0, 0, 0.08)',
                                                borderRadius: '8px',
                                                mb: 3,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{
                                                    mb: 2,
                                                    color: 'primary.main',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <TuneIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                Machine Type Attributes
                                            </Typography>

                                            <Grid container spacing={2}>
                                                {machineTypeAttributes.map((attr, index) => {
                                                    const matchedValue =
                                                        updateMachineRequest.machineTypeValueModifyRequests?.find(
                                                            (val) => val.machineTypeAttributeId === attr.id,
                                                        );

                                                    return (
                                                        <Grid item xs={12} sm={6} key={`machine-attr-${attr.id}`}>
                                                            <TextField
                                                                label={attr.attributeName || 'Attribute'}
                                                                disabled
                                                                fullWidth
                                                                InputProps={{ readOnly: true }}
                                                                variant="outlined"
                                                                value={attr.valueAttribute || ''}
                                                            />
                                                        </Grid>
                                                    );
                                                })}
                                            </Grid>
                                        </Paper>
                                    )}

                                    <Paper
                                        elevation={0}
                                        sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px' }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                mb: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight="bold"
                                                sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                            >
                                                <ApiIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                                API Configuration
                                            </Typography>

                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<PlayArrowIcon />}
                                                onClick={handleTestApiUrl}
                                                sx={{ textTransform: 'none' }}
                                                disabled={!updateMachineRequest.apiUrl}
                                            >
                                                Test API
                                            </Button>
                                        </Box>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    label="API URL"
                                                    fullWidth
                                                    variant="outlined"
                                                    value={updateMachineRequest.apiUrl || ''}
                                                    onChange={(e) =>
                                                        setUpdateMachineRequest({
                                                            ...updateMachineRequest,
                                                            apiUrl: e.target.value,
                                                        })
                                                    }
                                                    InputProps={{
                                                        startAdornment: (
                                                            <InputAdornment position="start">
                                                                <LinkIcon fontSize="small" color="action" />
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                    helperText="API URL must start with http:// or https://"
                                                />
                                            </Grid>

                                            <Grid item xs={12}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        mb: 2,
                                                    }}
                                                >
                                                    <Typography variant="subtitle1" fontWeight="medium">
                                                        Headers
                                                    </Typography>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<AddIcon />}
                                                        size="small"
                                                        onClick={handleAddHeader}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        Add Header
                                                    </Button>
                                                </Box>

                                                {updateMachineRequest.headerRequests &&
                                                    updateMachineRequest.headerRequests.map((header, index) => (
                                                        <Box
                                                            key={`header-${index}`}
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: 2,
                                                                mb: 2,
                                                                p: 2,
                                                                borderRadius: '8px',
                                                                border: '1px dashed rgba(0, 0, 0, 0.12)',
                                                                bgcolor: 'rgba(0, 0, 0, 0.01)',
                                                            }}
                                                        >
                                                            <TextField
                                                                label="Header Key"
                                                                value={header.keyHeader || ''}
                                                                onChange={(e) =>
                                                                    handleChangeHeader(
                                                                        index,
                                                                        'keyHeader',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                sx={{ flex: 1 }}
                                                                size="small"
                                                            />
                                                            <TextField
                                                                label="Header Value"
                                                                value={header.valueOfKey || ''}
                                                                onChange={(e) =>
                                                                    handleChangeHeader(
                                                                        index,
                                                                        'valueOfKey',
                                                                        e.target.value,
                                                                    )
                                                                }
                                                                sx={{ flex: 2 }}
                                                                size="small"
                                                            />
                                                            <IconButton
                                                                onClick={() => handleRemoveHeader(index)}
                                                                color="error"
                                                                size="small"
                                                            >
                                                                <DeleteIcon />
                                                            </IconButton>
                                                        </Box>
                                                    ))}
                                            </Grid>
                                        </Grid>

                                        {/* Response Display */}
                                        {isTestingApi ? (
                                            <Box
                                                sx={{
                                                    mt: 3,
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <CircularProgress />
                                            </Box>
                                        ) : (
                                            testResponse && (
                                                <Box
                                                    sx={{
                                                        mt: 3,
                                                        p: 2,
                                                        border: '1px solid #ddd',
                                                        borderRadius: '8px',
                                                        bgcolor: '#f5f5f5',
                                                        maxHeight: '200px',
                                                        overflow: 'auto',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{ mb: 1, fontWeight: 'bold', color: 'primary.main' }}
                                                    >
                                                        API Response:
                                                    </Typography>
                                                    <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
                                                        {testResponse}
                                                    </pre>
                                                </Box>
                                            )
                                        )}
                                    </Paper>
                                </>
                            )}

                            {/* QR Codes Tab Content */}
                            {showQrCodes && (
                                <Paper
                                    elevation={0}
                                    sx={{ p: 3, border: '1px solid rgba(0, 0, 0, 0.08)', borderRadius: '8px' }}
                                >
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        sx={{ mb: 3, color: 'primary.main', display: 'flex', alignItems: 'center' }}
                                    >
                                        <QrCodeIcon sx={{ mr: 1.5, fontSize: '1.2rem' }} />
                                        QR Codes
                                    </Typography>

                                    {machineById.qrCode ? (
                                        <Grid container spacing={3} justifyContent="center">
                                            <Grid item xs={12} sm={6} md={4}>
                                                <Card
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        p: 2,
                                                        height: '100%',
                                                        borderRadius: '12px',
                                                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                                                        transition: 'all 0.3s ease',
                                                        '&:hover': {
                                                            transform: 'translateY(-4px)',
                                                            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
                                                        },
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: '100%',
                                                            padding: '12px',
                                                            borderRadius: '8px',
                                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                                            display: 'flex',
                                                            justifyContent: 'center',
                                                            alignItems: 'center',
                                                            backgroundColor: 'white',
                                                            mb: 2,
                                                        }}
                                                    >
                                                        <img
                                                            src={getImage(machineById.qrCode)}
                                                            style={{
                                                                width: '100%',
                                                                maxWidth: '150px',
                                                                height: 'auto',
                                                            }}
                                                        />
                                                    </Box>

                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<DownloadIcon />}
                                                        size="small"
                                                        sx={{ mt: 'auto', textTransform: 'none' }}
                                                        onClick={() =>
                                                            handleDownloadQrCode(
                                                                machineById.qrCode,
                                                                `${
                                                                    machineById.machineCode || 'Machine Code'
                                                                }_QRCode.png`,
                                                            )
                                                        }
                                                    >
                                                        Download
                                                    </Button>
                                                </Card>
                                            </Grid>
                                        </Grid>
                                    ) : (
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                py: 4,
                                            }}
                                        >
                                            <Box sx={{ mb: 2, opacity: 0.5 }}>
                                                <QrCodeIcon sx={{ fontSize: 64, color: 'text.secondary' }} />
                                            </Box>
                                            <Typography variant="h6" color="text.secondary">
                                                No QR Codes Available
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 1, textAlign: 'center' }}
                                            >
                                                This machine doesn't have any QR codes assigned yet.
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>
                            )}
                        </Box>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            px: 3,
                            py: 2,
                            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setOpenConfirmDeleteMachineTypeDialog(true)}
                            sx={{ textTransform: 'none' }}
                        >
                            Delete Machine
                        </Button>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                sx={{ textTransform: 'none' }}
                                onClick={handleCloseUpdateMachineDialog}
                                startIcon={<CancelIcon />}
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{ textTransform: 'none', px: 3 }}
                                variant="contained"
                                color="primary"
                                onClick={handleUpdateMachine}
                                disabled={isLoadingUpdateMachine}
                                startIcon={isLoadingUpdateMachine ? <CircularProgress size={20} /> : <SaveIcon />}
                            >
                                {isLoadingUpdateMachine ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </Box>
                    </DialogActions>
                </Dialog>
                {/* Delete Confirmation Dialog */}
                <Dialog
                    open={openConfirmDeleteMachineTypeDialog}
                    onClose={() => setOpenConfirmDeleteMachineTypeDialog(false)}
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            backgroundColor: '#FFEBEE',
                            color: '#D32F2F',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <WarningIcon sx={{ mr: 1.5 }} />
                        Confirm Delete Machine
                    </DialogTitle>

                    <DialogContent sx={{ pt: 3, pb: 1 }}>
                        <Typography>
                            Are you sure you want to delete the machine <strong>{machineById.machineName}</strong>?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            This action cannot be undone. All data associated with this machine, including QR codes,
                            will be permanently removed.
                        </Typography>
                    </DialogContent>

                    <DialogActions sx={{ p: 2 }}>
                        <Button
                            onClick={() => setOpenConfirmDeleteMachineTypeDialog(false)}
                            color="primary"
                            sx={{ textTransform: 'none' }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDeleteMachine}
                            color="error"
                            variant="contained"
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                            startIcon={<DeleteForeverIcon />}
                        >
                            Delete Permanently
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openConfirmDeleteMachineTypeDialog}
                    onClose={() => setOpenConfirmDeleteMachineTypeDialog(false)}
                >
                    <DialogTitle>Confirm Delete Machine</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this Machine? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmDeleteMachineTypeDialog(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteMachine}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={openQrDialog}
                    onClose={handleCloseQrDialog}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: '12px',
                            overflow: 'hidden',
                        },
                    }}
                >
                    <DialogTitle
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <QrCodeIcon sx={{ mr: 1.5 }} />
                            QR Codes for {selectedMachineForQr?.machineName || 'Machine'} #
                            {selectedMachineForQr?.machineCode}
                        </Box>
                        <IconButton edge="end" color="inherit" onClick={handleCloseQrDialog} aria-label="close">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 3, mt: 5 }}>
                        {selectedMachineForQr?.qrCode ? (
                            <Card
                                sx={{
                                    textAlign: 'center',
                                    p: 2,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    borderRadius: '8px',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
                                    },
                                }}
                            >
                                <Box
                                    sx={{
                                        p: 2,
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: '180px',
                                            height: '180px',
                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                            borderRadius: '8px',
                                            p: 1,
                                            mb: 2,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: '#f5f5f5',
                                        }}
                                    >
                                        {/* <QrCodeIcon sx={{ fontSize: 120, color: 'rgba(0, 0, 0, 0.4)' }} /> */}
                                        <img
                                            src={getImage(selectedMachineForQr?.qrCode)}
                                            alt={`QR for ${selectedMachineForQr?.machineCode || 'Machine Code'}`}
                                            style={{
                                                width: '100%',
                                                maxWidth: '150px',
                                                height: 'auto',
                                            }}
                                        />
                                    </Box>
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        startIcon={<DownloadIcon />}
                                        onClick={() =>
                                            handleDownloadQrCode(
                                                selectedMachineForQr?.qrCode,
                                                `${selectedMachineForQr?.machineCode || 'Machine Code'}_QRCode.png`,
                                            )
                                        }
                                        sx={{ mt: 'auto', textTransform: 'none' }}
                                    >
                                        Download
                                    </Button>
                                </Box>
                            </Card>
                        ) : (
                            <Box sx={{ py: 4, textAlign: 'center' }}>
                                <Typography color="text.secondary">No QR codes available for this machine</Typography>
                            </Box>
                        )}
                    </DialogContent>

                    <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.08)' }}>
                        <Button
                            onClick={handleCloseQrDialog}
                            color="primary"
                            variant="contained"
                            sx={{ borderRadius: '6px', textTransform: 'none' }}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Machine Creation Help Dialog */}
                <Dialog
                    open={showMachineCreationHelpDialog}
                    onClose={() => setShowMachineCreationHelpDialog(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: {
                            borderRadius: 2,
                            p: 2,
                        },
                    }}
                >
                    <DialogTitle sx={{ fontSize: '1.5rem', fontWeight: 700, color: '#051D40', pb: 1 }}>
                        Machine Creation Guide
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                                Step 1: Enter Machine Details
                            </Typography>
                            <Typography paragraph>
                                Fill in all necessary information about the machine, including machine name, machine
                                code, and relevant technical specifications.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Step 2: Select Machine Type
                            </Typography>
                            <Typography paragraph>
                                Choose the appropriate machine type from the list of Machine Types already created in
                                the system.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 2 }}>
                                Step 3: Configure Realtime API (Optional)
                            </Typography>
                            <Typography paragraph>
                                If your company has a Realtime API to display machine parameters, enter the API
                                information in the API Configuration section.
                            </Typography>

                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mt: 3 }}>
                                Important Notes:
                            </Typography>
                            <Typography component="div">
                                <ul style={{ paddingLeft: '1.5rem' }}>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>Machine Code:</Typography>
                                        <Typography paragraph>
                                            The Machine Code must be unique and not duplicate any other Machine in the
                                            Company. Please ensure the uniqueness of the machine code.
                                        </Typography>
                                    </li>
                                    <li>
                                        <Typography sx={{ fontWeight: 600, mb: 0.5 }}>API Verification:</Typography>
                                        <Typography paragraph>
                                            After entering all information in the API Configuration section, use the
                                            Test API button to verify if the API is working correctly.
                                        </Typography>
                                    </li>
                                </ul>
                            </Typography>
                        </Box>
                    </DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', pb: 2, pt: 1 }}>
                        <Button
                            onClick={() => setShowMachineCreationHelpDialog(false)}
                            variant="contained"
                            sx={{
                                textTransform: 'none',
                                borderRadius: 1.5,
                                px: 4,
                                backgroundColor: '#0f6cbf',
                                '&:hover': {
                                    backgroundColor: '#0a5ca8',
                                },
                            }}
                        >
                            Got It
                        </Button>
                    </Box>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
