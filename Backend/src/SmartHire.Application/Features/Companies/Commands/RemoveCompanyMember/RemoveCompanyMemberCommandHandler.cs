using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Companies.Exceptions;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Companies.Commands.RemoveCompanyMember;

public sealed class RemoveCompanyMemberCommandHandler : IRequestHandler<RemoveCompanyMemberCommand> {
    private readonly ICurrentUser _currentUser;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public RemoveCompanyMemberCommandHandler(
        ICurrentUser currentUser,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(RemoveCompanyMemberCommand request, CancellationToken cancellationToken) {
        if (_currentUser.UserId is not Guid userId) {
            throw CompanyExceptions.InvalidAccessToken();
        }

        var company = await _companyRepository.GetByIdAsync(request.CompanyId, cancellationToken);
        if (company is null) {
            throw CompanyExceptions.CompanyNotFound();
        }

        // Caller phải là active Owner của công ty
        var callerMembership = await _companyRepository.GetMembershipAsync(request.CompanyId, userId, cancellationToken);
        if (callerMembership is null || callerMembership.Role != CompanyMemberRole.Owner || callerMembership.Status != CompanyMembershipStatus.Active) {
            throw CompanyExceptions.NotCompanyOwner();
        }

        // Tìm membership của thành viên cần xóa (hỗ trợ cả MembershipId lẫn UserId)
        var targetMembership = await _companyRepository.GetMembershipByIdOrUserIdAsync(request.CompanyId, request.MemberId, cancellationToken);
        if (targetMembership is null) {
            throw CompanyExceptions.CompanyMembershipNotFound();
        }

        // Không được xóa Owner (hoặc chính mình)
        if (targetMembership.Role == CompanyMemberRole.Owner || targetMembership.UserId == userId) {
            throw CompanyExceptions.CompanyForbidden("Cannot remove the company owner. Please transfer ownership first.");
        }

        // Nếu thành viên đã rời công ty
        if (targetMembership.Status == CompanyMembershipStatus.Left) {
            return;
        }

        targetMembership.UpdateStatus(CompanyMembershipStatus.Left);
        await _unitOfWork.SaveChangesAsync(cancellationToken);
    }
}
