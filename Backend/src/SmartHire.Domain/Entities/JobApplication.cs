using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class JobApplication {
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

    private JobApplication() { }
}
