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
} from '@mui/material';
import {
    Phone as PhoneIcon,
    Videocam as VideocamIcon,
    Info as InfoIcon,
    Add as AddIcon,
    PhotoCamera as PhotoCameraIcon,
    Image as ImageIcon,
    Send as SendIcon,
} from '@mui/icons-material';
import { Client } from '@stomp/stompjs';
import ChatBoxAPI from '~/API/ChatBoxAPI';
import storageService from '~/components/StorageService/storageService';
import SockJS from 'sockjs-client';
import { Modal, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import { X } from 'lucide-react'; // Import X icon directly
import RequestRevisionList from './RequestRevisionList'; // Import the RequestRevisionList component
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
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);
    const stompClientRef = useRef(null);
    const [revisionRequests, setRevisionRequests] = useState([]);
    const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
    const host = process.env.REACT_APP_BACKEND_APP_HOST_DEPLOY;
    // Add these functions inside the ChatBox component
    const fetchRevisionRequests = async () => {
        try {
            console.log('revisionRequests', 'hello');

            const response = await CompanyRequestAPI.getRequestRevisionAllByCompanyRequestId(requestId);
            setRevisionRequests(response || []);
        } catch (error) {
            console.error('Failed to fetch revision requests:', error);
        }
    };

    const handleOpenRevisionModal = () => {
        fetchRevisionRequests();
        setIsRevisionModalOpen(true);
    };

    const handleCloseRevisionModal = () => {
        setIsRevisionModalOpen(false);
    };

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
    // Scroll to the bottom of the chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // WebSocket Connection Effect
    useEffect(() => {
        // Establish WebSocket connection
        const socket = new Client({
            webSocketFactory: () => new SockJS(`http://${host}/ws`),
            onConnect: () => {
                console.log('WebSocket Connected');

                // Subscribe to the specific chat box topic
                const subscription = socket.subscribe(`/topic/chat/${requestId}`, (message) => {
                    const receivedMessage = JSON.parse(message.body);
                    console.log('Received message:', receivedMessage);
                    // Add received message to messages list
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        {
                            id: prevMessages.length + 1,
                            sender: receivedMessage.senderEmail,
                            content: receivedMessage.content,
                            timestamp: new Date(receivedMessage.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
                            type: receivedMessage.senderEmail === username ? 'sent' : 'received',
                        },
                    ]);
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
                    setMessages(
                        response.map((msg, index) => ({
                            id: index + 1,
                            sender: msg.senderEmail,
                            content: msg.content,
                            timestamp: new Date(msg.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                            }),
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
        if (messageInput.trim() && stompClientRef.current?.connected) {
            const newMessage = {
                chatBoxId: requestId,
                userId: storageService.getItem('userInfo')?.user?.id,
                content: messageInput,
                senderEmail: username,
                timestamp: new Date().toISOString(),
            };

            stompClientRef.current.publish({
                destination: `/app/chat/${requestId}`,
                body: JSON.stringify(newMessage),
            });

            setMessageInput('');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    // Rest of the component remains the same as in the original code
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    bgcolor: 'background.default',
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        width: 1000,
                        height: 500,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                    }}
                >
                    {/* Chat Header (unchanged) */}
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
                                    Chat with {requestId}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Online
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <IconButton onClick={handleOpenRevisionModal}>
                                <InfoIcon />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Messages Container (unchanged) */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            p: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                        }}
                    >
                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                                    alignItems: 'flex-start',
                                    mb: 1,
                                }}
                            >
                                {msg.type === 'received' && (
                                    <Avatar
                                        alt="Sender Avatar"
                                        src="/api/placeholder/32/32"
                                        sx={{ mr: 1, width: 32, height: 32 }}
                                    />
                                )}
                                <Stack>
                                    <Box
                                        sx={{
                                            bgcolor: msg.type === 'sent' ? 'primary.main' : 'grey.300',
                                            color: msg.type === 'sent' ? 'white' : 'text.primary',
                                            px: 2,
                                            py: 1,
                                            borderRadius: 3,
                                            borderBottomRightRadius: msg.type === 'sent' ? 4 : 12,
                                            borderBottomLeftRadius: msg.type === 'received' ? 4 : 12,
                                            maxWidth: 250,
                                        }}
                                    >
                                        {msg.content}
                                    </Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            alignSelf: msg.type === 'sent' ? 'flex-end' : 'flex-start',
                                            mt: 0.5,
                                        }}
                                    >
                                        {msg.timestamp}
                                    </Typography>
                                </Stack>
                            </Box>
                        ))}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Message Input (unchanged) */}
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
                        <IconButton>
                            <AddIcon />
                        </IconButton>
                        <IconButton>
                            <PhotoCameraIcon />
                        </IconButton>
                        <IconButton>
                            <ImageIcon />
                        </IconButton>

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
            </Box>

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
        </ThemeProvider>
    );
};

export default ChatBox;
