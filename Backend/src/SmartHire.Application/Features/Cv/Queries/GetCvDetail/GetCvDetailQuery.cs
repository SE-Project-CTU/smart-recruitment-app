using MediatR;
using SmartHire.Application.Features.Cv.Commands.CreateCv;

namespace SmartHire.Application.Features.Cv.Queries.GetCvDetaill;

public sealed record GetCvDetailQuery(
    Guid Id
) : IRequest<CvResult>;