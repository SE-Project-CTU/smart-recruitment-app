using System.ComponentModel.DataAnnotations;

namespace SmartHire.Api.Contracts.Requests;

public sealed record UpdateApplicationStatusRequest(
    [Required(ErrorMessage = "Status is required.")]
    string? Status,
    [StringLength(2_000, ErrorMessage = "Note must not exceed 2000 characters.")]
    string? Note);
