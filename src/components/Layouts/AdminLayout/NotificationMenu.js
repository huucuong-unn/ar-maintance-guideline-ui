import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Button, Divider, MenuItem, Avatar, Menu, CircularProgress } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import NotificationAPI from '../../../API/NotificationAPI'; // adjust the path if needed
import storageService from '../../../../src/components/StorageService/storageService'; // adjust the path if needed
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { host } from '../../../Constant'; // adjust the path if needed
import { useNavigate } from 'react-router-dom';

export const NotificationsMenu = ({
    anchorElNotifications,
    handleCloseNotifications,
    fetchNotifications,
    notifications,
}) => {
    const [loading, setLoading] = useState(false);
    const [userId] = useState(storageService.getItem('userInfo')?.user?.id || 'Unknown User');
    const stompClientRef = useRef(null);
    const navigate = useNavigate();
    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        const socket = new Client({
            webSocketFactory: () => new SockJS(`${host}/ws`),
            onConnect: () => {
                console.log('WebSocket Connected');
                const subscription = socket.subscribe(`/topic/notification/${userId}`, (message) => {
                    fetchNotifications();
                });
                stompClientRef.current = socket;
                return () => {
                    subscription.unsubscribe();
                };
            },
            onStompError: (frame) => {
                console.error('Broker reported error: ' + frame.headers['message']);
                console.error('Additional details: ' + frame.body);
            },
        });

        socket.activate();

        return () => {
            if (socket) {
                socket.deactivate();
            }
        };
    }, [userId]);

    const handleNotificationClick = async (notification) => {
        if (notification.status === 'Unread') {
            try {
                await NotificationAPI.changeNotificationStatus(notification.id, 'Read');
                fetchNotifications(); // refresh after marking as read
            } catch (error) {
                console.error('Failed to mark notification as read:', error);
            }
        }
        if (notification.type === 'Message') {
            navigate(`/company-request-section/${notification.key}`);
        }
        handleCloseNotifications();
    };

    const renderNotificationIcon = (type) => {
        if (type === 'Message') {
            return (
                <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 38, height: 38 }}>
                    <NotificationsIcon fontSize="small" />
                </Avatar>
            );
        } else if (type === 'Request') {
            return (
                <Avatar sx={{ bgcolor: 'success.light', color: 'success.main', width: 38, height: 38 }}>
                    <PersonIcon fontSize="small" />
                </Avatar>
            );
        } else {
            return (
                <Avatar sx={{ bgcolor: 'grey.300', color: 'grey.700', width: 38, height: 38 }}>
                    <NotificationsIcon fontSize="small" />
                </Avatar>
            );
        }
    };

    return (
        <Menu
            sx={{ mt: '45px' }}
            id="menu-notifications"
            anchorEl={anchorElNotifications}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={Boolean(anchorElNotifications)}
            onClose={handleCloseNotifications}
            PaperProps={{
                elevation: 2,
                sx: {
                    minWidth: '500px',
                    maxWidth: '500px',
                    mt: 0.5,
                    borderRadius: '8px',
                    maxHeight: '70vh',
                    overflowY: 'auto',
                },
            }}
        >
            <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle1" fontWeight="bold">
                    Notifications
                </Typography>
            </Box>
            <Divider />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2 }}>
                    <CircularProgress size={24} />
                </Box>
            ) : (
                <>
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <MenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                sx={{
                                    py: 1.5,
                                    bgcolor: notification.status === 'Unread' ? 'lightblue' : 'inherit', // Highlight unread
                                    '&:hover': {
                                        bgcolor: 'grey.200',
                                    },
                                }}
                            >
                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                                    {renderNotificationIcon(notification.type)}
                                    <Box>
                                        <Typography variant="body2" fontWeight="medium">
                                            {notification.title}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {notification.content}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {new Date(notification.createdDate).toLocaleString()}
                                        </Typography>
                                    </Box>
                                </Box>
                            </MenuItem>
                        ))
                    ) : (
                        <Box sx={{ px: 2, py: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No notifications found
                            </Typography>
                        </Box>
                    )}
                </>
            )}

            <Divider />
        </Menu>
    );
};

export default NotificationsMenu;
