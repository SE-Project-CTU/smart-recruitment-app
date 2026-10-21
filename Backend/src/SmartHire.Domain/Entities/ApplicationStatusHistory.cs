using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class ApplicationStatusHistory {
    public Guid Id { get; private set; }
    public Guid ApplicationId { get; private set; }
    public JobApplication Application { get; private set; } = null!;
    public ApplicationStatus Status { get; private set; }
    public Guid ChangedBy { get; private set; }
    public User ChangedByUser { get; private set; } = null!;
    public string? Note { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    private ApplicationStatusHistory() { }

    public static ApplicationStatusHistory Create(
        JobApplication application,
        Guid changedBy,
        string? note,
        DateTimeOffset now) {
        ArgumentNullException.ThrowIfNull(application);
        if (changedBy == Guid.Empty) throw new ArgumentException("User ID is required.", nameof(changedBy));

        return new ApplicationStatusHistory {
            Application = application,
            Status = application.Status,
            ChangedBy = changedBy,
            Note = string.IsNullOrWhiteSpace(note) ? null : note.Trim(),
            CreatedAt = now
        };
    }
}
