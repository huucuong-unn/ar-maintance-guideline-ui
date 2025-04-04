import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import { Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SubscriptionAPI from '~/API/SubscriptionAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';

export default function PackagesDialog({
    userInfo,
    handleGoCheckout,
    openPackagesDialog,
    handleClosePackagesDialog,
    subscriptions,
    currentPlan,
    currentCompanyPlanInfo,
}) {
    // State cho Delete và Update
    const [openConfirmDelete, setOpenConfirmDelete] = useState(false);
    const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [isCreateLoading, setIsCreateLoading] = useState(false);
    const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

    // State cho Create Subscription
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newSubscription, setNewSubscription] = useState({
        subscriptionCode: '',
        maxNumberOfUsers: '',
        maxStorageUsage: '',
        monthlyFee: '',
    });

    // Handlers cho Delete
    const handleDeleteClick = (subscription) => {
        setSelectedSubscription(subscription);
        setOpenConfirmDelete(true);
    };

    const handleConfirmDelete = async () => {
        try {
            const response = SubscriptionAPI.deleteSubscription(selectedSubscription.id);
            if (response) {
                toast.success(`Subscription deleted successfully.`);
                handleClosePackagesDialog();
            }
        } catch (error) {
            toast.error('Failed to delete subscription. ', error?.response?.data?.message);
        }
        setOpenConfirmDelete(false);
    };

    const handleCloseDeleteDialog = () => {
        setOpenConfirmDelete(false);
    };

    // Handlers cho Update
    const handleUpdateClick = (subscription) => {
        setSelectedSubscription(subscription);
        setOpenUpdateDialog(true);
    };

    const handleSubmitUpdate = () => {
        try {
            // Kiểm tra validation
            const { subscriptionCode, maxNumberOfUsers, maxStorageUsage, monthlyFee } = selectedSubscription;
            if (!subscriptionCode || !maxNumberOfUsers || !maxStorageUsage || !monthlyFee) {
                toast.error('All fields are required.');
                return;
            }

            setOpenUpdateDialog(false);
            const response = SubscriptionAPI.updateSubscription(selectedSubscription);
            if (response) {
                toast.success(`Subscription updated successfully.`);
                setOpenCreateDialog(false);
                handleClosePackagesDialog();
            }
        } catch (error) {
            toast.error('Failed to update subscription. ', error?.response?.data?.message);
        } finally {
            setIsCreateLoading(false);
        }
    };

    // Handlers cho Create Subscription
    const handleOpenCreateSubscription = () => {
        // Reset các trường
        setNewSubscription({
            subscriptionCode: '',
            maxNumberOfUsers: '',
            maxStorageUsage: '',
            monthlyFee: '',
        });
        setOpenCreateDialog(true);
    };

    const handleCloseCreateSubscription = () => {
        setOpenCreateDialog(false);
    };

    const handleChangeNewSubscription = (e) => {
        const { name, value } = e.target;
        setNewSubscription((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitCreate = async () => {
        try {
            setIsCreateLoading(true);
            const { subscriptionCode, maxNumberOfUsers, maxStorageUsage, monthlyFee } = newSubscription;
            if (!subscriptionCode || !maxNumberOfUsers || !maxStorageUsage || !monthlyFee) {
                toast.error('All fields are required.');
                return;
            }

            const payload = {
                ...newSubscription,
                status: 'ACTIVE',
            };

            const response = SubscriptionAPI.createSubscription(payload);
            if (response) {
                toast.success(`Subscription created successfully.`);
                setOpenCreateDialog(false);
                handleClosePackagesDialog();
            }
        } catch (error) {
            toast.error('Failed to create subscription. ', error?.response?.data?.message);
        } finally {
            setIsCreateLoading(false);
        }
    };

    // Format number helper
    const formatNumber = (number) => new Intl.NumberFormat('en-US').format(number);

    const handleCloseUpdateDialog = () => {
        setOpenUpdateDialog(false);
    };
    return (
        <>
            <Dialog open={openPackagesDialog} onClose={handleClosePackagesDialog} fullWidth maxWidth="lg">
                <DialogTitle>
                    Subscription Packages
                    {userInfo?.role?.roleName === 'ADMIN' && (
                        <Button
                            variant="contained"
                            size="small"
                            sx={{ ml: 2, float: 'right', py: 1 }}
                            onClick={handleOpenCreateSubscription}
                        >
                            Create
                        </Button>
                    )}
                </DialogTitle>
                <DialogContent
                    sx={{
                        backgroundRepeat: 'no-repeat',
                        backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundImage: `url(${adminLoginBackground})`,
                        p: 3,
                    }}
                >
                    <Grid container spacing={2} sx={{ mt: 3, justifyContent: 'center', alignItems: 'center' }}>
                        {subscriptions?.map((subscription, index) => (
                            <Grid item xs={12} md={4} key={index}>
                                <Box
                                    sx={{
                                        backgroundColor: '#051D40',
                                        height: '400px',
                                        borderRadius: '20px',
                                        p: 3,
                                        textAlign: 'center',
                                        position: 'relative',
                                        width: '100%',
                                    }}
                                >
                                    {userInfo?.role.roleName === 'ADMIN' && (
                                        <Box sx={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 1 }}>
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
                                        {formatNumber(subscription?.monthlyFee)} {subscription?.currency}
                                    </Typography>
                                    <Typography
                                        component="h1"
                                        variant="h4"
                                        sx={{ fontWeight: 500, fontSize: 25, color: 'white', mt: -1 }}
                                    >
                                        monthly
                                    </Typography>

                                    {userInfo.roleName !== 'ADMIN' && (
                                        <Button
                                            type="submit"
                                            fullWidth
                                            variant="contained"
                                            onClick={() => {
                                                handleGoCheckout(
                                                    subscription?.subscriptionCode,
                                                    subscription?.maxStorageUsage,
                                                    subscription?.maxNumberOfUsers,
                                                    subscription?.monthlyFee,
                                                );
                                            }}
                                            sx={
                                                userInfo?.currentPlan !== subscription?.subscriptionCode
                                                    ? {
                                                          mt: 2,
                                                          bgcolor: '#051D40',
                                                          borderRadius: '24px',
                                                          padding: '12px 0',
                                                          fontSize: '16px',
                                                          ':hover': {
                                                              bgcolor: '#02F18D',
                                                              color: '#051D40',
                                                          },
                                                          border: '1px solid #02F18D',
                                                          maxHeight: '54px',
                                                      }
                                                    : {
                                                          mt: 2,
                                                          borderRadius: '24px',
                                                          padding: '12px 0',
                                                          fontSize: '16px',
                                                          ':hover': {
                                                              bgcolor: '#02F18D',
                                                              color: '#051D40',
                                                          },
                                                          border: '1px solid #02F18D',
                                                          maxHeight: '54px',
                                                          bgcolor: '#02F18D',
                                                          color: '#051D40',
                                                      }
                                            }
                                        >
                                            {userInfo?.currentPlan === subscription?.subscriptionCode ? (
                                                'Current Plan'
                                            ) : isLoadingCheckout ? (
                                                <CircularProgress />
                                            ) : (
                                                'Subscribe'
                                            )}
                                        </Button>
                                    )}

                                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                                            <Typography sx={{ fontWeight: 500, fontSize: 20, color: '#fff', ml: 1 }}>
                                                {subscription?.maxNumberOfUsers} employees
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
                                            <Typography sx={{ fontWeight: 500, fontSize: 20, color: '#fff', ml: 1 }}>
                                                {subscription?.maxStorageUsage} {subscription?.storageUnit} storage
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
                    <DialogContentText>
                        Are you sure you want to delete the {selectedSubscription?.subscriptionCode} subscription
                        package?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Cancel</Button>
                    <Button onClick={() => handleConfirmDelete()} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Update Subscription Dialog */}
            <Dialog open={openUpdateDialog} onClose={handleCloseUpdateDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Update Subscription</DialogTitle>
                <DialogContent>
                    {selectedSubscription && (
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                fullWidth
                                required
                                label="Max Employees"
                                type="number"
                                value={selectedSubscription.maxNumberOfUsers || ''}
                                onChange={(e) =>
                                    setSelectedSubscription({
                                        ...selectedSubscription,
                                        maxNumberOfUsers: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                required
                                label="Max Storage (GB)"
                                type="number"
                                value={selectedSubscription.maxStorageUsage || ''}
                                onChange={(e) =>
                                    setSelectedSubscription({
                                        ...selectedSubscription,
                                        maxStorageUsage: e.target.value,
                                    })
                                }
                            />
                            <TextField
                                fullWidth
                                required
                                label="Monthly Fee"
                                type="number"
                                value={selectedSubscription.monthlyFee || ''}
                                onChange={(e) =>
                                    setSelectedSubscription({
                                        ...selectedSubscription,
                                        monthlyFee: e.target.value,
                                    })
                                }
                            />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseUpdateDialog}>Cancel</Button>
                    <Button onClick={handleSubmitUpdate} color="primary">
                        {isCreateLoading ? <CircularProgress /> : 'Save Changes'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Subscription Dialog */}
            <Dialog open={openCreateDialog} onClose={handleCloseCreateSubscription} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Subscription</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            required
                            label="Subscription Code"
                            name="subscriptionCode"
                            value={newSubscription.subscriptionCode}
                            onChange={handleChangeNewSubscription}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Max Employees"
                            type="number"
                            name="maxNumberOfUsers"
                            value={newSubscription.maxNumberOfUsers}
                            onChange={handleChangeNewSubscription}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Max Storage (GB)"
                            type="number"
                            name="maxStorageUsage"
                            value={newSubscription.maxStorageUsage}
                            onChange={handleChangeNewSubscription}
                        />
                        <TextField
                            fullWidth
                            required
                            label="Monthly Fee"
                            type="number"
                            name="monthlyFee"
                            value={newSubscription.monthlyFee}
                            onChange={handleChangeNewSubscription}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Status will be set automatically as ACTIVE.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseCreateSubscription}>Cancel</Button>
                    <Button onClick={() => handleSubmitCreate()} color="primary">
                        {isCreateLoading ? <CircularProgress /> : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
