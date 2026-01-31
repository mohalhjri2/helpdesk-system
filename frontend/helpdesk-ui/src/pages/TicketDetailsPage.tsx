import { useEffect, useState } from "react";
import { api } from "../services/api";

type Comment = { id: number; ticketId: number; message: string; createdAt: string };

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

export default function TicketDetailsPage({
    ticketId,
    onBack,
}: {
    ticketId: number;
    onBack: () => void;
}) {
    const [ticket, setTicket] = useState<TicketDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        async function load() {
            setLoading(true);
            const res = await api.get<TicketDetails>(`/api/tickets/${ticketId}`);
            if (!cancelled) setTicket(res.data);
            setLoading(false);
        }
        load();
        return () => {
            cancelled = true;
        };
    }, [ticketId]);

    if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
    if (!ticket) return <div style={{ padding: 24 }}>Ticket not found.</div>;

    return (
        <div style={{ padding: 24 }}>
            <button onClick={onBack} style={{ marginBottom: 12 }}>← Back</button>

            <h2 style={{ marginBottom: 6 }}>{ticket.title}</h2>
            <p style={{ marginTop: 0, color: "#555" }}>{ticket.description}</p>

            <div style={{ marginTop: 16 }}>
                <h3>Comments</h3>
                {ticket.comments.length === 0 ? (
                    <p>No comments yet.</p>
                ) : (
                    <ul>
                        {ticket.comments.map((c) => (
                            <li key={c.id}>
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
