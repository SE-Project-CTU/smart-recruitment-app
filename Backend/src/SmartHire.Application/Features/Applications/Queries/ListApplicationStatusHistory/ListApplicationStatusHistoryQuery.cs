using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Queries.ListApplicationStatusHistory;

public sealed record ListApplicationStatusHistoryQuery(
    Guid ApplicationId,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<ApplicationStatusHistoryPageResult>;

public sealed record ValidatedListApplicationStatusHistoryQuery(
    Guid ApplicationId,
    int Page,
    int PageSize,
    int Skip);
