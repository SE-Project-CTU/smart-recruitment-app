namespace SmartHire.Domain.Entities;

public class AiConversation {
    public Guid Id { get; private set; }
    public Guid CandidateId { get; private set; }
    public User Candidate { get; private set; } = null!;
    public Guid? CvId { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public bool IsPinned { get; private set; }
    public DateTimeOffset LastMessageAt { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public ICollection<AiMessage> Messages { get; private set; } = new List<AiMessage>();

    private AiConversation() { }

    public static AiConversation Create(
        Guid candidateId,
        string title,
        Guid? cvId = null) {
        var now = DateTimeOffset.UtcNow;
        return new AiConversation {
            Id = Guid.NewGuid(),
            CandidateId = candidateId,
            Title = string.IsNullOrWhiteSpace(title) ? "Cuộc trò chuyện mới" : title.Trim(),
            CvId = cvId,
            IsPinned = false,
            LastMessageAt = now,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void UpdateTitle(string title) {
        if (!string.IsNullOrWhiteSpace(title)) {
            Title = title.Trim();
            UpdatedAt = DateTimeOffset.UtcNow;
        }
    }

    public void TogglePin() {
        IsPinned = !IsPinned;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void SetPin(bool isPinned) {
        IsPinned = isPinned;
        UpdatedAt = DateTimeOffset.UtcNow;
    }

    public void Touch() {
        var now = DateTimeOffset.UtcNow;
        LastMessageAt = now;
        UpdatedAt = now;
    }
}
