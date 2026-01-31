import { useEffect, useMemo, useState } from "react";
import {
    addTicketComment,
    getTicketDetails,
    updateTicketStatus,
} from "../services/tickets";
import type { TicketStatus } from "../types/ticket";

type Comment = {
    id: number;
    ticketId: number;
    message: string;
    createdAt: string;
};

type TicketDetails = {
    id: number;
    title: string;
    description: string;
    category: number;
    priority: number;
    status: number;
    createdAt: string;
    updatedAt: string;
    comments: Comment[];
};

const statusLabel = (s: number) => (s === 0 ? "Open" : s === 1 ? "In Progress" : "Closed");
const priorityLabel = (p: number) => (p === 0 ? "Low" : p === 1 ? "Medium" : "High");
const categoryLabel = (c: number) => (c === 0 ? "IT" : c === 1 ? "Facilities" : "General");

function statusBadgeStyle(status: number): React.CSSProperties {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]);

    const commentCount = ticket?.comments?.length ?? 0;

    // Valid transitions (must match backend rules)
    const allowedNextStatuses = useMemo(() => {
        if (!ticket) return [] as TicketStatus[];
        const current = ticket.status;

        // 0 Open, 1 InProgress, 2 Closed
        if (current === 0) return [1, 2] as TicketStatus[];
        if (current === 1) return [2] as TicketStatus[];
        return [] as TicketStatus[];
    }, [ticket]);

    const canClose = commentCount > 0; // UI rule aligns with backend rule
    const canAddComment = ticket?.status !== 2;

    async function handleStatusChange(next: TicketStatus) {
        if (!ticket) return;

        // UI guard (backend also enforces)
        if (next === 2 && !canClose) {
            setError("Cannot close a ticket without at least one comment.");
            return;
        }

        setError(null);
        setStatusUpdating(true);
        try {
            await updateTicketStatus(ticket.id, next);
            onChanged();
            setCommentText("");
            await load();
        } catch (e: any) {
            setError(e?.response?.data?.message ?? e?.message ?? "Failed to update status.");
        } finally {
            setStatusUpdating(false);
        }
    }

    async function handleAddComment() {
        if (!ticket) return;
        const msg = commentText.trim();
        if (!msg) return;

        setError(null);
        setCommentSubmitting(true);
        try {
            await addTicketComment(ticket.id, msg);
            setCommentText("");
            await load(); // refresh ticket + comments
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
                        <span style={{ color: "#555" }}>Category: {categoryLabel(ticket.category)}</span>
                        <span style={{ color: "#555" }}>Priority: {priorityLabel(ticket.priority)}</span>
                        <span style={{ color: "#777" }}>
                            Created: {new Date(ticket.createdAt).toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Status controls */}
                <div style={{ minWidth: 240 }}>
                    <div style={{ marginBottom: 6, fontWeight: 600 }}>Change Status</div>

                    {allowedNextStatuses.length === 0 ? (
                        <div style={{ color: "#777" }}>No actions available.</div>
                    ) : (
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            {allowedNextStatuses.map((s) => {
                                const isClose = s === 2;
                                const disabled = statusUpdating || (isClose && !canClose);
                                const label = isClose ? "Close" : "Move to In Progress";

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

                    {!canClose && ticket.status !== 2 && (
                        <div style={{ marginTop: 8, fontSize: 12, color: "#8a5b00" }}>
                            Add at least one comment to enable closing.
                        </div>
                    )}
                </div>
            </div>

            <p style={{ marginTop: 16, color: "#444" }}>{ticket.description}</p>

            {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}

            <hr style={{ margin: "18px 0" }} />

            {/* Comments */}
            <div>
                <h3 style={{ margin: "0 0 10px 0" }}>Comments ({commentCount})</h3>

                {/* Add comment box */}
                <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                    <input
                        placeholder={canAddComment ? "Write a comment..." : "Ticket is closed"}
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        disabled={!canAddComment || commentSubmitting}
                        style={{ padding: 10, minWidth: 320, flex: 1 }}
                    />
                    <button
                        onClick={handleAddComment}
                        disabled={!canAddComment || commentSubmitting || !commentText.trim()}
                        style={{ padding: "10px 12px" }}
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
                                    {c.message}{" "}
                                    <small style={{ color: "#777" }}>
                                        ({new Date(c.createdAt).toLocaleString()})
                                    </small>
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
