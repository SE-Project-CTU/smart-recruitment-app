using MediatR;
using SmartHire.Application.Common.Validation;
using SmartHire.Application.Features.Cv.DTOs;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersions;

public sealed record GetCvVersionsQuery(
    Guid CvId,
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20) : IRequest<CvVersionPageResult>;
