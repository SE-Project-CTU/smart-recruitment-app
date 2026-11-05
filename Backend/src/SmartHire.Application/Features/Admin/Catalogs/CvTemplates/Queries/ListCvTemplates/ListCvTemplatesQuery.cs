using MediatR;
using SmartHire.Application.Common.Pagination;
using SmartHire.Application.Features.Admin.Catalogs.DTOs;

namespace SmartHire.Application.Features.Admin.Catalogs.CvTemplates.Queries.ListCvTemplates;

public sealed record ListCvTemplatesQuery(
    string? Search = null,
    bool? IsActive = null,
    PaginationParams? Pagination = null
) : IRequest<(IReadOnlyList<AdminCvTemplateItemDto> Items, int TotalCount)>;

