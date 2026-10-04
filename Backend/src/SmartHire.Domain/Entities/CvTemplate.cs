using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CvTemplate {
    public Guid Id { get; private set; }
    
    public string Code { get; private set; } = string.Empty;
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string ThumbnailUrl { get; private set; } = string.Empty;
    public string Version { get; private set; } = string.Empty;
    
    // JSONB
    public CvLayoutDocument DefaultLayout { get; private set; } = new();
    public CvContentDocument DefaultContent { get; private set; } = new();
    public CvPresentationDocument DefaultPresentation { get; private set; } = new();
    
    public CvLanguage Language { get; private set; }
    public bool IsActive { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<Cv> Cvs { get; private set; } = new List<Cv>();
    public ICollection<CvVersion> CvVersions { get; private set; } = new List<CvVersion>();
    
    private CvTemplate() { }
}