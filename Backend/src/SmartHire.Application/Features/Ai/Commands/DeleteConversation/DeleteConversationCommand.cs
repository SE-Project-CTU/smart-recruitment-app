using MediatR;

namespace SmartHire.Application.Features.Ai.Commands.DeleteConversation;

public sealed record DeleteConversationCommand(Guid ConversationId) : IRequest<bool>;
