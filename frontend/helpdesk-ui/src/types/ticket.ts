export type TicketCategory = 0 | 1 | 2; // IT, Facilities, General
export type TicketPriority = 0 | 1 | 2; // Low, Medium, High
export type TicketStatus = 0 | 1 | 2;   // Open, InProgress, Closed

export type TicketListItem = {
    id: number;
    title: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
};
