namespace SmartHire.Domain.Entities;

public class Permission {
    public Guid Id { get; private set; }

    /// <summary>Mã kỹ thuật duy nhất, e.g. "USER_VIEW", "COMPANY_VERIFY"</summary>
    public string Code { get; private set; } = string.Empty;

    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }

    /// <summary>Nhóm module, e.g. "User", "Company", "JobPosting", "Catalog"</summary>
    public string Module { get; private set; } = string.Empty;

    public bool IsActive { get; private set; }

    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }

    public ICollection<RolePermission> RolePermissions { get; private set; } = new List<RolePermission>();

    private Permission() { }

    public static Permission Create(
        string code,
        string name,
        string? description,
        string module,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Permission code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Permission name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(module))
            throw new ArgumentException("Permission module is required.", nameof(module));

        return new Permission {
            Id = Guid.NewGuid(),
            Code = code.Trim().ToUpperInvariant(),
            Name = name.Trim(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            Module = module.Trim(),
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(string name, string? description, string module, bool? isActive, DateTimeOffset now) {
        if (!string.IsNullOrWhiteSpace(name))
            Name = name.Trim();
        if (description is not null)
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (!string.IsNullOrWhiteSpace(module))
            Module = module.Trim();
        if (isActive.HasValue)
            IsActive = isActive.Value;
        UpdatedAt = now;
    }

    public void SetActive(bool isActive, DateTimeOffset now) {
        IsActive = isActive;
        UpdatedAt = now;
    }
}