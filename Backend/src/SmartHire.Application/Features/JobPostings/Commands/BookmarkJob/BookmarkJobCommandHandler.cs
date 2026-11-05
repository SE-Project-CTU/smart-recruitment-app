using MediatR;
using SmartHire.Application.Abstractions.Persistence;
using SmartHire.Application.Abstractions.Security;
using SmartHire.Application.Common.Exceptions;
using SmartHire.Application.Features.JobPostings.DTOs;
using SmartHire.Application.Features.JobPostings.Exceptions;
using SmartHire.Domain.Entities;
using SmartHire.Domain.Enums;

namespace SmartHire.Application.Features.JobPostings.Commands.BookmarkJob;

public sealed class BookmarkJobCommandHandler : IRequestHandler<BookmarkJobCommand, BookmarkJobResult> {
    private readonly ICurrentUser _currentUser;
    private readonly IJobPostingRepository _jobPostingRepository;
    private readonly IJobBookmarkRepository _jobBookmarkRepository;
    private readonly IUnitOfWork _unitOfWork;

    public BookmarkJobCommandHandler(
        ICurrentUser currentUser,
        IJobPostingRepository jobPostingRepository,
        IJobBookmarkRepository jobBookmarkRepository,
        IUnitOfWork unitOfWork) {
        _currentUser = currentUser;
        _jobPostingRepository = jobPostingRepository;
        _jobBookmarkRepository = jobBookmarkRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BookmarkJobResult> Handle(BookmarkJobCommand request, CancellationToken cancellationToken) {
        var userId = _currentUser.UserId ?? throw JobPostingExceptions.InvalidAccessToken();

        var jobPosting = await _jobPostingRepository.GetDetailByIdAsync(request.JobPostingId, cancellationToken);
        if (jobPosting is null) {
            throw JobPostingExceptions.JobPostingNotFound(request.JobPostingId);
        }

        var now = DateTimeOffset.UtcNow;
        var isEligible = jobPosting.Status == JobPostingStatus.Published
                         && jobPosting.Company.VerificationStatus == CompanyVerificationStatus.Verified
                         && (jobPosting.Deadline == null || jobPosting.Deadline > now);

        if (!isEligible) {
            throw JobPostingExceptions.CannotBookmarkUnpublishedJob();
        }

        var exists = await _jobBookmarkRepository.ExistsAsync(userId, request.JobPostingId, cancellationToken);
        if (exists) {
            throw JobPostingExceptions.JobAlreadyBookmarked();
        }

        var bookmark = JobBookmark.Create(userId, request.JobPostingId, now);

        try {
            await _jobBookmarkRepository.AddAsync(bookmark, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        catch (PersistenceUniqueConstraintViolationException ex) when (
            ex.ConstraintName?.Contains("job_bookmarks", StringComparison.OrdinalIgnoreCase) == true) {
            throw JobPostingExceptions.JobAlreadyBookmarked();
        }

        return new BookmarkJobResult(request.JobPostingId, true, now);
    }
}

