import { Container } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function HomePage() {
    const theme = useTheme();
    return (
        <Container maxWidth="md">
           <h1>Hello world</h1>
        </Container>
    );
}
