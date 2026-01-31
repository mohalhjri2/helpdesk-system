using System.ComponentModel.DataAnnotations;
using Helpdesk.Api.Models;

namespace Helpdesk.Api.Dtos;

public class CreateTicketDto
{
    [Required, MinLength(5), MaxLength(100)]
    public string Title { get; set; } = string.Empty;

    [Required, MinLength(10), MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(100)]
    public string CreatedBy { get; set; } = string.Empty;

    [Required]
    public TicketCategory Category { get; set; }

    [Required]
    public TicketPriority Priority { get; set; }
}
