import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Button, Paper, Divider } from '@mui/material';
import PointOptionsAPI from '~/API/PointOptionsAPI';
import PayosAPI from '~/API/PayosAPI';
import storageService from '~/components/StorageService/storageService';

const PointPurchase = () => {
    const [pointOptions, setPointOptions] = useState([]);
    const [selectedPackage, setSelectedPackage] = useState(null);

    useEffect(() => {
        const fetchPointOptions = async () => {
            try {
                const response = await PointOptionsAPI.getAllPointOptions();
                setPointOptions(response.result);
                setSelectedPackage(response.result[0]); // Set the first package as the default selected package
            } catch (error) {
                console.error('Failed to fetch point options:', error);
            }
        };

        fetchPointOptions();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const calculateTotalPoints = () => {
        return selectedPackage ? selectedPackage.point : 0;
    };

    const handlePurchase = async () => {
        const totalPoints = calculateTotalPoints();
        const purchaseDetails = {
            package: selectedPackage,
            totalPoints: totalPoints,
            timestamp: new Date(),
        };

        try {
            const userId = storageService.getItem('userInfo').user.id; // Replace with actual user ID
            const data = {
                userId: userId,
                pointOptionsId: selectedPackage.id,
            };

            const response = await PayosAPI.goCheckout(data);
            if (response.data && response.data.checkoutUrl) {
                window.location.href = response.data.checkoutUrl;
            } else {
                alert('Failed to get checkout URL. Please try again.');
            }
            alert(`Purchased ${totalPoints} points successfully!`);
        } catch (error) {
            console.error('Failed to complete purchase:', error);
            alert('Failed to complete purchase. Please try again.');
        }
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    {/* Left Column - Point Packages */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Choose Points Package
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {pointOptions.map((pkg) => (
                                <Paper
                                    key={pkg.id}
                                    sx={{
                                        p: 2,
                                        cursor: 'pointer',
                                        bgcolor: selectedPackage?.id === pkg.id ? 'primary.50' : 'background.paper',
                                        border: selectedPackage?.id === pkg.id ? '3px solid' : '1px solid',
                                        borderColor: selectedPackage?.id === pkg.id ? 'primary.main' : 'grey.300',
                                        boxShadow: selectedPackage?.id === pkg.id ? 4 : 1,
                                        transform: selectedPackage?.id === pkg.id ? 'scale(1.02)' : 'scale(1)',
                                        transition: 'all 0.3s ease',
                                    }}
                                    onClick={() => setSelectedPackage(pkg)}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                {pkg.name}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {pkg.description}
                                            </Typography>
                                        </Box>
                                        <Box textAlign="right">
                                            <Typography variant="h6" color="primary">
                                                {pkg.point} Points
                                            </Typography>
                                            <Typography variant="body2" color="success.main">
                                                {formatCurrency(pkg.amount)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Paper>
                            ))}
                        </Box>
                    </Grid>

                    {/* Right Column - Purchase Summary */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Purchase Summary
                        </Typography>
                        <Paper sx={{ p: 3, bgcolor: 'grey.100' }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Typography>Base Points</Typography>
                                <Typography fontWeight="bold">{selectedPackage?.point} Points</Typography>
                            </Box>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Typography>Price</Typography>
                                <Typography color="success.main">{formatCurrency(selectedPackage?.amount)}</Typography>
                            </Box>
                            <Divider sx={{ my: 2 }} />
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    mb: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight="bold">
                                    Total Points
                                </Typography>
                                <Typography variant="h6" color="primary">
                                    {calculateTotalPoints()} Points
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={handlePurchase}
                                sx={{ mt: 2 }}
                                disabled={!selectedPackage}
                            >
                                Purchase Points
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default PointPurchase;
