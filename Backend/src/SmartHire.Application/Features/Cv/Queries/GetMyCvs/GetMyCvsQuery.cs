using MediatR;
using SmartHire.Application.Common.Validation;

namespace SmartHire.Application.Features.Cv.Queries.GetMyCvs;

public sealed record GetMyCvsQuery(
    int Page = PagedListQueryValidator.FirstPage,
    int PageSize = 20,
    bool? IsPublic = null,
    string? Language = null
) : IRequest<CvPageResult>;
