import React from 'react';
import { Box, Typography, Chip, IconButton } from '@mui/material';
import { FileText } from 'lucide-react';
import InfoIcon from '@mui/icons-material/Info';

const RevisionRequestMessageCard = ({ revision, getStatusColor, handleOpenRevisionDetail }) => {
    // Format date to be more compact
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FileText size={16} />
                    <Typography variant="body2" fontWeight="medium">
                        {revision.type
                            ? revision.type.charAt(0).toUpperCase() + revision.type.slice(1).toLowerCase()
                            : 'Revision request'}
                    </Typography>
                </Box>
            </Box>
            <Chip
                label={
                    (revision.modelFile && revision.status == 'REJECTED' ? 'Model ' : '') +
                    revision.status.charAt(0).toUpperCase() +
                    revision.status.slice(1).toLowerCase()
                }
                color={getStatusColor(revision.status)}
                size="small"
            />
            {/* Compact info row */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
                    pb: 1,
                }}
            >
                {/* Files count */}
                {revision.revisionFiles && (
                    <Typography variant="caption" color="text.secondary">
                        {revision.revisionFiles.length} file{revision.revisionFiles.length !== 1 ? 's' : ''}
                    </Typography>
                )}

                {/* Date */}
                <Typography variant="caption" color="text.secondary">
                    {formatDate(revision.createdDate)}
                </Typography>
            </Box>
            {/* Price proposal - only show if type is Modification and Price Proposal */}
            {(revision.type === 'Modification' || revision.type === 'Price Proposal') && revision.priceProposal && (
                <Typography variant="body2" fontWeight="medium" sx={{ color: 'primary.main' }}>
                    {revision.priceProposal} point
                </Typography>
            )}
            {/* View Details button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
                <IconButton
                    size="small"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleOpenRevisionDetail(revision);
                    }}
                    sx={{
                        fontSize: '0.75rem',
                        color: 'primary.main',
                        bgcolor: 'rgba(0, 132, 255, 0.1)',
                        '&:hover': {
                            bgcolor: 'rgba(0, 132, 255, 0.2)',
                        },
                        borderRadius: 1,
                        px: 1,
                    }}
                >
                    <Typography variant="caption" sx={{ mr: 0.5 }}>
                        View Details
                    </Typography>
                    <InfoIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );
};

export default RevisionRequestMessageCard;
