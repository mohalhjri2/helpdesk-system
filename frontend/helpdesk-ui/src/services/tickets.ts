import { api } from "./api";
import type {
    TicketCategory,
    TicketPriority,
    TicketStatus,
    TicketListItem,
    TicketDetails,
} from "../types/ticket";

export type TicketQuery = {
    status?: TicketStatus;
    priority?: TicketPriority;
    category?: TicketCategory;
    search?: string;
    sort?: "newest" | "oldest";
};

export type CreateTicketPayload = {
    title: string;
    description: string;
    createdBy: string;
    category: TicketCategory;
    priority: TicketPriority;
};

export type CreateCommentPayload = {
    author: string;
    message: string;
};

export async function getTickets(query: TicketQuery = {}) {
    const res = await api.get<TicketListItem[]>("/api/tickets", { params: query });
    return res.data;
}

export async function createTicket(payload: CreateTicketPayload) {
    const res = await api.post("/api/tickets", payload);
    return res.data;
}

export async function getTicketDetails(id: number) {
    const res = await api.get<TicketDetails>(`/api/tickets/${id}`);
    return res.data;
}

export async function updateTicketStatus(id: number, status: TicketStatus) {
    const res = await api.patch(`/api/tickets/${id}/status`, { status });
    return res.data;
}

export async function addTicketComment(id: number, payload: CreateCommentPayload) {
    const res = await api.post(`/api/tickets/${id}/comments`, payload);
    return res.data;
}
