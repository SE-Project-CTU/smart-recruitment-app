using MediatR;
using SmartHire.Application.Features.Cv.Commands.CreateCv;

namespace SmartHire.Application.Features.Cv.Queries.GetCvDetail;

public sealed record GetCvDetailQuery(
    Guid Id
) : IRequest<CvResult>;
