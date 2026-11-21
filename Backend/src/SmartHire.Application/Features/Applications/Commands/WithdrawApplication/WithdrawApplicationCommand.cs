using MediatR;
using SmartHire.Application.Features.Applications.DTOs;

namespace SmartHire.Application.Features.Applications.Commands.WithdrawApplication;

public sealed record WithdrawApplicationCommand(Guid ApplicationId, string? Reason)
    : IRequest<WithdrawApplicationResult>;
