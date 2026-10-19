using MediatR;

namespace SmartHire.Application.Features.Cv.Queries.GetMyCvs;

public sealed record GetMyCvsQuery(
    int Page = 0,
    int PageSize = 20,
    bool? IsPublic = null,
    string? Language = null
) : IRequest<CvPageResult>;
