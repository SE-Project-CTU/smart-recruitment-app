using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Security;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Exceptions;
using SmartHire.Application.Features.Applications.Mapping;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.Applications.Commands.UpdateApplicationStatus;

public sealed class UpdateApplicationStatusCommandHandler
    : IRequestHandler<UpdateApplicationStatusCommand, UpdateApplicationStatusResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;
    private readonly ICompanyRepository _companyRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateApplicationStatusCommandHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository,
        ICompanyRepository companyRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
        _companyRepository = companyRepository;
        _unitOfWork = unitOfWork;
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

        var now = DateTimeOffset.UtcNow;
        if (!application.TryChangeStatus(validated.Status, now)) {
            throw ApplicationExceptions.InvalidStatusTransition(application.Status, validated.Status);
        }

        var history = ApplicationStatusHistory.Create(application, userId, validated.Note, now);
        application.StatusHistories.Add(history);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        return UpdateApplicationStatusMapper.ToResult(application, history);
    }
}
