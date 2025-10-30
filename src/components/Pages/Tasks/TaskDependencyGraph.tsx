import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Box,
    Typography,
    CircularProgress,
    Chip,
    Stack,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';
import { Task } from '../../../types/Task';
import { Story } from '../../../types/Story';

interface TaskDependencyGraphProps {
    open: boolean;
    taskId: string;
    onClose: () => void;
}

interface GraphNode {
    id: string;
    task: Task;
    level: number;
    column: number;
    x: number;
    y: number;
}

interface StoryGroup {
    id: string;
    story: Story;
    taskIds: string[];
    bounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
    };
}

export default function TaskDependencyGraph({ open, taskId, onClose }: TaskDependencyGraphProps) {
    const theme = useTheme();
    const [loading, setLoading] = useState(false);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);
    const [storyGroups, setStoryGroups] = useState<StoryGroup[]>([]);
    const [error, setError] = useState('');
    const [zoom, setZoom] = useState(1);

    useEffect(() => {
        if (open && taskId) {
            loadGraph();
        }
    }, [open, taskId]);

    const loadGraph = async () => {
        setLoading(true);
        setError('');
        
        try {
            const [graphResult, storiesResult] = await Promise.all([
                window.taskAPI.getDependencyGraph(taskId),
                window.storyAPI.getAllStories()
            ]);
            
            if (graphResult.success && graphResult.data) {
                setEdges(graphResult.data.edges);
                
                // Calculate layout for the graph
                const layout = calculateLayout(graphResult.data.nodes, graphResult.data.edges, taskId);
                setNodes(layout);
                
                // Calculate story groups
                if (storiesResult.success && storiesResult.data) {
                    const groups = calculateStoryGroups(layout, storiesResult.data);
                    setStoryGroups(groups);
                }
            } else {
                setError(graphResult.error || 'Failed to load dependency graph');
            }
        } catch (err) {
            setError('An error occurred while loading the graph');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const calculateStoryGroups = (nodes: GraphNode[], allStories: Story[]): StoryGroup[] => {
        const groups: StoryGroup[] = [];
        
        allStories.forEach(story => {
            const tasksInStory = nodes.filter(node => 
                node.task.storyIds && node.task.storyIds.includes(story.id)
            );
            
            if (tasksInStory.length > 0) {
                const xs = tasksInStory.map(n => n.x);
                const ys = tasksInStory.map(n => n.y);
                
                groups.push({
                    id: story.id,
                    story,
                    taskIds: tasksInStory.map(n => n.id),
                    bounds: {
                        minX: Math.min(...xs) - 100,
                        maxX: Math.max(...xs) + 100,
                        minY: Math.min(...ys) - 60,
                        maxY: Math.max(...ys) + 60,
                    }
                });
            }
        });
        
        return groups;
    };

    const calculateLayout = (tasks: Task[], edges: { from: string; to: string }[], targetTaskId: string): GraphNode[] => {
        // Build adjacency list
        const adjList = new Map<string, string[]>();
        tasks.forEach(task => adjList.set(task.id, []));
        edges.forEach(edge => {
            const children = adjList.get(edge.from) || [];
            children.push(edge.to);
            adjList.set(edge.from, children);
        });

        // Calculate levels using BFS from leaf nodes (tasks with no predecessors)
        const levels = new Map<string, number>();
        const inDegree = new Map<string, number>();
        
        // Initialize in-degrees
        tasks.forEach(task => inDegree.set(task.id, 0));
        edges.forEach(edge => {
            inDegree.set(edge.to, (inDegree.get(edge.to) || 0) + 1);
        });

        // Find leaf nodes (no predecessors)
        const queue: string[] = [];
        tasks.forEach(task => {
            if (inDegree.get(task.id) === 0) {
                queue.push(task.id);
                levels.set(task.id, 0);
            }
        });

        // BFS to assign levels
        while (queue.length > 0) {
            const current = queue.shift()!;
            const currentLevel = levels.get(current) || 0;

            const children = adjList.get(current) || [];
            children.forEach(child => {
                const newLevel = currentLevel + 1;
                levels.set(child, Math.max(levels.get(child) || 0, newLevel));
                
                inDegree.set(child, (inDegree.get(child) || 0) - 1);
                if (inDegree.get(child) === 0) {
                    queue.push(child);
                }
            });
        }

        // Group nodes by level
        const levelGroups = new Map<number, Task[]>();
        tasks.forEach(task => {
            const level = levels.get(task.id) || 0;
            const group = levelGroups.get(level) || [];
            group.push(task);
            levelGroups.set(level, group);
        });

        // Calculate positions with compact spacing
        const nodeWidth = 160;
        const nodeHeight = 70;
        const horizontalSpacing = 180;
        const verticalSpacing = 100;

        const graphNodes: GraphNode[] = [];
        
        levelGroups.forEach((tasksInLevel, level) => {
            tasksInLevel.forEach((task, index) => {
                const y = level * verticalSpacing;
                const totalWidth = (tasksInLevel.length - 1) * horizontalSpacing;
                const x = (index * horizontalSpacing) - (totalWidth / 2);
                
                graphNodes.push({
                    id: task.id,
                    task,
                    level,
                    column: index,
                    x,
                    y,
                });
            });
        });

        return graphNodes;
    };

    const getNodeColor = (task: Task, isTarget: boolean): string => {
        if (isTarget) return theme.palette.primary.main;
        
        switch (task.state) {
            case 'Finished': return theme.palette.success.main;
            case 'Failed': return theme.palette.error.main;
            case 'Doing': return theme.palette.warning.main;
            case 'Scheduled': return theme.palette.info.main;
            case 'Filed': return theme.palette.grey[600];
            case 'Deferred': return '#9C27B0';
            case 'Removed': return theme.palette.grey[700];
            default: return theme.palette.grey[600];
        }
    };

    const getStoryColor = (storyId: string): string => {
        // Generate consistent colors for stories
        const colors = [
            '#5865F2', // Blurple
            '#43B581', // Green
            '#FAA61A', // Amber
            '#9C27B0', // Purple
            '#00BCD4', // Cyan
            '#FF5722', // Deep Orange
        ];
        
        const hash = storyId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));
    const handleResetZoom = () => setZoom(1);

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
                <DialogTitle>Task Relationships</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
                <DialogTitle>Task Relationships</DialogTitle>
                <DialogContent>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="error" variant="h6" gutterBottom>{error}</Typography>
                        <Button onClick={loadGraph} variant="outlined" sx={{ mt: 2 }}>Retry</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    const viewBox = nodes.length > 0
        ? {
            minX: Math.min(...nodes.map(n => n.x)) - 150,
            minY: Math.min(...nodes.map(n => n.y)) - 100,
            width: Math.max(...nodes.map(n => n.x)) - Math.min(...nodes.map(n => n.x)) + 300,
            height: Math.max(...nodes.map(n => n.y)) - Math.min(...nodes.map(n => n.y)) + 200,
        }
        : { minX: 0, minY: 0, width: 1000, height: 600 };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="xl" 
            fullWidth
            PaperProps={{
                sx: {
                    height: '90vh',
                    maxHeight: '90vh',
                    bgcolor: 'background.default',
                }
            }}
        >
            {/* Header */}
            <DialogTitle sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'background.paper',
            }}>
                <Box>
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                        Task Relationships
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Dependencies and story groupings
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                {nodes.length === 0 ? (
                    <Box sx={{ 
                        flex: 1, 
                        display: 'flex', 
                        flexDirection: 'column',
                        alignItems: 'center', 
                        justifyContent: 'center',
                        p: 4,
                        gap: 2,
                    }}>
                        <Typography variant="h6" color="text.secondary">
                            No Dependencies
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            This task has no prerequisite tasks or dependents.
                        </Typography>
                    </Box>
                ) : (
                    <>
                        {/* Zoom Controls */}
                        <Box sx={{ 
                            position: 'absolute', 
                            top: 80, 
                            right: 24, 
                            zIndex: 10,
                            display: 'flex',
                            gap: 1,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            p: 0.5,
                            boxShadow: 2,
                        }}>
                            <Tooltip title="Zoom In">
                                <IconButton size="small" onClick={handleZoomIn}>
                                    <ZoomInIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Reset Zoom">
                                <IconButton size="small" onClick={handleResetZoom}>
                                    <FitScreenIcon />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Zoom Out">
                                <IconButton size="small" onClick={handleZoomOut}>
                                    <ZoomOutIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>

                        {/* Graph Canvas */}
                        <Box sx={{ 
                            flex: 1, 
                            overflow: 'auto',
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                            backgroundImage: `
                                linear-gradient(${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px),
                                linear-gradient(90deg, ${alpha(theme.palette.divider, 0.05)} 1px, transparent 1px)
                            `,
                            backgroundSize: '20px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            p: 3,
                        }}>
                            <svg
                                width="100%"
                                height="100%"
                                viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
                                style={{ 
                                    minHeight: '400px',
                                    transform: `scale(${zoom})`,
                                    transition: 'transform 0.2s ease',
                                }}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                <defs>
                                    {/* Gradient for nodes */}
                                    <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopOpacity="0.9" />
                                        <stop offset="100%" stopOpacity="1" />
                                    </linearGradient>
                                    
                                    {/* Arrow marker */}
                                    <marker
                                        id="arrowhead"
                                        markerWidth="8"
                                        markerHeight="8"
                                        refX="7"
                                        refY="4"
                                        orient="auto"
                                    >
                                        <path 
                                            d="M 0 0 L 8 4 L 0 8 Z" 
                                            fill={alpha(theme.palette.text.secondary, 0.5)} 
                                        />
                                    </marker>
                                    
                                    {/* Glow filter for target */}
                                    <filter id="glow">
                                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                        <feMerge>
                                            <feMergeNode in="coloredBlur"/>
                                            <feMergeNode in="SourceGraphic"/>
                                        </feMerge>
                                    </filter>
                                </defs>
                                
                                {/* Story Group Backgrounds */}
                                {storyGroups.map(group => (
                                    <g key={`story-${group.id}`}>
                                        <rect
                                            x={group.bounds.minX}
                                            y={group.bounds.minY}
                                            width={group.bounds.maxX - group.bounds.minX}
                                            height={group.bounds.maxY - group.bounds.minY}
                                            fill={alpha(getStoryColor(group.id), 0.08)}
                                            stroke={alpha(getStoryColor(group.id), 0.3)}
                                            strokeWidth="2"
                                            strokeDasharray="8,4"
                                            rx="16"
                                        />
                                        <text
                                            x={group.bounds.minX + 16}
                                            y={group.bounds.minY - 12}
                                            fill={getStoryColor(group.id)}
                                            fontSize="13"
                                            fontWeight="600"
                                        >
                                            📖 {group.story.title}
                                        </text>
                                    </g>
                                ))}
                                
                                {/* Dependency Edges */}
                                {edges.map((edge, index) => {
                                    const fromNode = nodes.find(n => n.id === edge.from);
                                    const toNode = nodes.find(n => n.id === edge.to);
                                    
                                    if (!fromNode || !toNode) return null;
                                    
                                    const x1 = fromNode.x;
                                    const y1 = fromNode.y + 40;
                                    const x2 = toNode.x;
                                    const y2 = toNode.y - 40;
                                    
                                    const midY = (y1 + y2) / 2;
                                    
                                    return (
                                        <path
                                            key={`edge-${index}`}
                                            d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                            stroke={alpha(theme.palette.text.secondary, 0.3)}
                                            strokeWidth="2.5"
                                            fill="none"
                                            markerEnd="url(#arrowhead)"
                                        />
                                    );
                                })}
                                
                                {/* Task Nodes */}
                                {nodes.map(node => {
                                    const isTarget = node.id === taskId;
                                    const color = getNodeColor(node.task, isTarget);
                                    
                                    return (
                                        <g key={node.id}>
                                            {/* Node Card */}
                                            <rect
                                                x={node.x - 100}
                                                y={node.y - 40}
                                                width={200}
                                                height={80}
                                                fill={alpha(color, isTarget ? 0.95 : 0.85)}
                                                rx="12"
                                                stroke={isTarget ? theme.palette.primary.light : alpha(color, 0.5)}
                                                strokeWidth={isTarget ? "3" : "0"}
                                                filter={isTarget ? "url(#glow)" : undefined}
                                            />
                                            
                                            {/* Gradient overlay for depth */}
                                            <rect
                                                x={node.x - 100}
                                                y={node.y - 40}
                                                width={200}
                                                height={40}
                                                fill="url(#nodeGradient)"
                                                fillOpacity="0.1"
                                                rx="12"
                                                pointerEvents="none"
                                            />
                                            
                                            {/* Task Title */}
                                            <text
                                                x={node.x}
                                                y={node.y - 12}
                                                textAnchor="middle"
                                                fill="#FFFFFF"
                                                fontSize="14"
                                                fontWeight="600"
                                            >
                                                {node.task.title.length > 22 
                                                    ? node.task.title.substring(0, 20) + '...' 
                                                    : node.task.title}
                                            </text>
                                            
                                            {/* State Badge */}
                                            <text
                                                x={node.x}
                                                y={node.y + 8}
                                                textAnchor="middle"
                                                fill={alpha('#FFFFFF', 0.95)}
                                                fontSize="11"
                                            >
                                                {node.task.state}
                                            </text>
                                            
                                            {/* Points */}
                                            <text
                                                x={node.x}
                                                y={node.y + 26}
                                                textAnchor="middle"
                                                fill={alpha('#FFFFFF', 0.8)}
                                                fontSize="10"
                                            >
                                                {node.task.points} {node.task.points === 1 ? 'point' : 'points'}
                                            </text>
                                            
                                            {/* Target Indicator */}
                                            {isTarget && (
                                                <>
                                                    <circle
                                                        cx={node.x + 85}
                                                        cy={node.y - 25}
                                                        r="8"
                                                        fill={theme.palette.primary.light}
                                                    />
                                                    <text
                                                        x={node.x + 85}
                                                        y={node.y - 21}
                                                        textAnchor="middle"
                                                        fill="#FFF"
                                                        fontSize="10"
                                                        fontWeight="700"
                                                    >
                                                        ★
                                                    </text>
                                                </>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </Box>

                        {/* Bottom Legend */}
                        <Box sx={{ 
                            borderTop: 1, 
                            borderColor: 'divider',
                            p: 2,
                            bgcolor: 'background.paper',
                        }}>
                            <Stack direction="row" spacing={3} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>
                                        States:
                                    </Typography>
                                    <Stack direction="row" spacing={1} component="span">
                                        <Chip label="Finished" size="small" sx={{ bgcolor: theme.palette.success.main, color: '#fff', height: 22, fontSize: '0.75rem' }} />
                                        <Chip label="Doing" size="small" sx={{ bgcolor: theme.palette.warning.main, color: '#fff', height: 22, fontSize: '0.75rem' }} />
                                        <Chip label="Scheduled" size="small" sx={{ bgcolor: theme.palette.info.main, color: '#fff', height: 22, fontSize: '0.75rem' }} />
                                        <Chip label="Filed" size="small" sx={{ bgcolor: theme.palette.grey[600], color: '#fff', height: 22, fontSize: '0.75rem' }} />
                                    </Stack>
                                </Box>
                                <Box>
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mr: 1 }}>
                                        Grouping:
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        Dashed boxes represent user stories
                                    </Typography>
                                </Box>
                                <Box sx={{ flex: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    ★ = Current Task  •  Arrows: Dependency Flow
                                </Typography>
                            </Stack>
                        </Box>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
