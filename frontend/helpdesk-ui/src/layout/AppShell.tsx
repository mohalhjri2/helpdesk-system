import React from "react";
import {
    AppBar,
    Box,
    Container,
    Toolbar,
    Typography,
    Button,
    Stack,
} from "@mui/material";

export default function AppShell({
    title = "Help Desk System",
    subtitle = "Tickets • Comments • Status workflow",
    children,
    signature = "Mohammed Alhajri",
}: {
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    signature?: string;
}) {
    const year = new Date().getFullYear();

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                bgcolor: "#EAF1FF",
                backgroundImage:
                    "radial-gradient(1200px 600px at 50% -100px, rgba(25,118,210,0.18) 0%, rgba(234,241,255,0) 60%)",
            }}
        >
            {/* Header */}
            <AppBar
                position="sticky"
                elevation={0}
                sx={{
                    bgcolor: "#FFFFFF",
                    color: "text.primary",
                    borderBottom: "1px solid",
                    borderColor: "grey.200",
                }}
            >
                <Toolbar sx={{ minHeight: 72 }}>
                    <Container maxWidth="xl" disableGutters sx={{ px: { xs: 2, md: 4 } }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: "999px",
                                        bgcolor: "primary.main",
                                        display: "grid",
                                        placeItems: "center",
                                        color: "white",
                                        fontWeight: 900,
                                        letterSpacing: 0.5,
                                        boxShadow: "0 8px 16px rgba(25,118,210,0.25)",
                                    }}
                                >
                                    HD
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={900} sx={{ lineHeight: 1.05 }}>
                                        {title}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {subtitle}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button variant="outlined" size="small">
                                Support
                            </Button>
                        </Stack>
                    </Container>
                </Toolbar>
            </AppBar>

            {/* Content */}
            <Box sx={{ flex: 1 }}>
                <Container maxWidth="xl" sx={{ py: { xs: 2, md: 3 } }}>
                    {children}
                </Container>
            </Box>

            {/* Footer */}
            <Box sx={{ bgcolor: "#FFFFFF", borderTop: "1px solid", borderColor: "grey.200" }}>
                <Container maxWidth="xl" sx={{ py: 2 }}>
                    <Stack
                        direction={{ xs: "column", sm: "row" }}
                        spacing={0.5}
                        alignItems={{ sm: "center" }}
                        justifyContent="space-between"
                    >
                        <Typography variant="body2" color="text.secondary">
                            © {year} Help Desk System — {signature}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Built with React + MUI
                        </Typography>
                    </Stack>
                </Container>
            </Box>
        </Box>
    );
}
