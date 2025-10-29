import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router';

import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { SvgIconComponent } from '@mui/icons-material';

export interface HomeTileProps {
    title: string;
    description: string;
    icon: SvgIconComponent;
    link: string;
    buttonText: string;
    color: string;
    buttonColor: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
}

export default function HomeTile(props: HomeTileProps) {
    const theme = useTheme();
    const navigate = useNavigate();

    const handleNavigate = () => {
        navigate(props.link);
    };

    return (
        <Paper
            elevation={0}
            sx={{
                flex: 1,
                p: 3,
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                textAlign: 'center',
            }}
        >
            <props.icon
                sx={{
                    fontSize: 48,
                    color: props.color,
                    mb: 2,
                }}
            />
            <Typography variant="h6" gutterBottom>{props.title}</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{props.description}</Typography>
            <Button variant="contained" fullWidth onClick={handleNavigate} color={props.buttonColor}>
                {props.buttonText}
            </Button>
        </Paper>
    );
}