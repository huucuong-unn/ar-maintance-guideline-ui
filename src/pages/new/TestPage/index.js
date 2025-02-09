import { Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CardCourse from '~/components/CardCourse';
import MyLearning from '../MyLearning';
import MyEditor from '~/components/MyEditor';

const defaultTheme = createTheme();

export default function TestPage() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
                Happy New Year 2025 🎉🎉🎉
                <Typography></Typography>
                <MyEditor />
            </Grid>
        </ThemeProvider>
    );
}
