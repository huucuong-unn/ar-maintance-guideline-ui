import React, { useState, useRef, useEffect, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Grid, Environment, PerspectiveCamera } from '@react-three/drei';
import {
    Box,
    Typography,
    TextField,
    Slider,
    AppBar,
    Toolbar,
    Button,
    Paper,
    Switch,
    FormControlLabel,
    Stack,
    InputAdornment,
    Card,
    CardContent,
    CardHeader,
    Divider,
    Tab,
    Tabs,
    IconButton,
    Collapse,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SettingsIcon from '@mui/icons-material/Settings';
import ModelAPI from '~/API/ModelAPI';
import { getImage } from '~/Constant';
import storageService from '~/components/StorageService/storageService';
import InstructionDetailAPI from '~/API/InstructionDetailAPI';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';

// Helper function to round values to 2 decimal places
const roundValue = (val) => Math.round(val * 100) / 100;

// Create a styled component for text inputs (without number type)
const StyledTextField = styled(TextField)(({ theme }) => ({
    width: '80px',
    '& input': {
        textAlign: 'center',
        color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
    },
    '& label': {
        color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
    },
    '& .MuiInputAdornment-root': {
        color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : undefined,
        },
        '&:hover fieldset': {
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : undefined,
        },
    },
}));

// Styled component for the expand/collapse button
const ExpandButton = styled(IconButton)(({ theme }) => ({
    marginLeft: 'auto',
    color: theme.palette.mode === 'dark' ? '#ffffff' : undefined,
}));

// Styled component for the draggable panel header
const DraggablePanelHeader = styled(Box)(({ theme }) => ({
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.mode === 'dark' ? '#333' : '#e0e0e0',
    cursor: 'move',
    borderTopLeftRadius: '4px',
    borderTopRightRadius: '4px',
    userSelect: 'none',
}));

function Scene({
    modelTransform,
    viewMode,
    onMeshesLoaded,
    onAnimationsLoaded,
    activeAnimation,
    meshVisibility,
    model,
}) {
    const groupRef = useRef();
    const { scene, animations } = useGLTF(model);
    const { camera } = useThree();
    const [mixer, setMixer] = useState(null);
    const [currentAction, setCurrentAction] = useState(null);
    const orbitControlsRef = useRef();

    // Initial camera position
    const initialCameraPosition = useRef({ position: new THREE.Vector3(3, 3, 5), target: new THREE.Vector3(0, 0, 0) });

    // Set up mixer and animations
    useEffect(() => {
        if (animations.length > 0) {
            const newMixer = new THREE.AnimationMixer(scene);
            setMixer(newMixer);

            if (onAnimationsLoaded) {
                onAnimationsLoaded(animations);
            }
        }
    }, [animations, scene, onAnimationsLoaded]);

    useEffect(() => {
        if (Object.keys(meshVisibility).length > 0) {
            scene.traverse((child) => {
                if (child.isMesh && meshVisibility.hasOwnProperty(child.name)) {
                    child.visible = meshVisibility[child.name];
                }
            });
        }
    }, [scene, meshVisibility]);

    // Handle animation changes
    useEffect(() => {
        if (!mixer) return;

        // Stop current animation if there is one
        if (currentAction) {
            currentAction.fadeOut(0.5);
            currentAction.stop();
        }

        // Start new animation if one is selected
        if (activeAnimation) {
            const animation = animations.find((a) => a.name === activeAnimation);
            if (animation) {
                const action = mixer.clipAction(animation);
                action.reset().fadeIn(0.5).play();
                setCurrentAction(action);
            }
        } else {
            setCurrentAction(null);
        }
    }, [activeAnimation, animations, mixer, currentAction]);

    // Update animation mixer in each frame
    useFrame((_, delta) => {
        if (mixer) {
            mixer.update(delta);
        }
    });

    // When model loads, update meshes list
    useEffect(() => {
        if (onMeshesLoaded) {
            const meshesArray = [];
            scene.traverse((child) => {
                if (child.isMesh) {
                    meshesArray.push(child);
                }
            });
            onMeshesLoaded(meshesArray);
        }
    }, [scene, onMeshesLoaded]);

    // Apply transform changes from inputs
    useEffect(() => {
        if (groupRef.current) {
            // Apply position
            groupRef.current.position.set(
                modelTransform.position[0],
                modelTransform.position[1],
                modelTransform.position[2],
            );

            // Apply rotation (convert from degrees to radians)
            groupRef.current.rotation.set(
                THREE.MathUtils.degToRad(modelTransform.rotation[0]),
                THREE.MathUtils.degToRad(modelTransform.rotation[1]),
                THREE.MathUtils.degToRad(modelTransform.rotation[2]),
            );

            // Apply scale
            const scale = modelTransform.scale;
            groupRef.current.scale.set(scale, scale, scale);
        }
    }, [modelTransform]);

    // Set initial camera position
    useEffect(() => {
        if (camera) {
            camera.position.set(3, 3, 5);
            camera.lookAt(0, 0, 0);
            camera.updateProjectionMatrix();
        }
    }, [camera]);

    // Reset camera position when switching to default view
    useEffect(() => {
        if (viewMode === 'default' && camera) {
            camera.position.copy(initialCameraPosition.current.position);
            camera.lookAt(initialCameraPosition.current.target);
            camera.updateProjectionMatrix();
        }
    }, [viewMode, camera]);

    // Update orbit controls based on view mode
    useEffect(() => {
        if (orbitControlsRef.current) {
            orbitControlsRef.current.enabled = viewMode === 'free';
        }
    }, [viewMode]);

    return (
        <>
            <PerspectiveCamera makeDefault position={[3, 3, 5]} fov={50} near={0.1} far={1000} />

            <OrbitControls
                ref={orbitControlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.1}
                enabled={viewMode === 'free'}
                minDistance={1}
                maxDistance={20}
            />

            <group ref={groupRef} position={[0, 0, 0]}>
                <primitive object={scene} />
            </group>
        </>
    );
}

