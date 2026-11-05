using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CvTemplate {
    public Guid Id { get; private set; }
    
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public Guid ThumbnailFileId { get; private set; }
    public MediaFile ThumbnailFile { get; private set; } = null!;
    public string Version { get; private set; } = string.Empty;
    
    // JSONB
    public CvLayoutDocument DefaultLayout { get; private set; } = new();
    public CvContentDocument DefaultContent { get; private set; } = new();
    
    public CvLanguage Language { get; private set; }
    public bool IsActive { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<Cv> Cvs { get; private set; } = new List<Cv>();
    public ICollection<CvVersion> CvVersions { get; private set; } = new List<CvVersion>();
    
    private CvTemplate() { }
    public static CvTemplate Create(
        string code,
        string name,
        string? description,
        Guid thumbnailFileId,
        string version,
        CvLayoutDocument defaultLayout,
        CvContentDocument defaultContent,
        CvLanguage language,
        DateTimeOffset now
    ) {
        if (string.IsNullOrWhiteSpace(code))
            throw new ArgumentException("Template code is required.", nameof(code));
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));
        if (thumbnailFileId == Guid.Empty)
            throw new ArgumentException("ThumbnailFileId is required.", nameof(thumbnailFileId));

        return new CvTemplate {
            Id = Guid.NewGuid(),
            Code = code.Trim().ToLowerInvariant(),
            Name = name.Trim(),
            Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim(),
            ThumbnailFileId = thumbnailFileId,
            Version = string.IsNullOrWhiteSpace(version) ? "1" : version.Trim(),
            DefaultLayout = defaultLayout,
            DefaultContent = defaultContent,
            Language = language,
            IsActive = true,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public void Update(
        string? name,
        string? description,
        Guid? thumbnailFileId,
        string? version,
        CvLayoutDocument? defaultLayout,
        CvContentDocument? defaultContent,
        bool? isActive,
        DateTimeOffset now
    ) {
        if (!string.IsNullOrWhiteSpace(name)) Name = name.Trim();
        if (description is not null) Description = string.IsNullOrWhiteSpace(description) ? null : description.Trim();
        if (thumbnailFileId.HasValue && thumbnailFileId.Value != Guid.Empty) ThumbnailFileId = thumbnailFileId.Value;
        if (!string.IsNullOrWhiteSpace(version)) Version = version.Trim();
        if (defaultLayout is not null) DefaultLayout = defaultLayout;
        if (defaultContent is not null) DefaultContent = defaultContent;
        if (isActive.HasValue) IsActive = isActive.Value;
        UpdatedAt = now;
    }

    public void ToggleActive(bool isActive, DateTimeOffset now) {
        IsActive = isActive;
        UpdatedAt = now;
    }
}
