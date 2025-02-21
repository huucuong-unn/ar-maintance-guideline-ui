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
import MyEditor from '~/components/MyEditor';
import InstructionAPI from '~/API/InstructionAPI';
import ModelAPI from '~/API/ModelAPI';

// ======================
// Mock Data
// ======================
// const mockModel = {
//     id: '3206416a-6cee-4fb9-8742-b3a97b8e0027',
//     title: 'Mock Mechanical Model',
//     description: 'A sample mechanical model for testing the UI.',
//     imageUrl: 'mechanic-gear.jpg', // Use your getImage() function to display
// };

const mockInstructions = [
    {
        id: 'e8e12a28-c3ca-4dbd-b733-e2931b164c05',
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

    // ==================== 2) Add Instruction Detail Dialog State ====================
    const [openAddDetail, setOpenAddDetail] = useState(false);
    const [isCreatingDetail, setIsCreatingDetail] = useState(false);

    // Fields for Add Instruction Detail
    const [selectedInstructionId, setSelectedInstructionId] = useState(null);

    // ==================== Fetch Model & Instructions (Mock) ====================
    useEffect(() => {
        fetchModel();
    }, [modelId]);

    const fetchModel = async () => {
        setIsLoadingModel(true);
        setIsLoadingInstructions(true);

        try {
            // Real API call
            const response = await ModelAPI.getById(modelId);
            console.log('Model:', response);
            if (response?.result) {
                setModel(response.result);
                setInstructions(response?.result?.instructionResponses); // Replace with actual API call
            } else {
                alert('Failed to fetch model. Please try again.');
            }
        } catch (error) {
            console.error('Failed to fetch model:', error);
            alert('Failed to fetch model. Please try again.');
        } finally {
            setIsLoadingModel(false);
            setIsLoadingInstructions(false);
        }
    };
    // ==================== Add Instruction Handlers (Mock) ====================

    const handleCloseAddInstruction = () => {
        setOpenAddInstruction(false);
    };

    // For Instruction (instead of separate states for code, name, etc.)
    const [newInstructionData, setNewInstructionData] = useState({
        code: '',
        name: '',
        description: '',
        imageUrl: null,
        guideViewPosition: {
            rotation: '',
            translation: '',
        },
        instructionDetailRequest: {
            description: '',
            multipartFile: null,
        },
    });

    const handleInstructionInputChange = (field, value) => {
        setNewInstructionData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // For Instruction Detail
    const [newDetailData, setNewDetailData] = useState({
        description: '',
        multipartFile: null,
    });

    const handleDetailInputChange = (field, value) => {
        setNewDetailData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleCreateInstruction = async () => {
        if (!newInstructionData.name.trim()) {
            return alert('Please enter a name.');
        }
        if (!newInstructionData.code.trim()) {
            return alert('Please enter a code.');
        }

        setIsCreatingInstruction(true);
        try {
            const formData = new FormData();
            formData.append('modelId', modelId); // Assuming your backend needs modelId
            formData.append('code', newInstructionData.code);
            formData.append('name', newInstructionData.name);
            formData.append('description', newInstructionData.description);
            formData.append('guidedViewPosition.rotation', newInstructionData.guidedViewPosition.rotation);
            formData.append('guidedViewPosition.translation', newInstructionData.guidedViewPosition.translation);
            formData.append('imageUrl', newInstructionData.imageUrl);
            formData.append(
                'instructionDetailRequest.description',
                newInstructionData.instructionDetailRequest.multipartFile,
            );
            formData.append(
                'instructionDetailRequest.multipartFile',
                newInstructionData.instructionDetailRequest.multipartFile,
            );
            // Real API call – ensure InstructionAPI.create is implemented correctly
            const response = await InstructionAPI.create(formData);
            if (response?.result) {
                setInstructions((prev) => [...prev, response.result]);
                alert('Instruction created successfully!');
            } else {
                alert('Failed to create instruction. Please try again.');
            }
            handleCloseAddInstruction();
        } catch (error) {
            console.error('Failed to create instruction:', error);
            alert('Failed to create instruction. Please try again.');
        } finally {
            setIsCreatingInstruction(false);
        }
    };

    // ==================== Add Instruction Detail Handlers (Mock) ====================
    const handleOpenAddInstruction = () => {
        setNewInstructionData({
            code: '',
            name: '',
            description: '',
            imageUrl: null,
            guideViewPosition: {
                rotation: '',
                translation: '',
            },
            instructionDetailRequest: {
                description: '',
                multipartFile: null,
            },
        });
        setOpenAddInstruction(true);
    };

    const handleOpenAddDetail = (instructionId) => {
        setSelectedInstructionId(instructionId);
        setNewDetailData({
            description: '',
            multipartFile: null,
        });
        setOpenAddDetail(true);
    };

    const handleCloseAddDetail = () => {
        setOpenAddDetail(false);
    };

    const handleCreateDetail = async () => {
        if (!selectedInstructionId) {
            return alert('No instruction selected.');
        }
        if (!newDetailData.description.trim()) {
            return alert('Please enter a description.');
        }

        setIsCreatingDetail(true);
        try {
            const formData = new FormData();
            formData.append('instructionId', selectedInstructionId);
            formData.append('description', newDetailData.description);
            if (newDetailData.multipartFile) {
                formData.append('multipartFile', newDetailData.multipartFile);
            }

            // Real API call – ensure InstructionAPI.createDetail is implemented correctly
            const response = await InstructionAPI.createDetail(formData);
            if (response?.result) {
                alert('Instruction Detail created successfully!');
                // Optionally update local state if needed
            } else {
                alert('Failed to create instruction detail. Please try again.');
            }
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
                    {model?.name || 'Model Title'}
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
                                {instruction.instructionDetailResponse &&
                                instruction.instructionDetailResponse.length > 0 ? (
                                    instruction.instructionDetailResponse
                                        .sort((a, b) => a.orderNumber - b.orderNumber)
                                        .map((instructionDetail) => (
                                            <Box key={instructionDetail.id}>
                                                <AccordionDetails>
                                                    <Typography sx={{ fontStyle: 'italic', mb: 1 }}>
                                                        {instructionDetail.description}
                                                    </Typography>
                                                </AccordionDetails>
                                                <Divider />
                                            </Box>
                                        ))
                                ) : (
                                    <Typography variant="body2" sx={{ my: 2 }}>
                                        No instruction details available.
                                    </Typography>
                                )}
                                {/* Button to Add Instruction Detail */}
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => handleOpenAddDetail(instruction.id)}
                                    sx={{
                                        my: 2,
                                        borderRadius: '24px',
                                        padding: '12px 20px',
                                        backgroundColor: '#48A6A7',
                                        ':hover': {
                                            backgroundColor: '#48A6A7',
                                            opacity: '0.8',
                                        },
                                    }}
                                >
                                    Add Detail
                                </Button>
                            </Accordion>
                        ))
                    )}
                    {/* Add Instruction Button */}
                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleOpenAddInstruction}
                        sx={{
                            mt: 4,
                            border: '2px dashed darkgrey',
                            padding: 2,
                            backgroundColor: '#f5f5f5',
                            boxShadow: 'none',
                            color: '#0f6cbf',
                            ':hover': {
                                backgroundColor: '#f5f5f5',
                                border: '2px solid #0f6cbf',
                                boxShadow: 'none',
                            },
                        }}
                    >
                        + Add Instruction
                    </Button>
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
                        label="Title"
                        value={newInstructionData.name}
                        onChange={(e) => handleInstructionInputChange('name', e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        required
                        label="Code"
                        value={newInstructionData.code}
                        onChange={(e) => handleInstructionInputChange('code', e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="Description"
                        multiline
                        minRows={2}
                        value={newInstructionData.description}
                        onChange={(e) => handleInstructionInputChange('description', e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="guidedViewPosition.rotation"
                        value={newInstructionData.rotation}
                        onChange={(e) => handleInstructionInputChange('guidedViewPosition.rotation', e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="guidedViewPosition.translation"
                        value={newInstructionData.translation}
                        onChange={(e) => handleInstructionInputChange('guidedViewPosition.translation', e.target.value)}
                    />

                    <TextField
                        fullWidth
                        margin="normal"
                        label="instructionDetailRequest.description"
                        value={newInstructionData.rotation}
                        onChange={(e) =>
                            handleInstructionInputChange('instructionDetailRequest.description', e.target.value)
                        }
                    />

                    {/* For iamge input */}
                    <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        id="instruction-image-upload"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                handleInstructionInputChange('instructionDetailRequest.imageUrl', e.target.files[0]);
                            }
                        }}
                    />
                    <label htmlFor="instruction-image-upload">
                        <Button
                            component="span"
                            fullWidth
                            variant="contained"
                            sx={{
                                border: '2px dashed darkgrey',
                                padding: 2,
                                backgroundColor: '#f5f5f5',
                                boxShadow: 'none',
                                color: '#0f6cbf',
                                ':hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '2px solid #0f6cbf',
                                    boxShadow: 'none',
                                },
                                mt: 2,
                            }}
                        >
                            {newInstructionData['instructionDetailRequest.imageUrl'] ? 'Change Image' : 'Attach Image'}
                        </Button>
                    </label>

                    {/* For file .glb input */}
                    <input
                        type="file"
                        accept=".glb"
                        style={{ display: 'none' }}
                        id="glb-upload"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                handleInstructionInputChange(
                                    'instructionDetailRequest.multipartFile',
                                    e.target.files[0],
                                );
                            }
                        }}
                    />
                    <label htmlFor="glb-upload">
                        <Button
                            component="span"
                            fullWidth
                            variant="contained"
                            sx={{
                                border: '2px dashed darkgrey',
                                padding: 2,
                                backgroundColor: '#f5f5f5',
                                boxShadow: 'none',
                                color: '#0f6cbf',
                                ':hover': {
                                    backgroundColor: '#f5f5f5',
                                    border: '2px solid #0f6cbf',
                                    boxShadow: 'none',
                                },
                                mt: 3,
                            }}
                        >
                            {newInstructionData['instructionDetailRequest.multipartFile']
                                ? 'Change .glb File'
                                : 'Attach .glb File'}
                        </Button>
                    </label>
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
                        value={newDetailData.description}
                        onChange={(e) => handleDetailInputChange('description', e.target.value)}
                    />

                    <input
                        type="file"
                        onChange={(e) => {
                            if (e.target.files[0]) {
                                handleDetailInputChange('multipartFile', e.target.files[0]);
                            }
                        }}
                    />
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
