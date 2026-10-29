namespace SmartHire.Domain.Entities;

public class JobRecommendation {
    public Guid Id { get; private set; }
    public Guid CandidateId { get; private set; }
    public User Candidate { get; private set; } = null!;
    public Guid JobId { get; private set; }
    public JobPosting Job { get; private set; } = null!;
    public decimal Score { get; private set; }
    public DateTimeOffset GeneratedAt { get; private set; }

    private JobRecommendation() { }

    public static JobRecommendation Create(
        Guid candidateId,
        Guid jobId,
        decimal score,
        DateTimeOffset generatedAt) {
        return new JobRecommendation {
            Id = Guid.NewGuid(),
            CandidateId = candidateId,
            JobId = jobId,
            Score = score,
            GeneratedAt = generatedAt
        };
    }

    public void UpdateScore(decimal score, DateTimeOffset generatedAt) {
        Score = score;
        GeneratedAt = generatedAt;
    }
}
