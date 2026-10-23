using MediatR;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.UpdateApplicationStatus;

public sealed record UpdateApplicationStatusCommand(
    Guid ApplicationId,
    string? Status,
    string? Note) : IRequest<UpdateApplicationStatusResult>;

public sealed record ValidatedUpdateApplicationStatusCommand(
    Guid ApplicationId,
    ApplicationStatus Status,
    string? Note);
