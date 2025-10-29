import { Container, Box, Typography, Paper, Button, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
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
                <TextBubble title='Getting Started' content='To get started with Program Planner, navigate to the Calendar or Tasks sections using the tiles above. You can add events to your calendar and create tasks to keep track of your to-dos. Explore the settings to customize your experience.' />
            </Container>
        </Box>
    );
}

