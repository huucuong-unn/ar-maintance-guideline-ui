import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import adminLoginBackground from '~/assets/images/adminlogin.webp';

export default function PackagesDialog({
    userInfo,
    handleGoCheckoutSilverTee,
    handleGoCheckoutGoldenTee,
    isLoadingClickSilverTee,
    isLoadingClickGoldenTee,
    openPackagesDialog,
    handleClosePackagesDialog,
}) {
    return (
        <Dialog open={openPackagesDialog} onClose={handleClosePackagesDialog} fullWidth maxWidth="lg" sx={{}}>
            <DialogTitle>Subscription Packages</DialogTitle>
            <DialogContent
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${adminLoginBackground})`,
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        typography: 'body1',
                        mt: 6,
                        px: '2%',
                        display: 'flex',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                        minHeight: '500px',
                    }}
                >
                    {/* Free Package */}
                    <Box
                        sx={{
                            backgroundColor: '#051D40',
                            width: '32%',
                            height: '450px',
                            borderRadius: '20px',
                            p: 3.5,
                            textAlign: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, fontSize: 28, color: 'white' }}>
                            Gói Miễn Phí
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 700, fontSize: 48, color: 'white', mt: 2 }}
                        >
                            MIỄN PHÍ
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 500, fontSize: 25, color: 'white', mt: -1 }}
                        >
                            không mất phí
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{
                                mt: 2,
                                bgcolor: '#051D40',
                                borderRadius: '24px',
                                py: 1.5,
                                fontSize: 16,
                                ':hover': { bgcolor: '#02F18D', color: '#051D40' },
                                border: '1px solid #02F18D',
                            }}
                        >
                            Gói mặc định
                        </Button>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            1 lượt dùng AI Review CV
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            1 lượt dùng AI Cover Letter
                        </Typography>
                    </Box>

                    {/* Silver Package */}
                    <Box
                        sx={{
                            backgroundColor: '#051D40',
                            width: '32%',
                            height: '450px',
                            borderRadius: '20px',
                            p: 3.5,
                            textAlign: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, fontSize: 28, color: 'white' }}>
                            Gói Bạc
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 700, fontSize: 48, color: 'white', mt: 2 }}
                        >
                            50.000 VND
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 500, fontSize: 25, color: 'white', mt: -1 }}
                        >
                            tháng
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={userInfo?.planType === 'Silver Tee' ? null : handleGoCheckoutSilverTee}
                            sx={{
                                mt: 2,
                                bgcolor: '#051D40',
                                borderRadius: '24px',
                                py: 1.5,
                                fontSize: 16,
                                ':hover': { bgcolor: '#02F18D', color: '#051D40' },
                                border: '1px solid #02F18D',
                                maxHeight: '54px',
                            }}
                        >
                            {userInfo?.planType === 'Silver Tee' ? (
                                'Gói hiện tại'
                            ) : isLoadingClickSilverTee ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Đăng ký ngay'
                            )}
                        </Button>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            30 lượt dùng AI Review CV
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            20 lượt dùng AI Cover Letter
                        </Typography>
                    </Box>

                    {/* Golden Package */}
                    <Box
                        sx={{
                            backgroundColor: '#051D40',
                            width: '32%',
                            height: '450px',
                            borderRadius: '20px',
                            p: 3.5,
                            textAlign: 'center',
                        }}
                    >
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 700, fontSize: 28, color: 'white' }}>
                            Gói Vàng
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 700, fontSize: 48, color: 'white', mt: 2 }}
                        >
                            70.000 VND
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 500, fontSize: 25, color: 'white', mt: -1 }}
                        >
                            tháng
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={userInfo?.planType === 'Golden Tee' ? null : handleGoCheckoutGoldenTee}
                            sx={{
                                mt: 2,
                                bgcolor: '#051D40',
                                borderRadius: '24px',
                                py: 1.5,
                                fontSize: 16,
                                ':hover': { bgcolor: '#02F18D', color: '#051D40' },
                                border: '1px solid #02F18D',
                                maxHeight: '54px',
                            }}
                        >
                            {userInfo?.planType === 'Golden Tee' ? (
                                'Gói Hiện Tại'
                            ) : isLoadingClickGoldenTee ? (
                                <CircularProgress size={24} />
                            ) : (
                                'Đăng ký ngay'
                            )}
                        </Button>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            50 lượt dùng AI Review CV
                        </Typography>
                        <Typography
                            component="h1"
                            variant="h4"
                            sx={{ fontWeight: 300, fontSize: 24, color: '#fff', mt: 2 }}
                        >
                            40 lượt dùng AI Cover Letter
                        </Typography>
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClosePackagesDialog}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
