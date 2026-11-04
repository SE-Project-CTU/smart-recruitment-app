using MediatR;
using SmartHire.Application.Features.Admin.Companies.DTOs;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Admin.Companies.Commands.ReviewCompanyVerification;

public sealed record ReviewCompanyVerificationCommand(
    Guid CompanyId,
    CompanyVerificationStatus Status,
    string? Reason = null
) : IRequest<ReviewCompanyVerificationResult>;
