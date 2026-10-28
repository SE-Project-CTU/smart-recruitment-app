using MediatR;
using Microsoft.Extensions.Logging;
using SmartHire.Application.Abstractions.BackgroundJobs;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Application.Features.Applications.Notifications;
using SmartHire.Application.Features.Notifications.Jobs.DispatchNotificationBatch;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.UpdateApplicationStatus;

public sealed class UpdateApplicationStatusCommandHandler
    : IRequestHandler<UpdateApplicationStatusCommand, UpdateApplicationStatusResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUserRepository _userRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IBackgroundJobScheduler _backgroundJobScheduler;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateApplicationStatusCommandHandler> _logger;

    public UpdateApplicationStatusCommandHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository,
        ICompanyRepository companyRepository,
        IUserRepository userRepository,
        INotificationRepository notificationRepository,
        IBackgroundJobScheduler backgroundJobScheduler,
        IUnitOfWork unitOfWork,
        ILogger<UpdateApplicationStatusCommandHandler> logger) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
        _companyRepository = companyRepository;
        _userRepository = userRepository;
        _notificationRepository = notificationRepository;
        _backgroundJobScheduler = backgroundJobScheduler;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UpdateApplicationStatusResult> Handle(
        UpdateApplicationStatusCommand request,
        CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw ApplicationExceptions.InvalidAccessToken();
        if (!_currentUser.Roles.Contains(RoleNames.Recruiter)) {
            throw ApplicationExceptions.ApplicationManagementForbidden();
        }

        var validated = UpdateApplicationStatusCommandValidator.Validate(request);
        if (validated.ApplicationId == Guid.Empty) throw ApplicationExceptions.InvalidApplicationId();

        var application = await _applicationRepository.GetForStatusUpdateByIdAsync(
            validated.ApplicationId, cancellationToken)
            ?? throw ApplicationExceptions.ApplicationNotFound(validated.ApplicationId);

        var membership = await _companyRepository.GetMembershipAsync(
            application.Job.CompanyId, userId, cancellationToken);
        if (membership is null || membership.Status != CompanyMembershipStatus.Active) {
            throw ApplicationExceptions.ApplicationManagementForbidden();
        }

        var currentAccount = await _userRepository.GetCurrentAccountAsync(userId, cancellationToken);
        var actor = new ApplicationStatusHistoryActorResult(
            userId,
            currentAccount?.FullName ?? string.Empty,
            currentAccount?.Email ?? string.Empty,
            currentAccount?.AvatarUrl,
            currentAccount?.Roles.FirstOrDefault() ?? RoleNames.Recruiter);

        var now = DateTimeOffset.UtcNow;
        (UpdateApplicationStatusResult Result, Guid NotificationId) transactionResult;
        try {
            transactionResult = await _unitOfWork.ExecuteInTransactionAsync(async ct => {
                if (!application.TryChangeStatus(validated.Status, now)) {
                    throw ApplicationExceptions.InvalidStatusTransition(application.Status, validated.Status);
                }

                var history = ApplicationStatusHistory.Create(application, userId, validated.Note, now);
                application.StatusHistories.Add(history);

                var notification = ApplicationStatusUpdateNotificationFactory.Create(application, now);
                await _notificationRepository.AddAsync(notification, ct);
                await _unitOfWork.SaveChangesAsync(ct);

                return (
                    Result: UpdateApplicationStatusMapper.ToResult(application, history, actor),
                    NotificationId: notification.Id);
            }, cancellationToken);
        }
        catch (OptimisticConcurrencyException) {
            throw ApplicationExceptions.ApplicationStatusConflict();
        }

        try {
            _backgroundJobScheduler.Enqueue<DispatchNotificationBatchJob, DispatchNotificationBatchJobArgs>(
                new DispatchNotificationBatchJobArgs([transactionResult.NotificationId]));
        }
        catch (Exception exception) {
            _logger.LogError(
                exception,
                "Could not enqueue realtime dispatch for application {ApplicationId} status update notification {NotificationId}.",
                application.Id,
                transactionResult.NotificationId);
        }

        return transactionResult.Result;
    }
}
