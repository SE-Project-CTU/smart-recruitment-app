using System.ComponentModel.DataAnnotations;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Api.Contracts.Requests;

public sealed record CreateCvRequest {
    [Required] public Guid TemplateId { get; init; }
    
    [Required]
    [StringLength(150, MinimumLength = 1)]
    public string? Title { get; init; }
    
    public string? Language { get; init; }
}