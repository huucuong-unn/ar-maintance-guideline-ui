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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import MinimizeIcon from '@mui/icons-material/Minimize';
import SettingsIcon from '@mui/icons-material/Settings';

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
function DraggablePanel({ children, darkMode, position, onPositionChange, minimized, onMinimizeToggle }) {
    const panelRef = useRef(null);
    const headerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (headerRef.current && headerRef.current.contains(e.target)) {
            setIsDragging(true);
            const rect = panelRef.current.getBoundingClientRect();
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
            });
        }
    };

    const handleMouseMove = (e) => {
        if (isDragging && panelRef.current) {
            const newLeft = e.clientX - dragOffset.x;
            const newTop = e.clientY - dragOffset.y;

            // Make sure panel stays within viewport
            const maxX = window.innerWidth - panelRef.current.offsetWidth;
            const maxY = window.innerHeight - panelRef.current.offsetHeight;

            const clampedLeft = Math.max(0, Math.min(newLeft, maxX));
            const clampedTop = Math.max(0, Math.min(newTop, maxY));

            onPositionChange({ left: clampedLeft, top: clampedTop });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    useEffect(() => {
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging]);

    return (
        <Paper
            ref={panelRef}
            elevation={5}
            onMouseDown={handleMouseDown}
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
                height: minimized ? 'auto' : 'auto',
                maxHeight: minimized ? 'auto' : 'calc(100vh - 100px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <DraggablePanelHeader ref={headerRef}>
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

export default function SimplifiedModelViewer({ model }) {
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

    // UI states
    const [showGrid, setShowGrid] = useState(true);
    const [showEnvironment, setShowEnvironment] = useState(true);
    const [darkMode, setDarkMode] = useState(true);

    // Panel states
    const [panelPosition, setPanelPosition] = useState({ left: 20, top: 80 });
    const [panelMinimized, setPanelMinimized] = useState(false);

    const handleMeshVisibilityToggle = (meshName) => {
        setMeshVisibility((prev) => ({
            ...prev,
            [meshName]: !prev[meshName],
        }));
    };

    // Initialize mesh visibility when meshes are loaded
    useEffect(() => {
        const initialVisibility = meshes.reduce((acc, mesh) => {
            acc[mesh.name] = true;
            return acc;
        }, {});
        setMeshVisibility(initialVisibility);
    }, [meshes]);

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
                                model={model}
                            />
                        </Suspense>
                    </Canvas>
                </Box>

                {/* Draggable Control Panel */}
                <DraggablePanel
                    darkMode={darkMode}
                    position={panelPosition}
                    onPositionChange={setPanelPosition}
                    minimized={panelMinimized}
                    onMinimizeToggle={() => setPanelMinimized(!panelMinimized)}
                >
                    {/* Transform Controls */}
                    <CollapsibleCard title="Transform Controls" darkMode={darkMode} defaultExpanded={true}>
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
                            onClick={() =>
                                alert(
                                    `Position: ${modelTransform.position}\nRotation: ${modelTransform.rotation}\nScale: ${modelTransform.scale}`,
                                )
                            }
                        >
                            Save changes
                        </Button>
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
                                        onClick={() => setActiveAnimation(anim.name)}
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
                                        onClick={() => setActiveAnimation(null)}
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
                                                checked={meshVisibility[mesh.name] ?? true}
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
        </Box>
    );
}
