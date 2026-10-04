using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class CvVersion {
    public Guid Id { get; private set; }
    
    public Guid CvId { get; private set; }
    public Cv Cv { get; private set; } = null!;
    
    public Guid TemplateId { get; private set; }
    public CvTemplate Template { get; private set; } = null!;
    
    public CvContentDocument Content { get; private set; } = new();
    public CvLayoutDocument Layout { get; private set; } = new();
    public CvPresentationDocument Presentation { get; private set; } = new();
    
    public CvLanguage Language { get; private set; }
    public int VersionNumber { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    
    private CvVersion() { }
}