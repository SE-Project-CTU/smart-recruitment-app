using MediatR;
using SmartHire.Application.Features.Companies.DTOs;

namespace SmartHire.Application.Features.Companies.Commands.TransferOwnership;

public sealed record TransferOwnershipCommand(
    Guid CompanyId,
    Guid NewOwnerId
) : IRequest<TransferOwnershipResult>;
