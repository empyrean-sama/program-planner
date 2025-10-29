import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Chip,
    Box,
    LinearProgress,
} from '@mui/material';
import { Story } from '../../../types/Story';

interface StoryCardProps {
    story: Story;
    onClick: () => void;
}

export default function StoryCard({ story, onClick }: StoryCardProps) {
    const getStateColor = (state: string): 'default' | 'primary' | 'success' => {
        switch (state) {
            case 'Filed': return 'default';
            case 'Running': return 'primary';
            case 'Finished': return 'success';
            default: return 'default';
        }
    };

    const getStateLabel = (state: string): string => {
        return state;
    };

    return (
        <Card
            sx={{
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                },
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
            onClick={onClick}
        >
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="div" sx={{ flex: 1, fontWeight: 600 }}>
                        {story.title}
                    </Typography>
                    <Chip
                        label={getStateLabel(story.state)}
                        color={getStateColor(story.state)}
                        size="small"
                        sx={{ ml: 1 }}
                    />
                </Box>

                {/* Description */}
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mb: 2,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '2.5em',
                    }}
                >
                    {story.description || 'No description'}
                </Typography>

                {/* Progress */}
                <Box sx={{ mt: 'auto' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                            Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                            {story.progress}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={story.progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            mb: 1,
                        }}
                    />

                    {/* Stats */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Tasks
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {story.taskIds.length}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Points
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {story.completedPoints} / {story.totalPoints}
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
