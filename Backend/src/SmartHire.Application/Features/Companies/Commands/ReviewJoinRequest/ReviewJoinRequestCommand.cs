using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.ReviewJoinRequest;

public sealed record ReviewJoinRequestCommand(
    Guid CompanyId,
    Guid RequestId,
    string Status
) : IRequest<ReviewJoinRequestResult>;
