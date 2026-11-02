using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.TogglePin;

public sealed record TogglePinCommand(Guid ConversationId, bool? IsPinned = null) : IRequest<AiConversationSummaryDto>;
