using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Enums;

namespace SmartHire.Domain.Entities;

public class Cv {
    public Guid Id { get; private set; }
    
    public Guid CandidateId { get; private set; }
    public User Candidate { get; private set; } = null!;
    
    public Guid TemplateId { get; private set; }
    public CvTemplate Template { get; private set; } = null!;
    
    public string Title { get; private set; } = string.Empty;
    public CvContentDocument Content { get; private set; } = new();
    public CvLayoutDocument Layout { get; private set; } = new();
    public CvPresentationDocument Presentation { get; private set; } = new();
    
    public CvLanguage Language { get; private set; }
    public bool IsPublic { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public ICollection<CvVersion> Versions { get; private set; } = new List<CvVersion>();
    
    private Cv() { }
}