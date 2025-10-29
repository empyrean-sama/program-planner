import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
} from '@mui/material';
import MarkdownTextarea from '../../Common/MarkdownTextarea';

interface CommentDialogProps {
    open: boolean;
    taskId: string;
    onClose: () => void;
    onCommentAdded: () => void;
}

export default function CommentDialog({
    open,
    taskId,
    onClose,
    onCommentAdded,
}: CommentDialogProps) {
    const [comment, setComment] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        setComment('');
        setError('');
        onClose();
    };

    const handleAdd = async () => {
        if (!comment.trim()) {
            setError('Comment cannot be empty');
            return;
        }

        const result = await window.taskAPI.addComment({
            taskId,
            text: comment.trim(),
        });

        if (result.success) {
            handleClose();
            onCommentAdded();
        } else {
            setError(result.error || 'Failed to add comment');
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle>Add Comment</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 1 }}>
                    <MarkdownTextarea
                        label="Comment"
                        value={comment}
                        onChange={setComment}
                        rows={6}
                        placeholder="Enter your comment... Supports markdown formatting"
                        error={!!error}
                        helperText={error}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleAdd} variant="contained">
                    Add
                </Button>
            </DialogActions>
        </Dialog>
    );
}
