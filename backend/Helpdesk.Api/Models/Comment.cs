using System.ComponentModel.DataAnnotations;

namespace Helpdesk.Api.Models;

public class Comment
{
    public int Id { get; set; }

    public int TicketId { get; set; }
    public Ticket? Ticket { get; set; }

    [Required, MinLength(2), MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(1000)]
    public string Message { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }
}
