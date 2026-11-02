namespace SmartHire.Application.Features.Ai.DTOs;

public sealed record AiMessageDto(
    Guid Id,
    string Sender,
    string Content,
    string? MetadataJson,
    DateTimeOffset CreatedAt
);

