using Helpdesk.Api.Models;

namespace Helpdesk.Api.Dtos;

public record TicketListItemDto(
    int Id,
    string Title,
    TicketCategory Category,
    TicketPriority Priority,
    TicketStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    int CommentCount
);

public record CommentDto(
    int Id,
    int TicketId,
    string Message,
    DateTime CreatedAt
);

public record TicketDetailsDto(
    int Id,
    string Title,
    string Description,
    TicketCategory Category,
    TicketPriority Priority,
    TicketStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    IReadOnlyList<CommentDto> Comments
);
