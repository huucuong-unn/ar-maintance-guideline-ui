import React, { useState } from 'react';
import {
    ImageIcon,
    DollarSign,
    Send,
    Info,
    CheckCircle,
    AlertCircle,
    Paperclip,
    Calendar,
    Clock,
    User,
    ThumbsUp,
    Eye,
    Check,
    X,
} from 'lucide-react';
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    Typography,
    TextField,
    Autocomplete,
} from '@mui/material';
import { getImage } from '~/Constant';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import storageService from '~/components/StorageService/storageService';
import { toast } from 'react-toastify';
import ModelEditor from '~/components/ModelEditor';
import CloudUpload from '@mui/icons-material/CloudUpload';
import { useWallet } from '~/WalletContext';

// Modified to accept props with the new data structure
const RequestRevisionList = ({ revisionRequests = [], fetchRevisionRequests }) => {
    const [activeRequest, setActiveRequest] = useState(0);
    const [price, setPrice] = useState({});
    const [reason, setReason] = useState({});
    const [fullViewMode, setFullViewMode] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [openRejectDialog, setOpenRejectDialog] = useState(false);
    const [openApproveDialog, setOpenApproveDialog] = useState(false);
    const { currentPoints, fetchWallet } = useWallet();
    const [rejectRequestId, setRejectRequestId] = useState(null);
    const [approveRequestId, setApproveRequestId] = useState(null);
    const [modelName, setModelName] = useState('');
    const [modelDescription, setModelDescription] = useState('');

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setOpenEditor(false);
    };

    const userInfo = storageService.getItem('userInfo')?.user || null; // Get current user info
    const userRole = userInfo?.role.roleName || null; // Get user role

    const [file3D, setFile3D] = useState(null);
    const [selectedRequestId, setSelectedRequestId] = useState(null);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditor, setOpenEditor] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [openReviewDialog, setOpenReviewDialog] = useState(false);
    const [reviewRequestId, setReviewRequestId] = useState(null);

    const handleApproveSubmit = async () => {
        if (!modelName.trim()) {
            toast.error('Please provide a model name.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create request object according to the DTO structure
            const requestData = {
                id: approveRequestId,
                status: 'APPROVED',
                modelName: modelName,
                description: modelDescription,
            };

            // Call the API to update the request revision
            await CompanyRequestAPI.updateRequestRevision(approveRequestId, requestData);

            // Show success message
            toast.success(`Model approved successfully!`);

            // Close the dialog
            handleCloseApproveDialog();

            // Refresh the data
            fetchRevisionRequests();
        } catch (error) {
            console.error('Error approving model:', error);
            toast.error(`Failed to approve model: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenApproveDialog = (requestId) => {
        setApproveRequestId(requestId);
        setModelName('');
        setModelDescription('');
        setOpenApproveDialog(true);
    };

    const handleCloseApproveDialog = () => {
        setOpenApproveDialog(false);
        setApproveRequestId(null);
        setModelName('');
        setModelDescription('');
    };

    const handle3DFileSelect = (e, requestRevisionId) => {
        if (e.target.files[0]) {
            setFile3D(e.target.files[0]);
            setSelectedRequestId(requestRevisionId);
            setOpenCreateDialog(true);
            setOpenEditor(true);
        }
    };

    const handleCloseEditor = () => {
        setOpenEditor(false);
        setOpenCreateDialog(false);
        setFile3D(null);
        fetchRevisionRequests();
    };

    const handleReviewModel = (requestId) => {
        // Set the request ID for review
        setReviewRequestId(requestId);
        // Open the review dialog
        setOpenReviewDialog(true);
    };

    const handleCloseReviewDialog = () => {
        setOpenReviewDialog(false);
        setReviewRequestId(null);
    };

    const handleOpenRejectDialog = (requestId) => {
        setRejectRequestId(requestId);
        setRejectionReason('');
        setOpenRejectDialog(true);
    };

    const handleCloseRejectDialog = () => {
        setOpenRejectDialog(false);
        setRejectRequestId(null);
        setRejectionReason('');
    };

    const handleRejectSubmit = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please provide a reason for rejection.');
            return;
        }

        setIsSubmitting(true);

        try {
            // Create request object according to the DTO structure
            const requestData = {
                id: rejectRequestId,
                status: 'REJECTED',
                rejectionReason: rejectionReason,
            };

            // Call the API to update the request revision
            await CompanyRequestAPI.updateRequestRevision(rejectRequestId, requestData);

            // Show success message
            toast.success(`Request rejected successfully.`);

            // Close the dialog
            handleCloseRejectDialog();

            // Refresh the data
            fetchRevisionRequests();
        } catch (error) {
            console.error('Error rejecting request:', error);
            toast.error(`Failed to reject request: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleApproveModel = async (requestId) => {
        setIsSubmitting(true);

        try {
            // Create request object according to the DTO structure
            const requestData = {
                id: requestId,
                status: 'COMPLETED',
            };

            // Call the API to update the request revision
            await CompanyRequestAPI.updateRequestRevision(requestId, requestData);

            // Show success message
            toast.success(`Model approved successfully!`);

            // Refresh the data
            fetchRevisionRequests();
        } catch (error) {
            console.error('Error approving model:', error);
            toast.error(`Failed to approve model: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // If no requests are passed, show empty state
    if (!revisionRequests || revisionRequests.length === 0) {
        return (
            <div className="min-h-screen bg-gray-100 p-6">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Design Request Dashboard</h1>
                        <p className="text-gray-600">No revision requests available</p>
                    </header>
                </div>
            </div>
        );
    }

    const handleSubmit = async (id, requestStatus) => {
        setIsSubmitting(true);

        try {
            // Create request object according to the DTO structure
            let requestData = {};
            console.log(currentPoints + ' currentPoints');
            console.log(price[id] + ' price[id]');

            if (userRole === 'COMPANY' && requestStatus === 'PRICE PROPOSED') {
                if (currentPoints < parseInt(price[id], 10)) {
                    toast.error('Insufficient points to approve this price proposal.');
                    return;
                }
                // For company user approving the price
                requestData = {
                    id: id,
                    status: 'PROCESSING',
                };
            } else {
                // For designer proposing a price
                if (!price[id]) {
                    toast.success('Please provide a price before submitting.');
                    setIsSubmitting(false);
                    return;
                }

                requestData = {
                    id: id,
                    priceProposal: parseInt(price[id], 10),
                    status: 'PRICE PROPOSED',
                };
            }

            // Call the API to update the request revision
            const response = await CompanyRequestAPI.updateRequestRevision(id, requestData);

            // Show success message
            if (userRole === 'COMPANY' && requestStatus === 'PRICE PROPOSED') {
                toast.success(`Price approved successfully! The request is now being processed.`);
            } else {
                toast.success(`Proposal for ${id} submitted successfully!`);
            }

            // Reset form fields after submission
            setPrice((prev) => {
                const newPrice = { ...prev };
                newPrice[id] = '';
                return newPrice;
            });

            setReason((prev) => {
                const newReason = { ...prev };
                newReason[id] = '';
                return newReason;
            });
            fetchRevisionRequests();
        } catch (error) {
            console.error('Error submitting proposal:', error);
            toast.error(`Failed to submit proposal: ${error.message || 'Unknown error'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const openFullView = (requestId, imageIndex) => {
        setFullViewMode(true);
        setSelectedImage({ requestId, imageIndex });
    };

    const closeFullView = () => {
        setFullViewMode(false);
        setSelectedImage(null);
    };

    const updatePrice = (id, value) => {
        setPrice((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const updateReason = (id, value) => {
        setReason((prev) => ({
            ...prev,
            [id]: value,
        }));
    };

    const getMediaType = (file) => {
        const fileExtension = file.split('.').pop().toLowerCase();
        if (['mp4', 'webm', 'ogg'].includes(fileExtension)) {
            return 'VIDEO';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
            return 'IMAGE';
        }
        return 'UNKNOWN';
    };

    // Helper function to get file count
    const getFileCount = (request) => {
        if (!request.revisionFiles) return 0;
        return Array.isArray(request.revisionFiles) ? request.revisionFiles.length : 0;
    };

    // Media overlay for full view
    const MediaOverlay = () => {
        if (!selectedImage) return null;

        const { requestId, imageIndex } = selectedImage;
        const request = revisionRequests.find((req) => req.id === requestId);

        if (
            !request ||
            !request.revisionFiles ||
            !Array.isArray(request.revisionFiles) ||
            request.revisionFiles.length === 0
        ) {
            return null;
        }
        const mediaType = getMediaType(request.revisionFiles[imageIndex]);

        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-4xl w-full">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">
                            Image {imageIndex + 1} of {request.revisionFiles.length}
                        </h3>
                        <button className="text-gray-500 hover:text-gray-700" onClick={closeFullView}>
                            Close
                        </button>
                    </div>

                    <div
                        className="bg-gray-200 h-96 flex items-center justify-center rounded-lg mb-4"
                        style={{ marginTop: '50px', marginBottom: '30px' }}
                    >
                        <div className="flex flex-col items-center justify-center">
                            {mediaType === 'IMAGE' && (
                                <img
                                    height={'10%'}
                                    width={'100%'}
                                    src={getImage(request.revisionFiles[imageIndex])}
                                    alt="Revision Media"
                                />
                            )}
                            {mediaType === 'VIDEO' && (
                                <video
                                    height={'100%'}
                                    width={'100%'}
                                    controls
                                    src={getImage(request.revisionFiles[imageIndex])}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            )}
                            {mediaType === 'UNKNOWN' && <p className="text-gray-500">Unsupported media type</p>}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                            onClick={() => {
                                if (imageIndex > 0) {
                                    setSelectedImage({ ...selectedImage, imageIndex: imageIndex - 1 });
                                }
                            }}
                            disabled={imageIndex === 0}
                        >
                            Previous
                        </button>
                        <button
                            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                            onClick={() => {
                                if (imageIndex < request.revisionFiles.length - 1) {
                                    setSelectedImage({ ...selectedImage, imageIndex: imageIndex + 1 });
                                }
                            }}
                            disabled={imageIndex === request.revisionFiles.length - 1}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';

        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Design Request Dashboard</h1>
                    <p className="text-gray-600">Review requests and propose pricing</p>
                </header>

                <div className="space-y-6">
                    {revisionRequests.map((request) => (
                        <div key={request.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="flex items-center">
                                        <h2 className="text-xl font-bold text-gray-800">
                                            {request.id.substring(0, 8)}
                                        </h2>
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
                                                    : request.status === 'COMPLETED'
                                                    ? 'bg-emerald-100 text-emerald-800'
                                                    : request.status === 'REJECTED'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            } rounded-full`}
                                        >
                                            {request.status || 'pending'}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 mt-1">
                                        Company Request ID: {request.companyRequestId.substring(0, 8)}
                                    </p>
                                </div>
                                <div className="text-right text-sm text-gray-600">
                                    <div className="flex items-center justify-end">
                                        <Calendar size={14} className="mr-1" />
                                        <span>Created: {formatDate(request.createdDate)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="md:col-span-1">
                                    <div className="space-y-4">
                                        {request.reason && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Reason:
                                                </label>
                                                <textarea
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    rows="4"
                                                    value={request.reason || ''}
                                                    disabled={true}
                                                ></textarea>
                                            </div>
                                        )}

                                        {request.status !== 'DELIVERED' &&
                                            request.status !== 'COMPLETED' &&
                                            request.status !== 'REJECTED' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {userRole === 'COMPANY' && request.status === 'PRICE PROPOSED'
                                                            ? 'Proposed Price:'
                                                            : 'Propose Price:'}
                                                    </label>
                                                    <div className="relative">
                                                        <input
                                                            type="number"
                                                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="0.00"
                                                            value={price[request.id] || request.priceProposal || ''}
                                                            onChange={(e) => updatePrice(request.id, e.target.value)}
                                                            disabled={
                                                                request.status === 'COMPLETED' ||
                                                                request.status === 'REJECTED' ||
                                                                request.status === 'PRICE PROPOSED' ||
                                                                request.status === 'PROCESSING' ||
                                                                request.status === 'DELIVERED' ||
                                                                (userRole === 'COMPANY' &&
                                                                    request.status === 'PRICE PROPOSED')
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                        {/* For designer to submit price proposal */}
                                        {userRole !== 'COMPANY' &&
                                            request.status !== 'COMPLETED' &&
                                            request.status !== 'REJECTED' &&
                                            request.status !== 'PRICE PROPOSED' &&
                                            request.status !== 'PROCESSING' &&
                                            request.status !== 'DELIVERED' && (
                                                <button
                                                    className={`w-full flex items-center justify-center ${
                                                        isSubmitting
                                                            ? 'bg-blue-400 cursor-not-allowed'
                                                            : 'bg-blue-600 hover:bg-blue-700'
                                                    } text-white py-2 px-4 rounded-md transition duration-200`}
                                                    onClick={() => handleSubmit(request.id, request.status)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? (
                                                        <>Processing...</>
                                                    ) : (
                                                        <>
                                                            <Send size={16} className="mr-2" />
                                                            Submit Proposal
                                                        </>
                                                    )}
                                                </button>
                                            )}

                                        {/* For company to approve price */}
                                        {userRole === 'COMPANY' && request.status === 'PRICE PROPOSED' && (
                                            <button
                                                className={`w-full flex items-center justify-center ${
                                                    isSubmitting
                                                        ? 'bg-green-400 cursor-not-allowed'
                                                        : 'bg-green-600 hover:bg-green-700'
                                                } text-white py-2 px-4 rounded-md transition duration-200`}
                                                onClick={() => handleSubmit(request.id, request.status)}
                                                disabled={isSubmitting}
                                            >
                                                {isSubmitting ? (
                                                    <>Processing...</>
                                                ) : (
                                                    <>
                                                        <ThumbsUp size={16} className="mr-2" />
                                                        Approve Price
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        {request.status === 'DELIVERED' && (
                                            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                                                <div className="flex items-start">
                                                    <CheckCircle size={16} className="text-green-500 mr-2 mt-1" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-green-800">
                                                            Delivered
                                                        </h4>
                                                        <p className="text-sm text-green-700">
                                                            The 3D model has been delivered and is ready for review.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {/* For DELIVERED status - Action buttons */}
                                        {request.status === 'DELIVERED' && userRole === 'COMPANY' && (
                                            <div className="space-y-3">
                                                {/* Review Model button */}
                                                <button
                                                    className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                                                    onClick={() => handleReviewModel(request.id)}
                                                >
                                                    <Eye size={16} className="mr-2" />
                                                    Review Model
                                                </button>

                                                {/* Approve Model button */}
                                                <button
                                                    className={`w-full flex items-center justify-center ${
                                                        isSubmitting
                                                            ? 'bg-green-400 cursor-not-allowed'
                                                            : 'bg-green-600 hover:bg-green-700'
                                                    } text-white py-2 px-4 rounded-md transition duration-200`}
                                                    onClick={() => handleOpenApproveDialog(request.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    <Check size={16} className="mr-2" />
                                                    Approve Model
                                                </button>

                                                {/* Reject Model button */}
                                                <button
                                                    className={`w-full flex items-center justify-center ${
                                                        isSubmitting
                                                            ? 'bg-red-400 cursor-not-allowed'
                                                            : 'bg-red-600 hover:bg-red-700'
                                                    } text-white py-2 px-4 rounded-md transition duration-200`}
                                                    onClick={() => handleOpenRejectDialog(request.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    <X size={16} className="mr-2" />
                                                    Reject Model
                                                </button>
                                            </div>
                                        )}

                                        {request.status === 'PRICE PROPOSED' && userRole !== 'COMPANY' && (
                                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                <div className="flex items-start">
                                                    <Info size={16} className="text-yellow-500 mr-2 mt-1" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-yellow-800">
                                                            Price Proposed
                                                        </h4>
                                                        <p className="text-sm text-yellow-700">
                                                            Your price proposal of ${request.priceProposal} has been
                                                            submitted and is awaiting review.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {request.status === 'PROCESSING' && (
                                            <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-md">
                                                <div className="flex items-start">
                                                    <Info size={16} className="text-purple-500 mr-2 mt-1" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-purple-800">
                                                            In Progress
                                                        </h4>
                                                        <p className="text-sm text-purple-700">
                                                            The price of ${request.priceProposal} has been approved and
                                                            the request is being processed.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Improved Button with better styling */}
                                                {userRole !== 'COMPANY' && (
                                                    <div className="mt-3">
                                                        <Button
                                                            variant="contained"
                                                            component="label"
                                                            startIcon={<CloudUpload />}
                                                            sx={{
                                                                mt: 2,
                                                                bgcolor: '#4338ca', // Deeper indigo color
                                                                color: 'white',
                                                                textTransform: 'none',
                                                                fontWeight: 500,
                                                                padding: '8px 16px',
                                                                borderRadius: '8px',
                                                                boxShadow: '0 4px 6px rgba(67, 56, 202, 0.12)',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    bgcolor: '#3730a3', // Darker on hover
                                                                    boxShadow: '0 6px 10px rgba(67, 56, 202, 0.18)',
                                                                    transform: 'translateY(-1px)',
                                                                },
                                                                '&:active': {
                                                                    transform: 'translateY(0)',
                                                                },
                                                            }}
                                                        >
                                                            Upload 3D Model
                                                            <input
                                                                type="file"
                                                                hidden
                                                                accept=".glb,.gltf"
                                                                onChange={(e) => handle3DFileSelect(e, request.id)}
                                                                disabled={isSubmitting}
                                                            />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {request.status === 'COMPLETED' && (
                                            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                                                <div className="flex items-start">
                                                    <CheckCircle size={16} className="text-emerald-500 mr-2 mt-1" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-emerald-800">
                                                            Completed
                                                        </h4>
                                                        <p className="text-sm text-emerald-700">
                                                            The model has been approved and the request is completed.
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Allow viewing the model even after completion */}
                                                <button
                                                    className="mt-3 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                                                    onClick={() => handleReviewModel(request.id)}
                                                >
                                                    <Eye size={16} className="mr-2" />
                                                    View Model
                                                </button>
                                            </div>
                                        )}

                                        {request.status === 'REJECTED' && (
                                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                                                <div className="flex items-start">
                                                    <AlertCircle size={16} className="text-red-500 mr-2 mt-1" />
                                                    <div>
                                                        <h4 className="text-sm font-medium text-red-800">
                                                            Rejection Reason:
                                                        </h4>
                                                        <p className="text-sm text-red-700">
                                                            {request.rejectionReason || 'No reason provided'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {request.priceStatus && request.priceStatus !== 'NULL' && (
                                            <div
                                                className={`mt-4 p-3 ${
                                                    request.priceStatus === 'APPROVED'
                                                        ? 'bg-green-50 border-green-200'
                                                        : 'bg-blue-50 border-blue-200'
                                                } border rounded-md`}
                                            >
                                                <div className="flex items-start">
                                                    {request.priceStatus === 'APPROVED' ? (
                                                        <CheckCircle size={16} className="text-green-500 mr-2 mt-1" />
                                                    ) : (
                                                        <Info size={16} className="text-blue-500 mr-2 mt-1" />
                                                    )}
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-800">
                                                            Price Status:
                                                        </h4>
                                                        <p className="text-sm text-gray-700">{request.priceStatus}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    {request.revisionFiles &&
                                    Array.isArray(request.revisionFiles) &&
                                    request.revisionFiles.length > 0 ? (
                                        <>
                                            <div className="mb-2 flex justify-between items-center">
                                                <h3 className="font-medium text-gray-800 flex items-center">
                                                    <Paperclip size={16} className="mr-1" />
                                                    Reference Materials ({getFileCount(request)})
                                                </h3>
                                                <button
                                                    className="text-sm text-blue-600 hover:text-blue-800"
                                                    onClick={() => openFullView(request.id, 0)}
                                                >
                                                    View All
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                                                {request.revisionFiles.map((media, mediaIndex) => (
                                                    <div
                                                        key={mediaIndex}
                                                        className="aspect-square bg-gray-200 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-300 transition duration-200"
                                                        onClick={() => openFullView(request.id, mediaIndex)}
                                                    >
                                                        <div className="flex flex-col items-center justify-center">
                                                            {getMediaType(media) === 'IMAGE' && (
                                                                <img
                                                                    src={getImage(media)}
                                                                    alt="Revision Thumbnail"
                                                                    className="h-full w-full object-cover rounded-lg"
                                                                />
                                                            )}
                                                            {getMediaType(media) === 'VIDEO' && (
                                                                <video
                                                                    src={getImage(media)}
                                                                    className="h-full w-full object-cover rounded-lg"
                                                                    muted
                                                                    loop
                                                                />
                                                            )}{' '}
                                                            <span className="text-xs text-gray-500 mt-1">
                                                                {mediaIndex + 1}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="h-full flex items-center justify-center p-8 bg-gray-50 rounded-lg border border-gray-200">
                                            <div className="text-center">
                                                <Paperclip size={32} className="mx-auto text-gray-400 mb-2" />
                                                <p className="text-gray-500">No reference materials available</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Upload Model Dialog */}
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
                    <Button sx={{ textTransform: 'none' }} onClick={handleCloseCreateDialog} disabled={isCreating}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Review Model Dialog */}
            <Dialog open={openReviewDialog} onClose={handleCloseReviewDialog} fullWidth maxWidth="xl">
                <DialogTitle>Review 3D Model</DialogTitle>
                <DialogContent sx={{ minHeight: '80vh' }}>
                    {reviewRequestId && (
                        <ModelEditor
                            action={'ReviewModel'}
                            requestId={reviewRequestId}
                            handleCloseModal={handleCloseReviewDialog}
                            isDisable={false}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button sx={{ textTransform: 'none' }} onClick={handleCloseReviewDialog}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Reject Model Dialog */}
            <Dialog open={openRejectDialog} onClose={handleCloseRejectDialog} fullWidth maxWidth="sm">
                <DialogTitle>Reject Model</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please provide a reason for rejecting this model. This will help the designer understand what
                        needs to be improved.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="rejection-reason"
                        label="Rejection Reason"
                        type="text"
                        fullWidth
                        multiline
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        variant="outlined"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseRejectDialog} sx={{ color: 'gray' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRejectSubmit}
                        variant="contained"
                        color="error"
                        disabled={!rejectionReason.trim() || isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Reject'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Approve Model Dialog */}
            <Dialog open={openApproveDialog} onClose={handleCloseApproveDialog} fullWidth maxWidth="sm">
                <DialogTitle>Approve Model</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Please provide a name and description for this model.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="model-name"
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
                        id="model-description"
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
                    <Button onClick={handleCloseApproveDialog} sx={{ color: 'gray' }}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleApproveSubmit}
                        variant="contained"
                        color="success"
                        disabled={!modelName.trim() || isSubmitting}
                    >
                        {isSubmitting ? <CircularProgress size={24} /> : 'Approve'}
                    </Button>
                </DialogActions>
            </Dialog>
            {fullViewMode && <MediaOverlay />}
        </div>
    );
};

export default RequestRevisionList;
