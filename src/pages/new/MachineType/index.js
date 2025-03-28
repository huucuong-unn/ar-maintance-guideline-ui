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
import { IconButton } from '@mui/material';
import { Delete } from '@mui/icons-material';
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
import MachineTypeAPI from '~/API/MachineTypeAPI';

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

export default function MachineTypeManagement() {
    //user info
    const userInfo = storageService.getItem('userInfo')?.user || null;

    //Fetch Machines Type
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    const columns = [
        { field: 'machineTypeName', headerName: 'Name', width: 300 },
        { field: 'numOfAttribute', headerName: 'Number of Attribute', width: 300 },
        { field: 'numOfMachine', headerName: 'Number of Machine', width: 300 },
        {
            field: 'action',
            headerName: 'Action',
            width: 250,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(event) => {
                        event.stopPropagation();
                        handleOpenUpdateMachineTypeModal(params.row.machineTypeId);
                    }}
                >
                    Update
                </Button>
            ),
        },
    ];

    useEffect(() => {
        fetchMachineTypes();
    }, [paginationModel]);

    const fetchMachineTypes = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                name: searchTerm,
            };
            const response = await MachineTypeAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('Failed to fetch machines type: ', error);
        }
    };

    const handleSearch = () => {
        setPaginationModel((prev) => ({ ...prev, page: 0 }));
        fetchMachineTypes();
    };

    //Create Machine Type
    const [isLoadingCreateMachineType, setIsLoadingCreateMachineType] = useState(false);
    const [openCreateMachineTypeDialog, setOpenCreateMachineTypeDialog] = useState(false);
    const [createMachineTypeRequest, setCreateMachineTypeRequest] = useState({
        companyId: userInfo?.company?.id,
        machineTypeName: '',
        machineTypeAttributeCreationRequestList: [],
    });

    const handleOpenCreateMachineTypeDialog = () => {
        setOpenCreateMachineTypeDialog(true);
    };

    const handleCloseCreateMachineTypeDialog = () => {
        setOpenCreateMachineTypeDialog(false);
        setCreateMachineTypeRequest({
            companyId: userInfo?.company?.id,
            machineTypeName: '',
            machineTypeAttributeCreationRequestList: [],
        });
    };

    const handleAddAttribute = () => {
        setCreateMachineTypeRequest((prev) => ({
            ...prev,
            machineTypeAttributeCreationRequestList: [
                ...prev.machineTypeAttributeCreationRequestList,
                { attributeName: '', attributeValue: '' },
            ],
        }));
    };

    // Xóa attribute theo index
    const handleRemoveAttribute = (index) => {
        setCreateMachineTypeRequest((prev) => ({
            ...prev,
            machineTypeAttributeCreationRequestList: prev.machineTypeAttributeCreationRequestList.filter(
                (_, i) => i !== index,
            ),
        }));
    };

    // Cập nhật giá trị nhập vào attribute
    const handleChangeAttribute = (index, field, value) => {
        setCreateMachineTypeRequest((prev) => {
            const updatedAttributes = [...prev.machineTypeAttributeCreationRequestList];
            updatedAttributes[index] = { ...updatedAttributes[index], [field]: value };
            return { ...prev, machineTypeAttributeCreationRequestList: updatedAttributes };
        });
    };

    const handleCreateMachineType = async () => {
        try {
            // Validate Machine Type Name
            if (
                !createMachineTypeRequest.machineTypeName ||
                createMachineTypeRequest.machineTypeName.length < 5 ||
                createMachineTypeRequest.machineTypeName.length > 100
            ) {
                toast.error('Machine Type Name must be between 5 and 100 characters.');
                return;
            }

            // Validate Machine Attributes
            if (createMachineTypeRequest.machineTypeAttributeCreationRequestList.length === 0) {
                toast.error('At least one attribute is required.');
                return;
            }

            // Validate each attribute name length (2-100 characters)
            for (const attr of createMachineTypeRequest.machineTypeAttributeCreationRequestList) {
                if (!attr.attributeName || attr.attributeName.length < 2 || attr.attributeName.length > 100) {
                    toast.error('Each attribute name must be between 2 and 100 characters.');
                    return;
                }
            }

            setIsLoadingCreateMachineType(true);

            const response = await MachineTypeAPI.create(createMachineTypeRequest);
            if (response?.result) {
                toast.success('Create machine type successfully');
            }
            fetchMachineTypes();
            handleCloseCreateMachineTypeDialog();
        } catch (error) {
            console.error('Failed to create machine type:', error);
            toast.error(`Create machine type failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingCreateMachineType(false);
        }
    };

    //Update Machine Type
    const [openUpdateMachineTypeDialog, setOpenUpdateMachineTypeDialog] = useState(false);
    const [machineTypeById, setMachineTypeById] = useState({});
    const [updateMachineTypeRequest, setUpdateMachineTypeRequest] = useState({
        machineTypeName: '',
        machineTypeAttributeCreationRequestList: [
            {
                machineTypeAttributeId: '',
                attributeName: '',
                attributeValue: '',
            },
        ],
    });
    const [currentMachineTypeAttributeIdToDelete, setCurrentMachineTypeAttributeIdToDelete] = useState('');
    const [openConfirmDeleteDialog, setOpenConfirmDeleteDialog] = useState(false);
    const [isLoadingUpdateMachineType, setIsLoadingUpdateMachineType] = useState(false);

    const handleOpenUpdateMachineTypeModal = async (id) => {
        try {
            const response = await MachineTypeAPI.getById(id);
            const data = response?.result;

            if (data) {
                setMachineTypeById(data);

                setUpdateMachineTypeRequest({
                    machineTypeName: data.machineTypeName || '',
                    machineTypeAttributeCreationRequestList: data.machineTypeAttributeResponses.map((attr) => ({
                        machineTypeAttributeId: attr.id,
                        attributeName: attr.attributeName,
                        attributeValue: attr.valueAttribute,
                    })),
                });
            }

            setOpenUpdateMachineTypeDialog(true);
        } catch (error) {
            console.error('Failed to fetch machine type details:', error);
        }
    };

    const handleCloseUpdateMachineTypeDialog = () => {
        setOpenUpdateMachineTypeDialog(false);
        setMachineTypeById({});
        setUpdateMachineTypeRequest({
            machineTypeName: '',
            machineTypeAttributeCreationRequestList: [
                {
                    machineTypeAttributeId: '',
                    attributeName: '',
                },
            ],
        });
    };

    const handleUpdateMachineType = async () => {
        if (
            !updateMachineTypeRequest.machineTypeName ||
            updateMachineTypeRequest.machineTypeName.length < 5 ||
            updateMachineTypeRequest.machineTypeName.length > 100
        ) {
            toast.error('Machine Type Name must be between 5 and 100 characters.');
            return;
        }

        // Validate Machine Attributes
        for (const attr of updateMachineTypeRequest.machineTypeAttributeCreationRequestList) {
            if (!attr.attributeName || attr.attributeName.length < 5 || attr.attributeName.length > 100) {
                toast.error('Each attribute name must be between 5 and 100 characters.');
                return;
            }
        }

        setIsLoadingUpdateMachineType(true);

        try {
            const response = await MachineTypeAPI.update(machineTypeById.machineTypeId, updateMachineTypeRequest);
            if (response?.result) {
                toast.success('Update machine type successfully');
            }
            fetchMachineTypes();
            handleCloseCreateMachineTypeDialog();
        } catch (error) {
            console.error('Failed to Update machine type:', error);
            toast.error(`Update machine type failed. ${error?.response?.data?.message}`);
        } finally {
            setIsLoadingUpdateMachineType(false);
        }
    };

    const handleOpenConfirmDeleteDialog = (attributeId) => {
        setCurrentMachineTypeAttributeIdToDelete(attributeId);
        setOpenConfirmDeleteDialog(true);
    };

    const handleCloseConfirmDeleteDialog = () => {
        setOpenConfirmDeleteDialog(false);
        setCurrentMachineTypeAttributeIdToDelete('');
    };

    const handleDeleteAttribute = async () => {
        try {
            await MachineTypeAttributeAPI.delete(currentMachineTypeAttributeIdToDelete);
            toast.success('Attribute deleted successfully');
            setUpdateMachineTypeRequest((prev) => ({
                ...prev,
                machineTypeAttributeCreationRequestList: prev.machineTypeAttributeCreationRequestList.filter(
                    (attr) => attr.machineTypeAttributeId !== currentMachineTypeAttributeIdToDelete,
                ),
            }));
            handleCloseConfirmDeleteDialog();
        } catch (error) {
            console.error('Failed to delete attribute:', error);
            toast.error(`Delete attribute failed. ${error?.response?.data?.message}`);
        }
    };

    const [openConfirmDeleteMachineTypeDialog, setOpenConfirmDeleteMachineTypeDialog] = useState(false);

    const handleDeleteMachineType = async () => {
        try {
            await MachineTypeAPI.delete(machineTypeById.machineTypeId);
            toast.success('Machine Type deleted successfully');
            setOpenConfirmDeleteMachineTypeDialog(false);
            setOpenUpdateMachineTypeDialog(false);
            fetchMachineTypes();
        } catch (error) {
            console.error('Failed to delete Machine Type:', error);
            toast.error(`Delete Machine Type failed. ${error?.response?.data?.message}`);
        }
    };

    useEffect(() => {
        console.log(searchTerm);
    }, [searchTerm]);

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
                        Machines Type Management
                    </Typography>

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
                                mr: 2,
                            }}
                            onClick={handleOpenCreateMachineTypeDialog}
                        >
                            Create Machine Type
                        </Button>

                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                                label="Search Machine Type Name"
                                variant="outlined"
                                size="medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                sx={{ mr: 2, width: 300 }}
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
                            getRowId={(row) => row.machineTypeId}
                        />
                    </Paper>

                    <Box sx={{ mt: 'auto' }}>
                        <Copyright />
                    </Box>
                </Box>

                {/* Create Machine Type Dialog */}
                <Dialog
                    open={openCreateMachineTypeDialog}
                    onClose={handleCloseCreateMachineTypeDialog}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Create New Machine Type</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {/* Machine Type Name */}
                            <TextField
                                label="Machine Type Name"
                                fullWidth
                                variant="outlined"
                                value={createMachineTypeRequest.machineTypeName}
                                onChange={(e) =>
                                    setCreateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeName: e.target.value,
                                    }))
                                }
                            />
                            {/* Attributes List */}
                            {createMachineTypeRequest.machineTypeAttributeCreationRequestList.map((attr, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    {/* Attribute Name */}
                                    <TextField
                                        label={`Attribute ${index + 1}`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeName}
                                        onChange={(e) => handleChangeAttribute(index, 'attributeName', e.target.value)}
                                    />
                                    :{/* Attribute Value */}
                                    <TextField
                                        label={`Value ${index + 1}`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeValue}
                                        onChange={(e) => handleChangeAttribute(index, 'attributeValue', e.target.value)}
                                    />
                                    {/* Delete Button */}
                                    <IconButton color="error" onClick={() => handleRemoveAttribute(index)}>
                                        <Delete />
                                    </IconButton>
                                </Box>
                            ))}

                            {/* Add Attribute Button */}
                            <Button variant="outlined" onClick={handleAddAttribute} fullWidth>
                                Add Attribute
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateMachineTypeDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleCreateMachineType}
                            disabled={isLoadingCreateMachineType}
                        >
                            {isLoadingCreateMachineType ? <CircularProgress /> : ' Create'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Update Machine Type Dialog */}
                <Dialog
                    open={openUpdateMachineTypeDialog}
                    onClose={handleCloseUpdateMachineTypeDialog}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Machine Type Detail</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                            {/* Machine Type Name */}
                            <TextField
                                label="Machine Type Name"
                                fullWidth
                                variant="outlined"
                                value={updateMachineTypeRequest.machineTypeName}
                                onChange={(e) =>
                                    setUpdateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeName: e.target.value,
                                    }))
                                }
                            />

                            {/* Machine Type Attributes */}
                            {updateMachineTypeRequest.machineTypeAttributeCreationRequestList.map((attr, index) => (
                                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                    {/* Attribute Name */}
                                    <TextField
                                        label={`Attribute ${index + 1} Name`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeName}
                                        onChange={(e) => {
                                            const newAttributes = [
                                                ...updateMachineTypeRequest.machineTypeAttributeCreationRequestList,
                                            ];
                                            newAttributes[index] = {
                                                ...newAttributes[index],
                                                attributeName: e.target.value,
                                            };
                                            setUpdateMachineTypeRequest((prev) => ({
                                                ...prev,
                                                machineTypeAttributeCreationRequestList: newAttributes,
                                            }));
                                        }}
                                    />

                                    {/* Attribute Value */}
                                    <TextField
                                        label={`Attribute ${index + 1} Value`}
                                        fullWidth
                                        variant="outlined"
                                        value={attr.attributeValue}
                                        onChange={(e) => {
                                            const newAttributes = [
                                                ...updateMachineTypeRequest.machineTypeAttributeCreationRequestList,
                                            ];
                                            newAttributes[index] = {
                                                ...newAttributes[index],
                                                attributeValue: e.target.value,
                                            };
                                            setUpdateMachineTypeRequest((prev) => ({
                                                ...prev,
                                                machineTypeAttributeCreationRequestList: newAttributes,
                                            }));
                                        }}
                                    />

                                    {/* Delete / Remove Button */}
                                    {attr.machineTypeAttributeId !== '' ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => handleOpenConfirmDeleteDialog(attr.machineTypeAttributeId)}
                                        >
                                            Delete
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            onClick={() => {
                                                setUpdateMachineTypeRequest((prev) => ({
                                                    ...prev,
                                                    machineTypeAttributeCreationRequestList:
                                                        prev.machineTypeAttributeCreationRequestList.filter(
                                                            (_, i) => i !== index,
                                                        ),
                                                }));
                                            }}
                                        >
                                            Remove
                                        </Button>
                                    )}
                                </Box>
                            ))}

                            {/* Nút Add Attribute */}
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => {
                                    setUpdateMachineTypeRequest((prev) => ({
                                        ...prev,
                                        machineTypeAttributeCreationRequestList: [
                                            ...prev.machineTypeAttributeCreationRequestList,
                                            { machineTypeAttributeId: '', attributeName: '' },
                                        ],
                                    }));
                                }}
                            >
                                Add Attribute
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseUpdateMachineTypeDialog}>Cancel</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateMachineType}
                            disabled={isLoadingUpdateMachineType}
                        >
                            {isLoadingUpdateMachineType ? <CircularProgress /> : 'Save Changes'}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setOpenConfirmDeleteMachineTypeDialog(true)}
                        >
                            Delete Machine Type
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Confirm Delete Attribute */}
                <Dialog open={openConfirmDeleteDialog} onClose={handleCloseConfirmDeleteDialog}>
                    <DialogTitle>Confirm Delete</DialogTitle>
                    <DialogContent>
                        <Typography>Are you sure you want to delete this attribute?</Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseConfirmDeleteDialog}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteAttribute}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog Confirm Delete Machine Type */}
                <Dialog
                    open={openConfirmDeleteMachineTypeDialog}
                    onClose={() => setOpenConfirmDeleteMachineTypeDialog(false)}
                >
                    <DialogTitle>Confirm Delete Machine Type</DialogTitle>
                    <DialogContent>
                        <Typography>
                            Are you sure you want to delete this Machine Type? This action cannot be undone.
                        </Typography>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenConfirmDeleteMachineTypeDialog(false)}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteMachineType}>
                            Delete
                        </Button>
                    </DialogActions>
                </Dialog>
            </Grid>
        </ThemeProvider>
    );
}
