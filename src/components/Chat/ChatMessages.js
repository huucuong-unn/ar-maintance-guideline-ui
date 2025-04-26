import React, { useRef, useEffect } from 'react';
import { Box, Typography, Avatar, Stack, Chip } from '@mui/material';
import { FileText } from 'lucide-react';

const ChatMessages = ({ messages, username, getStatusColor, renderRevisionRequest }) => {
    const messagesEndRef = useRef(null);

    // Scroll to the bottom of the chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
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
                            sx={
                                msg.requestRevisionResponse
                                    ? {
                                          bgcolor: 'grey.100',
                                          color: 'text.primary',
                                          px: 2,
                                          py: 1,
                                          borderRadius: 3,
                                          maxWidth: 300,
                                      }
                                    : {
                                          bgcolor: msg.type === 'sent' ? 'primary.main' : 'grey.300',
                                          color: msg.type === 'sent' ? 'white' : 'text.primary',
                                          px: 2,
                                          py: 1,
                                          borderRadius: 3,
                                          borderBottomRightRadius: msg.type === 'sent' ? 4 : 12,
                                          borderBottomLeftRadius: msg.type === 'received' ? 4 : 12,
                                          maxWidth: 300,
                                      }
                            }
                        >
                            {msg.requestRevisionResponse
                                ? renderRevisionRequest(msg.requestRevisionResponse)
                                : msg.content}
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
    );
};

export default ChatMessages;
