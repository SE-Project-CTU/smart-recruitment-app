namespace SmartHire.Application.Features.Companies.DTOs;

public sealed record CompanyApplicationFilter(
    Guid? JobId = null,
    string? Status = null,
    string? Search = null);
