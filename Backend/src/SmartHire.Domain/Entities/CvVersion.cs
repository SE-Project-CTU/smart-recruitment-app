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
    
    public CvEmbedding? Embedding { get; private set; }
    public ICollection<JobApplication> Applications { get; private set; } = new List<JobApplication>();
    public ICollection<AiMatchResult> AiMatchResults { get; private set; } = new List<AiMatchResult>();
    
    private CvVersion() { }
    
    internal static CvVersion CreateSnapshot(
        Cv cv,
        int versionNumber,
        DateTimeOffset now
    ) {
        ArgumentNullException.ThrowIfNull(cv);
        
        if (cv.TemplateId == Guid.Empty) {
            throw new ArgumentException("CV must have a template before creating a version.", nameof(cv));
        }
        
        if (versionNumber < 1) {
            throw new ArgumentOutOfRangeException(nameof(versionNumber));
        }
        
        ArgumentNullException.ThrowIfNull(cv.Content);
        ArgumentNullException.ThrowIfNull(cv.Layout);
        ArgumentNullException.ThrowIfNull(cv.Presentation);
        
        return new CvVersion {
            Cv = cv,
            CvId = cv.Id,
            TemplateId = cv.TemplateId,
            Content = CopyContent(cv.Content),
            Layout = CopyLayout(cv.Layout),
            Presentation = CopyPresentation(cv.Presentation),
            Language = cv.Language,
            VersionNumber = versionNumber,
            CreatedAt = now
        };
    }
    
    private static CvContentDocument CopyContent(CvContentDocument source) => source with {
        Metadata = source.Metadata with { },
        Profile = source.Profile with { },
        Sections = source.Sections with {
            Order = [.. source.Sections.Order],
            Objective = source.Sections.Objective with { },
            Experience = source.Sections.Experience with {
                Items = source.Sections.Experience.Items.Select(item => item with { }).ToList()
            },
            Education = source.Sections.Education with {
                Items = source.Sections.Education.Items.Select(item => item with { }).ToList()
            },
            Skills = source.Sections.Skills with {
                Items = source.Sections.Skills.Items.Select(item => item with { }).ToList()
            },
            Projects = source.Sections.Projects with {
                Items = source.Sections.Projects.Items.Select(item => item with { }).ToList()
            },
            Certifications = source.Sections.Certifications with {
                Items = source.Sections.Certifications.Items.Select(item => item with { }).ToList()
            },
            Awards = source.Sections.Awards with {
                Items = source.Sections.Awards.Items.Select(item => item with { }).ToList()
            },
            Interests = source.Sections.Interests with { },
            AdditionalInfo = source.Sections.AdditionalInfo with { }
        }
    };
    
    private static CvLayoutDocument CopyLayout(CvLayoutDocument source) => source with {
        Areas = source.Areas.Select(area => area with {
            Sections = [.. area.Sections]
        }).ToList()
    };
    
    private static CvPresentationDocument CopyPresentation(CvPresentationDocument source) => source with {
        Metadata = source.Metadata with { },
        Styles = source.Styles with {
            Global = source.Styles.Global with {
                PrimaryColor = [.. source.Styles.Global.PrimaryColor]
            },
            Fields = source.Styles.Fields.ToDictionary(
                field => field.Key,
                field => field.Value with { })
        }
    };
}