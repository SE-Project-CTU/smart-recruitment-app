using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.SendMessage;

public sealed record SendMessageCommand(
    Guid ConversationId,
    string Content,
    string? SectionType = "EXPERIENCE",
    string? TargetJobTitle = null,
    string? Language = "vi"
) : IRequest<AiMessageDto>;
