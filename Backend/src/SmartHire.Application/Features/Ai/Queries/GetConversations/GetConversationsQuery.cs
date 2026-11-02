using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Queries.GetConversations;

public sealed record GetConversationsQuery(string? Search = null) : IRequest<AiConversationListResponse>;
