import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
    palette: {
        mode: "light",
        background: {
            default: "#EAF1FF",
            paper: "#FFFFFF",
        },
        primary: {
            main: "#1F6FEB",
        },
        grey: {
            100: "#F6F8FC",
            200: "#E6ECF5",
            300: "#D6DEEA",
        },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: `Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial`,
        h4: { fontWeight: 800 },
        h5: { fontWeight: 800 },
        button: { textTransform: "none", fontWeight: 700 },
    },
    components: {
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderColor: "#D6DEEA",
                },
            },
        },
        MuiTextField: {
            defaultProps: { size: "small" },
        },
        MuiSelect: {
            defaultProps: { size: "small" },
        },
        MuiButton: {
            styleOverrides: {
                root: { borderRadius: 8 },
            },
        },
    },
});
