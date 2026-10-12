using System.ComponentModel.DataAnnotations;
using SmartHire.Api.Contracts.Validation;

namespace SmartHire.Api.Contracts.Requests;

public sealed record CreateCvRequest {
    [NotEmptyGuid(ErrorMessage = "Template id must be a valid non-empty UUID.")]
    public Guid TemplateId { get; init; }
    
    [Required(ErrorMessage = "Title is required.")]
    [StringLength(150, MinimumLength = 1,
        ErrorMessage = "Title must contain between 1 and 150 characters.")]
    public string? Title { get; init; }
    
    [RegularExpression(RequestValidationPatterns.CvLanguage,
        ErrorMessage = "Language must be either 'vi' or 'en'.")]
    public string? Language { get; init; }
}
