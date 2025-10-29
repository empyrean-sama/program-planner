import { memo } from 'react';
import { Card, CardContent, Typography, Box, alpha } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { transitions } from '../../../utils/animations';

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'flat';
    trendValue?: string;
    color?: 'primary' | 'success' | 'error' | 'warning' | 'info';
}

export const StatCard = memo(function StatCard({ 
    title, 
    value, 
    subtitle, 
    icon, 
    trend, 
    trendValue,
    color = 'primary' 
}: StatCardProps) {
    const getTrendIcon = () => {
        switch (trend) {
            case 'up':
                return <TrendingUpIcon fontSize="small" color="success" />;
            case 'down':
                return <TrendingDownIcon fontSize="small" color="error" />;
            case 'flat':
                return <TrendingFlatIcon fontSize="small" color="disabled" />;
            default:
                return null;
        }
    };

    const getTrendColor = () => {
        switch (trend) {
            case 'up':
                return 'success.main';
            case 'down':
                return 'error.main';
            case 'flat':
                return 'text.disabled';
            default:
                return 'text.secondary';
        }
    };

    return (
        <Card 
            sx={{ 
                height: '100%',
                background: (theme) => 
                    `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.05)} 0%, ${alpha(theme.palette[color].main, 0.02)} 100%)`,
                borderLeft: (theme) => `4px solid ${theme.palette[color].main}`,
                ...transitions.hover,
            }}
        >
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                        {title}
                    </Typography>
                    {icon && (
                        <Box sx={{ color: `${color}.main`, opacity: 0.7 }}>
                            {icon}
                        </Box>
                    )}
                </Box>

                <Typography variant="h3" component="div" fontWeight={600} sx={{ mb: 1 }}>
                    {value}
                </Typography>

                {(subtitle || trend) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {trend && (
                            <>
                                {getTrendIcon()}
                                {trendValue && (
                                    <Typography variant="body2" sx={{ color: getTrendColor(), fontWeight: 500 }}>
                                        {trendValue}
                                    </Typography>
                                )}
                            </>
                        )}
                        {subtitle && (
                            <Typography variant="body2" color="text.secondary">
                                {subtitle}
                            </Typography>
                        )}
                    </Box>
                )}
            </CardContent>
        </Card>
    );
});
