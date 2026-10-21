using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class JobApplication {
    private const int MaximumCoverLetterLength = 10_000;
    public Guid Id { get; private set; }
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    public Guid CandidateId { get; private set; }
    public User Candidate { get; private set; } = null!;
    public Guid? CvVersionId { get; private set; }
    public CvVersion? CvVersion { get; private set; }
    public Guid? UploadedCvFileId { get; private set; }
    public MediaFile? UploadedCvFile { get; private set; }
    public string CoverLetter { get; private set; } = string.Empty;
    public ApplicationStatus Status { get; private set; }
    public DateTimeOffset AppliedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    public ICollection<ApplicationStatusHistory> StatusHistories { get; private set; } = new List<ApplicationStatusHistory>();
    public AiMatchResult? AiMatchResult { get; private set; }

    /// <summary>
    /// Initializes a job application for Entity Framework Core materialization.
    /// </summary>
    private JobApplication() { }

    public bool TryChangeStatus(ApplicationStatus status, DateTimeOffset now) {
        var isAllowed = (Status, status) switch {
            (ApplicationStatus.Submitted, ApplicationStatus.Reviewing or ApplicationStatus.Withdrawn) => true,
            (ApplicationStatus.Reviewing, ApplicationStatus.Shortlisted or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            (ApplicationStatus.Shortlisted, ApplicationStatus.Interviewing or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            (ApplicationStatus.Interviewing, ApplicationStatus.Offered or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            (ApplicationStatus.Offered, ApplicationStatus.Hired or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            // Keep applications written by the earlier API status names movable along the same workflow.
            (ApplicationStatus.Received, ApplicationStatus.Shortlisted or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            (ApplicationStatus.Approved, ApplicationStatus.Interviewing or ApplicationStatus.Rejected or ApplicationStatus.Withdrawn) => true,
            _ => false
        };

        if (!isAllowed) {
            return false;
        }

        Status = status;
        UpdatedAt = now;
        return true;
    }

    public static JobApplication Create(
        Guid jobId,
        Guid candidateId,
        Guid? cvVersionId,
        Guid? uploadedCvFileId,
        string? coverLetter,
        DateTimeOffset now) {
        if (jobId == Guid.Empty) throw new ArgumentException("Job ID is required.", nameof(jobId));
        if (candidateId == Guid.Empty) throw new ArgumentException("Candidate ID is required.", nameof(candidateId));
        if (cvVersionId.HasValue == uploadedCvFileId.HasValue)
            throw new ArgumentException("Exactly one CV source must be provided.");
        if (cvVersionId == Guid.Empty || uploadedCvFileId == Guid.Empty)
            throw new ArgumentException("CV source ID cannot be empty.");
        if (coverLetter?.Length > MaximumCoverLetterLength)
            throw new ArgumentOutOfRangeException(nameof(coverLetter));

        return new JobApplication {
            JobId = jobId,
            CandidateId = candidateId,
            CvVersionId = cvVersionId,
            UploadedCvFileId = uploadedCvFileId,
            CoverLetter = coverLetter?.Trim() ?? string.Empty,
            Status = ApplicationStatus.Submitted,
            AppliedAt = now,
            UpdatedAt = now
        };
    }
}
