using System.Text.Json;
using System.Text.Json.Serialization;
using SmartHire.Domain.Validation;

namespace SmartHire.Api.Contracts.Requests;

public sealed class UpdateCurrentAccountRequest {
    private string? _fullName;
    private string? _phone;
    private Guid? _avatarFileId;
    
    [StringLength(100, MinimumLength = 2,
        ErrorMessage = "Full name must contain between 2 and 100 characters.")]
    public string? FullName {
        get => _fullName;
        init {
            _fullName = value;
            FullNameProvided = true;
        }
    }
    
    [JsonIgnore] public bool FullNameProvided { get; private set; }
    
    [RegularExpression(RequestValidationPatterns.VietnamesePhone,
        ErrorMessage = "Phone must be a valid Vietnamese mobile number (0xxxxxxxxx or +84xxxxxxxxx).")]
    public string? Phone {
        get => _phone;
        init {
            _phone = value;
            PhoneProvided = true;
        }
    }
    
    [JsonIgnore] public bool PhoneProvided { get; private set; }
    
    [SmartHire.Api.Contracts.Validation.NotEmptyGuid(
        ErrorMessage = "Avatar file id must be a valid non-empty UUID or null.")]
    public Guid? AvatarFileId {
        get => _avatarFileId;
        init {
            _avatarFileId = value;
            AvatarFileIdProvided = true;
        }
    }
    
    [JsonIgnore] public bool AvatarFileIdProvided { get; private set; }
    
    [JsonExtensionData] public Dictionary<string, JsonElement>? AdditionalFields { get; init; }
}
