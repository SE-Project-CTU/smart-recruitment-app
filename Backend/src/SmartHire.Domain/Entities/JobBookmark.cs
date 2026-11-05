namespace SmartHire.Domain.Entities;

public class JobBookmark {
    public Guid UserId { get; private set; }
    public User User { get; private set; } = null!;

    public Guid JobPostingId { get; private set; }
    public JobPosting JobPosting { get; private set; } = null!;

    public DateTimeOffset CreatedAt { get; private set; }

    private JobBookmark() { }

    public static JobBookmark Create(
        Guid userId,
        Guid jobPostingId,
        DateTimeOffset now
    ) {
        if (userId == Guid.Empty) {
            throw new ArgumentException("User ID is required.", nameof(userId));
        }
        if (jobPostingId == Guid.Empty) {
            throw new ArgumentException("Job posting ID is required.", nameof(jobPostingId));
        }

        return new JobBookmark {
            UserId = userId,
            JobPostingId = jobPostingId,
            CreatedAt = now
        };
    }
}

