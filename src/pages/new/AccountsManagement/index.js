import { createTheme, ThemeProvider } from '@mui/material/styles';
import adminLoginBackground from '~/assets/images/adminlogin.webp';
import {
    Box,
    Typography,
    Skeleton,
    TextField,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Modal,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import AccountAPI from '~/API/AccountAPI';

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

export default function AccountsManagement() {
    const [rows, setRows] = useState([]);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('');
    const [openModal, setOpenModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchParams, setSearchParams] = useState({
        email: '',
        status: '',
    });
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const pageParam = paginationModel.page + 1;
                const sizeParam = paginationModel.pageSize;

                const params = {
                    page: pageParam,
                    size: sizeParam,
                    email: searchParams.email || undefined,
                    status: searchParams.status || undefined,
                };

                console.log(params);

                const response = await AccountAPI.getAllAccount(params);
                console.log(response);

                const data = response?.result?.objectList || [];
                console.log(data);

                setRows(data);

                setTotal(response?.result?.totalItems || 0);
            } catch (error) {
                console.error('Failed to fetch accounts:', error);
            }
        };
        fetchData();
    }, [paginationModel, searchParams]);

    const handleOpenModal = async (id) => {
        try {
            const response = await AccountAPI.getUserById(id);
            const userData = response?.result;
            setSelectedUser(userData);
            setOpenModal(true);
        } catch (error) {
            console.error('Failed to fetch user details:', error);
        }
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedUser(null);
    };

    const handleChangeStatus = async (id, newStatus, isPendingStatus) => {
        try {
            const params = { status: newStatus, isPending: isPendingStatus };
            console.log(params);

            await AccountAPI.changeStatus(id, params);
            alert('Status updated successfully!');
            handleCloseModal();
            setPaginationModel((prev) => ({ ...prev })); // Refresh data
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        }
    };

    useEffect(() => {
        console.log(openModal);
    }, [openModal]);

    const columns = [
        { field: 'username', headerName: 'Username  ', width: 200 },
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        {
            field: 'roleName',
            headerName: 'Role',
            width: 200,
        },
        { field: 'status', headerName: 'Status', width: 200 },
    ];

    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid
                container
                component="main"
                item
                sx={{
                    backgroundRepeat: 'no-repeat',
                    backgroundColor: (t) => (t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900]),
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundImage: `url(${adminLoginBackground})`,
                    height: '100vh',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                }}
            >
                <Typography
                    component="h1"
                    variant="h4"
                    sx={{
                        fontWeight: '900',
                        fontSize: '46px',
                        color: '#051D40',
                        // zIndex: 1,
                        position: 'absolute',
                        top: '3%',
                        left: '20%',
                    }}
                >
                    Users
                </Typography>
                {/* ===================== CREATE + SEARCH & FILTER ROW ===================== */}
                <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    {/* Search by email */}
                    <TextField
                        variant="outlined"
                        label="Search by Email"
                        sx={{ width: '300px' }}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Filter by status */}
                    <FormControl sx={{ width: '200px' }}>
                        <InputLabel>Status</InputLabel>
                        <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="PENDING">Pending</MenuItem>
                            <MenuItem value="ACTIVE">Active</MenuItem>
                            <MenuItem value="INACTIVE">Inactive</MenuItem>
                            <MenuItem value="REJECT">Reject</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Create Course button */}
                    <Button variant="contained" sx={{ ml: 'auto' }} onClick={() => setSearchParams({ email, status })}>
                        Search
                    </Button>
                </Box>
                {/* ===================== END CREATE + SEARCH & FILTER ROW ===================== */}

                <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '90%' }}>
                    <Box
                        sx={{
                            my: 8,
                            mx: 4,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box sx={{ width: '100%', typography: 'body1' }}>
                            <Paper sx={{ height: 400, width: '100%' }}>
                                <DataGrid
                                    rows={rows}
                                    columns={columns}
                                    rowCount={total}
                                    paginationMode="server"
                                    paginationModel={paginationModel}
                                    onPaginationModelChange={(newModel) => {
                                        setPaginationModel((prev) => ({
                                            ...prev,
                                            page: newModel.page,
                                        }));
                                    }}
                                    getRowId={(row) => row.id}
                                    slots={{ toolbar: GridToolbar }}
                                    onRowClick={(params) => handleOpenModal(params.row.id)}
                                />
                            </Paper>

                            <Copyright sx={{ mt: 5 }} />
                        </Box>
                    </Box>
                </Grid>
                <Modal
                    open={openModal}
                    onClose={handleCloseModal}
                    aria-labelledby="user-modal-title"
                    aria-describedby="user-modal-description"
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 400,
                            bgcolor: 'background.paper',
                            border: '2px solid #000',
                            boxShadow: 24,
                            p: 4,
                            borderRadius: '10px',
                        }}
                    >
                        <Typography id="user-modal-title" variant="h6" component="h2">
                            User Details
                        </Typography>
                        {selectedUser && (
                            <Box>
                                <img
                                    // src={selectedUser.avatar}
                                    src="data:image/jpeg;base64,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"
                                    alt="Avatar"
                                    style={{ width: '100px', borderRadius: '50%', marginBottom: '10px' }}
                                />
                                <Typography>Username: {selectedUser.username}</Typography>
                                <Typography>Email: {selectedUser.email}</Typography>
                                <Typography>Phone: {selectedUser.phone}</Typography>
                                <Typography>Role: {selectedUser.role.roleName}</Typography>
                                <Typography>Company: {selectedUser.company.companyName}</Typography>
                                <Typography>Status: {selectedUser.status}</Typography>
                                <Typography>Expiration Date: {selectedUser.expirationDate}</Typography>
                                <Typography>
                                    Created Date: {new Date(selectedUser.createdDate).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                                    {selectedUser.status === 'PENDING' && (
                                        <>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleChangeStatus(selectedUser.id, 'ACTIVE', true)}
                                            >
                                                Accept
                                            </Button>
                                            <Button
                                                variant="contained"
                                                color="error"
                                                onClick={() => handleChangeStatus(selectedUser.id, 'REJECT', true)}
                                            >
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {selectedUser.status === 'ACTIVE' && (
                                        <Button
                                            variant="contained"
                                            color="warning"
                                            onClick={() => handleChangeStatus(selectedUser.id, 'INACTIVE', false)}
                                        >
                                            Inactive
                                        </Button>
                                    )}

                                    {selectedUser.status === 'INACTIVE' && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            onClick={() => handleChangeStatus(selectedUser.id, 'ACTIVE', false)}
                                        >
                                            Activate
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        )}
                        <Button onClick={handleCloseModal} variant="contained" sx={{ mt: 2 }}>
                            Close
                        </Button>
                    </Box>
                </Modal>
            </Grid>
        </ThemeProvider>
    );
}
