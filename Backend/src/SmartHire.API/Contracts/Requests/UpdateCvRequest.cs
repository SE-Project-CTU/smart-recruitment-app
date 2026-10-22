using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Api.Contracts.Validation;
using SmartHire.Domain.Validation;
using SmartHire.Domain.ValueObjects.Cv;

namespace SmartHire.Api.Contracts.Requests;

public sealed class UpdateCvRequest {
    private string? _title;
    private CvContentDocument? _content;
    private CvLayoutDocument? _layout;
    private CvPresentationDocument? _presentation;
    private string? _language;
    private bool? _isPublic;
    private Guid? _previewFileId;
    
    [StringLength(150, MinimumLength = 1,
        ErrorMessage = "Title must contain between 1 and 150 characters.")]
    public string? Title {
        get => _title;
        init {
            _title = value;
            TitleProvided = true;
        }
    }
    
    [JsonIgnore] public bool TitleProvided { get; private set; }
    
    public CvContentDocument? Content {
        get => _content;
        init {
            _content = value;
            ContentProvided = true;
        }
    }
    
    [JsonIgnore] public bool ContentProvided { get; private set; }
    
    public CvLayoutDocument? Layout {
        get => _layout;
        init {
            _layout = value;
            LayoutProvided = true;
        }
    }
    
    [JsonIgnore] public bool LayoutProvided { get; private set; }
    
    public CvPresentationDocument? Presentation {
        get => _presentation;
        init {
            _presentation = value;
            PresentationProvided = true;
        }
    }
    
    [JsonIgnore] public bool PresentationProvided { get; private set; }
    
    [RegularExpression(RequestValidationPatterns.CvLanguage,
        ErrorMessage = "Language must be either 'vi' or 'en'.")]
    public string? Language {
        get => _language;
        init {
            _language = value;
            LanguageProvided = true;
        }
    }
    
    [JsonIgnore] public bool LanguageProvided { get; private set; }
    
    [JsonInclude]
    public bool? IsPublic {
        get => _isPublic;
        init {
            _isPublic = value;
            IsPublicProvided = true;
        }
    }
    
    [JsonIgnore] public bool IsPublicProvided { get; private set; }

    public Guid? PreviewFileId {
        get => _previewFileId;
        init {
            _previewFileId = value;
            PreviewFileIdProvided = true;
        }
    }

    [JsonIgnore] public bool PreviewFileIdProvided { get; private set; }
    
    [JsonExtensionData] public Dictionary<string, JsonElement>? AdditionalFields { get; init; }
}
