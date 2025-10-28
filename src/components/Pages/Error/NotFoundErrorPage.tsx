import { Box, Button, Container, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router';

export default function NotFoundErrorPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="md">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center', gap: 3, }}>
                <Typography variant="h1" component="h1"
                    sx={{
                        fontSize: { xs: '4rem', sm: '6rem', md: '8rem' },
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        lineHeight: 1,
                    }}
                >
                    404
                </Typography>
                <Typography
                    variant="h4"
                    component="h2"
                    sx={{
                        color: theme.palette.text.secondary,
                        mb: 2,
                    }}
                >
                    Page Not Found
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.secondary,
                        maxWidth: 500,
                        mb: 2,
                    }}
                >
                    The page you are looking for doesn't exist or has been moved.
                    Please check the URL or return to the home page.
                </Typography>
                <Button
                    variant="contained"
                    size="large"
                    onClick={handleGoHome}
                    sx={{
                        mt: 2,
                        px: 4,
                        py: 1.5,
                    }}
                >
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
}
