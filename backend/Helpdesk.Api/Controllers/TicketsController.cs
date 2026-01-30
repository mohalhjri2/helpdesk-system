using Helpdesk.Api.Data;
using Helpdesk.Api.Dtos;
using Helpdesk.Api.Models;
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

    // POST /api/tickets
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateTicketDto dto)
    {
        var ticket = new Ticket
        {
            Title = dto.Title.Trim(),
            Description = dto.Description.Trim(),
            Category = dto.Category,
            Priority = dto.Priority,
            Status = TicketStatus.Open
        };

        _db.Tickets.Add(ticket);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = ticket.Id }, new
        {
            ticket.Id,
            ticket.Title,
            ticket.Description,
            ticket.Category,
            ticket.Priority,
            ticket.Status,
            ticket.CreatedAt,
            ticket.UpdatedAt
        });
    }
    // GET /api/tickets/{id}/comments
    [HttpGet("{id:int}/comments")]
    public async Task<IActionResult> GetComments(int id)
    {
        var ticketExists = await _db.Tickets
            .AsNoTracking()
            .AnyAsync(t => t.Id == id);

        if (!ticketExists)
            return NotFound(new { message = "Ticket not found." });

        var comments = await _db.Comments
            .AsNoTracking()
            .Where(c => c.TicketId == id)
            .OrderBy(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.TicketId,
                c.Message,
                c.CreatedAt
            })
            .ToListAsync();

        return Ok(comments);
    }
    // POST /api/tickets/{id}/comments
    [HttpPost("{id:int}/comments")]
    public async Task<IActionResult> AddComment(int id, [FromBody] CreateCommentDto dto)
    {
        var ticket = await _db.Tickets.FirstOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        if (ticket.Status == TicketStatus.Closed)
            return Conflict(new { message = "Cannot add comments to a closed ticket." });

        var comment = new Comment
        {
            TicketId = id,
            Message = dto.Message.Trim()
        };

        _db.Comments.Add(comment);
        await _db.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetComments),
            new { id },
            new
            {
                comment.Id,
                comment.TicketId,
                comment.Message,
                comment.CreatedAt
            }
        );
    }

    // PATCH /api/tickets/{id}/status
    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateTicketStatusDto dto)
    {
        var ticket = await _db.Tickets
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (ticket is null)
            return NotFound(new { message = "Ticket not found." });

        var newStatus = dto.Status;
        var currentStatus = ticket.Status;

        if (newStatus == currentStatus)
            return Ok(new { message = "Status unchanged.", status = ticket.Status });

        var allowed = (currentStatus, newStatus) switch
        {
            (TicketStatus.Open, TicketStatus.InProgress) => true,
            (TicketStatus.Open, TicketStatus.Closed) => true,
            (TicketStatus.InProgress, TicketStatus.Closed) => true,
            _ => false
        };

        if (!allowed)
            return Conflict(new { message = $"Invalid status transition: {currentStatus} => {newStatus}." });

        if (newStatus == TicketStatus.Closed && ticket.Comments.Count == 0)
            return Conflict(new { message = "Cannot close a ticket without at least one comment." });

        ticket.Status = newStatus;
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = "Status updated.",
            ticket.Id,
            ticket.Status,
            ticket.UpdatedAt
        });
    }

}
