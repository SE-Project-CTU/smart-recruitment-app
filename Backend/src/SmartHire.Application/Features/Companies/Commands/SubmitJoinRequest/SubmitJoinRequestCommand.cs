using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.SubmitJoinRequest;

public sealed record SubmitJoinRequestCommand(
    Guid CompanyId,
    string? Message
) : IRequest<CompanyJoinRequestResult>;
