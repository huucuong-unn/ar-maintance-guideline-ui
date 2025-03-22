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

    const columns = [
        { field: 'machineName', headerName: 'Name', width: 200 },
        { field: 'machineCode', headerName: 'Code', width: 200 },
        { field: 'machineType', headerName: 'Machine Type', width: 200 },
        {
            field: 'action',
            headerName: 'Action',
            width: 150,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleOpenUpdateMachineModal(params.row.id);
                    }}
                >
                    Update
                </Button>
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
            };
            const response = await MachineAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('Failed to fetch machines: ', error);
        }
    };

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
        });
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

        setIsLoadingCreateMachine(true);

        try {
            const response = await MachineAPI.create(createMachineRequest);
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
    });
    const [isLoadingUpdateMachine, setIsLoadingUpdateMachine] = useState(false);
    const [showQrCodes, setShowQrCodes] = useState(false);

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
            machineTypeValueModifyRequests: [
                {
                    machineTypeValueId: '',
                    machineTypeAttributeId: '',
                    valueAttribute: '',
                },
            ],
        });
        setShowQrCodes(false);
    };

    const handleUpdateMachine = async () => {
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

    useEffect(() => {
        console.log(createMachineRequest);
    }, [createMachineRequest]);

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

                    {/* Search and Filter Machines */}
                    <Box sx={{ mb: 4, display: 'flex', justify: 'left' }}>
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
                            {isLoadingCreateMachine ? <CircularProgress /> : ' Create Machine'}
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

                            {/* <TextField
                                label="API URL"
                                name="apiUrl"
                                fullWidth
                                variant="outlined"
                                onChange={(event) => {
                                    setCreateMachineRequest((prev) => ({
                                        ...prev,
                                        apiUrl: event.target.value,
                                    }));
                                }}
                            /> */}
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
                                            setTempHeaders([...tempHeaders, { keyHeader: '', valueOfHeader: '' }])
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
                                            value={header.valueOfHeader}
                                            onChange={(e) => {
                                                const updatedHeaders = [...tempHeaders];
                                                updatedHeaders[index].valueOfHeader = e.target.value;
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
                                        color="primary"
                                        onClick={() => {
                                            setCreateMachineRequest((prev) => ({
                                                ...prev,
                                                apiUrl: tempApiUrl,
                                                headerRequests: tempHeaders,
                                            }));
                                            toast.success('API URL & Headers saved');
                                        }}
                                    >
                                        Save
                                    </Button>

                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(tempApiUrl, {
                                                    method: 'GET',
                                                    headers: Object.fromEntries(
                                                        tempHeaders.map((h) => [h.keyHeader, h.valueOfHeader]),
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
                                    onChange={(event) => {
                                        const { value } = event.target;

                                        setCreateMachineRequest((prev) => {
                                            // Kiểm tra xem thuộc tính đã tồn tại trong danh sách chưa
                                            const updatedAttributes = prev.machineTypeValueCreationRequest.some(
                                                (item) => item.machineTypeAttributeId === attribute.id,
                                            )
                                                ? prev.machineTypeValueCreationRequest.map((item) =>
                                                      item.machineTypeAttributeId === attribute.id
                                                          ? { ...item, valueAttribute: value }
                                                          : item,
                                                  )
                                                : [
                                                      ...prev.machineTypeValueCreationRequest,
                                                      { machineTypeAttributeId: attribute.id, valueAttribute: value },
                                                  ];

                                            return { ...prev, machineTypeValueCreationRequest: updatedAttributes };
                                        });
                                    }}
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

                            {/* API URL */}
                            <TextField
                                label="API URL"
                                fullWidth
                                variant="outlined"
                                value={updateMachineRequest.apiUrl || ''}
                                onChange={(event) =>
                                    setUpdateMachineRequest((prev) => ({
                                        ...prev,
                                        apiUrl: event.target.value,
                                    }))
                                }
                            />

                            {/* Token */}
                            <TextField
                                label="Token"
                                fullWidth
                                variant="outlined"
                                value={updateMachineRequest.token || ''}
                                onChange={(event) =>
                                    setUpdateMachineRequest((prev) => ({
                                        ...prev,
                                        token: event.target.value,
                                    }))
                                }
                            />

                            {/* Machine Attributes */}
                            {updateMachineRequest.machineTypeValueModifyRequests?.map((attr, index) => (
                                <TextField
                                    key={attr.machineTypeValueId}
                                    label={
                                        machineById.machineTypeValueResponses?.[index]?.machineTypeAttributeName ||
                                        'Attribute'
                                    }
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
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
