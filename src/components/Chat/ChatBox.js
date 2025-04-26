import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Avatar,
    IconButton,
    TextField,
    Paper,
    Stack,
    createTheme,
    ThemeProvider,
    Button,
    Chip,
    Modal,
    Snackbar,
    Alert,
} from '@mui/material';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import {
    Add as AddIcon,
    PhotoCamera as PhotoCameraIcon,
    Image as ImageIcon,
    Send as SendIcon,
    Info as InfoIcon,
} from '@mui/icons-material';
import { X, FileText, DeleteIcon } from 'lucide-react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import ChatBoxAPI from '~/API/ChatBoxAPI';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import storageService from '~/components/StorageService/storageService';
import RequestRevisionList from './RequestRevisionList';
import ChatMessages from './ChatMessages';
import RequestRevisionCard from './RequestRevisionCard';
import RevisionRequestMessageCard from './RevisionRequestMessageCard';
import RevisionRequestDialog from './RevisionRequestDialog';
import { toast } from 'react-toastify';
import { m } from 'framer-motion';
import { set } from 'date-fns';
import { host } from '~/Constant';

// Create a custom theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#0084ff',
        },
        background: {
            default: '#f0f2f5',
        },
    },
    typography: {
        fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
    },
});

const ChatBox = ({ requestId }) => {
    const [username] = useState(storageService.getItem('userInfo')?.user?.email || 'Unknown User');
    const [userId] = useState(storageService.getItem('userInfo')?.user?.id || 'Unknown User');
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const stompClientRef = useRef(null);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const [requestRevisionRequest, setRequestRevisionRequest] = useState(false);
    const [userRole] = useState(storageService.getItem('userInfo')?.user?.role.roleName || 'USER');
    const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [companyRequest, setCompanyRequest] = useState(null);
    // New state for create revision dialog
    const [isCreateRevisionOpen, setIsCreateRevisionOpen] = useState(false);
    const [chatBoxId, setChatBoxId] = useState('');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success',
    });
    // Open cancel dialog
    const handleOpenCancelDialog = () => {
        setIsCancelDialogOpen(true);
    };

    // Close cancel dialog
    const handleCloseCancelDialog = () => {
        setIsCancelDialogOpen(false);
        setCancelReason('');
    };

    // Handle request cancellation
    const handleCancelRequest = async () => {
        if (!cancelReason.trim()) {
            toast.error('Please provide a reason for cancellation');
            return;
        }

        try {
            // Payload for updating request status
            const payload = {
                status: 'CANCELLED', // Adjust this to match your backend status enum
                cancelReason: cancelReason.trim(),
                cancelledBy: userId,
            };

            // Call API to update request status
            await CompanyRequestAPI.updateRequestStatus(requestId, payload);
            fetchCompanyRequest();

            // Close dialog and show success toast
            handleCloseCancelDialog();
            toast.success('Request successfully cancelled');
        } catch (error) {
            console.error('Failed to cancel request:', error);
            toast.error('Failed to cancel request');
        }
    };

    const fetchCompanyRequest = async () => {
        try {
            const response = await CompanyRequestAPI.getCompanyRequestById(requestId);
            setCompanyRequest(response.result);
        } catch (error) {
            console.error('Failed to fetch company request:', error);
        }
    };

    useEffect(() => {
        fetchCompanyRequest();
    }, [requestId]);

    // Fetch revision requests
    const fetchRevisionRequests = async () => {
        try {
            const response = await CompanyRequestAPI.getRequestRevisionAllByCompanyRequestId(requestId);
            const companyRequestResponse = await CompanyRequestAPI.getCompanyRequestById(requestId);
            fetchCompanyRequest(requestId);
            setRevisionRequests(response);
        } catch (error) {
            console.error('Failed to fetch revision requests:', error);
        }
    };

    // Status color mapping
    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'warning';
            case 'COMPLETED':
                return 'success';
            case 'REJECTED':
                return 'error';
            default:
                return 'default';
        }
    };

    const [selectedRevision, setSelectedRevision] = useState(null);
    const [isRevisionDetailOpen, setIsRevisionDetailOpen] = useState(false);

    const handleOpenRevisionDetail = (revision) => {
        setSelectedRevision(revision);
        setIsRevisionDetailOpen(true);
    };

    useEffect(() => {
        if (selectedRevision) {
            const updatedSelectedRevvision = messages.find(
                (message) => message.requestRevisionResponse?.id === selectedRevision?.id,
            );
            setSelectedRevision(updatedSelectedRevvision.requestRevisionResponse);
        }
    }, [messages]);

    // Inside ChatBox component
    const renderRevisionRequest = (revision) => {
        return (
            <RevisionRequestMessageCard
                revision={revision}
                getStatusColor={getStatusColor}
                handleOpenRevisionDetail={handleOpenRevisionDetail}
            />
        );
    };

    // WebSocket Connection Effect
    useEffect(() => {
        // Establish WebSocket connection
        const socket = new Client({
            //  webSocketFactory: () => new SockJS('https://armaintance.ngrok.pro/ws'),
            webSocketFactory: () => new SockJS(`${host}/ws`),
            onConnect: () => {
                console.log('WebSocket Connected');

                // Subscribe to the specific chat box topic
                const subscription = socket.subscribe(`/topic/chat/${requestId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);

                    setMessages((prevMessages) => {
                        const existingIndex = prevMessages.findIndex(
                            (msg) => msg.timestampOrigin === receivedMessage.timestamp,
                        );

                        console.log(prevMessages[0]);

                        console.log('Received message:', receivedMessage.timestamp);
                        console.log('existingIndex:', existingIndex);

                        const formattedTimestamp = new Date(receivedMessage.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        });

                        const newMessage = {
                            id: existingIndex !== -1 ? prevMessages[existingIndex].id : prevMessages.length + 1,
                            sender: receivedMessage.senderEmail,
                            content: receivedMessage.content,
                            timestamp: formattedTimestamp,
                            timestampOrigin: receivedMessage.timestamp,
                            requestRevisionResponse: receivedMessage.requestRevisionResponse,
                            type: receivedMessage.senderEmail === username ? 'sent' : 'received',
                        };

                        if (existingIndex !== -1) {
                            // Replace the existing message
                            const updatedMessages = [...prevMessages];
                            updatedMessages[existingIndex] = newMessage;
                            return updatedMessages;
                        } else {
                            // Append as a new message
                            return [...prevMessages, newMessage];
                        }
                    });
                });

                stompClientRef.current = socket;

                // Cleanup subscription on unmount
                return () => {
                    subscription.unsubscribe();
                };
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        // Activate the connection
        socket.activate();

        // Fetch existing messages
        const fetchMessages = async () => {
            try {
                if (requestId) {
                    const response = await ChatBoxAPI.getChatBoxMessages(requestId);
                    setChatBoxId(response[0]?.requestRevisionResponse?.chatBoxId || '');
                    setMessages(
                        response.map((msg, index) => ({
                            id: index + 1,
                            sender: msg.senderEmail,
                            content: msg.content,
                            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
                            timestampOrigin: msg.timestamp,
                            requestRevisionResponse: msg.requestRevisionResponse,
                            type: msg.senderEmail === username ? 'sent' : 'received',
                        })),
                    );
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();

        // Cleanup on component unmount
        return () => {
            if (socket) {
                socket.deactivate();
            }
        };
    }, [requestId, username]);

    // Send a new message
    const sendMessage = () => {
        console.log(requestId);

        if (messageInput.trim() && stompClientRef.current?.connected) {
            const newMessage = {
                chatBoxId: chatBoxId,
                userId: storageService.getItem('userInfo')?.user?.id,
                content: messageInput,
                senderEmail: username,
                timestamp: new Date().toISOString(),
                requestRevisionResponse: null,
            };

            stompClientRef.current.publish({
                destination: `/app/chat/${requestId}`,
                body: JSON.stringify(newMessage),
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setMessageInput('');
        }
    };

    // Handle key press for sending message
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Open/Close revision modal
    const handleOpenRevisionModal = () => {
        fetchRevisionRequests();
        setIsRevisionModalOpen(true);
    };

    const handleCloseRevisionModal = () => {
        setIsRevisionModalOpen(false);
    };

    const handleCloseRevisionDetail = () => {
        setIsRevisionDetailOpen(false);
    };

    // Open/Close create revision dialog
    const handleOpenCreateRevision = () => {
        if (checkIsAnyRequestProcessing()) {
            toast.warn('You have a pending revision request. Please wait for it to be processed.');
        } else {
            setIsCreateRevisionOpen(true);
        }
    };

    const handleCloseCreateRevision = () => {
        setIsCreateRevisionOpen(false);
    };

    // Submit revision request
    const handleSubmitRevision = async (formData) => {
        try {
            formData.append('companyRequestId', requestId);
            //  formData.append('userId', storageService.getItem('userInfo')?.user?.id);
            formData.append('status', 'PENDING');
            const newMessage = {
                chatBoxId: chatBoxId,
                userId: storageService.getItem('userInfo')?.user?.id,
                content: messageInput,
                senderEmail: username,
                timestamp: new Date().toISOString(),
            };

            const sendResponse = await ChatBoxAPI.addMessageToChatBox(newMessage);
            formData.append('chatMessageId', sendResponse.id);

            const response = await CompanyRequestAPI.createRequestRevision(formData);

            return true;
        } catch (error) {
            console.error('Failed to submit revision request:', error);
            return false;
        }
    };

    // Close snackbar
    const handleCloseSnackbar = (_, reason) => {
        if (reason === 'clickaway') return;
        setSnackbar((prev) => ({ ...prev, open: false }));
    };

    const checkIsAnyPriceProposedHaveBeenAccepted = () => {
        const isAnyPriceProposedHaveBeenAccepted = messages.some(
            (message) =>
                (message?.requestRevisionResponse?.type == 'Price Proposal' &&
                    message?.requestRevisionResponse?.status !== 'PENDING') ||
                message?.requestRevisionResponse?.modelFile,
        );
        console.log(isAnyPriceProposedHaveBeenAccepted);
        return isAnyPriceProposedHaveBeenAccepted;
    };

    const checkIsAnyRequestProcessing = () => {
        const isAnyRequestProcessing = messages.some(
            (message) => message?.requestRevisionResponse?.status === 'PROCESSING',
        );
        console.log(isAnyRequestProcessing);
        return isAnyRequestProcessing;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    marginTop: '5%',

                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '70vh',
                    bgcolor: 'background.default',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: '100%',
                        height: '130%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                    }}
                >
                    {/* Chat Header */}
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            p: 2,
                            borderBottom: 1,
                            borderColor: 'divider',
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Avatar alt="User Avatar" src="/api/placeholder/40/40" sx={{ mr: 2 }} />
                            <Box>
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Chat with{' '}
                                    {userRole !== 'COMPANY'
                                        ? companyRequest?.requester?.email
                                        : companyRequest?.designer?.email}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            {companyRequest?.status !== 'CANCELLED' &&
                                companyRequest?.status !== 'APPROVED' &&
                                checkIsAnyPriceProposedHaveBeenAccepted && (
                                    <IconButton onClick={handleOpenCancelDialog}>
                                        <DeleteIcon />
                                    </IconButton>
                                )}

                            <IconButton onClick={handleOpenRevisionModal}>
                                <InfoIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Container */}
                    <ChatMessages
                        messages={messages}
                        username={username}
                        getStatusColor={getStatusColor}
                        renderRevisionRequest={renderRevisionRequest}
                    />

                    {/* Message Input */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: 1,
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                        }}
                    >
                        {userRole === 'COMPANY' &&
                            companyRequest?.status !== 'CANCELLED' &&
                            companyRequest?.status !== 'APPROVED' && (
                                <IconButton onClick={handleOpenCreateRevision} title="Create Revision Request">
                                    <AddIcon />
                                </IconButton>
                            )}

                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            InputProps={{
                                sx: {
                                    borderRadius: 10,
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'grey.300',
                                    },
                                },
                            }}
                        />

                        <IconButton
                            color="primary"
                            onClick={sendMessage}
                            sx={{
                                bgcolor: 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: 'primary.dark',
                                },
                            }}
                        >
                            <SendIcon />
                        </IconButton>
                    </Box>
                </Paper>

                {/* Create Revision Request Dialog */}
                <RevisionRequestDialog
                    open={isCreateRevisionOpen}
                    onClose={handleCloseCreateRevision}
                    onSubmit={handleSubmitRevision}
                    requestId={requestId}
                    isAnyPriceProposedHaveBeenAccepted={checkIsAnyPriceProposedHaveBeenAccepted()}
                    isAnyRequestProcessing={checkIsAnyRequestProcessing()}
                />

                {/* Revision Detail Modal */}
                <Modal
                    open={isRevisionDetailOpen}
                    onClose={handleCloseRevisionDetail}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ width: '80%', maxHeight: '90vh', overflow: 'auto' }}>
                        <Paper
                            sx={{
                                position: 'relative',
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                p: 3,
                            }}
                        >
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: 'grey.500',
                                    bgcolor: 'white',
                                    '&:hover': { bgcolor: 'grey.100' },
                                    zIndex: 10,
                                }}
                                onClick={handleCloseRevisionDetail}
                            >
                                <X size={20} />
                            </IconButton>

                            <Typography variant="h6" sx={{ mb: 3, pr: 4 }}>
                                Revision Request Details
                            </Typography>

                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <RequestRevisionCard
                                    request={selectedRevision}
                                    fetchRevisionRequests={() => {}}
                                ></RequestRevisionCard>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleCloseRevisionDetail}
                                        sx={{ minWidth: 120 }}
                                    >
                                        Close
                                    </Button>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>
                </Modal>

                {/* Revision Modal */}
                <Modal
                    open={isRevisionModalOpen}
                    onClose={handleCloseRevisionModal}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box sx={{ width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto' }}>
                        <Paper
                            sx={{
                                position: 'relative',
                                bgcolor: 'background.paper',
                                borderRadius: 2,
                                p: 0,
                            }}
                        >
                            <IconButton
                                sx={{
                                    position: 'absolute',
                                    right: 8,
                                    top: 8,
                                    color: 'grey.500',
                                    bgcolor: 'white',
                                    '&:hover': { bgcolor: 'grey.100' },
                                    zIndex: 10,
                                }}
                                onClick={handleCloseRevisionModal}
                            >
                                <X size={20} />
                            </IconButton>

                            <RequestRevisionList
                                revisionRequests={revisionRequests}
                                fetchRevisionRequests={fetchRevisionRequests}
                            />
                        </Paper>
                    </Box>
                </Modal>

                {/* Cancel Request Dialog */}
                <Modal
                    open={isCancelDialogOpen}
                    onClose={handleCloseCancelDialog}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Box
                        sx={{
                            width: '90%',
                            maxWidth: 500,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 24,
                            p: 4,
                        }}
                    >
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Cancel Request
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            Please provide a reason for cancelling this request.
                        </Typography>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="Cancellation Reason"
                            fullWidth
                            variant="outlined"
                            multiline
                            rows={4}
                            value={cancelReason}
                            onChange={(e) => setCancelReason(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                        />
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                            <Button
                                sx={{
                                    textTransform: 'none', // This will keep the text in its normal case
                                    fontWeight: 'normal', // This ensures normal font weight
                                }}
                                textnormal
                                onClick={handleCloseCancelDialog}
                                color="primary"
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                            <Button
                                sx={{
                                    textTransform: 'none', // This will keep the text in its normal case
                                    fontWeight: 'normal', // This ensures normal font weight
                                }}
                                onClick={handleCancelRequest}
                                color="error"
                                variant="contained"
                            >
                                Confirm
                            </Button>
                        </Box>
                    </Box>
                </Modal>
                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default ChatBox;
