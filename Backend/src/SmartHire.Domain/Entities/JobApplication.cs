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
