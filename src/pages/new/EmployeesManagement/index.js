import {
    Box,
    Button,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AccountAPI from '~/API/AccountAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import storageService from '~/components/StorageService/storageService';

function Copyright(props) {
    return (
        <Typography variant="body2" color="text.secondary" align="center" {...props}>
            {'Copyright ©Tortee '}
            {new Date().getFullYear()}
            {'.'}
        </Typography>
    );
}

const defaultTheme = createTheme();

export default function EmployeesManagement() {
    const [rows, setRows] = useState([]);
    const [searchParams, setSearchParams] = useState({
        username: '',
        email: '',
        status: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const userInfo = storageService.getItem('userInfo')?.user || null;
    const [total, setTotal] = useState(0);

    // Dialog state for creating employee
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        avatar: '',
        company: userInfo?.company?.companyName || '',
        status: 'ACTIVE',
        expirationDate: '',
        isPayAdmin: false,
        roleName: 'STAFF',
    });
    const [passwordError, setPasswordError] = useState('');

    // --- State for confirm status change dialog ---
    const [openStatusConfirmDialog, setOpenStatusConfirmDialog] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
    // --- State for Reset Password dialog ---
    const [openResetPasswordDialog, setOpenResetPasswordDialog] = useState(false);
    const [resetEmployeeId, setResetEmployeeId] = useState(null);
    const [newPassword, setNewPassword] = useState('');

    const handleOpenCreateDialog = () => {
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
        setNewEmployee({
            email: '',
            password: '',
            confirmPassword: '',
            phone: '',
            avatar: '',
            company: userInfo?.company?.companyName || '',
            status: 'ACTIVE',
            expirationDate: '',
            isPayAdmin: false,
            roleName: 'STAFF',
        });
        setPasswordError('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewEmployee({
            ...newEmployee,
            [name]: value,
        });

        // Password validation
        if (name === 'confirmPassword' || name === 'password') {
            if (name === 'confirmPassword' && value !== newEmployee.password) {
                setPasswordError('Passwords do not match');
            } else if (name === 'password' && newEmployee.confirmPassword && value !== newEmployee.confirmPassword) {
                setPasswordError('Passwords do not match');
            } else {
                setPasswordError('');
            }
        }
    };

    const handleCreateEmployee = async () => {
        if (!newEmployee.email || !newEmployee.password || !newEmployee.confirmPassword) {
            return;
        }
        if (passwordError) {
            return;
        }
        try {
            const response = await AccountAPI.createStaff(newEmployee);
            if (response?.result?.user) {
                toast.success('Create employee successfully');
            }
            handleCloseCreateDialog();
            fetchData();
        } catch (error) {
            console.error('Failed to create employee:', error);
            toast.error(`Create employee failed. ${error?.response?.data?.message}`);
        }
    };

    // Open confirm dialog for status change
    const handleOpenStatusConfirm = (id) => {
        setSelectedEmployeeId(id);
        setOpenStatusConfirmDialog(true);
    };

    const handleChangeStatus = async (id) => {
        try {
            const response = await AccountAPI.changeStatusStaff(id);
            if (response?.result) {
                toast.success('Update status successfully');
            }
            fetchData();
        } catch (error) {
            console.error('Failed to update status:', error);
            toast.error('Failed to update status. ' + error?.response?.data?.message);
        }
    };

    // Open Reset Password dialog
    const handleOpenResetPassword = (id) => {
        setResetEmployeeId(id);
        setNewPassword('');
        setOpenResetPasswordDialog(true);
    };

    const handleResetPassword = async () => {
        try {
            const response = await AccountAPI.resetPasswordStaff(resetEmployeeId, { password: newPassword });
            if (response?.result) {
                toast.success('Reset password successfully');
            }
            fetchData();
            setOpenResetPasswordDialog(false);
        } catch (error) {
            console.error('Failed to reset password:', error);
            toast.error('Failed to reset password. ' + error?.response?.data?.message);
        }
    };

    const columns = [
        { field: 'email', headerName: 'Email', width: 300 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        {
            field: 'createdDate',
            headerName: 'Created Date',
            width: 200,
            renderCell: (params) => formatDate(params.value),
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => {
                let color = 'black';
                switch (params.value) {
                    case 'ACTIVE':
                        color = 'green';
                        break;
                    case 'INACTIVE':
                        color = 'orange';
                        break;
                    default:
                        color = 'black';
                }
                return <Box sx={{ color, fontWeight: 'bold', textTransform: 'uppercase' }}>{params.value}</Box>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 400,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        {currentStatus === 'ACTIVE' ? (
                            <Button
                                variant="contained"
                                color="error"
                                size="small"
                                onClick={() => handleOpenStatusConfirm(params.row.id)}
                            >
                                Disable
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleOpenStatusConfirm(params.row.id)}
                            >
                                Active
                            </Button>
                        )}
                        <Button variant="outlined" size="small" onClick={() => handleOpenResetPassword(params.row.id)}>
                            Reset Password
                        </Button>
                    </Box>
                );
            },
        },
    ];

    const fetchData = async () => {
        try {
            const pageParam = paginationModel.page + 1;
            const sizeParam = paginationModel.pageSize;
            const params = {
                page: pageParam,
                size: sizeParam,
                username: searchParams.username || undefined,
                email: searchParams.email || undefined,
                status: searchParams.status || undefined,
            };
            const response = await AccountAPI.getStaffByCompanyId(userInfo?.company?.id, params, params);
            const data = response?.result?.objectList || [];
            setRows(data);
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.error('Failed to fetch accounts:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [paginationModel, searchParams]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getUTCDate().toString().padStart(2, '0');
        const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
        const year = date.getUTCFullYear();
        return `${month}/${day}/${year}`;
    };

    return (
        <ThemeProvider theme={defaultTheme}>
            <Container
                maxWidth="xl"
                sx={{
                    py: 4,
                    minHeight: '100vh',
                    background: `url(${adminLoginBackground}) no-repeat center center`,
                    backgroundSize: 'cover',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Box sx={{ mb: 4 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '36px',
                            color: '#051D40',
                            mb: 4,
                        }}
                    >
                        Employees Management
                    </Typography>

                    {/* Search and Filter Section */}
                    <Box sx={{ mb: 4 }}>
                        <Button
                            variant="contained"
                            sx={{
                                bgcolor: '#02F18D',
                                color: '#051D40',
                                '&:hover': {
                                    bgcolor: '#051D40',
                                    color: 'white',
                                },
                                p: 2,
                            }}
                            onClick={handleOpenCreateDialog}
                        >
                            Create Employee
                        </Button>
                    </Box>

                    {/* Data Grid */}
                    <Paper
                        sx={{
                            height: 500,
                            width: '100%',
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: 2,
                            overflow: 'hidden',
                        }}
                    >
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) =>
                                setPaginationModel((prev) => ({
                                    ...prev,
                                    page: newModel.page,
                                }))
                            }
                            sx={{ border: 'none' }}
                            getRowId={(row) => row.id}
                            slots={{ toolbar: GridToolbar }}
                        />
                    </Paper>
                </Box>

                <Box sx={{ mt: 'auto' }}>
                    <Copyright />
                </Box>

                {/* Create Employee Dialog */}
                <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Employee</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField
                                required
                                fullWidth
                                label="Email"
                                name="email"
                                value={newEmployee.email}
                                onChange={handleInputChange}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Password"
                                name="password"
                                type="password"
                                value={newEmployee.password}
                                onChange={handleInputChange}
                            />

                            <TextField
                                required
                                fullWidth
                                label="Confirm Password"
                                name="confirmPassword"
                                type="password"
                                value={newEmployee.confirmPassword}
                                onChange={handleInputChange}
                                error={!!passwordError}
                                helperText={passwordError}
                            />

                            <TextField
                                fullWidth
                                label="Phone Number"
                                name="phone"
                                value={newEmployee.phone}
                                onChange={handleInputChange}
                            />

                            <TextField fullWidth label="Company" name="company" value={newEmployee.company} disabled />

                            <TextField fullWidth label="Role" name="roleName" value={newEmployee.roleName} disabled />

                            <TextField fullWidth label="Status" name="status" value={newEmployee.status} disabled />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseCreateDialog}>Cancel</Button>
                        <Button
                            onClick={handleCreateEmployee}
                            variant="contained"
                            color="primary"
                            disabled={
                                !newEmployee.email ||
                                !newEmployee.password ||
                                !newEmployee.confirmPassword ||
                                !!passwordError
                            }
                        >
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Confirm Status Change Dialog */}
                <Dialog
                    open={openStatusConfirmDialog}
                    onClose={() => setOpenStatusConfirmDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Are you sure to change status of this employee?</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenStatusConfirmDialog(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                handleChangeStatus(selectedEmployeeId);
                                setOpenStatusConfirmDialog(false);
                            }}
                            autoFocus
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Reset Password Dialog */}
                <Dialog
                    open={openResetPasswordDialog}
                    onClose={() => setOpenResetPasswordDialog(false)}
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Enter the new password for this employee.</DialogContentText>
                        <TextField
                            autoFocus
                            margin="dense"
                            label="New Password"
                            type="password"
                            fullWidth
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenResetPasswordDialog(false)}>Cancel</Button>
                        <Button
                            onClick={() => {
                                handleResetPassword();
                                setOpenResetPasswordDialog(false);
                            }}
                        >
                            Confirm
                        </Button>
                    </DialogActions>
                </Dialog>
            </Container>
        </ThemeProvider>
    );
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = date.getUTCDate().toString().padStart(2, '0');
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
}
