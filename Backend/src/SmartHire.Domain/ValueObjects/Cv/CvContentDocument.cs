using SmartHire.Domain.Enums;

namespace SmartHire.Domain.ValueObjects.Cv;

public sealed record CvContentDocument {
    public CvDocumentMetadata Metadata { get; init; } = new();
    public CvProfile Profile { get; init; } = new();
    public CvSections Sections { get; init; } = new();
}

public sealed record CvDocumentMetadata {
    public string Version { get; init; } = "1.0";
    public string TemplateCode { get; init; } = string.Empty;
    public CvLanguage Language { get; init; } = CvLanguage.Vietnamese;
    public DateTimeOffset UpdatedAt { get; init; }
    public CvDefaultStyle DefaultStyle { get; init; } = new();
}

public sealed record CvProfile {
    public CvTiptapDocument FullName { get; init; } = new();
    public CvTiptapDocument Title { get; init; } = new();
    public string AvatarUrl { get; init; } = string.Empty;
    public CvTiptapDocument Email { get; init; } = new();
    public CvTiptapDocument Phone { get; init; } = new();
    public CvTiptapDocument Dob { get; init; } = new();
    public CvTiptapDocument Address { get; init; } = new();
    public CvTiptapDocument Website { get; init; } = new();
    public CvTiptapDocument SocialLink { get; init; } = new();
}

public sealed record CvSections {
    public HashSet<string> Order { get; init; } = [];
    public CvTextSection Objective { get; init; } = new();
    public CvItemSection<CvExperienceItem> Experience { get; init; } = new();
    public CvItemSection<CvEducationItem> Education { get; init; } = new();
    public CvItemSection<CvSkillItem> Skills { get; init; } = new();
    public CvItemSection<CvProjectItem> Projects { get; init; } = new();
    public CvItemSection<CvCertificationItem> Certifications { get; init; } = new();
    public CvItemSection<CvAwardItem> Awards { get; init; } = new();
    public CvTextSection Interests { get; init; } = new();
    public CvTextSection AdditionalInfo { get; init; } = new();
}

public sealed record CvTextSection {
    public CvTiptapDocument Title { get; init; } = new();
    public bool Visible { get; init; } = true;
    public CvTiptapDocument Content { get; init; } = new();
}

public sealed record CvItemSection<TItem> {
    public CvTiptapDocument Title { get; init; } = new();
    public bool Visible { get; init; } = true;
    public List<TItem> Items { get; init; } = [];
}

public sealed record CvExperienceItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument Company { get; init; } = new();
    public CvTiptapDocument Position { get; init; } = new();
    public CvTiptapDocument StartDate { get; init; } = new();
    public CvTiptapDocument EndDate { get; init; } = new();
    public CvTiptapDocument Description { get; init; } = new();
}

public sealed record CvEducationItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument School { get; init; } = new();
    public CvTiptapDocument Title { get; init; } = new();
    public CvTiptapDocument Start { get; init; } = new();
    public CvTiptapDocument End { get; init; } = new();
    public CvTiptapDocument Details { get; init; } = new();
}

public sealed record CvSkillItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument Name { get; init; } = new();
    public CvTiptapDocument Description { get; init; } = new();
}

public sealed record CvProjectItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument ProjectName { get; init; } = new();
    public CvTiptapDocument Role { get; init; } = new();
    public CvTiptapDocument Start { get; init; } = new();
    public CvTiptapDocument End { get; init; } = new();
    public CvTiptapDocument Description { get; init; } = new();
}

public sealed record CvCertificationItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument Name { get; init; } = new();
    public CvTiptapDocument IssueDate { get; init; } = new();
}

public sealed record CvAwardItem {
    public string Id { get; init; } = string.Empty;
    public CvTiptapDocument AwardName { get; init; } = new();
    public CvTiptapDocument Date { get; init; } = new();
}
