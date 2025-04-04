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

    const columns = [
        { field: 'machineName', headerName: 'Name', width: 300 },
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
        if (createMachineRequest.machineName.length < 5 || createMachineRequest.machineName.length > 100) {
            toast.error('Machine name must be between 5 and 100 characters.');
            return;
        }

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
    const [isLoadingUpdateMachine, setIsLoadingUpdateMachine] = useState(false);
    const [showQrCodes, setShowQrCodes] = useState(false);
    const [testResponse, setTestResponse] = useState('');

    const handleOpenUpdateMachineModal = async (id) => {
        try {
            const response = await MachineAPI.getById(id);
            const data = response?.result;
            setUpdateMachineRequest({
                machineName: data.machineName,
                apiUrl: data.apiUrl,
                token: data.token,
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
        if (updateMachineRequest.machineName.length < 5 || updateMachineRequest.machineName.length > 100) {
            toast.error('Machine name must be between 5 and 100 characters.');
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
            const response = await MachineAPI.update(machineById.id, updateMachineRequest);

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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%', my: 4 }}>
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
                        Machines Management
                    </Typography>

                    {/* Nút Create Machine */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#051D40',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: '#02F18D',
                                    color: '#051D40',
                                },
                                p: 2,
                            }}
                            onClick={handleOpenCreateMachineDialog}
                        >
                            {isLoadingCreateMachine ? <CircularProgress /> : 'Create Machine'}
                        </Button>

                        {/* Search và Filter Machines */}
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Search by Name or Code"
                                variant="outlined"
                                size="medium"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                sx={{ mr: 2 }}
                            />
                            <Autocomplete
                                options={machineTypes}
                                getOptionLabel={(option) => option.name}
                                value={selectedMachineType}
                                onChange={(event, newValue) => setSelectedMachineType(newValue)}
                                sx={{ width: 300, mr: 2 }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Machine Type" variant="outlined" />
                                )}
                            />
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
                                }}
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                        </Box>
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
                            getRowId={(row) => row.id}
                            slots={{ toolbar: GridToolbar }}
                        />
                    </Paper>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>

                {/* Create Machine Dialog */}
                <Dialog open={openCreateMachineDialog} onClose={handleCloseCreateMachineDialog} maxWidth="md" fullWidth>
                    <DialogTitle>Create New Machine</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            <TextField
                                label="Machine Name"
                                name="machineName"
                                fullWidth
                                variant="outlined"
                                onChange={(event) => {
                                    setCreateMachineRequest((prev) => ({
                                        ...prev,
                                        machineName: event.target.value,
                                    }));
                                }}
                            />

                            {/* Machine Code Input */}
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
                                sx={{ mt: 2 }}
                            />

                            <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 2, width: '100%' }}>
                                <Typography variant="h6">API Configuration</Typography>

                                {/* API URL */}
                                <TextField
                                    label="API URL"
                                    fullWidth
                                    variant="outlined"
                                    value={tempApiUrl}
                                    onChange={(event) => setTempApiUrl(event.target.value)}
                                    sx={{ mt: 2 }}
                                />

                                {/* Add Header Button */}
                                {tempApiUrl && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        sx={{ mt: 2 }}
                                        onClick={() =>
                                            setTempHeaders([...tempHeaders, { keyHeader: '', valueOfKey: '' }])
                                        }
                                    >
                                        Add Header
                                    </Button>
                                )}

                                {/* Header Inputs */}
                                {tempHeaders.map((header, index) => (
                                    <Box key={index} sx={{ display: 'flex', gap: 2, mt: 2, width: '100%' }}>
                                        <TextField
                                            label="Header Key"
                                            fullWidth
                                            variant="outlined"
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
                                            value={header.valueOfKey}
                                            onChange={(e) => {
                                                const updatedHeaders = [...tempHeaders];
                                                updatedHeaders[index].valueOfKey = e.target.value;
                                                setTempHeaders(updatedHeaders);
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                setTempHeaders(tempHeaders.filter((_, i) => i !== index));
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    </Box>
                                ))}

                                {/* Save & Test Buttons */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={async () => {
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
                                                setResponseMessage('Failed to fetch API');
                                            }
                                        }}
                                    >
                                        Test
                                    </Button>
                                </Box>

                                {/* Response Display */}
                                {responseMessage && (
                                    <Box
                                        sx={{
                                            mt: 2,
                                            p: 2,
                                            border: '1px solid #ddd',
                                            borderRadius: 2,
                                            bgcolor: '#f5f5f5',
                                        }}
                                    >
                                        <Typography variant="subtitle1">Response:</Typography>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>{responseMessage}</pre>
                                    </Box>
                                )}
                            </Box>

                            <Autocomplete
                                disablePortal
                                options={machineTypes}
                                getOptionLabel={(option) => option.name}
                                sx={{ width: 300 }}
                                renderInput={(params) => <TextField {...params} label="Machine Types" />}
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

                            {machineTypeAttributes.map((attribute) => (
                                <TextField
                                    key={attribute.id}
                                    label={attribute.attributeName}
                                    fullWidth
                                    variant="outlined"
                                    value={attribute.valueAttribute}
                                    disabled
                                />
                            ))}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateMachineDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateMachine}
                            disabled={isLoadingCreateMachine}
                        >
                            {isLoadingCreateMachine ? <CircularProgress /> : ' Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Update Machine Dialog */}
                <Dialog open={openUpdateMachineDialog} onClose={handleCloseUpdateMachineDialog} maxWidth="md" fullWidth>
                    <DialogTitle>Machine Detail</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {/* Machine Name */}
                            <TextField
                                label="Machine Name"
                                fullWidth
                                variant="outlined"
                                value={updateMachineRequest.machineName || ''}
                                onChange={(event) =>
                                    setUpdateMachineRequest((prev) => ({
                                        ...prev,
                                        machineName: event.target.value,
                                    }))
                                }
                            />

                            <Card
                                sx={{
                                    width: '100%',
                                    borderRadius: 3, // Bo góc mềm mại
                                    boxShadow: 3, // Tạo hiệu ứng bóng
                                    padding: 2, // Khoảng cách bên trong
                                    border: '1px solid #ddd', // Viền nhẹ
                                }}
                            >
                                <CardContent>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ fontWeight: 'bold', color: 'primary.main' }}
                                    >
                                        API Configuration
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} /> {/* Đường kẻ ngăn cách */}
                                    <TextField
                                        label="API URL"
                                        fullWidth
                                        value={updateMachineRequest.apiUrl}
                                        onChange={(e) =>
                                            setUpdateMachineRequest({ ...updateMachineRequest, apiUrl: e.target.value })
                                        }
                                        margin="normal"
                                    />
                                    {/* Header Key - Value */}
                                    <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: 'bold', mb: 2 }}>
                                        Headers
                                    </Typography>
                                    {updateMachineRequest.headerRequests.map((header, index) => (
                                        <Box display="flex" alignItems="center" gap={2} key={index} marginBottom={1}>
                                            <TextField
                                                label="Header Key"
                                                value={header.keyHeader}
                                                onChange={(e) => handleChangeHeader(index, 'keyHeader', e.target.value)}
                                                sx={{ flex: 1 }}
                                            />
                                            <TextField
                                                label="Header Value"
                                                value={header.valueOfKey}
                                                onChange={(e) =>
                                                    handleChangeHeader(index, 'valueOfKey', e.target.value)
                                                }
                                                sx={{ flex: 2 }}
                                            />
                                            <IconButton onClick={() => handleRemoveHeader(index)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    ))}
                                    <Button onClick={handleAddHeader} startIcon={<AddIcon />} sx={{ mt: 1 }}>
                                        Add Header
                                    </Button>
                                    {/* Test API Button */}
                                    <Button
                                        onClick={handleTestApiUrl}
                                        variant="contained"
                                        color="primary"
                                        sx={{ mt: 2, width: '100%' }}
                                    >
                                        Test API
                                    </Button>
                                    {/* Response Display */}
                                    {testResponse && (
                                        <Box mt={2} p={2} bgcolor="grey.100" borderRadius={2}>
                                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                                Response:
                                            </Typography>
                                            <pre style={{ whiteSpace: 'pre-wrap' }}>{testResponse}</pre>
                                        </Box>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Machine Attributes */}
                            {updateMachineRequest.machineTypeValueModifyRequests?.map((attr, index) => (
                                <TextField
                                    key={attr.machineTypeValueId}
                                    label={
                                        machineById.machineTypeValueResponses?.[index]?.machineTypeAttributeName ||
                                        'Attribute'
                                    }
                                    disabled={true}
                                    fullWidth
                                    InputProps={{ readOnly: true }}
                                    variant="outlined"
                                    value={attr.valueAttribute || ''}
                                    onChange={(event) => {
                                        const updatedAttributes = [
                                            ...updateMachineRequest.machineTypeValueModifyRequests,
                                        ];
                                        updatedAttributes[index] = {
                                            ...updatedAttributes[index],
                                            valueAttribute: event.target.value,
                                        };
                                        setUpdateMachineRequest((prev) => ({
                                            ...prev,
                                            machineTypeValueModifyRequests: updatedAttributes,
                                        }));
                                    }}
                                />
                            ))}

                            {/* Toggle QR Code Button */}
                            <Button
                                variant="contained"
                                color="secondary"
                                sx={{ mb: 2 }}
                                onClick={() => setShowQrCodes((prev) => !prev)}
                            >
                                {showQrCodes ? 'Hide QR Codes' : 'Show QR Codes'}
                            </Button>

                            {/* QR Codes List */}
                            {showQrCodes && machineById.machineQrsResponses?.length > 0 && (
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        mt: 3,
                                        width: '100%',
                                    }}
                                >
                                    <Typography variant="h6" gutterBottom>
                                        QR Codes
                                    </Typography>
                                    <Grid container spacing={0} rowSpacing={4} justifyContent="center">
                                        {machineById.machineQrsResponses.map((qr) => (
                                            <Grid item xs={6} sm={4} key={qr.machineQrId}>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <img
                                                        src={getImage(qr.qrUrl)}
                                                        alt="QR Code"
                                                        style={{
                                                            width: 150,
                                                            height: 150,
                                                            display: 'block',
                                                            border: '1px solid #ddd',
                                                            borderRadius: 8,
                                                        }}
                                                    />
                                                    <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                                                        {qr.guidelineName}
                                                    </Typography>
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ mt: 1, fontSize: '0.8rem', padding: '5px 10px' }}
                                                        onClick={() =>
                                                            handleDownloadQrCode(
                                                                qr.qrUrl,
                                                                `${qr.guidelineName}_QRCode.png`,
                                                            )
                                                        }
                                                    >
                                                        Download
                                                    </Button>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpdateMachineDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateMachine}
                            disabled={isLoadingUpdateMachine}
                        >
                            {isLoadingUpdateMachine ? <CircularProgress /> : ' Save Changes'}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenConfirmDeleteMachineTypeDialog(true)}
                        >
                            Delete Machine
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
            </Grid>
        </ThemeProvider>
    );
}
