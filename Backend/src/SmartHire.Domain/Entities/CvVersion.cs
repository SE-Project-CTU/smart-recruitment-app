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
    
    public CvLanguage Language { get; private set; }
    public int VersionNumber { get; private set; }
    
    public Guid? PreviewFileId { get; private set; }
    public MediaFile? PreviewFile { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    
    public CvEmbedding? Embedding { get; private set; }
    public ICollection<JobApplication> Applications { get; private set; } = new List<JobApplication>();
    public ICollection<AiMatchResult> AiMatchResults { get; private set; } = new List<AiMatchResult>();
    
    private CvVersion() { }
    
    internal static CvVersion CreateSnapshot(
        Cv cv,
        int versionNumber,
        Guid? previewFileId,
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
        
        return new CvVersion {
            Cv = cv,
            CvId = cv.Id,
            TemplateId = cv.TemplateId,
            Content = CopyContent(cv.Content),
            Layout = CopyLayout(cv.Layout),
            Language = cv.Language,
            VersionNumber = versionNumber,
            PreviewFileId = previewFileId,
            CreatedAt = now
        };
    }
    
    private static CvContentDocument CopyContent(CvContentDocument source) => source with {
        Metadata = source.Metadata with {
            DefaultStyle = CvDefaultStyle.DeepClone(source.Metadata.DefaultStyle)
        },
        Profile = source.Profile with {
            FullName = CvTiptapDocument.DeepClone(source.Profile.FullName),
            Title = CvTiptapDocument.DeepClone(source.Profile.Title),
            AvatarUrl = source.Profile.AvatarUrl,
            Email = CvTiptapDocument.DeepClone(source.Profile.Email),
            Phone = CvTiptapDocument.DeepClone(source.Profile.Phone),
            Dob = CvTiptapDocument.DeepClone(source.Profile.Dob),
            Address = CvTiptapDocument.DeepClone(source.Profile.Address),
            Website = CvTiptapDocument.DeepClone(source.Profile.Website),
            SocialLink = CvTiptapDocument.DeepClone(source.Profile.SocialLink)
        },
        Sections = source.Sections with {
            Order = [.. source.Sections.Order],
            Objective = source.Sections.Objective with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Objective.Title),
                Content = CvTiptapDocument.DeepClone(source.Sections.Objective.Content)
            },
            Experience = source.Sections.Experience with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Experience.Title),
                Items = source.Sections.Experience.Items.Select(item => item with {
                    Company = CvTiptapDocument.DeepClone(item.Company),
                    Position = CvTiptapDocument.DeepClone(item.Position),
                    StartDate = CvTiptapDocument.DeepClone(item.StartDate),
                    EndDate = CvTiptapDocument.DeepClone(item.EndDate),
                    Description = CvTiptapDocument.DeepClone(item.Description)
                }).ToList()
            },
            Education = source.Sections.Education with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Education.Title),
                Items = source.Sections.Education.Items.Select(item => item with {
                    School = CvTiptapDocument.DeepClone(item.School),
                    Title = CvTiptapDocument.DeepClone(item.Title),
                    Start = CvTiptapDocument.DeepClone(item.Start),
                    End = CvTiptapDocument.DeepClone(item.End),
                    Details = CvTiptapDocument.DeepClone(item.Details)
                }).ToList()
            },
            Skills = source.Sections.Skills with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Skills.Title),
                Items = source.Sections.Skills.Items.Select(item => item with {
                    Name = CvTiptapDocument.DeepClone(item.Name),
                    Description = CvTiptapDocument.DeepClone(item.Description)
                }).ToList()
            },
            Projects = source.Sections.Projects with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Projects.Title),
                Items = source.Sections.Projects.Items.Select(item => item with {
                    ProjectName = CvTiptapDocument.DeepClone(item.ProjectName),
                    Role = CvTiptapDocument.DeepClone(item.Role),
                    Start = CvTiptapDocument.DeepClone(item.Start),
                    End = CvTiptapDocument.DeepClone(item.End),
                    Description = CvTiptapDocument.DeepClone(item.Description)
                }).ToList()
            },
            Certifications = source.Sections.Certifications with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Certifications.Title),
                Items = source.Sections.Certifications.Items.Select(item => item with {
                    Name = CvTiptapDocument.DeepClone(item.Name),
                    IssueDate = CvTiptapDocument.DeepClone(item.IssueDate)
                }).ToList()
            },
            Awards = source.Sections.Awards with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Awards.Title),
                Items = source.Sections.Awards.Items.Select(item => item with {
                    AwardName = CvTiptapDocument.DeepClone(item.AwardName),
                    Date = CvTiptapDocument.DeepClone(item.Date)
                }).ToList()
            },
            Interests = source.Sections.Interests with {
                Title = CvTiptapDocument.DeepClone(source.Sections.Interests.Title),
                Content = CvTiptapDocument.DeepClone(source.Sections.Interests.Content)
            },
            AdditionalInfo = source.Sections.AdditionalInfo with {
                Title = CvTiptapDocument.DeepClone(source.Sections.AdditionalInfo.Title),
                Content = CvTiptapDocument.DeepClone(source.Sections.AdditionalInfo.Content)
            }
        }
    };
    
    private static CvLayoutDocument CopyLayout(CvLayoutDocument source) => source with {
        Areas = source.Areas.Select(area => area with {
            Sections = [.. area.Sections]
        }).ToList()
    };
}
