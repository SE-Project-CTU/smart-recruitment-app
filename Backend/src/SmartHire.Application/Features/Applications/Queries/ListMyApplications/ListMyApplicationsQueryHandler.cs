using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Errors;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.Applications.DTOs;
using SmartHire.Application.Features.Applications.Mapping;

namespace SmartHire.Application.Features.Applications.Queries.ListMyApplications;

public sealed class ListMyApplicationsQueryHandler
    : IRequestHandler<ListMyApplicationsQuery, MyApplicationsPageResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobApplicationRepository _applicationRepository;

    public ListMyApplicationsQueryHandler(
        ICurrentUser currentUser,
        IJobApplicationRepository applicationRepository) {
        _currentUser = currentUser;
        _applicationRepository = applicationRepository;
    }

    public async Task<MyApplicationsPageResult> Handle(
        ListMyApplicationsQuery request,
        CancellationToken cancellationToken) {
        var candidateId = _currentUser.UserId
            ?? throw new AppException(AppErrorKind.Unauthorized, AuthErrorCodes.InvalidAccessToken,
                "The access token does not contain a valid user ID.");
        var validated = ListMyApplicationsQueryValidator.Validate(request);

        var totalItems = await _applicationRepository.CountMineAsync(
            candidateId, validated.Status, cancellationToken);
        var rows = await _applicationRepository.GetMinePageAsync(
            candidateId,
            validated.Status,
            validated.Sort,
            validated.Direction,
            validated.Skip,
            validated.PageSize,
            cancellationToken);

        var items = rows.Select(row => new MyApplicationListItemResult(
            row.Id,
            row.JobId,
            row.CandidateId,
            row.CvVersionId,
            row.UploadedCvUrl,
            row.CoverLetter,
            ApplicationStatusContract.ToApiValue(row.Status),
            row.AppliedAt,
            row.UpdatedAt)).ToArray();

        return new MyApplicationsPageResult(items, validated.Page, validated.PageSize, totalItems);
    }
}
