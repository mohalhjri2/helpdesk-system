using System.ComponentModel.DataAnnotations;
using Helpdesk.Api.Models;

namespace Helpdesk.Api.Dtos;

public class CreateTicketDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public TicketCategory Category { get; set; }

    [Required]
    public TicketPriority Priority { get; set; }
}
