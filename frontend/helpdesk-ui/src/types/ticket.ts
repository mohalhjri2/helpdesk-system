export type TicketCategory = 0 | 1 | 2; // IT, Facilities, General
export type TicketPriority = 0 | 1 | 2; // Low, Medium, High
export type TicketStatus = 0 | 1 | 2;   // Open, InProgress, Closed

export type CommentItem = {
    id: number;
    ticketId: number;
    author: string;
    message: string;
    createdAt: string;
};

export type TicketListItem = {
    id: number;
    title: string;
    createdBy: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    commentCount: number;
};

export type TicketDetails = {
    id: number;
    title: string;
    description: string;
    createdBy: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    createdAt: string;
    updatedAt: string;
    comments: CommentItem[];
};
