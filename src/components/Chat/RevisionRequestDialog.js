import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Box,
    Typography,
    IconButton,
    Chip,
    Stack,
    FormHelperText,
} from '@mui/material';
import { X, Upload, FileText } from 'lucide-react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const RevisionRequestDialog = ({
    open,
    onClose,
    onSubmit,
    requestId,
    isAnyPriceProposedHaveBeenAccepted,
    isAnyRequestProcessing,
}) => {
    // State for form data
    const [type, setType] = useState('');
    const [description, setDescription] = useState('');
    const [priceProposal, setPriceProposal] = useState('');
    const [files, setFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    // Available revision request types
    const revisionTypes = [];

    if (isAnyPriceProposedHaveBeenAccepted) {
        revisionTypes.push({ value: 'Modification', label: 'Modification' });

        revisionTypes.push({ value: 'Additional Features', label: 'Additional Features' });

        revisionTypes.push({ value: 'Bug Fix', label: 'Bug Fix' });
    }
    if (!isAnyPriceProposedHaveBeenAccepted) {
        revisionTypes.push({ value: 'Price Proposal', label: 'Price Proposal' });
    }

    // Handle file selection
    const handleFileSelect = (event) => {
        const selectedFiles = Array.from(event.target.files);
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

    // Handle file removal
    const handleRemoveFile = (fileToRemove) => {
        setFiles(files.filter((file) => file !== fileToRemove));
    };

    // Reset form
    const resetForm = () => {
        setType('');
        setDescription('');
        setPriceProposal('');
        setFiles([]);
        setErrors({});
    };

    // Close dialog
    const handleClose = () => {
        resetForm();
        onClose();
    };

    // Validate form
    const validateForm = () => {
        const newErrors = {};

        if (!type) newErrors.type = 'Please select a revision type';
        if (!description) newErrors.description = 'Please provide a description';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit form
    const handleSubmit = async () => {
        if (!validateForm()) return;

        setSubmitting(true);

        try {
            // Create FormData to handle files
            const formData = new FormData();
            formData.append('type', type);
            formData.append('reason', description);

            // Add files to FormData
            files.forEach((file) => {
                formData.append('revisionFiles', file); // Note the nested path
            });
            // Call API to submit request (replace with your actual API call)
            await onSubmit(formData);

            // Close dialog and reset form on success
            handleClose();
        } catch (error) {
            console.error('Failed to submit revision request:', error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 2 },
            }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Create Revision Request
                <IconButton onClick={handleClose} size="small">
                    <X size={20} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={3} sx={{ pt: 1 }}>
                    {/* Type Selection */}
                    <FormControl fullWidth error={!!errors.type}>
                        <InputLabel id="revision-type-label">Revision Type</InputLabel>
                        <Select
                            labelId="revision-type-label"
                            value={type}
                            label="Revision Type"
                            onChange={(e) => setType(e.target.value)}
                        >
                            {revisionTypes.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                        {errors.type && <FormHelperText>{errors.type}</FormHelperText>}
                    </FormControl>

                    {/* Description */}
                    <FormControl fullWidth error={!!errors.description}>
                        <TextField
                            label="Description"
                            multiline
                            rows={4}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the revision request..."
                            error={!!errors.description}
                            helperText={errors.description}
                        />
                    </FormControl>

                    {/* File Upload */}
                    <Box>
                        <Typography variant="subtitle1" gutterBottom>
                            Attachments
                        </Typography>

                        <Box
                            sx={{
                                border: '2px dashed #ccc',
                                p: 3,
                                borderRadius: 2,
                                textAlign: 'center',
                                mb: 2,
                                backgroundColor: '#f8f9fa',
                            }}
                        >
                            <Button
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                sx={{ mb: 2 }}
                            >
                                Select Files
                                <input type="file" hidden multiple onChange={handleFileSelect} />
                            </Button>
                            <Typography variant="body2" color="text.secondary">
                                Upload multiple files of any type
                            </Typography>
                        </Box>

                        {/* File List */}
                        {files.length > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected Files ({files.length})
                                </Typography>
                                <Stack spacing={1}>
                                    {files.map((file, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1,
                                                borderRadius: 1,
                                                bgcolor: 'background.paper',
                                                border: '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <FileText size={16} />
                                                <Typography noWrap sx={{ maxWidth: '400px' }}>
                                                    {file.name}
                                                </Typography>
                                                <Chip
                                                    label={`${(file.size / 1024).toFixed(1)} KB`}
                                                    size="small"
                                                    sx={{ ml: 1 }}
                                                />
                                            </Box>
                                            <IconButton size="small" onClick={() => handleRemoveFile(file)}>
                                                <X size={16} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={handleClose} variant="outlined">
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting}
                    startIcon={<Upload size={16} />}
                >
                    {submitting ? 'Submitting...' : 'Submit Request'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default RevisionRequestDialog;
