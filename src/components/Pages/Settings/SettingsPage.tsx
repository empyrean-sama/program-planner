import { useState } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
    Stack,
} from '@mui/material';
import {
    DeleteForever as DeleteIcon,
    FileUpload as ImportIcon,
    FileDownload as ExportIcon,
    Warning as WarningIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

export default function SettingsPage() {
    const theme = useTheme();
    const globalState = useAppGlobalState();
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleDestroyData = async () => {
        try {
            // Destroy both tasks and stories to completely wipe all application data
            const [taskResult, storyResult] = await Promise.all([
                window.taskAPI.destroyAllData(),
                window.storyAPI.destroyAllData(),
            ]);
            
            if (taskResult.success && storyResult.success) {
                globalState.showToast('All data has been successfully destroyed', 'success', 4000);
            } else {
                const errors = [];
                if (!taskResult.success) errors.push(`Tasks: ${taskResult.error}`);
                if (!storyResult.success) errors.push(`Stories: ${storyResult.error}`);
                globalState.showToast(`Failed to destroy data: ${errors.join(', ')}`, 'error', 5000);
            }
        } catch (error) {
            globalState.showToast('Error destroying data: ' + (error as Error).message, 'error', 5000);
        }
        setDeleteDialogOpen(false);
    };

    const handleExportData = async () => {
        try {
            const result = await window.appAPI.exportAllData();
            if (result.success) {
                globalState.showToast('All data exported successfully to: ' + result.filePath, 'success', 5000);
            } else {
                globalState.showToast('Failed to export data: ' + result.error, 'error', 5000);
            }
        } catch (error) {
            globalState.showToast('Error exporting data: ' + (error as Error).message, 'error', 5000);
        }
    };

    const handleImportData = async () => {
        try {
            const result = await window.appAPI.importAllData();
            if (result.success) {
                let message = 'All data imported successfully';
                if (result.warnings && result.warnings.length > 0) {
                    message += ' (Warnings: ' + result.warnings.join(', ') + ')';
                }
                globalState.showToast(message, 'success', 5000);
            } else {
                globalState.showToast('Failed to import data: ' + result.error, 'error', 5000);
            }
        } catch (error) {
            globalState.showToast('Error importing data: ' + (error as Error).message, 'error', 5000);
        }
    };

    return (
        <Container maxWidth="md" sx={{ py: 3 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Settings
            </Typography>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Data Management
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Manage your application data with import, export, and reset options.
                </Typography>

                <Stack spacing={2}>
                    <Box>
                        <Button
                            variant="contained"
                            startIcon={<ExportIcon />}
                            onClick={handleExportData}
                            sx={{ mr: 2 }}
                        >
                            Export All Data
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                            Export all your tasks and stories to a single JSON file
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            variant="outlined"
                            startIcon={<ImportIcon />}
                            onClick={handleImportData}
                            sx={{ mr: 2 }}
                        >
                            Import All Data
                        </Button>
                        <Typography variant="caption" color="text.secondary">
                            Import tasks and stories from a JSON file (supports both unified and legacy formats)
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ mr: 2 }}
                        >
                            Destroy All Data
                        </Button>
                        <Typography variant="caption" color="error">
                            Permanently delete all tasks, stories, and application data
                        </Typography>
                    </Box>
                </Stack>
            </Paper>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={() => setDeleteDialogOpen(false)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <WarningIcon color="error" />
                    Destroy All Data
                </DialogTitle>
                <DialogContent>
                    <Alert severity="error" sx={{ mb: 2 }}>
                        This action cannot be undone!
                    </Alert>
                    <Typography>
                        Are you sure you want to permanently delete all your tasks, stories, schedule entries, 
                        comments, and application data? This will reset the application to its initial state.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDestroyData}
                        color="error"
                        variant="contained"
                        startIcon={<DeleteIcon />}
                    >
                        Yes, Destroy All Data
                    </Button>
                </DialogActions>
            </Dialog>

        </Container>
    );
}