import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

export default function App() {

    // create a darkTheme function to handle dark theme using createTheme
    const darkTheme = createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    });

    return (
        <ThemeProvider theme={darkTheme}>
            <CssBaseline />
        </ThemeProvider>
    )
}