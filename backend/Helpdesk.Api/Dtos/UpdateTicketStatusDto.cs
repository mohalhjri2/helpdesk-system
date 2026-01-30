using System.ComponentModel.DataAnnotations;
using Helpdesk.Api.Models;

namespace Helpdesk.Api.Dtos;

public class UpdateTicketStatusDto
{
    [Required]
    public TicketStatus Status { get; set; }
}
