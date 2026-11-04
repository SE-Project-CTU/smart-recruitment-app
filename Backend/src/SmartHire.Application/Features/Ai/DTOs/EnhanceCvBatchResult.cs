namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record EnhanceCvBatchResult(
    IReadOnlyList<EnhanceCvBatchItemResult> Sections
);

