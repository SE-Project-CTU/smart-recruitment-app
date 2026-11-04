using MediatR;

namespace SmartHire.Application.Features.Companies.Commands.RemoveCompanyMember;

public sealed record RemoveCompanyMemberCommand(
    Guid CompanyId,
    Guid MemberId
) : IRequest;
