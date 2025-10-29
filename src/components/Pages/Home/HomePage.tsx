import { Container, Box, Typography, Paper, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import HomeTile from './HomeTile';
import TextBubble from './TextBubble';

export default function HomePage() {
    const theme = useTheme();
    
    return (
        <Box sx={{ p: 3 }}>
            <Container maxWidth="lg">
                <Typography
                    variant="h3"
                    component="h1"
                    gutterBottom
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        mb: 4,
                    }}
                >
                    Welcome to Program Planner
                </Typography>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <HomeTile 
                        title="Calendar"
                        description="View and manage your schedule"
                        icon={CalendarMonthIcon}
                        link="/calendar"
                        buttonText="Open Calendar"
                        color={theme.palette.primary.main}
                        buttonColor='primary'
                    />
                    <HomeTile 
                        title="Tasks"
                        description="Track your tasks and todos"
                        icon={AssignmentIcon}
                        link="/tasks"
                        buttonText="View Tasks"
                        color={theme.palette.secondary.main}
                        buttonColor='secondary'
                    />
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 4 }}>
                    <HomeTile 
                        title="Stories"
                        description="Group related tasks into user stories"
                        icon={AutoStoriesIcon}
                        link="/stories"
                        buttonText="View Stories"
                        color={theme.palette.success.main}
                        buttonColor='success'
                    />
                    <HomeTile 
                        title="Metrics"
                        description="Analyze your productivity and progress"
                        icon={BarChartIcon}
                        link="/metrics"
                        buttonText="View Metrics"
                        color={theme.palette.info.main}
                        buttonColor='info'
                    />
                </Stack>
                <TextBubble 
                    title='Getting Started' 
                    content='Welcome to Program Planner! Start by creating tasks in the Tasks section, or organize them into Stories for better project management. Use the Calendar to schedule your work, and check Metrics to track your productivity. Stories help you group related tasks together and visualize progress with burndown charts.' 
                />
            </Container>
        </Box>
    );
}

