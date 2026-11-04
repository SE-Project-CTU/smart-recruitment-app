using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Ward {
    public Guid Id { get; private set; }

    public Guid ProvinceId { get; private set; }
    public Province Province { get; private set; } = null!;

    public string Name { get; private set; } = string.Empty;
    public LocationStatus Status { get; private set; }
    public bool IsCommune { get; private set; }

    public ICollection<JobPosting> JobPostings { get; private set; } = new List<JobPosting>();

    private Ward() { }

    public static Ward Create(Guid provinceId, string name, bool isCommune = false) {
        if (provinceId == Guid.Empty)
            throw new ArgumentException("ProvinceId is required.", nameof(provinceId));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Ward name is required.", nameof(name));

        return new Ward {
            Id = Guid.NewGuid(),
            ProvinceId = provinceId,
            Name = name.Trim(),
            Status = LocationStatus.Active,
            IsCommune = isCommune
        };
    }

    public void Update(Guid? provinceId, string? name, bool? isCommune) {
        if (provinceId.HasValue && provinceId.Value != Guid.Empty)
            ProvinceId = provinceId.Value;
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (isCommune.HasValue)
            IsCommune = isCommune.Value;
    }

    public void ToggleStatus(LocationStatus status) {
        Status = status;
    }
}