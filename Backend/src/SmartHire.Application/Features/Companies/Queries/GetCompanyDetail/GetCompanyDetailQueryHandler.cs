using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Application.Features.Companies.Mapping;

namespace SmartHire.Application.Features.Companies.Queries.GetCompanyDetail;

public sealed class GetCompanyDetailQueryHandler : IRequestHandler<GetCompanyDetailQuery, CompanyResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;

    public GetCompanyDetailQueryHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
    }

    public async Task<CompanyResult> Handle(GetCompanyDetailQuery request, CancellationToken cancellationToken) {
        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        CompanyMembershipSummary? membershipSummary = null;
        if (_currentUser.UserId is Guid userId) {
            var membership = await _companyRepository.GetMembershipAsync(company.Id, userId, cancellationToken);
            if (membership is not null) {
                membershipSummary = new CompanyMembershipSummary(
                    membership.Role.ToString(),
                    membership.Status.ToString());
            }
        }

        return CompanyResultMapper.ToCompanyResult(company, membership: membershipSummary);
    }
}
