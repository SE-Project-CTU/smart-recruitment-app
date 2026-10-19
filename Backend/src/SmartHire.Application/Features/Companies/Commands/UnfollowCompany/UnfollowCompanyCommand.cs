using MediatR;

namespace SmartHire.Application.Features.Companies.Commands.UnfollowCompany;

public sealed record UnfollowCompanyCommand(
    Guid CompanyId
) : IRequest;
