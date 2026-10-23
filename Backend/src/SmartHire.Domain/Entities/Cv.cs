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
    public string? ContentHash { get; private set; }
    public string? PresentationHash { get; private set; }
    public string? LayoutHash { get; private set; }
    
    public CvLanguage Language { get; private set; }
    public bool IsPublic { get; private set; }
    public DateTimeOffset? DeletedAt { get; private set; }
    
    public DateTimeOffset CreatedAt { get; private set; }
    public DateTimeOffset UpdatedAt { get; private set; }
    
    public Guid? PreviewFileId { get; private set; }
    public MediaFile? PreviewFile { get; private set; }

    public ICollection<CvVersion> Versions { get; private set; } = new List<CvVersion>();
    
    private Cv() { }
    
    public static Cv Create(
        Guid candidateId,
        Guid templateId,
        string templateCode,
        string title,
        CvContentDocument content,
        CvLayoutDocument layout,
        CvPresentationDocument presentation,
        CvLanguage language,
        DateTimeOffset now) {
        ThrowIfInvalid(CvValidator.ValidateCandidateId(candidateId));
        ThrowIfInvalid(CvValidator.ValidateTemplateId(templateId));
        ThrowIfInvalid(CvValidator.ValidateTitle(title));
        ThrowIfInvalid(CvValidator.ValidateDocuments(content, layout, presentation));
        ThrowIfInvalid(CvValidator.ValidateLanguage(language));
        
        ArgumentNullException.ThrowIfNull(content.Metadata);
        ArgumentNullException.ThrowIfNull(presentation.Metadata);
        ArgumentException.ThrowIfNullOrWhiteSpace(templateCode);
        
        content = content with {
            Metadata = content.Metadata with {
                TemplateCode = templateCode,
                Language = language,
                UpdatedAt = now
            }
        };
        presentation = presentation with {
            Metadata = presentation.Metadata with {
                TemplateCode = templateCode,
                UpdatedAt = now
            }
        };
        
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
        return CreateVersion(1, now);
    }
    
    public CvVersion CreateVersion(int versionNumber, DateTimeOffset now) {
        if (Versions.Any(version => version.VersionNumber == versionNumber)) {
            throw new InvalidOperationException(
                $"CV version {versionNumber} has already been created.");
        }
        
        var version = CvVersion.CreateSnapshot(this, versionNumber, now);
        Versions.Add(version);
        return version;
    }
    
    public void Update(
        string title,
        bool isPublic,
        DateTimeOffset now
    ) {
        ThrowIfInvalid(CvValidator.ValidateCandidateId(CandidateId));
        ThrowIfInvalid(CvValidator.ValidateTitle(title));
        
        Title = CvValidator.NormalizeTitle(title);
        UpdatedAt = now;
        IsPublic = isPublic;
    }
    
    public void UpdateDocuments(
        CvContentDocument content,
        CvLayoutDocument layout,
        CvPresentationDocument presentation,
        CvLanguage language,
        int latestVersionNumber,
        DateTimeOffset now
    ) {
        ThrowIfInvalid(CvValidator.ValidateDocuments(content, layout, presentation));
        ThrowIfInvalid(CvValidator.ValidateLanguage(language));
        ArgumentNullException.ThrowIfNull(content.Metadata);
        ArgumentNullException.ThrowIfNull(presentation.Metadata);
        
        var formattedVersionNumber = latestVersionNumber.ToString("F1");
        
        Content = content with {
            Metadata = content.Metadata with {
                Version = formattedVersionNumber,
                Language = language,
                UpdatedAt = now
            }
        };
        Layout = layout;
        Presentation = presentation with {
            Metadata = presentation.Metadata with {
                Version = formattedVersionNumber,
                UpdatedAt = now
            }
        };
        
        Language = language;
        UpdatedAt = now;
    }

    public void SetDocumentHashes(
        string contentHash,
        string presentationHash,
        string layoutHash) {
        ArgumentException.ThrowIfNullOrWhiteSpace(contentHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(presentationHash);
        ArgumentException.ThrowIfNullOrWhiteSpace(layoutHash);

        ContentHash = contentHash;
        PresentationHash = presentationHash;
        LayoutHash = layoutHash;
    }
    
    public void Archive(DateTimeOffset now) {
        if (DeletedAt is not null) {
            return;
        }
        
        DeletedAt = now;
        UpdatedAt = now;
    }
    
    public void SetPreviewFile(Guid? previewFileId) {
        PreviewFileId = previewFileId;
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
