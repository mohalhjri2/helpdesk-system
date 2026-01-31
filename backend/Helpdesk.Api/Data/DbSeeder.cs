using Helpdesk.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Helpdesk.Api.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext db)
    {
        if (await db.Tickets.AnyAsync()) return;

        var t1 = new Ticket
        {
            Title = "Cannot login to dashboard",
            Description = "User receives invalid credentials error although password is correct.",
            CreatedBy = "Joseph",
            Category = TicketCategory.IT,
            Priority = TicketPriority.High,
            Status = TicketStatus.Open
        };

        var t2 = new Ticket
        {
            Title = "Air conditioning issue in meeting room",
            Description = "AC not cooling properly in meeting room 3.",
            CreatedBy = "Collins",
            Category = TicketCategory.Facilities,
            Priority = TicketPriority.Medium,
            Status = TicketStatus.InProgress
        };

        var t3 = new Ticket
        {
            Title = "Request: Add new user role",
            Description = "Need a new role for contractor access with limited permissions.",
            CreatedBy = "Noah",
            Category = TicketCategory.General,
            Priority = TicketPriority.Low,
            Status = TicketStatus.Open
        };

        var t4 = new Ticket
        {
            Title = "Printer not working on floor 5",
            Description = "Printer shows paper jam error even after clearing tray.",
            CreatedBy = "Alessandra",
            Category = TicketCategory.Facilities,
            Priority = TicketPriority.Medium,
            Status = TicketStatus.Open
        };

        var t5 = new Ticket
        {
            Title = "API timeout when submitting form",
            Description = "Submission occasionally fails with timeout after 30 seconds.",
            CreatedBy = "Dennis",
            Category = TicketCategory.IT,
            Priority = TicketPriority.High,
            Status = TicketStatus.Open
        };

        db.Tickets.AddRange(t1, t2, t3, t4, t5);
        await db.SaveChangesAsync();

        db.Comments.AddRange(
            new Comment
            {
                TicketId = t2.Id,
                Author = "Support Agent",
                Message = "Technician assigned, investigating root cause."
            },
            new Comment
            {
                TicketId = t2.Id,
                Author = "Support Agent",
                Message = "Temporary fix applied; monitoring performance."
            },
            new Comment
            {
                TicketId = t5.Id,
                Author = "Support Agent",
                Message = "Can you share the steps to reproduce + timestamp?"
            }
        );

        await db.SaveChangesAsync();
    }
}
