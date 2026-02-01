import { useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Container,
    FormControl,
    MenuItem,
    Paper,
    Select,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";

import { createTicket } from "../services/tickets";
import type { TicketCategory, TicketPriority } from "../types/ticket";

export default function CreateTicketPage({
    onCreated,
    onCancel,
}: {
    onCreated: (newId: number) => void;
    onCancel: () => void;
}) {
    const [createdBy, setCreatedBy] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TicketCategory>(0);
    const [priority, setPriority] = useState<TicketPriority>(1);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createdByTrim = createdBy.trim();
    const titleTrim = title.trim();
    const descTrim = description.trim();

    const createdByOk = createdByTrim.length >= 2 && createdByTrim.length <= 100;
    const titleOk = titleTrim.length >= 5 && titleTrim.length <= 100;
    const descOk = descTrim.length >= 10 && descTrim.length <= 2000;

    const canSubmit = createdByOk && titleOk && descOk && !submitting;

    const helperText = useMemo(() => {
        if (!createdByOk) return "Created By must be 2–100 characters.";
        if (!titleOk) return "Title must be 5–100 characters.";
        if (!descOk) return "Description must be 10–2000 characters.";
        return null;
    }, [createdByOk, titleOk, descOk]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!canSubmit) {
            setError(helperText ?? "Please complete the form.");
            return;
        }

        try {
            setSubmitting(true);
            const created = await createTicket({
                createdBy: createdByTrim,
                title: titleTrim,
                description: descTrim,
                category,
                priority,
            });
            onCreated(created.id);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to create ticket.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Box sx={{ py: 1 }}>
            <Paper elevation={10} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                {/* Header strip */}
                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
                    <Typography variant="h4">Create Ticket</Typography>
                </Box>

                <Box sx={{ px: 3, py: 3 }}>
                    <form onSubmit={handleSubmit}>
                        <Stack spacing={2} sx={{ maxWidth: 760 }}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <TextField
                                label="Created By"
                                value={createdBy}
                                onChange={(e) => setCreatedBy(e.target.value)}
                                placeholder="Your name"
                                inputProps={{ maxLength: 100 }}
                                helperText="2–100 characters"
                                error={createdBy.length > 0 && !createdByOk}
                            />

                            <TextField
                                label="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                inputProps={{ maxLength: 100 }}
                                helperText="5–100 characters"
                                error={title.length > 0 && !titleOk}
                            />

                            <TextField
                                label="Description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                inputProps={{ maxLength: 2000 }}
                                multiline
                                minRows={4}
                                helperText="10–2000 characters"
                                error={description.length > 0 && !descOk}
                            />

                            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                                <FormControl fullWidth>
                                    <Typography variant="caption" sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Category
                                    </Typography>
                                    <Select
                                        value={String(category)}
                                        onChange={(e: SelectChangeEvent) => setCategory(Number(e.target.value) as TicketCategory)}
                                    >
                                        <MenuItem value="0">IT</MenuItem>
                                        <MenuItem value="1">Facilities</MenuItem>
                                        <MenuItem value="2">General</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <Typography variant="caption" sx={{ mb: 0.5, color: "text.secondary" }}>
                                        Priority
                                    </Typography>
                                    <Select
                                        value={String(priority)}
                                        onChange={(e: SelectChangeEvent) => setPriority(Number(e.target.value) as TicketPriority)}
                                    >
                                        <MenuItem value="0">Low</MenuItem>
                                        <MenuItem value="1">Medium</MenuItem>
                                        <MenuItem value="2">High</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>

                            <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ pt: 1 }}>
                                <Button variant="outlined" onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button variant="contained" type="submit" disabled={!canSubmit}>
                                    {submitting ? "Creating…" : "Create Ticket"}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </Box>
            </Paper>
        </Box>
    );
}
