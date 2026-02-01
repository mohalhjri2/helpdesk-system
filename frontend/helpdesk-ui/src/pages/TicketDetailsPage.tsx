import { useEffect, useMemo, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";

import {
    addTicketComment,
    deleteTicket,
    getTicketDetails,
    updateTicketStatus,
} from "../services/tickets";

import type { TicketDetails, TicketStatus, TicketPriority, TicketCategory } from "../types/ticket";

const statusLabel = (s: TicketStatus) => (s === 0 ? "Open" : s === 1 ? "In Progress" : "Closed");
const priorityLabel = (p: TicketPriority) => (p === 0 ? "Low" : p === 1 ? "Medium" : "High");
const categoryLabel = (c: TicketCategory) => (c === 0 ? "IT" : c === 1 ? "Facilities" : "General");

function statusChipSx(s: TicketStatus) {
    if (s === 0) return { bgcolor: "#E7F0FF", color: "#1F6FEB", borderColor: "#BFD6FF" };
    if (s === 1) return { bgcolor: "#FFF3E0", color: "#B86B00", borderColor: "#FFD59E" };
    return { bgcolor: "#EAF7EE", color: "#1B7F3A", borderColor: "#BDE7C8" };
}
function priorityChipSx(p: TicketPriority) {
    if (p === 0) return { bgcolor: "#F2F4F8", color: "#42526E", borderColor: "#D6DEEA" };
    if (p === 1) return { bgcolor: "#FFF3E0", color: "#B86B00", borderColor: "#FFD59E" };
    return { bgcolor: "#FDE7EA", color: "#B42318", borderColor: "#F7B3BC" };
}

export default function TicketDetailsPage({
    ticketId,
    onBack,
    onChanged,
}: {
    ticketId: number;
    onBack: () => void;
    onChanged: () => void;
}) {
    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [statusUpdating, setStatusUpdating] = useState(false);

    const [commentAuthor, setCommentAuthor] = useState("");
    const [commentText, setCommentText] = useState("");
    const [commentSubmitting, setCommentSubmitting] = useState(false);

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleting, setDeleting] = useState(false);

    async function load() {
        setLoading(true);
        setError(null);
        try {
            const data = await getTicketDetails(ticketId);
            setTicket(data);
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to load ticket.");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, [ticketId]);

    const commentCount = ticket?.comments?.length ?? 0;

    const allowedNextStatuses = useMemo(() => {
        if (!ticket) return [] as TicketStatus[];
        const current = ticket.status;

        if (current === 0) return [1] as TicketStatus[];
        if (current === 1) return [0, 2] as TicketStatus[];
        if (current === 2) return [0] as TicketStatus[];
        return [];
    }, [ticket]);

    const canClose = commentCount > 0;
    const canAddComment = ticket?.status !== 2;

    async function handleStatusChange(next: TicketStatus) {
        if (!ticket) return;

        if (next === 2 && !canClose) {
            setError("Cannot close a ticket without at least one comment.");
            return;
        }

        setError(null);
        setStatusUpdating(true);
        try {
            await updateTicketStatus(ticket.id, next);
            onChanged();
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to update status.");
        } finally {
            setStatusUpdating(false);
        }
    }

    async function handleAddComment() {
        if (!ticket) return;

        const author = commentAuthor.trim();
        const msg = commentText.trim();

        if (author.length < 2 || author.length > 100) {
            setError("Author is required and must be 2–100 characters.");
            return;
        }
        if (msg.length < 2 || msg.length > 1000) {
            setError("Comment must be 2–1000 characters.");
            return;
        }

        setError(null);
        setCommentSubmitting(true);
        try {
            await addTicketComment(ticket.id, { author, message: msg });
            onChanged();
            setCommentText("");
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to add comment.");
        } finally {
            setCommentSubmitting(false);
        }
    }

    async function handleDelete() {
        if (!ticket) return;

        setError(null);
        setDeleting(true);
        try {
            await deleteTicket(ticket.id);
            onChanged();
            onBack();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to delete ticket.");
        } finally {
            setDeleting(false);
            setDeleteOpen(false);
        }
    }

    return (
        <Box sx={{ py: 1 }}>
            <Paper
                elevation={10}
                sx={{
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                    overflow: "hidden",
                }}
            >
                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Button variant="outlined" onClick={onBack}>
                                Back
                            </Button>
                            <Typography variant="h4">Ticket Details</Typography>
                        </Stack>

                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => setDeleteOpen(true)}
                            disabled={loading || !ticket}
                        >
                            Delete Ticket
                        </Button>
                    </Stack>
                </Box>

                {/* Body */}
                <Box sx={{ px: 3, py: 3 }}>
                    {loading ? (
                        <Typography color="text.secondary">Loading…</Typography>
                    ) : !ticket ? (
                        <Typography color="text.secondary">Ticket not found.</Typography>
                    ) : (
                        <Stack spacing={2}>
                            {error && <Alert severity="error">{error}</Alert>}

                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
                                    gap: 2,
                                }}
                            >
                                {/* Left: Ticket card */}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "grey.200" }}>
                                    <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                                        {ticket.title}
                                    </Typography>

                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mb: 1 }}
                                    >
                                        <Chip
                                            label={statusLabel(ticket.status)}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderRadius: 2, ...statusChipSx(ticket.status) }}
                                        />

                                        <Chip
                                            label={`Category: ${categoryLabel(ticket.category)}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderRadius: 2 }}
                                        />

                                        <Chip
                                            label={`Priority: ${priorityLabel(ticket.priority)}`}
                                            size="small"
                                            variant="outlined"
                                            sx={{ borderRadius: 2, ...priorityChipSx(ticket.priority) }}
                                        />

                                        <Typography variant="body2" color="text.secondary">
                                            Created By: {ticket.createdBy}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            Created: {new Date(ticket.createdAt).toLocaleString()}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            Updated: {new Date(ticket.updatedAt).toLocaleString()}
                                        </Typography>
                                    </Stack>

                                    <Divider sx={{ my: 1.5 }} />

                                    <Typography color="text.primary">{ticket.description}</Typography>
                                </Paper>

                                {/* Right: Status actions card */}
                                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "grey.200" }}>
                                    <Typography fontWeight={800} sx={{ mb: 1 }}>
                                        Change Status
                                    </Typography>

                                    <Stack spacing={1}>
                                        {allowedNextStatuses.map((s) => {
                                            const isClose = s === 2;
                                            const disabled = statusUpdating || (isClose && !canClose);

                                            const label =
                                                s === 1
                                                    ? "Move to In Progress"
                                                    : s === 0
                                                        ? "Reopen Ticket"
                                                        : "Close Ticket";
                                            const color = s === 2 ? "error" : "primary";

                                            return (
                                                <Button
                                                    key={s}
                                                    variant="contained"
                                                    color={color as any}
                                                    disabled={disabled}
                                                    onClick={() => handleStatusChange(s)}
                                                >
                                                    {statusUpdating ? "Updating…" : label}
                                                </Button>
                                            );
                                        })}

                                        {allowedNextStatuses.includes(2) && !canClose && (
                                            <Typography variant="caption" color="warning.main">
                                                Add at least one comment to enable closing.
                                            </Typography>
                                        )}
                                    </Stack>
                                </Paper>
                            </Box>

                            {/* Comments card */}
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: "grey.200" }}>
                                <Typography fontWeight={800} sx={{ mb: 1 }}>
                                    Comments ({commentCount})
                                </Typography>

                                <Stack direction={{ xs: "column", md: "row" }} spacing={1} sx={{ mb: 2 }}>
                                    <TextField
                                        label="Author"
                                        value={commentAuthor}
                                        onChange={(e) => setCommentAuthor(e.target.value)}
                                        disabled={!canAddComment || commentSubmitting}
                                        inputProps={{ maxLength: 100 }}
                                        sx={{ width: { xs: "100%", md: 220 } }}
                                    />
                                    <TextField
                                        label="Message"
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={!canAddComment || commentSubmitting}
                                        inputProps={{ maxLength: 1000 }}
                                        fullWidth
                                    />
                                    <Button
                                        variant="contained"
                                        disabled={
                                            !canAddComment ||
                                            commentSubmitting ||
                                            commentAuthor.trim().length < 2 ||
                                            commentText.trim().length < 2
                                        }
                                        onClick={handleAddComment}
                                        sx={{ minWidth: 140 }}
                                    >
                                        {commentSubmitting ? "Adding…" : "Add Comment"}
                                    </Button>
                                </Stack>

                                {!canAddComment && (
                                    <Typography variant="caption" color="text.secondary">
                                        Ticket is closed. Comments are disabled.
                                    </Typography>
                                )}

                                <Divider sx={{ my: 1.5 }} />

                                {ticket.comments.length === 0 ? (
                                    <Typography color="text.secondary">No comments yet.</Typography>
                                ) : (
                                    <Stack spacing={1}>
                                        {ticket.comments
                                            .slice()
                                            .sort(
                                                (a, b) =>
                                                    new Date(a.createdAt).getTime() -
                                                    new Date(b.createdAt).getTime()
                                            )
                                            .map((c) => (
                                                <Box
                                                    key={c.id}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        gap: 2,
                                                        py: 1,
                                                        borderTop: "1px solid",
                                                        borderColor: "grey.200",
                                                    }}
                                                >
                                                    <Typography>
                                                        <b>{c.author}:</b> {c.message}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                        sx={{ whiteSpace: "nowrap" }}
                                                    >
                                                        {new Date(c.createdAt).toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            ))}
                                    </Stack>
                                )}
                            </Paper>
                        </Stack>
                    )}
                </Box>
            </Paper>

            {/* Confirm delete dialog */}
            <Dialog
                open={deleteOpen}
                onClose={() => {
                    if (!deleting) setDeleteOpen(false);
                }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle>Delete Ticket?</DialogTitle>
                <DialogContent>
                    <Typography color="text.secondary">
                        This will permanently delete the ticket and its comments. This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteOpen(false)} disabled={deleting}>
                        Cancel
                    </Button>
                    <Button color="error" variant="contained" onClick={handleDelete} disabled={deleting}>
                        {deleting ? "Deleting…" : "Delete"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
