import { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Chip,
    Container,
    FormControl,
    InputAdornment,
    MenuItem,
    Paper,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material/Select";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";

import { getTickets, type TicketQuery } from "../services/tickets";
import CreateTicketPage from "./CreateTicketPage";
import TicketDetailsPage from "./TicketDetailsPage";
import type { TicketListItem, TicketStatus, TicketPriority, TicketCategory } from "../types/ticket";

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

export default function TicketListPage() {
    const [tickets, setTickets] = useState<TicketListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [mode, setMode] = useState<"list" | "create" | "details">("list");
    const [refreshKey, setRefreshKey] = useState(0);

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
                if (!cancelled) setError(e?.response?.data?.message ?? e?.message ?? "Failed to load tickets");
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
        <Box sx={{ py: 1 }}>
            <Paper elevation={10} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 2, overflow: "hidden" }}>
                {/* Header */}
                <Box sx={{ px: 3, py: 2, borderBottom: "1px solid", borderColor: "grey.200" }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Typography variant="h4">Tickets</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setMode("create")} sx={{ px: 2.5, py: 1 }}>
                            Create Ticket
                        </Button>
                    </Stack>
                </Box>

                {/* Filters */}
                <Box sx={{ px: 3, py: 2, bgcolor: "grey.100", borderBottom: "1px solid", borderColor: "grey.200" }}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ md: "center" }}>
                        <TextField
                            placeholder="Search title/description…"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{ width: { xs: "100%", md: 280 } }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <FormControl sx={{ minWidth: 170 }}>
                            <Select value={status} displayEmpty onChange={(e: SelectChangeEvent) => setStatus(e.target.value)}>
                                <MenuItem value="">All Status</MenuItem>
                                <MenuItem value="0">Open</MenuItem>
                                <MenuItem value="1">In Progress</MenuItem>
                                <MenuItem value="2">Closed</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 170 }}>
                            <Select value={priority} displayEmpty onChange={(e: SelectChangeEvent) => setPriority(e.target.value)}>
                                <MenuItem value="">All Priority</MenuItem>
                                <MenuItem value="0">Low</MenuItem>
                                <MenuItem value="1">Medium</MenuItem>
                                <MenuItem value="2">High</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 170 }}>
                            <Select value={category} displayEmpty onChange={(e: SelectChangeEvent) => setCategory(e.target.value)}>
                                <MenuItem value="">All Category</MenuItem>
                                <MenuItem value="0">IT</MenuItem>
                                <MenuItem value="1">Facilities</MenuItem>
                                <MenuItem value="2">General</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl sx={{ minWidth: 170 }}>
                            <Select value={sort} onChange={(e: SelectChangeEvent) => setSort(e.target.value as any)}>
                                <MenuItem value="newest">Sort: Newest</MenuItem>
                                <MenuItem value="oldest">Sort: Oldest</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>

                    {error && (
                        <Typography color="error" sx={{ mt: 1 }}>
                            {error}
                        </Typography>
                    )}
                </Box>

                {/* Table */}
                <Box sx={{ px: 3, py: 2 }}>
                    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", borderColor: "grey.200" }}>
                        <Table>
                            <TableHead sx={{ bgcolor: "grey.100" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 800 }}>Title</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Created By</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Category</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Priority</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Comments</TableCell>
                                    <TableCell sx={{ fontWeight: 800 }}>Created</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography color="text.secondary" sx={{ py: 2 }}>
                                                Loading…
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : tickets.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7}>
                                            <Typography color="text.secondary" sx={{ py: 2 }}>
                                                No tickets found.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tickets.map((t) => (
                                        <TableRow
                                            key={t.id}
                                            hover
                                            onClick={() => {
                                                setSelectedId(t.id);
                                                setMode("details");
                                            }}
                                            sx={{ cursor: "pointer", "&:hover": { bgcolor: "grey.100" } }}
                                        >
                                            <TableCell sx={{ fontWeight: 600 }}>{t.title}</TableCell>
                                            <TableCell>{t.createdBy}</TableCell>
                                            <TableCell>{categoryLabel(t.category)}</TableCell>
                                            <TableCell>
                                                <Chip size="small" variant="outlined" label={priorityLabel(t.priority)} sx={{ borderRadius: 2, ...priorityChipSx(t.priority) }} />
                                            </TableCell>
                                            <TableCell>
                                                <Chip size="small" variant="outlined" label={statusLabel(t.status)} sx={{ borderRadius: 2, ...statusChipSx(t.status) }} />
                                            </TableCell>
                                            <TableCell>{t.commentCount}</TableCell>
                                            <TableCell>{new Date(t.createdAt).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </Paper>
                </Box>
            </Paper>
        </Box>
    );
}
