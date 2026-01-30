using Helpdesk.Api.Data;
using Helpdesk.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly AppDbContext _db;
    public TicketsController(AppDbContext db) => _db = db;

    // GET /api/tickets
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TicketListItemDto>>> GetAll()
    {
        var tickets = await _db.Tickets
            .AsNoTracking()
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => new TicketListItemDto(
                t.Id,
                t.Title,
                t.Category,
                t.Priority,
                t.Status,
                t.CreatedAt,
                t.UpdatedAt,
                t.Comments.Count
            ))
            .ToListAsync();

        return Ok(tickets);
    }

    // GET /api/tickets/{id}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<TicketDetailsDto>> GetById(int id)
    {
        var ticket = await _db.Tickets
            .AsNoTracking()
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket is null) return NotFound(new { message = "Ticket not found." });

        var dto = new TicketDetailsDto(
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Category,
            ticket.Priority,
            ticket.Status,
            ticket.CreatedAt,
            ticket.UpdatedAt,
            ticket.Comments
                .OrderBy(c => c.CreatedAt)
                .Select(c => new CommentDto(c.Id, c.TicketId, c.Message, c.CreatedAt))
                .ToList()
        );

        return Ok(dto);
    }
}
