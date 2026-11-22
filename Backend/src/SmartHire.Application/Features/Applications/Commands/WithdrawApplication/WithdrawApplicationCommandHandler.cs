using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.WithdrawApplication;

public sealed class WithdrawApplicationCommandHandler
    : IRequestHandler<WithdrawApplicationCommand, WithdrawApplicationResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly IUnitOfWork _unitOfWork;

    public WithdrawApplicationCommandHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<WithdrawApplicationResult> Handle(
        WithdrawApplicationCommand request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw ApplicationExceptions.InvalidAccessToken();
        if (request.ApplicationId == Guid.Empty) throw ApplicationExceptions.InvalidApplicationId();

        var application = await _applicationRepository.GetForStatusUpdateByIdAsync(
            request.ApplicationId, cancellationToken)
            ?? throw ApplicationExceptions.ApplicationNotFound(request.ApplicationId);

        if (application.CandidateId != userId) {
            throw ApplicationExceptions.ApplicationForbidden();
        }

        // Quy tắc nghiệp vụ: Ứng viên chỉ được rút hồ sơ ở các trạng thái trước phỏng vấn.
        // Sau khi đã bước vào vòng phỏng vấn hoặc các vòng sau -> không được phép rút.
        if (application.Status == ApplicationStatus.Withdrawn) {
            throw ApplicationExceptions.CannotWithdrawApplication("Hồ sơ ứng tuyển này đã được rút trước đó.");
        }

        var isBlockedFromWithdrawal = application.Status switch {
            ApplicationStatus.Interviewing or
            ApplicationStatus.Offered or
            ApplicationStatus.Hired or
            ApplicationStatus.Rejected => true,
            _ => false
        };

        if (isBlockedFromWithdrawal) {
            throw ApplicationExceptions.CannotWithdrawApplication(
                "Không thể rút hồ sơ khi ứng viên đã bước vào vòng phỏng vấn hoặc các vòng sau.");
        }

        var now = DateTimeOffset.UtcNow;
        if (!application.TryChangeStatus(ApplicationStatus.Withdrawn, now)) {
            throw ApplicationExceptions.InvalidStatusTransition(application.Status, ApplicationStatus.Withdrawn);
        }

        var note = string.IsNullOrWhiteSpace(request.Reason)
            ? "Ứng viên đã chủ động rút hồ sơ ứng tuyển."
            : $"Ứng viên đã chủ động rút hồ sơ. Lý do: {request.Reason.Trim()}";

        var history = ApplicationStatusHistory.Create(application, userId, note, now);
        application.StatusHistories.Add(history);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return new WithdrawApplicationResult(
            application.Id,
            ApplicationStatusContract.ToApiValue(application.Status),
            application.UpdatedAt);
    }
}
