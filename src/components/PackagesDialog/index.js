import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
    Grid,
    IconButton,
} from '@mui/material';
import { useState } from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import { Check } from 'lucide-react';

export default function PackagesDialog({
    userInfo,
    handleGoCheckout,
    openPackagesDialog,
    handleClosePackagesDialog,
    subscriptions,
}) {
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);

    const handleDeleteClick = (subscription) => {
        setSelectedSubscription(subscription);
        setOpenConfirmDelete(true);
    };

    const handleUpdateClick = (subscription) => {
        setSelectedSubscription(subscription);
        setOpenUpdateDialog(true);
    };

    const handleConfirmDelete = () => {
        // Implement delete functionality here
        console.log('Deleting subscription:', selectedSubscription);
        setOpenConfirmDelete(false);
    };

    const handleCloseDeleteDialog = () => {
        setOpenConfirmDelete(false);
    };

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    };

    const handleSubmitUpdate = () => {
        // Implement update functionality here
        console.log('Updating subscription:', selectedSubscription);
        setOpenUpdateDialog(false);
    };
    console.log('userInfo', userInfo);
    return (
        <>
            <Dialog open={openPackagesDialog} onClose={handleClosePackagesDialog} fullWidth maxWidth="lg">
                <DialogTitle>Subscription Packages</DialogTitle>
                <DialogContent
                    sx={{
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: `url(${adminLoginBackground})`,
                        padding: 3,
                    }}
                >
                    <Grid container spacing={2} sx={{ mt: 3, justifyContent: 'center', alignItems: 'center' }}>
                        {subscriptions?.map((subscription, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box
                                    sx={{
                                        backgroundColor: '#051D40',
                                        height: '450px',
                                        borderRadius: '20px',
                                        p: 3,
                                        textAlign: 'center',
                                        position: 'relative',
                                        width: '100%',
                                    }}
                                >
                                    {userInfo?.role.roleName === 'ADMIN' && (
                                        <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex' }}>
                                            <IconButton
                                                sx={{ color: 'white' }}
                                                onClick={() => handleUpdateClick(subscription)}
                                            >
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton
                                                sx={{ color: 'white' }}
                                                onClick={() => handleDeleteClick(subscription)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </Box>
                                    )}

                                    <Typography
                                        component="h1"
                                        variant="h4"
                                        sx={{ fontWeight: 700, fontSize: 28, color: 'white' }}
                                    >
                                        {subscription?.subscriptionCode}
                                    </Typography>
                                    <Typography
                                        component="h1"
                                        variant="h4"
                                        sx={{ fontWeight: 700, fontSize: 48, color: 'white', mt: 2 }}
                                    >
                                        {subscription?.monthlyFee}
                                    </Typography>
                                    <Typography
                                        component="h1"
                                        variant="h4"
                                        sx={{ fontWeight: 500, fontSize: 25, color: 'white', mt: -1 }}
                                    >
                                        monthly
                                    </Typography>
                                    {userInfo?.role?.roleName === 'ADMIN' && <></>}
                                    {userInfo?.role?.roleName === 'COMPANY' &&
                                        subscription?.subscriptionCode === userInfo?.currentPlan && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{
                                                    mt: 3,
                                                    bgcolor: '#02F18D',
                                                    borderRadius: '24px',
                                                    py: 1.5,
                                                    fontSize: 16,
                                                    color: '#051D40',
                                                    border: '1px solid #02F18D',
                                                    ':hover': { bgcolor: '#02F18D', color: '#051D40' },
                                                }}
                                            >
                                                Current Plan
                                            </Button>
                                        )}

                                    {userInfo?.role?.roleName === 'COMPANY' &&
                                        subscription?.subscriptionCode !== userInfo?.currentPlan && (
                                            <Button
                                                fullWidth
                                                variant="contained"
                                                sx={{
                                                    mt: 3,
                                                    bgcolor: '#051D40',
                                                    borderRadius: '24px',
                                                    py: 1.5,
                                                    fontSize: 16,
                                                    ':hover': { bgcolor: '#02F18D', color: '#051D40' },
                                                    border: '1px solid #02F18D',
                                                }}
                                                onClick={() => handleGoCheckout(subscription?.subscriptionCode)}
                                            >
                                                Purchase now
                                            </Button>
                                        )}
                                    {/* Container for features with aligned check icons */}
                                    <Box
                                        sx={{
                                            mt: 3,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 2,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '30px 1fr',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    color: 'white',
                                                }}
                                            >
                                                <Check />
                                            </Box>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: 20,
                                                    color: '#fff',
                                                    textAlign: 'left',
                                                    ml: 1,
                                                }}
                                            >
                                                {subscription?.maxEmployees} employees
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '30px 1fr',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'center', color: 'white' }}>
                                                <Check />
                                            </Box>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: 20,
                                                    color: '#fff',
                                                    textAlign: 'left',
                                                    ml: 1,
                                                }}
                                            >
                                                {subscription?.maxModels} models
                                            </Typography>
                                        </Box>

                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: '30px 1fr',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'center', color: 'white' }}>
                                                <Check />
                                            </Box>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    fontWeight: 500,
                                                    fontSize: 20,
                                                    color: '#fff',
                                                    textAlign: 'left',
                                                    ml: 1,
                                                }}
                                            >
                                                {subscription?.extraModelFee}$ /model extra
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClosePackagesDialog}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openConfirmDelete} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the {selectedSubscription?.subscriptionCode} subscription
                        package?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Subscription Dialog */}
            <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Update Subscription</DialogTitle>
                <DialogContent>
                    {selectedSubscription && (
                        <Box sx={{ mt: 2 }}>
                            {/* Add form fields for updating subscription here */}
                            <Typography variant="body1">
                                Edit fields for {selectedSubscription.subscriptionCode} subscription
                            </Typography>
                            {/* You can add form components here to edit subscription details */}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdateDialog}>Cancel</Button>
                    <Button onClick={handleSubmitUpdate} color="primary">
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
