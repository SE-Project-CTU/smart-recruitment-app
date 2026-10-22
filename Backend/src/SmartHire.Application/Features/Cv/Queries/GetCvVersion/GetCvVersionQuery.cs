using MediatR;
using SmartHire.Application.Features.Cv.DTOs;

namespace SmartHire.Application.Features.Cv.Queries.GetCvVersion;

public sealed record GetCvVersionQuery(Guid CvId, Guid VersionId)
    : IRequest<CvVersionResult>;
