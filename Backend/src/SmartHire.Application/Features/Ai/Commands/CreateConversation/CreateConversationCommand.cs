using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.CreateConversation;

public sealed record CreateConversationCommand(string? Title, Guid? CvId) : IRequest<AiConversationSummaryDto>;
