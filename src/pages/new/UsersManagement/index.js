import { createTheme, ThemeProvider } from '@mui/material/styles';

const defaultTheme = createTheme();

export default function UsersManagement() {
    return <ThemeProvider theme={defaultTheme}></ThemeProvider>;
}
