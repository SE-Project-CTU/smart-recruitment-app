using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Province {
    public Guid Id { get; private set; }

    public string Name { get; private set; } = string.Empty;
    public LocationStatus Status { get; private set; }
    public bool IsCentrallyGoverned { get; private set; }

    public ICollection<Ward> Wards { get; private set; } = new List<Ward>();
    public ICollection<JobPosting> JobPostings { get; private set; } = new List<JobPosting>();

    private Province() { }

    public static Province Create(string name, bool isCentrallyGoverned = false) {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Province name is required.", nameof(name));

        return new Province {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Status = LocationStatus.Active,
            IsCentrallyGoverned = isCentrallyGoverned
        };
    }

    public void Update(string? name, bool? isCentrallyGoverned) {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (isCentrallyGoverned.HasValue)
            IsCentrallyGoverned = isCentrallyGoverned.Value;
    }

    public void ToggleStatus(LocationStatus status) {
        Status = status;
    }
}