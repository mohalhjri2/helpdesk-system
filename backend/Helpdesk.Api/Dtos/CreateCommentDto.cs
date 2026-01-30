using System.ComponentModel.DataAnnotations;

namespace Helpdesk.Api.Dtos;

public class CreateCommentDto
{
    [Required, MaxLength(2000)]
    public string Message { get; set; } = string.Empty;
}
