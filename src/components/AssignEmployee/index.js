import {
    Autocomplete,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    TextField,
} from '@mui/material';

import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';
import AccountAPI from '~/API/AccountAPI';
// import AssignAPI from '~/API/AssignAPI'; // <-- Suppose you have an API for creating an assignment
import { toast } from 'react-toastify'; // If you want to show success/error toasts
import AssignGuidelineAPI from '~/API/AssignGuidelineAPI';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

const AssignEmployee = ({ courseId, managerId, companyId }) => {
    // Autocomplete states
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);

    // Track the user selected in Autocomplete
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Confirm dialog states
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    // --------------------- Autocomplete logic ---------------------
    const handleOpen = () => {
        setOpen(true);
        (async () => {
            setLoading(true);
            try {
                const response = await AccountAPI.getStaffByCompanyId(companyId);
                console.log('employeeList', response?.result?.objectList);
                setOptions(response?.result?.objectList || []);
            } catch (error) {
                console.error('Failed to load employees:', error);
            } finally {
                setLoading(false);
            }
        })();
    };

    const handleClose = () => {
        setOpen(false);
        setOptions([]);
    };

    // --------------------- Fetch Assigned employees (if needed) ---------------------
    const fetchAssignEmployee = async (courseId) => {
        try {
            const response = await AssignGuidelineAPI.getAssignGuidelinesByGuidelineId(courseId);
            console.log('response', response);
            // setAssignedEmployees();
            const assignments = response?.result || [];
            setRows(processAssignments(assignments));
            setTotal(response?.result?.totalItems || 0);
        } catch (error) {
            console.log('error', error);
        }
    };

    useEffect(() => {
        fetchAssignEmployee(courseId);
    }, [courseId]);

    // --------------------- Confirm Dialog logic ---------------------
    const handleClickAssign = () => {
        if (!selectedEmployee) {
            toast.error('Please select an employee first.');
            return;
        }
        setConfirmOpen(true);
    };

    const handleCloseConfirm = () => {
        setConfirmOpen(false);
    };

    const handleConfirmAssign = async () => {
        setIsAssigning(true);
        try {
            const data = {
                guidelineId: courseId,
                employeeId: selectedEmployee.id,
                managerId: managerId,
            };
            const response = await AssignGuidelineAPI.createAssignGuideline(data);
            if (response) toast.success(`Assigned ${selectedEmployee.email} successfully!`);
            fetchAssignEmployee(courseId);
        } catch (error) {
            console.error('Failed to assign employee:', error);
            // toast.error('Failed to assign employee. Please try again.');
        } finally {
            setIsAssigning(false);
            setConfirmOpen(false);
        }
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString(); // Adjust format as needed
    }

    const processAssignments = (data) => {
        return data.map((assign) => ({
            id: assign.id,
            employeeEmail: assign.employee.email,
            managerEmail: assign.manager.email,
            createdDate: formatDate(assign.createdDate),
            status: assign.status,
        }));
    };

    const columns = [
        { field: 'employeeEmail', headerName: 'Employee Email', width: 250 },
        { field: 'managerEmail', headerName: 'Manager Email', width: 250 },
        { field: 'createdDate', headerName: 'Created Date', width: 200 },
        { field: 'status', headerName: 'Status', width: 150 },
    ];

    // --------------------- Render ---------------------
    return (
        <Grid>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <Autocomplete
                    sx={{ width: 300 }}
                    open={open}
                    onOpen={handleOpen}
                    onClose={handleClose}
                    isOptionEqualToValue={(option, value) => option.email === value.email}
                    getOptionLabel={(option) => option.email}
                    options={options}
                    loading={loading}
                    value={selectedEmployee}
                    onChange={(event, newValue) => setSelectedEmployee(newValue)}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Select Employee"
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />

                {/* Button to open the confirm dialog */}
                <Button variant="contained" onClick={handleClickAssign} sx={{ padding: '12px 20px' }}>
                    Assign
                </Button>
            </Box>

            <Box sx={{ mt: 3 }}>
                <Paper sx={{ height: 450, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        initialState={{
                            pagination: {
                                paginationModel: {
                                    pageSize: 10,
                                },
                            },
                        }}
                        pageSizeOptions={[10]}
                        sx={{ border: 'none', backgroundColor: 'rgba(255, 255, 255, 0.8)' }}
                        getRowId={(row) => row.id}
                        slots={{ toolbar: GridToolbar }}
                    />
                </Paper>
            </Box>

            {/* Confirm Dialog */}
            <Dialog open={confirmOpen} onClose={handleCloseConfirm}>
                <DialogTitle>Confirm Assignment</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to assign <strong>{selectedEmployee?.email || 'this employee'}</strong> to
                        this course?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirm} disabled={isAssigning}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmAssign} disabled={isAssigning} variant="contained">
                        {isAssigning ? <CircularProgress size={20} /> : 'Yes, Assign'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Grid>
    );
};

export default AssignEmployee;
