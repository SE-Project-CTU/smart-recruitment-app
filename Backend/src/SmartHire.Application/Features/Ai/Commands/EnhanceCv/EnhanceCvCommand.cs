using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCv;

public sealed record EnhanceCvCommand(
    string? Content = null,
    string? SectionType = null,
    Guid? CvId = null,
    Guid? CvVersionId = null,
    Guid? TargetJobId = null,
    string? TargetJobTitle = null,
    string? TargetJobDescription = null,
    string? Language = null
) : IRequest<EnhanceCvResult>;
