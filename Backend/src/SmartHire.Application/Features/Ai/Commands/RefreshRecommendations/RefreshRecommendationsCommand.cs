using MediatR;
using SmartHire.Application.Features.Ai.DTOs;

namespace SmartHire.Application.Features.Ai.Commands.RefreshRecommendations;

public sealed record RefreshRecommendationsCommand : IRequest<RefreshRecommendationsResult>;
