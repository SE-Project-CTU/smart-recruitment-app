using MediatR;

namespace SmartHire.Application.Features.Ai.Commands.DeleteAllConversations;

public sealed record DeleteAllConversationsCommand : IRequest<int>;
