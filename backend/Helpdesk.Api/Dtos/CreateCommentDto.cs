using System.ComponentModel.DataAnnotations;

namespace Helpdesk.Api.Dtos;

public class CreateCommentDto
{
    [Required, MinLength(2), MaxLength(100)]
    public string Author { get; set; } = string.Empty;

    [Required, MinLength(2), MaxLength(1000)]
    public string Message { get; set; } = string.Empty;
}
