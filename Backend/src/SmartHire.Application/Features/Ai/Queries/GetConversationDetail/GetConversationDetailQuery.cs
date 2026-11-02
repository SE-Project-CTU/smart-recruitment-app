using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Queries.GetConversationDetail;

public sealed record GetConversationDetailQuery(Guid ConversationId) : IRequest<AiConversationDetailDto>;