// Custom number input with external buttons
function NumberInputWithButtons({ label, value, onChange, step = 0.1, min, max, theme }) {
    // Validate and parse input
    const handleTextChange = (e) => {
        const val = e.target.value.trim();
        // Allow empty string or valid number
        if (val === '' || !isNaN(parseFloat(val))) {
            onChange(val === '' ? '0' : val);
        }
    };

    // Handle increment/decrement
    const handleIncrement = () => {
        const newValue = parseFloat(value || 0) + step;
        if (max !== undefined && newValue > max) return;
        onChange(roundValue(newValue).toString());
    };

    const handleDecrement = () => {
        const newValue = parseFloat(value || 0) - step;
        if (min !== undefined && newValue < min) return;
        onChange(roundValue(newValue).toString());
    };

    return (
        <Stack direction="row" alignItems="center" spacing={1}>
            <StyledTextField
                label={label}
                value={value}
                onChange={handleTextChange}
                variant="outlined"
                size="small"
                theme={theme}
                InputProps={{
                    startAdornment: <InputAdornment position="start">{label}</InputAdornment>,
                }}
            />
            <Box>
                <IconButton size="small" onClick={handleIncrement} color="primary">
                    <AddIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" onClick={handleDecrement} color="primary">
                    <RemoveIcon fontSize="small" />
                </IconButton>
            </Box>
        </Stack>
    );
}

