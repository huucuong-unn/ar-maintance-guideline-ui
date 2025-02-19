import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    Tab,
    TextField,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { getImage } from '~/Constant';

// ======================
// Mock Data
// ======================
const mockModel = {
    id: '3206416a-6cee-4fb9-8742-b3a97b8e0027',
    title: 'Mock Mechanical Model',
    description: 'A sample mechanical model for testing the UI.',
    imageUrl: 'mechanic-gear.jpg', // Use your getImage() function to display
};

const mockInstructions = [
    {
        id: 'instr-1',
        code: 'IC2000',
        name: 'How to open model?',
        description: 'Description for opening the model.',
        guidedViewPosition: {
            rotation: '0,0,0',
            translation: '1,1,1',
        },
    },
    {
        id: 'instr-2',
        code: 'IC3000',
        name: 'Assemble the gear',
        description: 'Step-by-step instructions for gear assembly.',
        guidedViewPosition: {
            rotation: '10,10,10',
            translation: '2,2,2',
        },
    },
];

export default function ModelDetail() {
    const { id: modelId } = useParams();

    // ==================== Model & Instructions State ====================
    const [model, setModel] = useState(null);
    const [instructions, setInstructions] = useState([]);
    const [isLoadingModel, setIsLoadingModel] = useState(true);
    const [isLoadingInstructions, setIsLoadingInstructions] = useState(true);

    // ==================== Tab State ====================
    const [tabValue, setTabValue] = useState('1');
    const handleTabChange = (e, newValue) => setTabValue(newValue);

    // ==================== 1) Add Instruction Dialog State ====================
    const [openAddInstruction, setOpenAddInstruction] = useState(false);
    const [isCreatingInstruction, setIsCreatingInstruction] = useState(false);

    // Fields for Add Instruction
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [rotation, setRotation] = useState(''); // guidedViewPosition.rotation
    const [translation, setTranslation] = useState(''); // guidedViewPosition.translation
    const [multipartFile, setMultipartFile] = useState(null); // actual file

    // ==================== 2) Add Instruction Detail Dialog State ====================
    const [openAddDetail, setOpenAddDetail] = useState(false);
    const [isCreatingDetail, setIsCreatingDetail] = useState(false);

    // Fields for Add Instruction Detail
    const [selectedInstructionId, setSelectedInstructionId] = useState(null);
    const [detailDescription, setDetailDescription] = useState('');
    const [detailFile, setDetailFile] = useState(null);

    // ==================== Fetch Model & Instructions (Mock) ====================
    useEffect(() => {
        // Simulate fetch
        setIsLoadingModel(true);
        setTimeout(() => {
            // Instead of real API call:
            // const response = await ModelAPI.getById(modelId);
            setModel(mockModel);
            setIsLoadingModel(false);
        }, 1000);

        setIsLoadingInstructions(true);
        setTimeout(() => {
            // Instead of real API call:
            // const response = await InstructionAPI.getByModelId(modelId);
            setInstructions(mockInstructions);
            setIsLoadingInstructions(false);
        }, 1000);
    }, [modelId]);

    // ==================== Add Instruction Handlers (Mock) ====================
    const handleOpenAddInstruction = () => {
        setCode('');
        setName('');
        setDescription('');
        setRotation('');
        setTranslation('');
        setMultipartFile(null);
        setOpenAddInstruction(true);
    };

    const handleCloseAddInstruction = () => {
        setOpenAddInstruction(false);
    };

    const handleFileSelect = (e) => {
        if (e.target.files[0]) {
            setMultipartFile(e.target.files[0]);
        }
    };

    const handleCreateInstruction = async () => {
        if (!name.trim()) {
            return alert('Please enter a name.');
        }
        if (!code.trim()) {
            return alert('Please enter a code.');
        }

        setIsCreatingInstruction(true);
        try {
            // Instead of real API call:
            // await InstructionAPI.create(formData);

            // Mock create
            const newInstruction = {
                id: `instr-mock-${Date.now()}`, // random ID
                code,
                name,
                description,
                guidedViewPosition: {
                    rotation,
                    translation,
                },
            };

            // If you have a file
            if (multipartFile) {
                console.log('Selected file:', multipartFile.name);
            }

            // Update local state
            setInstructions((prev) => [...prev, newInstruction]);

            alert('Instruction created (mock) successfully!');
            handleCloseAddInstruction();
        } catch (error) {
            console.error('Failed to create instruction:', error);
            alert('Failed to create instruction. Please try again.');
        } finally {
            setIsCreatingInstruction(false);
        }
    };

    // ==================== Add Instruction Detail Handlers (Mock) ====================
    const handleOpenAddDetail = (instructionId) => {
        setSelectedInstructionId(instructionId);
        setDetailDescription('');
        setDetailFile(null);
        setOpenAddDetail(true);
    };

    const handleCloseAddDetail = () => {
        setOpenAddDetail(false);
    };

    const handleDetailFileSelect = (e) => {
        if (e.target.files[0]) {
            setDetailFile(e.target.files[0]);
        }
    };

    const handleCreateDetail = async () => {
        if (!selectedInstructionId) {
            return alert('No instruction selected.');
        }
        if (!detailDescription.trim()) {
            return alert('Please enter a description.');
        }

        setIsCreatingDetail(true);
        try {
            // Instead of real API call:
            // await InstructionDetailAPI.create(formData);

            // Mock create
            console.log('Creating instruction detail (mock)...');
            console.log('Instruction ID:', selectedInstructionId);
            console.log('Description:', detailDescription);
            if (detailFile) {
                console.log('Selected file for detail:', detailFile.name);
            }

            alert('Instruction Detail created (mock) successfully!');
            handleCloseAddDetail();
        } catch (error) {
            console.error('Failed to create instruction detail:', error);
            alert('Failed to create instruction detail. Please try again.');
        } finally {
            setIsCreatingDetail(false);
        }
    };

    // ==================== Render ====================
    return (
        <Box sx={{ minHeight: '100vh', padding: 4 }}>
            {/* Background Box */}
            <Box
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${getImage(model?.imageUrl)})`,
                    borderRadius: 4,
                    padding: 4,
                    mb: 4,
                }}
            >
                <Typography variant="h4" sx={{ fontWeight: 900, fontSize: 46, color: '#051D40', mb: 2 }}>
                    {model?.title || 'Model Title'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#051D40' }}>
                    {model?.description || 'No description available.'}
                </Typography>
            </Box>

            {/* Only one tab – "Instruction" */}
            <TabContext value={tabValue}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <TabList onChange={handleTabChange}>
                        <Tab label="Instruction" value="1" />
                    </TabList>
                </Box>

                <TabPanel value="1">
                    {/* Add Instruction Button */}
                    <Button variant="contained" onClick={handleOpenAddInstruction} sx={{ mb: 2 }}>
                        + Add Instruction
                    </Button>

                    {isLoadingInstructions ? (
                        <CircularProgress />
                    ) : instructions.length === 0 ? (
                        <Typography>No instructions available. Please add an instruction.</Typography>
                    ) : (
                        instructions.map((instruction) => (
                            <Accordion key={instruction.id} sx={{ mb: 2 }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Typography fontSize={20} fontWeight={700}>
                                        {instruction.name} ({instruction.code})
                                    </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <Typography sx={{ fontStyle: 'italic', mb: 1 }}>
                                        {instruction.description}
                                    </Typography>

                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Rotation: {instruction.guidedViewPosition?.rotation}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 2 }}>
                                        Translation: {instruction.guidedViewPosition?.translation}
                                    </Typography>

                                    {/* Button to Add Instruction Detail */}
                                    <Button
                                        variant="outlined"
                                        size="small"
                                        onClick={() => handleOpenAddDetail(instruction.id)}
                                    >
                                        Add Detail
                                    </Button>
                                </AccordionDetails>
                            </Accordion>
                        ))
                    )}
                </TabPanel>
            </TabContext>

            {/* ==================== Add Instruction Dialog (Mock) ==================== */}
            <Dialog open={openAddInstruction} onClose={handleCloseAddInstruction} fullWidth maxWidth="sm">
                <DialogTitle>Add Instruction</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please fill out the form to create a new instruction (mock).
                    </DialogContentText>

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="guidedViewPosition.rotation"
                        value={rotation}
                        onChange={(e) => setRotation(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="guidedViewPosition.translation"
                        value={translation}
                        onChange={(e) => setTranslation(e.target.value)}
                    />

                    <Typography sx={{ mt: 2 }}>Upload File (Optional)</Typography>
                    <input type="file" accept="image/*" onChange={handleFileSelect} />
                    {multipartFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {multipartFile.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddInstruction} disabled={isCreatingInstruction}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateInstruction} disabled={isCreatingInstruction}>
                        {isCreatingInstruction ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ==================== Add Instruction Detail Dialog (Mock) ==================== */}
            <Dialog open={openAddDetail} onClose={handleCloseAddDetail} fullWidth maxWidth="sm">
                <DialogTitle>Add Instruction Detail</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Provide a description and optionally upload a file (mock).
                    </DialogContentText>

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={detailDescription}
                        onChange={(e) => setDetailDescription(e.target.value)}
                    />

                    <Typography sx={{ mt: 2 }}>Upload File (Optional)</Typography>
                    <input type="file" onChange={handleDetailFileSelect} />
                    {detailFile && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {detailFile.name}
                        </Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDetail} disabled={isCreatingDetail}>
                        Cancel
                    </Button>
                    <Button onClick={handleCreateDetail} disabled={isCreatingDetail}>
                        {isCreatingDetail ? <CircularProgress size={24} /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
