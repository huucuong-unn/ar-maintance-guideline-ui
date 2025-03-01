import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';

const NotAuthorized = () => {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                background: 'linear-gradient(to right, #f8f9fa, #e9ecef)',
                textAlign: 'center',
                px: 2,
            }}
        >
            <BlockIcon sx={{ fontSize: 100, color: 'red', mb: 2 }} />
            <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                Not Authorized
            </Typography>
            <Typography variant="h6" sx={{ mb: 3 }}>
                You do not have permission to view this page.
            </Typography>
            <Button variant="contained" color="primary" href="/">
                Go to login
            </Button>
        </Box>
    );
};

export default NotAuthorized;
