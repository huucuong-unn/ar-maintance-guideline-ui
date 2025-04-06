import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Grid,
    TextField,
    Typography,
    CircularProgress,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PointOptionsAPI from '~/API/PointOptionsAPI';
import EditIcon from '@mui/icons-material/Edit';
import adminLoginBackground from '~/assets/images/adminlogin.webp';

const defaultTheme = createTheme();

export default function PointOptionManagement() {
    const [rows, setRows] = useState([]);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 5,
    });
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // Dialog states
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteConfirmDialog, setOpenDeleteConfirmDialog] = useState(false);
    const [selectedPointOption, setSelectedPointOption] = useState(null);
    const [selectedPointOptionId, setSelectedPointOptionId] = useState(null);

    // Form fields
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [point, setPoint] = useState('');
    const [currency, setCurrency] = useState('VND');

    // Loading states for buttons
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [isChangingStatus, setIsChangingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPointOptions = async () => {
        try {
            setIsLoading(true);
            const response = await PointOptionsAPI.getAllPointOptionsAdmin();
            const data = response?.result || [];
            setRows(data);
            setTotal(data.length);
        } catch (error) {
            console.error('Failed to fetch point options:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPointOptions();
    }, []);

    const handleCreatePointOption = async () => {
        try {
            setIsCreating(true);
            const newPointOption = { name, amount, point, currency };
            const response = await PointOptionsAPI.createPointOptions(newPointOption);
            if (response?.result) {
                toast.success('Point option created successfully!');
                fetchPointOptions();
                handleCloseCreateDialog();
            }
        } catch (error) {
            console.error('Failed to create point option:', error);
            toast.error('Failed to create point option. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdatePointOption = async () => {
        try {
            setIsUpdating(true);
            const updatedPointOption = { name, amount, point, currency };
            const response = await PointOptionsAPI.updatePointOptions(selectedPointOption.id, updatedPointOption);
            if (response?.result) {
                toast.success('Point option updated successfully!');
                fetchPointOptions();
                handleCloseEditDialog();
            }
        } catch (error) {
            console.error('Failed to update point option:', error);
            toast.error('Failed to update point option. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleChangeStatus = async (id) => {
        try {
            setIsChangingStatus(true);
            const response = await PointOptionsAPI.changeStatus(id);
            toast.success('Point option status changed successfully!');
            fetchPointOptions();
        } catch (error) {
            console.error('Failed to change status:', error);
            toast.error('Failed to change status. Please try again.');
        } finally {
            setIsChangingStatus(false);
        }
    };

    const handleDeletePointOption = async () => {
        try {
            setIsDeleting(true);
            const response = await PointOptionsAPI.deletePointOptions(selectedPointOptionId);
            toast.success('Point option deleted successfully!');
            fetchPointOptions();
            handleCloseDeleteConfirmDialog();
        } catch (error) {
            console.error('Failed to delete point option:', error);
            toast.error('Point Option is currently in use');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenDeleteConfirmDialog = (id) => {
        setSelectedPointOptionId(id);
        setOpenDeleteConfirmDialog(true);
    };

    const handleCloseDeleteConfirmDialog = () => {
        setOpenDeleteConfirmDialog(false);
        setSelectedPointOptionId(null);
    };

    const handleOpenCreateDialog = () => {
        setName('');
        setAmount('');
        setPoint('');
        setCurrency('VND');
        setOpenCreateDialog(true);
    };

    const handleCloseCreateDialog = () => {
        setOpenCreateDialog(false);
    };

    const handleOpenEditDialog = (pointOption) => {
        setSelectedPointOption(pointOption);
        setName(pointOption.name);
        setAmount(pointOption.amount);
        setPoint(pointOption.point);
        setCurrency(pointOption.currency);
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setSelectedPointOption(null);
    };

    const columns = [
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'amount', headerName: 'Amount (VND)', width: 150 },
        { field: 'point', headerName: 'Points', width: 150 },
        { field: 'currency', headerName: 'Currency', width: 100 },
        {
            field: 'status',
            headerName: 'Status',
            width: 200,
            renderCell: (params) => {
                const color = params.value === 'ACTIVE' ? 'green' : params.value === 'INACTIVE' ? 'orange' : 'black';
                return <Box sx={{ color, fontWeight: 'bold', textTransform: 'uppercase' }}>{params.value}</Box>;
            },
        },
        {
            field: 'action',
            headerName: 'Action',
            width: 300,
            renderCell: (params) => {
                const currentStatus = params.row.status;
                return (
                    <Box sx={{ display: 'flex', gap: 1, height: '100%', alignItems: 'center' }}>
                        <Button
                            variant="contained"
                            size="small"
                            color={currentStatus === 'ACTIVE' ? 'warning' : 'success'}
                            onClick={() => {
                                handleChangeStatus(params.row.id);
                            }}
                            sx={{ width: '100px' }}
                        >
                            {currentStatus === 'ACTIVE' ? 'Disable' : 'Activate'}
                        </Button>

                        <Button
                            variant="contained"
                            size="small"
                            color="error"
                            onClick={() => {
                                handleOpenDeleteConfirmDialog(params.row.id);
                            }}
                            sx={{ width: '100px' }}
                        >
                            Delete
                        </Button>
                        <EditIcon
                            onClick={(event) => {
                                event.stopPropagation(); // Prevent row selection
                                console.log(params.row); // Debug: Log the row data
                                handleOpenEditDialog(params.row); // Open the edit dialog
                            }}
                            sx={{ cursor: 'pointer' }}
                        />
                    </Box>
                );
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
                }}
            >
                <Box sx={{ p: 4 }}>
                    <Typography
                        component="h1"
                        variant="h4"
                        sx={{
                            fontWeight: '900',
                            fontSize: '46px',
                            color: '#051D40',
                            mb: 4,
                        }}
                    >
                        {' '}
                        Point Option Management
                    </Typography>
                    <Button
                        variant="contained"
                        sx={{
                            bgcolor: '#051D40',
                            color: 'white',

                            '&:hover': {
                                bgcolor: '#02F18D',
                                color: '#051D40',
                            },
                            p: 2,
                            marginRight: 128,
                            marginBottom: 5,
                        }}
                        onClick={handleOpenCreateDialog}
                    >
                        Create Point Option
                    </Button>
                    <Paper sx={{ height: 400, width: '100%' }}>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            rowCount={total}
                            paginationMode="server"
                            paginationModel={paginationModel}
                            onPaginationModelChange={(newModel) => setPaginationModel(newModel)}
                            loading={isLoading}
                            components={{ Toolbar: GridToolbar }}
                            getRowId={(row) => row.id}
                        />
                    </Paper>

                    {/* Delete Confirmation Dialog */}
                    <Dialog open={openDeleteConfirmDialog} onClose={handleCloseDeleteConfirmDialog}>
                        <DialogTitle>Confirm Deletion</DialogTitle>
                        <DialogContent>
                            <DialogContentText>
                                Are you sure you want to delete this point option? This action cannot be undone.
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseDeleteConfirmDialog}>Cancel</Button>
                            <Button
                                onClick={handleDeletePointOption}
                                variant="contained"
                                color="error"
                                disabled={isDeleting}
                            >
                                {isDeleting ? <CircularProgress size={20} /> : 'Delete'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openEditDialog} onClose={handleCloseEditDialog} fullWidth maxWidth="sm">
                        <DialogTitle>Edit Point Option</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Points"
                                type="number"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseEditDialog}>Cancel</Button>
                            <Button
                                onClick={handleUpdatePointOption}
                                variant="contained"
                                color="primary"
                                disabled={isUpdating}
                            >
                                {isUpdating ? <CircularProgress size={20} /> : 'Update'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                    <Dialog open={openCreateDialog} onClose={handleCloseCreateDialog} fullWidth maxWidth="sm">
                        <DialogTitle>Create Point Option</DialogTitle>
                        <DialogContent>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Points"
                                type="number"
                                value={point}
                                onChange={(e) => setPoint(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={handleCloseCreateDialog}>Cancel</Button>
                            <Button
                                onClick={handleCreatePointOption}
                                variant="contained"
                                color="primary"
                                disabled={isCreating}
                            >
                                {isCreating ? <CircularProgress size={20} /> : 'Create'}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Box>
            </Grid>
        </ThemeProvider>
    );
}
