import { useEffect, useMemo, useState } from "react";
import { getTickets, type TicketQuery } from "../services/tickets";
import TicketDetailsPage from "./TicketDetailsPage";
import CreateTicketPage from "./CreateTicketPage";
import type { TicketListItem, TicketStatus, TicketPriority, TicketCategory } from "../types/ticket";

const statusLabel = (s: TicketStatus) => (s === 0 ? "Open" : s === 1 ? "In Progress" : "Closed");
const priorityLabel = (p: TicketPriority) => (p === 0 ? "Low" : p === 1 ? "Medium" : "High");
const categoryLabel = (c: TicketCategory) => (c === 0 ? "IT" : c === 1 ? "Facilities" : "General");

export default function TicketListPage() {
    const [tickets, setTickets] = useState<TicketListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mode, setMode] = useState<"list" | "create" | "details">("list");
    const [refreshKey, setRefreshKey] = useState(0);

    // Filters/search
    const [status, setStatus] = useState<string>("");
    const [priority, setPriority] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState<"newest" | "oldest">("newest");

    const query: TicketQuery = useMemo(() => {
        const q: TicketQuery = { sort };
        if (status !== "") q.status = Number(status) as TicketStatus;
        if (priority !== "") q.priority = Number(priority) as TicketPriority;
        if (category !== "") q.category = Number(category) as TicketCategory;
        if (search.trim()) q.search = search.trim();
        return q;
    }, [status, priority, category, search, sort]);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            setLoading(true);
            setError(null);
            try {
                const data = await getTickets(query);
                if (!cancelled) setTickets(data);
            } catch (e: any) {
                if (!cancelled) setError(e?.message ?? "Failed to load tickets");
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();
        return () => {
            cancelled = true;
        };
    }, [query, refreshKey]);

    if (mode === "create") {
        return (
            <CreateTicketPage
                onCreated={(newId) => {
                    setSelectedId(newId);
                    setMode("details");
                    setRefreshKey((k) => k + 1);
                }}
                onCancel={() => {
                    setMode("list");
                    setRefreshKey((k) => k + 1);
                }}
            />
        );
    }

    if (mode === "details" && selectedId !== null) {
        return (
            <TicketDetailsPage
                ticketId={selectedId}
                onBack={() => {
                    setMode("list");
                    setSelectedId(null);
                    setRefreshKey((k) => k + 1);
                }}
                onChanged={() => setRefreshKey((k) => k + 1)}
            />
        );
    }

    return (
        <div style={{ padding: 24, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
            <h1 style={{ marginBottom: 12 }}>Tickets</h1>
            <button onClick={() => setMode("create")} style={{ padding: "10px 14px" }}>
                + Create Ticket
            </button>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
                <input
                    placeholder="Search title/description..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ padding: 10, minWidth: 260 }}
                />

                <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 10 }}>
                    <option value="">All Status</option>
                    <option value="0">Open</option>
                    <option value="1">In Progress</option>
                    <option value="2">Closed</option>
                </select>

                <select value={priority} onChange={(e) => setPriority(e.target.value)} style={{ padding: 10 }}>
                    <option value="">All Priority</option>
                    <option value="0">Low</option>
                    <option value="1">Medium</option>
                    <option value="2">High</option>
                </select>

                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ padding: 10 }}>
                    <option value="">All Category</option>
                    <option value="0">IT</option>
                    <option value="1">Facilities</option>
                    <option value="2">General</option>
                </select>

                <select value={sort} onChange={(e) => setSort(e.target.value as any)} style={{ padding: 10 }}>
                    <option value="newest">Newest</option>
                    <option value="oldest">Oldest</option>
                </select>
            </div>

            {/* States */}
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: "crimson" }}>{error}</p>}

            {/* Table */}
            {!loading && !error && (
                <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead style={{ background: "#f7f7f7" }}>
                            <tr>
                                <th style={{ textAlign: "left", padding: 12 }}>Title</th>
                                <th style={{ textAlign: "left", padding: 12 }}>Category</th>
                                <th style={{ textAlign: "left", padding: 12 }}>Priority</th>
                                <th style={{ textAlign: "left", padding: 12 }}>Status</th>
                                <th style={{ textAlign: "left", padding: 12 }}>Comments</th>
                                <th style={{ textAlign: "left", padding: 12 }}>Created</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map((t) => (
                                <tr
                                    key={t.id}
                                    onClick={() => {
                                        setSelectedId(t.id);
                                        setMode("details");
                                    }}
                                    style={{ borderTop: "1px solid #eee", cursor: "pointer" }}
                                >
                                    <td style={{ padding: 12 }}>{t.title}</td>
                                    <td style={{ padding: 12 }}>{categoryLabel(t.category)}</td>
                                    <td style={{ padding: 12 }}>{priorityLabel(t.priority)}</td>
                                    <td style={{ padding: 12 }}>{statusLabel(t.status)}</td>
                                    <td style={{ padding: 12 }}>{t.commentCount}</td>
                                    <td style={{ padding: 12 }}>{new Date(t.createdAt).toLocaleString()}</td>
                                </tr>
                            ))}
                            {tickets.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: 12 }}>
                                        No tickets found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
