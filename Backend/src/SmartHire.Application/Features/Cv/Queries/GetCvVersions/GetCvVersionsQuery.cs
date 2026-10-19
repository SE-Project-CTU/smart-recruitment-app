using MediatR;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersions;

public sealed record GetCvVersionsQuery(
    Guid CvId,
    int Page = 0,
    int PageSize = 20) : IRequest<CvVersionPageResult>;
