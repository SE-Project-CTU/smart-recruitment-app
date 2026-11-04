namespace SmartHire.Domain.Entities;

public class AiMatchResult {
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }
    public JobApplication Application { get; private set; } = null!;
    public Guid CvVersionId { get; private set; }
    public CvVersion CvVersion { get; private set; } = null!;
    public decimal Score { get; private set; }
    public string Analysis { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    private AiMatchResult() { }

    public static AiMatchResult Create(
        Guid applicationId,
        Guid cvVersionId,
        decimal score,
        string analysis,
        DateTimeOffset createdAt) {
        return new AiMatchResult {
            Id = Guid.NewGuid(),
            ApplicationId = applicationId,
            CvVersionId = cvVersionId,
            Score = score,
            Analysis = analysis,
            CreatedAt = createdAt
        };
    }

    public void Update(decimal score, string analysis) {
        Score = score;
        Analysis = analysis;
    }
}