// Collapsible card component
function CollapsibleCard({ title, children, darkMode, defaultExpanded = true }) {
    const [expanded, setExpanded] = useState(defaultExpanded);

    return (
        <Card
            sx={{
                m: 2,
                bgcolor: darkMode ? '#333' : 'white',
                color: darkMode ? '#ffffff' : 'text.primary',
            }}
        >
            <CardHeader
                title={title}
                action={
                    <ExpandButton onClick={() => setExpanded(!expanded)}>
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </ExpandButton>
                }
                sx={{
                    '& .MuiCardHeader-title': {
                        color: darkMode ? '#ffffff' : 'text.primary',
                    },
                }}
            />
            <Divider sx={{ backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.12)' : undefined }} />
            <Collapse in={expanded}>
                <CardContent>{children}</CardContent>
            </Collapse>
        </Card>
    );
}

// Draggable Panel Component
function DraggablePanel({ children, darkMode, viewerRef, minimized, onMinimizeToggle }) {
    const panelRef = useRef(null);
    const hasInitialized = useRef(false);
    const [position, setPosition] = useState({ left: 0, top: 0 });

    // Chỉ thiết lập vị trí mặc định một lần
    useEffect(() => {
        if (!hasInitialized.current && viewerRef?.current && panelRef?.current) {
            const viewerRect = viewerRef.current.getBoundingClientRect();
            if (!viewerRect) return;

            // Đặt vị trí cố định bên trong viewer (bên trái)
            const defaultLeft = viewerRect.left + 20;
            const defaultTop = viewerRect.top + 20;

            setPosition({ left: defaultLeft, top: defaultTop });
            hasInitialized.current = true;
        }
    }, [viewerRef]);

    return (
        <Paper
            ref={panelRef}
            elevation={5}
            sx={{
                position: 'absolute',
                zIndex: 1000,
                left: position.left,
                top: position.top,
                width: 350,
                bgcolor: darkMode ? '#2d2d2d' : 'background.paper',
                color: 'text.primary',
                transition: 'width 0.3s ease',
                overflow: 'hidden',
                maxHeight: minimized ? 'auto' : 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <DraggablePanelHeader>
                <DragIndicatorIcon sx={{ mr: 1 }} />
                <Typography variant="subtitle1" sx={{ flexGrow: 1, color: 'text.primary' }}>
                    {minimized ? 'Controls' : 'Control Panel'}
                </Typography>
                <IconButton size="small" onClick={onMinimizeToggle} sx={{ color: 'inherit' }}>
                    {minimized ? <SettingsIcon /> : <MinimizeIcon />}
                </IconButton>
            </DraggablePanelHeader>
            {!minimized && (
                <Box
                    sx={{
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        maxHeight: 'calc(100vh - 140px)',
                    }}
                >
                    {children}
                </Box>
            )}
        </Paper>
    );
}

export default function SimplifiedModelViewer({
    modelId,
    action,
    handleCloseModal,
    modelFile3D,
    modelFile3DToCreate,
    currentInstructionId,
    currentInstructionDetailId,
    requestId,
    machineTypeId,
    isDesigner = false,
}) {
    const [userInfo, setUserInfo] = useState(storageService.getItem('userInfo')?.user || null);
    // State for model transform
    const [modelTransform, setModelTransform] = useState({
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
    });

    // State for meshes and animations
    const [meshes, setMeshes] = useState([]);
    const [animations, setAnimations] = useState([]);
    const [activeAnimation, setActiveAnimation] = useState(null);

    // View mode state (default or free)
    const [viewMode, setViewMode] = useState('default');

    // Mesh visibility state
    const [meshVisibility, setMeshVisibility] = useState({});

    useEffect(() => {
        if (meshes.length > 0) {
            const initialVisibility = meshes.reduce((acc, mesh) => {
                acc[mesh.name] = true; // Mặc định hiển thị
                return acc;
            }, {});
            setMeshVisibility(initialVisibility);
        }
    }, [meshes]);

    // UI states
    const [showGrid, setShowGrid] = useState(true);
    const [showEnvironment, setShowEnvironment] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    // Panel states
    const viewerRef = useRef(null);
    const [panelPosition, setPanelPosition] = useState({ left: 0, top: 0 });
    const [panelMinimized, setPanelMinimized] = useState(false);

    const [hiddenMeshes, setHiddenMeshes] = useState([]);

    const handleMeshVisibilityToggle = (meshName) => {
        setMeshVisibility((prev) => ({
            ...prev,
            [meshName]: !prev[meshName],
        }));
    };

    // useEffect để cập nhật danh sách hiddenMeshes khi meshVisibility thay đổi
    useEffect(() => {
        const updatedHiddenMeshes = Object.keys(meshVisibility).filter(
            (meshName) => !meshVisibility[meshName], // Lấy các mesh có checked === false
        );
        setHiddenMeshes(updatedHiddenMeshes);
    }, [meshVisibility]);

    useEffect(() => {
        console.log(hiddenMeshes);
    }, [hiddenMeshes]);

    const [modelById, setModelById] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        code: '',
    });
    const [previewImage, setPreviewImage] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingUpdateModelGuideline, setIsLoadingUpdateModelGuideline] = useState(false);
    const [isLoadingDeleteModel, setIsLoadingDeleteModel] = useState(false);
    const [isLoadingCreateInstructionDetail, setIsLoadingCreateInstructionDetail] = useState(false);
    const [isLoadingUpdateInstructionDetail, setIsLoadingUpdateInstructionDetail] = useState(false);

    useEffect(() => {
        if (!modelId) return;
        fetchModel();
    }, [modelId]);

    useEffect(() => {
        if (modelById?.imageUrl) {
            setPreviewImage(modelById.imageUrl); // Load ảnh từ model khi có dữ liệu
        }
    }, [modelById]);

    const fetchModel = async () => {
        setLoading(true);
        try {
            if (modelId != null) {
                const response = await ModelAPI.getById(modelId);
                setModelById(response.result);
                setFormData({
                    name: response.result.name || '',
                    description: response.result.description || '',
                    code: response.result.modelCode || '',
                    status: response.result.status,
                });

                setModelTransform({
                    position: response.result.position || [0, 0, 0],
                    rotation: response.result.rotation || [0, 0, 0],
                    scale: parseFloat(response.result.scale) || 1,
                });
            }
        } catch (err) {
            setError('Failed to load model');
        } finally {
            setLoading(false);
        }
    };

    const [modelError, setModelError] = useState(false);
    useEffect(() => {
        if (modelId) {
            fetch(getImage(modelById?.file))
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Không tìm thấy file trên server');
                    }
                    return response.blob();
                })
                .then(() => setModelError(false))
                .catch(() => setModelError(true));
        }
    }, [modelId, modelById]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        if (e.target.files.length > 0) {
            const file = e.target.files[0];
            setImageFile(file);
            setFormData((prev) => ({
                ...prev,
                image: file,
            }));

            // Cập nhật ảnh xem trước khi chọn file mới
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const updateModelInfo = async () => {
        if (!modelById?.id) {
            console.error('Model ID is required for update.');
            return;
        }

        // Trim spaces
        const trimmedName = formData.name.trim();
        const trimmedCode = formData.code.trim();

        // Validate required fields
        if (trimmedName.length < 5 || trimmedName.length > 50) {
            setLoading(false);
            return toast.error('Name must be between 5 and 50 characters.');
        }

        setIsLoadingUpdateModelGuideline(true);

        try {
            const formDataForUpdate = new FormData();
            formDataForUpdate.append('name', formData?.name);
            formDataForUpdate.append('description', formData.description || '');
            formDataForUpdate.append('modelTypeId', formData?.modelTypeId || '0e553950-2a32-44cd-bd53-ed680a00f2e5');
            formDataForUpdate.append('scale', modelTransform?.scale || 0);
            formDataForUpdate.append('position', modelTransform?.position || [0, 0, 0]);
            formDataForUpdate.append('rotation', modelTransform?.rotation || [0, 0, 0]);
            formDataForUpdate.append('status', formData?.status);
            if (imageFile != null) {
                formDataForUpdate.append('imageUrl', imageFile);
            }
            const response = await ModelAPI.updateModel(modelById?.id, formDataForUpdate);
            if (response?.result) {
                toast.success('Model updated successfully!', { position: 'top-right' });
                fetchModel();
                resetFormData();
            }
        } catch (error) {
            console.error('Failed to update model:', error);
            toast.error('Failed to update model. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoadingUpdateModelGuideline(false);
        }
    };

    const resetFormData = () => {
        setFormData({
            name: '',
            code: '',
            description: '',
            status: '',
            image: null,
            instructionDetailName: '',
            instructionDetailDescription: '',
        });
    };

    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const handleOpenConfirmDelete = () => {
        setConfirmDeleteOpen(true);
    };

    const handleCloseConfirmDelete = () => {
        setConfirmDeleteOpen(false);
    };

    const handleDeleteModel = async () => {
        setConfirmDeleteOpen(false);
        setIsLoadingDeleteModel(true);
        try {
            const response = await ModelAPI.deleteById(modelById.id);
            if (response?.result) {
                toast.success('Model deleted successfully!', { position: 'top-right' });
                handleCloseModal();
                resetFormData();
            }
        } catch (error) {
            console.error('Failed to delete model:', error);
            toast.error('Failed to delete model. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoadingDeleteModel(false);
        }
    };

    useEffect(() => {
        if (action === 'CreateModel') {
            resetFormData();
            setImageFile(null);
        }
    }, [action]);

    const handleCreateModel = async () => {
        // Trim spaces
        const trimmedName = formData.name.trim();

        setIsLoading(true);

        // Validate required fields
        if (trimmedName.length < 1 || trimmedName.length > 50) {
            setIsLoading(false);
            return toast.error('Name must be between 1 and 50 characters.');
        }

        if (!imageFile) {
            setIsLoading(false);
            return toast.error('Please select an image.');
        }

        try {
            const formDataToCreate = new FormData();
            formDataToCreate.append('name', trimmedName);
            formDataToCreate.append('description', formData.description);
            formDataToCreate.append('imageUrl', imageFile);
            formDataToCreate.append('scale', modelTransform.scale);
            formDataToCreate.append('file', modelFile3DToCreate);
            formDataToCreate.append('modelTypeId', machineTypeId);
            formDataToCreate.append('companyId', userInfo?.company?.id);
            formDataToCreate.append('position', modelTransform?.position || [0, 0, 0]);
            formDataToCreate.append('rotation', modelTransform?.rotation || [0, 0, 0]);

            console.log('machineTypeId', machineTypeId);
            const response = await ModelAPI.createModel(formDataToCreate);
            if (response?.result) {
                const modelId = response?.result?.id;
                if (requestId) {
                    const payload = {
                        requestId: requestId,
                        assetModelId: modelId,
                        status: 'DRAFTED',
                    };
                    const responseUpdateRequest = await CompanyRequestAPI.updateRequestStatus(requestId, payload);
                }
                toast.success('Model created successfully!', { position: 'top-right' });
                handleCloseModal();
                resetFormData();
            }
        } catch (error) {
            console.error('Failed to create model:', error);
            if (error?.response?.data?.code === 1095) {
                toast.error('Model already exists with this name. Please choose a different name.', {
                    position: 'top-right',
                });
            } else {
                toast.error('Failed to create model. Please try again.', { position: 'top-right' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log(loading);
    }, [loading]);

    const handleCreateInstructionDetail = async () => {
        const trimmedName = formData.instructionDetailName ? formData.instructionDetailName.trim() : '';
        const trimmedDescription = formData.instructionDetailDescription
            ? formData.instructionDetailDescription.trim()
            : '';

        if (trimmedName.length < 5 || trimmedName.length > 50) {
            return toast.error('Name must be between 5 and 50 characters.');
        }

        setIsLoadingCreateInstructionDetail(true);

        try {
            const formDataToCreateInstructionDetail = new FormData();
            formDataToCreateInstructionDetail.append('name', trimmedName);
            formDataToCreateInstructionDetail.append('animationName', formData.animationName);
            formDataToCreateInstructionDetail.append('description', trimmedDescription);
            formDataToCreateInstructionDetail.append('instructionId', currentInstructionId);
            formDataToCreateInstructionDetail.append('meshes', hiddenMeshes);

            const response = await InstructionDetailAPI.create(formDataToCreateInstructionDetail);
            if (response?.result) {
                toast.success('Instruction Detail created successfully!', { position: 'top-right' });
                handleCloseModal();
                resetFormData();
            }
        } catch (error) {
            console.error('Failed to create instruction detail:', error);
            toast.error('Failed to create instruction detail. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoadingCreateInstructionDetail(false);
        }
    };
    const [instructionDetailById, setInstructionDetailById] = useState({});

    useEffect(() => {
        if (instructionDetailById && Object.keys(instructionDetailById).length > 0) {
            const { animationName, meshes } = instructionDetailById;

            if (!Array.isArray(meshes)) return;

            setActiveAnimation(animationName);
            setFormData((prev) => ({ ...prev, animationName }));

            setMeshVisibility((prev) => {
                const newVisibility = { ...prev };

                meshes.forEach((meshName) => {
                    newVisibility[meshName] = false;
                });

                setHiddenMeshes(Object.keys(newVisibility).filter((mesh) => !newVisibility[mesh]));

                return newVisibility;
            });
        }
    }, [instructionDetailById, meshes]);

    const fetchInstructionDetail = async () => {
        try {
            const response = await InstructionDetailAPI.getById(currentInstructionDetailId);
            const data = response?.result;

            if (data) {
                setInstructionDetailById(data);
                // Cập nhật formData
                setFormData((prev) => ({
                    ...prev,
                    instructionDetailName: data.name,
                    instructionDetailDescription: data.description,
                }));
            }
        } catch (error) {
            console.error('Failed to fetch model:', error);
        }
    };

    useEffect(() => {
        fetchInstructionDetail();
    }, [currentInstructionDetailId]);

    useEffect(() => {
        console.log(instructionDetailById);
    }, [instructionDetailById]);

    const handleUpdateInstructionDetail = async () => {
        if (!currentInstructionDetailId) {
            console.error('Instruction Detail ID is required for update.');
            return;
        }

        // Trim spaces
        const trimmedName = formData.instructionDetailName.trim();
        const trimmedDescription = formData.instructionDetailDescription.trim();

        if (trimmedName.length < 5 || trimmedName.length > 50) {
            return toast.error('Name must be between 5 and 50 characters.');
        }

        setIsLoadingUpdateInstructionDetail(true);

        try {
            const formDataForUpdateInstructionDetail = new FormData();
            formDataForUpdateInstructionDetail.append('name', trimmedName);
            formDataForUpdateInstructionDetail.append('animationName', formData.animationName);
            formDataForUpdateInstructionDetail.append('description', trimmedDescription);
            formDataForUpdateInstructionDetail.append('meshes', hiddenMeshes);

            const response = await InstructionDetailAPI.update(
                currentInstructionDetailId,
                formDataForUpdateInstructionDetail,
            );
            if (response?.result) {
                toast.success('Instruction Detail updated successfully!', { position: 'top-right' });
            }
        } catch (error) {
            console.error('Failed to update model:', error);
            toast.error('Failed to update model. Please try again.', { position: 'top-right' });
        } finally {
            setIsLoadingUpdateInstructionDetail(false);
        }
    };

    // Create theme based on dark mode
    const theme = {
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    };

    // Handle position and rotation input changes
    const handleTransformChange = (type, index, value) => {
        setModelTransform((prev) => {
            const newTransform = { ...prev };
            newTransform[type][index] = value;
            return newTransform;
        });
    };

    // Handle scale change
    const handleScaleChange = (_, value) => {
        setModelTransform((prev) => ({
            ...prev,
            scale: value,
        }));
    };

    // Axis labels
    const axisLabels = ['X', 'Y', 'Z'];

    return (
        <Box
            sx={{
                bgcolor: darkMode ? '#121212' : '#f8f9fa',
                color: darkMode ? '#ffffff' : 'text.primary',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
            }}
        >
            {/* App Bar */}
            <AppBar
                position="static"
                sx={{
                    bgcolor: darkMode ? '#1e1e1e' : '#1976d2',
                    color: '#ffffff',
                }}
            >
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#ffffff' }}>
                        3D Model Viewer
                    </Typography>
                    <Tabs
                        value={viewMode}
                        onChange={(_, newValue) => setViewMode(newValue)}
                        sx={{
                            mr: 4,
                            '& .MuiTab-root': {
                                color: darkMode ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-selected': {
                                    color: '#ffffff',
                                },
                            },
                            '& .MuiTabs-indicator': {
                                backgroundColor: '#ffffff',
                            },
                        }}
                    >
                        <Tab label="Reality View" value="default" />
                        <Tab label="Free View" value="free" />
                    </Tabs>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                                sx={{
                                    '& .MuiSwitch-thumb': {
                                        color: darkMode ? '#90caf9' : undefined,
                                    },
                                    '& .MuiSwitch-track': {
                                        backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.5)' : undefined,
                                    },
                                }}
                            />
                        }
                        label={darkMode ? 'Dark' : 'Light'}
                        sx={{ color: '#ffffff' }}
                    />
                </Toolbar>
            </AppBar>

            {/* Main Content */}
            <Box sx={{ flexGrow: 1, position: 'relative' }}>
                {/* Canvas */}
                <Box sx={{ flexGrow: 1, height: 'calc(100vh - 64px)' }}>
                    {modelError ? (
                        <Typography variant="h6" color="warning">
                            File is being uploaded, please wait a moment...
                        </Typography>
                    ) : (
                        <Canvas style={{ background: darkMode ? '#121212' : '#f8f9fa' }}>
                            <ambientLight intensity={0.5} />
                            <directionalLight position={[5, 10, 7]} intensity={1} castShadow />
                            <pointLight position={[-3, 2, -3]} intensity={0.5} />

                            {showGrid && (
                                <Grid
                                    infiniteGrid
                                    cellSize={0.5}
                                    cellThickness={0.6}
                                    sectionSize={3}
                                    sectionThickness={1.2}
                                    fadeDistance={30}
                                    fadeStrength={1}
                                    cellColor={darkMode ? '#555555' : '#e0e0e0'}
                                    sectionColor={darkMode ? '#888888' : '#a0a0a0'}
                                />
                            )}

                            {showEnvironment && <Environment preset="city" />}

                            <Suspense fallback={null}>
                                <Scene
                                    modelTransform={modelTransform}
                                    viewMode={viewMode}
                                    onMeshesLoaded={setMeshes}
                                    onAnimationsLoaded={setAnimations}
                                    activeAnimation={activeAnimation}
                                    meshVisibility={meshVisibility}
                                    model={modelId ? getImage(modelById?.file) : modelFile3D}
                                />
                            </Suspense>
                        </Canvas>
                    )}
                </Box>

                {/* Draggable Control Panel */}
                <DraggablePanel
                    darkMode={darkMode}
                    position={panelPosition}
                    onPositionChange={setPanelPosition}
                    minimized={panelMinimized}
                    onMinimizeToggle={() => setPanelMinimized(!panelMinimized)}
                    viewerRef={viewerRef}
                >
                    <CollapsibleCard title="Transform Controls" darkMode={darkMode} defaultExpanded={true}>
                        <Stack spacing={2} sx={{ mb: 3 }}>
                            {/* Start Update Model Guideline */}
                            {(action === 'UpdateModelGuideline' || action === 'CreateModel') &&
                                action !== 'UpdateInstructionDetail' && (
                                    <>
                                        {/* Name */}
                                        <TextField
                                            required
                                            label="Name"
                                            variant="outlined"
                                            fullWidth
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            sx={{
                                                input: { color: darkMode ? '#ffffff' : '#000000' },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                    '&:hover fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                },
                                                label: { color: darkMode ? '#ffffff' : '#000000' },
                                            }}
                                        />

                                        {/* Description */}
                                        <TextField
                                            label="Description"
                                            variant="outlined"
                                            fullWidth
                                            name="description"
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            multiline
                                            rows={3}
                                            sx={{
                                                '& .MuiInputBase-input': {
                                                    color: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                    '&:hover fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: darkMode ? '#ffffff' : '#000000',
                                                },
                                            }}
                                        />

                                        {/* Hiển thị ảnh */}
                                        {(imageFile || previewImage) && (
                                            <Box sx={{ mt: 2, textAlign: 'center' }}>
                                                <Typography variant="subtitle1">Current Image</Typography>
                                                <img
                                                    src={
                                                        imageFile
                                                            ? URL.createObjectURL(imageFile)
                                                            : getImage(previewImage)
                                                    }
                                                    alt="Preview"
                                                    style={{
                                                        width: '100%',
                                                        maxWidth: '100%',
                                                        maxHeight: '300px',
                                                        objectFit: 'contain',
                                                        borderRadius: 8,
                                                        border: '2px solid #ddd',
                                                    }}
                                                />
                                            </Box>
                                        )}

                                        {/* Upload Image */}
                                        <Button
                                            disabled={!isDesigner}
                                            variant="contained"
                                            component="label"
                                            fullWidth
                                            startIcon={<CloudUploadIcon />}
                                            sx={{ mt: 2 }}
                                        >
                                            Upload Image *
                                            <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                                        </Button>

                                        {/* Hiển thị tên file ảnh đã chọn */}
                                        {imageFile && (
                                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                                File: {imageFile.name}
                                            </Typography>
                                        )}
                                    </>
                                )}

                            {/* End Update Model Guideline */}

                            {action === 'UpdateModelManagement' && action !== 'UpdateInstructionDetail' && (
                                <>
                                    <TextField
                                        label="Name"
                                        variant="outlined"
                                        fullWidth
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        sx={{
                                            input: { color: darkMode ? '#ffffff' : '#000000' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                '&:hover fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                            },
                                            label: { color: darkMode ? '#ffffff' : '#000000' },
                                        }}
                                    />

                                    {/* Description */}
                                    <TextField
                                        label="Description"
                                        variant="outlined"
                                        fullWidth
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        sx={{
                                            '& .MuiInputBase-input': { color: darkMode ? '#ffffff' : '#000000' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                '&:hover fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                            },
                                            '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' },
                                        }}
                                    />

                                    {/* Code */}
                                    <TextField
                                        label="Code"
                                        variant="outlined"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleInputChange}
                                        fullWidth
                                        sx={{
                                            input: { color: darkMode ? '#ffffff' : '#000000' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                '&:hover fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                            },
                                            label: { color: darkMode ? '#ffffff' : '#000000' },
                                        }}
                                    />

                                    {/* Hiển thị ảnh */}
                                    {(imageFile || previewImage) && (
                                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                                            <Typography variant="subtitle1">Current Image</Typography>
                                            <img
                                                src={
                                                    imageFile ? URL.createObjectURL(imageFile) : getImage(previewImage)
                                                }
                                                alt="Preview"
                                                style={{
                                                    width: '100%',
                                                    maxWidth: '100%',
                                                    maxHeight: '300px',
                                                    objectFit: 'contain',
                                                    borderRadius: 8,
                                                    border: '2px solid #ddd',
                                                }}
                                            />
                                        </Box>
                                    )}

                                    {/* Upload Image */}
                                    <Button
                                        variant="contained"
                                        component="label"
                                        fullWidth
                                        startIcon={<CloudUploadIcon />}
                                        sx={{ mt: 2 }}
                                    >
                                        Upload Image
                                        <input type="file" accept="image/*" hidden onChange={handleImageUpload} />
                                    </Button>

                                    {/* Hiển thị tên file ảnh đã chọn */}
                                    {imageFile && (
                                        <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                            File: {imageFile.name}
                                        </Typography>
                                    )}
                                    {/* Hiển thị Is Used */}
                                    <Typography variant="body1" sx={{ mt: 2, color: darkMode ? '#ffffff' : '#000000' }}>
                                        Is Used: {modelById?.isUsed ? 'Yes' : 'No'}
                                    </Typography>

                                    {/* Hiển thị Course Name */}
                                    <Typography variant="body1" sx={{ mt: 1, color: darkMode ? '#ffffff' : '#000000' }}>
                                        Course Name: {modelById?.courseName || 'N/A'}
                                    </Typography>

                                    {/* Select Status */}
                                    <FormControl fullWidth sx={{ mt: 2 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={formData.status || ''}
                                            onChange={handleInputChange}
                                            name="status"
                                            label="Status"
                                            sx={{
                                                color: darkMode ? '#ffffff' : '#000000',
                                                '& .MuiOutlinedInput-root': {
                                                    '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                    '&:hover fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderColor: darkMode ? '#ffffff' : '#000000',
                                                    },
                                                },
                                                '& .MuiInputLabel-root': {
                                                    color: darkMode ? '#ffffff' : '#000000',
                                                },
                                            }}
                                        >
                                            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                                            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
                                        </Select>
                                    </FormControl>
                                    <Button
                                        onClick={handleOpenConfirmDelete}
                                        variant="contained"
                                        color="error" // Màu đỏ của Material UI
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        disabled={isLoadingDeleteModel}
                                    >
                                        {isLoadingDeleteModel ? (
                                            <CircularProgress size={24} sx={{ color: 'white' }} />
                                        ) : (
                                            'Delete Model'
                                        )}
                                    </Button>
                                </>
                            )}

                            {action === 'CreateInstructionDetail' && action !== 'UpdateInstructionDetail' && (
                                <>
                                    {/* Name */}
                                    <TextField
                                        label="Instruction Detail Name"
                                        variant="outlined"
                                        fullWidth
                                        name="instructionDetailName"
                                        value={formData.instructionDetailName}
                                        onChange={handleInputChange}
                                        sx={{
                                            input: { color: darkMode ? '#ffffff' : '#000000' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                '&:hover fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                            },
                                            label: { color: darkMode ? '#ffffff' : '#000000' },
                                        }}
                                    />

                                    {/* Description */}
                                    <TextField
                                        label="Instruction Detail Description"
                                        variant="outlined"
                                        fullWidth
                                        name="instructionDetailDescription"
                                        value={formData.instrucrtionDetailDescription}
                                        onChange={handleInputChange}
                                        multiline
                                        rows={3}
                                        sx={{
                                            '& .MuiInputBase-input': { color: darkMode ? '#ffffff' : '#000000' },
                                            '& .MuiOutlinedInput-root': {
                                                '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                                '&:hover fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: darkMode ? '#ffffff' : '#000000',
                                                },
                                            },
                                            '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' },
                                        }}
                                    />

                                    {/* Create Button */}
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        fullWidth
                                        sx={{ mt: 2 }}
                                        onClick={handleCreateInstructionDetail}
                                        disabled={isLoadingCreateInstructionDetail}
                                    >
                                        {isLoadingCreateInstructionDetail ? <CircularProgress size={24} /> : 'Create'}
                                    </Button>
                                </>
                            )}
                        </Stack>

                        {action !== 'CreateInstructionDetail' && action !== 'UpdateInstructionDetail' && (
                            <>
                                {/* Position */}
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}
                                >
                                    Position
                                </Typography>
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    {modelTransform.position.map((val, idx) => (
                                        <NumberInputWithButtons
                                            key={`pos-${idx}`}
                                            label={axisLabels[idx]}
                                            value={val}
                                            onChange={(value) => handleTransformChange('position', idx, value)}
                                            step={0.1}
                                            theme={theme}
                                        />
                                    ))}
                                </Stack>

                                {/* Rotation */}
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}
                                >
                                    Rotation (degrees)
                                </Typography>
                                <Stack spacing={2} sx={{ mb: 3 }}>
                                    {modelTransform.rotation.map((val, idx) => (
                                        <NumberInputWithButtons
                                            key={`rot-${idx}`}
                                            label={axisLabels[idx]}
                                            value={val}
                                            onChange={(value) => handleTransformChange('rotation', idx, value)}
                                            step={5}
                                            theme={theme}
                                        />
                                    ))}
                                </Stack>

                                {/* Scale */}
                                <Typography
                                    variant="subtitle1"
                                    gutterBottom
                                    sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}
                                >
                                    Scale: {modelTransform.scale}
                                </Typography>
                                <Slider
                                    min={0.1}
                                    max={5}
                                    step={0.1}
                                    value={modelTransform.scale}
                                    onChange={handleScaleChange}
                                    valueLabelDisplay="auto"
                                    sx={{
                                        mb: 2,
                                        '& .MuiSlider-thumb': {
                                            color: darkMode ? '#90caf9' : undefined,
                                        },
                                        '& .MuiSlider-track': {
                                            color: darkMode ? '#90caf9' : undefined,
                                        },
                                        '& .MuiSlider-rail': {
                                            color: darkMode ? 'rgba(255, 255, 255, 0.3)' : undefined,
                                        },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ width: '100%' }}
                                    onClick={action === 'CreateModel' ? handleCreateModel : updateModelInfo}
                                    disabled={isLoading || isLoadingUpdateModelGuideline || !isDesigner}
                                >
                                    {action === 'CreateModel' ? (
                                        isLoading ? (
                                            <CircularProgress size={24} sx={{ color: 'white' }} />
                                        ) : (
                                            'Create'
                                        )
                                    ) : isLoadingUpdateModelGuideline ? (
                                        <CircularProgress size={24} sx={{ color: 'white' }} />
                                    ) : (
                                        'Save changes'
                                    )}
                                </Button>
                            </>
                        )}
                        {action == 'UpdateInstructionDetail' && (
                            <>
                                <TextField
                                    label="Instruction Detail Name"
                                    variant="outlined"
                                    fullWidth
                                    name="instructionDetailName"
                                    rows={2}
                                    multiline
                                    value={formData.instructionDetailName}
                                    onChange={handleInputChange}
                                    InputLabelProps={{ shrink: true }} // 👈 Fix label bị đè
                                    sx={{
                                        mb: 2,
                                        '& .MuiInputBase-input': { color: darkMode ? '#ffffff' : '#000000' },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                            '&:hover fieldset': {
                                                borderColor: darkMode ? '#ffffff' : '#000000',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: darkMode ? '#ffffff' : '#000000',
                                            },
                                        },
                                        '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' },
                                    }}
                                />

                                {/* Description */}
                                <TextField
                                    label="Instruction Detail Description"
                                    variant="outlined"
                                    fullWidth
                                    name="instructionDetailDescription"
                                    value={formData.instructionDetailDescription}
                                    onChange={handleInputChange}
                                    multiline
                                    rows={3}
                                    InputLabelProps={{ shrink: true }} // 👈 Fix label bị đè
                                    sx={{
                                        mb: 2,
                                        '& .MuiInputBase-input': { color: darkMode ? '#ffffff' : '#000000' },
                                        '& .MuiOutlinedInput-root': {
                                            '& fieldset': { borderColor: darkMode ? '#ffffff' : '#000000' },
                                            '&:hover fieldset': {
                                                borderColor: darkMode ? '#ffffff' : '#000000',
                                            },
                                            '&.Mui-focused fieldset': {
                                                borderColor: darkMode ? '#ffffff' : '#000000',
                                            },
                                        },
                                        '& .MuiInputLabel-root': { color: darkMode ? '#ffffff' : '#000000' },
                                    }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleUpdateInstructionDetail}
                                    sx={{
                                        backgroundColor: darkMode ? '#ffffff' : '#1976d2',
                                        color: darkMode ? '#000000' : '#ffffff',
                                        '&:hover': {
                                            backgroundColor: darkMode ? '#cccccc' : '#1565c0',
                                        },
                                        mt: 2,
                                    }}
                                    disabled={isLoadingUpdateInstructionDetail}
                                >
                                    {isLoadingUpdateInstructionDetail ? (
                                        <CircularProgress size={24} sx={{ color: darkMode ? '#000000' : '#ffffff' }} />
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </>
                        )}
                    </CollapsibleCard>

                    {/* Display Options */}
                    <CollapsibleCard title="Display Options" darkMode={darkMode} defaultExpanded={true}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showGrid}
                                    onChange={() => setShowGrid(!showGrid)}
                                    sx={{
                                        '& .MuiSwitch-thumb': {
                                            color: darkMode ? '#90caf9' : undefined,
                                        },
                                        '& .MuiSwitch-track': {
                                            backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.5)' : undefined,
                                        },
                                    }}
                                />
                            }
                            label="Show Grid"
                            sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}
                        />
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showEnvironment}
                                    onChange={() => setShowEnvironment(!showEnvironment)}
                                    sx={{
                                        '& .MuiSwitch-thumb': {
                                            color: darkMode ? '#90caf9' : undefined,
                                        },
                                        '& .MuiSwitch-track': {
                                            backgroundColor: darkMode ? 'rgba(144, 202, 249, 0.5)' : undefined,
                                        },
                                    }}
                                />
                            }
                            label="Show Environment"
                            sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}
                        />
                    </CollapsibleCard>

                    {/* Animations */}
                    {animations.length > 0 && (
                        <CollapsibleCard title="Animations" darkMode={darkMode} defaultExpanded={true}>
                            <Stack spacing={1}>
                                {animations.map((anim) => (
                                    <Button
                                        key={anim.name}
                                        variant={activeAnimation === anim.name ? 'contained' : 'outlined'}
                                        onClick={() => {
                                            setActiveAnimation(anim.name);
                                            setFormData((prev) => ({ ...prev, animationName: anim.name }));
                                        }}
                                        fullWidth
                                        sx={{
                                            color: darkMode && activeAnimation !== anim.name ? '#ffffff' : undefined,
                                            borderColor:
                                                darkMode && activeAnimation !== anim.name
                                                    ? 'rgba(255, 255, 255, 0.5)'
                                                    : undefined,
                                        }}
                                    >
                                        {anim.name}
                                    </Button>
                                ))}
                                {activeAnimation && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        onClick={() => {
                                            setActiveAnimation(null);
                                            setFormData((prev) => ({ ...prev, animationName: '' })); // Xóa animationName khỏi formData
                                        }}
                                        sx={{
                                            color: darkMode ? '#f48fb1' : undefined,
                                            borderColor: darkMode ? '#f48fb1' : undefined,
                                        }}
                                    >
                                        Stop Animation
                                    </Button>
                                )}
                            </Stack>
                        </CollapsibleCard>
                    )}

                    {meshes.length > 0 && (
                        <CollapsibleCard title="Mesh Controls" darkMode={darkMode} defaultExpanded={false}>
                            <Stack spacing={1}>
                                {meshes.map((mesh) => (
                                    <FormControlLabel
                                        key={mesh.name}
                                        control={
                                            <Switch
                                                checked={meshVisibility[mesh.name] ?? true} // Mặc định true nếu không có trong hiddenMeshes
                                                onChange={() => handleMeshVisibilityToggle(mesh.name)}
                                                sx={{
                                                    '& .MuiSwitch-thumb': {
                                                        color: darkMode ? '#90caf9' : undefined,
                                                    },
                                                    '& .MuiSwitch-track': {
                                                        backgroundColor: darkMode
                                                            ? 'rgba(144, 202, 249, 0.5)'
                                                            : undefined,
                                                    },
                                                }}
                                            />
                                        }
                                        label={mesh.name}
                                        sx={{
                                            color: darkMode ? '#ffffff' : 'text.primary',
                                            width: '100%',
                                            justifyContent: 'space-between',
                                            m: 0,
                                        }}
                                    />
                                ))}
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    sx={{ mt: 1 }}
                                    onClick={() => {
                                        // Reset all meshes to visible
                                        const resetVisibility = meshes.reduce((acc, mesh) => {
                                            acc[mesh.name] = true;
                                            return acc;
                                        }, {});
                                        setMeshVisibility(resetVisibility);
                                    }}
                                >
                                    Reset All Visibility
                                </Button>
                            </Stack>
                        </CollapsibleCard>
                    )}

                    {/* Model Info */}
                    <CollapsibleCard title="Model Information" darkMode={darkMode} defaultExpanded={false}>
                        <Typography variant="body2" sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                            Meshes: {meshes.length}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                            Triangles:{' '}
                            {meshes.reduce(
                                (total, mesh) => total + Math.floor(mesh.geometry.attributes.position.count / 3),
                                0,
                            )}
                        </Typography>
                        <Typography variant="body2" sx={{ color: darkMode ? '#ffffff' : 'text.primary' }}>
                            Animations: {animations.length}
                        </Typography>
                    </CollapsibleCard>
                </DraggablePanel>
            </Box>

            {/* View Mode Indicator */}
            {viewMode === 'default' && (
                <Paper
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        padding: 2,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                    }}
                >
                    <Typography variant="body2">
                        Default View Mode: Camera controls disabled. Use inputs to adjust model.
                    </Typography>
                </Paper>
            )}

            {viewMode === 'free' && (
                <Paper
                    sx={{
                        position: 'absolute',
                        bottom: 20,
                        left: 20,
                        padding: 2,
                        bgcolor: 'rgba(0,0,0,0.7)',
                        color: 'white',
                    }}
                >
                    <Typography variant="body2">
                        Free View Mode: Mouse drag to orbit, right-click to pan, scroll to zoom.
                    </Typography>
                </Paper>
            )}

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
        </Box>
    );
}
