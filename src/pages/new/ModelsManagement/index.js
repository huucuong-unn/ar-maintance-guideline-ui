import { Delete as DeleteIcon } from '@mui/icons-material';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import EditIcon from '@mui/icons-material/Edit';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Grid,
    Modal,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ModelAPI from '~/API/ModelAPI';
import ModelTypeAPI from '~/API/ModelTypeAPI';
import PaymentAPI from '~/API/PaymentAPI';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import ModelEditor from '~/components/ModelEditor';
import storageService from '~/components/StorageService/storageService';
import { getImage } from '~/Constant';

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

export default function ModelsManagement() {
    const navigate = useNavigate();
    // Data states
    const [isLoading, setIsLoading] = useState(true);

    // Create Model Dialog state
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Form fields for creating a model
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState(null);
    const [version, setVersion] = useState('');
    const [scale, setScale] = useState('');
    const [file3D, setFile3D] = useState(null);
    const [modelTypeId, setModelTypeId] = useState('');
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);

    const [rows, setRows] = useState([]);
    const [typeSearch, setTypeSearch] = useState('');
    const [nameSearch, setNameSearch] = useState('');
    const [codeSearch, setCodeSearch] = useState('');
    const [searchParams, setSearchParams] = useState({
        nameSearch: '',
        codeSearch: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    const [modelTypes, setModelTypes] = useState([]);
    const [openModal, setOpenModal] = useState(false);
    const [selectedModel, setSelectedModel] = useState({});
    const [openUpdateModal, setUpdateOpenModal] = useState(false);
    const [updatedModel, setUpdatedModel] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const [modelFile, setModelFile] = useState(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

    const handleOpenConfirmDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
    };

    const handleDeleteModel = async () => {
        setConfirmDeleteOpen(false);
        try {
            console.log(selectedModel.id);

            const response = await ModelAPI.deleteById(selectedModel.id);
            if (response?.result) {
                toast.success('Model deleted successfully!', { position: 'top-right' });
                handleCloseModal();
                fetchModels();
            }
        } catch (error) {
            console.error('Failed to delete model:', error);
            toast.error('Failed to delete model. Please try again.', { position: 'top-right' });
        }
    };

    const [openEditor, setOpenEditor] = useState(false);

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setUpdateOpenModal(false);
        setOpenCreateDialog(false);
        fetchModels();
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 350 },
        { field: 'courseName', headerName: 'Guideline Name', width: 350 },
        {
            field: 'isUsed',
            headerName: 'Is Used',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.value ? 'Yes' : 'No'}
                    style={{
                        backgroundColor: params.value ? 'green' : 'yellow',
                        color: params.value ? 'white' : 'black',
                        fontWeight: 'bold',
                    }}
                />
            ),
        },
        { field: 'status', headerName: 'Status', width: 150 },
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
                        handleOpenUpdateModal(params.row.id);
                    }}
                >
                    Action
                </Button>
            ),
        },
    ];

    const handleOpenModal = async (id) => {
        try {
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setSelectedModel(modelData);
            // setOpenModal(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
        }
    };

    const handleOpenUpdateModal = async (id) => {
        try {
            setOpenModal(false);
            const response = await ModelAPI.getById(id);
            const modelData = response?.result;
            setUpdatedModel(modelData);
            setUpdateOpenModal(true);
            setOpenEditor(true);
        } catch (error) {
            console.error('Failed to fetch model details:', error);
        }
    };

    const handleCloseUpdateModal = () => {
        setUpdateOpenModal(false);
        setSelectedModel({});
        setUpdatedModel({});
        setImageFile(null);
        setModelFile(null);
        fetchModels();
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedModel({});
    };

    useEffect(() => {
        console.log(updatedModel);
    }, [updatedModel]);

    useEffect(() => {
        fetchModels();
    }, [paginationModel, searchParams, isCreating]);

    const fetchModels = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;

            const params = {
                page: pageParam,
                size: sizeParam,
                name: searchParams.nameSearch || undefined,
                code: searchParams.codeSearch || undefined,
                type: searchParams.typeSearch || undefined,
            };
            const response = await ModelAPI.getByCompany(userInfo?.company?.id, params);
            const data = response?.result?.objectList || [];
            console.log(data);

            setRows(data);

            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch models:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const fetchModelsType = async () => {
            try {
                const response = await ModelTypeAPI.getAllToSelect();
                const data = response?.result?.objectList || [];
                console.log(data);

                setModelTypes(data);
            } catch (error) {
                console.error('Failed to fetch models:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModelsType();
    }, []);

    const handleCloseCreateDialog = () => {
        setName('');
        setDescription('');
        setCode('');
        setImage(null);
        setVersion('');
        setScale('');
        setFile3D(null);
        setModelTypeId('');
        setOpenCreateDialog(false);
        setOpenEditor(false);
    };

    const handle3DFileSelect = (e) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
        }
        setName('');
        setCode('');
        setDescription('');
        setImage(null);
        setVersion('');
        setScale('');
        setModelTypeId('');
        setOpenCreateDialog(true);
        setOpenEditor(true);
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
                        Models Management
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'right', alignItems: 'center', my: 4 }}>
                        {/* <Button
                            variant="contained"
                            component="label"
                            sx={{
                                bgcolor: '#051D40',
                                color: '#02F18D',
                                '&:hover': {
                                    bgcolor: '#02F18D',
                                    color: '#051D40',
                                },
                                p: 2,
                            }}
                        >
                            Create Model
                            <input type="file" hidden accept=".glb,.gltf" onChange={handle3DFileSelect} />
                        </Button> */}
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}
                        >
                            {/* Search by email */}
                            <TextField
                                variant="outlined"
                                label="Search by Name"
                                sx={{ width: '300px' }}
                                value={nameSearch}
                                onChange={(e) => setNameSearch(e.target.value)}
                            />
                            <TextField
                                variant="outlined"
                                label="Search by Code"
                                sx={{ width: '300px' }}
                                value={codeSearch}
                                onChange={(e) => setCodeSearch(e.target.value)}
                            />
                            {/* Search button */}
                            <Button
                                variant="contained"
                                onClick={() => setSearchParams({ nameSearch, codeSearch, typeSearch })}
                                sx={{ p: 2 }}
                            >
                                Search
                            </Button>
                        </Box>
                    </Box>

                    <Paper sx={{ height: 450, width: '100%' }}>
                        {' '}
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => {
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }));
                            }}
                            sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                            getRowId={(row) => row.id}
                            onRowClick={(params) => handleOpenModal(params.row.id)}
                        />
                    </Paper>

                    <Copyright sx={{ mt: 5 }} />
                </Box>
            </Grid>
            {/* Create Model Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="xl">
                <DialogTitle>Create New Model</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    {file3D && (
                        <>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                File: {file3D.name}
                            </Typography>
                            {openEditor && (
                                <ModelEditor
                                    action={'CreateModel'}
                                    modelFile3D={URL.createObjectURL(file3D)}
                                    modelFile3DToCreate={file3D}
                                    handleCloseModal={handleCloseEditor}
                                />
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateDialog} disabled={isCreating}>
                        Cancel
                    </Button>
                    {/* <Button onClick={handleCreateModel} disabled={isCreating}>
                        {isCreating ? <CircularProgress size={24} /> : 'Create'}
                    </Button> */}
                </DialogActions>
            </Dialog>

            <Modal open={openUpdateModal} onClose={handleCloseUpdateModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '90vw', // Tăng chiều rộng lên 90% màn hình
                        maxWidth: '3000px', // Đảm bảo không quá lớn trên màn hình rộng
                        maxHeight: '90vh', // Giữ chiều cao tối đa
                        overflowY: 'auto', // Bật cuộn nếu nội dung quá dài
                        bgcolor: 'background.paper',
                        borderRadius: '10px',
                        boxShadow: 10,
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    {openEditor && (
                        <ModelEditor
                            modelId={updatedModel ? updatedModel?.id : updatedModel}
                            action={'UpdateModelManagement'}
                            handleCloseModal={handleCloseEditor}
                        />
                    )}

                    <Button
                        onClick={handleCloseUpdateModal}
                        variant="contained"
                        color="error"
                        sx={{ mt: 2, float: 'right' }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>

            <Modal open={openModal} onClose={handleCloseModal}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 550,
                        bgcolor: 'background.paper',
                        borderRadius: 3,
                        boxShadow: 10,
                        p: 3,
                        textAlign: 'center',
                    }}
                >
                    {/* Tiêu đề */}
                    <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
                        Model Details
                    </Typography>

                    {/* Nội dung thông tin */}
                    <Card elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                        <CardContent sx={{ textAlign: 'left' }}>
                            <Typography variant="subtitle1">
                                <strong>Model Type:</strong> {selectedModel.modelTypeName}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Model Code:</strong> {selectedModel.modelCode}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Status:</strong>{' '}
                                {selectedModel.status === 'ACTIVE' ? (
                                    <CheckCircleIcon color="success" />
                                ) : (
                                    <CancelIcon color="error" />
                                )}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Name:</strong> {selectedModel.name}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Description:</strong> {selectedModel.description}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Scale:</strong> {selectedModel.scale}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Is Used:</strong> {selectedModel.isUsed ? 'Yes' : 'No'}
                            </Typography>
                            <Typography variant="subtitle1">
                                <strong>Course Name:</strong> {selectedModel.courseName || 'N/A'}
                            </Typography>
                            {selectedModel.imageUrl && (
                                <Box sx={{ mt: 2, textAlign: 'center' }}>
                                    <img
                                        src={getImage(selectedModel?.imageUrl)}
                                        alt="Model"
                                        style={{
                                            width: '100%', // Đảm bảo ảnh chiếm hết chiều ngang container
                                            maxWidth: '100%', // Giữ ảnh không bị vỡ
                                            maxHeight: '300px', // Tăng chiều cao tối đa để hiển thị rõ hơn
                                            objectFit: 'contain', // Giữ nguyên tỉ lệ ảnh, tránh bị cắt
                                            borderRadius: 8,
                                            border: '2px solid #ddd',
                                        }}
                                    />
                                </Box>
                            )}
                        </CardContent>
                    </Card>

                    <Divider sx={{ my: 3 }} />

                    {/* Nút download file */}
                    {selectedModel.file && (
                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            startIcon={<CloudDownloadIcon />}
                            sx={{
                                borderRadius: 2,
                                fontSize: '16px',
                                fontWeight: 'bold',
                                textTransform: 'none',
                                background: 'linear-gradient(135deg, #3F51B5, #2196F3)',
                                ':hover': {
                                    background: 'linear-gradient(135deg, #303F9F, #1976D2)',
                                },
                            }}
                            onClick={() => window.open(getImage(selectedModel.file), '_blank')}
                        >
                            Download Model File
                        </Button>
                    )}

                    <Button
                        onClick={handleOpenConfirmDelete}
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<DeleteIcon />}
                        sx={{
                            mt: 2,
                            borderRadius: 2,
                            fontSize: '16px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            background: 'linear-gradient(135deg, #D32F2F, #B71C1C)',
                            ':hover': {
                                background: 'linear-gradient(135deg, #C62828, #880E4F)',
                            },
                        }}
                    >
                        Delete Model
                    </Button>

                    {/* Nút Close */}
                    <Button
                        onClick={handleCloseModal}
                        variant="contained"
                        color="error"
                        fullWidth
                        startIcon={<CloseIcon />}
                        sx={{ mt: 2, borderRadius: 2, fontSize: '16px', fontWeight: 'bold', textTransform: 'none' }}
                    >
                        Close
                    </Button>
                </Box>
            </Modal>

            <Dialog open={confirmDeleteOpen} onClose={handleCloseConfirmDelete}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this model? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmDelete} color="inherit">
                        Cancel
                    </Button>
                    <Button onClick={handleDeleteModel} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}
