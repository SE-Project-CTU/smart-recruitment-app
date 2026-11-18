using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.EnhanceCvBatch;

public sealed record CvSectionBatchInputDto(
    string SectionType,
    string Content
);

public sealed record EnhanceCvBatchCommand(
    IReadOnlyList<CvSectionBatchInputDto> Sections,
    Guid? CvId = null,
    Guid? CvVersionId = null,
    Guid? TargetJobId = null,
    string? TargetJobTitle = null,
    string? TargetJobDescription = null,
    string? Language = null,
    string? CustomPrompt = null
) : IRequest<EnhanceCvBatchResult>;

