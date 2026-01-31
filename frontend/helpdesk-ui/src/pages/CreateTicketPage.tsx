import { useState } from "react";
import { createTicket } from "../services/tickets";
import type { TicketCategory, TicketPriority } from "../types/ticket";

export default function CreateTicketPage({
    onCreated,
    onCancel,
}: {
    onCreated: (newId: number) => void;
    onCancel: () => void;
}) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<TicketCategory>(0);
    const [priority, setPriority] = useState<TicketPriority>(1);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const titleOk = title.trim().length > 0 && title.trim().length <= 200;
    const descOk = description.trim().length > 0 && description.trim().length <= 2000;
    const canSubmit = titleOk && descOk && !submitting;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!canSubmit) {
            setError("Please fill in Title and Description (within limits).");
            return;
        }

        try {
            setSubmitting(true);
            const created = await createTicket({
                title: title.trim(),
                description: description.trim(),
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
        <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
            <h1 style={{ marginBottom: 12 }}>Create Ticket</h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: 700, display: "grid", gap: 12 }}>
                <label>
                    <div style={{ marginBottom: 6 }}>Title</div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: 10 }}
                        maxLength={200}
                    />
                </label>

                <label>
                    <div style={{ marginBottom: 6 }}>Description</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: 10, minHeight: 120 }}
                        maxLength={2000}
                    />
                </label>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <label>
                        <div style={{ marginBottom: 6 }}>Category</div>
                        <select
                            value={category}
                            onChange={(e) => setCategory(Number(e.target.value) as TicketCategory)}
                            style={{ padding: 10 }}
                        >
                            <option value={0}>IT</option>
                            <option value={1}>Facilities</option>
                            <option value={2}>General</option>
                        </select>
                    </label>

                    <label>
                        <div style={{ marginBottom: 6 }}>Priority</div>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value) as TicketPriority)}
                            style={{ padding: 10 }}
                        >
                            <option value={0}>Low</option>
                            <option value={1}>Medium</option>
                            <option value={2}>High</option>
                        </select>
                    </label>
                </div>

                {error && <div style={{ color: "crimson" }}>{error}</div>}

                <div style={{ display: "flex", gap: 10 }}>
                    <button type="submit" disabled={!canSubmit} style={{ padding: "10px 14px" }}>
                        {submitting ? "Creating..." : "Create"}
                    </button>
                    <button type="button" onClick={onCancel} style={{ padding: "10px 14px" }}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
