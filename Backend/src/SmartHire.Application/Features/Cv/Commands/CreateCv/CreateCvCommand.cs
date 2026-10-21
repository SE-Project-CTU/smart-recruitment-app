using MediatR;
using SmartHire.Application.Features.Cv.DTOs;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.CreateCv;

public sealed record CreateCvCommand(
    Guid TemplateId,
    string? Title,
    string? Language = null
) : IRequest<CvResult>;
