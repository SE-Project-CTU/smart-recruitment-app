using MediatR;

namespace SmartHire.Application.Features.Auth.Refresh;

public sealed record RefreshCommand(string RefreshToken) : IRequest<RefreshResult>;