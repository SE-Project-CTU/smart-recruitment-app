using MediatR;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersion;

public sealed record GetCvVersionQuery(Guid CvId, Guid VersionId)
    : IRequest<CvVersionResult>;
