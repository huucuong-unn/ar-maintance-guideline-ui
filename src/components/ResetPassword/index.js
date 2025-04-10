import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import AccountAPI from '~/API/AccountAPI';

const validationSchema = yup.object().shape({
    newPassword: yup.string().required('New password is required').min(8, 'Password must be at least 8 characters'),
    confirmPassword: yup
        .string()
        .required('Confirm password is required')
        .oneOf([yup.ref('newPassword'), null], 'Passwords must match'),
});

function ResetPasswordDialog({ open, onClose, userId, userEmail }) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: yupResolver(validationSchema),
        defaultValues: {
            newPassword: '',
            confirmPassword: '',
        },
    });

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        try {
            const response = await AccountAPI.resetPasswordStaff(userId, data.newPassword);
            if (response?.result) {
                toast.success('Password has been reset successfully');
                reset();
                onClose();
            }
        } catch (error) {
            console.error('Failed to reset password:', error);
            let errorMessage = 'An error occurred while resetting the password.';
            if (error.response && error.response.data) {
                errorMessage = error.response.data.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogContent>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1, px: 2 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Reset password for user: <strong>{userEmail}</strong>
                    </Typography>

                    <Controller
                        name="newPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="New Password"
                                type="password"
                                error={!!errors.newPassword}
                                helperText={errors.newPassword?.message}
                            />
                        )}
                    />

                    <Controller
                        name="confirmPassword"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                margin="normal"
                                required
                                fullWidth
                                label="Confirm New Password"
                                type="password"
                                error={!!errors.confirmPassword}
                                helperText={errors.confirmPassword?.message}
                            />
                        )}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={isSubmitting}
                        sx={{
                            mt: 3,
                            mb: 2,
                            bgcolor: '#051D40',
                            py: 1.5,
                            fontSize: '16px',
                            ':hover': { bgcolor: '#051D40', opacity: 0.8 },
                            position: 'relative',
                            height: '52px',
                        }}
                    >
                        {isSubmitting ? (
                            <CircularProgress
                                size={24}
                                sx={{
                                    color: 'white',
                                    position: 'absolute',
                                    top: '50%',
                                    left: '50%',
                                    marginTop: '-12px',
                                    marginLeft: '-12px',
                                }}
                            />
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} disabled={isSubmitting}>
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ResetPasswordDialog;
