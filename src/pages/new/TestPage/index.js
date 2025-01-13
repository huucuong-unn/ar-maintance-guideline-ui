import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CardCourse from '~/components/CardCourse';

const defaultTheme = createTheme();

export default function TestPage() {
    return (
        <ThemeProvider theme={defaultTheme}>
            <Grid sx={{ minHeight: '100vh', backgroundColor: 'white' }}>
                <CardCourse />
            </Grid>
        </ThemeProvider>
    );
}
