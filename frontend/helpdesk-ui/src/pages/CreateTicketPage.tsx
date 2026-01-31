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

    function validationMessage() {
        if (!createdByOk) return "Created By is required.";
        if (!titleOk) return "Title is required.";
        if (!descOk) return "Description is required.";
        return null;
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        const msg = validationMessage();
        if (msg) {
            setError(msg);
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
        <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
            <h1 style={{ marginBottom: 12 }}>Create Ticket</h1>

            <form onSubmit={handleSubmit} style={{ maxWidth: 700, display: "grid", gap: 12 }}>
                <label>
                    <div style={{ marginBottom: 6 }}>Created By</div>
                    <input
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        style={{ width: "100%", padding: 10 }}
                        maxLength={100}
                        placeholder="Your name"
                    />
                    <small style={{ color: "#777" }}>2–100 characters</small>
                </label>

                <label>
                    <div style={{ marginBottom: 6 }}>Title</div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={{ width: "100%", padding: 10 }}
                        maxLength={100}
                    />
                    <small style={{ color: "#777" }}>5–100 characters</small>
                </label>

                <label>
                    <div style={{ marginBottom: 6 }}>Description</div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: 10, minHeight: 120 }}
                        maxLength={2000}
                    />
                    <small style={{ color: "#777" }}>10–2000 characters</small>
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
