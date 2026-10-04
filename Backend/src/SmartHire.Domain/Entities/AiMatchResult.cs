namespace SmartHire.Domain.Entities;

public class AiMatchResult {
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }
    public Application Application { get; private set; } = null!;
    public Guid CvVersionId { get; private set; }
    public CvVersion CvVersion { get; private set; } = null!;
    public decimal Score { get; private set; }
    public string Analysis { get; private set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; private set; }

    private AiMatchResult() { }
}
