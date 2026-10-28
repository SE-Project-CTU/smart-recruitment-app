using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.LeaveCompany;

public sealed class LeaveCompanyCommandHandler : IRequestHandler<LeaveCompanyCommand, LeaveCompanyResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public LeaveCompanyCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<LeaveCompanyResult> Handle(LeaveCompanyCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        var membership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("You are not an active member of this company.");
        }

        if (membership.Role == CompanyMemberRole.Owner) {
            throw CompanyExceptions.CompanyForbidden("The company owner cannot leave the company. Please transfer ownership to another member before leaving.");
        }

        var now = DateTimeOffset.UtcNow;
        membership.UpdateStatus(CompanyMembershipStatus.Left);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new LeaveCompanyResult(request.CompanyId, userId, now);
    }
}
