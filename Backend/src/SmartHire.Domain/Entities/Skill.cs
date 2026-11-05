namespace SmartHire.Domain.Entities;

public class Skill {
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public ICollection<JobSkill> JobSkills { get; private set; } = new List<JobSkill>();

    private Skill() { }

    public static Skill Create(string name, DateTimeOffset now) {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Skill name is required.", nameof(name));

        return new Skill {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            IsActive = true,
            CreatedAt = now
        };
    }

    public void Update(string? name, bool? isActive) {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (isActive.HasValue)
            IsActive = isActive.Value;
    }

    public void ToggleActive(bool isActive) {
        IsActive = isActive;
    }
}