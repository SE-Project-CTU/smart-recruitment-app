namespace SmartHire.Domain.Entities;

public class IndustryGroup {
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<Industry> Industries { get; private set; } = new List<Industry>();

    private IndustryGroup() { }

    public static IndustryGroup Create(string name) {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Industry group name is required.", nameof(name));

        return new IndustryGroup {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            IsActive = true
        };
    }

    public void Update(string name, bool? isActive) {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (isActive.HasValue)
            IsActive = isActive.Value;
    }

    public void ToggleActive(bool isActive) {
        IsActive = isActive;
    }
}