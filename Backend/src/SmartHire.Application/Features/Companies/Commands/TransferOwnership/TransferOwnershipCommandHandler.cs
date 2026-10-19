using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Companies.DTOs;
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
            throw new AppException(
                AppErrorKind.Unauthorized,
                AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user id.");
        }

        if (request.NewOwnerId == userId) {
            throw new AppException(
                AppErrorKind.BadRequest,
                CommonErrorCodes.ValidationError,
                "New owner cannot be the same as current owner.");
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw new AppException(
                AppErrorKind.NotFound,
                CompanyErrorCodes.CompanyNotFound,
                "Company not found.");
        }

        // Caller phải là Owner
        var currentOwnerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (currentOwnerMembership is null || currentOwnerMembership.Role != CompanyMemberRole.Owner || currentOwnerMembership.Status != CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Forbidden,
                CompanyErrorCodes.CompanyForbidden,
                "Only an active Company Owner can transfer ownership.");
        }

        // New owner phải là thành viên hiện tại của công ty
        var newOwnerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, request.NewOwnerId, cancellationToken);
        if (newOwnerMembership is null || newOwnerMembership.Status != CompanyMembershipStatus.Active) {
            throw new AppException(
                AppErrorKind.Conflict,
                CompanyErrorCodes.CompanyNewOwnerInvalid,
                "New owner must be an active member of this company.");
        }

        var now = DateTimeOffset.UtcNow;

        return await _unitOfWork.ExecuteInTransactionAsync(async ct => {
            currentOwnerMembership.UpdateRole(CompanyMemberRole.Recruiter);
            newOwnerMembership.UpdateRole(CompanyMemberRole.Owner);

            await _unitOfWork.SaveChangesAsync(ct);

            return new TransferOwnershipResult(
                request.CompanyId,
                userId,
                request.NewOwnerId,
                now);
        }, cancellationToken);
    }
}
