import React from 'react';
import {
    ImageIcon,
    DollarSign,
    Send,
    Info,
    CheckCircle,
    AlertCircle,
    Paperclip,
    Calendar,
    Clock,
    User,
    ThumbsUp,
    Eye,
    Check,
    X,
} from 'lucide-react';
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
    Paper,
    Typography,
    TextField,
    Autocomplete,
} from '@mui/material';
import { getImage } from '~/Constant';
import CompanyRequestAPI from '~/API/CompanyRequestAPI';
import storageService from '~/components/StorageService/storageService';
import { toast } from 'react-toastify';
import ModelEditor from '~/components/ModelEditor';
import CloudUpload from '@mui/icons-material/CloudUpload';
import { useWallet } from '~/WalletContext';
import RequestRevisionCard from './RequestRevisionCard';

// Modified to accept props with the new data structure
const RequestRevisionList = ({ revisionRequests = [], fetchRevisionRequests }) => {
    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-6xl mx-auto">
                <header className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Design Request Dashboard</h1>
                    <p className="text-gray-600">Review requests and propose pricing</p>
                </header>

                <div className="space-y-6">
                    {revisionRequests.map((request) => (
                        <RequestRevisionCard
                            request={request}
                            fetchRevisionRequests={fetchRevisionRequests}
                            key={request.id}
                        ></RequestRevisionCard>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RequestRevisionList;
