using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.DTOs;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.TransferOwnership;

public sealed class TransferOwnershipCommandHandler : IRequestHandler<TransferOwnershipCommand, TransferOwnershipResult> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public TransferOwnershipCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<TransferOwnershipResult> Handle(TransferOwnershipCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        if (request.NewOwnerId == userId) {
            throw CompanyExceptions.CompanyNewOwnerInvalid("New owner cannot be the same as current owner.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là Owner
        var currentOwnerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (currentOwnerMembership is null || currentOwnerMembership.Role != CompanyMemberRole.Owner || currentOwnerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyForbidden("Only an active Company Owner can transfer ownership.");
        }

        // New owner phải là thành viên hiện tại của công ty
        var newOwnerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, request.NewOwnerId, cancellationToken);
        if (newOwnerMembership is null || newOwnerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.CompanyNewOwnerInvalid("New owner must be an active member of this company.");
        }

        var now = DateTimeOffset.UtcNow;

        return await _unitOfWork.ExecuteInTransactionAsync(async cancellationToken => {
            currentOwnerMembership.UpdateRole(CompanyMemberRole.Recruiter);
            newOwnerMembership.UpdateRole(CompanyMemberRole.Owner);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return new TransferOwnershipResult(
                request.CompanyId,
                userId,
                request.NewOwnerId,
                now);
        }, cancellationToken);
    }
}
