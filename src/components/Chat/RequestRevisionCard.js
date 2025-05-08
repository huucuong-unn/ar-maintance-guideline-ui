import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    DialogContentText,
    TextField,
    CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import storageService from '~/components/StorageService/storageService';
import ModelEditor from '~/components/ModelEditor';
import RequestRevisionMedia from './RequestRevisionMedia';
import RequestRevisionActions from './RequestRevisionActions';
import { getImage } from '~/Constant';
import { useWallet } from '~/WalletContext';

const RequestRevisionCard = ({ request, fetchRevisionRequests }) => {
    const [file3D, setFile3D] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fullViewMode, setFullViewMode] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [modelName, setModelName] = useState('');
    const [modelDescription, setModelDescription] = useState('');
    const [price, setPrice] = useState({});
    const [rejectionReason, setRejectionReason] = useState('');

    const { currentPoints } = useWallet();
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const userRole = userInfo?.role.roleName || null;

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    // Update price for a specific request
    const updatePrice = (id, value) => {
        setPrice((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    // Handle 3D file selection
    const handle3DFileSelect = (e, requestRevisionId) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
            setSelectedRequestId(requestRevisionId);
            setOpenCreateDialog(true);
            setOpenEditor(true);
        }
    };

    // Close editor and refresh requests
    const handleCloseEditor = () => {
        setOpenEditor(false);
        setOpenCreateDialog(false);
        setFile3D(null);
        fetchRevisionRequests();
    };

    // Handle submission of proposal or price
    const handleSubmit = async (id, requestStatus, type) => {
        setIsSubmitting(true);

        try {
            let requestData = {};

            if (userRole === 'COMPANY' && requestStatus === 'PRICE PROPOSED') {
                if (currentPoints < parseInt(price[id], 10)) {
                    toast.error('Insufficient points to approve this price proposal.');
                    setIsSubmitting(false);
                    return;
                }
                requestData = {
                    id: id,
                    status: 'PROCESSING',
                };
            } else if (type === 'Bug Fix') {
                requestData = {
                    id: id,
                    status: 'PROCESSING',
                };
            } else if (type === 'Modification' || type === 'Additional Features') {
                requestData = {
                    id: id,
                    status: 'PRICE PROPOSED',
                    priceProposal: parseInt(price[id], 10),
                };
            } else {
                if (!price[id]) {
                    toast.error('Please provide a price before submitting.');
                    setIsSubmitting(false);
                    return;
                }

                requestData = {
                    id: id,
                    priceProposal: parseInt(price[id], 10),
                    status: 'PRICE PROPOSED',
                };
            }

            request.data = await CompanyRequestAPI.updateRequestRevision(id, requestData);

            if (userRole === 'COMPANY' && requestStatus === 'PRICE PROPOSED') {
                toast.success(`Price approved successfully! The request is now being processed.`);
            } else {
                toast.success(`Proposal for ${id} submitted successfully!`);
            }

            setPrice((prev) => ({ ...prev, [id]: '' }));
            fetchRevisionRequests();
        } catch (error) {
            console.error('Error submitting proposal:', error);
            toast.error(`Failed to submit proposal: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMediaType = (file) => {
        const ext = file.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg'].includes(ext)) return 'VIDEO';
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'IMAGE';
        if (ext === 'pdf') return 'PDF';
        if (['doc', 'docx'].includes(ext)) return 'DOCX';
        return 'UNKNOWN';
    };
    // Media overlay render
    const MediaOverlay = () => {
        if (!fullViewMode || !request.revisionFiles) return null;

        const currentMedia = request.revisionFiles[selectedImageIndex];
        const type = getMediaType(currentMedia);
        const mediaUrl = getImage(currentMedia);
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                            File {selectedImageIndex + 1} of {request.revisionFiles.length}
                        </h3>
                        <button
                            className="text-gray-500 hover:text-gray-700 flex items-center"
                            onClick={() => setFullViewMode(false)}
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="bg-gray-200 h-96 flex items-center justify-center rounded-lg mb-4 overflow-auto">
                        {type === 'IMAGE' && (
                            <img src={mediaUrl} alt="Revision Media" className="max-h-full max-w-full object-contain" />
                        )}

                        {type === 'VIDEO' && (
                            <video src={mediaUrl} controls className="max-h-full max-w-full rounded-lg" />
                        )}

                        {type === 'PDF' && (
                            <iframe src={mediaUrl} title="PDF Viewer" className="w-full h-full rounded-lg" />
                        )}

                        {type === 'DOCX' && (
                            <div className="text-center">
                                <p className="text-gray-700 mb-2">
                                    DOCX files are not previewable. Click below to download.
                                </p>
                                <a href={mediaUrl} download className="text-blue-600 hover:underline">
                                    Download Document
                                </a>
                            </div>
                        )}

                        {type === 'UNKNOWN' && <p className="text-red-500">Unsupported file type.</p>}
                    </div>

                    <div className="flex justify-between">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                            onClick={() => setSelectedImageIndex((prev) => Math.max(prev - 1, 0))}
                            disabled={selectedImageIndex === 0}
                        >
                            Previous
                        </button>
                        <button
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                            onClick={() =>
                                setSelectedImageIndex((prev) => Math.min(prev + 1, request.revisionFiles.length - 1))
                            }
                            disabled={selectedImageIndex === request.revisionFiles.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-md p-6">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center">
                            <h2 className="text-xl font-bold text-gray-800">{request.id.substring(0, 8)}</h2>
                            <span
                                className={`ml-3 px-2 py-1 text-xs ${
                                    request.status === 'PENDING'
                                        ? 'bg-blue-100 text-blue-800'
                                        : request.status === 'PRICE PROPOSED'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : request.status === 'PROCESSING'
                                        ? 'bg-purple-100 text-purple-800'
                                        : request.status === 'DELIVERED'
                                        ? 'bg-green-100 text-green-800'
                                        : request.status === 'APPROVED'
                                        ? 'bg-green-100 text-green-800'
                                        : request.status === 'REJECTED'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                                } rounded-full`}
                            >
                                {request.status.charAt(0).toUpperCase() + request.status.slice(1).toLowerCase()}
                            </span>
                        </div>
                        <p className="text-gray-700 mt-1">
                            Company Request ID: {request.companyRequestId.substring(0, 8)}
                        </p>
                        <p className="text-gray-700 mt-1">Request Type: {request.type}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        <div className="flex items-center justify-end">
                            <Calendar size={14} className="mr-1" />
                            <span>Created: {formatDate(request.createdDate)}</span>
                        </div>
                    </div>
                </div>
                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Column - Reason and Actions */}
                    <div className="md:col-span-1">
                        {/* Reason Display */}
                        {request.reason && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description:</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="4"
                                    value={request.reason || ''}
                                    disabled={true}
                                ></textarea>
                            </div>
                        )}

                        {/* Price Input */}
                        {request.type !== 'Bug Fix' &&
                            request.status !== 'DELIVERED' &&
                            request.status !== 'COMPLETED' &&
                            request.status !== 'REJECTED' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {userRole === 'COMPANY' && request.status === 'PRICE PROPOSED'
                                            ? 'Proposed Price:'
                                            : 'Propose Price:'}
                                    </label>
                                    <input
                                        type="number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={price[request.id] || request.priceProposal || ''}
                                        onChange={(e) => updatePrice(request.id, e.target.value)}
                                        disabled={
                                            request.status === 'COMPLETED' ||
                                            request.status === 'REJECTED' ||
                                            request.status === 'PRICE PROPOSED' ||
                                            request.status === 'PROCESSING' ||
                                            request.status === 'DELIVERED' ||
                                            userRole === 'COMPANY'
                                        }
                                    />
                                </div>
                            )}

                        {/* Action Buttons */}
                        <RequestRevisionActions
                            request={request}
                            isSubmitting={isSubmitting}
                            onSubmit={handleSubmit}
                            onOpenApproveDialog={() => setOpenApproveDialog(true)}
                            onOpenRejectDialog={() => setOpenRejectDialog(true)}
                            onReviewModel={() => setOpenReviewDialog(true)}
                            onHandle3DFileSelect={handle3DFileSelect}
                        />
                    </div>

                    {/* Right Column - Media */}
                    <div className="md:col-span-2">
                        <RequestRevisionMedia
                            revisionFiles={request.revisionFiles}
                            onOpenFullView={(index) => {
                                setFullViewMode(true);
                                setSelectedImageIndex(index);
                            }}
                        />
                    </div>
                </div>
                {/* Dialogs */}
                {/* Create/Upload Model Dialog */}
                <Dialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} fullWidth maxWidth="xl">
                    <DialogTitle>Create New Model</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        {file3D && (
                            <>
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    File: {file3D.name}
                                </Typography>
                                {openEditor && (
                                    <ModelEditor
                                        action={'UploadModelRequest'}
                                        modelFile3D={URL.createObjectURL(file3D)}
                                        modelFile3DToCreate={file3D}
                                        handleCloseModal={handleCloseEditor}
                                        requestId={selectedRequestId}
                                        isDisable={true}
                                    />
                                )}
                            </>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
                    </DialogActions>
                </Dialog>
                {/* Review Model Dialog */}
                <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)} fullWidth maxWidth="xl">
                    <DialogTitle>Review 3D Model</DialogTitle>
                    <DialogContent sx={{ minHeight: '80vh' }}>
                        {/* Assuming selectedRequestId is the current request's ID */}
                        <ModelEditor
                            action={'ReviewModel'}
                            requestId={request.id}
                            modelFile3D={getImage(request.modelFile)}
                            handleCloseModal={() => setOpenReviewDialog(false)}
                            isDisable={false}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenReviewDialog(false)}>Close</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openRejectDialog} onClose={() => setOpenRejectDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Reject Reuqest</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>Please provide a reason for request.</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Rejection Reason"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            inputProps={{ maxLength: 150 }}
                            helperText={`Max 150 characters`}
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenRejectDialog(false)} sx={{ color: 'gray' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!rejectionReason.trim()) {
                                    toast.error('Please provide a reason for rejection.');
                                    return;
                                }

                                const handleRejectSubmit = async () => {
                                    if (rejectionReason.length > 150) {
                                        toast.error('Rejection reason cannot exceed 150 characters.');
                                        return;
                                    }

                                    setIsSubmitting(true);
                                    try {
                                        const requestData = {
                                            id: request.id,
                                            status: 'REJECTED',
                                            userRejectId: userInfo.id,
                                            rejectionReason: rejectionReason,
                                        };

                                        await CompanyRequestAPI.updateRequestRevision(request.id, requestData);
                                        toast.success('Request rejected successfully.');
                                        setOpenRejectDialog(false);
                                        fetchRevisionRequests();
                                    } catch (error) {
                                        console.error('Error rejecting request:', error);
                                        toast.error(`Failed to reject request: ${error.message || 'Unknown error'}`);
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                };

                                handleRejectSubmit();
                            }}
                            variant="contained"
                            color="error"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Reject'}
                        </Button>
                    </DialogActions>
                </Dialog>
                {/* Approve Model Dialog */}
                <Dialog open={openApproveDialog} onClose={() => setOpenApproveDialog(false)} fullWidth maxWidth="sm">
                    <DialogTitle>Approve Model</DialogTitle>
                    <DialogContent>
                        <DialogContentText sx={{ mb: 2 }}>
                            Please provide a name and description for this model.
                        </DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Model Name"
                            type="text"
                            fullWidth
                            value={modelName}
                            onChange={(e) => setModelName(e.target.value)}
                            variant="outlined"
                            sx={{ mb: 2 }}
                            required
                        />
                        <TextField
                            margin="dense"
                            label="Model Description"
                            type="text"
                            fullWidth
                            multiline
                            rows={4}
                            value={modelDescription}
                            onChange={(e) => setModelDescription(e.target.value)}
                            variant="outlined"
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenApproveDialog(false)} sx={{ color: 'gray' }}>
                            Cancel
                        </Button>
                        <Button
                            onClick={() => {
                                if (!modelName.trim()) {
                                    toast.error('Please provide a model name.');
                                    return;
                                }

                                const handleApproveSubmit = async () => {
                                    setIsSubmitting(true);
                                    try {
                                        const requestData = {
                                            id: request.id,
                                            status: 'APPROVED',
                                            modelName: modelName,
                                            description: modelDescription,
                                        };

                                        await CompanyRequestAPI.updateRequestRevision(request.id, requestData);
                                        toast.success('Model approved successfully!');
                                        setOpenApproveDialog(false);
                                        fetchRevisionRequests();
                                    } catch (error) {
                                        console.error('Error approving model:', error);
                                        toast.error(`Failed to approve model: ${error.message || 'Unknown error'}`);
                                    } finally {
                                        setIsSubmitting(false);
                                    }
                                };

                                handleApproveSubmit();
                            }}
                            variant="contained"
                            color="success"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <CircularProgress size={24} /> : 'Approve'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>

            {/* Media Overlay */}
            {fullViewMode && <MediaOverlay />}
        </>
    );
};

export default RequestRevisionCard;
