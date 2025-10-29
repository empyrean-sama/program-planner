import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    InputAdornment,
    Chip,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router';
import { Story, StoryState } from '../../../types/Story';
import StoryCard from './StoryCard';
import useAppGlobalState from '../../../hooks/useAppGlobalState';

export default function StoriesPage() {
    const navigate = useNavigate();
    const { showToast } = useAppGlobalState();
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newStoryTitle, setNewStoryTitle] = useState('');
    const [newStoryDescription, setNewStoryDescription] = useState('');
    
    // Filtering and sorting state
    const [searchQuery, setSearchQuery] = useState('');
    const [stateFilter, setStateFilter] = useState<StoryState | 'all'>('all');
    const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'tasks' | 'points'>('recent');

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        setLoading(true);
        try {
            const result = await window.storyAPI.getAllStories();
            if (result.success && result.data) {
                setStories(result.data);
            } else {
                showToast(result.error || 'Failed to load stories', 'error');
            }
        } catch (error) {
            showToast('An error occurred while loading stories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStory = async () => {
        if (!newStoryTitle.trim()) {
            showToast('Story title is required', 'error');
            return;
        }

        try {
            const result = await window.storyAPI.createStory({
                title: newStoryTitle,
                description: newStoryDescription,
            });

            if (result.success && result.data) {
                showToast('Story created successfully', 'success');
                setCreateDialogOpen(false);
                setNewStoryTitle('');
                setNewStoryDescription('');
                loadStories();
            } else {
                showToast(result.error || 'Failed to create story', 'error');
            }
        } catch (error) {
            showToast('An error occurred while creating story', 'error');
        }
    };

    const handleStoryClick = (storyId: string) => {
        navigate(`/stories/${storyId}`);
    };

    const handleCloseDialog = () => {
        setCreateDialogOpen(false);
        setNewStoryTitle('');
        setNewStoryDescription('');
    };

    // Filter and sort stories
    const filteredAndSortedStories = stories
        .filter((story) => {
            // State filter
            if (stateFilter !== 'all' && story.state !== stateFilter) return false;
            
            // Search query
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                return (
                    story.title.toLowerCase().includes(query) ||
                    story.description.toLowerCase().includes(query)
                );
            }
            
            return true;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'recent':
                    return new Date(b.filingDateTime).getTime() - new Date(a.filingDateTime).getTime();
                case 'progress':
                    return b.progress - a.progress;
                case 'tasks':
                    return b.taskIds.length - a.taskIds.length;
                case 'points':
                    return b.totalPoints - a.totalPoints;
                default:
                    return 0;
            }
        });

    // Group stories by state
    const filedStories = filteredAndSortedStories.filter(s => s.state === 'Filed');
    const runningStories = filteredAndSortedStories.filter(s => s.state === 'Running');
    const finishedStories = filteredAndSortedStories.filter(s => s.state === 'Finished');

    return (
        <Box sx={{ p: 3 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        Stories
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setCreateDialogOpen(true)}
                    >
                        New Story
                    </Button>
                </Box>

                {/* Filters and Search */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    <TextField
                        placeholder="Search stories..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ minWidth: 300, flex: '1 1 auto' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                            label="All"
                            onClick={() => setStateFilter('all')}
                            color={stateFilter === 'all' ? 'primary' : 'default'}
                            variant={stateFilter === 'all' ? 'filled' : 'outlined'}
                        />
                        <Chip
                            label="Filed"
                            onClick={() => setStateFilter('Filed')}
                            color={stateFilter === 'Filed' ? 'default' : 'default'}
                            variant={stateFilter === 'Filed' ? 'filled' : 'outlined'}
                        />
                        <Chip
                            label="Running"
                            onClick={() => setStateFilter('Running')}
                            color={stateFilter === 'Running' ? 'primary' : 'default'}
                            variant={stateFilter === 'Running' ? 'filled' : 'outlined'}
                        />
                        <Chip
                            label="Finished"
                            onClick={() => setStateFilter('Finished')}
                            color={stateFilter === 'Finished' ? 'success' : 'default'}
                            variant={stateFilter === 'Finished' ? 'filled' : 'outlined'}
                        />
                    </Box>

                    <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as any)}
                        >
                            <MenuItem value="recent">Recent</MenuItem>
                            <MenuItem value="progress">Progress</MenuItem>
                            <MenuItem value="tasks">Tasks</MenuItem>
                            <MenuItem value="points">Points</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}>
                        <CircularProgress />
                    </Box>
                ) : filteredAndSortedStories.length === 0 ? (
                    <Box sx={{ textAlign: 'center', p: 8 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            {stories.length === 0 ? 'No stories yet' : 'No stories match your filters'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                            {stories.length === 0 
                                ? 'Create your first story to group related tasks together'
                                : 'Try adjusting your search or filters'
                            }
                        </Typography>
                        {stories.length === 0 && (
                            <Button
                                variant="contained"
                                startIcon={<AddIcon />}
                                onClick={() => setCreateDialogOpen(true)}
                            >
                                Create Story
                            </Button>
                        )}
                    </Box>
                ) : stateFilter === 'all' ? (
                    <Box>
                        {/* Running Stories */}
                        {runningStories.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Running ({runningStories.length})
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 2,
                                }}>
                                    {runningStories.map(story => (
                                        <StoryCard
                                            key={story.id}
                                            story={story}
                                            onClick={() => handleStoryClick(story.id)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Filed Stories */}
                        {filedStories.length > 0 && (
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Filed ({filedStories.length})
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 2,
                                }}>
                                    {filedStories.map(story => (
                                        <StoryCard
                                            key={story.id}
                                            story={story}
                                            onClick={() => handleStoryClick(story.id)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}

                        {/* Finished Stories */}
                        {finishedStories.length > 0 && (
                            <Box>
                                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                                    Finished ({finishedStories.length})
                                </Typography>
                                <Box sx={{ 
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                                    gap: 2,
                                }}>
                                    {finishedStories.map(story => (
                                        <StoryCard
                                            key={story.id}
                                            story={story}
                                            onClick={() => handleStoryClick(story.id)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </Box>
                ) : (
                    // Single state view
                    <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 2,
                    }}>
                        {filteredAndSortedStories.map(story => (
                            <StoryCard
                                key={story.id}
                                story={story}
                                onClick={() => handleStoryClick(story.id)}
                            />
                        ))}
                    </Box>
                )}

                {/* Create Story Dialog */}
                <Dialog open={createDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                    <DialogTitle>Create New Story</DialogTitle>
                    <DialogContent>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                            <TextField
                                label="Title"
                                fullWidth
                                value={newStoryTitle}
                                onChange={(e) => setNewStoryTitle(e.target.value)}
                                autoFocus
                            />
                            <TextField
                                label="Description"
                                fullWidth
                                multiline
                                rows={4}
                                value={newStoryDescription}
                                onChange={(e) => setNewStoryDescription(e.target.value)}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button onClick={handleCreateStory} variant="contained">
                            Create
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
    );
}
