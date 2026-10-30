using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.RegularExpressions;
using SmartHire.Application.Common.Errors;
using SmartHire.Domain.Validation;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Application.Features.Cv.Commands.UpdateCv;

public static partial class CvDocumentUpdateValidator {
    private static readonly HashSet<string> KnownSections = new(StringComparer.Ordinal) {
        "objective", "experience", "education", "skills", "projects",
        "certifications", "awards", "interests", "additionalInfo"
    };
    
    [GeneratedRegex(RequestValidationPatterns.VietnamesePhone)]
    private static partial Regex PhoneRegex();
    
    [GeneratedRegex(
        @"^(?:#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0|1|0?\.\d+|\d{1,3}%))?\s*\))$")]
    private static partial Regex ColorRegex();
    
    private static readonly EmailAddressAttribute EmailAttribute = new();
    
    public static IReadOnlyList<AppErrorDetail> Validate(
        CvContentDocument content,
        CvLayoutDocument layout) {
        var errors = new List<AppErrorDetail>();
        var itemIds = new HashSet<string>(StringComparer.Ordinal);
        
        // 1. Validate Metadata & DefaultStyle
        if (content.Metadata is null) {
            errors.Add(Required("content.metadata", "Content metadata is required."));
        }
        else {
            if (string.IsNullOrWhiteSpace(content.Metadata.Version) ||
                string.IsNullOrWhiteSpace(content.Metadata.TemplateCode) ||
                !Enum.IsDefined(content.Metadata.Language)) {
                errors.Add(Invalid("content.metadata",
                    "Metadata must contain a version, template code, and supported language."));
            }
            
            if (content.Metadata.DefaultStyle is null) {
                errors.Add(Required("content.metadata.defaultStyle", "Default style is required."));
            }
            else {
                var style = content.Metadata.DefaultStyle;
                if (string.IsNullOrWhiteSpace(style.FontFamily) ||
                    style.FontFamily.Length > 50 ||
                    style.FontScale <= 0 ||
                    style.LineHeight <= 0 ||
                    style.PrimaryColors is null ||
                    style.PrimaryColors.Count == 0 ||
                    style.PrimaryColors.Any(c => string.IsNullOrWhiteSpace(c) || !ColorRegex().IsMatch(c.Trim()))) {
                    errors.Add(Invalid("content.metadata.defaultStyle",
                        "Default style must include a font family, positive fontScale and lineHeight, and at least one primary color."));
                }
            }
        }
        
        // 2. Validate Profile
        if (content.Profile is null) {
            errors.Add(Required("content.profile", "Profile is required."));
        }
        else {
            ValidateTiptapField(content.Profile.FullName, "content.profile.fullName", errors, isRequired: true,
                minLength: 1, maxLength: 50);
            ValidateTiptapField(content.Profile.Title, "content.profile.title", errors, isRequired: true, minLength: 1,
                maxLength: 50);
            
            ValidateEmailField(content.Profile.Email, "content.profile.email", errors);
            ValidatePhoneField(content.Profile.Phone, "content.profile.phone", errors);
            
            ValidateTiptapField(content.Profile.Dob, "content.profile.dob", errors, isRequired: false, minLength: 0,
                maxLength: 50);
            ValidateTiptapField(content.Profile.Address, "content.profile.address", errors, isRequired: false,
                minLength: 0, maxLength: 200);
            ValidateTiptapField(content.Profile.Website, "content.profile.website", errors, isRequired: false,
                minLength: 0, maxLength: 200);
            ValidateTiptapField(content.Profile.SocialLink, "content.profile.socialLink", errors, isRequired: false,
                minLength: 0, maxLength: 200);
            
            if (content.Profile.AvatarUrl is not null && content.Profile.AvatarUrl.Length > 2048) {
                errors.Add(Invalid("content.profile.avatarUrl", "Avatar URL must not exceed 2048 characters."));
            }
        }
        
        // 3. Validate Sections
        if (content.Sections is null) {
            errors.Add(Required("content.sections", "Sections are required."));
        }
        else {
            var sections = content.Sections;
            if (sections.Order is null ||
                sections.Order.Count != KnownSections.Count ||
                sections.Order.Any(section => !KnownSections.Contains(section))) {
                errors.Add(Invalid("content.sections.order",
                    "Order must contain each supported CV section exactly once."));
            }
            
            ValidateTextSection(sections.Objective, "content.sections.objective", errors, isContentRequired: true);
            ValidateTextSection(sections.Interests, "content.sections.interests", errors, isContentRequired: false);
            ValidateTextSection(sections.AdditionalInfo, "content.sections.additionalInfo", errors,
                isContentRequired: false);
            
            ValidateExperienceSection(sections.Experience, "content.sections.experience", itemIds, errors);
            ValidateEducationSection(sections.Education, "content.sections.education", itemIds, errors);
            ValidateSkillsSection(sections.Skills, "content.sections.skills", itemIds, errors);
            ValidateProjectsSection(sections.Projects, "content.sections.projects", itemIds, errors);
            ValidateCertificationsSection(sections.Certifications, "content.sections.certifications", itemIds, errors);
            ValidateAwardsSection(sections.Awards, "content.sections.awards", itemIds, errors);
        }
        
        // 4. Validate Layout
        if (layout is null) {
            errors.Add(Required("layout", "Layout is required."));
        }
        else {
            if (string.IsNullOrWhiteSpace(layout.Version)) {
                errors.Add(Invalid("layout.version", "Layout version is required."));
            }
            
            if (layout.Areas is null || layout.Areas.Count == 0) {
                errors.Add(Invalid("layout.areas", "Layout must contain at least one area."));
            }
            else {
                var areaIds = new HashSet<string>(StringComparer.Ordinal);
                var placedSections = new HashSet<string>(StringComparer.Ordinal);
                foreach (var area in layout.Areas) {
                    if (area is null || string.IsNullOrWhiteSpace(area.Id) || !areaIds.Add(area.Id)) {
                        errors.Add(Invalid("layout.areas", "Area ids must be present and unique."));
                        continue;
                    }
                    
                    if (area.Sections is null) {
                        errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                            "Each area must contain a section list."));
                        continue;
                    }
                    
                    foreach (var section in area.Sections) {
                        if (!KnownSections.Contains(section)) {
                            errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                                $"'{section}' is not a supported CV section."));
                        }
                        else if (!placedSections.Add(section)) {
                            errors.Add(Invalid($"layout.areas.{area.Id}.sections",
                                $"Section '{section}' can be assigned to only one area."));
                        }
                    }
                }
            }
        }
        
        return errors;
    }
    
    private static void
        ValidateTiptapStructure(CvTiptapDocument? doc, string path, ICollection<AppErrorDetail> errors) {
        if (doc is null) {
            errors.Add(Required(path, $"{path} document is required."));
            return;
        }
        
        if (!string.Equals(doc.Type, CvTiptapNodeTypes.Doc, StringComparison.Ordinal)) {
            errors.Add(Invalid(path, $"{path} root node type must be '{CvTiptapNodeTypes.Doc}'."));
            return;
        }
        
        if (doc.Content is not null) {
            for (var i = 0; i < doc.Content.Count; i++) {
                ValidateNodeStructure(doc.Content[i], $"{path}.content[{i}]", errors);
            }
        }
    }
    
    private static void ValidateNodeStructure(CvTiptapNode node, string path, ICollection<AppErrorDetail> errors) {
        if (string.IsNullOrWhiteSpace(node.Type)) {
            errors.Add(Invalid(path, $"A node in {path} has an empty or missing type."));
            return;
        }
        
        if (!CvTiptapSchema.SupportedNodeTypes.Contains(node.Type)) {
            errors.Add(Invalid(path,
                $"Node type '{node.Type}' is not supported. Supported node types are: {string.Join(", ", CvTiptapSchema.SupportedNodeTypes)}."));
            return;
        }
        
        // Validate node attributes & constraints by type
        switch (node.Type) {
            case CvTiptapNodeTypes.Text:
                if (node.Content is not null && node.Content.Count > 0) {
                    errors.Add(Invalid(path, "Text nodes cannot have children content."));
                }
                
                if (node.Attrs is not null && node.Attrs.Count > 0) {
                    errors.Add(Invalid(path, "Text nodes cannot have attributes; styling must be applied via marks."));
                }
                
                break;
            
            case CvTiptapNodeTypes.Paragraph:
                ValidateParagraphAttrs(node.Attrs, path, errors);
                break;
            
            case CvTiptapNodeTypes.BulletList or CvTiptapNodeTypes.OrderedList:
                ValidateListAttrs(node.Attrs, path, errors);
                if (node.Content is not null) {
                    for (var i = 0; i < node.Content.Count; i++) {
                        var child = node.Content[i];
                        if (child.Type != CvTiptapNodeTypes.ListItem) {
                            errors.Add(Invalid($"{path}.content[{i}]",
                                $"List node can only contain '{CvTiptapNodeTypes.ListItem}' children. Found '{child.Type}'."));
                        }
                    }
                }
                
                break;
            
            case CvTiptapNodeTypes.ListItem:
                if (node.Attrs is not null && node.Attrs.Count > 0) {
                    errors.Add(Invalid(path, "ListItem nodes do not accept attributes."));
                }
                
                break;
            
            case CvTiptapNodeTypes.HardBreak:
                if (node.Content is not null && node.Content.Count > 0) {
                    errors.Add(Invalid(path, "HardBreak nodes cannot have content."));
                }
                
                if (node.Attrs is not null && node.Attrs.Count > 0) {
                    errors.Add(Invalid(path, "HardBreak nodes do not accept attributes."));
                }
                
                break;
        }
        
        // Validate marks
        if (node.Marks is not null) {
            for (var i = 0; i < node.Marks.Count; i++) {
                ValidateMarkStructure(node.Marks[i], $"{path}.marks[{i}]", errors);
            }
        }
        
        // Recursively validate child content
        if (node.Content is not null) {
            for (var i = 0; i < node.Content.Count; i++) {
                ValidateNodeStructure(node.Content[i], $"{path}.content[{i}]", errors);
            }
        }
    }
    
    private static void ValidateParagraphAttrs(Dictionary<string, object?>? attrs, string path,
        ICollection<AppErrorDetail> errors) {
        if (attrs is null || attrs.Count == 0) return;
        
        foreach (var (key, value) in attrs) {
            if (!CvTiptapSchema.SupportedParagraphAttributeNames.Contains(key)) {
                errors.Add(Invalid(path,
                    $"Attribute '{key}' is not supported for paragraph. Only '{CvTiptapAttributeNames.TextAlign}' is allowed."));
                continue;
            }
            
            if (key == CvTiptapAttributeNames.TextAlign && value is not null) {
                var alignStr = value.ToString();
                if (string.IsNullOrWhiteSpace(alignStr) || !CvTiptapSchema.SupportedTextAlignments.Contains(alignStr)) {
                    errors.Add(Invalid(path,
                        $"Value of '{CvTiptapAttributeNames.TextAlign}' must be one of: {string.Join(", ", CvTiptapSchema.SupportedTextAlignments)}."));
                }
            }
        }
    }
    
    private static void ValidateListAttrs(Dictionary<string, object?>? attrs, string path,
        ICollection<AppErrorDetail> errors) {
        if (attrs is null || attrs.Count == 0) return;
        
        foreach (var (key, value) in attrs) {
            if (!CvTiptapSchema.SupportedListAttributeNames.Contains(key)) {
                errors.Add(Invalid(path,
                    $"Attribute '{key}' is not supported for list. Only '{CvTiptapAttributeNames.ListStyleType}' is allowed."));
                continue;
            }
            
            if (key == CvTiptapAttributeNames.ListStyleType && value is not null) {
                var styleStr = value.ToString();
                if (string.IsNullOrWhiteSpace(styleStr) || !CvTiptapSchema.SupportedListStyleTypes.Contains(styleStr)) {
                    errors.Add(Invalid(path,
                        $"Value of '{CvTiptapAttributeNames.ListStyleType}' must be one of: {string.Join(", ", CvTiptapSchema.SupportedListStyleTypes)}."));
                }
            }
        }
    }
    
    private static void ValidateMarkStructure(CvTiptapMark mark, string path, ICollection<AppErrorDetail> errors) {
        if (string.IsNullOrWhiteSpace(mark.Type)) {
            errors.Add(Invalid(path, $"A mark in {path} has an empty or missing type."));
            return;
        }
        
        if (!CvTiptapSchema.SupportedMarkTypes.Contains(mark.Type)) {
            errors.Add(Invalid(path,
                $"Mark type '{mark.Type}' is not supported. Supported marks are: {string.Join(", ", CvTiptapSchema.SupportedMarkTypes)}."));
            return;
        }
        
        switch (mark.Type) {
            case CvTiptapMarkTypes.Bold or CvTiptapMarkTypes.Italic or CvTiptapMarkTypes.Underline:
                if (mark.Attrs is not null && mark.Attrs.Count > 0) {
                    errors.Add(Invalid(path, $"Mark '{mark.Type}' does not accept attributes."));
                }
                
                break;
            
            case CvTiptapMarkTypes.Link:
                ValidateLinkAttrs(mark.Attrs, path, errors);
                break;
            
            case CvTiptapMarkTypes.TextStyle:
                ValidateTextStyleAttrs(mark.Attrs, path, errors);
                break;
        }
    }
    
    private static void ValidateLinkAttrs(Dictionary<string, object?>? attrs, string path,
        ICollection<AppErrorDetail> errors) {
        if (attrs is null || attrs.Count == 0) {
            errors.Add(Required(path, $"Link mark requires attributes containing '{CvTiptapAttributeNames.Href}'."));
            return;
        }
        
        foreach (var (key, _) in attrs) {
            if (!CvTiptapSchema.SupportedLinkAttributeNames.Contains(key)) {
                errors.Add(Invalid(path,
                    $"Attribute '{key}' is not supported for link mark. Only '{CvTiptapAttributeNames.Href}' and '{CvTiptapAttributeNames.Target}' are allowed."));
            }
        }
        
        if (!attrs.TryGetValue(CvTiptapAttributeNames.Href, out var hrefVal) || hrefVal is null ||
            string.IsNullOrWhiteSpace(hrefVal.ToString())) {
            errors.Add(Required(path,
                $"Link mark must contain a non-empty '{CvTiptapAttributeNames.Href}' attribute."));
        }
        else {
            var hrefStr = hrefVal.ToString()!.Trim();
            if (hrefStr.Length > 2048) {
                errors.Add(Invalid(path, $"Link '{CvTiptapAttributeNames.Href}' must not exceed 2048 characters."));
            }
            else if (!hrefStr.StartsWith("http://", StringComparison.OrdinalIgnoreCase) &&
                     !hrefStr.StartsWith("https://", StringComparison.OrdinalIgnoreCase) &&
                     !hrefStr.StartsWith("mailto:", StringComparison.OrdinalIgnoreCase) &&
                     !hrefStr.StartsWith("tel:", StringComparison.OrdinalIgnoreCase)) {
                errors.Add(Invalid(path,
                    $"Link '{CvTiptapAttributeNames.Href}' must start with http://, https://, mailto:, or tel:."));
            }
        }
    }
    
    private static void ValidateTextStyleAttrs(Dictionary<string, object?>? attrs, string path,
        ICollection<AppErrorDetail> errors) {
        if (attrs is null || attrs.Count == 0) {
            errors.Add(Required(path,
                $"textStyle mark must contain at least one attribute ('{CvTiptapAttributeNames.FontSize}', '{CvTiptapAttributeNames.FontFamily}', '{CvTiptapAttributeNames.Color}')."));
            return;
        }
        
        foreach (var (key, value) in attrs) {
            if (!CvTiptapSchema.SupportedTextStyleAttributeNames.Contains(key)) {
                errors.Add(Invalid(path,
                    $"Attribute '{key}' is not supported in textStyle mark. Only '{CvTiptapAttributeNames.FontSize}', '{CvTiptapAttributeNames.FontFamily}', '{CvTiptapAttributeNames.Color}' are allowed."));
                continue;
            }
            
            switch (key) {
                case CvTiptapAttributeNames.Color:
                    if (value is null || string.IsNullOrWhiteSpace(value.ToString())) {
                        errors.Add(Invalid(path, "Color attribute cannot be empty."));
                    }
                    else {
                        var colorStr = value.ToString()!.Trim();
                        if (!ColorRegex().IsMatch(colorStr)) {
                            errors.Add(Invalid(path,
                                $"Color '{colorStr}' is not a valid HEX (e.g. #334155) or RGB/RGBA format."));
                        }
                    }
                    
                    break;
                
                case CvTiptapAttributeNames.FontSize:
                    if (value is null) {
                        errors.Add(Invalid(path, "fontSize attribute cannot be empty."));
                    }
                    else {
                        double fontSizeNum = 0;
                        bool parsed = false;
                        if (value is JsonElement je && je.ValueKind == JsonValueKind.Number) {
                            parsed = je.TryGetDouble(out fontSizeNum);
                        }
                        else if (value is int i) {
                            fontSizeNum = i;
                            parsed = true;
                        }
                        else if (value is double d) {
                            fontSizeNum = d;
                            parsed = true;
                        }
                        else if (double.TryParse(value.ToString()?.Replace("px", "").Replace("pt", "").Trim(),
                                     out var parsedD)) {
                            fontSizeNum = parsedD;
                            parsed = true;
                        }
                        
                        if (!parsed || fontSizeNum < 6 || fontSizeNum > 96) {
                            errors.Add(Invalid(path, "fontSize attribute must be a positive number between 6 and 96."));
                        }
                    }
                    
                    break;
                
                case CvTiptapAttributeNames.FontFamily:
                    if (value is null || string.IsNullOrWhiteSpace(value.ToString())) {
                        errors.Add(Invalid(path, "fontFamily attribute cannot be empty."));
                    }
                    else {
                        var fontStr = value.ToString()!.Trim();
                        if (fontStr.Length > 50) {
                            errors.Add(Invalid(path, "fontFamily attribute must not exceed 50 characters."));
                        }
                    }
                    
                    break;
            }
        }
    }
    
    private static void ValidateTiptapField(
        CvTiptapDocument? doc,
        string path,
        ICollection<AppErrorDetail> errors,
        bool isRequired,
        int minLength,
        int maxLength) {
        ValidateTiptapStructure(doc, path, errors);
        if (doc is null) return;
        
        var plainText = CvTiptapDocument.ExtractPlainText(doc);
        if (isRequired && string.IsNullOrWhiteSpace(plainText)) {
            errors.Add(Required(path, $"{path} must not be empty."));
            return;
        }
        
        if (!string.IsNullOrEmpty(plainText)) {
            if (plainText.Length < minLength) {
                errors.Add(Invalid(path, $"{path} must contain at least {minLength} characters."));
            }
            else if (plainText.Length > maxLength) {
                errors.Add(new AppErrorDetail(path, ValidationReasons.MaxLength,
                    $"{path} must not exceed {maxLength} characters."));
            }
        }
    }
    
    private static void ValidateEmailField(CvTiptapDocument? doc, string path, ICollection<AppErrorDetail> errors) {
        ValidateTiptapStructure(doc, path, errors);
        if (doc is null) return;
        
        var plainText = CvTiptapDocument.ExtractPlainText(doc);
        if (string.IsNullOrWhiteSpace(plainText)) {
            errors.Add(Required(path, $"{path} is required."));
            return;
        }
        
        if (plainText.Length > 50) {
            errors.Add(new AppErrorDetail(path, ValidationReasons.MaxLength,
                $"{path} must not exceed 50 characters."));
            return;
        }
        
        if (!EmailAttribute.IsValid(plainText)) {
            errors.Add(Invalid(path, "Email format is invalid."));
        }
    }
    
    private static void ValidatePhoneField(CvTiptapDocument? doc, string path, ICollection<AppErrorDetail> errors) {
        ValidateTiptapStructure(doc, path, errors);
        if (doc is null) return;
        
        var plainText = CvTiptapDocument.ExtractPlainText(doc);
        if (string.IsNullOrWhiteSpace(plainText)) {
            errors.Add(Required(path, $"{path} is required."));
            return;
        }
        
        if (plainText.Length > 12) {
            errors.Add(new AppErrorDetail(path, ValidationReasons.MaxLength,
                $"{path} must not exceed 12 characters."));
            return;
        }
        
        if (!PhoneRegex().IsMatch(plainText)) {
            errors.Add(Invalid(path, "Phone must be a valid Vietnamese mobile number (0xxxxxxxxx or +84xxxxxxxxx)."));
        }
    }
    
    private static void ValidateTextSection(
        CvTextSection? section,
        string path,
        ICollection<AppErrorDetail> errors,
        bool isContentRequired) {
        if (section is null) {
            errors.Add(Required(path, $"{path} section is required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        ValidateTiptapField(section.Content, $"{path}.content", errors, isRequired: isContentRequired,
            minLength: isContentRequired ? 1 : 0, maxLength: 5000);
    }
    
    private static void ValidateExperienceSection(
        CvItemSection<CvExperienceItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.Company, $"{itemPath}.company", errors, isRequired: true, minLength: 1,
                maxLength: 50);
            ValidateTiptapField(item.Position, $"{itemPath}.position", errors, isRequired: true, minLength: 1,
                maxLength: 50);
            ValidateTiptapField(item.StartDate, $"{itemPath}.startDate", errors, isRequired: false, minLength: 0,
                maxLength: 50);
            ValidateTiptapField(item.EndDate, $"{itemPath}.endDate", errors, isRequired: false, minLength: 0,
                maxLength: 50);
            ValidateTiptapField(item.Description, $"{itemPath}.description", errors, isRequired: false, minLength: 0,
                maxLength: 5000);
        }
    }
    
    private static void ValidateEducationSection(
        CvItemSection<CvEducationItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.School, $"{itemPath}.school", errors, isRequired: true, minLength: 1,
                maxLength: 100);
            ValidateTiptapField(item.Title, $"{itemPath}.title", errors, isRequired: true, minLength: 1,
                maxLength: 100);
            ValidateTiptapField(item.Start, $"{itemPath}.start", errors, isRequired: false, minLength: 0,
                maxLength: 50);
            ValidateTiptapField(item.End, $"{itemPath}.end", errors, isRequired: false, minLength: 0, maxLength: 50);
            ValidateTiptapField(item.Details, $"{itemPath}.details", errors, isRequired: false, minLength: 0,
                maxLength: 5000);
        }
    }
    
    private static void ValidateSkillsSection(
        CvItemSection<CvSkillItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.Name, $"{itemPath}.name", errors, isRequired: true, minLength: 1, maxLength: 100);
            ValidateTiptapField(item.Description, $"{itemPath}.description", errors, isRequired: false, minLength: 0,
                maxLength: 2000);
        }
    }
    
    private static void ValidateProjectsSection(
        CvItemSection<CvProjectItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.ProjectName, $"{itemPath}.projectName", errors, isRequired: true, minLength: 1,
                maxLength: 100);
            ValidateTiptapField(item.Role, $"{itemPath}.role", errors, isRequired: true, minLength: 1, maxLength: 50);
            ValidateTiptapField(item.Start, $"{itemPath}.start", errors, isRequired: false, minLength: 0,
                maxLength: 50);
            ValidateTiptapField(item.End, $"{itemPath}.end", errors, isRequired: false, minLength: 0, maxLength: 50);
            ValidateTiptapField(item.Description, $"{itemPath}.description", errors, isRequired: false, minLength: 0,
                maxLength: 5000);
        }
    }
    
    private static void ValidateCertificationsSection(
        CvItemSection<CvCertificationItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.Name, $"{itemPath}.name", errors, isRequired: true, minLength: 1, maxLength: 100);
            ValidateTiptapField(item.IssueDate, $"{itemPath}.issueDate", errors, isRequired: false, minLength: 0,
                maxLength: 50);
        }
    }
    
    private static void ValidateAwardsSection(
        CvItemSection<CvAwardItem>? section,
        string path,
        ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (section is null || section.Items is null) {
            errors.Add(Required(path, $"{path} section and items are required."));
            return;
        }
        
        ValidateTiptapField(section.Title, $"{path}.title", errors, isRequired: true, minLength: 1, maxLength: 100);
        
        for (var i = 0; i < section.Items.Count; i++) {
            var item = section.Items[i];
            var itemPath = $"{path}.items[{i}]";
            ValidateItemId(item.Id, itemPath, itemIds, errors);
            ValidateTiptapField(item.AwardName, $"{itemPath}.awardName", errors, isRequired: true, minLength: 1,
                maxLength: 100);
            ValidateTiptapField(item.Date, $"{itemPath}.date", errors, isRequired: false, minLength: 0, maxLength: 50);
        }
    }
    
    private static void ValidateItemId(string? id, string itemPath, ISet<string> itemIds,
        ICollection<AppErrorDetail> errors) {
        if (string.IsNullOrWhiteSpace(id) || !itemIds.Add(id)) {
            errors.Add(Invalid(itemPath, "Every CV item must have a unique, non-empty id."));
        }
    }
    
    private static AppErrorDetail Invalid(string field, string message) =>
        new(field, ValidationReasons.InvalidFormat, message);
    
    private static AppErrorDetail Required(string field, string message) =>
        new(field, ValidationReasons.Required, message);
}