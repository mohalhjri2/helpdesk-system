import { useEffect, useMemo, useState } from "react";
import { addTicketComment, getTicketDetails, updateTicketStatus } from "../services/tickets";
import type { TicketDetails, TicketStatus, TicketPriority, TicketCategory } from "../types/ticket";

const statusLabel = (s: TicketStatus) => (s === 0 ? "Open" : s === 1 ? "In Progress" : "Closed");
const priorityLabel = (p: TicketPriority) => (p === 0 ? "Low" : p === 1 ? "Medium" : "High");
const categoryLabel = (c: TicketCategory) => (c === 0 ? "IT" : c === 1 ? "Facilities" : "General");

function statusBadgeStyle(status: TicketStatus): React.CSSProperties {
    const base: React.CSSProperties = {
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 600,
        border: "1px solid #ddd",
    };

    if (status === 0) return { ...base, background: "#fff", color: "#222" };
    if (status === 1) return { ...base, background: "#fff7e6", color: "#8a5b00", border: "1px solid #ffd9a8" };
    return { ...base, background: "#f0f0f0", color: "#555" };
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

        if (current === 0) return [1] as TicketStatus[];         // Open -> InProgress
        if (current === 1) return [0, 2] as TicketStatus[];      // InProgress -> Open or Closed
        if (current === 2) return [0] as TicketStatus[];         // Closed -> Open
        return [] as TicketStatus[];
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

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

    if (error && !ticket) {
        return (
            <div style={{ padding: 24 }}>
                <button onClick={onBack} style={{ marginBottom: 12 }}>← Back</button>
                <div style={{ color: "crimson" }}>{error}</div>
            </div>
        );
    }

    if (!ticket) return <div style={{ padding: 24 }}>Ticket not found.</div>;

    return (
        <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
            <button onClick={onBack} style={{ marginBottom: 12 }}>← Back</button>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                    <h2 style={{ margin: "0 0 6px 0" }}>{ticket.title}</h2>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                        <span style={statusBadgeStyle(ticket.status)}>{statusLabel(ticket.status)}</span>
                        <span style={{ color: "#555" }}>Created By: {ticket.createdBy}</span>
                        <span style={{ color: "#555" }}>Category: {categoryLabel(ticket.category)}</span>
                        <span style={{ color: "#555" }}>Priority: {priorityLabel(ticket.priority)}</span>
                        <span style={{ color: "#777" }}>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
                    </div>

                    {(statusUpdating || commentSubmitting) && (
                        <div style={{ marginTop: 10, color: "#777" }}>Updating...</div>
                    )}
                </div>

                <div style={{ minWidth: 240 }}>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>Change Status</div>

                    {allowedNextStatuses.length === 0 ? (
                        <div style={{ color: "#777" }}>No actions available.</div>
                    ) : (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {allowedNextStatuses.map((s) => {
                                const isClose = s === 2;
                                const disabled = statusUpdating || (isClose && !canClose);
                                const label =
                                    s === 1 ? "In Progress" :
                                        s === 0 ? "Reopen" :
                                            "Close";

                                return (
                                    <button
                                        key={s}
                                        disabled={disabled}
                                        onClick={() => handleStatusChange(s)}
                                        style={{ padding: "10px 12px" }}
                                        title={isClose && !canClose ? "Add at least one comment before closing" : ""}
                                    >
                                        {statusUpdating ? "Updating..." : label}
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {allowedNextStatuses.includes(2) && !canClose && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#8a5b00" }}>
                            Add at least one comment to enable closing.
                        </div>
                    )}
                </div>
            </div>

            <p style={{ marginTop: 16, color: "#444" }}>{ticket.description}</p>

            {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

            <hr style={{ margin: "18px 0" }} />

            <div>
                <h3 style={{ margin: "0 0 10px 0" }}>Comments ({commentCount})</h3>

                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <input
                        placeholder={canAddComment ? "Author" : "Ticket is closed"}
                        value={commentAuthor}
                        onChange={(e) => setCommentAuthor(e.target.value)}
                        disabled={!canAddComment || commentSubmitting}
                        style={{ padding: 10, minWidth: 220 }}
                        maxLength={100}
                    />
                    <input
                        placeholder={canAddComment ? "Write a comment..." : "Ticket is closed"}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={!canAddComment || commentSubmitting}
                        style={{ padding: 10, minWidth: 320, flex: 1 }}
                        maxLength={1000}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={
                            !canAddComment ||
                            commentSubmitting ||
                            commentAuthor.trim().length < 2 ||
                            commentText.trim().length < 2
                        }
                        style={{ padding: "10px 12px" }}
                        title={!canAddComment ? "Cannot add comments to a closed ticket" : ""}
                    >
                        {commentSubmitting ? "Adding..." : "Add Comment"}
                    </button>
                </div>

                {ticket.comments.length === 0 ? (
                    <div style={{ color: "#777" }}>No comments yet.</div>
                ) : (
                    <ul style={{ paddingLeft: 18 }}>
                        {ticket.comments
                            .slice()
                            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                            .map((c) => (
                                <li key={c.id} style={{ marginBottom: 8 }}>
                                    <strong>{c.author}:</strong> {c.message}{" "}
                                    <small style={{ color: "#777" }}>({new Date(c.createdAt).toLocaleString()})</small>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
