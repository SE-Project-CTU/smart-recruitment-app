using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Industry {
    public Guid Id { get; private set; }

    public Guid GroupId { get; private set; }
    public IndustryGroup Group { get; private set; } = null!;

    public string Name { get; private set; } = string.Empty;
    public bool IsActive { get; private set; }

    public ICollection<JobIndustry> JobIndustries { get; private set; } = new List<JobIndustry>();

    private Industry() { }

    public static Industry Create(Guid groupId, string name) {
        if (groupId == Guid.Empty)
            throw new ArgumentException("GroupId is required.", nameof(groupId));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Industry name is required.", nameof(name));

        return new Industry {
            Id = Guid.NewGuid(),
            GroupId = groupId,
            Name = name.Trim(),
            IsActive = true
        };
    }

    public void Update(Guid? groupId, string? name, bool? isActive) {
        if (groupId.HasValue && groupId.Value != Guid.Empty)
            GroupId = groupId.Value;
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (isActive.HasValue)
            IsActive = isActive.Value;
    }

    public void ToggleActive(bool isActive) {
        IsActive = isActive;
    }
}