import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    Typography,
    CircularProgress,
    Paper,
    Chip,
} from '@mui/material';
import { Task } from '../../../types/Task';

interface TaskDependencyGraphProps {
    open: boolean;
    taskId: string;
    onClose: () => void;
}

interface GraphNode {
    id: string;
    task: Task;
    level: number;
    x: number;
    y: number;
}

export default function TaskDependencyGraph({ open, taskId, onClose }: TaskDependencyGraphProps) {
    const [loading, setLoading] = useState(false);
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const [edges, setEdges] = useState<{ from: string; to: string }[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open && taskId) {
            loadGraph();
        }
    }, [open, taskId]);

    const loadGraph = async () => {
        setLoading(true);
        setError('');
        
        try {
            const result = await window.taskAPI.getDependencyGraph(taskId);
            
            if (result.success && result.data) {
                setEdges(result.data.edges);
                
                // Calculate layout for the graph
                const layout = calculateLayout(result.data.nodes, result.data.edges, taskId);
                setNodes(layout);
            } else {
                setError(result.error || 'Failed to load dependency graph');
            }
        } catch (err) {
            setError('An error occurred while loading the graph');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
                    x,
                    y,
                });
            });
        });

        return graphNodes;
    };

    const getNodeColor = (task: Task, isTarget: boolean): string => {
        if (isTarget) return '#1976d2';
        
        switch (task.state) {
            case 'Finished': return '#4caf50';
            case 'Failed': return '#f44336';
            case 'Doing': return '#ff9800';
            case 'Scheduled': return '#2196f3';
            case 'Filed': return '#9e9e9e';
            case 'Deferred': return '#795548';
            case 'Removed': return '#607d8b';
            default: return '#9e9e9e';
        }
    };

    if (loading) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>Task Dependency Graph</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                    </Box>
                </DialogContent>
            </Dialog>
        );
    }

    if (error) {
        return (
            <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
                <DialogTitle>Task Dependency Graph</DialogTitle>
                <DialogContent>
                    <Typography color="error">{error}</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>Close</Button>
                </DialogActions>
            </Dialog>
        );
    }

    const viewBox = nodes.length > 0
        ? {
            minX: Math.min(...nodes.map(n => n.x)) - 120,
            minY: -40,
            width: Math.max(...nodes.map(n => n.x)) - Math.min(...nodes.map(n => n.x)) + 240,
            height: Math.max(...nodes.map(n => n.y)) + 120,
        }
        : { minX: 0, minY: 0, width: 800, height: 400 };

    return (
        <Dialog 
            open={open} 
            onClose={onClose} 
            maxWidth="lg" 
            fullWidth
            PaperProps={{
                sx: {
                    height: '85vh',
                    maxHeight: '85vh',
                }
            }}
        >
            <DialogTitle sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                pb: 2
            }}>
                <Typography variant="h6" component="div">
                    Task Dependency Graph
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    Visualizing task prerequisites and execution order
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                {nodes.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="body1" color="text.secondary">
                            This task has no dependencies.
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Add predecessors to see the dependency graph.
                        </Typography>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                        {/* Graph Container */}
                        <Box sx={{ 
                            flex: 1, 
                            bgcolor: 'background.default',
                            p: 3,
                            overflow: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <svg
                                width="100%"
                                height="100%"
                                viewBox={`${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`}
                                style={{ 
                                    minHeight: '300px',
                                    maxHeight: '100%',
                                }}
                                preserveAspectRatio="xMidYMid meet"
                            >
                                {/* Define gradient and filters for better visuals */}
                                <defs>
                                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                                        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
                                    </filter>
                                    <marker
                                        id="arrowhead"
                                        markerWidth="10"
                                        markerHeight="10"
                                        refX="9"
                                        refY="3"
                                        orient="auto"
                                    >
                                        <polygon points="0 0, 10 3, 0 6" fill="#888" />
                                    </marker>
                                </defs>
                                
                                {/* Draw edges with smooth curves */}
                                {edges.map((edge, index) => {
                                    const fromNode = nodes.find(n => n.id === edge.from);
                                    const toNode = nodes.find(n => n.id === edge.to);
                                    
                                    if (!fromNode || !toNode) return null;
                                    
                                    const x1 = fromNode.x;
                                    const y1 = fromNode.y + 35;
                                    const x2 = toNode.x;
                                    const y2 = toNode.y - 35;
                                    
                                    // Curve control points for smooth bezier
                                    const midY = (y1 + y2) / 2;
                                    
                                    return (
                                        <g key={`edge-${index}`}>
                                            <path
                                                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                                                stroke="#888"
                                                strokeWidth="2"
                                                fill="none"
                                                markerEnd="url(#arrowhead)"
                                                opacity="0.6"
                                            />
                                        </g>
                                    );
                                })}
                                
                                {/* Draw nodes with enhanced styling */}
                                {nodes.map(node => {
                                    const isTarget = node.id === taskId;
                                    const color = getNodeColor(node.task, isTarget);
                                    
                                    return (
                                        <g key={node.id} filter="url(#shadow)">
                                            {/* Node background */}
                                            <rect
                                                x={node.x - 80}
                                                y={node.y - 35}
                                                width={160}
                                                height={70}
                                                fill={color}
                                                rx={6}
                                                stroke={isTarget ? '#fff' : 'rgba(0,0,0,0.2)'}
                                                strokeWidth={isTarget ? 3 : 1}
                                            />
                                            
                                            {/* Task title */}
                                            <text
                                                x={node.x}
                                                y={node.y - 8}
                                                textAnchor="middle"
                                                fill="#fff"
                                                fontSize="12"
                                                fontWeight={isTarget ? '600' : '500'}
                                                style={{ 
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                {node.task.title.length > 20 
                                                    ? node.task.title.substring(0, 18) + '...' 
                                                    : node.task.title}
                                            </text>
                                            
                                            {/* State and points */}
                                            <text
                                                x={node.x}
                                                y={node.y + 8}
                                                textAnchor="middle"
                                                fill="rgba(255,255,255,0.9)"
                                                fontSize="10"
                                                style={{ 
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                {node.task.state}
                                            </text>
                                            
                                            <text
                                                x={node.x}
                                                y={node.y + 22}
                                                textAnchor="middle"
                                                fill="rgba(255,255,255,0.8)"
                                                fontSize="9"
                                                style={{ 
                                                    textShadow: '0 1px 2px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                {node.task.points} {node.task.points === 1 ? 'pt' : 'pts'}
                                            </text>
                                            
                                            {/* Target indicator */}
                                            {isTarget && (
                                                <circle
                                                    cx={node.x + 70}
                                                    cy={node.y - 25}
                                                    r="6"
                                                    fill="#fff"
                                                    stroke={color}
                                                    strokeWidth="2"
                                                />
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                        </Box>
                        
                        {/* Legend */}
                        <Box sx={{ 
                            borderTop: 1, 
                            borderColor: 'divider',
                            p: 2,
                            bgcolor: 'background.paper',
                        }}>
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
                                <Typography variant="caption" sx={{ fontWeight: 600, mr: 1 }}>
                                    Legend:
                                </Typography>
                                <Chip 
                                    label="Target" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#1976d2', 
                                        color: '#fff',
                                        fontWeight: 500,
                                        height: 24,
                                    }} 
                                />
                                <Chip 
                                    label="Finished" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#4caf50', 
                                        color: '#fff',
                                        height: 24,
                                    }} 
                                />
                                <Chip 
                                    label="Doing" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#ff9800', 
                                        color: '#fff',
                                        height: 24,
                                    }} 
                                />
                                <Chip 
                                    label="Scheduled" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#2196f3', 
                                        color: '#fff',
                                        height: 24,
                                    }} 
                                />
                                <Chip 
                                    label="Filed" 
                                    size="small" 
                                    sx={{ 
                                        bgcolor: '#9e9e9e', 
                                        color: '#fff',
                                        height: 24,
                                    }} 
                                />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                                Arrows flow from prerequisite tasks → dependent tasks. Complete tasks from bottom to top.
                            </Typography>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ borderTop: 1, borderColor: 'divider', px: 3, py: 2 }}>
                <Button onClick={onClose} variant="contained">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}
