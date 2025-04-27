import React from 'react';
import { Send, ThumbsUp, CheckCircle, Info, AlertCircle, Eye, Check, X, ThumbsDown } from 'lucide-react';
import { Button } from '@mui/material';
import CloudUpload from '@mui/icons-material/CloudUpload';
import storageService from '~/components/StorageService/storageService';

const RequestRevisionActions = ({
    request,
    isSubmitting,
    onSubmit,
    onOpenApproveDialog,
    onOpenRejectDialog,
    onReviewModel,
    onHandle3DFileSelect,
    revision,
}) => {
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const userRole = userInfo?.role.roleName || null;

    // Render different actions based on request status and user role
    const renderStatusSpecificContent = () => {
        switch (request.status) {
            case 'DELIVERED':
                if (userRole === 'COMPANY') {
                    return (
                        <div className="space-y-3">
                            <button
                                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                                onClick={() => onReviewModel(request.id)}
                            >
                                <Eye size={16} className="mr-2" />
                                Review Model
                            </button>

                            <button
                                className={`w-full flex items-center justify-center ${
                                    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                } text-white py-2 px-4 rounded-md transition duration-200`}
                                onClick={() => onOpenApproveDialog(request.id)}
                                disabled={isSubmitting}
                            >
                                <Check size={16} className="mr-2" />
                                Approve Model
                            </button>
                            <button
                                className={`w-full flex items-center justify-center ${
                                    isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                } text-white py-2 px-4 rounded-md transition duration-200`}
                                onClick={() => onOpenRejectDialog(request.id)}
                                disabled={isSubmitting}
                            >
                                <X size={16} className="mr-2" />
                                Reject Model
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="space-y-3">
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                            <div className="flex items-start">
                                <CheckCircle size={16} className="text-green-500 mr-2 mt-1" />
                                <div>
                                    <h4 className="text-sm font-medium text-green-800">Delivered</h4>
                                    <p className="text-sm text-green-700">
                                        The 3D model has been delivered and is ready for review.
                                    </p>
                                </div>
                            </div>
                        </div>
                        <button
                            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                            onClick={() => onReviewModel(request.id)}
                        >
                            <Eye size={16} className="mr-2" />
                            Review Model
                        </button>
                    </div>
                );

            case 'PRICE PROPOSED':
                if (userRole === 'COMPANY') {
                    return (
                        <div className="space-y-3">
                            <button
                                className={`w-full flex items-center justify-center ${
                                    isSubmitting ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                                } text-white py-2 px-4 rounded-md transition duration-200`}
                                onClick={() => onSubmit(request.id, request.status, request.type)}
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

                            <button
                                className={`w-full flex items-center justify-center ${
                                    isSubmitting ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                } text-white py-2 px-4 rounded-md transition duration-200`}
                                onClick={() => onOpenRejectDialog(request.id, 'proposal')}
                                disabled={isSubmitting}
                            >
                                <ThumbsDown size={16} className="mr-2" />
                                Reject Proposal
                            </button>
                        </div>
                    );
                }
                return (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex items-start">
                            <Info size={16} className="text-yellow-500 mr-2 mt-1" />
                            <div>
                                <h4 className="text-sm font-medium text-yellow-800">Price Proposed</h4>
                                <p className="text-sm text-yellow-700">
                                    Your price proposal of {request.priceProposal} point has been submitted and is
                                    awaiting review.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'PROCESSING':
                if (userRole !== 'COMPANY') {
                    return (
                        <div className="mt-3">
                            <Button
                                variant="contained"
                                component="label"
                                startIcon={<CloudUpload />}
                                sx={{
                                    mt: 2,
                                    bgcolor: '#4338ca',
                                    color: 'white',
                                    textTransform: 'none',
                                    fontWeight: 500,
                                    padding: '8px 16px',
                                    borderRadius: '8px',
                                }}
                            >
                                Upload 3D Model
                                <input
                                    type="file"
                                    hidden
                                    accept=".glb,.gltf"
                                    onChange={(e) => onHandle3DFileSelect(e, request.id)}
                                    disabled={isSubmitting}
                                />
                            </Button>
                        </div>
                    );
                }
                return null;

            case 'COMPLETED':
                return (
                    <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-md">
                        <div className="flex items-start">
                            <CheckCircle size={16} className="text-emerald-500 mr-2 mt-1" />
                            <div>
                                <h4 className="text-sm font-medium text-emerald-800">Completed</h4>
                                <p className="text-sm text-emerald-700">
                                    The model has been approved and the request is completed.
                                </p>
                            </div>
                        </div>

                        <button
                            className="mt-3 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                            onClick={() => onReviewModel(request.id)}
                        >
                            <Eye size={16} className="mr-2" />
                            View Model
                        </button>
                    </div>
                );

            case 'REJECTED':
                return (
                    <div className="space-y-3">
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                            <div className="flex items-start">
                                <AlertCircle size={16} className="text-red-500 mr-2 mt-1" />
                                <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-red-800">Rejection Reason:</h4>
                                    <p
                                        className="text-sm text-red-700"
                                        style={{
                                            whiteSpace: 'normal',
                                            wordBreak: 'break-word',
                                            overflowWrap: 'anywhere',
                                            maxWidth: '50ch',
                                        }}
                                    >
                                        {request.rejectionReason || 'No reason provided'}
                                    </p>
                                </div>
                            </div>
                        </div>
                        {revision?.modelFile && (
                            <button
                                className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition duration-200"
                                onClick={() => onReviewModel(request.id)}
                            >
                                <Eye size={16} className="mr-2" />
                                Review Model
                            </button>
                        )}
                    </div>
                );

            default:
                if (
                    userRole !== 'COMPANY' &&
                    ['COMPLETED', 'REJECTED', 'PRICE PROPOSED', 'PROCESSING', 'DELIVERED'].indexOf(request.status) ===
                        -1
                ) {
                    return (
                        <>
                            {userRole === 'DESIGNER' && request.type === 'Bug Fix' && request.status === 'PENDING' ? (
                                <div className="space-y-3">
                                    <button
                                        className={`w-full flex items-center justify-center ${
                                            isSubmitting
                                                ? 'bg-green-400 cursor-not-allowed'
                                                : 'bg-green-600 hover:bg-green-700'
                                        } text-white py-2 px-4 rounded-md transition duration-200`}
                                        onClick={() => onSubmit(request.id, request.status, request.type)}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <ThumbsUp size={16} className="mr-2" />
                                                Approve
                                            </>
                                        )}
                                    </button>

                                    <button
                                        className={`w-full flex items-center justify-center ${
                                            isSubmitting
                                                ? 'bg-red-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'
                                        } text-white py-2 px-4 rounded-md transition duration-200`}
                                        onClick={() => onOpenRejectDialog(request.id, 'proposal')}
                                        disabled={isSubmitting}
                                    >
                                        <ThumbsDown size={16} className="mr-2" />
                                        Reject
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button
                                        className={`w-full flex items-center justify-center ${
                                            isSubmitting
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } text-white py-2 px-4 rounded-md transition duration-200`}
                                        onClick={() => onSubmit(request.id, request.status, request.type)}
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

                                    <button
                                        className={`w-full flex items-center justify-center ${
                                            isSubmitting
                                                ? 'bg-red-400 cursor-not-allowed'
                                                : 'bg-red-600 hover:bg-red-700'
                                        } text-white py-2 px-4 rounded-md transition duration-200`}
                                        onClick={() => onOpenRejectDialog(request.id, 'proposal')}
                                        disabled={isSubmitting}
                                    >
                                        <ThumbsDown size={16} className="mr-2" />
                                        Reject
                                    </button>
                                </div>
                            )}
                        </>
                    );
                }
                return null;
        }
    };

    return renderStatusSpecificContent();
};

export default RequestRevisionActions;
