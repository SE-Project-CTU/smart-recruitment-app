using SmartHire.Domain.ValueObjects.Cv;
using SmartHire.Domain.Enums;
using SmartHire.Domain.Validation;

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

    public static Cv Create(
        Guid candidateId,
        Guid templateId,
        string title,
        CvContentDocument content,
        CvLayoutDocument layout,
        CvPresentationDocument presentation,
        CvLanguage language,
        DateTimeOffset now) {
        ThrowIfInvalid(CvValidator.ValidateIdentity(candidateId, templateId));
        ThrowIfInvalid(CvValidator.ValidateTitle(title));
        ThrowIfInvalid(CvValidator.ValidateDocuments(content, layout, presentation));
        ThrowIfInvalid(CvValidator.ValidateLanguage(language));

        return new Cv {
            CandidateId = candidateId,
            TemplateId = templateId,
            Title = CvValidator.NormalizeTitle(title),
            Content = content,
            Layout = layout,
            Presentation = presentation,
            Language = language,
            IsPublic = false,
            CreatedAt = now,
            UpdatedAt = now
        };
    }

    public CvVersion CreateInitialVersion(DateTimeOffset now) {
        if (Versions.Any(version => version.VersionNumber == 1)) {
            throw new InvalidOperationException("The initial CV version has already been created.");
        }

        var version = CvVersion.CreateSnapshot(this, 1, now);
        Versions.Add(version);
        return version;
    }

    public void Update(
        string title,
        CvContentDocument content,
        CvLayoutDocument layout,
        CvPresentationDocument presentation,
        CvLanguage language,
        DateTimeOffset now) {
        ThrowIfInvalid(CvValidator.ValidateTitle(title));
        ThrowIfInvalid(CvValidator.ValidateDocuments(content, layout, presentation));
        ThrowIfInvalid(CvValidator.ValidateLanguage(language));

        Title = CvValidator.NormalizeTitle(title);
        Content = content;
        Layout = layout;
        Presentation = presentation;
        Language = language;
        UpdatedAt = now;
    }

    public void SetVisibility(bool isPublic, DateTimeOffset now) {
        if (IsPublic == isPublic) {
            return;
        }

        IsPublic = isPublic;
        UpdatedAt = now;
    }

    private static void ThrowIfInvalid(CvValidationIssue? issue) {
        if (issue is not null) {
            throw new ArgumentException(issue.Message, issue.Field);
        }
    }

    private static void ThrowIfInvalid(IReadOnlyList<CvValidationIssue> issues) {
        if (issues.Count > 0) {
            throw new ArgumentException(
                string.Join(" ", issues.Select(issue => issue.Message)),
                issues[0].Field);
        }
    }
}
