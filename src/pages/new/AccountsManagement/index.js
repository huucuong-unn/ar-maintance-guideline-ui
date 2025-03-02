import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Modal,
    Paper,
    Select,
    TextField,
    Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { useEffect, useState } from 'react';
import AccountAPI from '~/API/AccountAPI';
import adminLoginBackground from '~/assets/images/adminlogin.webp';

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
                const response = await AccountAPI.getAllAccount(params);
                var data = response?.result?.objectList || [];
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

    const columns = [
        { field: 'email', headerName: 'Email', width: 200 },
        { field: 'phone', headerName: 'Phone', width: 200 },
        {
            field: 'roleName',
            headerName: 'Role',
            width: 200,
        },
        {
            field: 'company',
            headerName: 'Company',
            width: 200,
            renderCell: (params) => {
                return params.row.company?.companyName;
            },
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
                        color = 'grey';
                        break;
                    case 'PENDING':
                        color = 'orange';
                        break;
                    case 'REJECT':
                        color = 'red';
                        break;
                    default:
                        color = 'black';
                }
                return <Box sx={{ color, fontWeight: 'bold', textTransform: 'uppercase' }}>{params.value}</Box>;
            },
        },
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
                <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', px: '5%', height: '100%' }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            my: 5,
                        }}
                    >
                        Account Management
                    </Typography>
                    {/* ===================== CREATE + SEARCH & FILTER ROW ===================== */}
                    <Box
                        sx={{
                            display: 'flex',
                            gap: 2,
                            my: 3,
                            flexWrap: 'wrap',
                            width: '100%',
                            justifyContent: 'right',
                        }}
                    >
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
                        <Button variant="contained" onClick={() => setSearchParams({ email, status })}>
                            Search
                        </Button>
                    </Box>
                    {/* ===================== END CREATE + SEARCH & FILTER ROW ===================== */}

                    <Grid sx={{ borderRadius: '20px', backgroundColor: 'rgba(255, 255, 255, 0.8)', width: '100%' }}>
                        <Box
                            sx={{
                                my: 8,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '20px',
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
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
