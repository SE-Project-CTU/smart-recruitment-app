using System.Text.Json;
using System.Text.Json.Serialization;

namespace SmartHire.Api.Contracts.Requests;

public sealed class UpdateCurrentAccountRequest {
    private string? _fullName;
    private string? _phone;
    private Guid? _avatarFileId;
    
    public string? FullName {
        get => _fullName;
        init {
            _fullName = value;
            FullNameProvided = true;
        }
    }
    
    [JsonIgnore] public bool FullNameProvided { get; private set; }
    
    public string? Phone {
        get => _phone;
        init {
            _phone = value;
            PhoneProvided = true;
        }
    }
    
    [JsonIgnore] public bool PhoneProvided { get; private set; }
    
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
