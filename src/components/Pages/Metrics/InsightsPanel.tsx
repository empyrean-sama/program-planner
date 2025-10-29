import { Card, CardContent, Typography, Box, Alert, AlertTitle, Chip } from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import { ProductivityInsight } from '../../../utils/metricsCalculation';

export interface InsightsPanelProps {
    insights: ProductivityInsight[];
}

export function InsightsPanel({ insights }: InsightsPanelProps) {
    const getInsightIcon = (type: ProductivityInsight['type']) => {
        return <LightbulbIcon />;
    };

    const groupedInsights = {
        success: insights.filter(i => i.type === 'success'),
        warning: insights.filter(i => i.type === 'warning'),
        error: insights.filter(i => i.type === 'error'),
        info: insights.filter(i => i.type === 'info'),
    };

    if (insights.length === 0) {
        return (
            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TipsAndUpdatesIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Productivity Insights
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 150 }}>
                        <Typography variant="body2" color="text.secondary">
                            Complete more tasks to unlock insights
                        </Typography>
                    </Box>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TipsAndUpdatesIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                            Productivity Insights
                        </Typography>
                    </Box>
                    <Chip 
                        label={`${insights.length} insight${insights.length !== 1 ? 's' : ''}`} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                    />
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Success insights first */}
                    {groupedInsights.success.map((insight, index) => (
                        <Alert
                            key={`success-${index}`}
                            severity="success"
                            icon={getInsightIcon(insight.type)}
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%',
                                },
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>{insight.title}</AlertTitle>
                            <Typography variant="body2" sx={{ mb: insight.actionable ? 1 : 0 }}>
                                {insight.message}
                            </Typography>
                            {insight.actionable && (
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                        borderLeft: '3px solid',
                                        borderColor: 'success.main',
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500}>
                                        💡 {insight.actionable}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    ))}

                    {/* Warning insights */}
                    {groupedInsights.warning.map((insight, index) => (
                        <Alert
                            key={`warning-${index}`}
                            severity="warning"
                            icon={getInsightIcon(insight.type)}
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%',
                                },
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>{insight.title}</AlertTitle>
                            <Typography variant="body2" sx={{ mb: insight.actionable ? 1 : 0 }}>
                                {insight.message}
                            </Typography>
                            {insight.actionable && (
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                        borderLeft: '3px solid',
                                        borderColor: 'warning.main',
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500}>
                                        💡 {insight.actionable}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    ))}

                    {/* Error insights */}
                    {groupedInsights.error.map((insight, index) => (
                        <Alert
                            key={`error-${index}`}
                            severity="error"
                            icon={getInsightIcon(insight.type)}
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%',
                                },
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>{insight.title}</AlertTitle>
                            <Typography variant="body2" sx={{ mb: insight.actionable ? 1 : 0 }}>
                                {insight.message}
                            </Typography>
                            {insight.actionable && (
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                        borderLeft: '3px solid',
                                        borderColor: 'error.main',
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500}>
                                        💡 {insight.actionable}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    ))}

                    {/* Info insights */}
                    {groupedInsights.info.map((insight, index) => (
                        <Alert
                            key={`info-${index}`}
                            severity="info"
                            icon={getInsightIcon(insight.type)}
                            sx={{
                                '& .MuiAlert-message': {
                                    width: '100%',
                                },
                            }}
                        >
                            <AlertTitle sx={{ fontWeight: 600 }}>{insight.title}</AlertTitle>
                            <Typography variant="body2" sx={{ mb: insight.actionable ? 1 : 0 }}>
                                {insight.message}
                            </Typography>
                            {insight.actionable && (
                                <Box
                                    sx={{
                                        mt: 1,
                                        p: 1,
                                        borderRadius: 1,
                                        bgcolor: 'rgba(0, 0, 0, 0.05)',
                                        borderLeft: '3px solid',
                                        borderColor: 'info.main',
                                    }}
                                >
                                    <Typography variant="body2" fontWeight={500}>
                                        💡 {insight.actionable}
                                    </Typography>
                                </Box>
                            )}
                        </Alert>
                    ))}
                </Box>

                {/* Productivity tips section */}
                <Box sx={{ mt: 4, p: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                    <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <TipsAndUpdatesIcon /> General Productivity Tips
                    </Typography>
                    <Box component="ul" sx={{ m: 0, pl: 2.5, '& li': { mb: 0.5 } }}>
                        <li>
                            <Typography variant="body2">
                                Break large tasks into smaller, actionable subtasks (2-4 hour chunks)
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Schedule your most difficult tasks during your peak energy hours
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Use the 2-minute rule: If it takes less than 2 minutes, do it immediately
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Review and update your task list daily - keep it current and realistic
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Build buffer time into your estimates - most tasks take longer than expected
                            </Typography>
                        </li>
                        <li>
                            <Typography variant="body2">
                                Celebrate small wins - each completed task is progress toward your goals
                            </Typography>
                        </li>
                    </Box>
                </Box>
            </CardContent>
        </Card>
    );
}
