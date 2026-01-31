import { api } from "./api";
import type { TicketCategory, TicketPriority, TicketStatus, TicketListItem } from "../types/ticket";

export type TicketQuery = {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    search?: string;
    sort?: "newest" | "oldest";
};

export async function getTickets(query: TicketQuery = {}) {
    const res = await api.get<TicketListItem[]>("/api/tickets", { params: query });
    return res.data;
}
